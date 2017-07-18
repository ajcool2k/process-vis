var gloablId = 0

export class BaseObject {
  constructor (name) {
    this.id = ++gloablId
    this.name = name
  }

  get name () { return this._name }
  set name (name) { this._name = name }
}
