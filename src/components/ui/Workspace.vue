<template>
  <div id="vue-workspace">

    <!-- child component -->
    <tool-bar :containerScale="containerScale" v-on:applyZoom="applyZoom"></tool-bar>

    <div class="workspace">
     
      <md-dialog-confirm
        :md-title="dialog.removeEdgeDialog.title"
        :md-content-html="dialog.removeEdgeDialog.contentHtml"
        :md-ok-text="dialog.removeEdgeDialog.ok"
        :md-cancel-text="dialog.removeEdgeDialog.cancel"
        @close="onCloseRemoveEdgeDialog"
        ref="removeEdgeDialog">
      </md-dialog-confirm>

      <md-dialog-alert
        :md-content-html="dialog.showNodeDialog.content"
        :md-ok-text="dialog.showNodeDialog.ok"
        @close="onCloseShowNodeDialog"
        ref="showNodeDialog">
      </md-dialog-alert>

      <div class="processContainer" @click="onContainerClick" @touchmove.passive="trackTouchPosition" @mousemove.passive="throttle(trackMousePosition, 50)">
        <!-- child component -->
        <horizontal-bar :cols="processModel.cols" v-on:laneChange="applyLaneChange"></horizontal-bar>

        <template v-for="(item, index) in processModel.cols">
          <div :class="'col col' + index" :data-id="item.id" :style="'width: ' + ( containerSize.x / processModel.cols.length ) + 'px'">
          </div>
        </template>

        <template v-for="(item, index) in processModel.shapes">
          <div class="shape draggable drag-drop" 
                :data-id="item.id"  
                @click.stop="onShapeClick">
            <div class="content" :data-id="item.id">{{item.id}}</div>
            <div class="anchor" :data-id="item.id" @click.stop="activateEdgeConnect"></div>
        </div>
        </template>

        <svg class="svgNode">
          <marker id="triangle"
            viewBox="0 0 10 10" refX="0" refY="5" 
            markerUnits="strokeWidth"
            markerWidth="4" markerHeight="3"
            orient="auto">
            <path d="M 0 0 L 10 5 L 0 10 z" />
          </marker>

          <template v-for="(item, index) in processModel.edges">
            <polyline @click.stop="openRemoveConnectionDialog" class="connection" :data-id="item.id" points="" />
          </template>
          <polyline class="tmpConnection" points="" />
        </svg>
      </div>
    </div>    
  </div>
</template>

<script>

import Vue from 'vue'
import 'vue-material/dist/vue-material.css'

import VueMaterial from 'vue-material'
Vue.use(VueMaterial);

/*
import { MdCore, MdDialog, MdBackdrop } from 'vue-material'
Vue.use(MdCore);
Vue.use(MdDialog);
Vue.use(MdBackdrop);
*/

// Child components
import ToolBar from './ToolBar.vue';
import HorizontalBar from './HorizontalBar.vue';

import { Project } from '@/classes/Project';
import { Process } from '@/classes/Process';
import { Participant } from '@/classes/Participant';

import { interact } from 'interactjs';
import { _ } from 'underscore';

import { Dialog } from '@/classes/ui/Dialog';
import { StateMachine } from '@/classes/utils/StateMachine';
import { TouchSupport } from '@/classes/utils/TouchSupport';
import { Events } from '@/classes/utils/Events';
import { Calc } from '@/classes/utils/Calc';
import { Data } from '@/classes/utils/Data';
import { Helper } from '@/classes/utils/Helper';


