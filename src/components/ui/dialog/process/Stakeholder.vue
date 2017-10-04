<template>
  <div class="stakeholder">
    <template>
      <md-input-container>
        <label for="initiator">Verantwortlicher</label>
        <md-select name="initiator" id="initiator" v-model="process.initiator">
          <template v-for="(elem, index) in process.stakeholder">
            <md-option :value="elem.id">{{ getStakeholder(elem.id) }}</md-option>
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
  name: 'Stakeholder',
  components: {
    'stakeholder-input': StakeholderInput
  },
  props: [ 'process' ],
  data: function () {
    return {
      showInput: false
    }
  },

  created: function () {
    console.log('Stakeholder created')
  },

  destroyed: function () {
  },

  mounted: function () {
    console.log('Stakeholder mounted')
  },

  updated: function () {
    console.log('Stakeholder updated')
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
      this.process.removeStakeholder(id)
    },

    onAdd (stakeholder) {
      console.log('onAdd', stakeholder)
      this.process.addStakeholder(stakeholder)
    },

    getStakeholder (id) {
      if (typeof this.process === 'undefined' || !this.process) {
        console.warn('Stakeholder.getStakeholder() - expected process')
        return ''
      }

      let stakeholder = this.process.stakeholder.find(elem => elem.id === id)
      if (typeof stakeholder === 'undefined') {
        console.warn('Stakeholder.getStakeholder() - could not find id')
        return '[error]'
      }

      return stakeholder.name
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
