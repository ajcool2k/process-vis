<template>
  <div id="app">
    <div id="item_1" class="item" style="left: 25%">Input 1</div>
    <div id="item_2" class="item" style="left: 50%">Input 2</div>
    <div id="item_3" class="item" style="left: 75%">Input 3</div>
  </div>
</template>

<script>
import { Process } from './classes/Process';
import { Participant } from './classes/Participant';

import plumb from 'jsplumb';

export default {
  name: 'app',
  data: function() {
      return {}
  },

  created: function() {
    let p = new Process('main-process');

    let c1 = new Process('Input1');
    let c2 = new Process('Input2');

    p.addChild(c1);
    p.addChild(c2);
    Process.connect(c1, c2);
    console.log(p);
    Process.disconnect(c1, c2);

  },

  mounted: function() {
    console.log("mounted");

    var jsInstance = plumb.jsPlumb.getInstance({
        Connector: "Flowchart",
        Anchor: "Continuous",
        Endpoint: [ "Dot", { radius: 4 }],
        ConnectionOverlays: [
            [ "PlainArrow",  {location: 1, width: 15, length: 12}]
        ]
    });

    jsInstance.ready(function () {
      console.log("jsInstance ready");

      jsInstance.connect({source: "item_1", target: "item_2" });
      jsInstance.connect({source: "item_3", target: "item_2" });

      jsInstance.draggable("item_1");
      jsInstance.draggable("item_2");
      jsInstance.draggable("item_3");

      jsInstance.on(window, "resize", jsInstance.repaintEverything);

    });
  }
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
