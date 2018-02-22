<template>
  <div class="location-input">

    <md-card md-with-hover>
      <md-card-content>
        <md-input-container>
          <label>Addresse</label>
          <md-input placeholder="Addresse" v-model="location.address"></md-input>
        </md-input-container>

        <md-layout md-gutter>
          <md-layout>
            <md-input-container>
              <label>PLZ</label>
              <md-input placeholder="PLZ" v-model="location.zip"></md-input>
            </md-input-container>
          </md-layout>
          <md-layout md-flex-offset="5">
            <md-input-container>
              <label>Stadt</label>
              <md-input placeholder="Stadt" v-model="location.city"></md-input>
            </md-input-container>
          </md-layout>
       </md-layout>

        <md-input-container>
          <label>Raum</label>
          <md-input placeholder="Raum" v-model="location.room"></md-input>
        </md-input-container>

        <md-layout md-gutter>
          <md-layout>
            <md-input-container>
              <label>Lat</label>
              <md-input placeholder="Lat" v-model="location.geoCoords.lat"></md-input>
            </md-input-container>
          </md-layout>
          <md-layout md-flex-offset="5" >
            <md-input-container>
              <label>Lng</label>
              <md-input placeholder="Lng" v-model="location.geoCoords.lng"></md-input>
            </md-input-container>
          </md-layout>
        </md-layout>

      </md-card-content>
      <md-button @click="onAddButton">Hinzufügen</md-button>
    </md-card>

  </div>
</template>

<script>
import { Location } from '@/classes/model/Location'

export default {
  name: 'LocationInput',
  props: [],
  data: function () {
    return {
      location: new Location()
    }
  },

  created: function () {
    console.log('LocationInput created')
  },

  destroyed: function () {
  },

  mounted: function () {
    console.log('LocationInput mounted')
  },

  updated: function () {
    console.log('LocationInput updated')
  },

  methods: {
    onCloseButton () {
      this.$emit('hide', this.location)
    },

    onAddButton () {
      this.$emit('add', this.location)
      this.location = new Location()
    }

  }
}
</script>

<style lang="scss" scoped>
</style>
