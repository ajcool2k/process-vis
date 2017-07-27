<template>
  <div class="dialog-process">
    <md-dialog 
      md-ok-text="OK"
      @close="onCloseDialog"
      ref="dialog">
      <md-dialog-content>
      <md-card>
          <md-card-media>
              <img src='https://image.flaticon.com/icons/svg/364/364172.svg' alt='processImage'>
          </md-card-media>
      </md-card>
      <form novalidate @submit.stop.prevent="submit">

        <md-input-container>
          <label>Prozess-ID</label>
          <md-input type="text" readonly v-model="process.id"></md-input>
        </md-input-container>

        <md-input-container>
          <label>Partizipation</label>
          <md-input type="text" v-model="process.access"></md-input>
        </md-input-container>

        <md-input-container>
          <label>Start</label>
          <md-input type="date" v-model="info.begin" @change="onChangeBegin"></md-input>
        </md-input-container>

        <md-input-container>
          <label>Ende</label>
          <md-input type="date" v-model="info.end" @change="onChangeEnd"></md-input>
        </md-input-container>        

      </form>
      </md-dialog-content>      
    </md-dialog>
  </div>
</template>

<script>
import dateFormat from 'dateformat'
import Vue from 'vue'
import 'vue-material/dist/vue-material.css'
import VueMaterial from 'vue-material'
Vue.use(VueMaterial)

export default {
  name: 'DialogProcess',
  props: [],
  data: function () {
    return {
      process: {},
      info: {
        begin: '',
        end: ''
      }
    }
  },

  created: function () {
    console.log('DialogProcess created')
  },

  destroyed: function () {
  },

  mounted: function () {
    console.log('DialogProcess mounted')
  },

  updated: function () {
    console.log('DialogProcess updated')
  },

  methods: {
    open (p) {
      console.log('DialogProcess open()')
      console.log(p)
      this.process = p
      this.info.begin = typeof p.begin !== 'undefined' ? dateFormat(p.begin, 'yyyy-mm-dd') : ''
      this.info.end = typeof p.end !== 'undefined' ? dateFormat(p.end, 'yyyy-mm-dd') : ''
      this.$refs['dialog'].open()
    },

    onCloseDialog () {
      this.$emit('closeDialog', this.process.id)
    },

    onChangeBegin (dateString) {
      this.process.begin = new Date(dateString)
    },

    onChangeEnd (dateString) {
      this.process.end = new Date(dateString)
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
