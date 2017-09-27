<template>
  <div class="dialog-process">
    <md-dialog class="fullscreen-dialog"
      md-ok-text="OK"
      @close="onCloseDialog"
      ref="dialog">
      <md-dialog-content>
        <form novalidate @submit.stop.prevent="submit">
          <md-tabs :md-fixed="true" :md-dynamic-height="true">
            <md-tab id="general" md-label="General">
              <md-input-container>
                <label>Prozess-ID</label>
                <md-input type="text" readonly v-model="process.id"></md-input>
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
                <md-select name="participation" id="participation" v-model="process.participation">
                  <md-option value="closed">nicht möglich</md-option>
                  <md-option value="open">möglich</md-option>
                </md-select>
              </md-input-container>

            </md-tab>

            <md-tab id="info" md-label="Info">
                <md-input-container>
                  <label>Bezeichnung</label>
                  <md-input type="text" v-model="process.name"></md-input>
                </md-input-container>

                <md-input-container>
                  <label>Beschreibung</label>
                  <md-textarea v-model="process.description"></md-textarea>
                </md-input-container>
            </md-tab>

            <md-tab id="locations" md-label="Orte">
              <location-tab :process="process"></location-tab>
            </md-tab>

            <md-tab id="stakeholder" md-label="Beteiligte">
              <stakeholder-tab :process="process" :participants="participants" :stakeholder="stakeholder"></stakeholder-tab>
            </md-tab>

            <md-tab id="transformation" md-label="Transformation">

              <md-layout md-gutter>
                <md-layout md-flex="70" md-vertical-align="center" class="md-subheading">Entscheidung</md-layout>
                <md-layout md-align="end" ><md-switch v-model="process.transformation.mDecision" id="decision" name="decision" class="md-primary"></md-switch></md-layout>
              </md-layout>

              <md-input-container>
                <label for="transformation-type">Art</label>
                <md-select name="transformation-type" id="transformation-type" v-model="process.transformation.type">
                  <md-option value="=">Information</md-option>
                  <md-option value="<">Kreation</md-option>
                  <md-option value=">">Entscheidung</md-option>
                </md-select>
              </md-input-container>

              <md-input-container>
                <label>Hinweis</label>
                <md-input type="text" v-model="process.transformation.info"></md-input>
              </md-input-container>

            </md-tab>

            <md-tab id="results" md-label="Ergebnisse">
              <result-tab :process="process"></result-tab>
            </md-tab>
          </md-tabs>

        </form>
      <!--
      -->
      </md-dialog-content>

      <md-layout md-gutter>
        <md-layout md-align="start"><md-button @click="onRemoveButton" class="md-raised md-primary">Entfernen</md-button></md-layout>
        <md-layout md-align="end"><md-button @click="onCloseButton" class="md-raised md-primary">Schließen</md-button></md-layout>
      </md-layout>

    </md-dialog>
  </div>
</template>

<script>
import Location from './process/Location.vue'
import Stakeholder from './process/Stakeholder.vue'
import Result from './process/Result.vue'

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
    'result-tab': Result
  },
  props: [],
  data: function () {
    return {
      process: new Process(),
      participants: [],
      stakeholder: [],
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
    open (p, c, s, a) {
      console.log('DialogProcess open()')
      console.log(p)
      this.process = p
      this.participants = c
      this.stakeholder = s
      this.setAction(a)

      this.info.start = typeof p.start !== 'undefined' && p.start !== null ? dateFormat(p.start, 'yyyy-mm-dd') : ''
      this.info.end = typeof p.end !== 'undefined' && p.end !== null ? dateFormat(p.end, 'yyyy-mm-dd') : ''
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

    onCloseDialog () {
      this.$emit('closeDialog', { id: this.process.id, response: this.response })
    },

    onChangeStart (dateString) {
      this.process.start = new Date(dateString)
    },

    onChangeEnd (dateString) {
      this.process.end = new Date(dateString)
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
    overflow-y: scroll;
  }

</style>
