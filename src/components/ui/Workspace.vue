<template>
  <div id="vue-workspace" :data-change="changes.time">

    <!-- child component -->

    <tool-bar :process="processModel" :isSaved="isSaved" :containerScale="containerScale" v-on:applyZoom="applyZoom" v-on:exchange="exchange" v-on:process="onToolbarShowProcess" v-on:changeProcess="onChangeProcess"></tool-bar>

    <dialog-process ref="dialog-process" v-on:closeDialog="onCloseProcessDialog"></dialog-process>
    <dialog-delegate-select ref="dialog-delegate-select" v-on:delegateSelect="onDelegateSelect"></dialog-delegate-select>
    <dialog-process-select ref="dialog-process-select" v-on:processSelect="onProcessSelect"></dialog-process-select>

    <div class="processContainer" @touchmove.passive="trackTouchPosition" @mousemove.passive="throttle(trackMousePosition, $event, 50)">
      <!-- child components -->
      <timeline ref="timeline"
        v-on:openProcess="onProcessOpen"
        v-on:changeProcess="onChangeProcess"
        :processModel="processModel"
        :timeFormat="timeFormat"
        :itemSize="itemSize"
        :containerSize="containerSize"
        :containerScale="containerScale"
        :containerTranslation="containerTranslation"
        :containerOffset="containerOffset"
        :actionPosition="actionPosition"
        :mousePosition="mousePosition"
        ></timeline>
    </div>

    <vue-slider class="range-itemSize ignore-container-events" :value="itemSize" :width="100" :min="1" :max="100" @callback="onRangeChange" :processStyle="{ backgroundColor: '#3f51b5' }" :tooltipStyle="{ backgroundColor: '#3f51b5', borderColor: '#3f51b5' }"></vue-slider>
    <time-chooser :timeFormat="timeFormat" v-on:onTimeFormatChange="applyTimeFormat"></time-chooser>
    <item-chooser v-on:onProcessCreate="processCreate" v-on:delegateChange="applyDelegateChange"></item-chooser>

    <canvas class='minimap'></canvas>
  </div>
</template>

<script>
// Child components
import ToolBar from './ToolBar.vue'
import ItemChooser from './ItemChooser.vue'
import TimeChooser from './TimeChooser.vue'

import Timeline from './Timeline.vue'

import DialogProcess from './dialog/DialogProcess.vue'
import DialogSelectDelegate from './dialog/DialogSelectDelegate.vue'
import DialogSelectProcess from './dialog/DialogSelectProcess.vue'

import interact from 'interactjs'

import { Events } from '@/classes/utils/Events'
import { Calc } from '@/classes/utils/Calc'
import { Helper } from '@/classes/utils/Helper'

import { Process } from '@/classes/model/Process'
import { Stakeholder } from '@/classes/model/Stakeholder'
import { Metadata } from '@/classes/model/Metadata'

import VueSlider from 'vue-slider-component'

