<template>
  <md-dialog
    class="dialog-stakeholder"
    md-ok-text="OK"
    @close="emitEvent(initiator.id)"
    ref="dialog">
    <md-dialog-title>Zuständigkeitsbereich</md-dialog-title>
    <md-dialog-content>
      <md-input-container>
        <label for="stakeholder">Auswahl</label>
        <md-select name="stakeholder" id="stakeholder" @change="onChange">
          <md-option disabled value="">Auswahl Stakeholder</md-option>
          <md-option v-for="item in stakeholder" :value="item.id" :key="item.id + '--dialog-stakeholder-choice'">{{item.mName}}</md-option>
        </md-select>
      </md-input-container>

      <md-input-container>
        <label>Bezeichnung</label>
        <md-input type="text" v-model="initiator.name"></md-input>
      </md-input-container>

      <md-input-container>
        <label for="stakeholder-type">Typ</label>
        <md-select name="stakeholder-type" id="stakeholder-type" v-model="initiator.type">
          <md-option value="person">Person</md-option>
          <md-option value="group">Gruppe</md-option>
        </md-select>
      </md-input-container>
    </md-dialog-content>

    <md-dialog-actions>
      <md-button @click="onRemoveButton" class="md-raised">Entfernen</md-button>
      <md-button @click="onCloseButton" class="md-raised md-primary">Schließen</md-button>
    </md-dialog-actions>
  </md-dialog>
</template>

<script>
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
