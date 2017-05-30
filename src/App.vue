<template>
  <div id="app">
    <transition name="component-fade" mode="out-in">
      <router-view></router-view>
    </transition>
  </div>
</template>

<script>

export default {
  name: 'app',
  data: function () {
    return {
      graph: null,
      route: null,
      counter: 0
    }
  },

  mounted: function () {}
}

</script>

<style lang="scss">

  app {
    background: #eee !important;
  }

</style>
