<template>
  <div class="stakeholder">
    <div class="stakeholder-table" v-if="showInput === false">
      <md-table>
        <md-table-header>
          <md-table-row>
            <md-table-head>Name</md-table-head>
            <md-table-head class="center">Initiator</md-table-head>
            <md-table-head class="center">Delegierter</md-table-head>
            <md-table-head class="center">Teilnehmer</md-table-head>
            <md-table-head class="center">Sonstiger</md-table-head>
            <md-table-head>&nbsp;</md-table-head>
          </md-table-row>
        </md-table-header>

        <md-table-body>
          <md-table-row v-for="(elem, index) in matrix" :key="index+'--matrix'">
            <md-table-cell class="person"><md-icon>person</md-icon>{{elem.name}}</md-table-cell>
            <!-- <md-table-cell>{{elem.type}}</md-table-cell> -->
            <md-table-cell class="center matrix-cell" v-html="elem.initiator"></md-table-cell>
            <md-table-cell class="center matrix-cell" v-html="elem.delegate"></md-table-cell>
            <md-table-cell class="center matrix-cell" v-html="elem.participant"></md-table-cell>
            <md-table-cell class="center matrix-cell" v-html="elem.other"></md-table-cell>
            <md-table-cell class="action">
              <md-button class="md-icon-button md-raised" @click="onEditInput(elem.id)"><md-icon>edit</md-icon></md-button>
              <md-button :disabled="elem.participant === '' && elem.other === ''" class="md-icon-button md-raised" @click="onRemove(elem.id)"><md-icon>delete</md-icon></md-button>
            </md-table-cell>
          </md-table-row>
        </md-table-body>
      </md-table>
    </div>

    <md-button class="md-raised showButton" @click="onShowInput($event)">Erstellen</md-button>
    <!-- <md-button class="md-raised choiceButton" @click="onShowChoice($event)">Auswählen</md-button> -->

    <stakeholder-input ref="stakeholder-input" v-if="showInput" :action="action" v-on:add="onAdd" v-on:changeType="onChangeType"></stakeholder-input>

  </div>
</template>

<script>
import { Metadata } from '@/classes/model/Metadata'
import { Stakeholder } from '@/classes/model/Stakeholder'

import StakeholderInput from './StakeholderInput.vue'

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
      this.initiator = this.getStakeholder(this.process.initiator).mName
      const symbol = '&#x2713;'

      let isParticipant = (id) => {
        return this.process.participants.indexOf(id) > -1 ? symbol : ''
      }

      // add initaitor
      let mapA = [ { id: this.process.initiator, name: this.getStakeholder(this.process.initiator).mName, type: this.getStakeholder(this.process.initiator).type, initiator: symbol, delegate: '', participant: '', other: '' } ]
      // add delegates
      let mapB = this.process.mDelegates.map(id => { return { id: id, name: this.getStakeholder(id).mName, type: this.getStakeholder(id).type, initaitor: '', delegate: symbol, participant: isParticipant(id), other: '' } })
      // add participants
      let mapC = this.process.participants.filter(id => this.process.mDelegates.indexOf(id) === -1).map(id => { return { id: id, name: this.getStakeholder(id).mName, type: this.getStakeholder(id).type, initaitor: '', delegate: '', participant: symbol, other: '' } })
      // add others
      let mapD = this.process.stakeholder.filter(id => this.process.participants.indexOf(id) === -1 && id && this.process.mDelegates.indexOf(id) === -1 && id !== this.process.initiator).map(id => { return { id: id, name: this.getStakeholder(id).mName, type: this.getStakeholder(id).type, initaitor: '', delegate: '', other: symbol } })

      this.matrix = mapA.concat(mapB.concat(mapC.concat(mapD)))
    },

    onEditInput (id) {
      this.dom.showButton.innerHTML = 'Ausblenden'
      this.action = 'edit'
      let stakeholder = Metadata.getStakeholder().find(elem => elem.id === id)
      this.showInput = true
      let isParticipant = this.process.participants.indexOf(stakeholder.id) > -1
      this.$nextTick(function () {
        this.$refs['stakeholder-input'].setStakeholder(stakeholder, isParticipant)
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
      this.process.removeParticipant(id)
      this.process.removeStakeholder(id)
      this.refresh(this.process)
    },

    onAdd (data) {
      console.log('onAdd', data)
      this.process.addStakeholder(data.stakeholder)
      if (data.isParticipant === true) this.process.addParticipant(data.stakeholder.id)
      this.refresh(this.process)
    },

    onChangeType (data) {
      if (data.isParticipant === true) {
        this.process.addParticipant(data.stakeholder.id)
      } else {
        this.process.removeParticipant(data.stakeholder.id)
      }
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

#stakeholder {

  td.person > div {
    display: inline;

    i {
      padding-right: 30px
    }
  }

  .center {
    text-align: center;
  }

 .matrix-cell {
    font-size: 12pt;
    font-weight: bold;
  }

  .showButton {
    margin-top: 30px;
  }
}




</style>
