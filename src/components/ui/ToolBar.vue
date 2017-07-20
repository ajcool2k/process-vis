<template>
  <div class="tool-bar">
    <md-toolbar class="md-dense">
      <h2 class="md-title" style="flex: 1">Prozess-Modellierung</h2>
        <md-button @touchstart.native="zoomIn" @touchend.native="zoomStop" @mousedown.native="zoomIn" @mouseup.native="zoomStop">
          <md-icon>zoom_in</md-icon>
        </md-button>

        <md-button @touchstart.native="zoomOut" @touchend.native="zoomStop" @mousedown.native="zoomOut" @mouseup.native="zoomStop">
          <md-icon>zoom_out</md-icon>
        </md-button>
    </md-toolbar>
  </div>
</template>

<script>

import Vue from 'vue'
import 'vue-material/dist/vue-material.css'
import VueMaterial from 'vue-material'
Vue.use(VueMaterial)

export default {
  name: 'ToolBar',
  props: [ 'containerScale' ],
  data: function () {
    return {
      scaleData: this.containerScale
    }
  },

  created: function () {
    console.log('ToolBar created')
  },

  destroyed: function () {
  },

  mounted: function () {
    console.log('ToolBar mounted')
  },

  updated: function () {
    console.log('ToolBar updated')
  },

  methods: {

    zoom (scaleX, scaleY) {
      this.zoomStop()

      this.zoomInt = setInterval(() => {
        this.scale(scaleX, scaleY)
        this.$emit('applyZoom', this.scaleData)
      }, 50)
    },

    zoomIn (event) {
      if (event) event.preventDefault()
      this.zoom(10 / 9.0, 10 / 9.0)
    },

    zoomOut (event) {
      if (event) event.preventDefault()
      this.zoom(0.9, 0.9)
    },

    zoomStop (event) {
      if (event) event.preventDefault()
      clearInterval(this.zoomInt)
    },

    scale (multX, multY) {
      if (multX === 0 || multY === 0) {
        console.warn('scalefactor 0 not allowed')
        return
      }

      this.scaleData = {x: this.scaleData.x * multX, y: this.scaleData.y * multY}
    }
  }
}

</script>

<style lang="scss" scoped>
    .tool-bar {
        white-space: nowrap;
    }
</style>
