<template>
  <div class="stakeholder-input">

    <md-card md-with-hover>
      <md-card-content>

        <label for="stakeholder-type">Typ</label>
        <md-select name="stakeholder-type" id="stakeholder-type" v-model="stakeholder.type">
          <md-option value="Person">Person</md-option>
        </md-select>

        <md-input-container>
          <label>Name</label>
          <md-input placeholder="Name" v-model="stakeholder.name"></md-input>
        </md-input-container>

        <md-input-container>
          <label>Ansprechpartner</label>
          <md-input placeholder="Ansprechpartner" v-model="stakeholder.contact.contactPerson"></md-input>
        </md-input-container>


        <md-input-container>
          <label>Adresse</label>
          <md-input placeholder="Adresse" v-model="stakeholder.contact.postAddress"></md-input>
        </md-input-container>

        <md-input-container>
          <label>Telefon</label>
          <md-input placeholder="Telefon" v-model="stakeholder.contact.phone"></md-input>
        </md-input-container>

        <md-input-container>
          <label>Fax</label>
          <md-input placeholder="Fax" v-model="stakeholder.contact.telefax"></md-input>
        </md-input-container>

        <md-input-container>
          <label>E-Mail</label>
          <md-input placeholder="E-Mail" v-model="stakeholder.contact.email"></md-input>
        </md-input-container>

        <md-input-container>
          <label>Webseite</label>
          <md-input placeholder="Webseite" v-model="stakeholder.contact.website"></md-input>
        </md-input-container>

      </md-card-content>
      <md-button @click="onAddButton">Hinzufügen</md-button>
    </md-card>

  </div>
</template>

<script>
import { Stakeholder } from '@/classes/model/Stakeholder'

import Vue from 'vue'
import 'vue-material/dist/vue-material.css'
import VueMaterial from 'vue-material'
Vue.use(VueMaterial)

export default {
  name: 'StakeholderInput',
  props: [],
  data: function () {
    return {
      stakeholder: new Stakeholder()
    }
  },

  created: function () {
    console.log('StakeholderInput created')
  },

  destroyed: function () {
  },

  mounted: function () {
    console.log('StakeholderInput mounted')
  },

  updated: function () {
    console.log('StakeholderInput updated')
  },

  methods: {
    onCloseButton () {
      this.$emit('hide')
    },

    onAddButton () {
      this.$emit('add', this.stakeholder)
      this.stakeholder = new Stakeholder()
    }

  }
}
</script>

<style lang="scss" scoped>
</style>
