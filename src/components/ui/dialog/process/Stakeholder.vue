<template>
  <div class="stakeholder">
    <div class="stakeholder-table" v-if="showInput === false">
      <md-table>
        <md-table-header>
          <md-table-row>
            <md-table-head>Name</md-table-head>
            <!-- <md-table-head>Typ</md-table-head> -->
            <md-table-head>Initiator</md-table-head>
            <md-table-head>Beteiligter</md-table-head>
            <md-table-head>Sontige</md-table-head>
            <md-table-head>&nbsp;</md-table-head>
          </md-table-row>
        </md-table-header>

        <md-table-body>
          <md-table-row v-for="(elem, index) in matrix" :key="index+'--matrix'">
            <md-table-cell class="person"><md-icon>person</md-icon>{{elem.name}}</md-table-cell>
            <!-- <md-table-cell>{{elem.type}}</md-table-cell> -->
            <md-table-cell>{{elem.initiator}}</md-table-cell>
            <md-table-cell>{{elem.participant}}</md-table-cell>
            <md-table-cell>{{elem.other}}</md-table-cell>
            <md-table-cell class="action">
              <md-button class="md-icon-button md-raised" @click="onEditInput(elem.id)"><md-icon>edit</md-icon></md-button>
              <md-button :disabled="elem.other === ''" class="md-icon-button md-raised" @click="onRemove(elem.id)"><md-icon>delete</md-icon></md-button>
            </md-table-cell>
          </md-table-row>
        </md-table-body>
      </md-table>
    </div>

    <md-button class="md-raised showButton" @click="onShowInput($event)">Erstellen</md-button>
    <!-- <md-button class="md-raised choiceButton" @click="onShowChoice($event)">Auswählen</md-button> -->

    <stakeholder-input ref="stakeholder-input" v-if="showInput" :action="action" v-on:add="onAdd"></stakeholder-input>

  </div>
</template>

<script>
import { Metadata } from '@/classes/model/Metadata'
import { Stakeholder } from '@/classes/model/Stakeholder'

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
  props: [],
  data: function () {
    return {
      showInput: false,
      action: 'show',
      metadata: Metadata.getData(),
      initiator: '',
      matrix: [],
      process: null,
      dom: {
        showButton: null,
        choiceButton: null
      }
    }
  },

  created: function () {
    console.log('Stakeholder created')
  },

  destroyed: function () {
  },

  mounted: function () {
    console.log('Stakeholder mounted')
    this.dom.showButton = document.querySelector('.stakeholder .showButton')
    this.dom.choiceButton = document.querySelector('.stakeholder .choiceButton')
  },

  updated: function () {
    console.log('Stakeholder updated')
  },

  methods: {
    refresh (p) {
      console.warn('Stakeholder.refresh()')
      this.process = p
      this.initiator = this.getStakeholder(this.process.initiator).name

      // add initaitor
      let mapA = [ { id: this.process.initiator, name: this.getStakeholder(this.process.initiator).name, type: this.getStakeholder(this.process.initiator).type, initiator: 'x', participant: '', other: '' } ]
      // add participants
      let mapB = this.process.participants.map(id => { return { id: id, name: this.getStakeholder(id).name, type: this.getStakeholder(id).type, initaitor: '', participant: 'x', other: '' } })
      // add others
      let mapC = this.process.stakeholder.filter(id => this.process.participants.indexOf(id) === -1 && id !== this.process.initiator).map(id => { return { id: id, name: this.getStakeholder(id).name, type: this.getStakeholder(id).type, initaitor: '', participant: '', other: 'x' } })

      this.matrix = mapA.concat(mapB.concat(mapC))
    },

    onEditInput (id) {
      this.dom.showButton.innerHTML = 'Ausblenden'
      this.action = 'edit'
      let stakeholder = Metadata.getStakeholder().find(elem => elem.id === id)
      this.showInput = true

      this.$nextTick(function () {
        this.$refs['stakeholder-input'].setStakeholder(stakeholder)
      })
    },

    onShowChoice (event) {

    },

    onShowInput (event) {
      let button = event.target
      if (this.showInput === true) {
        button.innerHTML = 'Erstellen'
        this.action = 'create'
        this.showInput = false
        this.refresh(this.process)
      } else {
        button.innerHTML = 'Ausblenden'
        this.showInput = true
        this.action = 'show'
      }
    },
    onRemove (id) {
      console.log('onRemove', id)
      this.process.removeStakeholder(id)
      this.refresh(this.process)
    },

    onAdd (stakeholder) {
      console.log('onAdd', stakeholder)
      this.process.addStakeholder(stakeholder)
      this.refresh(this.process)
    },

    getStakeholder (id) {
      if (typeof id !== 'string') {
        console.warn('Stakeholder.getStakeholder() - expected a string')
        return new Stakeholder('[error]')
      }

      let stakeholder = Metadata.findStakeholder(id)
      if (typeof stakeholder === 'undefined') {
        console.warn('Stakeholder.getStakeholder() - could not find id')
        return new Stakeholder('[error]')
      }

      return stakeholder
    }
  }
}
</script>

<style lang="scss">

#stakeholder td.person > div {
  display: inline;

  i {
    padding-right: 30px
  }
}


</style>
