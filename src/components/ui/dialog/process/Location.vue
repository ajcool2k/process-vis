<template>
  <div class="location">
    <md-list class="custom-list md-triple-line">
      <template v-for="(item, index) in process.location">
        <md-list-item>
          <md-icon>place</md-icon>
          <div class="md-list-text-container">
            <span>Adresse: {{ item.mAddress }} - {{ item.mZip }} {{ item.mCity }}</span>
            <span>Ort: {{ item.mZip }} - {{ item.mCity }}</span>
            <span>Raum: {{ item.mRoom }}</span>
          </div>
          <md-button class="md-icon-button md-raised" @click="onRemove(item.id)"><md-icon>delete</md-icon></md-button>
        </md-list-item>
      </template>
    </md-list>
    <md-button class="md-primary" @click="onShowInput($event)">Hinzufügen</md-button>
    <location-input v-if="showInput" v-on:add="onAdd"></location-input>
  </div>
</template>

<script>
import LocationInput from './LocationInput.vue'

import Vue from 'vue'
import 'vue-material/dist/vue-material.css'
import VueMaterial from 'vue-material'
Vue.use(VueMaterial)

export default {
  name: 'Location',
  components: {
    'location-input': LocationInput
  },
  props: [ 'process' ],
  data: function () {
    return {
      showInput: false
    }
  },

  created: function () {
    console.log('Location created')
  },

  destroyed: function () {
  },

  mounted: function () {
    console.log('Location mounted')
  },

  updated: function () {
    console.log('Location updated')
  },

  methods: {
    onShowInput (event) {
      let button = event.target
      if (this.showInput === true) {
        button.innerHTML = 'Hinzufügen'
        this.showInput = false
      } else {
        button.innerHTML = 'Ausblenden'
        this.showInput = true
      }
    },
    onRemove (id) {
      console.log('onRemove', id)
      this.process.removeLocation(id)
    },

    onAdd (location) {
      console.log('onAdd', location)
      this.process.addLocation(location)
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
