<template>
  <div class="dialog-transformation">
    <md-dialog
      md-ok-text="OK"
      @close="onCloseDialog"
      ref="dialog">
      <md-dialog-title>Transformation</md-dialog-title>
      <md-dialog-content v-if="process && process.hasOwnProperty('transformation')">
        <form novalidate @submit.stop.prevent="submit">

          <md-input-container>
            <label>Prozess-ID</label>
            <md-input type="text" readonly v-model="process.id"></md-input>
          </md-input-container>

          <transformation-content :process="process"></transformation-content>

        </form>
        <md-button @click="onCloseButton" class="md-raised md-primary">Schließen</md-button>
      </md-dialog-content>
    </md-dialog>
  </div>
</template>

<script>
import Transformation from './process/Transformation.vue'

export default {
  name: 'DialogTransformation',
  props: [],
  components: {
    'transformation-content': Transformation
  },
  data: function () {
    return {
      process: {}
    }
  },

  created: function () {
    console.log('DialogTransformation created')
  },

  destroyed: function () {
  },

  mounted: function () {
    console.log('DialogTransformation mounted')
  },

  updated: function () {
    console.log('DialogTransformation updated')
  },

  methods: {
    open (p) {
      console.log('DialogTransformation open()')
      console.log(p)
      this.process = p
      this.$refs['dialog'].open()
    },

    setAction (a) {
      if (['create', 'update'].indexOf(a) === -1) {
        console.warn('setAction - action not a valid value', a)
        return
      }

      this.action = a
    },

    onCloseButton () {
      this.$refs['dialog'].close()
    },

    onCloseDialog () {
      this.$emit('closeDialog', { id: this.process.id })
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
