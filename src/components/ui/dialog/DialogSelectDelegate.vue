<template>
  <div>
    <md-dialog
      class="dialog-stakeholder-add"
      md-ok-text="OK"
      @close="emitEvent(initiator.id)"
      ref="dialog">
      <md-dialog-title>Neuer Zuständigkeitsbereich</md-dialog-title>
      <md-dialog-content>
        <div v-if="initiator">
          <md-checkbox v-model="useExisting">Bestehenden Stakeholder verwenden</md-checkbox>

          <md-input-container v-if="useExisting === true">
            <label for="stakeholder">Auswahl</label>
            <md-select name="stakeholder" id="stakeholder" @change="onChange">
              <md-option disabled value="">Auswahl Stakeholder</md-option>
              <md-option v-for="item in stakeholder" :value="item.id" :key="item.id + '--dialog-stakeholder-add-choice'">{{item.mName}}</md-option>
            </md-select>
          </md-input-container>

          <md-input-container v-if="useExisting === false">
            <label>Bezeichnung</label>
            <md-input type="text" v-model="initiator.name" placeholder="Bezeichnung"></md-input>
          </md-input-container>

          <md-input-container v-if="useExisting === false">
            <label for="stakeholder-type">Typ</label>
            <md-select name="stakeholder-type" id="stakeholder-type" v-model="initiator.type">
              <md-option v-for="elem in stakeholderEnumType" :value="elem.id" :key="elem.id + '--dialog-select-delegate-choice--input'">{{elem.value}}</md-option>
            </md-select>
          </md-input-container>
        </div>
      </md-dialog-content>
      <md-dialog-actions>
        <md-button @click="onCloseButton" class="md-raised">Abbrechen</md-button>
        <md-button @click="onAcceptButton" class="md-raised md-primary">Auswählen</md-button>
      </md-dialog-actions>
    </md-dialog>
  </div>
</template>

<script>
import { Metadata } from '@/classes/model/Metadata'
import { Stakeholder } from '@/classes/model/Stakeholder'

export default {
  name: 'DialogSelectDelegate',
  props: [],
  data: function () {
    return {
      stakeholder: Metadata.getStakeholder(),
      stakeholderEnumType: Stakeholder.EnumType,
      selectedStakeholder: null,
      initiator: null,
      useExisting: false,
      response: ''
    }
  },

  created: function () {
    console.log('DialogSelectDelegate created')
  },

  destroyed: function () {
  },

  mounted: function () {
    console.log('DialogSelectDelegate mounted')
  },

  updated: function () {
    console.log('DialogSelectDelegate updated')
  },

  methods: {
    open () {
      console.log('DialogSelectDelegate open()')
      this.initiator = new Stakeholder()
      this.selectedStakeholder = null
      this.response = ''
      this.$refs['dialog'].open()
    },

    onAcceptButton () {
      this.response = 'add'
      this.$refs['dialog'].close()
    },

    onChange (v) {
      this.selectedStakeholder = this.stakeholder.find(elem => elem.id === v)
    },

    onCloseButton () {
      this.response = 'close'
      this.$refs['dialog'].close()
    },

    emitEvent (id) {
      if (this.response === '') return

      let initiator = this.useExisting && this.selectedStakeholder ? this.selectedStakeholder : this.initiator
      this.$emit('delegateSelect', { initiator: initiator, response: this.response })
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
