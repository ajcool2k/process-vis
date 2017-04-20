<template>
  <div id="InteractJs">
    <h1>InteractJs</h1>
    <div id="container">

      <div class="snappyShape ss1" data-id="1"></div>
      <div class="snappyShape ss2" data-id="2"></div>
      <svg>
        <marker id="triangle"
          viewBox="0 0 10 10" refX="0" refY="5" 
          markerUnits="strokeWidth"
          markerWidth="4" markerHeight="3"
          orient="auto">
          <path d="M 0 0 L 10 5 L 0 10 z" />
        </marker>      
        <line class="connection" data-id="1" />
      </svg>


    </div>
  </div>
</template>

<script>


import { Project } from '@/classes/Project';
import { Process } from '@/classes/Process';
import { Participant } from '@/classes/Participant';

import { interact } from 'interactjs';

export default {
  name: 'InteractJs',
  data: function() {
      return {
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

        that.updateConnection();
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

        that.updateConnection();
      });      

  },

  updated: function() {
    console.log("updated");
  },

  methods: {
    updateConnection() {
      var containerNode = document.getElementById("container");

      var line = document.querySelectorAll('.connection[data-id="1"]')[0];

      var source = document.querySelectorAll('.snappyShape[data-id="1"]')[0];
      var target = document.querySelectorAll('.snappyShape[data-id="2"]')[0];

      let sourceRect = source.getBoundingClientRect();
      let targetRect = target.getBoundingClientRect();
      let containerOffset = containerNode.getBoundingClientRect();
      let markerOffset = 2;
      line.setAttribute('x1',-containerOffset.left + sourceRect.left + sourceRect.width / 2);
      line.setAttribute('y1',-containerOffset.top + sourceRect.bottom);
      line.setAttribute('x2',-containerOffset.left + targetRect.left + targetRect.width / 2);
      line.setAttribute('y2',-containerOffset.top - markerOffset + targetRect.top);

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
}

</style>
