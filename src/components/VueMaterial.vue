<template>
  <div id="VueMaterial">
    <h1>VueMaterial</h1>

  <md-layout md-gutter>
    <md-layout md-flex-xsmall="100" md-flex-small="50" md-flex-medium="33">
      md-flex-xsmall <br>
      md-flex-small="50" <br>
      md-flex-medium="33"
    </md-layout>

    <md-layout md-flex-xsmall="100" md-flex-small="50" md-flex-medium="33">
      md-flex-xsmall <br>
      md-flex-small="50" <br>
      md-flex-medium="33"
    </md-layout>

    <md-layout md-flex-xsmall="100" md-flex-small="50" md-flex-medium="33">
      md-flex-xsmall <br>
      md-flex-small="50" <br>
      md-flex-medium="33"
    </md-layout>

    <md-layout md-flex-xsmall="100" md-flex-small="50" md-flex-medium="33">
      md-flex-xsmall <br>
      md-flex-small="50" <br>
      md-flex-medium="33"
    </md-layout>

    <md-layout md-flex-small="100" md-flex-medium="33" md-hide-xsmall>
      md-flex-medium="33" <br>
      md-hide-xsmall
    </md-layout>

    <md-layout md-flex md-flex-medium="33" md-hide-small>
      md-flex-medium="33" <br>
      md-hide-small
    </md-layout>
  </md-layout>


    <md-button class="md-icon-button md-raised">
      <md-icon>add</md-icon>
    </md-button>

  </div>
</template>

<script>


import Vue from 'vue'
import VueMaterial from 'vue-material'
import 'vue-material/dist/vue-material.css'

Vue.use(VueMaterial)


export default {
  name: 'VueMaterial',
  data: function() {
      return {
        rows: [
          1, 2, 3, 4
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

  }
}

</script>

<style>

</style>
