<template>
  <div class="dialog-stakeholder">
    <md-dialog
      md-ok-text="OK"
      @close="onCloseDialog"
      ref="dialog">
      <md-dialog-title>Neuer Zuständigkeitsbereich</md-dialog-title>
      <md-dialog-content>

      <form novalidate @submit.stop.prevent="submit">
        <md-input-container>
          <label>Akteur-ID</label>
          <md-input type="text" readonly v-model="stakeholder.id"></md-input>
        </md-input-container>

        <md-input-container>
          <label>Akteur-Name</label>
          <md-input type="text" v-model="stakeholder.name"></md-input>
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
  name: 'DialogStakeholder',
  props: [],
  data: function () {
    return {
      stakeholder: {},
      action: 'create',
      response: 'update'
    }
  },

  created: function () {
    console.log('DialogStakeholder created')
  },

  destroyed: function () {
  },

  mounted: function () {
    console.log('DialogStakeholder mounted')
  },

  updated: function () {
    console.log('DialogStakeholder updated')
  },

  methods: {
    open (s, a) {
      console.log('DialogStakeholder open()')
      console.log(s)
      this.stakeholder = s
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
      this.$emit('closeDialog', { id: this.stakeholder.id, response: this.response })
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
