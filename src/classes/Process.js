import { BaseObject } from './BaseObject'

export class Process extends BaseObject {
  constructor (name, participant, begin, end, startProcess) {
    super(name)

    this._duration = 0  // will be calculated by begin and end

    this.begin = begin  // time of process begin
    this.end = end  // time of process end

    this.participant = participant
    this.startProcess = startProcess

    this.access = 'closed'  // externe Beteiligung
  }

  get access () { return this._access }
  set access (access) { this._access = access }

  get participant () { return this._participant }
  set participant (participant) { this._participant = typeof participant !== 'undefined' ? participant : 1 }

  get startProcess () { return this._startProcess }
  set startProcess (startProcess) { this._startProcess = typeof startProcess !== 'undefined' ? startProcess : false }

  get begin () { return this._begin }
  set begin (begin) {
    if (begin instanceof Date === false) {
      console.warn('Process: begin is not a date')
      return
    }
    this._begin = begin

    if (this.begin instanceof Date && this.end instanceof Date) this._duration = this.end - this.begin
  }

  get end () { return this._end }
  set end (end) {
    if (end instanceof Date === false) {
      console.warn('Process: end is not a date')
      return
    }

    this._end = end

    if (this.begin instanceof Date && this.end instanceof Date) this._duration = this.end - this.begin
  }

  get duration () { return isNaN(this._duration) ? 0 : this._duration }
  set duration (duration) { console.warn('duration cannot be set') }
}
