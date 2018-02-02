<template>
  <div class="tool-bar">
    <md-toolbar class="md-dense">
      <span class="span-home">
        <md-button @touchstart.native="list" @mousedown.native="list">
            <span class="button-home-text">Prozess-Modellierung</span>
            <md-icon class="button-home-icon">home</md-icon>
        </md-button>
      </span>

      <breadcrumbs :process="process" v-on:changeProcess="onChangeProcess" v-on:showProcess="onShowProcess"></breadcrumbs>

      <span class="span-toolset">
        <md-button v-if="isSaved" @touchstart.native="remove" @mousedown.native="remove">
          <md-icon>delete</md-icon>
        </md-button>

        <md-button @touchstart.native="save"  @mousedown.native="save">
          <md-icon>save</md-icon>
        </md-button>

        <md-button @touchstart.native="download"  @mousedown.native="download">
          <md-icon>file_download</md-icon>
        </md-button>

        <md-button @touchstart.native="zoomIn" @touchend.native="zoomStop" @mousedown.native="zoomIn" @mouseup.native="zoomStop">
          <md-icon>zoom_in</md-icon>
        </md-button>

        <md-button @touchstart.native="zoomOut" @touchend.native="zoomStop" @mousedown.native="zoomOut" @mouseup.native="zoomStop">
          <md-icon>zoom_out</md-icon>
        </md-button>
      </span>
    </md-toolbar>
  </div>
</template>

<script>
import Breadcrumbs from './Breadcrumbs.vue'

export default {
  name: 'ToolBar',
  components: {
    'breadcrumbs': Breadcrumbs
  },
  props: [ 'containerScale', 'isSaved', 'process' ],
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
    },

    save () {
      this.$emit('exchange', 'save')
    },

    download () {
      this.$emit('exchange', 'download')
    },

    remove () {
      this.$emit('exchange', 'remove')
    },

    list () {
      this.$emit('exchange', 'list')
    },

    onShowProcess () {
      this.$emit('process')
    },

    onChangeProcess (direction) {
      this.$emit('changeProcess', 'changeProcess-' + direction)
    }
  }
}
</script>

<style lang="scss" scoped>
    .tool-bar .md-toolbar {
        white-space: nowrap;
        display: flex;
        justify-content: space-around;

      .button-home-icon {
        display: none
      }
    }

  @media (max-width: 1200px) {
    .tool-bar .md-toolbar {
      .button-home-text {
        display: none
      }

      .button-home-icon {
        display: inline-block
      }    

      .md-button {
        min-width: auto
      }
    }
  }

</style>
