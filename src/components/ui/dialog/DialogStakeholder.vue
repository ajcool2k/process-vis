<template>
  <div>
    <md-dialog
      class="dialog-stakeholder"
      md-ok-text="OK"
      @close="emitEvent(initiator.id)"
      ref="dialog">
      <md-dialog-title>Neuer Zuständigkeitsbereich</md-dialog-title>
      <md-dialog-content>

      <form novalidate @submit.stop.prevent="submit">

        <md-input-container>
          <label for="stakeholder">Auswahl</label>
          <md-select name="stakeholder" id="stakeholder" :value="initiator.id" @change="onChange">
            <md-option v-for="(item, index) in stakeholder" :data-name="item.name"  :value="item.id" :key="item.id + '--dialog-stakeholder-choice'">{{item.name}}</md-option>
          </md-select>
        </md-input-container>

        <md-input-container>
          <label>Akteur-ID</label>
          <md-input type="text" readonly v-model="initiator.id"></md-input>
        </md-input-container>

        <md-input-container>
          <label>Akteur-Name</label>
          <md-input type="text" v-model="initiator.name" @change="onChangeName"></md-input>
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
      stakeholder: [],
      initiator: {},
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
    open (i, s, a) {
      console.log('DialogStakeholder open()')
      console.log(i)
      this.update(i, s, a)
      this.$refs['dialog'].open()
    },

    update (i, s, a) {
      this.initiator = i
      this.stakeholder = s
      this.setAction(a)
    },

    setAction (a) {
      if (['create', 'update'].indexOf(a) === -1) {
        console.warn('setAction - action not a valid value', a)
        return
      }

      this.action = a
    },

    onChange (id) {
      console.log('onChange', id)
      if (typeof this.$refs['dialog'].close !== 'function') return

      this.emitEvent(id)
    },

    onChangeName () {
      console.log('onChangeName')
      this.stakeholder = this.stakeholder.map(elem => elem)
      document.querySelector('.dialog-stakeholder .md-select-value').innerHTML = this.initiator.name
    },

    onCloseButton () {
      this.response = 'update'
      this.$refs['dialog'].close()
    },

    onRemoveButton () {
      this.response = 'remove'
      this.$refs['dialog'].close()
    },

    emitEvent (id) {
      this.$emit('updateStakeholder', { id: id, previousId: this.initiator.id, response: this.response })
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
