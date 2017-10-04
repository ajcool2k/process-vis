<template>
  <div class="process-breadcrumbs">

      <md-button class="md-dense" @click="onChangeProcess('parent')">{{ getPrev() }}</md-button>
      <md-icon>keyboard_arrow_right</md-icon>
      <md-button class="md-raised md-accent" @click="onShowProcess">{{ process.id }}</md-button>
      <md-icon>keyboard_arrow_right</md-icon>
      <md-button class="md-dense">Teilaufgaben: {{ process.childs.length }}</md-button>

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
    onChangeProcess (direction) {
      this.$emit('changeProcess', direction)
    },

    onShowProcess () {
      this.$emit('showProcess')
    },

    getPrev () {
      return !this.process || this.process.parent === '' ? 'ANLEGEN' : this.process.parent
    }
  }
}
</script>

<style lang="scss" scoped>
 .process-breadcrumbs {
   display: flex
 }
</style>
