import { Stakeholder } from '@/classes/model/Stakeholder'
import { Result } from '@/classes/model/Result'
import { Location } from '@/classes/model/Location'
import { Transformation } from '@/classes/model/Transformation'

export class Process {
  constructor (name, initiator, start, end) {
    // Privates (not in the datamodel included)
    this._comment = 'Process'
    this._position = { x: 0, y: 0 }
    this._connections = [] // wrapper for connection
    this._width = 0
    this._height = 0
    this._defaultEndDate = null
    this._duration = 0 // will be calculated by start and end
    this._domNode = null

    const uniqid = require('uniqid')
    this.id = uniqid()

    this.reference = ''
    this.initiator = typeof initiator !== 'undefined' ? initiator : ''

    this.connection = {
      from: [],
      to: []
    }

    this.parent = ''
    this.name = name && typeof name !== 'undefined' ? name : ''
    this.description = ''
    this.location = [] // all locations on this process (not taken child locations into account)

    this.start = null
    this.end = null
    this.mStart = start // time of process start
    this.mEnd = end // time of process end

    this.participation = 'closed' // externe Beteiligung
    this.participants = []
    this.transformation = new Transformation()
    this.results = []
    this.childs = []
    this.stakeholder = []
    this.locations = []

    // timestamps
    this.created = new Date()
    this.modified = new Date()
  }

  // IMPL getter and setter
  get props () { return this }
  set props (serializedProcess) {
    if (!serializedProcess || typeof serializedProcess === 'undefined') {
      console.warn('Process.props() - serializedProcess is undefined')
      return
    }

    this.id = serializedProcess.id
    this.name = serializedProcess.name
    this.reference = serializedProcess.reference
    this.initiator = serializedProcess.initiator
    this.connection = serializedProcess.connection
    this.connection.to.forEach(con => {
      this._connections.push({ id: this.id + '->' + con, source: this.id, target: con })
    })
    this.parent = serializedProcess.parent
    this.name = serializedProcess.name
    this.description = serializedProcess.description
    this.mStart = serializedProcess.start ? new Date(serializedProcess.start) : null
    this.mEnd = serializedProcess.end ? new Date(serializedProcess.end) : null
    this.participation = serializedProcess.participation
    this.transformation.props = serializedProcess.transformation
    this.participants = serializedProcess.participants

    serializedProcess.childs.forEach(child => {
      let childProcess = new Process()
      childProcess.props = child
      this.addChild(childProcess)
    })

    serializedProcess.stakeholder.forEach(sh => {
      let stakeholder = new Stakeholder()
      stakeholder.props = sh
      this.addStakeholder(stakeholder)
    })

    serializedProcess.results.forEach(res => {
      let result = new Result()
      result.props = res
      this.addResult(result)
    })

    serializedProcess.location.forEach(loc => {
      let location = new Location()
      location.props = loc
      this.addLocation(location)
    })

    this.locations = serializedProcess.locations

    // timestamps
    this.created = serializedProcess.created ? new Date(serializedProcess.created) : null
    this.modified = serializedProcess.modified ? new Date(serializedProcess.modified) : null
  }

  get mInitiator () { return this.initiator }
  set mInitiator (initiator) { this.initiator = typeof initiator !== 'undefined' ? initiator : 1 }

  get mName () { return this.name }
  set mName (name) { this.name = name }

  get mStart () { return this.start }
  set mStart (start) {
    if (start instanceof Date === false) {
      console.warn('Process: start is not a date')
      return
    }
    this.start = new Date(start.valueOf()) // create copy of date

    if (this.start instanceof Date && this.end instanceof Date) this._duration = this.end - this.start
  }

  get mEnd () {
    if (this._defaultEndDate instanceof Date === true) return this._defaultEndDate

    console.warn('Process: defaultDate is not a date')

    if (this.end instanceof Date === false) {
      console.warn('Process: endDate is not a date - returning startDate')
      return this.start
    }

    return this.end
  }

  set mEnd (end) {
    if (end instanceof Date === false) {
      console.warn('Process: end is not a date')
      return
    }

    this.end = new Date(end.valueOf()) // create copy of date
    this._defaultEndDate = this.end

    if (this.start instanceof Date && this.end instanceof Date) this._duration = this.end - this.start
  }

  setChilds (childs) {
    if (childs instanceof Array === false) {
      console.warn('Process.setChilds - expected childs as type Array')
      return
    }

    this.childs = []
    childs.forEach(elem => { this.addChild(elem) })
  }

