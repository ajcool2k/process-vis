<template>
  <div class="time-chooser">

    <md-speed-dial md-mode="scale" class="md-fab-bottom-left">
      <md-button class="md-fab" md-fab-trigger>
        <md-icon md-icon-morph>close</md-icon>
        <md-icon>timeline</md-icon>
      </md-button>

      <md-button @click.native="setTimeFormat('hours')" class="md-fab md-mini md-clean">S</md-button>
      <md-button @click.native="setTimeFormat('days')" class="md-fab md-mini md-clean">T</md-button>
      <md-button @click.native="setTimeFormat('months')" class="md-fab md-mini md-clean">M</md-button>
      <md-button @click.native="setTimeFormat('years')" class="md-fab md-mini md-clean">J</md-button>

    </md-speed-dial>
  </div>
</template>

<script>
export default {
  name: 'TimeChooser',
  props: ['timeFormat'],
  data: function () {
    return {
      format: this.timeFormat
    }
  },

  created: function () {
    console.log('TimeChooser created')
  },

  destroyed: function () {
  },

  mounted: function () {
    console.log('TimeChooser mounted')
  },

  updated: function () {
    console.log('TimeChooser updated')
  },

  methods: {
    setTimeFormat (value) {
      this.format = value
      this.$emit('onTimeFormatChange', this.format)
    }
  }
}
</script>

<style lang="scss" scoped>

.md-speed-dial {
  position: fixed !important;
  margin-top: -100px !important;
}

</style>
