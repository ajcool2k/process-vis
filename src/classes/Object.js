var gloablId = 0;

export class Object {
    // private props

    constructor(name) {
        this.id = ++gloablId;
        this.name = name;
        console.log("object with id " + this.id + " created.");
    }

    // set name(name) { this.name = name }
    // get name() { return this.name }
}