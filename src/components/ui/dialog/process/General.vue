<template>
  <div class="general">
    <md-layout>

      <md-layout :md-gutter="8">
        <md-input-container>
          <label>Bezeichnung</label>
          <md-input type="text" v-model="info.name" ref="focusable" @change="onChangeName" md-clearable></md-input>
        </md-input-container>

        <md-layout md-align="start">
            <md-input-container :class="(startTime.time  !== '' ? 'md-has-value' : '')">
            <label>{{ info.event === true ? 'Zeitpunkt' : 'Start'}}</label>
            <date-picker ref="datepicker-start" :date="startTime" format="YYYY-MM-DD HH:mm" :option="option" :limit="limit" v-on:click="showOnly('datepicker-start')"></date-picker>
            </md-input-container>
        </md-layout>
        <md-layout md-align="center" md-flex-offset="5">
            <md-input-container :class="(endTime.time !== '' ? 'md-has-value' : '')" v-if="info.event === false" md-clearable>
            <label>Ende</label>
            <date-picker ref="datepicker-end" :date="endTime" :option="option" :limit="limit" v-on:click="showOnly('datepicker-end')"></date-picker>
            <button v-if="endTime.time !== ''" type="button" class="md-button md-icon-button md-input-action md-button-clear-time" @click="onRemoveEndTime">
              <md-icon>clear</md-icon>
            </button>
            </md-input-container>
        </md-layout>
        <md-layout md-align="end" md-flex-offset="5">
            <md-layout md-align="center">
                <md-switch v-model="info.event" class="md-primary">Zeitpunkt</md-switch>
            </md-layout>
        </md-layout>

        <md-input-container>
          <label for="participation">Partizipation</label>
          <md-select name="participation" id="participation" v-model="info.participation" @change="onChangeParticipation">
              <md-option value="closed">nicht möglich</md-option>
              <md-option value="open">möglich</md-option>
          </md-select>
        </md-input-container>

      </md-layout>
      <md-layout :md-gutter="8">
        <md-layout class="md-layout-action">
        </md-layout>
      </md-layout>
    </md-layout>
  </div>
</template>

<script>
import { Process } from '@/classes/model/Process'
import datePicker from 'vue-datepicker/vue-datepicker-es6.vue'
import moment from 'moment'

export default {
  name: 'General',
  components: {
    'date-picker': datePicker
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
      },
      placeholder: 'Start',
      startTime: {
        time: ''
      },
      endTime: {
        time: ''
      },
      option: {
        type: 'min',
        week: ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'],
        month: ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'],
        format: 'YYYY-MM-DD HH:mm',
        placeholder: '',
        parentClass: 'md-layout-action',
        inputClass: 'md-input',
        inputStyle: {
          'line-height': '22px',
          'font-size': '16px'
        },
        buttons: {
          ok: 'Ok',
          cancel: 'Abbrechen'
        },
        overlayOpacity: 0.5, // 0.5 as default
        dismissible: true // as true as default
      },
      limit: []
    }
  },

  watch: {
    'startTime.time': function (date) {
      console.log('startTime.time', date)
      this.process.mStart = moment(date).toDate()
      this.info.event = this.process.isEvent()
    },
    'endTime.time': function (date) {
      console.log('endTime.time', date)
      this.process.mEnd = moment(date).toDate()

      if (typeof date === 'undefined' || date === '') {
        this.process.resetEndDate()
        return
      }
      this.info.event = this.process.isEvent()
    },
    'info.event': function (eventValue) {
      if (eventValue === true) {
        this.process.mEnd = new Date(this.process.mStart)
      } else {
        this.onRemoveEndTime()
      }
    }
  },
  created: function () {
    console.log('General created')
  },

  destroyed: function () {
  },

  mounted: function () {
    console.log('General mounted')

    this.$nextTick(() => {
      let nodeList = document.querySelectorAll('.cov-datepicker')
      let nodeArray = Array.from(nodeList)

      nodeArray.forEach(element => {
        element.classList.add('md-input')
      })
    })
  },

  updated: function () {
    console.log('General updated')
  },

  methods: {
    clear () {
      console.log('clear')
      this.$refs['datepicker-start'].visible(false)
      this.$refs['datepicker-end'].visible(false)
    },

    refresh (process) {
      this.process = process
      this.info.name = typeof this.process.name === 'string' ? this.process.name : ''

      this.startTime.time = typeof this.process.start !== 'undefined' && this.process.start !== null ? moment(this.process.start).format('YYYY-MM-DD HH:mm') : ''
      this.endTime.time = typeof this.process.end !== 'undefined' && this.process.end !== null ? moment(this.process.end).format('YYYY-MM-DD HH:mm') : ''

      this.info.event = this.process.isEvent()
      this.info.participation = typeof this.process.mParticipation !== 'undefined' ? this.process.mParticipation : ''
    },

    showOnly (ref) {
      console.log('showOnly', ref)
      this.clear()
      this.$refs[ref].visible(true)
    },

    onChangeName (name) {
      this.process.mName = name
    },

    onRemoveEndTime () {
      this.process.resetEndDate()
      this.endTime.time = ''
    },

    onChangeParticipation (string) {
      this.process.mParticipation = string
    },

    openDateTimeStart (ev) {
      this.$refs['datetimeStart'].open()
    },

    openDateTimeEnd (ev) {
      this.$refs['datetimeEnd'].open()
    }
  }
}
</script>

<style lang="scss">
  $primaryColor: #3f51b5;
  $accepntColor: #e91e63;
  #general {

    .cov-vue-date {
      width: 100%;

      .md-button-clear-time {
        padding: 0;
        margin: 0;
        min-height: 32px;
        height: 32px;
      }
      .datepickbox {
        input.cov-datepicker {
          cursor: pointer;
          height: 100%;
          height: 32px;
        }
      }
    }
  }
</style>
