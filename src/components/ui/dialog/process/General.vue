<template>
  <div class="general">
    <datetime class="datetime--hidden" v-model="info.start" ref="datetimeStart" type="datetime" :phrases="{ok:'OK', cancel:'Abbrechen'}"></datetime>
    <datetime class="datetime--hidden" v-model="info.end" ref="datetimeEnd" type="datetime" :phrases="{ok:'OK', cancel:'Abbrechen'}"></datetime>

    <md-input-container>
    <label>Bezeichnung</label>
    <md-input type="text" v-model="info.name" ref="focusable" @change="onChangeName"></md-input>
    </md-input-container>

    <md-layout md-gutter>
      <md-layout md-align="start">
          <md-input-container>
          <label>{{ info.event === true ? 'Zeitpunkt' : 'Start'}}</label>
          <md-input type="text" readonly v-model="info.start" @click.native="openDateTimeStart"></md-input>
          </md-input-container>
      </md-layout>
      <md-layout md-align="center" md-flex-offset="5">
          <md-input-container class="input-container-end-date" v-if="info.event === false" md-clearable>
          <label>Ende</label>
          <md-input type="text" readonly v-model="info.end" @click.native="openDateTimeEnd"></md-input>
          </md-input-container>
      </md-layout>
      <md-layout md-align="end" md-flex-offset="5">
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
  </div>
</template>

<script>
import { Process } from '@/classes/model/Process'
import { Datetime }  from 'vue-datetime'
import 'vue-datetime/dist/vue-datetime.css'

import dateFormat from 'dateformat'
import { Settings } from 'luxon'

export default {
  name: 'General',
  components: {
    'datetime': Datetime
  },
  props: [],
  data: function () {
    return {
      process: new Process,
      info: {
        name: '',
        start: '',
        end: '',
        event: false,
        participation: ''
      }
    }
  },

  watch: {
    'info.start': function (dateStringStart) {
      this.process.mStart = new Date(dateStringStart)
      // this.info.start = typeof this.process.start !== 'undefined' && this.process.start !== null ? dateFormat(this.process.start, 'yyyy-mm-dd HH:MM') : ''
      this.info.event = this.process.isEvent()
    },
    'info.end': function (dateStringEnd) {
      console.log('watcher', dateStringEnd)
      /*
      if (dateStringEnd === '') {
        console.log('reset!!')
        this.process.resetEndDate()
        return
      }
      */

      this.process.mEnd = new Date(dateStringEnd)
      console.log('this.process.mEnd', this.process.mEnd)
      // this.info.end = typeof this.process.end !== 'undefined' && this.process.end !== null ? dateFormat(this.process.end, 'yyyy-mm-dd HH:MM') : ''
      this.info.event = this.process.isEvent()
    },
    'info.event': function (eventValue) {
      console.log('info.event', eventValue)
      if (eventValue === true) {
        this.process.mEnd = new Date(this.process.mStart)
      } else {
        this.process.resetEndDate()
        this.info.end = ''
      }
    }

  },
  created: function () {
    console.log('General created')
    Settings.defaultLocale = 'de'
  },

  destroyed: function () {
  },

  mounted: function () {
    console.log('General mounted')

    // move datetime outside when in dialog
    let rootDom = document.querySelector('#app')
    let nodeList = document.querySelectorAll('.md-dialog .datetime--hidden')
    let nodeArray = Array.from(nodeList)

    nodeArray.forEach(element => {
      element.parentNode.removeChild(element)
      rootDom.appendChild(element)
    });

  },

  updated: function () {
    console.log('General updated')
  },

  methods: {
    refresh (process) {
      this.process = process
      this.info.name = typeof this.process.name === 'string' ? this.process.name : ''
      this.info.start = typeof this.process.start !== 'undefined' && this.process.start !== null ? this.process.start.toISOString() : ''
      this.info.end = typeof this.process.end !== 'undefined' && this.process.end !== null ? this.process.end.toISOString() : ''
      this.info.event = this.process.isEvent()
      this.info.participation = typeof this.process.mParticipation !== 'undefined' ? this.process.mParticipation : ''
    },

    onChangeName (name) {
      this.process.mName = name
    },

    onChangeParticipation (string) {
      this.process.mParticipation = string
    },

    openDateTimeStart (ev) {
      this.$refs['datetimeStart'].open(ev)
    },

    openDateTimeEnd (ev) {
      this.$refs['datetimeEnd'].open(ev)

      if (typeof this.info.end === 'string' && this.info.end !== '') return

      this.info.end = this.info.start.valueOf()
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
</style>
