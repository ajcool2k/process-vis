<template>
  <div class="dialog-participant">
    <md-dialog
      md-ok-text="OK"
      @close="onCloseDialog"
      ref="dialog">
      <md-dialog-title>Neuer Zuständigkeitsbereich</md-dialog-title>
      <md-dialog-content>

      <form novalidate @submit.stop.prevent="submit">
        <md-input-container>
          <label>Akteur-ID</label>
          <md-input type="text" readonly v-model="participant.id"></md-input>
        </md-input-container>

        <md-input-container>
          <label>Akteur-Name</label>
          <md-input type="text" v-model="participant.name"></md-input>
        </md-input-container>

        <md-button @click="onRemoveButton" class="md-raised md-primary">Entfernen</md-button>
        <md-button @click="onCloseButton" class="md-raised md-primary">Schließen</md-button>

      </form>
      </md-dialog-content>
    </md-dialog>
  </div>
</template>

<script>
import Vue from 'vue'
import 'vue-material/dist/vue-material.css'
import VueMaterial from 'vue-material'
Vue.use(VueMaterial)

export default {
  name: 'DialogParticipant',
  props: [],
  data: function () {
    return {
      participant: {},
      action: 'create',
      response: 'update'
    }
  },

  created: function () {
    console.log('DialogParticipant created')
  },

  destroyed: function () {
  },

  mounted: function () {
    console.log('DialogParticipant mounted')
  },

  updated: function () {
    console.log('DialogParticipant updated')
  },

  methods: {
    open (p, a) {
      console.log('DialogParticipant open()')
      console.log(p)
      this.participant = p
      this.setAction(a)

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
      this.$emit('closeDialog', { id: this.participant.id, response: this.response })
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
