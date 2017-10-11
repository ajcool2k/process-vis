<template>
  <div id="vue-workspace" :data-change="changes.time">

    <!-- child component -->
    <tool-bar :process="processModel" :isSaved="isSaved" :containerScale="containerScale" v-on:applyZoom="applyZoom" v-on:exchange="exchange" v-on:process="onToolbarShowProcess" v-on:changeProcess="onChangeProcess"></tool-bar>

    <div class="workspace">
      <md-dialog-confirm
        :md-title="dialog.removeConnectionDialog.title"
        :md-content-html="dialog.removeConnectionDialog.contentHtml"
        :md-ok-text="dialog.removeConnectionDialog.ok"
        :md-cancel-text="dialog.removeConnectionDialog.cancel"
        @close="onCloseRemoveConnectionDialog"
        ref="removeConnectionDialog">
      </md-dialog-confirm>

      <dialog-process ref="dialog-process" v-on:closeDialog="onCloseProcessDialog"></dialog-process>
      <dialog-transformation ref="dialog-transformation" v-on:closeDialog="onCloseTransformationDialog"></dialog-transformation>

      <div class="processContainer" @click="onContainerClick" @touchmove.passive="trackTouchPosition" @mousemove.passive="throttle(trackMousePosition, $event, 50)">
      <!-- child components -->
        <axis-x class="ignore-container-events" :stakeholder="processModel.stakeholder" :participants="processModel.participants" :scale="containerScale" v-on:closeDialog="onCloseParticipantDialog"></axis-x>
        <vue-slider class="range-timeSlice ignore-container-events" :value="timeSlice" :width="100" :min="1" :max="100" @callback="onRangeChange" :processStyle="{ backgroundColor: '#3f51b5' }" :tooltipStyle="{ backgroundColor: '#3f51b5', borderColor: '#3f51b5' }"></vue-slider>
        <axis-y class="ignore-container-events" :participants="processModel.participants" :processes="processModel.childs" :timeFormat="timeFormat" :timeSlice="timeSlice" :scale="containerScale" :containerSize="containerSize"></axis-y>


        <template v-for="(item, index) in processModel.participants">
          <div :key="item" :class="'participant participant' + index" :data-id="item" :style="'width: ' + ( containerSize.x / processModel.participants.length ) + 'px'"></div>
        </template>

        <svg class="svgNode">
          <defs>
            <marker id="marker-triangle"
              viewBox="0 0 10 10" refX="0" refY="5"
              markerUnits="strokeWidth"
              markerWidth="4" markerHeight="3"
              orient="auto">
              <path d="M 0 0 L 10 5 L 0 10 z" />
            </marker>

            <marker id="marker-circle" markerWidth="10" markerHeight="10" refX="5" refY="5" orient="auto">
              <circle cx="5" cy="5" r="2" fill="dodgerblue"/>
            </marker>

          </defs>

          <!-- draw Processes -->
          <template v-if="item._width" v-for="(item, index) in processModel.childs">
            <g :key="item.id + '-process'" class="process draggable drag-drop" :data-id="item.id" :data-participant="item.initiator" @click.stop="onProcessClick">
              <rect :class="'process-content has-child-' + (item.childs.length > 0)" :data-id="item.id" :height="item._height" :width="item._width"></rect>
              <circle class="process-anchor" :data-id="item.id" @click.stop="activateConnectionConnect" r="10" :cy="(item._height - 20)" :cx="(item._width / 2 )"></circle>
              <text class="process-text" :data-id="item.id" :x="(item._width / 2)" y="20">{{item.id}} - {{item._height}}</text>
            </g>
          </template>

          <!-- draw Connections -->
          <template v-for="(item, index) in processModel.childs">
            <template v-for="(con, index) in item._connections">
              <g :key="con.id + '-connection'" class="connection" :data-id="con.id">
                <polyline class="connection-outline" :data-id="con.id" points="" @click.stop="openRemoveConnectionDialog" />
                <polyline class="connection-line" :data-id="con.id" points="" />
              </g>
             </template>
          </template>

          <!-- draw Transition-Info -->
          <template v-for="(item, index) in processModel.childs">
            <template v-for="(con, index) in item._connections">
              <g :key="con.id + '-connection-transition'" class="connection-transition" :data-id="con.id" :data-process="item.id" @click.stop="onOpenTransformationDialog">
                <circle class="connection-transition-circle" r="20" />
                <circle class="connection-transition-circle connection-transition-circle-outline" r="20" />
                <text class="connection-transition-text" dy="10" text-anchor="middle">{{item.transformation.type}}</text>
              </g>
             </template>
          </template>

          <g class="connection tmp">
            <polyline class="tmpConnection" points="" />
          </g>

          <line class="timeRuler" />
        </svg>
      </div>
    </div>

    <time-chooser :timeFormat="timeFormat" v-on:onTimeFormatChange="applyTimeFormat"></time-chooser>
    <item-chooser v-on:onProcessCreate="processCreate" v-on:participantChange="applyParticipantChange"></item-chooser>

  </div>
