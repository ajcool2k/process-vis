<template>
  <div class="axis-y" :data-timeFormat="this.timeFormat" :data-timeSlice="this.timeSlice" :data-scale="this.scale" :data-containerSize="this.containerSize">
    <svg>
      <g class="svg-axis-y"></g>
    </svg>
  </div>
</template>

<script>
import { Axis } from '@/classes/ui/Axis'
import { Helper } from '@/classes/utils/Helper'
import { Benchmark } from '@/classes/utils/Benchmark'

export default {
  name: 'AxisY',
  props: ['cols', 'shapes', 'timeFormat', 'timeSlice', 'scale', 'containerSize'],
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
      let actorNames = this.cols.map(elem => elem.name)
      let processData = this.shapes
      let timeFormat = this.timeFormat

      this.axis.setData('actorNames', actorNames)
      this.axis.setData('processes', processData)
      this.axis.setData('timeFormat', timeFormat)

      this.axis.setData('scale', { x: 1.0, y: 1.0 })
      this.axis.applySettings()
      this.axis.draw()
      Benchmark.messure('addScopeProp', () => { Helper.addScopeProp(this.svgNode, this.scopeProp) })
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
  margin-left: -120px;
  height: 100%;
  width: 100px;
  display: flex;
  justify-content: center;
  background: white;  
  border: 1px solid #ccc;
  transform-origin: 0 0;
  background-color:rgba(255, 255, 255, 0.8);
  box-shadow: 0 1px 5px rgba(0,0,0,.2), 0 2px 2px rgba(0,0,0,.14), 0 3px 1px -2px rgba(0,0,0,.12);
}

.tick {
  font-style: normal
}

svg {
  position: absolute;
  height:100% !important;
  width:100% !important;
  z-index: 1;
}

svg path {
  stroke: transparent !important;
}

</style>