  addChild (child) {
    if (typeof child === 'undefined' || child instanceof Process === false) {
      console.warn('Process.addChild - expected child as type Process')
      return
    }

    child.parent = this.id
    this.childs.push(child)
    this.addParticipant(child.initiator)
  }

  addParticipant (id) {
    if (typeof id !== 'string') {
      console.warn('Process.addParticipant() - expected string')
      return false
    }

    let found = this.participants.find(elem => elem === id)
    if (typeof found !== 'undefined') {
      console.warn('Process.addParticipant() - id is already set')
      return false
    }

    this.participants.push(id)
    return true
  }

  addStakeholder (stakeholder) {
    if (typeof stakeholder === 'undefined' || stakeholder instanceof Stakeholder === false) {
      console.warn('Process.addStakeholder() - expected string')
      return false
    }

    let found = this.stakeholder.find(elem => elem.id === stakeholder.id)
    if (typeof found !== 'undefined') {
      console.warn('Process.addStakeholder() - id is already set')
      return false
    }

    this.stakeholder.push(stakeholder)
    return true
  }

  removeChild (id) {
    if (typeof id !== 'string') {
      console.warn('Process.removeChild - expected id as a string')
      return
    }

    let index = this.childs.findIndex(elem => elem.id === id)

    if (index === -1) {
      console.warn('Process.removeChild - id not found')
      return
    }

    let child = this.childs[index]

    // remove Connection
    this.childs.forEach(elem => {
      if (elem.connection.from.indexOf(id) > -1) child.removeConnectionTo(elem)
      if (elem.connection.to.indexOf(id) > -1) elem.removeConnectionTo(child)
    })

    this.childs.splice(index, 1)
  }

  addConnectionTo (target) {
    if (typeof target !== 'object') {
      console.warn('Process.addConnectionTo() - expected object')
      return false
    }

    this.connection.to.push(target.id)
    target.connection.from.push(this.id)

    this._connections.push({ id: this.id + '->' + target.id, source: this.id, target: target.id })
    return true
  }

  removeConnectionTo (target) {
    if (typeof target !== 'object') {
      console.warn('Process.addConnectionTo() - expected object')
      return false
    }

    let connectionId = this.id + '->' + target.id
    this.connection.to = this.connection.to.filter(elem => elem !== target.id) // remove to process
    target.connection.from = target.connection.from.filter(elem => elem !== this.id) // remove from process
    this._connections = this._connections.filter(elem => elem.id !== connectionId) // remove from private connection object

    return true
  }

  setResults (results) {
    if (typeof results === 'undefined' || results instanceof Array === false) {
      console.warn('Process.setResults() - expected Array')
      return false
    }

    this.results = []
    results.forEach(elem => { this.addResult(elem) })
  }

  addResult (result) {
    if (typeof result === 'undefined' || result instanceof Result === false) {
      console.warn('Process.addResult() - expected Result')
      return false
    }

    this.results.push(result)
    return true
  }

  removeResult (id) {
    if (typeof result !== 'string') {
      console.warn('Process.removeResult() - expected string')
      return false
    }

    let index = this.results.findIndex(elem => elem.id === id)

    if (index === -1) {
      console.warn('Process.removeResult() - could not find result')
      return false
    }

    this.results.splice(index, 1)
    return true
  }

  setLocations (locations) {
    if (typeof locations === 'undefined' || locations instanceof Array === false) {
      console.warn('Process.setLocations() - expected Array')
      return false
    }

    this.location = []
    locations.forEach(elem => { this.addLocation(elem) })
  }

  addLocation (location) {
    if (typeof location === 'undefined' || location instanceof Location === false) {
      console.warn('Process.addLocation() - expected Location')
      return false
    }

    this.location.push(location)
    return true
  }

  removeLocation (id) {
    if (typeof location !== 'string') {
      console.warn('Process.removeLocation() - expected string')
      return false
    }

    let index = this.location.findIndex(elem => elem.id === id)

    if (index === -1) {
      console.warn('Process.removeLocation() - could not find location')
      return false
    }

    this.location.splice(index, 1)
    return true
  }

  get mDuration () { return isNaN(this._duration) ? 0 : this._duration }
  set mDuration (duration) { console.warn('duration cannot be set') }

  get mParticipation () { return this.participation }
  set mParticipation (participation) { this.participation = participation }

  get mPosition () { return this._position }
  set mPosition (position) { this._position = position }

  get mPrivates () {
    let keys = Object.keys(this)
    let privateKeys = keys.filter(elem => elem.startsWith('_'))
    let ret = {}
    privateKeys.forEach(elem => {
      ret[elem] = this[elem]
    })
    return ret
  }
}
