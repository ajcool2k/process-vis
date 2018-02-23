<template>
  <div class="timeline">
    <axis-x class="ignore-container-events" :process="processModel" :scale="containerScale" v-on:closeDialog="onCloseDelegateDialog"></axis-x>
    <axis-y ref="axis-y" class="ignore-container-events" :delegates="processModel.mDelegates" :processes="processModel.children" :timeFormat="timeFormat" :itemSize="itemSize" :scale="containerScale" :containerSize="containerSize"></axis-y>

    <template v-for="(item, index) in processModel.mDelegates">
      <div :key="item" :class="'delegate delegate' + index" :data-id="item" :style="'width: ' + ( containerSize.x / processModel.mDelegates.length ) + 'px'"></div>
    </template>
  </div>
</template>

<script>
import AxisX from './AxisX.vue'
import AxisY from './AxisY.vue'
export default {
  name: 'Timeline',
  components: {
    'axis-x': AxisX,
    'axis-y': AxisY,
  },
  props: [
    'processModel',
    'timeFormat',
    'itemSize',
    'containerSize',
    'containerScale'
  ],
  data: function () {
    return {
      domNode: null,
      xAxisNode: null,
      yAxisNode: null
    }
  },

  created: function () {
    console.log('Timeline created')
  },

  destroyed: function () {
  },

  mounted: function () {
    console.log('Timeline mounted')
    this.domNode = document.querySelector('.timeline')
    this.xAxisNode = this.domNode.querySelector('.axis-x')
    this.yAxisNode = this.domNode.querySelector('.axis-y')

  },

  updated: function () {
    console.log('Timeline updated')
  },

  methods: {
    redraw () {
      this.$refs['axis-y'].drawAxis() // redraw axis
    },

    updateTimeline () {
      this.updateAxisPosition()
    },

    updateAxisPosition() {
      let containerPos = this.domNode.getBoundingClientRect()

      if (containerPos.top < 80) {
        let height = 170 - Math.round(containerPos.top / this.containerScale.y)
        this.xAxisNode.style.height = height + 'px'
      } else {
        this.xAxisNode.style.height = '50px'
      }

      if (containerPos.left < 110) {
        let width = 250 - Math.round(containerPos.left / this.containerScale.x)
        this.yAxisNode.style.width = width + 'px'
      } else {
        this.yAxisNode.style.width = '100px'
      }
    },

    onCloseDelegateDialog (data) {
      console.log('onCloseDelegateDialog called')
      switch (data.response) {
        case 'update':
          break
        case 'remove':
          this.removeDelegate(data.id)
          break
      }
    },

    removeDelegate (delegateId) {
      console.log('remove Delegate', delegateId)

      if (typeof delegateId !== 'string') {
        console.warn('Could not remove delegate, id missing')
        return
      }

      // check if id exists
      let found = this.processModel.mDelegates.filter(elem => elem === delegateId)
      if (found.length < 1) {
        console.warn('Could not remove delegate, id not found')
        return
      }

      // avoid if child processes are on this Delegate to keep them in container
      let used = this.processModel.children.filter(elem => elem.initiator === delegateId)

      if (used.length > 0) {
        console.warn('Could not remove Delegate, there are still processes applied')
        return
      }

      // avoid if only one Delegate is left
      if (this.processModel.mDelegates.length < 1) {
        console.warn('Could not remove more Delegates')
        return
      }

      // remove id from model
      this.processModel.removeDelegate(delegateId)
    }
  }
}
</script>

<style lang="scss" scoped>
$primaryColor: #3f51b5;
$secondayColor: #29e;
$accepntColor: #e91e63;
$bgColor: #eee;

.timeline {
  position: relative;
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;

  .axis-x  {
    margin-top: -55px;
    z-index: 4;
    background-color:rgba(238, 238, 238, 0.7);
  }

  .axis-y  {
    margin-left: -105px;
    z-index: 3;
  }

  .delegate {
    border-left: 2px dashed #ccc;
    text-align: center;
    transition: all 1s;

    &.pariticipant-drop {
      background-color: $secondayColor;
      opacity: 0.3;
    }

    &.drop-active {
      border-color: #aaa;
    }

    &.delegate0 {
      border-left: 0
    }
  }
}
</style>
