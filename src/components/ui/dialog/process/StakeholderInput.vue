<template>
  <div class="stakeholder-input">

    <md-card md-with-hover>
      <md-card-content>

        <md-layout md-gutter>
          <md-layout md-flex="70" md-vertical-align="center" class="md-subheading">Ist Teilnehmer</md-layout>
          <md-layout md-align="end" ><md-switch @change="onChangeType" v-model="isParticipant" id="isParticipant" name="isParticipant" class="md-primary"></md-switch></md-layout>
        </md-layout>

        <md-input-container>
          <label for="stakeholder-type">Typ</label>
          <md-select name="stakeholder-type" id="stakeholder-type" v-model="stakeholder.type">
            <md-option v-for="elem in stakeholderEnumType" :value="elem.id" :key="elem.id + '--dialog-stakeholder-choice--input'">{{elem.value}}</md-option>
          </md-select>
        </md-input-container>

        <md-input-container>
          <label>Name</label>
          <md-input placeholder="Name" v-model="stakeholder.name"></md-input>
        </md-input-container>

        <md-input-container>
          <label>Ansprechpartner</label>
          <md-input placeholder="Ansprechpartner" v-model="stakeholder.contact.contactPerson"></md-input>
        </md-input-container>


        <md-input-container>
          <label>Adresse</label>
          <md-input placeholder="Adresse" v-model="stakeholder.contact.postAddress"></md-input>
        </md-input-container>

        <md-input-container>
          <label>Telefon</label>
          <md-input placeholder="Telefon" v-model="stakeholder.contact.phone"></md-input>
        </md-input-container>

        <md-input-container>
          <label>Fax</label>
          <md-input placeholder="Fax" v-model="stakeholder.contact.telefax"></md-input>
        </md-input-container>

        <md-input-container>
          <label>E-Mail</label>
          <md-input placeholder="E-Mail" v-model="stakeholder.contact.email"></md-input>
        </md-input-container>

        <md-input-container>
          <label>Webseite</label>
          <md-input placeholder="Webseite" v-model="stakeholder.contact.website"></md-input>
        </md-input-container>

      </md-card-content>

      <md-button v-if="action !== 'edit'" @click="onAddButton">Hinzufügen</md-button>

    </md-card>

  </div>
</template>

<script>
import { Stakeholder } from '@/classes/model/Stakeholder'

export default {
  name: 'StakeholderInput',
  props: [ 'action' ],
  data: function () {
    return {
      isParticipant: false,
      stakeholder: new Stakeholder(),
      stakeholderEnumType: Stakeholder.EnumType
    }
  },

  created: function () {
    console.log('StakeholderInput created')
  },

  destroyed: function () {
  },

  mounted: function () {
    console.log('StakeholderInput mounted')
  },

  updated: function () {
    console.log('StakeholderInput updated')
  },

  methods: {
    onCloseButton () {
      this.$emit('hide')
    },

    onChangeType () {
      if (this.action !== 'edit') return
      this.$nextTick(function () {
        this.$emit('changeType', { stakeholder: this.stakeholder, isParticipant: this.isParticipant })
      })
    },

    onAddButton () {
      this.$emit('add', { stakeholder: this.stakeholder, isParticipant: this.isParticipant })
      this.stakeholder = new Stakeholder()
    },

    setStakeholder (stakeholder, isParticipant) {
      this.action = 'edit'
      this.stakeholder = stakeholder
      this.isParticipant = isParticipant
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