export default {
  name: 'Workspace',
  components: {
    'tool-bar': ToolBar,
    'horizontal-bar' : HorizontalBar,
  },
  props: [ 'processModel' ],
  data: function() {
      return {
        fsm: null,  // finite state machine

        workspaceNode: null,
        workspaceSize: {x: 1000, y: 1000 },
        
        containerNode: null,
        containerSize: {x: 1000, y: 600 },

        containerOffset: null,
        containerTranslation: { x: 0, y: 0 },
        containerScale: { x: 1.0, y: 1.0 },
        svgNode: null,

        tmpLine: null,

        actions: {
          drawingMode: false
        },

        actionPosition: { x: 0, y: 0 },
        mousePosition: {x: 0, y:0},
        actionId: null,
        
        time: Date.now(),
        fireCounter: 0,

        // Options
        options: {
          isContainerDraggable: true,
          isContainerResizeable: true,
        },

        // Dialogs
        dialog: Dialog.useAll(),

        // Support
        hasTouchSupport: false,

        // Interval
        zoomInt: 0
        
      }
  },

  created: function() {
    console.log("Worspace created");  

    this.initStateMachine();

    // check support
    this.hasTouchSupport = TouchSupport.hasSupport();
    if (this.hasTouchSupport) TouchSupport.init();
    
    console.info("touch support: " + this.hasTouchSupport);

    window.addEventListener('scroll', this.onScroll, true);
    window.addEventListener('resize', this.onResize, true);
  },

  destroyed: function() {
    console.log("destroyed");
    window.removeEventListener('scroll', this.onScroll);
    window.removeEventListener('resize', this.onResize);
    
  },

  mounted: function() {
    console.log("Workspace mounted");

    // cache DOM
    this.workspaceNode = document.querySelector(".workspace");
    this.containerNode = this.workspaceNode.querySelector(".processContainer");
    this.svgNode = this.containerNode.querySelector('svg.svgNode');
    this.tmpLine = this.svgNode.querySelector('.tmpConnection');

    // prepare Container and Workspace
    Calc.shapePosition(this.processModel.shapes, this.processModel.cols, this.containerSize, this.containerNode); // set position on the model
    this.containerSize = Calc.containerSize(this.processModel.shapes, this.processModel.cols);  // calc layout based on model
    this.updateContainerSize(); // apply model - forces reflow
    this.workspaceSize = { x: this.containerOffset.width + 100,  y: this.containerOffset.height + 100 }
    this.updateWorkspaceSize(); // forces reflow
        

    // remove existing event handlers
    interact('.processContainer').unset();
    interact('.col').unset();
    interact('.shape').unset();

    // add new event handlers
    interact('.processContainer')
      .draggable({})
      .on('dragstart', event => {
        console.warn("dragstart container");
        this.actionPosition = { x: event.pageX, y: event.pageY };
      })         
      .on('dragmove', this.onContainerDrag)
      .on('dragend', event => {
        console.warn("dragend container");
        this.updateWorkspaceSize({ x: event.pageX - this.actionPosition.x, y: event.pageY - this.actionPosition.y }); // forces reflow
      })         
      .resizable({
        preserveAspectRatio: false,
        edges: { left: true, right: true, bottom: true, top: true }
      })
      .on('resizestart', event => {
        console.log("resizestart");
        this.actionPosition = { x: event.pageX, y: event.pageY };
      })  
      .on('resizemove', this.onContainerResize)
      .on('resizeend', event => {
        console.log("resizeend");
        let dragDelta = { x: event.pageX - this.actionPosition.x, y: event.pageY - this.actionPosition.y };
        this.updateContainerSize(dragDelta); // forces reflow
        this.updateWorkspaceSize(dragDelta);  // forces reflow
      });

    interact('.shape')
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
        console.warn("dragstart shape");
        if (!this.fsm.hasEvent("dragstart")) return;
        this.fsm.run("dragstart");

      })      
      .on('dragmove', this.onShapeDrag)
      .on('dragend',  event => {
        console.warn("dragend shape");
        if (!this.fsm.hasEvent("dragend")) return;
        this.fsm.run("dragend");

        // store drag movement in model
        let shapeId = event.target.getAttribute("data-id");
        let shape = _.findWhere(this.processModel.shapes, {id: shapeId});
        let x = (parseFloat(event.target.getAttribute('data-x')) || 0);
        let y = (parseFloat(event.target.getAttribute('data-y')) || 0);        
        shape.position = { x: x, y: y };     
      })
      .resizable({
        preserveAspectRatio: false,
        restrict: { /* restrict options */ },
        edges: { left: true, right: true, bottom: true, top: true }
      })
      .on('resizestart', event => {
        if (!this.fsm.hasEvent("resizestart")) return;
        this.fsm.run("resizestart");
      })      
      .on('resizemove', event => {
        this.resizeElement(event);
        let shapeId = event.target.getAttribute("data-id");

        // update connections of the shape
        this.redrawConnection(shapeId)
      })
      .on('resizeend', event => {
        if (!this.fsm.hasEvent("resizeend")) return;
        this.fsm.run("resizeend");
      });      

    interact('.col')
      .dropzone({
      // only accept elements matching this CSS selector
      accept: '.shape',
      // Require a 75% element overlap for a drop to be possible
      overlap: 0.75,

      // listen for drop related events:

      ondropactivate: function (event) {
        // add active dropzone feedback
        event.target.classList.add('drop-active');
      },
      ondragenter: function (event) {
        var draggableElement = event.relatedTarget,
            dropzoneElement = event.target;

        // feedback the possibility of a drop
        dropzoneElement.classList.add('lane-drop');
        draggableElement.classList.add('shape-drop');
        //draggableElement.textContent = 'Dragged in';
      },
      ondragleave: function (event) {
        // remove the drop feedback style
        event.target.classList.remove('lane-drop');
        event.relatedTarget.classList.remove('shape-drop');
        //event.relatedTarget.textContent = 'Dragged out';
      },
      ondrop: event => {

        if (!this.fsm.hasEvent("onShapeDrop")) return;
        this.fsm.run("onShapeDrop", event);
        event.relatedTarget.classList.remove('shape-drop');

      },
      ondropdeactivate: function (event) {
        // remove active dropzone feedback
        event.target.classList.remove('drop-active');
        event.target.classList.remove('lane-drop');
      }
    });

  },

  updated: function() {
    console.warn("Workspace updated");
    console.log(this.processModel);
    Calc.shapePosition(this.processModel.shapes, this.processModel.cols, this.containerSize, this.containerNode);
    this.redraw();
  },

  methods: { 

    initStateMachine() {
      this.fsm = new StateMachine();

      let idle = this.fsm.addState("idle");

      // Edges
      let drawEdge = this.fsm.addState("drawEdge");
      let connectEdge = this.fsm.addState("connectEdge");

      // Shapes
      let dragShape = this.fsm.addState("dragShape");
      let droppedShape = this.fsm.addState("droppedShape");

      let resizeShape = this.fsm.addState("resizeShape");
      let resizeShapeFinished = this.fsm.addState("resizeShapeFinished");

      // Dialogs
      let showProcess = this.fsm.addState("showProcess");
      let showRemoveEdge = this.fsm.addState("showRemoveEdge");

      this.fsm.addEvent(idle, drawEdge, { 
          name: 'activateEdgeConnect',
          action: (event) => {}
      });      

      this.fsm.addEvent(drawEdge, idle, { 
          name: 'onContainerClick',
          action: (event) => {}
      });      

      this.fsm.addEvent(drawEdge, idle, { 
          name: 'onShapeClick',
          action: (event) => {
            let source = this.tmpLine;
            let sourceId = source.getAttribute("data-id");
            let target = event.target;
            let targetId = target.getAttribute("data-id");

            // add to model
            this.addConnection(sourceId, targetId);
            this.resetActions();
          }
      });      

      this.fsm.addEvent(idle, resizeShape, { 
          name: 'resizestart',
          action: (event) => {
          }
      });      

      this.fsm.addEvent(resizeShape, resizeShapeFinished, { 
          name: 'resizeend',
          action: (event) => {
          }
      });      

      this.fsm.addEvent(resizeShapeFinished, idle, { 
          name: 'onShapeClick',
          action: (event) => {
          }
      });      


      this.fsm.addEvent(idle, dragShape, { 
          name: 'dragstart',
          action: (event) => {
          }
      });      

      this.fsm.addEvent(dragShape, droppedShape, { 
          name: 'onShapeDrop',
          action: (event) => {
            let draggableElement = event.relatedTarget;
            let dropzoneElement = event.target;
            let data = {
              shapeId: Helper.parse(draggableElement.getAttribute('data-id')),
              laneId: Helper.parse(dropzoneElement.getAttribute('data-id')),
            }
            this.$emit('moveNode', data);
          }
      });      

      this.fsm.addEvent(droppedShape, idle, { 
          name: 'onShapeClick',
          action: (event) => {
          }
      });      

      this.fsm.addEvent(idle, showProcess, { 
          name: 'onShapeClick',
          action: (event) => {
            this.actionId = event.target.getAttribute('data-id');
            let p = _.findWhere(this.processModel.shapes, { id: Helper.parse(this.actionId) });
            Dialog.setNodeDialog(p);
            this.$refs['showNodeDialog'].open();
          }
      });      

      this.fsm.addEvent(showProcess, idle, { 
          name: 'onCloseShowNodeDialog',
          action: (event) => {}
      });      

      this.fsm.addEvent(idle, showRemoveEdge, { 
          name: 'openRemoveConnectionDialog',
          action: (event) => {
          }
      });      

      this.fsm.addEvent(showRemoveEdge, idle, { 
          name: 'onCloseRemoveEdgeDialog',
          action: (event) => {}
      });


      this.fsm.start(idle);

    },

    addConnection(sourceId, targetId) {
      console.warn("addConnection");

      // accept strings as well
      sourceId = Helper.parse(sourceId);
      targetId = Helper.parse(targetId);;
      
      // avoid duplicate connections
      if (_.findWhere(this.processModel.edges, {source: sourceId, target: targetId})) {
        console.warn("skipped new connection, it is already present");
        return;
      }

      // update model
      let edge = {
        source: sourceId,
        target: targetId
      };
      this.$emit('addConnection', edge);
    },

    removeConnection(edgeId) {
      console.log("remove Edge: " + edgeId);
      this.$emit('removeConnection', edgeId);
    },

    redraw() {
      console.warn("redraw");

      this.processModel.shapes.forEach(shape => {
        // draw shape at correct position
        this.redrawShapePosition(shape);
        // draw connection
        this.redrawConnection(shape);
      });

    },

    redrawShapePosition(shape) {

      let source = this.containerNode.querySelector('.shape[data-id="'+ shape.id +'"]');

      let storedX = Helper.parse(source.getAttribute("data-x"));
      let storedY = Helper.parse(source.getAttribute("data-y"));

      if (storedX === shape.position.x && storedY === shape.position.y) {
        console.log("shape position not changed - skipping");
        return;
      }

      // store position
      source.setAttribute("data-x", shape.position.x);
      source.setAttribute("data-y",  shape.position.y);

      // transform
      source.style.webkitTransform =
      source.style.transform = 'translate(' + shape.position.x + 'px ,' + shape.position.y + 'px)';
    },

    redrawConnection(shape) {

      if (typeof shape === 'string') shape = _.findWhere(this.processModel.shapes, {id: shape});

      let conSources = _.where(this.processModel.edges, {source: shape.id});
      let conTargets = _.where(this.processModel.edges, {target: shape.id});
      
      let cons = _.union(conSources, conTargets);
      
      cons.forEach(edge => {
        this.updateConnection(edge);
      });
    },

    updateConnection(edge) {
      // console.log("updateConnection");
      
      let line = this.svgNode.querySelector('.connection[data-id="'+ edge.id +'"]');

      // ----------------------------------------------
      // source könnte ausgelagert werden, aber nicht performance kritisch
      let source = this.containerNode.querySelector('.shape[data-id="'+ edge.source +'"]');
      let target = this.containerNode.querySelector('.shape[data-id="'+ edge.target +'"]');

      let sourceRect = Calc.absolutePosition(source);  // forces reflow
      let targetRect = Calc.absolutePosition(target);  // forces reflow
      // ----------------------------------------------

      let markerOffset = 2;
      let anchorOffset = 20;

      let sourcePoint = {
        x: Math.round((-this.containerTranslation.x - this.containerOffset.left + sourceRect.left + sourceRect.width / 2) / this.containerScale.x),
        y: Math.round((-this.containerTranslation.y - this.containerOffset.top + sourceRect.bottom) / this.containerScale.y)
      }

      let targetPoint = {
        x: Math.round((-this.containerTranslation.x - this.containerOffset.left + targetRect.left + targetRect.width / 2) / this.containerScale.x),
        y: Math.round((-this.containerTranslation.y - this.containerOffset.top - markerOffset + targetRect.top) / this.containerScale.y)
      }

      let Offset = 0; // (sourcePoint.x < targetPoint.x) ? -20 : 0;

      let sourceAnchor = {
        x: sourcePoint.x,
        y: sourcePoint.y + Math.max( Math.round((targetPoint.y - sourcePoint.y) / 2), anchorOffset )
      }

      let targetAnchor = {
        x: targetPoint.x, 
        y: targetPoint.y - Math.max( Math.round((targetPoint.y - sourcePoint.y) / 2), anchorOffset ) + Offset
      }

      let middlePoint1 = {
        x: sourcePoint.x + (Math.round((targetPoint.x - sourcePoint.x) / 2) + Offset),
        y: sourceAnchor.y
      }

      let middlePoint2 = {
        x: targetPoint.x - (Math.round((targetPoint.x - sourcePoint.x) / 2) - Offset),
        y: targetAnchor.y
      }

      line.setAttribute("points", 
         sourcePoint.x + "," + sourcePoint.y + " " +
        sourceAnchor.x + "," + sourceAnchor.y + " " + 
        middlePoint1.x + "," + middlePoint1.y + " " + 
        middlePoint2.x + "," + middlePoint2.y + " " + 
        targetAnchor.x + "," + targetAnchor.y + " " + 
         targetPoint.x + "," + targetPoint.y
        );
    },

    activateEdgeConnect(event) {
      if (!this.fsm.hasEvent("activateEdgeConnect")) return;
      this.fsm.run("activateEdgeConnect");

      event.preventDefault();
      
      console.log("activateEdgeConnect: " + event.type);

      let source = event.target;
      let sourceRect = Calc.absolutePosition(source); // forces reflow

      let sourcePoint = { 
        x: Math.round((-this.containerTranslation.x + sourceRect.left + (sourceRect.width / 2) - this.containerOffset.left) / this.containerScale.x),
        y: Math.round((-this.containerTranslation.y + sourceRect.top + (sourceRect.height / 2) - this.containerOffset.top) / this.containerScale.y)
      }
      
      this.actionPosition = sourcePoint;
      this.tmpLine.setAttribute("data-id", event.target.getAttribute('data-id'));

      this.actions.drawingMode = true;      
    },

    trackMousePosition(event) {
      // console.log("trackMousePosition");

      this.mousePosition.x = Math.round((event.pageX - this.containerTranslation.x - this.containerOffset.left) / this.containerScale.x);
      this.mousePosition.y = Math.round((event.pageY - this.containerTranslation.y - this.containerOffset.top) / this.containerScale.y);
      // console.log(this.mousePosition.x + ":" + this.mousePosition.y);

      if (this.actions.drawingMode === true) {
        Events.debounce(this.drawLine, "drawLine");
      }
    },

    trackTouchPosition(event) {
      // console.log("trackTouchPosition");
      event.preventDefault();

      let touch = event.touches[0];

      this.mousePosition.x = Math.round((touch.pageX - this.containerTranslation.x - this.containerOffset.left) / this.containerScale.x);
      this.mousePosition.y = Math.round((touch.pageY - this.containerTranslation.y - this.containerOffset.top) / this.containerScale.y);
      // console.log(this.mousePosition.x + ":" + this.mousePosition.y);

      if (this.actions.drawingMode === true) {
        // console.log("drawingMode 2");
        Events.debounce(this.drawLine, "drawLine");
      }

    },

    drawLine() {

      if (this.actions.drawingMode === false) return; // escape if mode got disabled meanwhile

      /*
      console.log("connecto from: x=" + this.actionPosition.x + ", y=" + this.actionPosition.y);
      console.log("connecto from: x=" + this.mousePosition.x + ", y=" + this.mousePosition.y);
      console.log(this.tmpLine);
      */
      
      this.tmpLine.setAttribute("points", 
          this.actionPosition.x + "," + this.actionPosition.y + " " +
          this.mousePosition.x + "," + this.mousePosition.y
        );
      // console.log("works!!");
      Events.scheduledAnimationFrame["drawLine"] = false;
    },

    throttle(fn, wait) {
      this.time = Events.throttle(fn, wait, this.time);
    },

    detectFireRate() {
      console.log("detectFireRate");
      Events.detectFireRate(1000);
    },

    resetActions() {
      console.log("resetActions");
      for (const key of Object.keys(this.actions)) {
          this.actions[key] = false;
      }

      let caller = event.srcElement ? event.srcElement : "unknown";
      let eventType = event ? event.type : "unknown";
      
      if (this.tmpLine) {
        console.log("resetActions -> " + caller + " " + eventType);
        this.tmpLine.removeAttribute("points");
      }
    },
    
    updateContainerSize(dragDelta) {
      let delta = dragDelta ? dragDelta : {x:0, y:0}; 

      this.containerSize = { x: this.containerSize.x + delta.x, y: this.containerSize.y + delta.y };
      
      this.containerNode.style.width = this.containerSize.x + "px"; // forces reflow
      this.containerNode.style.height = this.containerSize.y + "px"; // forces reflow
      this.containerOffset = Calc.absolutePosition(this.containerNode); // forces reflow

    },

    updateWorkspaceSize(dragDelta) {
      console.log("updateWorkspaceSize");

      let delta = dragDelta ? dragDelta : {x:0, y:0}; 

      this.workspaceSize = { x: this.workspaceSize.x + delta.x, y: this.workspaceSize.y + delta.y };
      let width = Math.round(this.containerScale.x * this.workspaceSize.x);
      let height = Math.round(this.containerScale.x * this.workspaceSize.y);

      let displayValue = this.workspaceNode.style.display;
      this.workspaceNode.style.display = 'none';        // avoid reflows by multiple style changes
      this.workspaceNode.style.width =  width+ "px";
      this.workspaceNode.style.height = height + "px";
      this.workspaceNode.style.display = displayValue;  // set active again
    },

    applyTransform() {
        console.log("applyTransform");

        let transformTranslate =  "translate(" + this.containerTranslation.x + "px, " + this.containerTranslation.y + "px)";
        let transformScale =  "scale(" + this.containerScale.x + "," + this.containerScale.y + ")";
        this.containerNode.style.webkitTransform =
        this.containerNode.style.transform = transformTranslate + " " + transformScale;
        
        this.updateWorkspaceSize();
    },

    translate(dx, dy) {
      this.containerTranslation = {x: this.containerTranslation.x + dx, y: this.containerTranslation.y + dy};
    },

    scale(multX, multY) {
      if (multX == 0 || multY == 0) {
        console.warn("scalefactor 0 not allowed");
        return; 
      }

      this.containerScale = {x: this.containerScale.x * multX, y: this.containerScale.y * multY};
    },

    // Listener for horizontal-bar emits
    applyLaneChange(laneData) {
      switch(laneData) {
        case 'add':
            this.$emit('addLane');
            return;
        case 'remove':
            this.$emit('removeLane');
            return;
        default:
          console.warn("laneData has unexpected information");
      }
    },

    // Listener for tool-bar emits
    applyZoom(scaleData) {
      this.containerScale = scaleData;
      this.applyTransform();
    },

    onContainerClick() {
      console.log("onContainerClick");
      if (!this.fsm.hasEvent("onContainerClick")) return;
      this.fsm.run("onContainerClick");

      this.resetActions();
    },

    openRemoveConnectionDialog(event) {

      if (!this.fsm.hasEvent("openRemoveConnectionDialog")) return;
      this.fsm.run("openRemoveConnectionDialog", event);

      this.actionId = event.target.getAttribute('data-id');
      this.$refs['removeEdgeDialog'].open();
    },

    onCloseRemoveEdgeDialog(type) {

      if (!this.fsm.hasEvent("onCloseRemoveEdgeDialog")) return;
      this.fsm.run("onCloseRemoveEdgeDialog", event);

      console.log('Closed', type);

      if (type === 'cancel') return;
      this.removeConnection(this.actionId);
    },

    onCloseShowNodeDialog(type) {
      if (!this.fsm.hasEvent("onCloseShowNodeDialog")) return;
      this.fsm.run("onCloseShowNodeDialog");
    },

    resizeElement(event) {
        console.log("resizeElement");

        // read from model
        let x = (parseFloat(event.target.getAttribute('data-x')) || 0);
        let y = (parseFloat(event.target.getAttribute('data-y')) || 0);

        // update model
          // translate when resizing from top or left edges
        x += event.deltaRect.left;
        y += event.deltaRect.top;
          // store position
        event.target.setAttribute('data-x', x);
        event.target.setAttribute('data-y', y);

        // update view
        let displayValue = event.target.style.display;
        event.target.style.display = 'none';  // avoid reflows by multiple style changes

          // update the element's style
        event.target.style.width  = Math.round(event.rect.width / this.containerScale.x) + 'px';
        event.target.style.height = Math.round(event.rect.height / this.containerScale.y) + 'px';
          // translate when resizing from top or left edges
        event.target.style.webkitTransform =
        event.target.style.transform =
            'translate(' + x + 'px,' + y + 'px)';

        event.target.style.display = displayValue;
    },

    onShapeClick(event) {
      console.log("onShapeClick");

      if (!this.fsm.hasEvent("onShapeClick")) return;
      this.fsm.run("onShapeClick", event);

      event.preventDefault();
      
    },

    onShapeDrag(event) {
      console.log("onShapeDrag");

      let shapeId = event.target.getAttribute("data-id");
      let x = (parseFloat(event.target.getAttribute('data-x')) || 0);
      let y = (parseFloat(event.target.getAttribute('data-y')) || 0);

      // update model
      x += Math.round(event.dx / this.containerScale.x);
      y += Math.round(event.dy / this.containerScale.y);
      event.target.setAttribute('data-x', x);
      event.target.setAttribute('data-y', y);

      // update view
      event.target.style.webkitTransform =
      event.target.style.transform =
          'translate(' + x + 'px, ' + y + 'px)';
      
      // update connections of the shape
      this.redrawConnection(shapeId);
    },

    onContainerDrag(event) {
      console.log("onContainerDrag");

      if (this.options.isContainerDraggable === false)
        return;

      // update position in model
      this.translate(event.dx, event.dy);

      // update view by model
      let containerPan = () => {
        this.applyTransform();
        Events.scheduledAnimationFrame["containerPan"] = false;
      }
      Events.debounce(containerPan, "containerPan");
    },

    onContainerResize(event) {
      console.log("onContainerResize");

      if (this.options.isContainerResizeable === false)
        return;

      // update position in model
      this.resizeElement(event);

      // update view by model
      let containerResize = () => {
        this.applyTransform();
        Events.scheduledAnimationFrame["containerResize"] = false;
      }
      Events.debounce(containerResize, "containerResize");       
    },

    onScroll(event) {
      //console.log("onScroll");
    },

    onResize(event) {
      console.log("onResize");
      this.redraw();
    }
  }
}

