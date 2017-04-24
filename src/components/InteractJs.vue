<template>
  <div id="InteractJs">
    <h1>InteractJs</h1>
    <div id="container">

      <template v-for="(item, index) in shapes">
        <div class="snappyShape" :data-id="item.id">{{item.name}}</div>
      </template>

      <svg>
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

export default {
  name: 'InteractJs',
  data: function() {
      return {
        shapes: [],
        edges: [],
        counter: 0
      }
  },

  created: function() {
    console.log("created");
  },

  mounted: function() {
    console.log("mounted");

    var x = 0, y = 0;
    var containerNode = document.getElementById("container");
    var that = this;

    this.addData();
    // this.addRandomData(10,5);

    // remove existing event handlers
    interact('.snappyShape').unset();
    // add new event handlers
    interact('.snappyShape')
      .draggable({
        snap: {
          targets: [
            interact.createSnapGrid({ x: 30, y: 30 })
          ],
          range: Infinity,
          relativePoints: [ { x: 0, y: 0 } ]
        },
        inertia: true,
        restrict: {
          restriction: containerNode,
          elementRect: { top: 0, left: 0, bottom: 1, right: 1 },
          endOnly: true
        }
      })
      .on('dragmove', function (event) {
        // console.log('dragmove');

        x = (parseFloat(event.target.getAttribute('data-x')) || 0);
        y = (parseFloat(event.target.getAttribute('data-y')) || 0);

        x += event.dx;
        y += event.dy;

        // translate object
        event.target.style.webkitTransform =
        event.target.style.transform =
            'translate(' + x + 'px, ' + y + 'px)';
        
        // store position
        event.target.setAttribute('data-x', x);
        event.target.setAttribute('data-y', y);

        // update connections of the shape
        that.redrawConnection(event.target.getAttribute("data-id"))
      })
      .resizable({
        preserveAspectRatio: false,
        edges: { left: true, right: true, bottom: true, top: true }
      })
      .on('resizemove', function (event) {
        // console.log('resizemove');
        
        x = (parseFloat(event.target.getAttribute('data-x')) || 0);
        y = (parseFloat(event.target.getAttribute('data-y')) || 0);

        // update the element's style
        event.target.style.width  = event.rect.width + 'px';
        event.target.style.height = event.rect.height + 'px';

        // translate when resizing from top or left edges
        x += event.deltaRect.left;
        y += event.deltaRect.top;

        event.target.style.webkitTransform =
        event.target.style.transform =
            'translate(' + x + 'px,' + y + 'px)';
        
        // store position
        event.target.setAttribute('data-x', x);
        event.target.setAttribute('data-y', y);

        // output position
        event.target.textContent = Math.round(event.rect.width) + '×' + Math.round(event.rect.height);

        // update connections of the shape
        that.redrawConnection(event.target.getAttribute("data-id"))
      });      

  },

  updated: function() {
    console.log("updated");
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

      this.addConnection(shape1.id, shape2.id);
      this.addConnection(shape3.id, shape2.id);
      this.addConnection(shape3.id, shape4.id);
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

      // add to model
     var edge = {
        id: this.counter++,
        source: sourceId,
        target: targetId
      };
      this.edges.push(edge);

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
      var containerNode = document.getElementById("container");

      var line = document.querySelectorAll('.connection[data-id="'+ edge.id +'"]')[0];

      var source = document.querySelectorAll('.snappyShape[data-id="'+ edge.source +'"]')[0];
      var target = document.querySelectorAll('.snappyShape[data-id="'+ edge.target +'"]')[0];

      let sourceRect = source.getBoundingClientRect();
      let targetRect = target.getBoundingClientRect();
      let containerOffset = containerNode.getBoundingClientRect();

      let markerOffset = 2;
      let anchorOffset = 20;

      let sourcePoint = {
        x: Math.round(-containerOffset.left + sourceRect.left + sourceRect.width / 2),
        y: Math.round(-containerOffset.top + sourceRect.bottom)
      }

      let targetPoint = {
        x: Math.round(-containerOffset.left + targetRect.left + targetRect.width / 2),
        y: Math.round(-containerOffset.top - markerOffset + targetRect.top)
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
    }
  }
}

</script>

<style>

#container {
  width: 100vw;
  height: 100vh;
}

svg { 
  position: absolute;
  height:100% !important; 
  width:100% !important;
  z-index: 1;
}


.connection {
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

marker path {
  
}

.snappyShape {

  position: absolute;
  left: 0;
  top: 0;
  height: 200px;
  width: 100px;
  background-color: #29e;
  color: #fff;
  font-size: 1.2em;
  border-radius: 4px;
  padding: 2%;
  margin: 5%;
  z-index: 2;
  opacity: 0.5
}

</style>
