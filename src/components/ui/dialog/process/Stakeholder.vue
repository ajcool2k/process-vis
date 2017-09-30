<template>
  <div class="stakeholder">
    <template v-if="parentProcess && parentProcess.hasOwnProperty('participants')">
      <md-input-container>
        <label for="participant">Verantwortlicher</label>
        <md-select name="participant" id="participant" v-model="process.initiator">
          <template v-for="(item, index) in parentProcess.participants">
            <md-option :value="item">{{ getParticipant(item) }}</md-option>
          </template>
        </md-select>
      </md-input-container>
    </template>

    <md-list class="custom-list md-triple-line">
      <template v-for="(item, index) in process.stakeholder">
        <md-list-item>
          <md-icon>person</md-icon>
          <div class="md-list-text-container">
            <span>Name: {{ item.name }}</span>
            <span>Typ: {{ item.type }}</span>
          </div>
          <md-button class="md-icon-button md-raised" @click="onRemove(item.id)"><md-icon>delete</md-icon></md-button>
        </md-list-item>
      </template>
    </md-list>

    <md-button class="md-raised" @click="onShowInput($event)">Hinzufügen</md-button>

    <stakeholder-input v-if="showInput" v-on:add="onAdd"></stakeholder-input>
  </div>
</template>

<script>
import StakeholderInput from './StakeholderInput.vue'

import Vue from 'vue'
import 'vue-material/dist/vue-material.css'
import VueMaterial from 'vue-material'
Vue.use(VueMaterial)

export default {
  name: 'Location',
  components: {
    'stakeholder-input': StakeholderInput
  },
  props: [ 'process', 'parentProcess' ],
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
      console.log('onRemoveLocation', id)
      this.process.removeStakeholder(id)
    },

    onAdd (stakeholder) {
      console.log('onAdd', stakeholder)
      this.process.addStakeholder(stakeholder)
    },

    getParticipant (id) {
      if (typeof this.parentProcess === 'undefined' || !this.parentProcess) {
        console.warn('Stakeholder.getParticipant() - expected parentProcess')
        return ''
      }

      let participant = this.parentProcess.stakeholder.find(elem => elem.id === id)
      if (typeof participant === 'undefined') {
        console.warn('Stakeholder.getParticipant() - could not find id')
        return '[error]'
      }

      return participant.name
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
