<template>
  <div id="InteractJs">

    <!-- child component -->
    <tool-bar :containerScale="containerScale" v-on:applyZoom="applyZoom"></tool-bar>

    <div class="main-content">
     
      <md-dialog-confirm
        :md-title="removeEdgeDialog.title"
        :md-content-html="removeEdgeDialog.contentHtml"
        :md-ok-text="removeEdgeDialog.ok"
        :md-cancel-text="removeEdgeDialog.cancel"
        @open="onOpen"
        @close="onClose"
        ref="removeEdgeDialog">
      </md-dialog-confirm>

      <md-dialog-alert
        :md-content-html="showNodeDialog.content"
        :md-ok-text="showNodeDialog.ok"
        ref="showNodeDialog">
      </md-dialog-alert>

      <div id="container" @click="resetActions" @touchmove.passive="trackTouchPosition" @mousemove.passive="throttle(trackMousePosition, 50)">
        <!-- child component -->
        <horizontal-bar :cols="cols" v-on:laneChange="applyLaneChange"></horizontal-bar>

        <template v-for="(item, index) in cols">
          <div :class="'col col' + index" :data-id="index" :style="'width: ' + ( 100 / cols.length ) + '%'">
          </div>
        </template>

        <template v-for="(item, index) in shapes">
          <div class="snappyShape" :data-id="item.id" @click.stop="useProcess">
            <div class="content" :data-id="item.id">{{item.name}}</div>
            <div class="anchor" :data-id="item.id" @click.stop="activateEdgeConnect"></div>
        </div>
        </template>

        <svg class="svgContainer">
          <marker id="triangle"
            viewBox="0 0 10 10" refX="0" refY="5" 
            markerUnits="strokeWidth"
            markerWidth="4" markerHeight="3"
            orient="auto">
            <path d="M 0 0 L 10 5 L 0 10 z" />
          </marker>

          <template v-for="(item, index) in edges">
            <polyline @click.stop="openRemoveConnectionDialog" class="connection" :data-id="item.id" points="" />
          </template>
          <polyline class="tmpConnection" points="" />
        </svg>
      </div>
    </div>    
  </div>
</template>

<script>

// Child components
import ToolBar from './ui/ToolBar.vue';
import HorizontalBar from './ui/HorizontalBar.vue';

import { Project } from '@/classes/Project';
import { Process } from '@/classes/Process';
import { Participant } from '@/classes/Participant';

import { interact } from 'interactjs';
import { _ } from 'underscore';


import { TouchSupport } from '@/classes/utils/TouchSupport';
import { Events } from '@/classes/utils/Events';
import { Calc } from '@/classes/utils/Calc';
import { Data } from '@/classes/utils/Data';



import Vue from 'vue'
import VueMaterial from 'vue-material'
import 'vue-material/dist/vue-material.css'

Vue.use(VueMaterial)

