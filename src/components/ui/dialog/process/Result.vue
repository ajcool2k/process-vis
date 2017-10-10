<template>
  <div class="result">
    <md-list class="custom-list md-triple-line">
      <template v-for="(item, index) in process.results">
        <md-list-item :key="item.id">
          <md-icon>work</md-icon>
          <div class="md-list-text-container">
            <span>Name: {{ item.mName }}</span>
            <span>Beschreibung: {{ item.mDescription }}</span>
            <span>Text: {{ item.mText }}</span>
            <span>Dateien: {{ item.mFiles.length }}</span>
            <span>Rechte: {{ item.mCopyright }}</span>
          </div>
          <md-button class="md-icon-button md-raised" @click="onRemove(item.id)"><md-icon>delete</md-icon></md-button>
        </md-list-item>
      </template>
    </md-list>

    <md-button class="md-raised" @click="onShowInput($event)">Hinzufügen</md-button>

    <result-input v-if="showInput" v-on:add="onAdd"></result-input>
  </div>
</template>

<script>
import ResultInput from './ResultInput.vue'

import Vue from 'vue'
import 'vue-material/dist/vue-material.css'
import VueMaterial from 'vue-material'
Vue.use(VueMaterial)

export default {
  name: 'Result',
  components: {
    'result-input': ResultInput
  },
  props: [ 'process' ],
  data: function () {
    return {
      showInput: false
    }
  },

  created: function () {
    console.log('Result created')
  },

  destroyed: function () {
  },

  mounted: function () {
    console.log('Result mounted')
  },

  updated: function () {
    console.log('Result updated')
  },

  methods: {
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
    onRemove (id) {
      console.log('onRemove', id)
      this.process.removeResult(id)
    },

    onAdd (result) {
      console.log('onAdd', result)
      this.process.addResult(result)
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
