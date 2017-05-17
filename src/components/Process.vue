<template>
  <div id="Process">

    <!-- child component -->
    <workspace :processModel="mod" 
        v-on:addConnection="addConnection" 
        v-on:removeConnection="removeConnection" 
        v-on:addLane="addLane" 
        v-on:removeLane="removeLane" 

    ></workspace>

  </div>
</template>

<script>

// Child components
import Workspace from './ui/Workspace.vue';

import { _ } from 'underscore';

export default {
  name: 'Process',
  components: {
    'workspace': Workspace
  },
  data: function() {
      return {
        mod: {
          shapes: [],
          edges: [],
          cols: []
        },
        counter: 0, // obj counter;
      }
  },

  created: function() {
    console.log("App created");
  },

  destroyed: function() {
    console.log("App destroyed");
  },

  mounted: function() {
    console.log("App mounted");

    // add column
    this.mod.cols.push({ shapes: [] });
    this.addData();
    // this.addRandomData(10,5);
    console.log(this.mod);
  },

  updated: function() {
    console.log("App updated");
  },

  methods: {

    addData() {
      console.log("App addData");

      var shape1 = { id: this.counter++, name: "p" + this.counter }
      var shape2 = { id: this.counter++, name: "p" + this.counter }
      var shape3 = { id: this.counter++, name: "p" + this.counter }
      var shape4 = { id: this.counter++, name: "p" + this.counter }

      this.mod.shapes.push(shape1);
      this.mod.shapes.push(shape2);
      this.mod.shapes.push(shape3);
      this.mod.shapes.push(shape4);

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

    addConnection(edgeData) {
      let edge = {
        id: this.counter++,
        source: edgeData.source,
        target: edgeData.target
      };
      this.mod.edges.push(edge);
      console.log(this.mod.edges);
    },

    removeConnection(edgeId) {
      this.mod.edges = _.reject(this.mod.edges, function(edge) {
        console.log(edge.id + " : " + edgeId); 
        console.log(edge.id == edgeId);
        return edge.id == edgeId; 
      });
    },

    addLane() {
      this.mod.cols.push({ shapes: [] });
    },

    removeLane() {
      console.log("remove lane");

      if (this.mod.cols.length < 2) {
        console.warn("Could not remove more lanes"); 
        return;
      }

      this.mod.cols.splice(-1,1);
    },    

  }
}

</script>

<style lang="scss" scoped>
</style>
