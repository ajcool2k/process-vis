<template>
  <div class="process-breadcrumbs">
    <md-button class="md-dense" @click="openLayer('parent')">{{ process.parent }}</md-button>
    <md-icon>keyboard_arrow_right</md-icon>
    <md-button class="md-raised md-accent">{{ process.id }}</md-button>
    <md-icon>keyboard_arrow_right</md-icon>
    <md-button class="md-dense" @click="openLayer('child')">Teilaufgaben: {{ process.childs.length }}</md-button>
  </div>
</template>

<script>
import Vue from 'vue'
import 'vue-material/dist/vue-material.css'
import VueMaterial from 'vue-material'
Vue.use(VueMaterial)

export default {
  name: 'Breadcrumbs',
  components: {},
  props: [ 'process' ],
  data: function () {
    return {}
  },

  created: function () {
    console.log('Breadcrumbs created')
  },

  destroyed: function () {
  },

  mounted: function () {
    console.log('Breadcrumbs mounted')
  },

  updated: function () {
    console.log('Breadcrumbs updated')
  },

  methods: {
    openLayer (layer) {
      this.$emit('openLayer', layer)
    }
  }
}
</script>

<style lang="scss" scoped>
 .process-breadcrumbs {
   display: flex
 }
</style>
