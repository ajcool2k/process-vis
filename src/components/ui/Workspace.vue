<template>
  <div id="vue-workspace" :data-change="changes.time">

    <!-- child component -->

    <tool-bar :process="processModel" :isSaved="isSaved" :containerScale="containerScale" v-on:applyZoom="applyZoom" v-on:exchange="exchange" v-on:process="onToolbarShowProcess" v-on:changeProcess="onChangeProcess"></tool-bar>



      <md-dialog-confirm
        :md-title="dialog.removeConnectionDialog.title"
        :md-content-html="dialog.removeConnectionDialog.contentHtml"
        :md-ok-text="dialog.removeConnectionDialog.ok"
        :md-cancel-text="dialog.removeConnectionDialog.cancel"
        @close="onCloseRemoveConnectionDialog"
        ref="removeConnectionDialog">
      </md-dialog-confirm>

      <dialog-process ref="dialog-process" v-on:closeDialog="onCloseProcessDialog"></dialog-process>
      <dialog-delegate-select ref="dialog-delegate-select" v-on:delegateSelect="onDelegateSelect"></dialog-delegate-select>

      <div class="processContainer" @click="onContainerClick" @touchmove.passive="trackTouchPosition" @mousemove.passive="throttle(trackMousePosition, $event, 50)">
      <!-- child components -->
        <axis-x class="ignore-container-events" :process="processModel" :scale="containerScale" v-on:closeDialog="onCloseDelegateDialog"></axis-x>
        <vue-slider class="range-itemSize ignore-container-events" :value="itemSize" :width="100" :min="1" :max="100" @callback="onRangeChange" :processStyle="{ backgroundColor: '#3f51b5' }" :tooltipStyle="{ backgroundColor: '#3f51b5', borderColor: '#3f51b5' }"></vue-slider>
        <axis-y class="ignore-container-events" :delegates="processModel.mDelegates" :processes="processModel.children" :timeFormat="timeFormat" :itemSize="itemSize" :scale="containerScale" :containerSize="containerSize"></axis-y>

        <template v-for="(item, index) in processModel.mDelegates">
          <div :key="item" :class="'delegate delegate' + index" :data-id="item" :style="'width: ' + ( containerSize.x / processModel.mDelegates.length ) + 'px'"></div>
        </template>

        <svg class="svgNode">
          <defs>
            <marker id="marker-triangle"
              viewBox="0 0 10 10" refX="0" refY="5"
              markerUnits="strokeWidth"
              markerWidth="5" markerHeight="5"
              orient="auto">
              <path d="M 0 0 L 10 5 L 0 10 z" />
            </marker>

            <pattern id="pattern"
              width="10" height="10"
              patternUnits="userSpaceOnUse"
              patternTransform="rotate(45 50 50)">
              <rect width="10" height="10" fill="#606dbc" />
              <line stroke="#3f51b5" stroke-width="8px" y2="10"/>
            </pattern>

            <marker id="marker-circle" markerWidth="10" markerHeight="10" refX="5" refY="5" orient="auto">
              <circle cx="5" cy="5" r="2" fill="dodgerblue"/>
            </marker>

            <image id="icon-people" width="18" height="18" xlink:href="../../assets/people.svg" />

          </defs>

          <!-- draw Processes -->
          <template v-if="item._width" v-for="item in processModel.children">
            <g :key="item.id + '-process'" class="process draggable drag-drop" :data-id="item.id" @click.stop="onProcessClick">
              <rect :class="'process-content has-child-' + (item.children.length > 0)" :data-id="item.id" :height="item._height" :width="item._width">
                <title>Name: {{ item.name }} ({{ item.id }})</title>
              </rect>
              <circle class="process-anchor" :data-id="item.id" @click.stop="onCircleClick" :r="Math.min(item._height, 10)" :cy="Math.max(item._height - 15, 0)" :cx="(item._width / 2 )"></circle>
              <text class="process-text" :data-id="item.id" :x="(item._width / 2)" :y="getIconPosition(item._height, 60)">{{ shortName(item.name) }}</text>

              <g :data-process="item.id">
                <rect class="proces-transform" :data-id="item.id" :x="(item._width - 20)" y="1" :height="getIconPosition(item._height, 30)" width="20" @click.stop="onTransformationClick">
                  <title>Prozess-Transformation: {{item.transformation.mName}}</title>
                </rect>
                <text class="process-transform-text" :x="(item._width - 11)" y="20">{{item.transformation.mType}}</text>
              </g>

              <g :data-process="item.id" v-if="item.participation !== 'closed'">
                <rect class="process-participation" :data-id="item.id" :x="(item._width - 20)" :y="getIconPosition(item._height, 30)"  :height="getIconPosition(item._height, 29)" width="20" @click.stop="onParticipationClick">
                  <title>Beteiligungsmöglichkeit: {{item.participation}}</title>
                </rect>
                <use class="process-participation-icon" :x="(item._width - 20)" :y="getIconPosition(item._height, 30)" xlink:href="#icon-people" />
              </g>

            </g>
          </template>

          <!-- draw Connections -->
          <template v-for="item in processModel.children">
            <template v-for="con in item._connections">
              <g :key="con.id + '-connection'" class="connection" :data-id="con.id">
                <path class="connection-outline" :data-id="con.id" d="" @click.stop="onConnectionClick" />
                <path class="connection-line" :data-id="con.id" d="" />
              </g>
             </template>
          </template>

          <g class="connection tmp">
            <path class="tmpConnection" d="" />
          </g>

          <line class="timeRuler" />
        </svg>
      </div>

    <time-chooser :timeFormat="timeFormat" v-on:onTimeFormatChange="applyTimeFormat"></time-chooser>
    <item-chooser v-on:onProcessCreate="processCreate" v-on:delegateChange="applyDelegateChange"></item-chooser>

  </div>
</template>

<script>
// Child components
import ToolBar from './ToolBar.vue'
import ItemChooser from './ItemChooser.vue'
import TimeChooser from './TimeChooser.vue'
import AxisX from './AxisX.vue'
import AxisY from './AxisY.vue'

import DialogProcess from './dialog/DialogProcess.vue'
import DialogSelectDelegate from './dialog/DialogSelectDelegate.vue'

