import { Metadata } from '@/classes/model/Metadata'
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

    // timestamps
    this.created = new Date()
    this.modified = new Date()
  }

  // IMPL getter and setter
  get props () { return this }
  set props (serializedProcess) {
    if (typeof serializedProcess !== 'object' || !serializedProcess) {
      console.warn('Process.props() - serializedProcess expects an object')
      return false
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
    this.stakeholder = serializedProcess.stakeholder
    this.location = serializedProcess.location

    serializedProcess.childs.forEach(child => {
      let childProcess = new Process()
      childProcess.props = child
      this.addChild(childProcess)
    })

    serializedProcess.results.forEach(res => {
      let result = new Result()
      result.props = res
      this.addResult(result)
    })

    // timestamps
    this.created = serializedProcess.created ? new Date(serializedProcess.created) : null
    this.modified = serializedProcess.modified ? new Date(serializedProcess.modified) : null

    return true
  }

  get mInitiator () { return this.initiator }
  set mInitiator (initiator) {
    if (typeof initiator !== 'string') {
      console.warn('Process.mInitiator - expects string')
      return false
    }

    this.initiator = initiator
    return true
  }

  get mReference () { return this.reference }
  set mReference (reference) {
    if (typeof reference !== 'string') {
      console.warn('Process.mReference - expects string')
      return false
    }

    this.reference = reference
    return true
  }

  get mName () { return this.name }
  set mName (name) {
    if (typeof name !== 'string') {
      console.warn('Process.mName - expects string')
      return false
    }

    this.name = name
    return true
  }

  get mDescription () { return this.description }
  set mDescription (description) {
    if (typeof description !== 'string') {
      console.warn('Process.mDescription - expects string')
      return false
    }

    this.description = description
    return true
  }

  get mStart () { return this.start }
  set mStart (start) {
    if (start instanceof Date === false) {
      console.warn('Process: start is not a date')
      return false
    }
    this.start = new Date(start.valueOf()) // create copy of date

    if (this.start instanceof Date && this.end instanceof Date) this._duration = this.end - this.start

    return true
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
      return false
    }

    this.end = new Date(end.valueOf()) // create copy of date
    this._defaultEndDate = this.end

    if (this.start instanceof Date && this.end instanceof Date) this._duration = this.end - this.start

    return true
  }

  setChilds (childs) {
    if (childs instanceof Array === false) {
      console.warn('Process.setChilds - expected childs as type Array')
      return false
    }

    this.childs = []
    childs.forEach(elem => { this.addChild(elem) })
    return true
  }

  addChild (child) {
    if (child instanceof Process === false) {
      console.warn('Process.addChild - expected child as type Process')
      return false
    }

    child.parent = this.id
    this.childs.push(child)
    this.addParticipant(child.initiator)

    return true
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
    if (stakeholder instanceof Stakeholder === false) {
      console.warn('Process.addStakeholder() - expected string')
      return false
    }

    let found = this.stakeholder.find(elem => elem === stakeholder.id)
    if (typeof found !== 'undefined') {
      console.warn('Process.addStakeholder() - id is already set')
      return false
    }

    this.stakeholder.push(stakeholder.id)
    Metadata.addStakeholder(stakeholder)
    return true
  }

  removeStakeholder (id) {
    if (typeof id !== 'string') {
      console.warn('Process.removeStakeholder() - expected string')
      return false
    }

    let index = this.stakeholder.findIndex(elem => elem === id)

    if (index === -1) {
      console.warn('Process.removeStakeholder() - could not find stakeholder')
      return false
    }

    this.stakeholder.splice(index, 1)
    return true
  }

  removeChild (id) {
    if (typeof id !== 'string') {
      console.warn('Process.removeChild - expected id as a string')
      return false
    }

    let index = this.childs.findIndex(elem => elem.id === id)

    if (index === -1) {
      console.warn('Process.removeChild - id not found')
      return false
    }

    let child = this.childs[index]

    // remove Connection
    this.childs.forEach(elem => {
      if (elem.connection.from.indexOf(id) > -1) child.removeConnectionTo(elem)
      if (elem.connection.to.indexOf(id) > -1) elem.removeConnectionTo(child)
    })

    this.childs.splice(index, 1)
    return true
  }

  addConnectionTo (target) {
    if (typeof target !== 'object' || !target) {
      console.warn('Process.addConnectionTo() - expected object')
      return false
    }

    this.connection.to.push(target.id)
    target.connection.from.push(this.id)

    this._connections.push({ id: this.id + '->' + target.id, source: this.id, target: target.id })
    return true
  }

  removeConnectionTo (target) {
    if (typeof target !== 'object' || !target) {
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
    if (results instanceof Array === false) {
      console.warn('Process.setResults() - expected Array')
      return false
    }

    this.results = []
    results.forEach(elem => { this.addResult(elem) })

    return true
  }

  addResult (result) {
    if (result instanceof Result === false) {
      console.warn('Process.addResult() - expected Result')
      return false
    }

    this.results.push(result)
    return true
  }

  removeResult (id) {
    if (typeof id !== 'string') {
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

    this.location.push(location.id)
    Metadata.addLocation(location)
    return true
  }

  removeLocation (id) {
    if (typeof id !== 'string') {
      console.warn('Process.removeLocation() - expected string')
      return false
    }

    let index = this.location.findIndex(elem => elem === id)

    if (index === -1) {
      console.warn('Process.removeLocation() - could not find location')
      return false
    }

    this.location.splice(index, 1)
    return true
  }

  get mDuration () { return isNaN(this._duration) ? 0 : this._duration }
  set mDuration (duration) {
    if (typeof duration !== 'number' || duration < 1) {
      console.warn('Process.mDuration - expected number > 1')
      return false
    }

    this.end = new Date(this.start.valueOf() + duration)
    this._duration = duration

    return true
  }

  get mParticipation () { return this.participation }
  set mParticipation (participation) {
    if (typeof participation !== 'string') {
      console.warn('Process.mParticipation() - expected string')
      return false
    }
    let whitelist = [ 'closed', 'open' ]
    if (whitelist.indexOf(participation) === -1) {
      console.warn('Process.mParticipation() - expected string from the whitelist ' + whitelist.toString)
      return false
    }

    this.participation = participation

    return true
  }

  get mPosition () { return this._position }
  set mPosition (position) {
    if (typeof position !== 'object' || !position || !position.hasOwnPropety('x') || !position.hasOwnPropety('y')) {
      console.warn('Process.mParticipation() - expected object with attributes x and y')
      return false
    }

    this._position = { x: position.x, y: position.y }
    return true
  }

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
