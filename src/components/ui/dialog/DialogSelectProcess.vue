<template>
  <div>
    <md-dialog
      class="dialog-process-add"
      md-ok-text="OK"
      @close="emitEvent()"
      ref="dialog">
      <md-dialog-title>Neuer Prozess</md-dialog-title>
      <md-dialog-content>
        <general-tab ref="general-tab" v-if="process"></general-tab>
      </md-dialog-content>
      <md-dialog-actions>
        <md-button @click="onCloseButton" class="md-raised">Abbrechen</md-button>
        <md-button @click="onAcceptButton" class="md-raised md-primary">Auswählen</md-button>
      </md-dialog-actions>
    </md-dialog>
  </div>
</template>

<script>
import General from './process/General.vue'

export default {
  name: 'DialogSelectProcess',
  components: {
    'general-tab': General,
  },
  props: [],
  data: function () {
    return {
      process: null,
      response: ''
    }
  },

  created: function () {
    console.log('DialogSelectProcess created')
  },

  destroyed: function () {
  },

  mounted: function () {
    console.log('DialogSelectProcess mounted')
  },

  updated: function () {
    console.log('DialogSelectProcess updated')
  },

  methods: {
    open (p) {
      console.log('DialogSelectProcess open()')
      this.process = p
      this.response = ''
      this.$refs['dialog'].open()
      this.$nextTick(() => {
        this.$refs['general-tab'].refresh(this.process)
        let nameField = this.$refs['general-tab'].$refs.focusable.$el
        console.log(nameField)
        setTimeout(() => {
          nameField.focus()
        })
      })
    },

    onAcceptButton () {
      this.response = 'add'
      this.$refs['dialog'].close()
    },

    onCloseButton () {
      this.response = 'close'
      this.$refs['dialog'].close()
    },

    emitEvent () {
      if (this.response === '') return

      this.$emit('processSelect', { process: this.process, response: this.response })
    }
  }
}
</script>

<style lang="scss">
  .dialog-process-add .md-dialog {
    width: 600px
  }
</style>