import interact from 'interactjs'

import { Dialog } from '@/classes/ui/Dialog'
import { Path } from '@/classes/ui/Path'
import { StateMachine } from '@/classes/utils/StateMachine'
import { Animate } from '@/classes/utils/Animate'
import { Events } from '@/classes/utils/Events'
import { Calc } from '@/classes/utils/Calc'
import { Helper } from '@/classes/utils/Helper'

import { Process } from '@/classes/model/Process'

import VueSlider from 'vue-slider-component'

export default {
  name: 'Workspace',
  components: {
    'vue-slider': VueSlider,
    'tool-bar': ToolBar,
    'item-chooser': ItemChooser,
    'time-chooser': TimeChooser,
    'axis-x': AxisX,
    'axis-y': AxisY,
    'dialog-process': DialogProcess,
    'dialog-delegate-select': DialogSelectDelegate
  },
  props: [ 'processModel', 'isSaved', 'changes' ],

  data: function () {
    return {
      fsm: null, // finite state machine
      workspaceNode: null,
      containerNode: null,
      containerSize: { x: Calc.minContainerWidth, y: Calc.minContainerHeight },
      yAxisNode: null,
      xAxisNode: null,
      scopeProp: '',

      containerOffset: null,
      containerTranslation: { x: 0, y: 0 },
      containerScale: { x: 1.0, y: 1.0 },

      svgNode: null,

      timeFormat: 'days',
      itemSize: 60,
      timeRuler: null,
      tmpLine: null,

      actions: {
        drawingMode: false
      },

      actionPosition: { x: 0, y: 0 },
      mousePosition: {x: 0, y: 0},
      actionId: null,
      time: Date.now(),
      fireCounter: 0,

      clickCounts: {
        process: 0
      },

      // Options
      options: {
        isContainerDraggable: true,
        isContainerResizeable: true
      },

      // Dialogs
      dialog: new Dialog(),

      // Support
      hasTouchSupport: false,

      // Interval
      zoomInt: 0
    }
  },

  created: function () {
    console.warn('Workspace created')

    this.initStateMachine()

    window.addEventListener('scroll', this.onScroll, true)
    window.addEventListener('resize', this.onResize, true)

    // detect escape
    Events.escapeDetection(this.onEscape)

    // detect resolution
    Calc.minContainerHeight = window.innerHeight - 200
    Calc.minContainerWidth = window.innerWidth - 400

    // set axis params
    Calc.itemSize = this.itemSize
  },

  destroyed: function () {
    console.log('destroyed')
    window.removeEventListener('scroll', this.onScroll)
    window.removeEventListener('resize', this.onResize)
  },

  mounted: function () {
    console.log('Workspace mounted', document.querySelectorAll('.process').length)

    // cache DOM
    this.htmlNode = document.querySelector('html')
    this.workspaceNode = document.querySelector('#vue-workspace')
    this.containerNode = this.workspaceNode.querySelector('.processContainer')
    this.svgNode = this.containerNode.querySelector('svg.svgNode')
    this.tmpLine = this.svgNode.querySelector('.tmpConnection')
    this.timeRuler = this.svgNode.querySelector('.timeRuler')

    this.xAxisNode = this.workspaceNode.querySelector('.axis-x')
    this.yAxisNode = this.workspaceNode.querySelector('.axis-y')

    // Scope Prop
    this.scopeProp = Helper.getScopeProp(this.svgNode)

    // prepare Container and Workspace
    Calc.processPosition(this.processModel.children, this.processModel.mDelegates, this.containerSize, this.timeFormat) // set position on the model
    this.containerSize = Calc.containerSize(this.processModel.children, this.processModel.mDelegates) // calc layout based on model
    this.updateContainerSize() // apply model - forces reflow

    // remove existing event handlers
    interact('.processContainer').unset()
    interact('.delegate').unset()
    interact('.process rect.process-content').unset()

    // add new event handlers
    interact('.processContainer')
      .draggable({})
      .ignoreFrom('.ignore-container-events')
      .on('dragstart', event => {
        if (!this.fsm.hasEvent('onContainerDragstart')) return
        this.fsm.run('onContainerDragstart')

        console.warn('dragstart container')
        this.actionPosition = { x: event.pageX, y: event.pageY }
      })
      .on('dragmove', event => {
        if (!this.fsm.hasEvent('onContainerDragmove')) return
        this.fsm.run('onContainerDragmove')

        console.log('dragmove')
        this.onContainerDrag(event)
      })
      .on('dragend', event => {
        if (!this.fsm.hasEvent('onContainerDragend')) return
        this.fsm.run('onContainerDragend')

        console.warn('dragend container')
        this.updateAxisPosition() // forces reflow
      })
      .resizable({
        preserveAspectRatio: false,
        edges: { left: true, right: true, bottom: true, top: true }
      })
      .ignoreFrom('.ignore-container-events')
      .on('resizestart', event => {
        if (!this.fsm.hasEvent('onContainerResizestart')) return
        this.fsm.run('onContainerResizestart')

        console.log('resizestart')
        this.actionPosition = { x: event.pageX, y: event.pageY }
      })
      .on('resizemove', event => {
        if (!this.fsm.hasEvent('onContainerResizemove')) return
        this.fsm.run('onContainerResizemove')

        console.log('resizemove')
        this.onContainerResize(event)
      })
      .on('resizeend', event => {
        if (!this.fsm.hasEvent('onContainerResizeend')) return
        this.fsm.run('onContainerResizeend')

        console.log('resizeend')
        let dragDelta = { x: event.pageX - this.actionPosition.x, y: event.pageY - this.actionPosition.y }
        let scaledDragDelta = { x: Math.floor(dragDelta.x / this.containerScale.x), y: Math.floor(dragDelta.y / this.containerScale.y) }
        this.updateContainerSize(scaledDragDelta) // forces reflow
      })

    interact('.process rect.process-content')
      .draggable({
        snap: {
          targets: [
            // interact.createSnapGrid({ x: 20, y: 20 })
          ],
          range: Infinity,
          relativePoints: [ { x: 0, y: 0 } ]
        },
        inertia: true,
        restrict: {
          restriction: this.containerNode,
          elementRect: { top: 0, left: 0, bottom: 1, right: 1 },
          endOnly: true
        }
      })
      .on('dragstart', event => {
        console.warn('dragstart process')
        if (!this.fsm.hasEvent('onProcessDragstart')) return
        this.fsm.run('onProcessDragstart', event)
      })
      .on('dragmove', event => {
        if (!this.fsm.hasEvent('onProcessDragmove')) return
        this.fsm.run('onProcessDragmove', event)
        console.log('dragmove')
      })
      .on('dragend', event => {
        console.warn('dragend process')
        this.timeRuler.style.display = 'none'
      })
      .resizable({
        preserveAspectRatio: false,
        restrict: { /* restrict options */ },
        edges: { left: false, right: false, bottom: true, top: false },
        restrictSize: {
          min: { height: 60 }
        }
      })
      .on('resizestart', event => {
        console.log('resizestart event', event)
        if (!this.fsm.hasEvent('onProcessResizestart')) return
        this.fsm.run('onProcessResizestart', event)
      })
      .on('resizemove', event => {
        if (!this.fsm.hasEvent('onProcessResizemove')) return
        this.fsm.run('onProcessResizemove', event)
      })
      .on('resizeend', event => {
        if (!this.fsm.hasEvent('onProcessResizeend')) return
        this.fsm.run('onProcessResizeend', event)
      })

    interact('.delegate')
      .dropzone({
        // only accept elements matching this CSS selector
        accept: '.process rect.process-content',
        // Require a 75% element overlap for a drop to be possible
        overlap: 0.75,

        // listen for drop related events:

        ondropactivate: function (event) {
          // add active dropzone feedback
          event.target.classList.add('drop-active')
        },
        ondragenter: function (event) {
          var draggableElement = event.relatedTarget
          var dropzoneElement = event.target

          // feedback the possibility of a drop
          dropzoneElement.classList.add('pariticipant-drop')
          draggableElement.classList.add('process-drop')
          // draggableElement.textContent = 'Dragged in';
        },
        ondragleave: function (event) {
          // remove the drop feedback style
          event.target.classList.remove('pariticipant-drop')
          event.relatedTarget.classList.remove('process-drop')
          // event.relatedTarget.textContent = 'Dragged out';
        },
        ondrop: event => {
          if (!this.fsm.hasEvent('onProcessDragend')) return
          this.fsm.run('onProcessDragend', event)
          event.relatedTarget.classList.remove('process-drop')
        },
        ondropdeactivate: function (event) {
          // remove active dropzone feedback
          event.target.classList.remove('drop-active')
          event.target.classList.remove('pariticipant-drop')
        }
      })
  },

  beforeUpdate: function () {
    console.warn('Workspace updating ...', this.svgNode.querySelectorAll('.process').length)
    Calc.processPosition(this.processModel.children, this.processModel.mDelegates, this.containerSize, this.timeFormat)
    let size = Calc.containerSize(this.processModel.children, this.processModel.mDelegates, true) // calc layout based on model

    // diff between actual containerSize and Calculation
    let delta = { x: size.x - this.containerSize.x, y: size.y - this.containerSize.y }

    // increase containerSize when more space is needed (e.g. process added)
    delta.x = delta.x < 0 ? 0 : delta.x
    delta.y = delta.y < 0 ? 0 : delta.y

    if (delta.x !== 0 || delta.y !== 0) {
      this.updateContainerSize(delta)
    }
  },

  updated: function () {
    console.warn('Workspace updated', this.svgNode.querySelectorAll('.process').length)
    Animate.clear()
    this.redraw()
  },

  methods: {

    initStateMachine () {
      this.fsm = new StateMachine()

      let idle = this.fsm.addState('idle')

      // Workspace
      let resizeWorkspace = this.fsm.addState('resizeWorkspace')
      let dragWorkspace = this.fsm.addState('dragWorkspace')

      // Processs
      let dragProcess = this.fsm.addState('dragProcess')
      let resizeProcess = this.fsm.addState('resizeProcess')
      let changeProcess = this.fsm.addState('changeProcess')
      let connectionMode = this.fsm.addState('connectionMode')

      // Dialogs
      let showDialog = this.fsm.addState('showDialog')

      this.fsm.addEvent(idle, connectionMode, {
        name: 'onCircleClick',
        action: (event) => {}
      })

      this.fsm.addEvent(connectionMode, idle, {
        name: ['onContainerClick', 'onEscape'],
        action: (event) => {
          this.actions.drawingMode = false
          this.tmpLine.removeAttribute('d')
          this.svgNode.classList.remove('tmpConnection-active')

          // reset anchor
          let anchor = this.svgNode.querySelector('circle[data-id="' + this.tmpLine.getAttribute('data-id') + '"]')
          anchor.classList.remove('active')
        }
      })

      this.fsm.addEvent(connectionMode, idle, {
        name: 'onProcessClick',
        action: (event) => {
          let source = this.tmpLine
          let sourceId = source.getAttribute('data-id')
          let target = event.target
          let targetId = target.getAttribute('data-id')

          // add to model
          this.addConnection(sourceId, targetId)
          this.actions.drawingMode = false
          this.tmpLine.removeAttribute('d')
          this.svgNode.classList.remove('tmpConnection-active')

          // reset anchor
          let anchor = this.svgNode.querySelector('circle[data-id="' + sourceId + '"]')
          anchor.classList.remove('active')
        }
      })

      // Workspace
      this.fsm.addEvent(idle, resizeWorkspace, {
        name: 'onContainerResizestart',
        action: (event) => {}
      })

      this.fsm.addEvent(resizeWorkspace, resizeWorkspace, {
        name: 'onContainerResizemove',
        action: (event) => {}
      })

      this.fsm.addEvent(resizeWorkspace, idle, {
        name: 'onContainerResizeend',
        action: (event) => {}
      })

      this.fsm.addEvent(idle, dragWorkspace, {
        name: 'onContainerDragstart',
        action: (event) => {}
      })

      this.fsm.addEvent(dragWorkspace, dragWorkspace, {
        name: 'onContainerDragmove',
        action: (event) => {}
      })

      this.fsm.addEvent(dragWorkspace, idle, {
        name: 'onContainerDragend',
        action: (event) => {}
      })

      // Process
      this.fsm.addEvent(idle, resizeProcess, {
        name: 'onProcessResizestart',
        action: (event) => {
          this.timeRuler.setAttribute('data-y', this.mousePosition.y)
          this.timeRuler.style.display = 'inline'
        }
      })

      this.fsm.addEvent(resizeProcess, resizeProcess, {
        name: 'onProcessResizemove',
        action: (event) => {
          this.resizeProcess(event)
          let processId = event.target.getAttribute('data-id')

          // show time ruler
          this.drawRuler(event)

          // update connections of the process
          this.redrawConnection(processId)
        }
      })

      this.fsm.addEvent(resizeProcess, idle, {
        name: 'onProcessResizeend',
        action: (event) => {
          Events.disableClicks(300)
          this.timeRuler.style.display = 'none'

          let processId = event.target.getAttribute('data-id')
          let process = this.processModel.children.find(elem => elem.id === Helper.parse(processId))

          // calculate new endDate
          let dy = event.pageY - event.y0
          let resizeDelta = { y: Math.floor(dy / this.containerScale.y) }
          let factor = (process._height + resizeDelta.y) / process._height

          // update end date
          let updateEndDate = Calc.updateEndDate(process, factor, this.timeFormat)
          if (updateEndDate === false) return

          // update height in view
          process._height += resizeDelta.y
          this.$emit('updateProcess', process.id)
        }
      })

      this.fsm.addEvent(idle, dragProcess, {
        name: 'onProcessDragstart',
        action: (event) => {
          let parent = event.target.parentNode
          this.timeRuler.setAttribute('data-y', parent.getAttribute('data-y'))
          this.timeRuler.style.display = 'inline'
        }
      })

      this.fsm.addEvent(dragProcess, dragProcess, {
        name: 'onProcessDragmove',
        action: (event) => {
          let parent = event.target.parentNode
          this.timeRuler.setAttribute('data-y', parent.getAttribute('data-y'))
          this.timeRuler.style.display = 'inline'
          this.onProcessDrag(event)
        }
      })

      this.fsm.addEvent(dragProcess, idle, {
        name: 'onProcessDragend',
        action: (event) => {
          Events.disableClicks(300)

          let draggableElement = event.relatedTarget
          let dropzoneElement = event.target
          console.log(dropzoneElement)

          let data = {
            processId: Helper.parse(draggableElement.getAttribute('data-id')),
            delegateId: Helper.parse(dropzoneElement.getAttribute('data-id'))
          }

          // change start date on y change
          let dy = event.dragEvent.pageY - event.dragEvent.y0
          let diffItemSize = Math.round(dy / this.itemSize)

          if (Math.abs(diffItemSize) > 0) {
            let process = this.processModel.children.find(elem => elem.id === data.processId)
            const hasEndDate = process.hasEndDate()
            switch (this.timeFormat) {
              case 'days':
                process.mStart.setDate(process.mStart.getDate() + diffItemSize)
                if (hasEndDate) process.mEnd.setDate(process.mEnd.getDate() + diffItemSize)
                break
              case 'months':
                process.mStart.setMonth(process.mStart.getMonth() + diffItemSize)
                if (hasEndDate) process.mEnd.setMonth(process.mEnd.getMonth() + diffItemSize)
                break
              case 'hours':
                process.mStart.setHours(process.mStart.getHours() + diffItemSize)
                if (hasEndDate) process.mEnd.setHours(process.mEnd.getHours() + diffItemSize)
                break
            }

            process.mStart = Calc.roundDate(process.mStart, this.timeFormat)
            if (hasEndDate) process.mEnd = Calc.roundDate(process.mEnd, this.timeFormat)

            this.$emit('updateProcess', process.id)
          }

          // move process
          console.log(JSON.stringify(data))
          this.$emit('moveProcess', data)
        }
      })

      this.fsm.addEvent(idle, changeProcess, {
        name: 'onProcessDoubleClick',
        action: (event) => {
          let id = event.target.getAttribute('data-id')
          this.$emit('changeProcess', id)

          setTimeout(() => {
            if (!this.fsm.hasEvent('timeout')) return
            this.fsm.run('timeout')
          }, 200)
        }
      })

      this.fsm.addEvent(changeProcess, idle, {
        name: 'timeout',
        action: (event) => {
        }
      })

      this.fsm.addEvent(idle, showDialog, {
        name: 'onProcessClick',
        action: (event) => {
          if (!event || typeof event === 'undefined') {
            // open parent
            this.$refs['dialog-process'].open(this.processModel, 'update', false)
          } else {
            // open child
            this.actionId = event.target.getAttribute('data-id')
            let child = this.processModel.children.find(elem => elem.id === Helper.parse(this.actionId))
            this.$refs['dialog-process'].open(child, 'update', true)
          }
        }
      })

      this.fsm.addEvent(idle, showDialog, {
        name: [ 'onTransformationClick', 'onParticipationClick', 'onConnectionClick' ],
        action: (event) => {
        }
      })

      this.fsm.addEvent(showDialog, idle, {
        name: 'onCloseProcessDialog',
        action: (event) => {
          console.log('EVENT', event)
          switch (event.response) {
            case 'update':
              this.$emit('updateProcess', event.id)
              break
            case 'remove':
              this.$emit('removeProcess', event.id)
              break
            case 'changeProcess-child':
              this.$emit('changeProcess', event.id)
              break
          }
        }
      })

      this.fsm.addEvent(showDialog, idle, {
        name: [ 'onEscape', 'onCloseDialog' ],
        action: (event) => {}
      })

      this.fsm.start(idle)
    },

    addConnection (sourceId, targetId) {
      console.warn('addConnection')

      // accept strings as well
      sourceId = Helper.parse(sourceId)
      targetId = Helper.parse(targetId)

      // avoid duplicate connections
      let process = this.processModel.children.find(elem => elem.id === sourceId)
      if (process && process.connection.to.indexOf(targetId) !== -1) {
        console.warn('skipped new connection, it is already present')
        return
      }

      // update model
      let con = {
        source: sourceId,
        target: targetId
      }

      this.$emit('addConnection', con)
    },

    removeConnection (conId) {
      console.log('remove Connection: ' + conId)
      this.$emit('removeConnection', conId)
    },

    redraw () {
      console.warn('redraw')

      this.processModel.children.forEach(process => {
        // draw process at correct position
        let domNode = this.redrawProcessPosition(process)
        domNode.querySelector('.process-content').classList.add('animation-morph')

        // draw connection
        let callback = () => {
          this.redrawConnection(process)
        }
        let animationName = '.process[data-id="' + process.id + '"]'
        Animate.afterTransition(domNode, animationName, callback)
        Animate.start(domNode, animationName, 'transform', 'ease-in', 0.2)
      })
    },

    redrawProcessPosition (process) {
      let source = this.containerNode.querySelector('.process[data-id="' + process.id + '"]')

      let storedX = Helper.parse(source.getAttribute('data-x'))
      let storedY = Helper.parse(source.getAttribute('data-y'))

      if (storedX === process._position.x && storedY === process._position.y) {
        console.log('process position not changed - skipping')
        return source
      }

      // store position
      source.setAttribute('data-x', process._position.x)
      source.setAttribute('data-y', process._position.y)

      // transform
      source.setAttribute('transform', 'translate(' + process._position.x + ',' + process._position.y + ')')
      // Bugfix for Firefox (svg elem needs to have attribute and style prop)
      source.style.webkitTransform = source.style.transform = 'translate(' + process._position.x + 'px ,' + process._position.y + 'px)'

      return source
    },

    redrawConnection (process) {
      if (typeof process === 'string') process = this.processModel.children.find(elem => elem.id === Helper.parse(process))

      let conSources = process.connection.from
      let conTargets = process.connection.to

      conSources.forEach(elem => {
        let con = { id: elem + '->' + process.id, source: elem, target: process.id }
        this.updateConnection(con)
      })

      conTargets.forEach(elem => {
        let con = { id: process.id + '->' + elem, source: process.id, target: elem }
        this.updateConnection(con)
      })
    },

    updateConnection (con) {
      // console.log('updateConnection', con)

      let connectionGroup = this.svgNode.querySelector('.connection[data-id="' + con.id + '"]')
      let line = connectionGroup.querySelector('.connection-line[data-id="' + con.id + '"]')
      let outline = connectionGroup.querySelector('.connection-outline[data-id="' + con.id + '"]')

      // ----------------------------------------------
      // source könnte ausgelagert werden, aber nicht performance kritisch
      let source = this.containerNode.querySelector('.process-content[data-id="' + con.source + '"]')
      let target = this.containerNode.querySelector('.process-content[data-id="' + con.target + '"]')

      let sourceRect = Calc.absolutePosition(source, this.containerTranslation) // forces reflow
      let targetRect = Calc.absolutePosition(target, this.containerTranslation) // forces reflow
      // ----------------------------------------------

      // hide connection when not enough connected elements are getting to small
      if (sourceRect.height < 10 && targetRect.height < 10) {
        line.setAttribute('d', '')
        outline.setAttribute('d', '')
        return
      }

      let markerOffset = 2
      let anchorOffset = 20

      let sourcePoint = {
        x: Math.round((-this.containerOffset.left + sourceRect.left + sourceRect.width / 2) / this.containerScale.x),
        y: Math.round((-this.containerOffset.top + sourceRect.bottom) / this.containerScale.y)
      }

      let targetPoint = {
        x: Math.round((-this.containerOffset.left + targetRect.left + targetRect.width / 2) / this.containerScale.x),
        y: Math.round((-this.containerOffset.top - markerOffset + targetRect.top) / this.containerScale.y)
      }

      let offset = 0

      if (sourcePoint.x === targetPoint.x) anchorOffset = 0

      let sourceAnchor = {
        x: sourcePoint.x,
        y: sourcePoint.y + Math.max(Math.floor((targetPoint.y - sourcePoint.y) / 2), anchorOffset)
      }

      let targetAnchor = {
        x: targetPoint.x,
        y: targetPoint.y - Math.max(Math.ceil((targetPoint.y - sourcePoint.y) / 2), anchorOffset) + offset
      }

      let middlePoint1 = {
        x: sourcePoint.x + (Math.floor((targetPoint.x - sourcePoint.x) / 2) + offset),
        y: sourceAnchor.y
      }

      let middlePoint2 = {
        x: targetPoint.x - (Math.ceil((targetPoint.x - sourcePoint.x) / 2) - offset),
        y: targetAnchor.y
      }

      let svgPath = Path.createPolyline([sourcePoint, sourceAnchor, middlePoint1, middlePoint2, targetAnchor, targetPoint])
      // let svgPath = Path.createQuadratics([sourcePoint, sourceAnchor, middlePoint1, targetPoint])

      line.setAttribute('d', svgPath)
      outline.setAttribute('d', svgPath)
    },

    onCircleClick (event) {
      if (!this.fsm.hasEvent('onCircleClick')) return
      this.fsm.run('onCircleClick')

      event.preventDefault()

      console.log('onCircleClick:', event.type)

      let source = event.target
      let sourceRect = Calc.absolutePosition(source, this.containerTranslation) // forces reflow

      let sourcePoint = {
        x: Math.round((sourceRect.left + (sourceRect.width / 2) - this.containerOffset.left) / this.containerScale.x),
        y: Math.round((sourceRect.top + (sourceRect.height / 2) - this.containerOffset.top) / this.containerScale.y)
      }

      this.actionPosition = sourcePoint
      let processId = event.target.getAttribute('data-id')
      this.tmpLine.setAttribute('data-id', processId)
      this.svgNode.classList.add('tmpConnection-active')

      // set anchor to active class
      let anchor = this.svgNode.querySelector('circle[data-id="' + processId + '"]')
      anchor.classList.add('active')
      this.actions.drawingMode = true
    },

    getIconPosition (processHeight, maxHeight) {
      let h = processHeight / 2

      if (typeof maxHeight === 'undefined') return h

      return h > maxHeight ? maxHeight : h
    },

    trackMousePosition (event) {
      // console.log('trackMousePosition')

      this.mousePosition.x = Math.round((event.pageX - this.containerTranslation.x - this.containerOffset.left) / this.containerScale.x)
      this.mousePosition.y = Math.round((event.pageY - this.containerTranslation.y - this.containerOffset.top) / this.containerScale.y)
      // console.log(this.mousePosition.x + ':' + this.mousePosition.y)

      if (this.actions.drawingMode === true) {
        Events.debounce(this.drawLine, 'drawLine')
      }
    },

    trackTouchPosition (event) {
      // console.log('trackTouchPosition')
      event.preventDefault()

      let touch = event.touches[0]

      this.mousePosition.x = Math.round((touch.pageX - this.containerTranslation.x - this.containerOffset.left) / this.containerScale.x)
      this.mousePosition.y = Math.round((touch.pageY - this.containerTranslation.y - this.containerOffset.top) / this.containerScale.y)
      // console.log(this.mousePosition.x + ':' + this.mousePosition.y)

      if (this.actions.drawingMode === true) {
        // console.log('drawingMode 2')
        Events.debounce(this.drawLine, 'drawLine')
      }
    },

    drawLine () {
      if (this.actions.drawingMode === false) return // escape if mode got disabled meanwhile

      this.tmpLine.setAttribute('d', Path.createPolyline([this.actionPosition, this.mousePosition]))
      Events.scheduledAnimationFrame['drawLine'] = false
    },

    throttle (fn, fnEvent, wait) {
      this.time = Events.throttle(fn, fnEvent, wait, this.time)
    },

    detectFireRate () {
      console.log('detectFireRate')
      Events.detectFireRate(1000)
    },

    updateContainerSize (dragDelta) {
      let delta = typeof dragDelta === 'object' ? dragDelta : { x: 0, y: 0 }

      this.containerSize = { x: this.containerSize.x + delta.x, y: this.containerSize.y + delta.y }
      this.containerNode.style.width = this.containerSize.x + 'px' // forces reflow
      this.containerNode.style.height = this.containerSize.y + 'px' // forces reflow
      this.containerOffset = Calc.absolutePosition(this.containerNode, this.containerTranslation) // forces reflow
      this.initRuler()
    },

    initRuler () {
      this.timeRuler.setAttribute('x1', '10')
      this.timeRuler.setAttribute('y1', '0')
      this.timeRuler.setAttribute('x2', this.containerSize.x - 10)
      this.timeRuler.setAttribute('y2', '0')
    },

    drawRuler (event) {
      // read from model
      let y = (parseFloat(this.timeRuler.getAttribute('data-y')) || 0)

      // update model
      // translate when resizing from top or left connections
      y += Math.round(event.dy / this.containerScale.y)
      // store position
      this.timeRuler.setAttribute('data-y', y)

      // update view
      this.timeRuler.setAttribute('transform', 'translate(0,' + y + ')')
      // Bugfix for Firefox (svg elem needs to have attribute and style prop)
      this.timeRuler.style.webkitTransform = this.timeRuler.style.transform = 'translate(0px,' + y + 'px)'
    },

    updateAxisPosition () {
      let containerPos = this.containerNode.getBoundingClientRect()

      if (containerPos.top < 80) {
        let height = 170 - Math.round(containerPos.top / this.containerScale.y)
        this.xAxisNode.style.height = height + 'px'
      } else {
        this.xAxisNode.style.height = '50px'
      }

      if (containerPos.left < 110) {
        let width = 250 - Math.round(containerPos.left / this.containerScale.x)
        this.yAxisNode.style.width = width + 'px'
      } else {
        this.yAxisNode.style.width = '100px'
      }
    },

    applyTransform () {
      console.log('applyTransform')

      let transformTranslate = 'translate(' + this.containerTranslation.x + 'px, ' + this.containerTranslation.y + 'px)'
      let transformScale = 'scale(' + this.containerScale.x + ',' + this.containerScale.y + ')'
      this.containerNode.style.webkitTransform =
      this.containerNode.style.transform = transformTranslate + ' ' + transformScale
    },

    translate (dx, dy) {
      this.containerTranslation = {x: this.containerTranslation.x + dx, y: this.containerTranslation.y + dy}
    },

    shortName (text) {
      return Helper.shortName(text, true, 4)
    },

    scale (multX, multY) {
      if (multX === 0 || multY === 0) {
        console.warn('scalefactor 0 not allowed')
        return
      }

      this.containerScale = {x: this.containerScale.x * multX, y: this.containerScale.y * multY}
    },

    onDelegateSelect (data) {
      if (!data.hasOwnProperty('response') || !data.hasOwnProperty('initiator')) {
        console.warn('onDelegateSelect - expected response and initiator in data object')
        return
      }

      if (data.response !== 'add') {
        return
      }

      this.$emit('addDelegate', data.initiator)
    },

    // Listener for horizontal-bar emits
    applyDelegateChange (data) {
      switch (data) {
        case 'add':
          this.$refs['dialog-delegate-select'].open()
          return
        case 'remove':
          this.$emit('removeDelegate')
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
      this.updateAxisPosition()
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
        console.log('lastProcess', lastProcess)
        start = Calc.roundDate(lastProcess.mEnd, this.timeFormat)
        start = Calc.incrementDate(start, this.timeFormat)
        initiator = lastProcess.initiator // use initator of lastProcess
      }

      let process = new Process('', initiator, start, null)
      this.$emit('addProcess', process)
    },

    resetCuror () {
      this.htmlNode.style.cursor = null
    },

    onEscape () {
      console.log('onEscape')

      if (!this.fsm.hasEvent('onEscape')) return
      this.fsm.run('onEscape')
    },

    onContainerClick () {
      console.log('onContainerClick - disabled', Events.DISABLE_CLICK)
      if (Events.DISABLE_CLICK) return

      this.resetCuror()

      if (!this.fsm.hasEvent('onContainerClick')) return
      this.fsm.run('onContainerClick')
    },

    onConnectionClick (event) {
      if (!this.fsm.hasEvent('onConnectionClick')) return
      this.fsm.run('onConnectionClick', event)

      this.actionId = event.target.getAttribute('data-id')
      this.$refs['removeConnectionDialog'].open()
    },

    onCloseRemoveConnectionDialog (type) {
      if (!this.fsm.hasEvent('onCloseDialog')) return
      this.fsm.run('onCloseDialog')

      console.log('Closed', type)

      if (type === 'cancel') return
      this.removeConnection(this.actionId)
    },

    onTransformationClick (event) {
      console.warn('onTransformationClick')
      if (!this.fsm.hasEvent('onTransformationClick')) return
      this.fsm.run('onTransformationClick', event)

      let processId = event.target.parentNode.getAttribute('data-process')
      let process = this.processModel.children.find(elem => elem.id === processId)

      if (typeof process === 'undefined') {
        console.warn('Could not find process for id ' + processId)
        return
      }

      this.$refs['dialog-process'].open(process, 'update', true, 4)
    },

    onParticipationClick (event) {
      console.warn('onParticipationClick')
      if (!this.fsm.hasEvent('onParticipationClick')) return
      this.fsm.run('onParticipationClick', event)

      let processId = event.target.parentNode.getAttribute('data-process')
      let process = this.processModel.children.find(elem => elem.id === processId)

      if (typeof process === 'undefined') {
        console.warn('Could not find process for id ' + processId)
        return
      }

      this.$refs['dialog-process'].open(process, 'update', true, 0)
    },

    onChangeProcess () {
      console.log('onChangeProcess called')
      this.$emit('changeProcess', 'parent')
    },

    onCloseProcessDialog (data) {
      console.log('onCloseProcessDialog called')
      if (!this.fsm.hasEvent('onCloseProcessDialog')) return
      this.fsm.run('onCloseProcessDialog', data)
      console.log('onCloseProcessDialog run!')
    },

    onCloseTransformationDialog (data) {
      console.log('onCloseTransformationDialog called')
      if (!this.fsm.hasEvent('onCloseTransformationDialog')) return
      this.fsm.run('onCloseTransformationDialog', data)
      console.log('onCloseTransformationDialog run!')
    },

    onCloseParticipationDialog (data) {
      console.log('onCloseParticipationDialog called')
      if (!this.fsm.hasEvent('onCloseParticipationDialog')) return
      this.fsm.run('onCloseParticipationDialog', data)
      console.log('onCloseParticipationDialog run!')
    },

    onCloseDelegateDialog (data) {
      console.log('onCloseDelegateDialog called')
      switch (data.response) {
        case 'update':
          this.$emit('updateDelegate', data.id)
          break
        case 'remove':
          this.$emit('removeDelegate', data.id)
          break
      }
    },

    onToolbarShowProcess () {
      console.warn('onToolbarShowProcess')

      if (!this.fsm.hasEvent('onProcessClick')) return
      this.fsm.run('onProcessClick')
    },

    resizeProcess (event) {
      // anchor point
      let group = event.target.parentNode
      let rect = event.target
      let anchor = group.querySelector('.process-anchor')

      // read from model
      let groupX = (parseFloat(group.getAttribute('data-x')) || 0)
      let groupY = (parseFloat(group.getAttribute('data-y')) || 0)
      let anchorY = parseInt(anchor.getAttribute('cy') || 0)

      // update model
      // translate when resizing from top or left cons
      groupX += event.deltaRect.left
      groupY += event.deltaRect.top
      anchorY += event.dy

      // store position
      group.setAttribute('data-x', groupX)
      group.setAttribute('data-y', groupY)

      // update view
      let displayValue = group.style.display
      group.style.display = 'none' // avoid reflows by multiple style changes

      // update the element's style
      rect.setAttribute('width', Math.round(event.rect.width / this.containerScale.x))
      rect.setAttribute('height', Math.round(event.rect.height / this.containerScale.y))
      anchor.setAttribute('cy', anchorY)

      group.style.display = displayValue

      // translate when resizing from top or left cons
      group.setAttribute('transform', 'translate(' + groupX + ',' + groupY + ')')
      // Bugfix for Firefox (svg elem needs to have attribute and style prop)
      group.style.webkitTransform = group.style.transform = 'translate(' + groupX + 'px,' + groupY + 'px)'
    },

    resizeElement (event) {
      console.log('resizeElement', event.target)
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

    onProcessClick (event) {
      console.warn('onProcessClick - disabled', Events.DISABLE_CLICK)
      if (Events.DISABLE_CLICK) return

      this.resetCuror()

      this.clickCounts.process++
      // wait for second click

      setTimeout(event => {
        let clicks = this.clickCounts.process
        this.clickCounts.process = 0
        switch (clicks) {
          case 1:
            if (!this.fsm.hasEvent('onProcessClick')) return
            this.fsm.run('onProcessClick', event)
            break
          case 2:
            if (!this.fsm.hasEvent('onProcessDoubleClick')) return
            this.fsm.run('onProcessDoubleClick', event)
            break
          default:
            break
        }
        event.preventDefault()
      }, 200, event)
    },

    onProcessDrag (event) {
      console.log('onProcessDrag')
      event.target = event.target.parentNode // translate group instead of rect

      let processId = event.target.getAttribute('data-id')
      let x = (parseFloat(event.target.getAttribute('data-x')) || 0)
      let y = (parseFloat(event.target.getAttribute('data-y')) || 0)

      // update model
      x += Math.round(event.dx / this.containerScale.x)
      y += Math.round(event.dy / this.containerScale.y)
      event.target.setAttribute('data-x', x)
      event.target.setAttribute('data-y', y)

      // update view
      event.target.setAttribute('transform', 'translate(' + x + ',' + y + ')')
      // Bugfix for Firefox (svg elem needs to have attribute and style prop)
      event.target.style.webkitTransform = event.target.style.transform = 'translate(' + x + 'px, ' + y + 'px)'

      // update connections of the process
      this.redrawConnection(processId)

      // update ruler
      this.drawRuler(event)
    },

    onRangeChange (event) {
      console.log('onRangeChange')
      this.itemSize = Helper.parse(event)
      Calc.itemSize = this.itemSize
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
      this.resizeElement(event)

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
        this.updateAxisPosition() // forces reflow

        // re-add listener
        window.addEventListener('scroll', this.onScroll, true)
      }, 400)
    },

    onResize (event) {
      console.log('onResize')
      this.redraw()
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

  .process {
    -webkit-print-color-adjust: exact;
  }

  .processContainer {
    top: 0 !important
  }

  .tool-bar {
    display: none
  }
}

@media (max-width: 1000px) {
  .processContainer {
  margin-top: 200px;
  }
}

@media (min-width: 1000px) {
  .processContainer {
    margin-top: 140px;
  }
}

#vue-workspace {
  position: absolute;
  height: 100vh;
  width: 100vw;
  overflow: auto;
  background: $bgColor;
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
  flex-direction: row;
  flex-wrap: nowrap;
  top: 0px;
  left: 200px;
  border: 1px solid #ccc;
  transform-origin: 0 0;
  background-color:rgba(255, 255, 255, 0.8);
  box-shadow: 0 1px 5px rgba(0,0,0,.2), 0 2px 2px rgba(0,0,0,.14), 0 3px 1px -2px rgba(0,0,0,.12);
}

