<template>
  <div class="connection-input">

    <md-card md-with-hover>
      <md-card-content>

        <md-layout md-align="center" md-gutter>
          <md-layout >
            <md-input-container>
              <label>Dieser Prozess</label>
              <md-input type="text" :value="getProcess(this.id).name" readonly></md-input>
            </md-input-container>
          </md-layout>
          <md-layout md-flex-offset="5">
            <md-input-container>
              <label>Richtung</label>
              <md-select name="direction" id="direction" v-model="direction">
                <md-option value="forward">&rarr;</md-option>
                <md-option value="reverse">&larr;</md-option>
              </md-select>
            </md-input-container>
          </md-layout>

          <md-layout md-flex-offset="5">
            <md-input-container>
              <label>Verbindungsprozess</label>
              <md-select name="other" id="other" v-model="other">
                <md-option v-for="elem in list" :key="elem.id + '--other'" :value="elem.id">{{elem.name}}</md-option>
              </md-select>
            </md-input-container>
          </md-layout>
        </md-layout>
      </md-card-content>
      <md-button @click="onAddButton">Hinzufügen</md-button>
    </md-card>

  </div>
</template>

<script>
export default {
  name: 'ConnectionInput',
  props: ['id', 'list'],
  data: function () {
    return {
      other: '',
      direction: 'forward',
    }
  },

  created: function () {
    console.log('ConnectionInput created')
  },

  destroyed: function () {
  },

  mounted: function () {
    console.log('ConnectionInput mounted')
  },

  updated: function () {
    console.log('ConnectionInput updated')
  },

  methods: {
    onCloseButton () {
      this.$emit('hide', this.location)
    },

    onAddButton () {
      let obj = this.direction === 'forward' ? { from: this.id, to: this.other } : { from: this.other, to: this.id }
      this.$emit('add', obj)
      this.other = ''
    },

    getProcess (id) {
      return this.list.find(elem => elem.id === id)
    }

  }
}
</script>

<style lang="scss" scoped>
</style>
