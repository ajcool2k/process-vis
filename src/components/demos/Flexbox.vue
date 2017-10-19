<template>
  <div id="Flexbox">
    <h1>Flexbox</h1>
    <button v-on:click="addCol">Add Row</button>
    <button v-on:click="removeCol">Remove Row</button>
    <button v-on:click="addShape">Add Shape</button>


    <div class="container">
      <template v-for="(item, index) in cols">
        <div :class="'col col' + index" :data-id="index" v-on:drop="dropCol" v-on:dragover="allowDrop" :style="'width: ' + ( 100 / cols.length ) + '%'">
          <template v-for="(item, index) in item.shapes">
            <div class="shape" :data-id="item.id" v-on:click="removeShape" draggable="true" v-on:dragstart="dragShape" :style="'background: ' + item.color "></div>
          </template>
        </div>
      </template>
    </div>
  </div>
</template>

<script>


import { Project } from '@/classes/Project';
import { Process } from '@/classes/Process';
import { Participant } from '@/classes/Participant';
const _ = require('lodash');

export default {
  name: 'Flexbox',
  data: function() {
      return {
        shapeCounter: 0,
        cols: [
          { shapes: [] },
        ],
        colorCodes: [
          '#1abc9c',
          '#2ecc71',
          '#3498db',
          '#9b59b6',
          '#34495e',
          '#f1c40f',
          '#e67e22',
          '#e74c3c',
        ]
      }
  },

  created: function() {
    console.log("created");
  },

  mounted: function() {
    console.log("mounted");
  },

  updated: function() {
    console.log("updated");
  },

  methods: {
    addCol() {
      console.log("add col");
      this.cols.push({ shapes: [] });
    },

    allowDrop(ev) {
      ev.preventDefault();
    },

    dropCol(ev) {
      console.log("drop");
      let colId = ev.target.getAttribute('data-id');
      var shapeId = ev.dataTransfer.getData("text");
      console.log("shapeId (" + shapeId + ") moved into colId (" + colId + ")");
      var shape = this.removeShapeById(shapeId);
      this.cols[colId].shapes.push(shape);
    },

    removeCol() {
      console.log("remove col");
      if (this.cols.length < 2) return;

      this.cols.splice(-1,1);
    },

    addShape() {
      this.shapeCounter++;
      this.cols[0].shapes.push({
        id: this.shapeCounter,
        color: this.colorCodes[ this.shapeCounter % 8 ]
      });
    },

    dragShape(ev) {
      console.log(ev.target.getAttribute('data-id'));
      ev.dataTransfer.setData("text", ev.target.getAttribute('data-id'));
    },

    removeShape(ev) {
      let removeId = ev.target.getAttribute('data-id');

      this.removeShapeById(removeId);
    },

    removeShapeById(removeId) {
      console.log("remove id: " + removeId);

      var removedShape = null;

      this.cols.forEach(function(col) {
        col.shapes = _.reject(col.shapes, function(item) {
          if (item.id == removeId) {
            removedShape = item;
          }
          return item.id == removeId;
        });
      });

     return removedShape;
    }

  }
}

</script>

<style scoped>
  .container {
    display: flex;
    height: 100vh;
    width: 100vw;
    flex-direction: row;,
    flex-wrap: nowrap;
    justify-content: center;
    align-content: center;
  }

  .col {
    border: 1px dashed #ccc;
    text-align: center;
  }

  .shape {
    display: inline-block;
    background: #e67e22;
    height: 150px;
    margin-top: 25px;
    margin-bottom: 25px;
    width: 60%;
    border-radius: 25px;
  }

</style>
