<template>
  <div class="axis-x">

    <dialog-stakeholder ref="dialog-stakeholder" v-on:updateStakeholder="updateStakeholder"></dialog-stakeholder>
      <md-layout v-if="(process.mDelegates.length > 0)" :md-gutter="process.mDelegates.length">
        <template v-for="(item, index) in process.mDelegates">
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
  props: ['process', 'scale'],
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
      let initiator = Metadata.findStakeholder(Helper.parse(actionId))
      let stakeholder = Metadata.getStakeholder()
      this.$refs['dialog-stakeholder'].open(initiator, stakeholder, 'update')
    },

    updateStakeholder (data) {
      console.log('updateStakeholder', data)

      if (data.id === data.previousId) {
        if (typeof this.$refs['dialog.stakeholder'] !== 'undefined') this.$refs['dialog-stakeholder'].close()
        this.$emit('closeDialog', data)
        return
      }

      // update model
      this.process.childs.forEach(elem => {
        if (elem.initiator === data.previousId) elem.initiator = data.id
      })

      let childInitators = this.process.childs.map(elem => elem.initiator).filter(delegateId => delegateId !== '')
      this.process.mDelegates = childInitators.filter((elem, index, self) => index === self.indexOf(elem)) // remove duplicates
      // update view
      let initiator = Metadata.findStakeholder(Helper.parse(data.id))
      let stakeholder = Metadata.getStakeholder()
      this.$refs['dialog-stakeholder'].update(initiator, stakeholder, 'update')
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