</script>

<style lang="scss" scoped>

$test: #888;
$bgColor: #eee;

#vue-workspace {
  position: relative;
  width: 100vw;
  min-height: 100vh;  
}

.tool-bar {
  position: fixed;
  width: 100vw;
  z-index: 9;
  height: 64px;
}

.workspace {
  position: relative;
  top: 64px;
  height: auto;
  width: auto;
  min-height: 100vh;    
  min-width: 100vw;

  background: $bgColor;
}

.processContainer {
  position: absolute;
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  width: 1000px;
  height: 600px;
  left: 0.5vw;
  top: 60px;
  border: 1px solid #ccc;
  transform-origin: 0 0;
  background-color:rgba(255, 255, 255, 0.8);
  box-shadow: 0 1px 5px rgba(0,0,0,.2), 0 2px 2px rgba(0,0,0,.14), 0 3px 1px -2px rgba(0,0,0,.12);
}

svg { 
  position: absolute;
  height:100% !important; 
  width:100% !important;
  z-index: 1;
}

.col {
  border-left: 2px dashed #ccc; 
  text-align: center;
}

.col0 {
  border-left: none;
}

.connection, .tmpConnection {
  fill: none;
  stroke: #888;
  stroke-width: 2;
  stroke-dasharray: 5,5;
  marker-end: url(#triangle);
  pointer-events:all;
}

.connection:hover {
  stroke: #29e;
  stroke-width: 3;
}

marker {
  fill: none;
  stroke-width: 2;
  stroke: #888;
}

.shape {
  position: absolute;
  display: flex;  
  left: 0;
  top: 0;
  height: 200px;
  width: 100px;
  background-color: #29e;
  color: #fff;
  font-size: 1.2em;
  border-radius: 4px;
  flex-direction: column;
  justify-content: flex-end;

  z-index: 2;
  opacity: 0.5
}

.shape-drop {
  color: #000;
  background-color: #4e4;
}


.content {
  flex-grow: 1;
  align-self: center;
}

$anchorSize: 20px;

.anchor {
  width: $anchorSize;
  height: $anchorSize;
  -webkit-border-radius: $anchorSize / 2;
  -moz-border-radius: $anchorSize / 2;
  border-radius: $anchorSize / 2;
  background: white;
  align-self: center;
  cursor: crosshair;
}

.drop-active {
  border-color: #aaa;
}

.lane-drop {
  background-color: #29e;
  opacity: 0.3;
}


</style>
