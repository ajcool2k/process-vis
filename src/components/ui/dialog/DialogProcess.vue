<template>
  <div class="dialog-process">
    <md-dialog
      md-ok-text="OK"
      @close="onCloseDialog"
      ref="dialog">
      <md-dialog-title>Neuer Prozess</md-dialog-title>
      <md-dialog-content>

      <form novalidate @submit.stop.prevent="submit">
        <md-input-container>
          <label>Prozess-ID</label>
          <md-input type="text" readonly v-model="process.id"></md-input>
        </md-input-container>

        <md-input-container>
          <label for="participant">Verantwortlicher</label>
          <md-select name="participant" id="participant" v-model="process.initiator">
            <template v-for="(item, index) in participants">
              <md-option :value="item">{{ item }}</md-option>
            </template>
          </md-select>
        </md-input-container>

        <md-input-container>
          <label>Partizipation</label>
          <md-input type="text" v-model="process.participation"></md-input>
        </md-input-container>

        <md-input-container>
          <label>Start</label>
          <md-input type="date" v-model="info.start" @change="onChangeStart"></md-input>
        </md-input-container>

        <md-input-container>
          <label>Ende</label>
          <md-input type="date" v-model="info.end" @change="onChangeEnd"></md-input>
        </md-input-container>

        <md-button @click="onRemoveButton" class="md-raised md-primary">Entfernen</md-button>
        <md-button @click="onCloseButton" class="md-raised md-primary">Schließen</md-button>

      </form>
      </md-dialog-content>
    </md-dialog>
  </div>
</template>

<script>
import dateFormat from 'dateformat'
import Vue from 'vue'
import 'vue-material/dist/vue-material.css'
import VueMaterial from 'vue-material'
Vue.use(VueMaterial)

export default {
  name: 'DialogProcess',
  props: [],
  data: function () {
    return {
      process: {},
      participants: {},
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
    open (p, c, a) {
      console.log('DialogProcess open()')
      console.log(p)
      this.process = p
      this.participants = c
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

<style lang="scss" scoped>
</style>
