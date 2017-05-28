<template>
  <div id="Process">

    <!-- child component -->
    <workspace :processModel="mod" 

        v-on:addConnection="addConnection" 
        v-on:removeConnection="removeConnection" 

        v-on:addNode="addNode" 
        v-on:moveNode="moveNode" 

        v-on:removeNode="removeNode" 

        v-on:addLane="addLane" 
        v-on:removeLane="removeLane" 

    ></workspace>

  </div>
</template>

<script>

// Node Dependencies
import { _ } from 'underscore';

// Classes
import { Helper } from '@/classes/utils/Helper';
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
          cols: [],
          change: new Date(),
          tests: {}
        },
      }
  },

  created: function() {
    console.log("App created");

    this.addData();
    console.log(this.mod);

  },

  destroyed: function() {
    console.log("App destroyed");
  },

  mounted: function() {
    console.log("App mounted");

  },

  updated: function() {
    console.log("App updated");
  },

  methods: {

    addData() {
      console.log("App addData");

      // add column
      this.addLane();
      let data = Data.generateData();
      this.mod.shapes = data.nodes;
      this.mod.edges = data.edges;
      this.mod.cols = data.participants;
    },

    addNode() {
      var newId = Helper.nextId(this.mod.shapes);
      var shape = { id: newId, name: "p" + newId }
      this.mod.shapes.push(shape);
    },

    moveNode(shapeData) {
      let node = _.findWhere(this.mod.shapes, { id: shapeData.shapeId });
      if (node.p.participant === shapeData.laneId)
        return;

      node.p.participant = shapeData.laneId;
      this.forceRedraw();
    },

    removeNode(shapeId) {
      this.mod.shapes = _.reject(this.mod.shapes, (shape) => shape.id == shapeId);
    },

    addConnection(edgeData) {

      let newId = Helper.nextId(this.mod.edges);

      let edge = {
        id: newId,
        source: edgeData.source,
        target: edgeData.target
      };
      this.mod.edges.push(edge);
      console.log(this.mod.edges);
    },

    removeConnection(edgeId) {
      this.mod.edges = _.reject(this.mod.edges, edge => edge.id == edgeId);
    },

    addLane() {
      this.mod.cols.push({ id: Helper.nextId(this.mod.cols), name: "unset" });
    },

    removeLane() {
      console.log("remove lane");
      let that = this;

      // avoid if shapes are on this lane to keep them in container
      var shapes = _.find(that.mod.shapes, shape => shape.p.participant == that.mod.cols.length);

      if (shapes) {
        console.warn("Could not remove lane, there are still processes applied"); 
        return;
      }

      // avoid if only one lane is left
      if (this.mod.cols.length < 2) {
        console.warn("Could not remove more lanes"); 
        return;
      }

      this.mod.cols.splice(-1,1);
    },

    forceRedraw() {
      this.mod.change = new Date();
    }

  }
}

</script>

<style lang="scss" scoped>
</style>
