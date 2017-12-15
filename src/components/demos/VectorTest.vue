<template>
  <div id="VectorTest">
    <form>
      <input type="text" v-model="count">
      <button @click="updateAnimation()">{{ animation }}</button>
      <button @click="increaseCount(10)">+10</button>
    </form>
    <svg class="svgNode">

      <!-- draw elements -->
      <template v-for="(item, index) in count">
        <g :class="animation" :key="item.id + '-elem'" :transform="'translate(' + getRandomPos() + ')'">
          <rect height="60" width="100">
            <title>TextNode</title>
          </rect>
          <text x="50" y="30">TEXT</text>
          <circle r="10" cy="45" cx="50" fill="white"></circle>
        </g>
      </template>
    </svg>
</div>
</template>

<script>
import { Mathematic } from '@/classes/utils/Mathematic'

export default {
  name: 'VectorTest',
  data: function () {
    return {
      count: 10,
      animation: 'finite',
      screenSize: {},
      benchmark: {
        t0: 0,
        t1: 0
      }
    }
  },

  created: function () {
    console.log('created')
    this.screenSize = { x: window.innerWidth, y: window.innerHeight }
  },

  mounted: function () {
    console.log('mounted')
  },

  beforeUpdate: function () {
    this.count = parseInt(this.count)
    this.benchmark.t0 = global.performance.now()
  },

  updated: function () {
    console.log('updated', this.count)
    this.benchmark.t1 = global.performance.now()
    console.log('reaction: ' + (this.benchmark.t1 - this.benchmark.t0) + ' milliseconds')
  },

  methods: {

    updateAnimation () {
      this.animation = this.animation === 'finite' ? 'infinite' : 'finite'
    },

    getRandomPos () {
      let x = Mathematic.getRandomInt(0, this.screenSize.x)
      let y = Mathematic.getRandomInt(0, this.screenSize.y)
      return x + ', ' + y
    },

    increaseCount (value) {
      console.log('count increase')
      this.count += parseInt(value)
      console.log('count', this.count)
    }
  }
}
</script>

<style lang="scss">


  #VectorTest {
    width: 100vw;
    height: 100vh;
  }

  body {
    // background-color: silver !important;
    @keyframes merge { 100% {
        transform-origin: 50% 50%;
        transform: translate(500px, 500px);
      } }

    form {
      position: absolute;
      top: 0;
      left: 0;
      z-index: 2;
    }


    svg {
      z-index: 1;
      position: absolute;
      top: 0;
      left: 0;

      display: block;
      width: 100% !important;
      height: 100% !important;

      g.infinite {
        animation: merge 3s linear infinite;
        animation-direction: alternate-reverse;
      }

      g.finite {
        animation: merge 3s linear 1;
        animation-direction: alternate-reverse;
      }

      rect {
        fill: blue;
      }

      rect:hover {
        fill: red
      }

      circle: {
        stroke: black;
        stroke-width: 3;
      }

      text {
        text-anchor: middle;
        fill: white
      }

    }
  }
</style>
