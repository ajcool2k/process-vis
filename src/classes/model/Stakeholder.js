
export class Stakeholder {
  constructor (name, type, contact) {
    const uniqid = require('uniqid')
    this.id = uniqid()
    this.name = typeof name === 'string' ? name : '[new]'
    this.type = typeof type === 'string' ? type : 'Person'
    this.contact = {
      contactPerson: '',
      postAddress: '',
      phone: '',
      telefax: '',
      email: '',
      website: ''
    }
  }

  // IMPL getter and setter

  get mName () { return this.name }
  set mName (name) { this.name = name }

  get props () { return this }
  set props (serializedStakeholder) {
    if (!serializedStakeholder || typeof serializedStakeholder === 'undefined') {
      console.warn('Stakeholder.props() - serializedStakeholder is undefined')
      return
    }

    this.id = serializedStakeholder.id
    this.name = serializedStakeholder.name
    this.type = serializedStakeholder.type
    this.contact = serializedStakeholder.contact
  }
}