export default {
  name: 'Workspace',
  components: {
    'vue-slider': VueSlider,
    'tool-bar': ToolBar,
    'item-chooser': ItemChooser,
    'time-chooser': TimeChooser,
    'timeline': Timeline,
    'dialog-process': DialogProcess,
    'dialog-delegate-select': DialogSelectDelegate,
    'dialog-process-select': DialogSelectProcess
  },
  props: [ 'processModel', 'isSaved', 'changes' ],

  data: function () {
    return {

      workspaceNode: null,
      containerNode: null,
      containerSize: { x: Calc.minContainerWidth, y: Calc.minContainerHeight },

      containerOffset: null,
      containerTranslation: { x: 0, y: 0 },
      containerScale: { x: 1.0, y: 1.0 },

      timeFormat: 'days',
      itemSize: 60,

      actionPosition: { x: 0, y: 0 },
      mousePosition: {x: 0, y: 0},

      time: Date.now(),
      minimap: null,

      // Options
      options: {
        isContainerDraggable: true,
        isContainerResizeable: true
      }
    }
  },

  created: function () {
    console.warn('Workspace created')

    window.addEventListener('scroll', this.onScroll, true)
    window.addEventListener('resize', this.onResize, true)

    this.calculateContainerSpace()
    // set axis params
    Calc.itemSize = this.itemSize
  },

  destroyed: function () {
    console.log('destroyed')

    window.removeEventListener('scroll', this.onScroll)
    window.removeEventListener('resize', this.onResize)
  },

  mounted: function () {
    console.log('Workspace mounted')

    // cache DOM
    this.htmlNode = document.querySelector('html')
    this.workspaceNode = document.querySelector('#vue-workspace')
    this.containerNode = this.workspaceNode.querySelector('.processContainer')
    this.minimapNode = this.workspaceNode.querySelector('.minimap')

    // prepare Container and Workspace
    this.calculateModel()
    this.initContainerSize() // apply model - forces reflow
    this.onResize()

    // remove existing event handlers
    interact('.processContainer').unset()

    // add new event handlers
    interact('.processContainer')
      .draggable({})
      .ignoreFrom('.ignore-container-events')
      .on('dragstart', event => {
        console.warn('dragstart container')
        this.actionPosition = { x: event.pageX, y: event.pageY }
      })
      .on('dragmove', event => {
        console.log('dragmove')
        this.onContainerDrag(event)
      })
      .on('dragend', event => {
        console.warn('dragend container')
        this.updateTimeAxis() // forces reflow
      })
      .resizable({
        preserveAspectRatio: false,
        edges: { left: true, right: true, bottom: true, top: true }
      })
      .ignoreFrom('.ignore-container-events')
      .on('resizestart', event => {
        console.log('resizestart')
        this.actionPosition = { x: event.pageX, y: event.pageY }
      })
      .on('resizemove', event => {
        console.log('resizemove')
        this.onContainerResize(event)
      })
      .on('resizeend', event => {
        console.log('resizeend')
        let dragDelta = { x: event.pageX - this.actionPosition.x, y: event.pageY - this.actionPosition.y }
        let scaledDragDelta = { x: Math.floor(dragDelta.x / this.containerScale.x), y: Math.floor(dragDelta.y / this.containerScale.y) }
        this.updateContainerSize(scaledDragDelta) // forces reflow
        this.redraw()
      })

    // init minimap
    this.initMinimap()
  },

  beforeUpdate: function () {
    console.warn('Workspace updating ...')
    this.calculateModel()
    let delta = this.calculateContainerSize()
    this.updateContainerSize(delta)
  },

  updated: function () {
    console.warn('Workspace updated')
    this.redraw()
  },

  methods: {

    redraw () {
      if (!this.$refs.timeline) return

      this.$refs['timeline'].redraw()

      if (!this.minimap) return

      setTimeout(() => { // wait for timeline to be drawn
        this.minimap.redraw()
      }, 500)
    },

    calculateModel () {
      Calc.processPosition(this.processModel.children, this.processModel.mDelegates, this.containerSize, this.timeFormat)
    },

    calculateContainerSpace () {
      Calc.minContainerHeight = window.innerHeight - 200
      Calc.minContainerWidth = window.innerWidth - 400
    },

    calculateContainerSize (force) {
      let size = Calc.containerSize(this.processModel.children, this.processModel.mDelegates, true) // calc layout based on model

      // diff between actual containerSize and Calculation
      let delta = { x: size.x - this.containerSize.x, y: size.y - this.containerSize.y }

      // increase containerSize when more space is needed (e.g. process added)
      if (force === true) return delta

      delta.x = delta.x < 0 ? 0 : delta.x
      delta.y = delta.y < 0 ? 0 : delta.y

      return delta
    },

    trackMousePosition (event) {
      // console.log('trackMousePosition')

      this.mousePosition.x = Math.round((event.pageX - this.containerTranslation.x - this.containerOffset.left) / this.containerScale.x)
      this.mousePosition.y = Math.round((event.pageY - this.containerTranslation.y - this.containerOffset.top) / this.containerScale.y)
      if (this.$refs.timeline) this.$refs['timeline'].trackMousePosition(event)
    },

    trackTouchPosition (event) {
      // console.log('trackTouchPosition')

      let touch = event.touches[0]

      this.mousePosition.x = Math.round((touch.pageX - this.containerTranslation.x - this.containerOffset.left) / this.containerScale.x)
      this.mousePosition.y = Math.round((touch.pageY - this.containerTranslation.y - this.containerOffset.top) / this.containerScale.y)
      // console.log(this.mousePosition.x + ':' + this.mousePosition.y)
      if (this.$refs.timeline) this.$refs['timeline'].trackMousePosition(event)
    },

    throttle (fn, fnEvent, wait) {
      this.time = Events.throttle(fn, fnEvent, wait, this.time)
    },

    initContainerSize () {
      this.containerNode.style.width = this.containerSize.x + 'px' // forces reflow
      this.containerNode.style.height = this.containerSize.y + 'px' // forces reflow
      this.containerOffset = Calc.absolutePosition(this.containerNode, this.containerTranslation) // forces reflow
    },

    updateContainerSize (dragDelta) {
      let delta = typeof dragDelta === 'object' ? dragDelta : { x: 0, y: 0 }

      if (delta.x === 0 && delta.y === 0) return

      this.containerSize.x = this.containerSize.x + delta.x
      this.containerSize.y = this.containerSize.y + delta.y

      this.initContainerSize()
    },

    updateTimeAxis () {
      if (this.$refs.timeline) this.$refs['timeline'].updateTimeAxis()
    },

    applyTransform () {
      console.log('applyTransform')

      let transformTranslate = 'translate(' + this.containerTranslation.x + 'px, ' + this.containerTranslation.y + 'px)'
      let transformScale = 'scale(' + this.containerScale.x + ',' + this.containerScale.y + ')'
      this.containerNode.style.webkitTransform =
      this.containerNode.style.transform = transformTranslate + ' ' + transformScale
      this.minimap.redraw()
    },

    translate (dx, dy) {
      this.containerTranslation.x = this.containerTranslation.x + dx
      this.containerTranslation.y = this.containerTranslation.y + dy
    },

    scale (multX, multY) {
      if (multX === 0 || multY === 0) {
        console.warn('scalefactor 0 not allowed')
        return
      }

      this.containerScale.x = this.containerScale.x * multX
      this.containerScale.y = this.containerScale.y * multY
    },

    onDelegateSelect (data) {
      if (!data.hasOwnProperty('response') || !data.hasOwnProperty('initiator')) {
        console.warn('onDelegateSelect - expected response and initiator in data object')
        return
      }

      if (data.response !== 'add') {
        return
      }

      this.processModel.addStakeholder(data.initiator)
      this.processModel.addDelegate(data.initiator.id)
    },

    // Listener for horizontal-bar emits
    applyDelegateChange (data) {
      switch (data) {
        case 'add':
          this.$refs['dialog-delegate-select'].open()
          return
        default:
          console.warn('data has unexpected information')
      }
    },

    // Listener for tool-bar emits
    applyZoom (scaleData) {
      this.containerScale.x = scaleData.x
      this.containerScale.y = scaleData.y
      this.applyTransform()
      this.updateTimeAxis()
    },

    exchange (data) {
      switch (data) {
        case 'list':
          this.$emit('list')
          return
        case 'save':
          this.$emit('save')
          return
        case 'download':
          this.$emit('download')
          return
        case 'remove':
          this.$emit('remove')
          return
        default:
          console.warn('data has unexpected information')
      }
    },

    // Listener for time-chooser emits
    applyTimeFormat (format) {
      this.timeFormat = format
      console.log('Workspace: timeFormat updated to: ' + this.timeFormat)
      window.scrollTo(0, 0)
      this.onResize()
    },

    processCreate () {
      console.log('processCreate')
      let isSingleChild = this.processModel.children.length === 0 // true if no children are around
      let start
      let initiator

      if (isSingleChild) {
        start = Calc.roundDate(new Date(), this.timeFormat)
        start = Calc.incrementDate(start, this.timeFormat)
        initiator = this.processModel.mDelegates[0] // use first delegate
      } else {
        let lastProcess = Calc.getEndProcess(this.processModel.children) // process at the bottom
        start = Calc.roundDate(lastProcess.mEnd, this.timeFormat)
        start = Calc.incrementDate(start, this.timeFormat)
        initiator = lastProcess.initiator // use initator of lastProcess
      }

      let process = new Process('', initiator, start, null)
      let delegates = Metadata.getStakeholder().filter(st => this.processModel.mDelegates.indexOf(st.id) > -1)
      this.$refs['dialog-process-select'].open(process, delegates)
    },

    onProcessSelect (data) {
      if (!data.hasOwnProperty('response') || !data.hasOwnProperty('process')) {
        console.warn('onProcessSelect - expected response and process in data object')
        return
      }

      if (data.response !== 'add') return

      let process = data.process

      if (this.processModel.mDelegates.length === 0) {
        let stakeholder = new Stakeholder()

        this.processModel.addStakeholder(stakeholder)
        this.processModel.addDelegate(stakeholder.id)
        process.mInitiator = this.processModel.mDelegates[0]
      }

      this.processModel.addChild(process)
    },

    removeProcess (processId) {
      // remove head
      if (this.processModel.id === processId) {
        this.$emit('removeHead')
        return
      }

      // remove child
      let process = this.processModel.getChild(processId)

      if (process instanceof Process === false) {
        console.warn('Workspace.removeProcess() - Process cannot be removed')
        return
      }

      this.processModel.removeChild(processId)
    },

    onCloseProcessDialog (data) {
      console.log('onCloseProcessDialog called', data)

      switch (data.response) {
        case 'update':
          break
        case 'remove':
          this.removeProcess(data.id)
          break
        case 'changeProcess':
          this.$emit('changeProcess', data.id)
          break
      }

      if (data.id !== this.processModel.id) this.$refs['timeline'].stateEvent('onCloseDialog')
    },

    onChangeProcess (id) {
      console.log('onChangeProcess called')

      this.$emit('changeProcess', id)
    },

    onToolbarShowProcess () {
      console.warn('onToolbarShowProcess')

      this.onProcessOpen()
    },

    resizeContainer (event) {
      let elem = event.target

      // read from model
      let elemX = (parseFloat(elem.getAttribute('data-x')) || 0)
      let elemY = (parseFloat(elem.getAttribute('data-y')) || 0)

      // update model
      // translate when resizing from top or left cons
      elemX += event.deltaRect.left
      elemY += event.deltaRect.top

      // store position
      elem.setAttribute('data-x', elemX)
      elem.setAttribute('data-y', elemY)

      // update view
      let displayValue = elem.style.display
      elem.style.display = 'none' // avoid reflows by multiple style changes

      // update the element's style
      elem.style.width = Math.round(event.rect.width / this.containerScale.x) + 'px'
      elem.style.height = Math.round(event.rect.height / this.containerScale.y) + 'px'

      elem.style.display = displayValue

      // translate when resizing from top or left cons
      elem.style.webkitTransform = elem.style.transform = 'translate(' + elem + 'px,' + elem + 'px)'
    },

    onRangeChange (event) {
      console.log('onRangeChange')
      this.itemSize = Helper.parse(event)
      Calc.itemSize = this.itemSize
      this.onResize()
    },

    onProcessOpen (event) {
      if (!event || typeof event === 'undefined') {
        // open parent
        this.$refs['dialog-process'].open(this.processModel, 'update', false, 0)
      } else {
        // open child
        let child = this.processModel.getChild(event.id)
        let tab = event.hasOwnProperty('tab') ? event.tab : 0
        this.$refs['dialog-process'].open(child, 'update', true, tab, this.processModel)
      }
    },

    onContainerDrag (event) {
      console.log('onContainerDrag')

      if (this.options.isContainerDraggable === false) return

      // update position in model
      this.translate(event.dx, event.dy)

      // update view by model
      let containerPan = () => {
        this.applyTransform()
        Events.scheduledAnimationFrame['containerPan'] = false
      }
      Events.debounce(containerPan, 'containerPan')
    },

    onContainerResize (event) {
      console.log('onContainerResize')

      if (this.options.isContainerResizeable === false) return

      // update position in model
      this.resizeContainer(event)

      // update view by model
      let containerResize = () => {
        this.applyTransform()
        Events.scheduledAnimationFrame['containerResize'] = false
      }
      Events.debounce(containerResize, 'containerResize')
    },

    onScroll (event) {
      // remove listener
      window.removeEventListener('scroll', this.onScroll, true)

      setTimeout(() => {
        // action
        this.updateTimeAxis() // forces reflow

        // re-add listener
        window.addEventListener('scroll', this.onScroll, true)
      }, 400)
    },

    onResize (event) {
      console.log('onResize')

      let recalculateFn = () => {
        this.calculateContainerSpace()
        let delta = this.calculateContainerSize(true)
        this.updateContainerSize(delta)
        this.redraw()
        Events.scheduledAnimationFrame['recalculateFn'] = false
      }
      Events.debounce(recalculateFn, 'recalculateFn')
    },

    initMinimap () {
      const pagemap = require('pagemap/src/pagemap.js')
      let minimapRect = this.minimapNode.getBoundingClientRect()
      this.minimapNode.style.height = minimapRect.height - minimapRect.top + 'px'

      this.minimap = pagemap(this.minimapNode, {
        styles: {
          '.process-content': 'rgba(142, 142, 142, 1)'
        },
        back: 'rgba(0,0,0,0.02)',
        view: 'rgba(233, 30, 99, 0.2)',
        drag: 'rgba(233, 30, 99, 0.5)',
        interval: null
      })
    }
  }
}
</script>

