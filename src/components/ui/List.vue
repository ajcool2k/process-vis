<template>
  <div id="List">
    Lokale Datenmodelle:
    <md-list>
      <md-list-item v-for="item in processList" :key="item.id">
          <router-link :to="{ path: '/process/' + item.id }">
            <md-icon>insert_drive_file</md-icon>
            <span>{{item.id}} - {{item.name}}</span><span>Letzte Aktualisierung: {{item.updated}}</span>
            <md-button class="md-icon-button md-list-action">
              <md-icon class="md-primary">play_arrow</md-icon>
            </md-button>
          </router-link>
      </md-list-item>
    </md-list>
  </div>
</template>

<script>
import { Storage } from '@/classes/utils/Storage'

export default {
  name: 'List',
  components: {},
  data: function () {
    return {
      processList: []
    }
  },

  created: function () {
    console.log('List created')
    this.processList = Storage.list()
    console.log('processList', this.processList)
  },

  destroyed: function () {
    console.log('List destroyed')
  },

  mounted: function () {
    console.log('List mounted')
  },

  updated: function () {
    console.warn('List updated')
  },

  methods: {

  }
}
</script>

<style lang="scss" scoped>

</style>
