<template>
  <div class="dialog-process">
    <md-dialog class="fullscreen-dialog"
      md-ok-text="OK"
      @close="onCloseDialog"
      ref="dialog">
      <md-dialog-content>
        <form novalidate @submit.stop.prevent="submit">
          <md-tabs v-on:change="activeTab" :md-fixed="true" :md-dynamic-height="true">
            <md-tab id="general" md-label="General">
              <md-input-container>
                <label>Prozess-ID</label>
                <md-input type="text" readonly v-model="process.id"></md-input>
              </md-input-container>

              <md-input-container>
                <label>Eltern-ID</label>
                <md-input type="text" readonly v-model="process.parent"></md-input>
              </md-input-container>

              <md-input-container>
                <label>Start</label>
                <md-input type="date" v-model="info.start" @change="onChangeStart"></md-input>
              </md-input-container>

              <md-input-container>
                <label>Ende</label>
                <md-input type="date" v-model="info.end" @change="onChangeEnd"></md-input>
              </md-input-container>

              <md-input-container>
                <label for="participation">Partizipation</label>
                <md-select name="participation" id="participation" v-model="process.mParticipation">
                  <md-option value="closed">nicht möglich</md-option>
                  <md-option value="open">möglich</md-option>
                </md-select>
              </md-input-container>

            </md-tab>

            <md-tab id="info" md-label="Info">
                <md-input-container>
                  <label>Bezeichnung</label>
                  <md-input type="text" v-model="process.mName"></md-input>
                </md-input-container>

                <md-input-container>
                  <label>Aktenzeichen</label>
                  <md-input type="text" v-model="process.mReference"></md-input>
                </md-input-container>

                <md-input-container>
                  <label>Beschreibung</label>
                  <md-textarea v-model="process.mDescription"></md-textarea>
                </md-input-container>
            </md-tab>

            <md-tab id="locations" md-label="Orte">
              <location-tab :process="process"></location-tab>
            </md-tab>

            <md-tab id="stakeholder" md-label="Beteiligte">
              <stakeholder-tab :process="process"></stakeholder-tab>
            </md-tab>

            <md-tab id="transformation" md-label="Transformation">
              <transformation-tab :process="process"></transformation-tab>
            </md-tab>

            <md-tab id="results" md-label="Ergebnisse">
              <result-tab :process="process"></result-tab>
            </md-tab>
          </md-tabs>

        </form>
      </md-dialog-content>

      <md-layout md-gutter class="bottom-bar">
        <md-layout md-align="start"><md-button @click="onRemoveButton" class="md-raised md-primary">Entfernen</md-button></md-layout>
        <md-layout v-if="showProcessButton" md-align="center" md-flex="60">
          <md-button class="md-raised md-accent" @click="onChangeProcess('child')">Öffnen</md-button>
        </md-layout>
        <md-layout md-align="end"><md-button @click="onCloseButton" class="md-raised md-primary">Schließen</md-button></md-layout>
      </md-layout>

    </md-dialog>
  </div>
</template>

<script>
import Location from './process/Location.vue'
import Stakeholder from './process/Stakeholder.vue'
import Result from './process/Result.vue'
import Transformation from './process/Transformation.vue'

import { Process } from '@/classes/model/Process'

import dateFormat from 'dateformat'
import Vue from 'vue'
import 'vue-material/dist/vue-material.css'
import VueMaterial from 'vue-material'
Vue.use(VueMaterial)

export default {
  name: 'DialogProcess',
  components: {
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
      showProcessButton: false,
      info: {
        start: '',
        end: ''
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
    open (child, a, showProcessButton) {
      console.log('DialogProcess open()')
      console.log(child)
      this.process = child
      this.setAction(a)
      this.showProcessButton = showProcessButton === true

      this.info.start = typeof child.start !== 'undefined' && child.start !== null ? dateFormat(child.start, 'yyyy-mm-dd') : ''
      this.info.end = typeof child.end !== 'undefined' && child.end !== null ? dateFormat(child.end, 'yyyy-mm-dd') : ''
      this.$refs['dialog'].open()

      // Fix initial scrollbar
      this.resetScrollbar()
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

    onChangeStart (dateString) {
      this.process.start = new Date(dateString)
    },

    onChangeEnd (dateString) {
      this.process.end = new Date(dateString)
    },

    resetScrollbar () {
      this.dom.tabContainer.style.overflowY = 'hidden'
      setTimeout(() => { this.dom.tabContainer.style.overflowY = 'auto' }, 1000)
    },

    activeTab (index) {
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
  .fullscreen-dialog .md-dialog {
    // position: absolute;
    // top: 20%;
    width: 90%;
    max-height: 90%;
  }

  .fullscreen-dialog .md-tabs-content {
    max-height: 700px;
    overflow-y: hidden;
  }

  .fullscreen-dialog .bottom-bar {
    padding: 0 24px 24px
  }

</style>