export default {
  name: 'InteractJs',
  components: {
    'tool-bar': ToolBar,
    'horizontal-bar' : HorizontalBar,
  },
  data: function() {
      return {
        shapes: [],
        edges: [],
        cols: [],
        counter: 0,

        workspaceNode: null,
        workspaceSize: {x: 1000, y: 1000 },
        
        containerNode: null,
        containerOffset: null,
        containerTranslation: { x: 0, y: 0 },
        containerScale: { x: 1.0, y: 1.0 },
        svgContainer: null,

        tmpLine: null,

        actions: {
          changes: false,
          drawingMode: false,
          shapeDragMode: false,
          shapeResizeMode: false,
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
        removeEdgeDialog: { title: 'Aktion', ok: 'Ja', cancel: 'Nein', contentHtml: 'Soll die Verbindung entfernt werden?', value: '' },
        showNodeDialog: { content: 'content', ok: 'Ausblenden' },

        // Support
        hasTouchSupport: false,

        // Interval
        zoomInt: 0
        
      }
  },

  created: function() {
    console.log("created");

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
    console.log("mounted");

    // add column
    this.cols.push({ shapes: [] });

    // cache DOM
    this.containerNode = document.querySelector("#container");
    this.containerOffset = Calc.absolutePosition(this.containerNode); // forces reflow

    this.workspaceNode = document.querySelector(".main-content");
    this.workspaceSize = { x: this.containerOffset.width + 100,  y: this.containerOffset.height + 100 }
    this.updateWorkspaceSize(); // forces reflow
    
    this.svgContainer = document.querySelector('svg.svgContainer');
    this.tmpLine = document.querySelector('svg.svgContainer .tmpConnection');

    let that = this;
    

    // remove existing event handlers
    interact('#container').unset();
    interact('.snappyShape').unset();

    // add new event handlers
    interact('#container')
      .draggable({})
      .on('dragstart', function (event) {
        console.warn("dragstart container");
        that.actionPosition = { x: event.pageX, y: event.pageY };
      })         
      .on('dragmove', this.onContainerDrag)
      .on('dragend', function (event) {
        console.warn("dragend container");
        that.updateWorkspaceSize({ x: event.pageX - that.actionPosition.x, y: event.pageY - that.actionPosition.y }); // forces reflow
      })         
      .resizable({
        preserveAspectRatio: false,
        edges: { left: true, right: true, bottom: true, top: true }
      })
      .on('resizestart', function (event) {
        console.log("resizestart");
        that.actionPosition = { x: event.pageX, y: event.pageY };
      })  
      .on('resizemove', this.onContainerResize)
      .on('resizeend', function (event) {
        console.log("resizeend");
        that.updateWorkspaceSize({ x: event.pageX - that.actionPosition.x, y: event.pageY - that.actionPosition.y });  // forces reflow
      });

    interact('.snappyShape')
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
      .on('dragstart', function (event) {
        console.warn("dragstart snappyShape");
        that.actions.shapeDragMode = true;
      })      
      .on('dragmove', this.onShapeDrag)
      .on('dragend', function (event) {
        console.warn("dragend snappyShape");
        that.actions.shapeDragMode = false;
        that.actions.changes = true;        
      })
      .resizable({
        preserveAspectRatio: false,
        restrict: { /* restrict options */ },
        edges: { left: true, right: true, bottom: true, top: true }
      })
      .on('resizestart', function (event) {
        that.actions.shapeResizeMode = true;
      })      
      .on('resizemove', function (event) {
        that.resizeElement(event);
        let shapeId = event.target.getAttribute("data-id");

        // update connections of the shape
        that.redrawConnection(shapeId)
      })
      .on('resizeend', function (event) {
        that.actions.shapeResizeMode = false;
        that.actions.changes = true;
      })          
      ;      


    this.addData();
    // this.addRandomData(10,5);
    
  },

  updated: function() {
    console.log("updated");
    this.redraw();
  },

  methods: {
    test(event) {
      console.log("test");
      console.log(event);
    },

    addData() {
      console.log("addData");

      var shape1 = { id: this.counter++, name: "p" + this.counter }
      var shape2 = { id: this.counter++, name: "p" + this.counter }
      var shape3 = { id: this.counter++, name: "p" + this.counter }
      var shape4 = { id: this.counter++, name: "p" + this.counter }

      this.shapes.push(shape1);
      this.shapes.push(shape2);
      this.shapes.push(shape3);
      this.shapes.push(shape4);
      /*
      this.addConnection(shape1.id, shape2.id);
      this.addConnection(shape3.id, shape2.id);
      this.addConnection(shape3.id, shape4.id);
      */
    },

    addRandomData(shapeCount, edgeCount) {
      console.log("addRandomData");

      function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min);
      }

      for (let i=0; i < shapeCount; i++) {
        this.shapes.push({ id: i, name: "p" + i });
      }

      for (let i=0; i < edgeCount; i++) {
        let rand1 = getRandomInt(0,shapeCount-1);
        let rand2 = getRandomInt(0,shapeCount-1);

        // avoid connection betwen the same element
        if (rand2 === rand1) {
          if (rand2 + 1 < shapeCount) rand2++
          else if (rand2 - 1 > 0) rand2--
        }
 
        this.addConnection(this.shapes[rand1].id, this.shapes[rand2].id);
      }
      
    },

    addConnection(sourceId, targetId) {
      console.log("addConnection");

      // accept strings as well
      sourceId = Number.isInteger(sourceId) ? sourceId : Number.parseInt(sourceId);
      targetId = Number.isInteger(targetId) ? targetId : Number.parseInt(targetId);
      
      // avoid duplicate connections
      if (_.findWhere(this.edges, {source: sourceId, target: targetId})) {
        console.warn("skipped new connection, it is already present");
        return;
      }

      // add to model
      let edge = {
        id: this.counter++,
        source: sourceId,
        target: targetId
      };

      this.edges.push(edge);
    },

    removeConnection(edgeId) {
      console.log("remove Edge: " + edgeId);

      this.edges = _.reject(this.edges, function(edge) {
        console.log(edge.id + " : " + edgeId); 
        console.log(edge.id == edgeId);
        return edge.id == edgeId; 
      });
    },

    redraw() {
      console.log("redraw");

      var that = this;
      
      this.shapes.forEach(function(shape){
        that.redrawConnection(shape.id);
      });

    },

    redrawConnection(shapeId) {
      console.log("redrawConnection");

      shapeId = parseInt(shapeId);
      
      var conSources = _.where(this.edges, {source: shapeId});
      var conTargets = _.where(this.edges, {target: shapeId});
      
      var cons = _.union(conSources, conTargets);
      console.log("redraw: " + cons.length + " connection(s)");
      
      var that = this;
      
      cons.forEach(function(edge){
        that.updateConnection(edge);
      });
    },

    updateConnection(edge) {
      console.log("updateConnection");
      
      var line = document.querySelector('.connection[data-id="'+ edge.id +'"]');

      // ----------------------------------------------
      // source könnte ausgelagert werden, aber nicht performance kritisch
      var source = document.querySelector('.snappyShape[data-id="'+ edge.source +'"]');
      var target = document.querySelector('.snappyShape[data-id="'+ edge.target +'"]');

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

    useProcess(event) {
      event.preventDefault();

      console.log("useProcess");
      console.log(event.type);
      console.log(JSON.stringify(this.actions));


      let caller = event.srcElement ? event.srcElement : "unknown";
      let eventType = event ? event.type : "unknown";
      
      if (this.actions.drawingMode === true) {
        console.log("--> add connection " + caller + " " + eventType);
        let source = this.tmpLine;
        let sourceId = source.getAttribute("data-id");
        let target = event.target;
        let targetId = target.getAttribute("data-id");

        // add to model
        this.addConnection(sourceId, targetId);
        this.resetActions();
        return;
      }

      // avoid dragged clicks
      if (this.actions.shapeDragMode === true) {
        console.log("--> avoid dragged " + caller + " " + eventType);
        this.actions.shapeDragMode = false;
        return;
      }

      // avoid resized clicks
      if (this.actions.shapeResizeMode === true) {
        console.log("--> avoid resized " + caller + " " + eventType);
        this.actions.shapeResizeMode = false;
        return;
      }
      

      if (this.actions.changes === true) {
        console.log("--> changes done " + caller + " " + eventType);
        this.actions.changes = false;
        return
      }


      // open dialog
      this.actionId = event.target.getAttribute('data-id');
      let p = _.findWhere(this.shapes, { id: parseInt(this.actionId) });
      console.log(p);

      this.showNodeDialog.content = 
      `
        <md-card>
          <md-card-media>
            <img src="https://image.flaticon.com/icons/svg/364/364172.svg" alt="processImage">
          </md-card-media>

          <md-card-header>
            <div class="md-title">Prozess</div>
            <div class="md-subhead">Inhalt</div>
          </md-card-header>

          <md-card-content>
            id: ${p.id} <br>
            name: ${p.name}
          </md-card-content>
        </md-card>
      `;
      this.$refs['showNodeDialog'].open();

    },

    trackMousePosition(event) {
      console.log("trackMousePosition");

      this.mousePosition.x = Math.round((event.pageX - this.containerTranslation.x - this.containerOffset.left) / this.containerScale.x);
      this.mousePosition.y = Math.round((event.pageY - this.containerTranslation.y - this.containerOffset.top) / this.containerScale.y);
      // console.log(this.mousePosition.x + ":" + this.mousePosition.y);

      if (this.actions.drawingMode === true) {
        console.log("drawingMode 1");
        Events.debounce(this.drawLine, "drawLine");
      }
    },

    trackTouchPosition(event) {
      console.log("trackTouchPosition");
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
      console.log("drawLine");
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

    addLane() {
      console.log("add lane");
      this.cols.push({ shapes: [] });
    },

    removeLane() {
      console.log("remove lane");

      if (this.cols.length < 2) {
        console.warn("Could not remove more lanes"); 
        return;
      }

      this.cols.splice(-1,1);
    },

    // Listener for horizontal-bar emits
    applyLaneChange(laneData) {
      switch(laneData) {
        case 'add':
          this.addLane();
          return;
        case 'remove':
          this.removeLane();
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

    openRemoveConnectionDialog(event) {
      this.actionId = event.target.getAttribute('data-id');
      this.$refs['removeEdgeDialog'].open();
    },

    closeDialog(ref) {
      this.$refs[ref].close();
    },

    onOpen() {
      console.log('Opened');
    },

    onClose(type) {
      console.log('Closed', type);
      if (type === 'cancel') return;
      this.removeConnection(this.actionId);
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
      let that = this;
      var containerPan = function() {
        that.applyTransform();
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
      let that = this;
      var containerResize = function() {
        that.applyTransform();
        Events.scheduledAnimationFrame["containerResize"] = false;
      }
      Events.debounce(containerResize, "containerResize");       
    },

    onScroll(event) {
      console.log("onScroll");
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

#InteractJs {
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

.main-content {
  position: relative;
  top: 64px;
  height: auto;
  width: auto;
  min-height: 100vh;    
  min-width: 100vw;

  background: $bgColor;
}

#container {
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

.snappyShape {
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

</style>
