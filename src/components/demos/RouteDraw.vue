<template>
  <div id="RouteDraw">
    <div id="plumbContainer">
      <div v-for="(item, index) in route.path" :id="item.id" class="item" :style="'top: ' + index * 200 + 'px'">{{item.id}}</div>
   </div>
  </div>
</template>

<script>

import plumb from 'jsplumb';
import Graph from 'digraphe';

import { Conf } from '@/classes/Conf';

import { Project } from '@/classes/Project';
import { Process } from '@/classes/Process';
import { Participant } from '@/classes/Participant';


export default {
  name: 'RouteDraw',
  data: function() {
      return {
        graph: null,
        route: null,
        counter: 0
      }
  },

  created: function() {
    console.log("created");
    
    let graph = new Graph();
    Conf.digrapheDebugmode(graph);

    let p1 = new Process('p1', 4 * 24);
    graph.addNode('p1', p1);
    let p2 = new Process('p2', 2 * 24);
    graph.addNode('p2', p2);
    let p3 = new Process('p3', 5 * 24);
    graph.addNode('p3', p3);
    let p4 = new Process('p4', 3 * 24);
    graph.addNode('p4', p4);
    
    graph.addEdge('head', 'p1');
    graph.addEdge('p1', 'p2', { weight: p1.duration });
    graph.addEdge('p2', 'p3', { weight: p2.duration });
    graph.addEdge('p3', 'p4', { weight: p3.duration });
    graph.addEdge('p4', 'tail', { weight: p4.duration });

    this.graph = graph;
    this.route = graph.routes({ from: 'head', to: 'tail' })[0];

    console.log("Dauer in Tagen: " + this.route.weight / 24);


  },

  mounted: function() {
    console.log("mounted");

    let route = this.route;
    console.log(route);

    
    var jsInstance = plumb.jsPlumb.getInstance({
        Connector: "Flowchart",
        Anchor: "Continuous",
        Endpoint: [ "Dot", { radius: 4 }],
        ConnectionOverlays: [
            [ "PlainArrow",  {location: 1, width: 15, length: 12}]
        ]
    });

    jsInstance.setContainer(document.getElementById("plumbContainer"));
    console.log(plumb);
    console.log(jsInstance);
    console.log(jsInstance.getAllConnections());

    jsInstance.ready(function () {
      console.log("jsInstance ready ");

      // start batch mode
      jsInstance.setSuspendDrawing(true);

      // connect route visually
      for (let i=0; i < route.path.length - 1; i++) {
        jsInstance.draggable(route.path[i].id);
        jsInstance.connect({source: route.path[i].id, target: route.path[i+1].id });
      }

      jsInstance.draggable(route.path[route.path.length - 1].id);
      jsInstance.on(window, "resize", jsInstance.repaintEverything);

      // end batch mode and redraw
      jsInstance.setSuspendDrawing(false, true);

    });
  },

  updated: function() {
    console.log("updated ");
  },

  methods: {}
}

</script>

<style>

  .item {
    background-color: white;
    border: 3px solid #346789;
    color: black;
    font-family: helvetica;
    font-size: 0.8em;
    height: 10vw;
    opacity: 0.8;
    padding: 0.5em;
    position: absolute;
    width: 10vw;
    z-index: 20;
    text-align:center;
  }
</style>
