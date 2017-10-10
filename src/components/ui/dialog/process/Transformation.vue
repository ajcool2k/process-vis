<template>
  <div class="transformation">
		<md-layout md-gutter>
			<md-layout md-flex="70" md-vertical-align="center" class="md-subheading">Entscheidung</md-layout>
			<md-layout md-align="end" ><md-switch v-model="process.transformation.mDecision" id="decision" name="decision" class="md-primary"></md-switch></md-layout>
		</md-layout>

		<md-input-container>
			<label for="transformation-type">Art</label>
			<md-select name="transformation-type" id="transformation-type" v-model="process.transformation.type">
				<md-option value="=">Information</md-option>
				<md-option value="<">Kreation</md-option>
				<md-option value=">">Entscheidung</md-option>
			</md-select>
		</md-input-container>

		<md-input-container>
			<label>Hinweis</label>
			<md-input type="text" v-model="process.transformation.info"></md-input>
		</md-input-container>
  </div>
</template>

<script>
import Vue from 'vue'
import 'vue-material/dist/vue-material.css'
import VueMaterial from 'vue-material'
Vue.use(VueMaterial)

export default {
  name: 'Transformation',
  components: {},
  props: [ 'process' ],
  data: function () {
    return {
      showInput: false
    }
  },

  created: function () {
    console.log('Transformation created')
  },

  destroyed: function () {
  },

  mounted: function () {
    console.log('Transformation mounted')
  },

  updated: function () {
    console.log('Transformation updated')
  },

  methods: {}
}
</script>

<style lang="scss" scoped>
</style>
