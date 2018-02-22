<template>
  <div class="connection">
    <md-table>
      <md-table-header>
        <md-table-row>
          <md-table-head>Prozess</md-table-head>
          <md-table-head>eingehend</md-table-head>
          <md-table-head>ausgehend</md-table-head>
          <md-table-head>&nbsp;</md-table-head>
        </md-table-row>
      </md-table-header>
      <md-table-body>
        <md-table-row v-for="(id, rowIndex) in process.connection.from" :key="rowIndex + '--from'" :md-item="{ process: id }" md-auto-select md-selection>
          <md-table-cell>{{ getProcess(id).mName }}</md-table-cell>
          <md-table-cell>&#x2713;</md-table-cell>
          <md-table-cell></md-table-cell>
          <md-table-cell>
            <md-button class="md-icon-button md-raised" @click="onRemove(id, '<-')">
              <md-icon>delete</md-icon>
            </md-button>
          </md-table-cell>
        </md-table-row>
        <md-table-row v-for="(id, rowIndex) in process.connection.to" :key="rowIndex + '--to'" :md-item="{ process: id }" md-auto-select md-selection>
          <md-table-cell>{{ getProcess(id).mName }}</md-table-cell>
          <md-table-cell></md-table-cell>
          <md-table-cell>&#x2713;</md-table-cell>
          <md-table-cell>
            <md-button class="md-icon-button md-raised" @click="onRemove(id, '->')">
              <md-icon>delete</md-icon>
            </md-button>
          </md-table-cell>
        </md-table-row>
      </md-table-body>
    </md-table>

    <md-button class="md-raised" @click="onShowInput($event)">Hinzufügen</md-button>
    <connection-input v-if="showInput" v-on:add="onAdd" :id="process.id" :list="this.parent.children"></connection-input>
  </div>
</template>

<script>
import ConnectionInput from './ConnectionInput.vue'

export default {
  name: 'Connection',
  components: {
    'connection-input': ConnectionInput
  },
  props: [ 'process', 'parent' ],
  data: function () {
    return {
      showInput: false
    }
  },

  created: function () {
    console.log('Connection created')
  },

  destroyed: function () {
  },

  mounted: function () {
    console.log('Connection mounted')
  },

  updated: function () {
    console.log('Connection updated')
  },

  methods: {
    getProcess (id) {
      return this.parent.getChild(id)
    },

    selectedRows (v) {
      console.log('selectedValues', v)
    },

    onShowInput (event) {
      let button = event.target
      if (this.showInput === true) {
        button.innerHTML = 'Hinzufügen'
        this.showInput = false
      } else {
        button.innerHTML = 'Ausblenden'
        this.showInput = true
      }
    },

    onRemove (id, direction) {
      let from = direction === '->' ? this.process : this.getProcess(id)
      let to = direction === '->' ? this.getProcess(id) : this.process

      from.removeConnectionTo(to)
    },

    onAdd (connection) {
      console.log('onAdd', connection)

      if (connection.from !== this.process.id && connection.to !==  this.process.id) {
        console.warn('Connection: expected process id as from or to')
        return
      }

      // store connection
      let from = this.getProcess(connection.from)
      let to = this.getProcess(connection.to)
      from.addConnectionTo(to)
    }

  }
}
</script>

<style lang="scss" scoped>
</style>
