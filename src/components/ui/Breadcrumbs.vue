<template>
  <div class="process-breadcrumbs">

      <md-button class="md-dense" :title="getPrevId()" @click="onChangeProcess('parent')">{{ getPrev() }}</md-button>
      <md-icon>keyboard_arrow_right</md-icon>
      <md-button class="md-raised md-accent" :title="process.id" @click="onShowProcess">{{ getName() }}</md-button>
      <!--
      <md-icon>keyboard_arrow_right</md-icon>
      <md-button class="md-dense" @click="onShowChildren">Teilaufgaben: {{ process.children.length }}</md-button>
      -->
  </div>
</template>

<script>
export default {
  name: 'Breadcrumbs',
  components: {},
  props: [ 'process' ],
  data: function () {
    return {}
  },

  created: function () {
    console.log('Breadcrumbs created')
  },

  destroyed: function () {
  },

  mounted: function () {
    console.log('Breadcrumbs mounted')
  },

  updated: function () {
    console.log('Breadcrumbs updated')
  },

  methods: {
    onChangeProcess (direction) {
      this.$emit('changeProcess', direction)
    },

    onShowProcess () {
      this.$emit('showProcess')
    },

    getPrev () {
      return !this.process || this.process.parent === '' ? 'ANLEGEN' : 'Übergeordneter Prozess'
    },

    getPrevId () {
      return !this.process || this.process.parent === '' ? '' : this.process.parent
    },

    getName () {
      // nName returns [keine Bezeichnung] if not available
      if (typeof this.process.name === 'undefined' || this.process.name === '') return this.process.mName

      let maxLen = 20
      let strLen = this.process.mName.length
      let len = strLen > maxLen ? maxLen : strLen
      return this.process.mName.substring(0, len)
    },

    onShowChildren () {
      let nodes = document.querySelectorAll('.process')
      nodes.forEach((elem) => {
        elem.classList.remove('animation-highlight')
      })

      setTimeout(() => {
        nodes.forEach((elem) => { elem.classList.add('animation-highlight') })
      }, 100)

      setTimeout(() => {
        nodes.forEach((elem) => { elem.classList.remove('animation-highlight') })
      }, 1000)
    }
  }
}
</script>

<style lang="scss" scoped>
 .process-breadcrumbs {
   display: flex
 }
</style>
