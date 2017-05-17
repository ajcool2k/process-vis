<template>
  <div id="Process">

    <!-- child component -->
    <workspace></workspace>

  </div>
</template>

<script>

// Child components
import Workspace from './ui/Workspace.vue';


export default {
  name: 'Process',
  components: {
    'workspace': Workspace
  },
  data: function() {
      return {
        shapes: [],
        edges: [],
        cols: []
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
    this.cols.push({ shapes: [] });
    this.addData();
    // this.addRandomData(10,5);
    
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
      
    }
  }
}

</script>

<style lang="scss" scoped>
</style>
