import { Object } from './Object'

export class Process extends Object  {
    constructor(name, duration, participant, time) {
        super(name);

        // Von Bis
        this.begin = "";
        this.end = "";

        this.time = time;
        this.duration = duration;
        this.participant = participant ? participant : 1;

        // externe Beteiligung
        this.access = "closed";

    }

    getDuration() {
        return isNaN(this.duration) ? 0 : this.duration;
    }

    static validateInstance(obj) {
        return  (obj && obj instanceof Process) ? true : false;
    }
}