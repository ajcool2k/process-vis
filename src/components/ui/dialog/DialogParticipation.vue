<template>
  <div class="dialog-participation">
    <md-dialog
      md-ok-text="OK"
      @close="onCloseDialog"
      ref="dialog">
      <md-dialog-title>Partizipation</md-dialog-title>
      <md-dialog-content v-if="process && process.hasOwnProperty('participation')">
        <form novalidate @submit.stop.prevent="submit">

          <md-input-container>
            <label>Prozess</label>
            <md-input type="text" readonly v-model="process.name"></md-input>
          </md-input-container>

          <md-input-container>
            <label for="participation">Partizipation</label>
            <md-select name="participation" id="participation" v-model="participation" @change="onChangeParticipation">
              <md-option value="closed">nicht möglich</md-option>
              <md-option value="open">möglich</md-option>
            </md-select>
          </md-input-container>

        </form>
        <md-button @click="onCloseButton" class="md-raised md-primary">Schließen</md-button>
      </md-dialog-content>
    </md-dialog>
  </div>
</template>

<script>
export default {
  name: 'DialogParticipation',
  props: [],
  components: {},
  data: function () {
    return {
      participation: '',
      process: {}
    }
  },

  created: function () {
    console.log('DialogParticipation created')
  },

  destroyed: function () {
  },

  mounted: function () {
    console.log('DialogParticipation mounted')
  },

  updated: function () {
    console.log('DialogParticipation updated')
  },

  methods: {
    open (p) {
      console.log('DialogParticipation open()')
      console.log(p)
      this.process = p

      this.participation = typeof this.process.mParticipation !== 'undefined' ? this.process.mParticipation : ''
      console.log('participation', this.participation)
      this.$refs['dialog'].open()
    },

    setAction (a) {
      if (['create', 'update'].indexOf(a) === -1) {
        console.warn('setAction - action not a valid value', a)
        return
      }

      this.action = a
    },

    onChangeParticipation (string) {
      this.process.mParticipation = string
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
