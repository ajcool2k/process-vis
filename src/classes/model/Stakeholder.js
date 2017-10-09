
export class Stakeholder {
  constructor (name, type, contact) {
    const uniqid = require('uniqid')
    this.id = uniqid()
    this.name = typeof name === 'string' ? name : ''
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
  set mName (name) {
    this.name = name
  }

  get mContact () { return this.contact }
  set mContact (contact) {
    if (typeof contact !== 'object' || !contact) {
      console.warn('Stakeholder.mContact - expects an object')
      return
    }

    this.contact.contactPerson = contact.hasOwnPropety('contactPerson') && typeof contact.contactPerson === 'string' ? contact.contactPerson : ''
    this.contact.postAddress = contact.hasOwnPropety('postAddress') && typeof contact.postAddress === 'string' ? contact.postAddress : ''
    this.contact.phone = contact.hasOwnPropety('phone') && typeof contact.phone === 'string' ? contact.phone : ''
    this.contact.telefax = contact.hasOwnPropety('telefax') && typeof contact.telefax === 'string' ? contact.telefax : ''
    this.contact.email = contact.hasOwnPropety('email') && typeof contact.email === 'string' ? contact.email : ''
    this.contact.website = contact.hasOwnPropety('website') && typeof contact.website === 'string' ? contact.website : ''
  }

  get props () { return this }
  set props (serializedStakeholder) {
    if (typeof serializedStakeholder !== 'object' || !serializedStakeholder) {
      console.warn('Stakeholder.props() - serializedStakeholder expects object')
      return
    }

    this.id = serializedStakeholder.id
    this.name = serializedStakeholder.name
    this.type = serializedStakeholder.type
    this.contact = serializedStakeholder.contact
  }
}
