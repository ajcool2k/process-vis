<template>
  <div class="dialog-process">
    <md-dialog class="fullscreen-dialog"
      md-ok-text="OK"
      @close="onCloseDialog"
      ref="dialog">
      <md-dialog-content>
        <form novalidate @submit.stop.prevent="onCloseButton">
          <md-tabs v-on:change="activeTab" :md-fixed="true" :md-dynamic-height="true" :data-tab="tab">
            <md-tab id="general" md-label="Allgemein" :md-active="tab === 0">
              <general-tab :process="process" ref="general-tab"></general-tab>
            </md-tab>

            <md-tab id="info" md-label="Info" :md-active="tab === 1">

                <md-input-container>
                  <label>Aktenzeichen</label>
                  <md-input type="text" v-model="info.reference" @change="onChangeReference"></md-input>
                </md-input-container>

                <md-input-container>
                  <label>Beschreibung</label>
                  <md-textarea v-model="info.description" @change="onChangeDescription"></md-textarea>
                </md-input-container>
            </md-tab>

            <md-tab id="connections" md-label="Verbindungen" :md-active="tab === 2">
              <div v-if="parent">
                <connection-tab :process="process" :parent="parent"></connection-tab>
              </div>
              <div v-else>
                Die Verbindungsansicht steht nur für Teilschritte zur Verfügung.
              </div>
            </md-tab>

            <md-tab id="locations" md-label="Orte" :md-active="tab === 3">
              <location-tab :process="process"></location-tab>
            </md-tab>

            <md-tab id="stakeholder" md-label="Beteiligte" :md-active="tab === 4">
              <stakeholder-tab :process="process" ref="stakeholder-tab"></stakeholder-tab>
            </md-tab>

            <md-tab id="transformation" md-label="Transformation" :md-active="tab === 5">
              <transformation-tab :process="process"></transformation-tab>
            </md-tab>

            <md-tab id="results" md-label="Ergebnisse" :md-active="tab === 6">
              <result-tab :process="process"></result-tab>
            </md-tab>
          </md-tabs>

        </form>
      </md-dialog-content>

      <md-layout md-gutter class="bottom-bar">
        <md-layout md-align="start"><md-button @click="onRemoveButton" class="md-raised md-primary">Entfernen</md-button></md-layout>
        <md-layout v-if="isChildProcess" md-align="center" md-flex="60">
          <md-button class="md-raised md-accent" @click="onChangeProcess('child')">Öffnen</md-button>
        </md-layout>
        <md-layout md-align="end"><md-button @click="onCloseButton" class="md-raised md-primary">Schließen</md-button></md-layout>
      </md-layout>

    </md-dialog>
  </div>
</template>

<script>
import General from './process/General.vue'
import Connection from './process/Connection.vue'
import Location from './process/Location.vue'
import Stakeholder from './process/Stakeholder.vue'
import Result from './process/Result.vue'
import Transformation from './process/Transformation.vue'

import { Process } from '@/classes/model/Process'

export default {
  name: 'DialogProcess',
  components: {
    'general-tab': General,
    'connection-tab': Connection,
    'location-tab': Location,
    'stakeholder-tab': Stakeholder,
    'result-tab': Result,
    'transformation-tab': Transformation
  },
  props: [],
  data: function () {
    return {
      dom: {},
      process: new Process(),
      parent: null,
      tab: 0,
      isChildProcess: true,
      info: {
        reference: '',
        description: ''
      },
      action: 'create',
      response: 'update'
    }
  },

  created: function () {
    console.log('DialogProcess created')
  },

  destroyed: function () {
  },

  mounted: function () {
    console.log('DialogProcess mounted')
  },

  updated: function () {
    console.log('DialogProcess updated')
  },

  methods: {
    open (child, a, isChildProcess, tab, parent) {
      console.log('DialogProcess open()')
      this.process = child
      this.parent = parent
      this.setAction(a)
      this.isChildProcess = isChildProcess === true
      this.tab = typeof tab === 'number' ? tab : 0

      this.info.reference = typeof this.process.mReference !== 'undefined' ? this.process.mReference : ''
      this.info.description = typeof this.process.mDescription !== 'undefined' ? this.process.mDescription : ''

      this.$refs['general-tab'].refresh(this.process)
      this.$refs['stakeholder-tab'].refresh(this.process)
      this.$refs['dialog'].open()

    },

    setAction (a) {
      if (['create', 'update'].indexOf(a) === -1) {
        console.warn('setAction - action not a valid value', a)
        return
      }

      this.action = a
    },

    onCloseButton () {
      this.response = 'update'
      this.$refs['dialog'].close()
    },

    onRemoveButton () {
      this.response = 'remove'
      this.$refs['dialog'].close()
    },

    onChangeProcess (layer) {
      this.response = 'changeProcess-' + layer
      this.$refs['dialog'].close()
    },

    onCloseDialog () {
      this.$emit('closeDialog', { id: this.process.id, response: this.response })
    },

    onChangeReference (string) {
      this.process.mReference = string
    },

    onChangeDescription (string) {
      this.process.mDescription = string
    },

    resetScrollbar () {
      setTimeout(() => {
        this.dom.tabContainer.style.overflowY = 'hidden'
        this.dom.tabContainer.style.overflowY = 'auto'
      }, 1000)
    },

    activeTab (index) {
      this.tab = index

      if (this.dom.hasOwnProperty('tabContainer') === false) {
        this.dom.navButtonList = document.querySelectorAll('button.md-tab-header')
        this.dom.tabContainer = document.querySelector('.md-tabs-content')
        this.dom.tabList = document.querySelectorAll('.md-tab')
      }

      this.resetScrollbar() // async

      this.dom.tabList.forEach(tab => { tab.style.display = 'none' })

      let activeTab = this.dom.tabList[index]
      activeTab.style.display = 'inline-block'
    }
  }
}
</script>

<style lang="scss">

$primaryColor: #3f51b5;
$accepntColor: #e91e63;

  .fullscreen-dialog .md-dialog {
    // position: absolute;
    // top: 20%;
    width: 90%;
    max-height: 90%;

    .md-tab-indicator {
      height: 0
    }

    button.md-active {
      background: $accepntColor
    }
  }

  .fullscreen-dialog .md-tabs-content {
    max-height: 700px;
    overflow-y: hidden;
  }

  .fullscreen-dialog .bottom-bar {
    padding: 0 24px 24px
  }

</style>