.delegate {
  border-left: 2px dashed #ccc;
  text-align: center;
  transition: all 1s;

  &.pariticipant-drop {
    background-color: $secondayColor;
    opacity: 0.3;
  }

  &.drop-active {
    border-color: #aaa;
  }

  &.delegate0 {
    border-left: 0
  }
}

svg {
  position: absolute;
  height:100% !important;
  width:100% !important;
  z-index: 1;

  &.tmpConnection-active .process-anchor:not(.active) {
    display: none;
  }

  .process {
    position: absolute;
    display: flex;
    left: 0;
    top: 0;
    width: 100px;
    color: #fff;
    font-size: 1.2em;
    border-radius: 4px;
    flex-direction: column;
    justify-content: flex-end;

    z-index: 2;
    opacity: 0.5;

    &:hover {
      animation-name: fadeIn;
      animation-duration: 600ms;
      animation-fill-mode: forwards;

      rect.has-child-false {
        fill: $accepntColor;
      }

      rect.has-child-true {
        fill: $accepntColor;
      }
    }

    &.animation-highlight  {
      animation-name: bounceIn;
      animation-duration: 600ms;
    }

    rect.proces-transform, rect.process-participation {
      fill: $primaryColor;
      cursor: pointer;
    }

    .process-transform-text {
      fill: white;
      text-anchor: middle;
      pointer-events: none;
      font-style: normal;
      font-weight: bold;
      font-size: 20px;
    }

    .process-participation-icon {
      text-anchor: middle;
      pointer-events: none;
    }

    rect.process-content {
      transform-origin: center;
      transform: scale(0);

      &.animation-morph {
        animation-name: morphIn;
        animation-fill-mode: forwards;
        animation-duration: 50ms;
        transform-origin: center;
      }

      &.process-drop {
        fill: #e91e63;
      }
    }

    .process-content {
      fill: $secondayColor;
      stroke-width: 1;
      stroke: white;
    }

    .has-child-true {
      fill: url(#pattern);
    }

    .has-child-false {
      fill: #8e8e8e;
    }

    $anchorSize: 20px;

    .process-anchor {
      width: $anchorSize;
      height: $anchorSize;
      fill:rgb(255,255,255);
      cursor: crosshair;
    }

    .process-text {
      fill: white;
      text-anchor: middle;
      pointer-events: none;
      font-style: normal;
      font-weight: bold;
      font-size: 20px;
    }
  }

  marker {
    fill: white;
    stroke-width: 1;
    stroke: #BBB;
  }

  .connection {
    .connection-line, .tmpConnection {
      fill: none;
      stroke: #BBB;
      stroke-width: 3;
      stroke-dasharray: 4,4;
      marker-end: url(#marker-triangle);
      pointer-events: none;
    }

    .connection-path {
      fill: none;
      stroke: red;
      stroke-width: 3;
      stroke-dasharray: 4,4;
    }

    .connection-outline {
      fill: none;
      stroke: red;
      stroke-width: 50;
      stroke-opacity: 0;
      pointer-events: all;
      cursor: pointer;
    }

    .connection-outline:hover {
      opacity: 0;
    }

    .connection-outline:hover + .connection-line {
      stroke: $primaryColor;
      stroke-width: 3;
      stroke-dasharray: none;
      animation-name: fadeIn;
      animation-duration: 300ms;
    }
  }

  .connection-transition {
    pointer-events: all;
    cursor: pointer;

    &:hover {
      animation-name: fadeIn;
      animation-duration: 200ms;
      animation-fill-mode: forwards;

      .connection-transition-text {
        fill: #fff;
      }

      .connection-transition-circle {
        fill: $accepntColor;
      }
    }

    .connection-transition-circle {
      fill: $bgColor;
    }

    .connection-transition-circle-outline {
      fill: none;
      stroke: $primaryColor;
      stroke-width: 2;
      stroke-opacity: 0.5
    }

    .connection-transition-circle-outline:hover {
      stroke: $accepntColor;
      stroke-width: 3;
    }

    .connection-transition-text {
      font-style: normal;
      font-size: 28px;
      fill: #888;
    }

    .connection-transition-text:hover + .connection-transition-circle-outline {
      stroke: $accepntColor;
      stroke-width: 3;
    }
  }
}

.timeRuler {
  fill: none;
  display: none;
  stroke: #3f51b5;
  stroke-width: 2;
  stroke-dasharray: 5,5;
  marker-start: url(#marker-circle);
  pointer-events:all;

}

.axis-x  {
  margin-top: -55px;
  z-index: 3
}

.axis-y  {
  margin-left: -120px;
  z-index: 3
}

.range-itemSize {
  position: absolute;
  margin-left: -120px;
  margin-top: -40px;
  width: 100px;
}


@keyframes fadeIn {
  0% { opacity: 0.5; }
  40% { opacity: 0.5; }
  100% { opacity: 1; }
}

@keyframes morphIn{
  0% { transform: scale(0); }
  80% { transform: scale(1.1); }
  100% { transform: scale(1); }
}

@keyframes bounceIn{
  0% { opacity: 0; }
  50% { opacity: 0.9; }
  100% { opacity: 0.5; }
}

</style>