<style lang="scss" scoped>

$primaryColor: #3f51b5;
$secondayColor: #29e;
$accepntColor: #e91e63;
$bgColor: #eee;

@media print {

  .processContainer {
    top: 0 !important;
  }

  .processContainer >>> .process {
    -webkit-print-color-adjust: exact;
  }

  .tool-bar {
    display: none
  }
}

#vue-workspace {
  position: absolute;
  height: 100vh;
  width: 100vw;
}

.tool-bar {
  position: fixed;
  width: 100%;
  z-index: 9;
  height: 48px;
}

.processContainer {
  position: relative;
  display: flex;
  top: 140px;
  left: 200px;
  border: 1px solid #ccc;
  transform-origin: 0 0;
  background-color:rgba(255, 255, 255, 0.8);
  box-shadow: 0 1px 5px rgba(0,0,0,.2), 0 2px 2px rgba(0,0,0,.14), 0 3px 1px -2px rgba(0,0,0,.12);
  touch-action: none;
}

.range-itemSize {
  position: fixed;
  height: 100px;
  width: 100px;
  left: 24px;
  top: 100px;
}

.minimap {
    position: fixed;
    top: 40px;
    right: 0;
    width: 110px !important;
    height: 100%;
    z-index: 8;
    background: rgba(104, 102, 117, 0.199)
}
</style>
