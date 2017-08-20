<template>
  <div class="axis-x">

    <dialog-participant ref="dialog-participant" v-on:closeDialog="onCloseDialog"></dialog-participant>

    <md-layout :md-gutter="this.cols.length">
        <template v-for="(item, index) in this.cols">
          <md-layout md-align="center">
            <md-button @click.native="onShowActorDialog" class="md-primary" :data-id="item.id">{{ item.name }}</md-button>
          </md-layout>
        </template>

    </md-layout>

  </div>
</template>

<script>
import Vue from 'vue'
import 'vue-material/dist/vue-material.css'
import VueMaterial from 'vue-material'
import { _ } from 'underscore'
import { Dialog } from '@/classes/ui/Dialog'
import { Helper } from '@/classes/utils/Helper'
import DialogParticipant from './dialog/DialogParticipant.vue'

Vue.use(VueMaterial)

export default {
  name: 'AxisX',
  components: {
    'dialog-participant': DialogParticipant
  },
  props: ['cols', 'scale'],
  data: function () {
    return {

      // Dialogs
      dialog: new Dialog()

    }
  },

  created: function () {
    console.log('AxisX created')
  },

  destroyed: function () {
  },

  mounted: function () {
    console.log('AxisX mounted')
  },

  updated: function () {
    console.log('AxisX updated')
  },

  methods: {
    onShowActorDialog (event) {
      console.log('onShowActorDialog')
      event.stopPropagation()
      let actionId = event.target.getAttribute('data-id')
      let participant = _.findWhere(this.cols, { id: Helper.parse(actionId) })
      this.$refs['dialog-participant'].open(participant, 'update')
    },

    onCloseDialog (data) {
      this.$emit('closeDialog', data)
    }
  }
}
</script>

<style lang="scss" scoped>

.axis-x {
  position: absolute;
  margin-top: -50px;
  height: 50px;
  width: 100%;
  display: flex;
  justify-content: center;
}

.md-layout {
  flex-wrap: nowrap
}

.md-button {
  width: 100%;
  margin: 0;
  min-width: 0
}

</style>
