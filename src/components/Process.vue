<template>
  <div id="Process">

    <!-- child component -->
    <workspace :processModel="datamodel" :isSaved="isSaved" :changes="changes"

        v-on:list="listModels"
        v-on:save="saveModel"
        v-on:download="downloadModel"
        v-on:remove="removeModel"

        v-on:addConnection="addConnection"
        v-on:removeConnection="removeConnection"

        v-on:addProcess="addProcess"
        v-on:moveProcess="moveProcess"
        v-on:removeProcess="removeProcess"
        v-on:updateProcess="updateProcess"
        v-on:changeProcess="changeProcess"

        v-on:addParticipant="addParticipant"
        v-on:removeParticipant="removeParticipant"

    ></workspace>

  </div>
</template>

<script>
// Dependencies
import { _ } from 'underscore'

// Classes
import { Exchange } from '@/classes/utils/Exchange'
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
      isSaved: false,
      savedId: '',
      model: null,
      datamodel: new Process(),
      changes: {
        time: new Date()
      }
    }
  },

  created: function () {
    console.log('App created')
    console.log('Route data', this.$route.params)
    let routeInfo = this.$route.params
    if (routeInfo.hasOwnProperty('id')) {
      console.log('existing model requested')
      let process = new Process()
      let obj = Exchange.openProcess(routeInfo.id)
      process.props = obj
      this.model = process
      this.datamodel = this.model
      this.isSaved = true
      this.savedId = this.model.id
    } else {
      console.log('new model requested')
      this.addData()
    }
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
      let startProcess = Calc.getStartProcess(this.datamodel.childs)
      console.log('new startingProcess: ', startProcess)
    }
  },
  methods: {

    addData () {
      console.log('App addData')

      // add column
      this.addParticipant()
      let generatedData = Data2.generateData()
      this.model = generatedData.datamodel
      this.datamodel = this.model
      console.log(generatedData)
    },

    addProcess (process) {
      console.log('addProcess', process)
      this.datamodel.addChild(process)
    },

    moveProcess (processData) {
      console.log('moveProcess', processData)
      let process = this.datamodel.childs.find(elem => elem.id === processData.processId)
      process.initiator = processData.participantId
      this.forceRedraw()
    },

    removeProcess (processId) {
      console.log('Process (removeProcess): ' + processId)
      this.datamodel.removeChild(processId)
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

      processSource.addConnectionTo(processTarget)
    },

    removeConnection (connectionId) {
      console.log('removeConnection', connectionId)

      if (typeof connectionId !== 'string') {
        console.warn('Process.removeConnection - expected id as a string')
        return
      }

      let con = Helper.connectionParse(connectionId)
      let processFrom = this.datamodel.childs.find(elem => elem.id === con.source)
      let processTo = this.datamodel.childs.find(elem => elem.id === con.target)

      processFrom.removeConnectionTo(processTo)
    },

    changeProcess (event) {
      console.log('changeProcess', event)

      if (typeof event !== 'string') {
        console.warn('Could not change Process, expected String')
        return
      }

      // Upper level requested
      if (event === 'parent') {
        if (this.datamodel.parent === '') {
          // create a new headProcess
          let stakeholder = new Stakeholder('[untitled]')

          let head = new Process('head')
          head.addStakeholder(stakeholder)
          this.model.initiator = stakeholder.id
          head.addChild(this.model)

          this.model = head
          this.datamodel = head
          return
        }

        // return an existing Process
        let processId = this.datamodel.parent
        if (processId === this.model.id) {
          this.datamodel = this.model // return head
          return
        } else {
          let process = this.model.childs.find(elem => elem.id === processId)
          if (typeof process === 'undefined') {
            console.warn('Could not find parentProcess')
            return
          }
          this.datamodel = process
          return
        }
      }

      // lower level requested
      let process = this.datamodel.childs.find(elem => elem.id === event)

      if (typeof process === 'undefined') {
        console.log('Could not find childProcess')
        return
      }
      console.log('changeProcess to', process)
      this.datamodel = process
    },

    addParticipant () {
      let stakeholder = new Stakeholder()
      console.log('stakeholder', stakeholder)
      this.datamodel.stakeholder.push(stakeholder)
      this.datamodel.addParticipant(stakeholder.id)
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
    },

    listModels () {
      console.warn('saveModel')
      this.$router.replace('/')
    },

    saveModel () {
      console.warn('saveModel')
      Exchange.storeProcess(this.model)
      this.$router.replace('/process/' + this.model.id)

      // remove old Model
      if (this.savedId !== this.model.id) {
        Exchange.removeProcess(this.savedId)
      }

      this.isSaved = true
      this.savedId = this.model.id
    },

    downloadModel () {
      console.warn('download')
      Exchange.downloadProcess(this.model)
    },

    removeModel () {
      console.warn('removeModel')
      let ret = Exchange.removeProcess(this.model.id)

      if (ret === false) {
        console.warn('Process.removeModel() - could not remove Model')
        return
      }
      this.isSaved = false
      this.$router.replace('/')
    }

  }
}
</script>

<style lang="scss" scoped>

</style>
