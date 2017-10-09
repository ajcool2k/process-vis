import { Stakeholder } from '@/classes/model/Stakeholder'
import { Location } from '@/classes/model/Location'

export class Metadata {
  static getLocations () { return Metadata.locations }
  static setLocations (locations) {
    if (locations instanceof Array !== true) {
      console.warn('Metadata setLocations expects an Array')
      return
    }

    Metadata.locations = []
    locations.forEach(elem => { Metadata.addLocation(elem) })
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
      return
    }

    let found = Metadata.locations.find(elem => elem === location.id)
    if (typeof found !== 'undefined') {
      console.log('Metadata.addLocation() - id is already set')
      return
    }

    Metadata.locations.push(location)
  }

  static removeLocation (id) {
    if (typeof id !== 'string') {
      console.warn('Process.removeLocation() - expected string')
      return
    }

    let index = Metadata.locations.findIndex(elem => elem.id === id)

    if (index === -1) {
      console.warn('Process.removeLocation() - could not find location')
      return
    }

    Metadata.locations.splice(index, 1)
  }

  static getStakeholder () { return Metadata.stakeholder }
  static setStakeholder (stakeholder) {
    if (stakeholder instanceof Array !== true) {
      console.warn('Metadata setStakeholder expects an Array')
      return
    }

    Metadata.stakeholder = []
    stakeholder.forEach(elem => { Metadata.addStakeholder(elem) })
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
      return
    }

    let found = Metadata.stakeholder.find(elem => elem.id === stakeholder.id)
    if (typeof found !== 'undefined') {
      console.log('Metadata.addStakeholder() - id is already set')
      return
    }

    Metadata.stakeholder.push(stakeholder)
  }

  static removeStakeholder (id) {
    if (typeof id !== 'string') {
      console.warn('Metadata.removeStakeholder() - expected string')
      return
    }

    let index = Metadata.stakeholder.findIndex(elem => elem.id === id)

    if (index === -1) {
      console.warn('Metadata.removeStakeholder() - could not find stakeholder')
      return
    }

    Metadata.stakeholder.splice(index, 1)
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
