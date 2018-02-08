<template>
  <div class="dialog-process">
    <datetime class="datetime--hidden" v-model="info.start" ref="datetimeStart" type="datetime" input-format="YYYY-MM-DD HH:mm" moment-locale="de" monday-first :i18n="{ok:'OK', cancel:'Abbrechen'}"></datetime>
    <datetime class="datetime--hidden" v-model="info.end" ref="datetimeEnd" type="datetime" input-format="YYYY-MM-DD HH:mm" moment-locale="de" :min-date="info.start" monday-first :i18n="{ok:'OK', cancel:'Abbrechen'}"></datetime>

    <md-dialog class="fullscreen-dialog"
      md-ok-text="OK"
      @close="onCloseDialog"
      ref="dialog">
      <md-dialog-content>
        <form novalidate @submit.stop.prevent="onCloseButton">
          <md-tabs v-on:change="activeTab" :md-fixed="true" :md-dynamic-height="true" :data-tab="tab">
            <md-tab id="general" md-label="Allgemein" :md-active="tab === 0">
              <md-input-container>
                <label>Bezeichnung</label>
                <md-input type="text" v-model="info.name" @change="onChangeName"></md-input>
              </md-input-container>

              <md-layout md-gutter>
                <md-layout md-align="start">
                  <md-input-container>
                    <label>{{ info.event === true ? 'Zeitpunkt' : 'Start'}}</label>
                    <md-input type="text" readonly v-model="info.start" @click.native="openDateTimeStart"></md-input>
                  </md-input-container>
                </md-layout>
                <md-layout md-align="center">
                  <md-input-container class="input-container-end-date" v-if="info.event === false" md-clearable>
                    <label>Ende</label>
                    <md-input type="text" readonly v-model="info.end" @click.native="openDateTimeEnd"></md-input>
                  </md-input-container>
                </md-layout>
                <md-layout md-align="end">
                    <md-layout md-align="center">
                      <md-switch v-model="info.event" class="md-primary">Zeitpunkt</md-switch>
                    </md-layout>
                </md-layout>
              </md-layout>

              <md-input-container>
                <label for="participation">Partizipation</label>
                <md-select name="participation" id="participation" v-model="info.participation" @change="onChangeParticipation">
                  <md-option value="closed">nicht möglich</md-option>
                  <md-option value="open">möglich</md-option>
                </md-select>
              </md-input-container>

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

            <md-tab id="locations" md-label="Orte" :md-active="tab === 2">
              <location-tab :process="process"></location-tab>
            </md-tab>

            <md-tab id="stakeholder" md-label="Beteiligte" :md-active="tab === 3">
              <stakeholder-tab :process="process" ref="stakeholder-tab"></stakeholder-tab>
            </md-tab>

            <md-tab id="transformation" md-label="Transformation" :md-active="tab === 4">
              <transformation-tab :process="process"></transformation-tab>
            </md-tab>

            <md-tab id="results" md-label="Ergebnisse" :md-active="tab === 5">
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
import { Datetime }  from 'vue-datetime-2'

export default {
  name: 'DialogProcess',
  components: {
    'location-tab': Location,
    'stakeholder-tab': Stakeholder,
    'result-tab': Result,
    'transformation-tab': Transformation,
    'datetime': Datetime
  },
  props: [],
  data: function () {
    return {
      dom: {},
      process: new Process(),
      tab: 0,
      showProcessButton: false,
      info: {
        name: '',
        start: '',
        end: '',
        event: false,
        participation: '',
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
  watch: {
    'info.start': function (dateStringStart) {
      this.process.mStart = new Date(dateStringStart)
      this.info.start = typeof this.process.start !== 'undefined' && this.process.start !== null ? dateFormat(this.process.start, 'yyyy-mm-dd HH:MM') : ''
      this.info.event = this.process.isEvent()
    },
    'info.end': function (dateStringEnd) {
      if (dateStringEnd === '') {
        this.process.resetEndDate()
        return
      }

      this.process.mEnd = new Date(dateStringEnd)
      this.info.end = typeof this.process.end !== 'undefined' && this.process.end !== null ? dateFormat(this.process.end, 'yyyy-mm-dd HH:MM') : ''
      this.info.event = this.process.isEvent()
    },
    'info.event': function (eventValue) {
      if (eventValue === true) {
        this.process.mEnd = new Date(this.process.mStart)
      } else {
        this.process.resetEndDate()
        this.info.end = ''
      }
    }

  },
  methods: {
    open (child, a, showProcessButton, tab) {
      console.log('DialogProcess open()')
      console.log(child)
      this.process = child
      this.setAction(a)
      this.showProcessButton = showProcessButton === true
      this.tab = typeof tab === 'number' ? tab : 0

      this.info.name = typeof this.process.mName === 'string' ? this.process.mName : ''
      this.info.start = typeof this.process.start !== 'undefined' && this.process.start !== null ? dateFormat(this.process.start, 'yyyy-mm-dd HH:MM') : ''
      this.info.end = typeof this.process.end !== 'undefined' && this.process.end !== null ? dateFormat(this.process.end, 'yyyy-mm-dd HH:MM') : ''
      this.info.event = this.process.isEvent()
      this.info.participation = typeof this.process.mParticipation !== 'undefined' ? this.process.mParticipation : ''
      this.info.reference = typeof this.process.mReference !== 'undefined' ? this.process.mReference : ''
      this.info.description = typeof this.process.mDescription !== 'undefined' ? this.process.mDescription : ''

      this.$refs['stakeholder-tab'].refresh(this.process)
      this.$refs['dialog'].open()

      // Fix initial scrollbar
      // this.resetScrollbar()
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

    onChangeName (name) {
      this.process.mName = name
    },

    onChangeParticipation (string) {
      this.process.mParticipation = string
    },

    onChangeReference (string) {
      this.process.mReference = string
    },

    onChangeDescription (string) {
      this.process.mDescription = string
    },

    openDateTimeStart (ev) {
      this.$refs['datetimeStart'].open()
    },

    openDateTimeEnd (ev) {


      this.$refs['datetimeEnd'].open()

      if (this.info.end instanceof Date) return

      // parse date from process.start
      let startDate = this.$refs['datetimeStart'].getNewDate()
      let sdate = new Date(startDate._i)

      this.$refs['datetimeEnd'].selectYear(sdate.getFullYear())
      this.$refs['datetimeEnd'].selectMonth(sdate.getMonth())
      this.$refs['datetimeEnd'].selectDay(sdate.getDate())
      this.$refs['datetimeEnd'].selectHour(sdate.getHours())
      this.$refs['datetimeEnd'].selectMinute(sdate.getMinutes())
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

  .datetime--hidden {
    .vdatetime-fade-enter-active,
    .vdatetime-fade-leave-active {
        transition: none !important;
    }

    .vdatetime-slot__available, .vdatetime-slot__not-available {
      display: none;
    }

    .vdatetime-popup__month-selector__next, .vdatetime-popup__month-selector__previous {
      padding: 0;
    }

    .vdatetime-popup__header,
    .vdatetime-popup__date-picker__item--selected > span > span,
    .vdatetime-popup__date-picker__item--selected:hover > span > span {
        background: $primaryColor;
    }

    > input[type=text] {
      display: none
    }
  }

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

    .input-container-end-date {
      margin-left: 20px;
      margin-right: 20px;
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
