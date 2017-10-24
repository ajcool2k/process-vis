<template>
  <div id="List">
    <span class="header">Lokale Datenmodelle</span>
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
    this.refreshProcessList()
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
    refreshProcessList () {
      this.processList = Storage.list()
    }
  }
}
</script>

<style lang="scss" scoped>
    span.header {
      display: block;
      font-size: 1.4em;
      padding-left: 20px;
      margin-bottom: 20px;
    }
</style>
