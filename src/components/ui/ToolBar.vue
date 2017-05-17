<template>
  <div class="tool-bar">
    <md-toolbar>
      <h2 class="md-title" style="flex: 1">Visualisierung</h2>
        <md-button @touchstart.native="zoomOut" @touchend.native="zoomStop" @mousedown.native="zoomOut" @mouseup.native="zoomStop">zoomOut</md-button>
        <md-button @touchstart.native="zoomIn" @touchend.native="zoomStop" @mousedown.native="zoomIn" @mouseup.native="zoomStop">zoomIn</md-button>
    </md-toolbar>
  </div>
</template>

<script>


import Vue from 'vue'
import 'vue-material/dist/vue-material.css'
import VueMaterial from 'vue-material'
Vue.use(VueMaterial);

/*
import { MdCore, MdToolbar, MdButton } from 'vue-material'
Vue.use(MdCore);
Vue.use(MdToolbar);
Vue.use(MdButton);
*/

export default {
  name: 'ToolBar',
  props: [ 'containerScale' ],
  data: function() {
      return {
          scaleData: this.containerScale
      }
  },

  created: function() {
    console.log("ToolBar created");
  },

  destroyed: function() {
  },

  mounted: function() {
    console.log("ToolBar mounted");
  },

  updated: function() {
    console.log("ToolBar updated");
  },

  methods: {

    zoom(scaleX, scaleY) {
      this.zoomStop();
      let that = this;

      this.zoomInt = setInterval(function() {
        that.scale(scaleX, scaleY);
        that.$emit('applyZoom', that.scaleData );
        //that.applyTransform();
      }, 50);  
    },

    zoomIn(event) {
      if (event) event.preventDefault();
      this.zoom(10/9.0, 10/9.0);
    },
    
    zoomOut(event) {
      if (event) event.preventDefault();
      this.zoom(0.9, 0.9);
    },

    zoomStop(event) {
      if (event) event.preventDefault();
      clearInterval(this.zoomInt);
    },

    scale(multX, multY) {
      if (multX == 0 || multY == 0) {
        console.warn("scalefactor 0 not allowed");
        return; 
      }

      this.scaleData = {x: this.scaleData.x * multX, y: this.scaleData.y * multY};
    },    
    
  }
}

</script>

<style lang="scss" scoped>
    .tool-bar {
        white-space: nowrap;
    }
</style>