</template>

<script>
import Vue from 'vue'
import 'vue-material/dist/vue-material.css'

import VueMaterial from 'vue-material'
import VueSlider from 'vue-slider-component'

/*
import { MdCore, MdDialog, MdBackdrop } from 'vue-material'
Vue.use(MdCore);
Vue.use(MdDialog);
Vue.use(MdBackdrop);
*/

// Child components
import ToolBar from './ToolBar.vue'
import ItemChooser from './ItemChooser.vue'
import TimeChooser from './TimeChooser.vue'
import AxisX from './AxisX.vue'
import AxisY from './AxisY.vue'

import DialogProcess from './dialog/DialogProcess.vue'
import DialogTransformation from './dialog/DialogTransformation.vue'

import { interact } from 'interactjs'
import { _ } from 'underscore'

import { Dialog } from '@/classes/ui/Dialog'
import { StateMachine } from '@/classes/utils/StateMachine'
import { Animate } from '@/classes/utils/Animate'
import { TouchSupport } from '@/classes/utils/TouchSupport'
import { Events } from '@/classes/utils/Events'
import { Calc } from '@/classes/utils/Calc'
import { Helper } from '@/classes/utils/Helper'

import { Process } from '@/classes/model/Process'

Vue.use(VueMaterial)

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
    'dialog-transformation': DialogTransformation
  },
  props: [ 'processModel', 'isSaved', 'changes' ],

  data: function () {
    return {
      fsm: null, // finite state machine
      workspaceNode: null,
      workspaceSize: { x: Calc.minContainerWidth + 200, y: Calc.minContainerWidth + 200 },
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
      timeSlice: 60,
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

    // check support
    this.hasTouchSupport = TouchSupport.hasSupport()
    if (this.hasTouchSupport) TouchSupport.init()

    console.info('touch support: ' + this.hasTouchSupport)

    window.addEventListener('scroll', this.onScroll, true)
    window.addEventListener('resize', this.onResize, true)
  },

  destroyed: function () {
    console.log('destroyed')
    window.removeEventListener('scroll', this.onScroll)
    window.removeEventListener('resize', this.onResize)
  },

  mounted: function () {
    console.log('Workspace mounted', document.querySelectorAll('.process').length)

    // cache DOM
    this.workspaceNode = document.querySelector('.workspace')
    this.containerNode = this.workspaceNode.querySelector('.processContainer')
    this.svgNode = this.containerNode.querySelector('svg.svgNode')
    this.tmpLine = this.svgNode.querySelector('.tmpConnection')
    this.timeRuler = this.svgNode.querySelector('.timeRuler')

    this.xAxisNode = this.workspaceNode.querySelector('.axis-x')
    this.yAxisNode = this.workspaceNode.querySelector('.axis-y')

    // Scope Prop
    this.scopeProp = Helper.getScopeProp(this.svgNode)

    // prepare Container and Workspace
    Calc.processPosition(this.processModel.childs, this.processModel.participants, this.containerSize, this.timeFormat) // set position on the model
    this.containerSize = Calc.containerSize(this.processModel.childs, this.processModel.participants) // calc layout based on model
    this.updateContainerSize() // apply model - forces reflow
    this.workspaceSize = { x: this.containerOffset.width + 100, y: this.containerOffset.height + 100 }
    this.updateWorkspaceSize() // forces reflow
    // remove existing event handlers
    interact('.processContainer').unset()
    interact('.participant').unset()
    interact('.process rect').unset()

    // add new event handlers
    interact('.processContainer')
      .draggable({})
      .ignoreFrom('.ignore-container-events')
      .on('dragstart', event => {
        console.warn('dragstart container')
        this.actionPosition = { x: event.pageX, y: event.pageY }
      })
      .on('dragmove', this.onContainerDrag)
      .on('dragend', event => {
        console.warn('dragend container')
        let dragDelta = { x: event.pageX - this.actionPosition.x, y: event.pageY - this.actionPosition.y }
        this.updateWorkspaceSize(dragDelta) // forces reflow
        this.updateAxisPosition() // forces reflow
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
      .on('resizemove', this.onContainerResize)
      .on('resizeend', event => {
        console.log('resizeend')
        let dragDelta = { x: event.pageX - this.actionPosition.x, y: event.pageY - this.actionPosition.y }
        let scaledDragDelta = { x: Math.floor(dragDelta.x / this.containerScale.x), y: Math.floor(dragDelta.y / this.containerScale.y) }
        this.updateContainerSize(scaledDragDelta) // forces reflow
        this.updateWorkspaceSize(scaledDragDelta) // forces reflow
      })

    interact('.process rect')
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
        if (!this.fsm.hasEvent('dragstart')) return
        this.fsm.run('dragstart', event)
      })
      .on('dragmove', this.onProcessDrag)
      .on('dragend', event => {
        console.warn('dragend process')
        this.timeRuler.style.display = 'none'
      })
      .resizable({
        preserveAspectRatio: false,
        restrict: { /* restrict options */ },
        edges: { left: false, right: false, bottom: true, top: false }
      })
      .on('resizestart', event => {
        console.log('resizestart event', event)
        if (!this.fsm.hasEvent('resizeProcessStart')) return
        this.fsm.run('resizeProcessStart', event)
      })
      .on('resizemove', event => {
        if (!this.fsm.hasEvent('resizeProcessMove')) return
        this.fsm.run('resizeProcessMove', event)
      })
      .on('resizeend', event => {
        if (!this.fsm.hasEvent('resizeProcessFinished')) return
        this.fsm.run('resizeProcessFinished', event)
      })

    interact('.participant')
      .dropzone({
        // only accept elements matching this CSS selector
        accept: '.process rect',
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
          if (!this.fsm.hasEvent('onProcessDrop')) return
          this.fsm.run('onProcessDrop', event)
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
    console.warn('Workspace updating ...', document.querySelectorAll('.process').length)
    Calc.processPosition(this.processModel.childs, this.processModel.participants, this.containerSize, this.timeFormat)
    let size = Calc.containerSize(this.processModel.childs, this.processModel.participants, true) // calc layout based on model

    // diff between actual containerSize and Calculation
    let delta = { x: size.x - this.containerSize.x, y: size.y - this.containerSize.y }

    // increase containerSize when more space is needed (e.g. process added)
    delta.x = delta.x < 0 ? 0 : delta.x
    delta.y = delta.y < 0 ? 0 : delta.y

    if (delta.x !== 0 || delta.y !== 0) {
      this.updateContainerSize(delta)
      this.updateWorkspaceSize(delta)
    }
  },

  updated: function () {
    console.warn('Workspace updated', document.querySelectorAll('.process').length)
    Animate.clear()
    this.redraw()
  },

  methods: {

    initStateMachine () {
      this.fsm = new StateMachine()

      let idle = this.fsm.addState('idle')

      // Connections
      let drawConnection = this.fsm.addState('drawConnection')

      // Processs
      let dragProcess = this.fsm.addState('dragProcess')
      let droppedProcess = this.fsm.addState('droppedProcess')
      let openProcess = this.fsm.addState('openProcess')

      let resizeProcessStart = this.fsm.addState('resizeProcessStart')
      let resizeProcessMove = this.fsm.addState('resizeProcessMove')
      let resizeProcessFinished = this.fsm.addState('resizeProcessFinished')

      // Dialogs
      let showProcess = this.fsm.addState('showProcess')
      let showRemoveConnection = this.fsm.addState('showRemoveConnection')
      let showTransformation = this.fsm.addState('showTransformation')

      this.fsm.addEvent(idle, drawConnection, {
        name: 'activateConnectionConnect',
        action: (event) => {}
      })

      this.fsm.addEvent(drawConnection, idle, {
        name: 'onContainerClick',
        action: (event) => {
          this.actions.drawingMode = false
          this.tmpLine.removeAttribute('points')
        }
      })

      this.fsm.addEvent(drawConnection, idle, {
        name: 'onProcessClick',
        action: (event) => {
          let source = this.tmpLine
          let sourceId = source.getAttribute('data-id')
          let target = event.target
          let targetId = target.getAttribute('data-id')

          // add to model
          this.addConnection(sourceId, targetId)
          this.actions.drawingMode = false
          this.tmpLine.removeAttribute('points')
        }
      })

      this.fsm.addEvent(idle, resizeProcessStart, {
        name: 'resizeProcessStart',
        action: (event) => {
          this.timeRuler.setAttribute('data-y', this.mousePosition.y)
          this.timeRuler.style.display = 'inline'
        }
      })

      this.fsm.addEvent(resizeProcessStart, resizeProcessMove, {
        name: 'resizeProcessMove',
        type: 'transition',
        action: (event) => {
          this.resizeProcess(event)
          let processId = event.target.getAttribute('data-id')

          // show time ruler
          this.drawRuler(event)

          // update connections of the process
          this.redrawConnection(processId)
        }
      })

      this.fsm.addEvent(resizeProcessMove, resizeProcessFinished, {
        name: 'resizeProcessFinished',
        action: (event) => {
          this.timeRuler.style.display = 'none'
          let processId = event.target.getAttribute('data-id')
          let process = this.processModel.childs.find(elem => elem.id === Helper.parse(processId))
          console.log('process', process)
          let resizeDelta = { x: Math.floor(event.dx / this.containerScale.x), y: Math.floor(event.dy / this.containerScale.y) }
          let factor = (process._height + resizeDelta.y) / process._height
          Calc.updateEndDate(process, factor)
          process._height += resizeDelta.y
          this.$emit('updateProcess', process.id)
        }
      })

      this.fsm.addEvent(resizeProcessFinished, idle, {
        name: 'onProcessClick',
        action: (event) => {
        }
      })

      this.fsm.addEvent(resizeProcessFinished, idle, {
        name: 'onContainerClick',
        action: (event) => {
        }
      })

      this.fsm.addEvent(idle, dragProcess, {
        name: 'dragstart',
        action: (event) => {
          let parent = event.target.parentNode
          this.timeRuler.setAttribute('data-y', parent.getAttribute('data-y'))
          this.timeRuler.style.display = 'inline'
        }
      })

      this.fsm.addEvent(dragProcess, droppedProcess, {
        name: 'onProcessDrop',
        action: (event) => {
          let draggableElement = event.relatedTarget
          let dropzoneElement = event.target

          let data = {
            processId: Helper.parse(draggableElement.getAttribute('data-id')),
            participantId: Helper.parse(dropzoneElement.getAttribute('data-id'))
          }

          // change start date on y change
          let dy = event.dragEvent.dy
          let diffTimeSlice = Math.round(dy / this.timeSlice)

          if (Math.abs(diffTimeSlice) > 0) {
            let process = this.processModel.childs.find(elem => elem.id === data.processId)

            switch (this.timeFormat) {
              case 'days':
                process.mStart.setDate(process.mStart.getDate() + diffTimeSlice)
                process.mEnd.setDate(process.mEnd.getDate() + diffTimeSlice)
                break
              case 'months':
                process.mStart.setMonth(process.mStart.getMonth() + diffTimeSlice)
                process.mEnd.setMonth(process.mEnd.getMonth() + diffTimeSlice)
                break
              case 'hours':
                process.mStart.setHours(process.mStart.getHours() + diffTimeSlice)
                process.mEnd.setHours(process.mEnd.getHours() + diffTimeSlice)
                break
            }
            this.$emit('updateProcess', process.id)
          }

          // move process
          console.log(JSON.stringify(data))
          this.$emit('moveProcess', data)
        }
      })

      this.fsm.addEvent(droppedProcess, idle, {
        name: 'onProcessClick',
        action: (event) => {
        }
      })

      this.fsm.addEvent(idle, openProcess, {
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

      this.fsm.addEvent(openProcess, idle, {
        name: 'timeout',
        action: (event) => {
        }
      })

      this.fsm.addEvent(idle, showProcess, {
        name: 'onProcessClick',
        action: (event) => {
          if (!event || typeof event === 'undefined') {
            // open parent
            this.$refs['dialog-process'].open(this.processModel, 'update', false)
          } else {
            // open child
            this.actionId = event.target.getAttribute('data-id')
            let child = _.findWhere(this.processModel.childs, { id: Helper.parse(this.actionId) })
            this.$refs['dialog-process'].open(child, 'update', true)
          }
        }
      })

      this.fsm.addEvent(showProcess, idle, {
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

      this.fsm.addEvent(idle, showRemoveConnection, {
        name: 'openRemoveConnectionDialog',
        action: (event) => {
        }
      })

      this.fsm.addEvent(showRemoveConnection, idle, {
        name: 'onCloseRemoveConnectionDialog',
        action: (event) => {}
      })

      this.fsm.addEvent(idle, showTransformation, {
        name: 'onOpenTransformationDialog',
        action: (event) => {
        }
      })

      this.fsm.addEvent(showTransformation, idle, {
        name: 'onCloseTransformationDialog',
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
      let process = this.processModel.childs.find(elem => elem.id === sourceId)
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

      this.processModel.childs.forEach(process => {
        // draw process at correct position
        let domNode = this.redrawProcessPosition(process)

        // draw connection
        let callback = () => {
          this.redrawConnection(process)
          domNode.querySelector('rect').classList.add('animation-morph')
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
      if (typeof process === 'string') process = this.processModel.childs.find(elem => elem.id === Helper.parse(process))

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
      let transition = this.svgNode.querySelector('.connection-transition[data-id="' + con.id + '"]')

      // ----------------------------------------------
      // source könnte ausgelagert werden, aber nicht performance kritisch
      let source = this.containerNode.querySelector('.process[data-id="' + con.source + '"]')
      let target = this.containerNode.querySelector('.process[data-id="' + con.target + '"]')

      let sourceRect = Calc.absolutePosition(source, this.containerTranslation) // forces reflow
      let targetRect = Calc.absolutePosition(target, this.containerTranslation) // forces reflow
      // ----------------------------------------------

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

      let Offset = 0 // (sourcePoint.x < targetPoint.x) ? -20 : 0

      if (sourcePoint.x === targetPoint.x) anchorOffset = 0

      let sourceAnchor = {
        x: sourcePoint.x,
        y: sourcePoint.y + Math.max(Math.round((targetPoint.y - sourcePoint.y) / 2), anchorOffset)
      }

      let targetAnchor = {
        x: targetPoint.x,
        y: targetPoint.y - Math.max(Math.round((targetPoint.y - sourcePoint.y) / 2), anchorOffset) + Offset
      }

      let middlePoint1 = {
        x: sourcePoint.x + (Math.round((targetPoint.x - sourcePoint.x) / 2) + Offset),
        y: sourceAnchor.y
      }

      let middlePoint2 = {
        x: targetPoint.x - (Math.round((targetPoint.x - sourcePoint.x) / 2) - Offset),
        y: targetAnchor.y
      }
      const attributes = sourcePoint.x + ',' + sourcePoint.y + ' ' +
        sourceAnchor.x + ',' + sourceAnchor.y + ' ' +
        middlePoint1.x + ',' + middlePoint1.y + ' ' +
        middlePoint2.x + ',' + middlePoint2.y + ' ' +
        targetAnchor.x + ',' + targetAnchor.y + ' ' +
         targetPoint.x + ',' + targetPoint.y

      line.setAttribute('points', attributes)
      outline.setAttribute('points', attributes)
      transition.setAttribute('transform', 'translate(' + middlePoint1.x + ',' + middlePoint1.y + ')')
    },

    activateConnectionConnect (event) {
      if (!this.fsm.hasEvent('activateConnectionConnect')) return
      this.fsm.run('activateConnectionConnect')

      event.preventDefault()

      console.log('activateConnectionConnect: ' + event.type)

      let source = event.target
      let sourceRect = Calc.absolutePosition(source, this.containerTranslation) // forces reflow

      let sourcePoint = {
        x: Math.round((sourceRect.left + (sourceRect.width / 2) - this.containerOffset.left) / this.containerScale.x),
        y: Math.round((sourceRect.top + (sourceRect.height / 2) - this.containerOffset.top) / this.containerScale.y)
      }

      this.actionPosition = sourcePoint
      this.tmpLine.setAttribute('data-id', event.target.getAttribute('data-id'))

      this.actions.drawingMode = true
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

      /*
      console.log('connecto from: x=' + this.actionPosition.x + ', y=' + this.actionPosition.y)
      console.log('connecto from: x=' + this.mousePosition.x + ', y=' + this.mousePosition.y)
      console.log(this.tmpLine)
      */
      this.tmpLine.setAttribute('points',
        this.actionPosition.x + ',' + this.actionPosition.y + ' ' +
        this.mousePosition.x + ',' + this.mousePosition.y
      )
      // console.log('works!!')
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
        let height = 150 - containerPos.top
        this.xAxisNode.style.height = height + 'px'
      } else {
        this.xAxisNode.style.height = '50px'
      }

      if (containerPos.left < 110) {
        let width = 250 - containerPos.left
        this.yAxisNode.style.width = width + 'px'
      } else {
        this.yAxisNode.style.width = '100px'
      }
    },

    updateWorkspaceSize (dragDelta) {
      console.log('updateWorkspaceSize')

      let delta = typeof dragDelta === 'object' ? dragDelta : { x: 0, y: 0 }

      this.workspaceSize = { x: this.workspaceSize.x + delta.x, y: this.workspaceSize.y + delta.y }
      let width = Math.round(this.containerScale.x * this.workspaceSize.x)
      let height = Math.round(this.containerScale.x * this.workspaceSize.y)

      let displayValue = this.workspaceNode.style.display
      this.workspaceNode.style.display = 'none' // avoid reflows by multiple style changes
      this.workspaceNode.style.width = width + 'px'
      this.workspaceNode.style.height = height + 'px'
      this.workspaceNode.style.display = displayValue // set active again
    },

    applyTransform () {
      console.log('applyTransform')

      let transformTranslate = 'translate(' + this.containerTranslation.x + 'px, ' + this.containerTranslation.y + 'px)'
      let transformScale = 'scale(' + this.containerScale.x + ',' + this.containerScale.y + ')'
      this.containerNode.style.webkitTransform =
      this.containerNode.style.transform = transformTranslate + ' ' + transformScale
      this.updateWorkspaceSize()
    },

    translate (dx, dy) {
      this.containerTranslation = {x: this.containerTranslation.x + dx, y: this.containerTranslation.y + dy}
    },

    scale (multX, multY) {
      if (multX === 0 || multY === 0) {
        console.warn('scalefactor 0 not allowed')
        return
      }

      this.containerScale = {x: this.containerScale.x * multX, y: this.containerScale.y * multY}
    },

    // Listener for horizontal-bar emits
    applyParticipantChange (data) {
      switch (data) {
        case 'add':
          this.$emit('addParticipant')
          return
        case 'remove':
          this.$emit('removeParticipant')
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
      let isSingleChild = this.processModel.childs.length === 0 // true if no childs are around
      let start
      let initiator

      if (isSingleChild) {
        start = new Date()
        initiator = this.processModel.participants[0] // use last participant
      } else {
        let lastProcess = Calc.getEndProcess(this.processModel.childs) // process at the bottom
        console.log('lastProcess', lastProcess)
        start = lastProcess.mEnd
        initiator = lastProcess.initiator // use initator of lastProcess
      }

      let process = new Process('', initiator, start, null)
      this.$emit('addProcess', process)
    },

    onContainerClick () {
      console.log('onContainerClick')
      if (!this.fsm.hasEvent('onContainerClick')) return
      this.fsm.run('onContainerClick')
    },

    openRemoveConnectionDialog (event) {
      if (!this.fsm.hasEvent('openRemoveConnectionDialog')) return
      this.fsm.run('openRemoveConnectionDialog', event)

      this.actionId = event.target.getAttribute('data-id')
      this.$refs['removeConnectionDialog'].open()
    },

    onCloseRemoveConnectionDialog (type) {
      if (!this.fsm.hasEvent('onCloseRemoveConnectionDialog')) return
      this.fsm.run('onCloseRemoveConnectionDialog')

      console.log('Closed', type)

      if (type === 'cancel') return
      this.removeConnection(this.actionId)
    },

    onOpenTransformationDialog (event) {
      console.warn('onOpenTransformationDialog')
      if (!this.fsm.hasEvent('onOpenTransformationDialog')) return
      this.fsm.run('onOpenTransformationDialog', event)

      let processId = event.target.parentNode.getAttribute('data-process')
      let process = this.processModel.childs.find(elem => elem.id === processId)

      if (typeof process === 'undefined') {
        console.warn('Could not find process for id ' + processId)
        return
      }

      this.$refs['dialog-transformation'].open(process)
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

    onCloseParticipantDialog (data) {
      console.log('onCloseParticipantDialog called')
      switch (data.response) {
        case 'update':
          this.$emit('updateParticipant', data.id)
          break
        case 'remove':
          this.$emit('removeParticipant', data.id)
          break
      }
    },

    onToolbarShowProcess () {
      console.warn('onToolbarShowProcess')

      if (!this.fsm.hasEvent('onProcessClick')) return
      this.fsm.run('onProcessClick')
    },

    resizeProcess (event) {
      console.log('resizeProcess', event.target)
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
      console.warn('onProcessClick')
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
      this.timeSlice = Helper.parse(event)
      Calc.timeSlice = this.timeSlice
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
      console.log(event)
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

.workspace {
  position: relative;
  top: 48px;
  height: auto;
  width: auto;
  min-height: 100vh;
  min-width: 100vw;
  overflow: hidden;
  background: $bgColor;
}

.tool-bar {
  position: fixed;
  width: 100vw;
  z-index: 9;
  height: 48px;
}

.processContainer {
  position: absolute;
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  width: 1000px;
  height: 600px;
  left: 200px;
  top: 80px;
  border: 1px solid #ccc;
  transform-origin: 0 0;
  background-color:rgba(255, 255, 255, 0.8);
  box-shadow: 0 1px 5px rgba(0,0,0,.2), 0 2px 2px rgba(0,0,0,.14), 0 3px 1px -2px rgba(0,0,0,.12);
}

.participant {
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

  &.participant0 {
    border-left: 0
  }
}

svg {
  position: absolute;
  height:100% !important;
  width:100% !important;
  z-index: 1;

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

      rect {
        fill: $accepntColor;
      }
    }

    &.animation-highlight  {
      animation-name: bounceIn;
      animation-duration: 600ms;
    }

    rect {
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
      fill: #3f51b5;
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
      pointer-events: none
    }
  }

  marker {
    fill: rgb(100, 100, 100);
    stroke-width: 2;
    stroke: #888;
  }

  .connection {
    .connection-line, .tmpConnection {
      fill: none;
      stroke: #888;
      stroke-width: 2;
      stroke-dasharray: 5,5;
      marker-end: url(#marker-triangle);
      pointer-events: none;
    }

    .connection-outline {
      fill: none;
      stroke: red;
      stroke-width: 50;
      stroke-opacity: 0.01;
      pointer-events: all;
      cursor: pointer;
    }

    .connection-outline:hover {
      opacity: 0.01;
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

.range-timeSlice {
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
