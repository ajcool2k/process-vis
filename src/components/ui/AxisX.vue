<template>
  <div class="axis-x">
    
    <md-layout :md-gutter="this.cols.length">

        <template v-for="(item, index) in this.cols">
          <md-layout md-align="center">
            <md-button @click.native="onShowActorDialog" class="md-primary" :data-id="item.id">{{ item.name }}</md-button>
          </md-layout>
        </template>
    
    </md-layout>

      <md-dialog-alert
        :md-content-html="dialog.showActorDialog.content"
        :md-ok-text="dialog.showActorDialog.ok"
        @close="onCloseShowActorDialog"
        ref="showActorDialog">
      </md-dialog-alert>
  </div>
</template>

<script>

import Vue from 'vue'
import 'vue-material/dist/vue-material.css'
import VueMaterial from 'vue-material'
import { _ } from 'underscore'
import { Dialog } from '@/classes/ui/Dialog'
import { Helper } from '@/classes/utils/Helper'

Vue.use(VueMaterial)

export default {
  name: 'AxisX',
  props: ['cols', 'scale'],
  data: function () {
    return {

      // Dialogs
      dialog: Dialog.useAll()

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
      let a = _.findWhere(this.cols, { id: Helper.parse(actionId) })
      Dialog.setActorDialog(a)
      this.$refs['showActorDialog'].open()
    },

    onCloseShowActorDialog (type) {}

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

.md-button {
  width: 100%;
  margin: 0;
}

</style>
