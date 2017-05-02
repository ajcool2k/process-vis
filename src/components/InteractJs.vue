<template>
  <div id="InteractJs">
    <div id="toolbar">
      <button v-on:click="zoomIn">zoomIn</button>
      <button v-on:click="zoomOut">zoomOut</button>
    </div>
    <div id="container" @click="resetActions" @mousemove="throttle(trackMousePosition, 50)">

      <template v-for="(item, index) in shapes">
        <div class="snappyShape" :data-id="item.id" @click="useProcess">
          <div class="content" :data-id="item.id">{{item.name}}</div>
          <div class="anchor" :data-id="item.id" @click.stop="activateEdgeConnect" ></div>
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
          <polyline class="connection" :data-id="item.id" points="" />
        </template>
        <polyline class="tmpConnection" points="" />
      </svg>
    </div>
  </div>
</template>

<script>


import { Project } from '@/classes/Project';
import { Process } from '@/classes/Process';
import { Participant } from '@/classes/Participant';

import { interact } from 'interactjs';
import { _ } from 'underscore';
import { Utils } from '@/classes/Utils';

export default {
  name: 'InteractJs',
  data: function() {
      return {
        shapes: [],
        edges: [],
        counter: 0,

        containerNode: null,
        containerOffset: null,
        containerTranslation: { x: 0, y: 0 },
        containerScale: { x: 1.0, y: 1.0 },
        svgContainer: null,

        tmpLine: null,

        actions: {
          anchorClicked: false,
        },

        actionPosition: { x: 0, y: 0 },
        mousePosition: {x: 0, y:0},
        time: Date.now(),
        fireCounter: 0,

      }
  },

  created: function() {
    console.log("created");
  },

  mounted: function() {
    console.log("mounted");

    // cache DOM
    this.containerNode = document.getElementById("container");
    this.containerOffset = this.containerNode.getBoundingClientRect(); // forces reflow
    this.containerTranslation = {
      x: this.containerOffset.left,
      y: this.containerOffset.top
    }
    
    this.svgContainer = document.querySelector('svg.svgContainer');
    this.tmpLine = document.querySelector('svg.svgContainer .tmpConnection');

    var that = this;
    

    // remove existing event handlers
    interact('#container').unset();
    interact('.snappyShape').unset();

    // add new event handlers
    interact('#container')
      .draggable({}).on('dragmove', function (event) {
        
        // update position in model
        that.translate(event.dx, event.dy);

        // update view by model
        var containerPan = function() {
          that.applyTransform();
          Utils.scheduledAnimationFrame["containerPan"] = false;
        }
        Utils.debounce(containerPan, "containerPan");

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
      .on('dragmove', function (event) {
        // console.log('dragmove');

        let shapeId = event.target.getAttribute("data-id");
        let x = (parseFloat(event.target.getAttribute('data-x')) || 0);
        let y = (parseFloat(event.target.getAttribute('data-y')) || 0);

        // update model
        x += event.dx / that.containerScale.x;
        y += event.dy / that.containerScale.y;
        event.target.setAttribute('data-x', x);
        event.target.setAttribute('data-y', y);

        // update view
        event.target.style.webkitTransform =
        event.target.style.transform =
            'translate(' + x + 'px, ' + y + 'px)';
        
        // update connections of the shape
        that.redrawConnection(shapeId)
      })
      .resizable({
        preserveAspectRatio: false,
        edges: { left: true, right: true, bottom: true, top: true }
      })
      .on('resizemove', function (event) {
        // console.log('resizemove');

        // read from model
        let shapeId = event.target.getAttribute("data-id");
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
        event.target.style.width  = event.rect.width + 'px';
        event.target.style.height = event.rect.height + 'px';
          // translate when resizing from top or left edges
        event.target.style.webkitTransform =
        event.target.style.transform =
            'translate(' + x + 'px,' + y + 'px)';

        event.target.style.display = displayValue;

        // update connections of the shape
        that.redrawConnection(shapeId)
      });      


    this.addData();
    // this.addRandomData(10,5);
    
  },

  updated: function() {
    console.log("updated");
    this.redraw();
  },

  methods: {
    addData() {
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

      // accept strings as well
      sourceId = Number.isInteger(sourceId) ? sourceId : Number.parseInt(sourceId);
      targetId = Number.isInteger(targetId) ? targetId : Number.parseInt(targetId);

      // add to model
     var edge = {
        id: this.counter++,
        source: sourceId,
        target: targetId
      };

      this.edges.push(edge);
    },

    redraw() {
      var that = this;
      
      this.shapes.forEach(function(shape){
        that.redrawConnection(shape.id);
      });

    },

    redrawConnection(shapeId) {
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

      var line = document.querySelector('.connection[data-id="'+ edge.id +'"]');

      // ----------------------------------------------
      // source könnte ausgelagert werden, aber nicht performance kritisch
      var source = document.querySelector('.snappyShape[data-id="'+ edge.source +'"]');
      var target = document.querySelector('.snappyShape[data-id="'+ edge.target +'"]');

      let sourceRect = source.getBoundingClientRect();  // forces reflow
      let targetRect = target.getBoundingClientRect();  // forces reflow
      // ----------------------------------------------

      let markerOffset = 2;
      let anchorOffset = 20;

      let sourcePoint = {
        x: Math.round((-this.containerTranslation.x + sourceRect.left + sourceRect.width / 2) / this.containerScale.x),
        y: Math.round((-this.containerTranslation.y + sourceRect.bottom) / this.containerScale.y)
      }

      let targetPoint = {
        x: Math.round((-this.containerTranslation.x + targetRect.left + targetRect.width / 2) / this.containerScale.x),
        y: Math.round((-this.containerTranslation.y - markerOffset + targetRect.top) / this.containerScale.y)
      }

      let sourceAnchor = {
        x: sourcePoint.x,
        y: sourcePoint.y + Math.max( Math.round((targetPoint.y - sourcePoint.y) / 2), anchorOffset )
      }

      let targetAnchor = {
        x: targetPoint.x, 
        y: targetPoint.y - Math.max( Math.round((targetPoint.y - sourcePoint.y) / 2), anchorOffset )
      }
      
      let middlePoint1 = {
        x: sourcePoint.x + Math.round((targetPoint.x - sourcePoint.x) / 2),
        y: sourceAnchor.y
      }

      let middlePoint2 = {
        x: targetPoint.x - Math.round((targetPoint.x - sourcePoint.x) / 2),
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
      console.log("activateEdgeConnect");
      let source = event.target;
      let sourceRect = source.getBoundingClientRect(); // forces reflow

      let sourcePoint = { 
        x: Math.round((-this.containerTranslation.x + sourceRect.left + (sourceRect.width / 2)) / this.containerScale.x),
        y: Math.round((-this.containerTranslation.y + sourceRect.top + (sourceRect.height / 2)) / this.containerScale.y)
      }
      
      console.log("Source: " + JSON.stringify(sourcePoint));
      this.actions.anchorClicked = true;
      this.actionPosition = sourcePoint;
      this.tmpLine.setAttribute("data-id", event.target.getAttribute('data-id'));
    },

    useProcess(event) {
      console.log("useProcess");

      if (this.actions.anchorClicked === true) {
        let source = this.tmpLine;
        let sourceId = source.getAttribute("data-id");
        let target = event.target;
        let targetId = target.getAttribute("data-id");

        // add to model
        this.addConnection(sourceId, targetId);
        return;
      }
    },

    trackMousePosition(event) {
      this.mousePosition.x = Math.round((event.pageX - this.containerTranslation.x) / this.containerScale.x);
      this.mousePosition.y = Math.round((event.pageY - this.containerTranslation.y) / this.containerScale.y);
      // console.log(this.mousePosition.x + ":" + this.mousePosition.y);

      if (this.actions.anchorClicked) {
        Utils.debounce(this.drawLine, "drawLine");
      }
    },

    drawLine() {
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
      Utils.scheduledAnimationFrame["drawLine"] = false;
    },

    throttle(fn, wait) {
      this.time = Utils.throttle(fn, wait, this.time);
    },

    detectFireRate() {
      Utils.detectFireRate(1000);
    },

    resetActions() {
      for (const key of Object.keys(this.actions)) {
          this.actions[key] = false;
      }

      if (this.tmpLine) this.tmpLine.setAttribute("points","");
    },
    applyTransform() {
        let transformTranslate =  "translate(" + this.containerTranslation.x + "px, " + this.containerTranslation.y + "px)";
        let transformScale =  "scale(" + this.containerScale.x + "," + this.containerScale.y + ")";
        this.containerNode.style.webkitTransform =
        this.containerNode.style.transform = transformTranslate + " " + transformScale;
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

    untransformedOffset(el) {
      let offsetHeight = el.offsetHeight;
      let offsetWidth = el.offsetWidth;

      let offsetLeft = 0;
      let offsetTop  = 0;

      do {
        offsetLeft += el.offsetLeft;
        offsetTop  += el.offsetTop;
        el = el.offsetParent;
      } while( el );

      return {left: offsetLeft, top: offsetTop, height: offsetHeight, width: offsetWidth }; 
    },

    zoomIn() {
      this.scale(10/8.0, 10/8.0);
      this.applyTransform();
    },
    zoomOut() {
      this.scale(0.8, 0.8);
      this.applyTransform();
    }
  }
}

</script>

<style lang="scss" scoped>

$test: #888;

#InteractJs {
  overflow: hidden;
} 

#toolbar {
  position: absolute;
  z-index: 10;
}

#container {
  position: absolute;
  width: 100vw;
  height: 100vh;
  border: 1px solid #ccc;
  transform-origin: 0 0;
}

svg { 
  position: absolute;
  height:100% !important; 
  width:100% !important;
  z-index: 1;
}

.connection, .tmpConnection {
  fill: none;
  stroke: #888;
  stroke-width: 2;
  stroke-dasharray: 5,5;
  marker-end: url(#triangle);
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
}

</style>
