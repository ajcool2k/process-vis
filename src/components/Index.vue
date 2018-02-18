<template>
    <div id="index">
      <h1>Übersicht Datenmodelle</h1>

      <md-whiteframe md-tag="section" md-elevation="1">
        <span class="header">Neues Datenmodell</span>

        <md-layout>
          <md-layout>
            <router-link to="/process"><md-button class="md-raised md-primary">Anlegen</md-button></router-link>
          </md-layout>
          <md-layout>
            <model-uploader v-on:indexUpdated="refresh"></model-uploader>
          </md-layout>
        </md-layout>
      </md-whiteframe>

      <md-whiteframe md-tag="section" md-elevation="1">
        <process-list ref="process-list"></process-list>
      </md-whiteframe>

      <md-layout class="footer">
        <router-link to="/process/demo"><md-button class="md-dense md-primary">Demo</md-button></router-link>
      </md-layout>
    </div>
</template>


<script>
import List from './ui/List.vue'
import ModelUploader from './ui/ModelUploader.vue'

export default {
  name: 'Index',
  components: {
    'process-list': List,
    'model-uploader': ModelUploader
  },
  data: function () {
    return {}
  },

  methods: {
    refresh () {
      this.$refs['process-list'].refreshProcessList()
    }
  }
}
</script>

<style lang="scss" scoped>

  #index {
    padding: 30px;
    background: #fff !important;
    height: 100vh;

    h1 {
      padding-bottom: 30px;
    }

    button {
      margin-left: 20px;
    }

    .md-whiteframe {
      margin-bottom: 30px;
      padding-top: 20px
    }

    span.header {
      display: block;
      font-size: 1.4em;
      padding-left: 20px;
      margin-bottom: 20px;
    }

    .model-uploader {
      width: 100%;
    }

    .md-layout {
      align-items: center
    }

    .footer {
      justify-content: flex-end
    }
  }
</style>
