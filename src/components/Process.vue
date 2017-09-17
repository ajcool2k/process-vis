<template>
  <div id="Process">

    <!-- child component -->
    <workspace :processModel="datamodel" :changes="changes"

        v-on:addConnection="addConnection"
        v-on:removeConnection="removeConnection"

        v-on:addProcess="addProcess"
        v-on:moveProcess="moveProcess"
        v-on:removeProcess="removeProcess"
        v-on:updateProcess="updateProcess"

        v-on:addParticipant="addParticipant"
        v-on:removeParticipant="removeParticipant"

    ></workspace>

  </div>
</template>

<script>
// Dependencies
import { _ } from 'underscore'

// Classes
import { Helper } from '@/classes/utils/Helper'
import { Calc } from '@/classes/utils/Calc'

import { Data2 } from '@/classes/utils/Data2'

import { Process } from '@/classes/model/Process'
import { Stakeholder } from '@/classes/model/Stakeholder'

// Child components
import Workspace from './ui/Workspace.vue'

export default {
  name: 'Process',
  components: {
    'workspace': Workspace
  },
  data: function () {
    return {
      datamodel: new Process(),
      changes: {
        time: new Date()
      }
    }
  },

  created: function () {
    console.log('App created')
    this.addData()
    console.log('datamodel', this.datamodel)
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

  watch: {
    // whenever childs changes, this function will run
    'datamodel.childs': function (updatedChilds) {
      let startProcess = Calc.updateStartProcess(this.datamodel.childs)
      console.log('new startingProcess: ', startProcess)
    }
  },
  methods: {

    addData () {
      console.log('App addData')

      // add column
      this.addParticipant()
      let generatedData = Data2.generateData()
      this.datamodel = generatedData.datamodel
      Calc.updateStartProcess(this.datamodel.childs)
      console.log(generatedData)
    },

    addProcess (process) {
      console.log('addProcess', process)
      this.datamodel.childs.push(process)
    },

    moveProcess (processData) {
      console.log('moveProcess', processData)
      let process = this.datamodel.childs.find(elem => elem.id === processData.processId)
      process.initiator = processData.participantId
      this.forceRedraw()
    },

    removeProcess (processId) {
      console.log('Process (removeProcess): ' + processId)

      // remove Connection
      let unneededConnections = []
      this.datamodel.childs.forEach(elem => {
        if (elem.connection.from.indexOf(processId) > -1) unneededConnections.push(processId + '->' + elem.id)
        if (elem.connection.to.indexOf(processId) > -1) unneededConnections.push(elem.id + '->' + processId)
      })

      unneededConnections.forEach((con) => {
        this.removeConnection(con)
      })

      // remove Process
      this.datamodel.childs = this.datamodel.childs.filter(elem => elem.id !== processId)
    },

    updateProcess (processId) {
      this.datamodel.childs = this.datamodel.childs.map(elem => elem)
    },

    addConnection (connectionData) {
      console.log('addConnection', connectionData)

      let processSource = this.datamodel.childs.find(elem => elem.id === connectionData.source)
      let processTarget = this.datamodel.childs.find(elem => elem.id === connectionData.target)

      console.log('processSource', processSource)
      console.log('processTarget', processTarget)

      processSource.mConnections = { to: connectionData.target }
      processTarget.mConnections = { from: connectionData.source }
    },

    removeConnection (connectionId) {
      console.log('removeConnection', connectionId)
      let con = Helper.connectionParse(connectionId)

      let processTo = this.datamodel.childs.find(elem => elem.id === con.source)
      let processFrom = this.datamodel.childs.find(elem => elem.id === con.target)

      processTo.connection.to = _.reject(processTo.connection.to, elem => elem === con.target) // remove to process
      processFrom.connection.from = _.reject(processFrom.connection.from, elem => elem === con.source) // remove from process

      processTo._connections = processTo._connections.filter(elem => elem.id !== connectionId) // remove from mConnections
    },

    addParticipant () {
      let stakeholder = new Stakeholder()
      console.log('stakeholder', stakeholder)
      this.datamodel.stakeholder.push(stakeholder)
      this.datamodel.participants.push(stakeholder.id)
    },

    removeParticipant (participantId) {
      console.log('remove Participant', participantId)

      if (typeof participantId === 'undefined' || participantId.length < 1) {
        console.warn('Could not remove participant, id missing')
        return
      }

      // check if id exists
      let found = this.datamodel.participants.filter(elem => elem === participantId)
      if (found.length < 1) {
        console.warn('Could not remove participant, id not found')
        return
      }

      // avoid if child processes are on this Participant to keep them in container
      let used = this.datamodel.childs.filter(elem => elem.initiator === participantId)

      if (used.length > 0) {
        console.warn('Could not remove Participant, there are still processes applied')
        return
      }

      // avoid if only one Participant is left
      if (this.datamodel.participants.length < 2) {
        console.warn('Could not remove more Participants')
        return
      }

      // remove id from model
      this.datamodel.participants = this.datamodel.participants.filter(elem => elem !== participantId)
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
