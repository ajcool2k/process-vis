<template>
  <div class="timeline" @click="onTimelineClick">

    <dialog-connection ref="dialog-connection" v-on:updateConnection="onCloseRemoveConnectionDialog"></dialog-connection>
    <axis-x class="ignore-container-events" :process="processModel" :scale="containerScale" :width="(containerSize.x / processModel.mDelegates.length)" v-on:closeDialog="onCloseDelegateDialog"></axis-x>
    <axis-y ref="axis-y" class="ignore-container-events" :delegates="processModel.mDelegates" :processes="processModel.children" :timeFormat="timeFormat" :itemSize="itemSize" :scale="containerScale" :containerSize="containerSize"></axis-y>

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

      <!-- draw Processes -->
      <template v-if="item._width" v-for="item in processModel.children">
        <g :key="item.id + '-process'" :class="'process draggable drag-drop event-' + item._increased + ''" :data-id="item.id" @click.stop="onProcessClick">
          <rect :class="'process-content has-child-' + (item.children.length > 0)" :data-id="item.id" :height="item._drawHeight" :width="item._width">
            <title>Name: {{ item.mName }} ({{ item.id }})</title>
          </rect>
          <circle class="process-anchor" :data-id="item.id" @click.stop="onCircleClick" :r="Math.min(item._drawHeight, 10)" :cy="Math.max(item._drawHeight - 15, 0)" :cx="(item._width / 2 )"></circle>
          <text class="process-text" :data-id="item.id" :x="(item._width / 2)" :y="getIconPosition(item._drawHeight, 60)">{{ shortName(item.name) }}</text>

          <g :data-process="item.id">
            <rect class="proces-transform" :data-id="item.id" :x="(item._width - 20)" y="1" :height="getIconPosition(item._drawHeight, 30)" width="20" @click.stop="onTransformationClick">
              <title>Prozess-Transformation: {{item.transformation.mName}}</title>
            </rect>
            <text class="process-transform-text" :x="(item._width - 11)" y="20">{{item.transformation.mType}}</text>
          </g>
          <g :data-process="item.id" v-if="item.participation !== 'closed'">
            <rect class="process-participation" :data-id="item.id" :x="(item._width - 20)" :y="getIconPosition(item._drawHeight, 30)"  :height="getIconPosition(item._drawHeight, 29)" width="20" @click.stop="onParticipationClick">
              <title>Beteiligungsmöglichkeit: {{item.participation}}</title>
            </rect>
            <use class="process-participation-icon" :x="(item._width - 20)" :y="getIconPosition(item._drawHeight, 30)" xlink:href="#icon-people" />
          </g>

          <rect v-if="item._increased" class="event-line" :data-id="item.id" :height="10" y="-5" :width="item._width"></rect>
        </g>
      </template>

      <template v-for="item in processModel.children">
          <path v-if="item.connection.from.length > 0" :key="item.id + '-input'" :data-id="item.id" class="input-triangle" d="" />
      </template>

      <line class="timeRuler" />
    </svg>
  </div>
</template>

<script>
import interact from 'interactjs'

import AxisX from './AxisX.vue'
import AxisY from './AxisY.vue'

import { Path } from '@/classes/ui/Path'
import { StateMachine } from '@/classes/utils/StateMachine'
import { Animate } from '@/classes/utils/Animate'
import { Events } from '@/classes/utils/Events'
import { Calc } from '@/classes/utils/Calc'
import { Helper } from '@/classes/utils/Helper'
import DialogConnection from './dialog/DialogConnection.vue'

