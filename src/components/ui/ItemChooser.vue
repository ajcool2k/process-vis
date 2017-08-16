<template>
  <div class="item-chooser">

    <md-speed-dial md-mode="scale" class="md-fab-bottom-right">
      <md-button class="md-fab" md-fab-trigger>
        <md-icon md-icon-morph>close</md-icon>
        <md-icon>add</md-icon>
      </md-button>

      <md-button @click.native="addProcess()" class="md-fab md-mini md-clean"><md-icon>label</md-icon></md-button>
      <md-button @click.native="addLane()" class="md-fab md-mini md-clean"><md-icon>face</md-icon></md-button>

    </md-speed-dial>
  </div>
</template>

<script>
import Vue from 'vue'
import 'vue-material/dist/vue-material.css'

import VueMaterial from 'vue-material'
Vue.use(VueMaterial)

export default {
  name: 'ItemChooser',
  props: [],
  data: function () {
    return {}
  },

  created: function () {
    console.log('ItemChooser created')
  },

  destroyed: function () {
  },

  mounted: function () {
    console.log('ItemChooser mounted')
  },

  updated: function () {
    console.log('ItemChooser updated')
  },

  methods: {
    addProcess () {
      console.log('add new process')
      this.$emit('onProcessCreate', 'new')
    },

    addLane () {
      console.log('add new lane (not implemented yet)')
    }
  }
}
</script>

<style lang="scss" scoped>

.md-speed-dial {
  position: fixed;
  margin-top: -100px
}

</style>
