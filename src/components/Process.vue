<template>
  <div id="Process">

    <!-- child component -->
    <workspace :processModel="datamodel" :isSaved="isSaved" :changes="changes"

        v-on:list="listModels"
        v-on:save="saveModel"
        v-on:download="downloadModel"
        v-on:remove="removeModel"

        v-on:removeHead="removeHead"
        v-on:changeProcess="changeProcess"

        v-on:forceRedraw="forceRedraw"
    ></workspace>

  </div>
</template>

<script>
// Dependencies

// Classes
import { Exchange } from '@/classes/utils/Exchange'
import { Helper } from '@/classes/utils/Helper'
import { Calc } from '@/classes/utils/Calc'

import { Data } from '@/classes/utils/Data'

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

      if (routeInfo.id === 'demo') {
        this.addData()
        return
      }

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
    // whenever children changes, this function will run
    'datamodel.children': function (updatedChildren) {
      let startProcess = Calc.getStartProcess(this.datamodel.children)
      console.log('new startingProcess: ', startProcess)
    }
  },
  methods: {

    create () {
      let initiator = new Stakeholder('[untitled]')
      let process = new Process('[untitled]', initiator.id, new Date(), null)
      process.addStakeholder(initiator)
      this.model = process
      this.datamodel = this.model
    },

    addData () {
      console.log('App addData')

      // add column
      let generatedData = Data.generateRandomData()
      this.model = generatedData.datamodel
      this.datamodel = this.model
      console.log(generatedData)
    },

    removeHead () {
      console.log('Process.removeHead()')

      // Fall 1 (Head mit einem Kind, Kind soll neuer Head werden)
      if (this.datamodel.children.length !== 1) {
        console.log('Process.removeHead() - head can only get removed when it has 1 child')
        return
      }

        this.model = this.datamodel.children[0]
        this.model.parent = ''
        this.datamodel = this.model

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
          let startProcess = Calc.getStartProcess(this.model.children)
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
        let process = Helper.getElement(processId, this.model, 'children')

        if (typeof process === 'undefined') {
          console.warn('Could not find parentProcess')
          return
        }

        this.datamodel = process
        return
      }

      // lower level requested
      let process = this.datamodel.getChild(event)

      if (typeof process === 'undefined') {
        console.log('Could not find childProcess')
        return
      }
      console.log('changeProcess to', process)
      this.datamodel = process
    },

    forceRedraw () {
      console.warn('forceRedraw called')
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
      Exchange.downloadProcess(this.model, Metadata.getData())
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

<style lang="scss" scoped></style>
