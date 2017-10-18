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

        v-on:addDelegate="addDelegate"
        v-on:removeDelegate="removeDelegate"

    ></workspace>

  </div>
</template>

<script>
// Dependencies

// Classes
import { Exchange } from '@/classes/utils/Exchange'
import { Helper } from '@/classes/utils/Helper'
import { Calc } from '@/classes/utils/Calc'

import { Data2 } from '@/classes/utils/Data2'

import { Metadata } from '@/classes/model/Metadata'
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
      metadata: {},
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
    Metadata.clear()
    this.metadata = Metadata.getData()

    console.log('Route data', this.$route.params)

    let routeInfo = this.$route.params
    if (routeInfo.hasOwnProperty('id')) {
      console.log('existing model requested')

      let processWrapper = Exchange.openProcess(routeInfo.id)

      if (typeof processWrapper === 'undefined') {
        console.warn('Local Model ' + routeInfo.id + ' not found')
        return
      }

      console.log(processWrapper)
      let process = new Process()
      process.props = processWrapper.model
      this.metadata = Metadata.parse(processWrapper.metadata)

      this.model = process
      this.datamodel = this.model
      this.isSaved = true
      this.savedId = this.model.id
    } else {
      console.log('new model requested')
      this.create()
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

    create () {
      let initiator = new Stakeholder('[untitled]', 'person')
      let process = new Process('[untitled]', initiator.id, new Date(), null)
      process.addStakeholder(initiator)
      this.model = process
      this.datamodel = this.model
    },

    addData () {
      console.log('App addData')

      // add column
      let generatedData = Data2.generateData()
      this.model = generatedData.datamodel
      this.datamodel = this.model
      console.log(generatedData)
    },

    addProcess (process) {
      console.log('addProcess', process)

      if (this.datamodel.mDelegates.length === 0) {
        this.addDelegate()
        process.mInitiator = this.datamodel.mDelegates[0]
      }

      this.datamodel.addChild(process)
    },

    moveProcess (processData) {
      console.log('moveProcess', processData)
      let process = this.datamodel.childs.find(elem => elem.id === processData.processId)
      process.initiator = processData.delegateId
      this.forceRedraw()
    },

    removeProcess (processId) {
      console.log('Process (removeProcess): ' + processId)

      let process = Helper.getElement(processId, this.model, 'childs')

      if (typeof process === 'undefined') {
        console.warn('Could not find process')
        return
      }

      let head = this.model

      // Fall 1 (Head mit einem Kind, Kind soll neuer Head werden)
      if (head.id === process.id) {
        if (process.childs.length !== 1) {
          console.log('Process.removeProcess() - head can only get removed when it has 1 child')
          return
        }

        this.model = process.childs[0]
        this.model.parent = ''
        this.datamodel = this.model
        return
      }

      // Fall 2 (Prozess ohne Kinder, aber nicht Head)
      if (process.childs.length === 0) {
        let parentProcess = Helper.getElement(process.parent, this.model, 'childs')
        parentProcess.removeChild(processId)
        return
      }

      console.log('Process.removeProcess() - Process cannot be removed')
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

      if (processSource === processTarget) {
        console.log('Process.addConnection() - self connection not possible')
        return
      }

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
          let head = new Process('head')

          // set initiator
          let headStakeholder = new Stakeholder('[untitled-initator-for-' + head.id + ']')
          head.addStakeholder(headStakeholder)
          head.mInitiator = headStakeholder.id

          // set last head stakeholde as delegate
          let stakeholder = Metadata.findStakeholder(this.model.initiator)
          head.addStakeholder(stakeholder)
          head.addDelegate(stakeholder.id)

          // set startTime
          let startProcess = Calc.getStartProcess(this.model.childs)
          head.mStart = typeof startProcess === 'undefined' ? new Date() : startProcess.start

          // append last model as a child
          head.addChild(this.model)
          this.model = head
          this.datamodel = head

          return
        }

        // return an existing Process
        let processId = this.datamodel.parent

        // find process
        let process = Helper.getElement(processId, this.model, 'childs')

        if (typeof process === 'undefined') {
          console.warn('Could not find parentProcess')
          return
        }

        this.datamodel = process
        return
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

    addDelegate () {
      let stakeholder = new Stakeholder('[untitled]')
      console.log('addDelegate', stakeholder)
      this.datamodel.addStakeholder(stakeholder)
      this.datamodel.addDelegate(stakeholder.id)
    },

    removeDelegate (delegateId) {
      console.log('remove Delegate', delegateId)

      if (typeof delegateId === 'undefined' || delegateId.length < 1) {
        console.warn('Could not remove delegate, id missing')
        return
      }

      // check if id exists
      let found = this.datamodel.mDelegates.filter(elem => elem === delegateId)
      if (found.length < 1) {
        console.warn('Could not remove delegate, id not found')
        return
      }

      // avoid if child processes are on this Delegate to keep them in container
      let used = this.datamodel.childs.filter(elem => elem.initiator === delegateId)

      if (used.length > 0) {
        console.warn('Could not remove Delegate, there are still processes applied')
        return
      }

      // avoid if only one Delegate is left
      if (this.datamodel.mDelegates.length < 2) {
        console.warn('Could not remove more Delegates')
        return
      }

      // remove id from model
      this.datamodel.mDelegates = this.datamodel.mDelegates.filter(elem => elem !== delegateId)
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
      let processWrapper = Exchange.wrapProcess(this.model, Metadata.getData())
      Exchange.storeProcess(processWrapper)
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
