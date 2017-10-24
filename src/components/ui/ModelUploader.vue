<template>
  <div class="model-uploader">
    <div class="uploadContainer">
      <md-input-container>
        <label>Importieren</label>
        <md-file v-model="uploadContent" accept="application/json"></md-file>
      </md-input-container>

      <md-button @click="uploadModel" :disabled="this.uploadContent === ''" class="md-icon-button md-raised">
        <md-icon>file_upload</md-icon>
      </md-button>
    </div>
  </div>
</template>

<script>
import { Process } from '@/classes/model/Process'
import { Metadata } from '@/classes/model/Metadata'

import { Exchange } from '@/classes/utils/Exchange'
import { Validator } from '@/classes/utils/Validator'

import Vue from 'vue'
import 'vue-material/dist/vue-material.css'
import VueMaterial from 'vue-material'
Vue.use(VueMaterial)

export default {
  name: 'ModelUploader',
  components: {},
  props: [],
  data: function () {
    return {
      uploadContent: '',
      dom: {

      }
    }
  },

  created: function () {
    console.log('ModelUploader created')
  },

  destroyed: function () {
  },

  mounted: function () {
    console.log('ModelUploader mounted')
    this.dom.fileInput = document.querySelector('.uploadContainer input[type=file]')
  },

  updated: function () {
    console.log('ModelUploader updated')
  },

  methods: {
    parseUpload (e) {
      const content = e.target.result
      const json = JSON.parse(content)
      console.log('json', json)

      if (!Validator.isValid(json)) {
        console.warn('Upload not valid - ' + Validator.lastError)
        return
      }

      // parse process model
      let model = new Process()
      model.props = json.model

      // parse metadata
      Metadata.parse(json.metadata)

      // store data
      let processWrapper = Exchange.wrapProcess(model, Metadata.getData())
      Exchange.storeProcess(processWrapper, processWrapper.model.modified)

      // emit
      this.$emit('indexUpdated')

      Metadata.clear()
    },

    uploadModel (event) {
      console.log('uploadModel')
      let fileInput = this.dom.fileInput
      const files = fileInput.files // FileList object

      if (files.length === 0) {
        console.log('ModelUploader.uploadModel() - No file selected')
        return
      }

      Array.from(files).forEach(file => {
        let fr = new window.FileReader()
        fr.onload = this.parseUpload
        fr.readAsText(file)
      })

      this.dom.fileInput.value = ''
      this.uploadContent = ''
    }
  }
}
</script>

<style lang="scss" scoped>
    .uploadContainer {
      display: flex;
      align-items: center;
      justify-content: center;
      flex-wrap: unset;

      button {
        margin-right: 15px;
      }
    }
</style>
