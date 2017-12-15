<template>
  <div id="RenderTest">
    <div class="promotedBox"></div>
    <!-- <div class="dummyBox"></div> -->
  </div>
</template>

<script>
import { Tests } from '@/classes/utils/Tests'

export default {
  name: 'RenderTest',
  data: function () {
    return {
      box: null
    }
  },

  created: function () {
    console.log('created')
  },

  mounted: function () {
    console.log('mounted')
    this.box = document.querySelector('.promotedBox')
    this.comparePositionVsTranslate()
  },

  updated: function () {
    console.log('updated')
  },

  methods: {
    comparePositionVsTranslate () {
      setTimeout(() => {
        // init
        Tests.reset(this.box)
        for (let i = 0; i < 10; i++) {
          Tests.run(this.box, Tests.position, 1, 800)
          Tests.run(this.box, Tests.position, -1, 800)
          // Tests.run(this.box, Tests.translate, 1, 800)
          // Tests.run(this.box, Tests.translate, -1, 800)
        }
      }, 1000)
    }
  }
}
</script>

<style lang="scss">

  #RenderTest {
   .box {
      display: block;
      position: absolute;
      left: 0px;
      top: 0px;
      height: 50px;
      width: 50px;
      background: red;
      box-shadow: 10px 10px 5px #888888;
    }

    .dummyBox {
      @extend .box;
      left: 300px;
      top: 300px;
      background: black;
    }

    .promotedBox {
      @extend .box;
      // will-change: transform;
    }
  }

  body {
    // background-color: silver !important;
  }
</style>
