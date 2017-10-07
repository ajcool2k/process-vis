import { Stakeholder } from '@/classes/model/Stakeholder'
import { Location } from '@/classes/model/Location'

export class Metadata {
  static getLocations () { return Metadata.locations }
  static setLocations (locations) {
    if (locations instanceof Array !== true) {
      console.warn('Metadata setLocations expects an Array')
      return false
    }

    Metadata.locations = []
    locations.forEach(elem => { Metadata.addLocation(elem) })

    return true
  }

  static findLocation (id) {
    if (typeof id !== 'string') {
      console.warn('Metadata.findLocation() - expected a string')
      return
    }

    return Metadata.locations.find(elem => elem.id === id)
  }

  static addLocation (location) {
    if (typeof location === 'undefined' || location instanceof Location === false) {
      console.warn('Process.addLocation() - expected Location')
      return false
    }

    let found = Metadata.locations.find(elem => elem === location.id)
    if (typeof found !== 'undefined') {
      console.log('Metadata.addLocation() - id is already set')
      return false
    }

    Metadata.locations.push(location)
    return true
  }

  static removeLocation (id) {
    if (typeof id !== 'string') {
      console.warn('Process.removeLocation() - expected string')
      return false
    }

    let index = Metadata.locations.findIndex(elem => elem.id === id)

    if (index === -1) {
      console.warn('Process.removeLocation() - could not find location')
      return false
    }

    Metadata.locations.splice(index, 1)
    return true
  }

  static getStakeholder () { return Metadata.stakeholder }
  static setStakeholder (stakeholder) {
    if (stakeholder instanceof Array !== true) {
      console.warn('Metadata setStakeholder expects an Array')
      return false
    }

    Metadata.stakeholder = []
    stakeholder.forEach(elem => { Metadata.addStakeholder(elem) })

    return true
  }

  static findStakeholder (id) {
    if (typeof id !== 'string') {
      console.warn('Metadata.findStakeholder() - expected a string')
      return
    }

    return Metadata.stakeholder.find(elem => elem.id === id)
  }

  static addStakeholder (stakeholder) {
    if (stakeholder instanceof Stakeholder === false) {
      console.warn('Metadata.addStakeholder() - expected string')
      return false
    }

    let found = Metadata.stakeholder.find(elem => elem.id === stakeholder.id)
    if (typeof found !== 'undefined') {
      console.log('Metadata.addStakeholder() - id is already set')
      return false
    }

    Metadata.stakeholder.push(stakeholder)
    return true
  }

  static removeStakeholder (id) {
    if (typeof id !== 'string') {
      console.warn('Metadata.removeStakeholder() - expected string')
      return false
    }

    let index = Metadata.stakeholder.findIndex(elem => elem.id === id)

    if (index === -1) {
      console.warn('Metadata.removeStakeholder() - could not find stakeholder')
      return false
    }

    Metadata.stakeholder.splice(index, 1)
    return true
  }

  static getData () {
    return {
      locations: Metadata.locations,
      stakeholder: Metadata.stakeholder
    }
  }

  static clear () {
    Metadata.locations = []
    Metadata.stakeholder = []
  }

  static parse (serializedMetadata) {
    if (typeof serializedMetadata !== 'object' || !serializedMetadata) {
      console.warn('Location.props() - serializedMetadata expects and object')
      return
    }

    Metadata.clear()

    serializedMetadata.locations.forEach(serializedLocation => {
      let location = new Location()
      location.props = serializedLocation
      Metadata.addLocation(location)
    })

    serializedMetadata.stakeholder.forEach(serializedStakeholder => {
      let stakeholder = new Stakeholder()
      stakeholder.props = serializedStakeholder
      Metadata.addStakeholder(stakeholder)
    })

    return Metadata.getData()
  }
}

// init
Metadata.locations = []
Metadata.stakeholder = []
