<template>
  <div class="location">
    <md-list class="custom-list md-triple-line">
      <template v-for="(locationId, index) in process.location">
        <md-list-item>
          <md-icon>place</md-icon>
          <div class="md-list-text-container">
            <span>Adresse: {{ getLocation(locationId).mAddress }} - {{ getLocation(locationId).mZip }} {{ getLocation(locationId).mCity }}</span>
            <span>Ort: {{ getLocation(locationId).mZip }} - {{ getLocation(locationId).mCity }}</span>
            <span>Raum: {{ getLocation(locationId).mRoom }}</span>
          </div>
          <md-button class="md-icon-button md-raised" @click="onRemove(locationId)"><md-icon>delete</md-icon></md-button>
        </md-list-item>
      </template>
    </md-list>

    <md-button class="md-raised" @click="onShowInput($event)">Hinzufügen</md-button>

    <location-input v-if="showInput" v-on:add="onAdd"></location-input>
  </div>
</template>

<script>
import { Metadata } from '@/classes/model/Metadata'
import { Location } from '@/classes/model/Location'
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
    },

    getLocation (id) {
      if (typeof id !== 'string') {
        console.warn('Location.getLocation() - expected a string')
        return new Location('[error]')
      }

      let location = Metadata.findLocation(id)

      if (typeof location === 'undefined') {
        console.warn('Location.getLocation() - could not find id')
        return new Location('[error]')
      }

      return location
    }

  }
}
</script>

<style lang="scss" scoped>
</style>
