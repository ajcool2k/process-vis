export class Process {
  constructor (name, initiator, start, end) {
    this._comment = 'Process'

    const uniqid = require('uniqid')
    this.id = uniqid()

    this.reference = ''
    this.initiator = initiator

    this.connection = {
      from: [],
      to: []
    }

    this.parent = ''
    this.mName = name
    this.description = ''
    this.location = [] // all locations on this process (not taken child locations into account)
    this._duration = 0 // will be calculated by start and end

    this.start = null
    this.end = null
    this.mStart = start // time of process start
    this.mEnd = end // time of process end

    this.participation = 'closed' // externe Beteiligung
    this.participants = []
    this.transformation = {
      type: '=',
      info: '',
      decision: ''
    }
    this.results = []
    this.childs = []
    this.stakeholder = []
    this.locations = []

    // timestamps
    this.created = new Date()
    this.modified = ''

    this._position = { x: 0, y: 0 }
    this._connections = [] // wrapper for connection
    this._width = 0
    this._height = 0
  }

  // IMPL getter and setter

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

  get mDuration () { return isNaN(this._duration) ? 0 : this._duration }
  set mDuration (duration) { console.warn('duration cannot be set') }

  get mParticipation () { return this.participation }
  set mParticipation (participation) { this.participation = participation }

  get mConnections () { return this._connections }
  set mConnections (con) {
    if (con.from && typeof con.from !== 'undefined') this.connection.from.push(con.from)
    if (con.to && typeof con.to !== 'undefined') {
      this.connection.to.push(con.to)
      this._connections.push({ id: this.id + '->' + con.to, source: this.id, target: con.to })
    }
  }

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
