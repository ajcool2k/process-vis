import { Object } from './Object'
import _ from 'lodash';

export class Process extends Object  {
    constructor(name, duration, begin, end) {
        super(name);

        // Von Bis
        this.begin = "";
        this.end = "";
        this.duration = duration;

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