export default {
  name: 'Timeline',
  components: {
    'axis-x': AxisX,
    'axis-y': AxisY,
    'dialog-connection': DialogConnection
  },
  props: [
    'processModel',
    'timeFormat',
    'itemSize',
    'containerSize',
    'containerScale',
    'containerTranslation',
    'containerOffset',
    'actionPosition',
    'mousePosition'
  ],
  data: function () {
    return {
      domNode: null,
      htmlNode: null,
      xAxisNode: null,
      yAxisNode: null,
      svgNode: null,

      fsm: null, // finite state machine

      actions: {
        drawingMode: false
      },

      actionId: null,
      timeRuler: null,
      tmpLine: null,

      clickCounts: {
        process: 0
      }
    }
  },

  created: function () {
    console.log('Timeline created')

    this.initStateMachine()

    // detect escape
    Events.escapeDetection(this.onEscape)
  },

  destroyed: function () {
  },

  mounted: function () {
    console.log('Timeline mounted')

    this.htmlNode = document.querySelector('html')
    this.domNode = document.querySelector('.timeline')
    this.xAxisNode = this.domNode.querySelector('.axis-x')
    this.yAxisNode = this.domNode.querySelector('.axis-y')
    this.svgNode = this.domNode.querySelector('.svgNode')
    this.tmpLine = this.svgNode.querySelector('.tmpConnection')
    this.timeRuler = this.svgNode.querySelector('.timeRuler')

    interact('.delegate').unset()
    interact('.process rect.process-content').unset()
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
          restriction: this.svgNode,
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
        this.fsm.run('onProcessDragend', event)
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
          event.relatedTarget.classList.remove('process-drop')
        },
        ondropdeactivate: function (event) {
          // remove active dropzone feedback
          event.target.classList.remove('drop-active')
          event.target.classList.remove('pariticipant-drop')
        }
      })
  },

  updated: function () {
    console.log('Timeline updated')
    Animate.clear()
  },

  methods: {
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

      this.$refs['axis-y'].drawAxis() // redraw axis
      this.initRuler()
    },

    redrawProcessPosition (process) {
      let source = this.svgNode.querySelector('.process[data-id="' + process.id + '"]')

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
      if (typeof process === 'string') process = this.processModel.getChild(process)

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
        name: ['onTimelineClick', 'onEscape'],
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
          let processSource = this.processModel.getChild(sourceId)
          let processTarget = this.processModel.getChild(targetId)
          processSource.addConnectionTo(processTarget)

          this.actions.drawingMode = false
          this.tmpLine.removeAttribute('d')
          this.svgNode.classList.remove('tmpConnection-active')

          // reset anchor
          let anchor = this.svgNode.querySelector('circle[data-id="' + sourceId + '"]')
          anchor.classList.remove('active')
        }
      })

      // Process
      this.fsm.addEvent(idle, resizeProcess, {
        name: 'onProcessResizestart',
        action: (event) => {
          let processId = event.target.getAttribute('data-id')
          let process = this.svgNode.querySelector('.process-content[data-id="' + processId + '"]')
          let sourceRect = Calc.absolutePosition(process, this.containerTranslation)
          let verticalPoint = sourceRect.top - this.containerOffset.top + sourceRect.height

          this.timeRuler.setAttribute('data-y', verticalPoint)
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
          let process = this.processModel.getChild(processId)

          // calculate new endDate
          let dy = event.pageY - event.y0
          let resizeDelta = { y: Math.floor(dy / this.containerScale.y) }
          let factor = (process._height + resizeDelta.y) / process._height

          // update end date
          let updateEndDate = Calc.updateEndDate(process, factor, this.timeFormat)
          if (updateEndDate === false) return

          // update height in view
          process._height += resizeDelta.y
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

          let draggableElement = event.target
          let dropzoneElement = event.relatedTarget

          let data = {
            processId: Helper.parse(draggableElement.getAttribute('data-id')),
            delegateId: Helper.parse(dropzoneElement.getAttribute('data-id'))
          }

          // change start date on y change
          let dy = event.pageY - event.y0
          let diffItemSize = Math.round(dy / this.itemSize)

          let process = this.processModel.getChild(data.processId)

          if (Math.abs(diffItemSize) > 0) {
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
              case 'years':
                process.mStart.setFullYear(process.mStart.getFullYear() + diffItemSize)
                if (hasEndDate) process.mEnd.setFullYear(process.mEnd.getFullYear() + diffItemSize)
                break
              case 'hours':
                process.mStart.setHours(process.mStart.getHours() + diffItemSize)
                if (hasEndDate) process.mEnd.setHours(process.mEnd.getHours() + diffItemSize)
                break
            }

            process.mStart = Calc.roundDate(process.mStart, this.timeFormat)
            if (hasEndDate) process.mEnd = Calc.roundDate(process.mEnd, this.timeFormat)
          }

          // move process
          process.mInitiator = data.delegateId
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
          this.$emit('openProcess', { id: event.target.getAttribute('data-id')})
        }
      })

      this.fsm.addEvent(idle, showDialog, {
        name: [ 'onTransformationClick', 'onParticipationClick', 'onConnectionClick' ],
        action: (event) => {
        }
      })

      this.fsm.addEvent(showDialog, idle, {
        name: [ 'onEscape', 'onCloseDialog' ],
        action: (event) => {}
      })

      this.fsm.start(idle)
    },

    updateTimeAxis () {
      this.updateAxisPosition()
    },

    updateAxisPosition() {
      let containerPos = this.domNode.getBoundingClientRect()

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

    updateConnection (con) {
      // console.log('updateConnection', con)

      let connectionGroup = this.svgNode.querySelector('.connection[data-id="' + con.id + '"]')
      let line = connectionGroup.querySelector('.connection-line[data-id="' + con.id + '"]')
      let outline = connectionGroup.querySelector('.connection-outline[data-id="' + con.id + '"]')

      // ----------------------------------------------
      // source könnte ausgelagert werden, aber nicht performance kritisch
      let source = this.svgNode.querySelector('.process-content[data-id="' + con.source + '"]')
      let target = this.svgNode.querySelector('.process-content[data-id="' + con.target + '"]')

      let sourceRect = Calc.absolutePosition(source, this.containerTranslation) // forces reflow
      let targetRect = Calc.absolutePosition(target, this.containerTranslation) // forces reflow

      let processInput = this.svgNode.querySelector('.input-triangle[data-id="' + con.target + '"]')
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
      processInput.setAttribute('d', Path.createPolyline([targetAnchor, targetPoint]))
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

    onCircleClick (event) {
      if (!this.fsm.hasEvent('onCircleClick')) return
      this.fsm.run('onCircleClick')

      event.preventDefault()

      let source = event.target
      let sourceRect = Calc.absolutePosition(source, this.containerTranslation) // forces reflow

      let sourcePoint = {
        x: Math.round((sourceRect.left + (sourceRect.width / 2) - this.containerOffset.left) / this.containerScale.x),
        y: Math.round((sourceRect.top + (sourceRect.height / 2) - this.containerOffset.top) / this.containerScale.y)
      }

      this.actionPosition.x = sourcePoint.x
      this.actionPosition.y = sourcePoint.y

      let processId = event.target.getAttribute('data-id')
      this.tmpLine.setAttribute('data-id', processId)
      this.svgNode.classList.add('tmpConnection-active')

      // set anchor to active class
      let anchor = this.svgNode.querySelector('circle[data-id="' + processId + '"]')
      anchor.classList.add('active')
      this.actions.drawingMode = true
    },

    onCloseDelegateDialog (data) {
      console.log('onCloseDelegateDialog called')
      switch (data.response) {
        case 'update':
          break
        case 'remove':
          this.removeDelegate(data.id)
          break
      }
    },

    drawLine () {
      if (this.actions.drawingMode === false) return // escape if mode got disabled meanwhile

      this.tmpLine.setAttribute('d', Path.createPolyline([this.actionPosition, this.mousePosition]))
      Events.scheduledAnimationFrame['drawLine'] = false
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

    removeDelegate (delegateId) {
      console.log('remove Delegate', delegateId)

      if (typeof delegateId !== 'string') {
        console.warn('Could not remove delegate, id missing')
        return
      }

      // check if id exists
      let found = this.processModel.mDelegates.filter(elem => elem === delegateId)
      if (found.length < 1) {
        console.warn('Could not remove delegate, id not found')
        return
      }

      // avoid if child processes are on this Delegate to keep them in container
      let used = this.processModel.children.filter(elem => elem.initiator === delegateId)

      if (used.length > 0) {
        console.warn('Could not remove Delegate, there are still processes applied')
        return
      }

      // avoid if only one Delegate is left
      if (this.processModel.mDelegates.length < 1) {
        console.warn('Could not remove more Delegates')
        return
      }

      // remove id from model
      this.processModel.removeDelegate(delegateId)
    },

    trackMousePosition (event) {
      if (this.actions.drawingMode === true) {
        Events.debounce(this.drawLine, 'drawLine')
      }
    },

    trackTouchPosition (event) {
      if (this.actions.drawingMode === true) {
        Events.debounce(this.drawLine, 'drawLine')
      }
    },

    onConnectionClick (event) {
      if (!this.fsm.hasEvent('onConnectionClick')) return
      this.fsm.run('onConnectionClick', event)

      let connectionId = event.target.getAttribute('data-id')
      this.actionId = event.target.getAttribute('data-id')

      let con = Helper.connectionParse(connectionId)
      let processFrom = this.processModel.getChild(con.source)
      let processTo = this.processModel.getChild(con.target)
      this.$refs['dialog-connection'].open(con, processFrom, processTo)
    },

    onEscape () {
      console.log('onEscape')

      if (!this.fsm.hasEvent('onEscape')) return
      this.fsm.run('onEscape')
    },

    resetCuror () {
      this.htmlNode.style.cursor = null
    },

    getIconPosition (processHeight, maxHeight) {
      let h = processHeight / 2

      if (typeof maxHeight === 'undefined') return h

      return h > maxHeight ? maxHeight : h
    },

    onTimelineClick (event) {
      this.resetCuror()

      if (!this.fsm.hasEvent('onTimelineClick')) return
      this.fsm.run('onTimelineClick')
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

    removeConnection (connectionId) {
      console.log('remove Connection: ' + connectionId)
      let con = Helper.connectionParse(connectionId)
      let processFrom = this.processModel.getChild(con.source)
      let processTo = this.processModel.getChild(con.target)

      processFrom.removeConnectionTo(processTo)
    },

    onParticipationClick (event) {
      console.warn('onParticipationClick')
      if (!this.fsm.hasEvent('onParticipationClick')) return
      this.fsm.run('onParticipationClick', event)

      let processId = event.target.parentNode.getAttribute('data-process')
      let process = this.processModel.getChild(processId)

      if (typeof process === 'undefined') {
        console.warn('Could not find process for id ' + processId)
        return
      }

      this.$emit('openProcess', { id: processId })
    },

    onCloseRemoveConnectionDialog (data) {
      if (!this.fsm.hasEvent('onCloseDialog')) return
      this.fsm.run('onCloseDialog')

      switch (data.response) {
        case 'update':
          break
        case 'remove':
          this.removeConnection(data.id)
          break
      }
    },

    onTransformationClick (event) {
      console.warn('onTransformationClick')
      if (!this.fsm.hasEvent('onTransformationClick')) return
      this.fsm.run('onTransformationClick', event)

      let processId = event.target.parentNode.getAttribute('data-process')
      let process = this.processModel.getChild(processId)

      if (typeof process === 'undefined') {
        console.warn('Could not find process for id ' + processId)
        return
      }

      this.$emit('openProcess', { id: processId, tab: 5 })
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

    shortName (text) {
      return Helper.shortName(text, true, 4)
    },

    stateEvent (eventName) {
      this.fsm.run(eventName)
    }
  }
}
</script>

<style lang="scss" scoped>
$primaryColor: #3f51b5;
$secondayColor: #29e;
$accepntColor: #e91e63;
$bgColor: #eee;

.timeline {
  position: relative;
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;

  .axis-x  {
    margin-top: -55px;
    z-index: 4;
    background-color:rgba(238, 238, 238, 0.7);
  }

  .axis-y  {
    margin-left: -105px;
    z-index: 3;
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
      opacity: 0.7;

      &.event-true {
        .process-content {
          fill-opacity: 0.4
        }

        .event-line {
          fill: $accepntColor
        }
      }

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
        touch-action: none;

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

    .input-triangle, .tmpConnection {
      fill: none;
      stroke-width: 3;
      marker-end: url(#marker-triangle);
      pointer-events: none;
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
}
</style>
