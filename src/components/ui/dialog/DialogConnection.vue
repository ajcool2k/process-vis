<template>
  <div>
    <md-dialog
      class="dialog-connection"
      md-ok-text="OK"
      @close="emitEvent()"
      ref="dialog">
      <md-dialog-title>Verbindung entfernen</md-dialog-title>
      <md-dialog-content v-if="processFrom && processTo">
        <md-list>
          <md-list-item>
            Ausgang <span>{{ processFrom.mName }}</span>
          </md-list-item>

          <md-list-item>
            Eingang <span>{{ processTo.mName }}</span>
          </md-list-item>
        </md-list>

      </md-dialog-content>
      <md-dialog-actions>
        <md-button @click="onRemoveButton" class="md-raised">Entfernen</md-button>
        <md-button @click="onCloseButton" class="md-raised md-primary">Schließen</md-button>
      </md-dialog-actions>
    </md-dialog>
  </div>
</template>

<script>
export default {
  name: 'DialogConnection',
  props: [],
  data: function () {
    return {
      connection: null,
      processFrom: null,
      processTo: null
    }
  },

  created: function () {
    console.log('DialogConnection created')
  },

  destroyed: function () {
  },

  mounted: function () {
    console.log('DialogConnection mounted')
  },

  updated: function () {
    console.log('DialogConnection updated')
  },

  methods: {
    open (connection, from, to) {
      console.log('DialogConnection open()')
      this.response = ''

      this.connection = connection
      this.processFrom = from
      this.processTo = to

      this.$refs['dialog'].open()
    },

    onRemoveButton () {
      this.response = 'remove'
      this.$refs['dialog'].close()
    },

    onCloseButton () {
      this.response = 'close'
      this.$refs['dialog'].close()
    },

    emitEvent () {
      if (this.response === '') return

      this.$emit('updateConnection', { response: this.response, id: this.processFrom.id + '->' + this.processTo.id })
    }
  }
}
</script>

<style lang="scss" scoped>
 .md-list-item-container > span {
   padding-left: 20px;
 }
</style>
