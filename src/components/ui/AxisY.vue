<template>
  <div class="axis-y" :data-timeFormat="this.timeFormat" :data-itemSize="this.itemSize" :data-processes="this.processes" :data-scale="this.scale" :data-containerSize="this.containerSize">
    <svg>
      <g class="svg-axis-y"></g>
    </svg>
  </div>
</template>

<script>
import { Axis } from '@/classes/ui/Axis'
import { Helper } from '@/classes/utils/Helper'

export default {
  name: 'AxisY',
  props: ['delegates', 'processes', 'timeFormat', 'itemSize', 'scale', 'containerSize'],
  data: function () {
    return {
      domNode: null,
      svgNode: null,
      axis: null,
      scopeProp: ''
    }
  },

  created: function () {
    console.log('AxisY created')
  },

  destroyed: function () {
  },

  mounted: function () {
    console.log('AxisY mounted')

    this.domNode = document.querySelector('.axis-y')
    this.svgNode = this.domNode.querySelector('svg')

    // Scope Prop
    this.scopeProp = Helper.getScopeProp(this.svgNode)

    // d3 axis
    this.axis = new Axis()
    this.axis.create('.svg-axis-y', this.containerSize, this.scopeProp)
  },

  updated: function () {
    console.warn('AxisY updated')
    this.drawAxis()
  },

  methods: {

    drawAxis () {
      console.warn('AxisY drawAxis')
      let actorNames = this.delegates
      let processData = this.processes
      let timeFormat = this.timeFormat

      this.axis.setData('actorNames', actorNames)
      this.axis.setData('processes', processData)
      this.axis.setData('timeFormat', timeFormat)

      this.axis.setData('scale', { x: 1.0, y: 1.0 })
      this.axis.applySettings()
      this.axis.draw()
      Helper.addScopeProp(this.svgNode, this.scopeProp)
    },

    resizeAxis () {
      this.axis.setSize(this.containerSize)
      this.axis.draw()
    }
  }
}
</script>

<style lang="scss" scoped>

.axis-y {
  position: absolute;
  height: 100%;
  width: 100px;
  display: flex;
  justify-content: flex-end;
  transform-origin: 0 0;
  background: rgba(238, 238, 238, 0.7);
  transition: all 0.3s;
}

.tick {
  font-style: normal
}

svg {
  position: absolute;
  height:100% !important;
  width: 100px;
  z-index: 1;
}

svg path {
  stroke: transparent !important;
}

</style>
