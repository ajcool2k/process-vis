<template>
  <div class="horizontal-bar">
    <md-button @click.native="addLane" class="md-icon-button md-raised">
      <md-icon>add</md-icon>
    </md-button>

    <md-button @click.native="removeLane" class="md-icon-button md-raised" :disabled="(cols.length <= 1 ? true : false)">
      <md-icon>remove</md-icon>
    </md-button>
  </div>
</template>

<script>


import Vue from 'vue'
import 'vue-material/dist/vue-material.css'

import VueMaterial from 'vue-material'
Vue.use(VueMaterial);

/*
import { MdCore, MdButton, MdIcon } from 'vue-material'
Vue.use(MdCore);
Vue.use(MdButton);
Vue.use(MdIcon);
*/

export default {
  name: 'HorizontalBar',
  props: ['cols'],
  data: function() {
      return {
      }
  },

  created: function() {
    console.log("HorizontalBar created");
  },

  destroyed: function() {
  },

  mounted: function() {
    console.log("HorizontalBar mounted");
  },

  updated: function() {
    console.log("HorizontalBar updated");
  },

  methods: {

    addLane(event) {
      event.stopPropagation();
      this.$emit('laneChange', 'add');
    },

    removeLane(event) {
      event.stopPropagation();
      this.$emit('laneChange', 'remove');
    }
  }
}

</script>

<style lang="scss" scoped>

.horizontal-bar {
  position: absolute;
  margin-top: -50px;
  height: 50px;
  width: 100%;
  display: flex;
  justify-content: center;
}

</style>
