<template>
  <div class="result-input">

    <md-card md-with-hover>
      <md-card-content>

        <md-input-container>
          <label>Bezeichnung</label>
          <md-input placeholder="Bezeichnung" v-model="result.name"></md-input>
        </md-input-container>

        <md-input-container>
          <label>Beschreibung</label>
          <md-textarea placeholder="Beschreibung" v-model="result.description"></md-textarea>
        </md-input-container>

        <md-input-container>
          <label>Ergebnis</label>
          <md-textarea placeholder="Ergebnis" v-model="result.text"></md-textarea>
        </md-input-container>

        <md-input-container>
          <label>Copyright</label>
          <md-input placeholder="Copyright" v-model="result.copyright"></md-input>
        </md-input-container>

      </md-card-content>
      <md-button @click="onAddButton">Hinzufügen</md-button>
    </md-card>

  </div>
</template>

<script>
import { Result } from '@/classes/model/Result'

export default {
  name: 'ResultInput',
  props: [],
  data: function () {
    return {
      result: new Result()
    }
  },

  created: function () {
    console.log('ResultInput created')
  },

  destroyed: function () {
  },

  mounted: function () {
    console.log('ResultInput mounted')
  },

  updated: function () {
    console.log('ResultInput updated')
  },

  methods: {
    onCloseButton () {
      this.$emit('hide')
    },

    onAddButton () {
      this.$emit('add', this.result)
      this.result = new Result()
    }

  }
}
</script>

<style lang="scss" scoped>
</style>
