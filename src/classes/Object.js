var gloablId = 0;

export class Object {
    // private props

    constructor(name) {
        this.id = ++gloablId;
        this.name = name;
        console.log("object");
    }

    // set name(name) { this.name = name }
    // get name() { return this.name }
}