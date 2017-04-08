import { Object } from './Object'
import _ from 'lodash';

export class Process extends Object  {
    constructor(name, begin, end) {
        super(name);

        // Von Bis
        this.begin = "";
        this.end = "";

        // externe Beteiligung
        this.access = "closed";

        // Verbindungen
        this.connector = {
            from: [],
            to: []
        };

        this.parents = [];
        this.childs = [];

    }

    addChild(child) {
        console.log("add child with id: " + child.id);
        this.removeChild(child);
        this.childs.push(child);
    }

    removeChild(child) {
        if (!Process.validateInstance(child)) {
            console.error("validation error child");
            return;
        }

        console.log("remove child with id: " + child.id);
        _.remove(this.childs, function(n) {
            console.log(n.id + ":" + child.id);
            console.log(n.id == child.id)
            return n.id == child.id;
        });
    }

    static connect(from, to) {
        if (!Process.validateInstance(from) || !Process.validateInstance(to)) {
            console.error("connection ignored: parameter not set");
            return;
        }

        if (from.id == to.id) {
            console.error("connection ignored: parameter are equal");
            return;
        }

        Process.disconnect(from, to);
        from.connector.to.push(to);
        to.connector.from.push(from);
        console.log( "connection added: " + from.id + " ---> " + to.id );
    }

    static disconnect(from, to) {
        _.remove(from.connector.to, function(n) {
            console.log(n.id + ":" + from.id);
            console.log(n.id == from.id)
            return n.id == from.id;
        });

        _.remove(to.connector.from, function(n) {
            console.log(n.id + ":" + to.id);
            console.log(n.id == to.id)
            return n.id == to.id;
        });

        console.log( "connection removed: " + from.id + " -/--> " + to.id );
    }

    static validateInstance(obj) {
        return  (obj && obj instanceof Process) ? true : false;
    }
}