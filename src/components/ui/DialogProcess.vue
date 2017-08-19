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
          <md-select name="participant" id="participant" v-model="process.participant">
            <template v-for="(item, index) in cols">
              <md-option :value="item.id">{{ item.name }}</md-option>
            </template>
          </md-select>
        </md-input-container>

        <md-input-container>
          <label>Partizipation</label>
          <md-input type="text" v-model="process.access"></md-input>
        </md-input-container>

        <md-input-container>
          <label>Start</label>
          <md-input type="date" v-model="info.begin" @change="onChangeBegin"></md-input>
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
      cols: {},
      info: {
        begin: '',
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
      this.cols = c
      this.setAction(a)

      this.info.begin = typeof p.begin !== 'undefined' ? dateFormat(p.begin, 'yyyy-mm-dd') : ''
      this.info.end = typeof p.end !== 'undefined' ? dateFormat(p.end, 'yyyy-mm-dd') : ''
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

    onChangeBegin (dateString) {
      this.process.begin = new Date(dateString)
    },

    onChangeEnd (dateString) {
      this.process.end = new Date(dateString)
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
