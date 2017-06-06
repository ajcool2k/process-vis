import { Object } from './Object'

export class Process extends Object {
  constructor (name, participant, begin, end, startProcess) {
    super(name)

    this.begin = begin
    this.end = end
    this.duration = this.end - this.begin // in Millis

    this.participant = typeof participant !== 'undefined' ? participant : 1
    this.startProcess = typeof startProcess !== 'undefined' ? startProcess : false

    // externe Beteiligung
    this.access = 'closed'
  }

  getDuration () {
    return isNaN(this.duration) ? 0 : this.duration
  }

  static validateInstance (obj) {
    return (obj && obj instanceof Process)
  }
}
