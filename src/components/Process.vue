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

// Node Dependencies
import { _ } from 'underscore';

// Classes
import { Data } from '@/classes/utils/Data';

// Child components
import Workspace from './ui/Workspace.vue';

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

    this.addData();

    console.log(this.mod);
  },

  updated: function() {
    console.log("App updated");
  },

  methods: {

    addNode() {
      var shape = { id: this.counter++, name: "p" + this.counter }
      this.mod.shapes.push(shape);
    },

    addData() {
      console.log("App addData");

      // add column
      this.addLane();

      /*
      for(let i = 0; i < 4; i++)
        this.addNode();

      let con1 = { source: this.mod.shapes[0].id, target: this.mod.shapes[1].id };
      let con2 = { source: this.mod.shapes[0].id, target: this.mod.shapes[2].id };

      this.addConnection(con1);
      this.addConnection(con2);

      var that = this;
      this.mod.edges.forEach(function(elem) {
        console.log(elem);
        that.addConnection(elem);
      });
      */

      let data = Data.generateData();
      this.mod.shapes = data.nodes;
      this.mod.edges = data.edges;
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
