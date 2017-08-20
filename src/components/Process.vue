<template>
  <div id="Process">

    <!-- child component -->
    <workspace :processModel="mod" :changes="changes"

        v-on:addConnection="addConnection"
        v-on:removeConnection="removeConnection"

        v-on:addNode="addNode"
        v-on:moveNode="moveNode"
        v-on:removeNode="removeNode"
        v-on:updateNode="updateNode"

        v-on:addLane="addLane"
        v-on:removeLane="removeLane"

    ></workspace>

  </div>
</template>

<script>
// Node Dependencies
import { _ } from 'underscore'

// Classes
import { Helper } from '@/classes/utils/Helper'
import { Data } from '@/classes/utils/Data'

// Child components
import Workspace from './ui/Workspace.vue'

export default {
  name: 'Process',
  components: {
    'workspace': Workspace
  },
  data: function () {
    return {
      mod: {
        shapes: [],
        edges: [],
        cols: [],
        tests: {}
      },
      changes: {
        time: new Date()
      }
    }
  },

  created: function () {
    console.log('App created')

    this.addData()
    console.log(this.mod)
  },

  destroyed: function () {
    console.log('App destroyed')
  },

  mounted: function () {
    console.log('App mounted')
  },

  updated: function () {
    console.warn('App updated')
  },

  methods: {

    addData () {
      console.log('App addData')

      // add column
      this.addLane()
      let data = Data.generateData()
      console.log(data)
      this.mod.shapes = data.nodes
      this.mod.edges = data.edges
      this.mod.cols = data.participants
      let startProcess = data.nodes.filter(node => node.p.startProcess === true)
      this.mod.startProcess = startProcess.length === 1 ? startProcess[0] : null
    },

    addNode (process) {
      let id = Helper.nextId(this.mod.shapes)
      process.id = id
      let position = { x: 0, y: 0 }
      let shape = { id: id, name: id, p: process, position: position }
      this.mod.shapes.push(shape)
    },

    moveNode (shapeData) {
      let node = _.findWhere(this.mod.shapes, { id: shapeData.shapeId })
      node.p.participant = shapeData.laneId
      this.forceRedraw()
    },

    removeNode (shapeId) {
      console.log('Process (removeNode): ' + shapeId)

      // remove Connection
      let unneededEdges = this.mod.edges.filter(edge => edge.source === shapeId || edge.target === shapeId)
      unneededEdges.forEach((edge) => {
        this.removeConnection(edge.id)
      })

      // remove Node
      console.log(this.mod.shapes)
      this.mod.shapes = _.reject(this.mod.shapes, (shape) => shape.id === shapeId)
      console.log(this.mod.shapes)
    },

    updateNode (shapeId) {
      this.mod.shapes = this.mod.shapes.map((elem) => elem)
    },

    addConnection (edgeData) {
      let newId = Helper.nextId(this.mod.edges)

      let edge = {
        id: newId,
        source: edgeData.source,
        target: edgeData.target,
        transform: '='
      }

      this.mod.edges.push(edge)
      console.log(this.mod.edges)
    },

    removeConnection (edgeId) {
      edgeId = Helper.parse(edgeId)
      this.mod.edges = _.reject(this.mod.edges, edge => edge.id === edgeId)
    },

    addLane () {
      let newId = Helper.nextId(this.mod.cols)
      this.mod.cols.push({ id: newId, name: 'A' + newId })
    },

    removeLane (participantId) {
      console.log('remove lane')

      if (typeof participantId === 'undefined' || participantId.length < 1) {
        console.warn('Could not remove participant, id missing')
        return
      }

      // check if id exists
      let used = this.mod.cols.filter(col => col.id === participantId)
      if (used.length < 1) {
        console.warn('Could not remove participant, id not found')
        return
      }

      // avoid if shapes are on this lane to keep them in container
      var shapes = this.mod.shapes.filter(shape => shape.p.participant === participantId)

      if (shapes.length > 0) {
        console.warn('Could not remove lane, there are still processes applied')
        return
      }

      // avoid if only one lane is left
      if (this.mod.cols.length < 2) {
        console.warn('Could not remove more lanes')
        return
      }

      // remove id from model
      this.mod.cols = this.mod.cols.filter(col => col.id !== participantId)
    },

    forceRedraw () {
      let change = {
        time: new Date()
      }

      this.changes = change
    }

  }
}
</script>

<style lang="scss" scoped>

</style>
