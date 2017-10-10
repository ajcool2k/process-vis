<template>
  <div class="axis-x">

    <dialog-stakeholder ref="dialog-stakeholder" v-on:closeDialog="onCloseDialog"></dialog-stakeholder>
    <md-layout v-if="(this.participants.length > 0)" :md-gutter="this.participants.length">
        <template v-for="(item, index) in this.participants">
          <md-layout :key="item" md-align="center">
            <md-button @click.native="onShowActorDialog" class="md-primary" :data-id="item">{{ getStakeholder(item).name }}</md-button>
          </md-layout>
        </template>

    </md-layout>

  </div>
</template>

<script>
import Vue from 'vue'
import 'vue-material/dist/vue-material.css'
import VueMaterial from 'vue-material'
import { Dialog } from '@/classes/ui/Dialog'
import { Helper } from '@/classes/utils/Helper'
import DialogStakeholder from './dialog/DialogStakeholder.vue'

import { Stakeholder } from '@/classes/model/Stakeholder'
import { Metadata } from '@/classes/model/Metadata'

Vue.use(VueMaterial)

export default {
  name: 'AxisX',
  components: {
    'dialog-stakeholder': DialogStakeholder
  },
  props: ['participants', 'stakeholder', 'scale'],
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
      let stakeholder = Metadata.findStakeholder(Helper.parse(actionId))
      this.$refs['dialog-stakeholder'].open(stakeholder, 'update')
    },

    onCloseDialog (data) {
      this.$emit('closeDialog', data)
    },

    getStakeholder (id) {
      let stakeholder = Metadata.findStakeholder(id)

      if (typeof stakeholder === 'undefined') {
        console.warn('AxisX.getStakeholder() - could not find id')
        return new Stakeholder('[error]')
      }

      return stakeholder
    }

  }
}
</script>

<style lang="scss" scoped>

.axis-x {
  position: absolute;
  height: 50px;
  width: 100%;
  display: flex;
  justify-content: right;
  background: rgba(238, 238, 238, 0.7);
  transition: all 0.3s;
}

.md-layout {
  flex-wrap: nowrap
}

.md-button {
  width: 100%;
  margin: 0;
  min-width: 0;
  align-self: flex-end;
}

</style>
