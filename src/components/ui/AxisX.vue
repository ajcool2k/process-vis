<template>
  <div class="axis-x" @drop="drop" @dragover="allowDrop">
    <dialog-stakeholder ref="dialog-stakeholder" v-on:updateStakeholder="updateStakeholder"></dialog-stakeholder>
      <md-layout v-if="(process.mDelegates.length > 0)" :md-gutter="process.mDelegates.length">
        <template v-for="item in process.mDelegates">
          <md-layout :key="item" md-align="center">
            <md-button @click.native="onShowActorDialog" class="md-primary button-delegate" @dragstart.native="dragstart" @dragend.native="dragend" draggable="true" :data-id="item">{{ getStakeholder(item).name }}</md-button>
          </md-layout>
        </template>
    </md-layout>
  </div>
</template>

<script>
import { Dialog } from '@/classes/ui/Dialog'
import { Helper } from '@/classes/utils/Helper'
import DialogStakeholder from './dialog/DialogStakeholder.vue'

import { Stakeholder } from '@/classes/model/Stakeholder'
import { Metadata } from '@/classes/model/Metadata'

export default {
  name: 'AxisX',
  components: {
    'dialog-stakeholder': DialogStakeholder
  },
  props: ['process', 'scale'],
  data: function () {
    return {
      elemMoved: null,
      domNode: null,

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
    this.domNode = document.querySelector('.axis-x')
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

      // switched stakeholder
      let updateIndex = this.process.mDelegates.findIndex(elem => elem === data.previousId)
      if (updateIndex > -1) {
        // update delegate
        let updatedDelegates = this.process.mDelegates
        updatedDelegates[updateIndex] = data.id
        this.process.mDelegates = updatedDelegates

        // move all applied processes to new delegate
        this.process.children.filter(elem => elem.initiator === data.previousId).forEach(child => { child.initiator = data.id })
      }

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
    },

    dragstart (ev) {
      this.elemMoved = ev.target;

      let nodes = Array.from(this.domNode.querySelectorAll('.button-delegate'))
      nodes.forEach(elem => {
        if (elem === this.elemMoved) return
        elem.classList.add('dropzone')
      });
    },

    dragend (ev) {
      ev.preventDefault();

      let nodes = Array.from(this.domNode.querySelectorAll('.button-delegate'))
      nodes.forEach(elem => {
        if (elem === this.elemMoved) return
        elem.classList.remove('dropzone')
      });
    },

    allowDrop (ev) {
      ev.preventDefault();
    },

    drop (ev) {
      ev.preventDefault();

      let targetNode = ev.target
      let movedNode = this.elemMoved
      this.elemMoved = null;

      if ((movedNode instanceof HTMLElement && targetNode instanceof HTMLElement) === false) {
        console.warn('expect two html nodes')
        return
      }

      if (targetNode === movedNode) {
        console.log('ignore same node')
        return
      }
      let movedId = movedNode.getAttribute('data-id')
      let targetId = targetNode.getAttribute('data-id')

      // move element in delegate array
      let delegates = this.process.mDelegates // get delegates
      let movedIndex = delegates.indexOf(movedId) // find index of element that should move
      delegates.splice(movedIndex, 1) // remove element from old position

      let targetIndex = delegates.indexOf(targetId)
      if (targetIndex == movedIndex) targetIndex++  // move it to the right
      delegates.splice(targetIndex, 0, movedId); // place element at new position

      // update model
      this.process.mDelegates = delegates
      this.process.sort()
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
  transition: all 0.3s;

  .md-layout {
    flex-wrap: nowrap
  }

  .md-button {
    height: 50px;
    width: 100%;
    margin: 0;
    padding: 0;
    min-width: 0;
    align-self: flex-end;
    outline: 1px 1px 1px 0px solid #ccc;
    border-radius: 5px;
    color: #000 !important;

    &.dropzone {
      background: repeating-linear-gradient(
        45deg,
        #eee,
        #eee 10px,
        #fff 10px,
        #fff 20px
      );
     border: 2px dashed #ccc;
    }

    &:hover {
      color: #fff !important;
      background-color: #e91e63;
    }
  }

  .md-button /deep/ .md-ink-ripple {
    display: none;
  }
}

</style>
