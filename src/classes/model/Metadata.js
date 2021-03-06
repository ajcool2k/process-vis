import { Stakeholder } from '@/classes/model/Stakeholder'
import { Location } from '@/classes/model/Location'
import { Process } from '@/classes/model/Process'

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

  static getStakeholder () {
    return Metadata.stakeholder.sort((a, b) => { return (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0) })
  }

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
      console.warn('Metadata.addStakeholder() - expected Stakeholder')
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

  static getDependencies () { return Metadata.dependencies }
  static setDependencies (dependencies) {
    if (dependencies instanceof Array !== true) {
      console.warn('Metadata.setDependencies() - expects an Array')
      return
    }

    Metadata.dependencies = []
    dependencies.forEach(elem => { Metadata.addDependency(elem) })
  }

  static findDependency (id) {
    if (typeof id !== 'string') {
      console.warn('Metadata.findDependency() - expected a string')
      return
    }

    return Metadata.dependencies.find(elem => elem.id === id)
  }

  static addDependency (dependency) {
    if (dependency instanceof Process === false) {
      console.warn('Metadata.addDependency() - expected a Process')
      return
    }

    let found = Metadata.dependencies.find(elem => elem.id === dependency.id)
    if (typeof found !== 'undefined') {
      console.log('Metadata.addDependency() - id is already set')
      return
    }

    Metadata.dependencies.push(dependency)
  }

  static removeDependency (id) {
    if (typeof id !== 'string') {
      console.warn('Metadata.removeDependency() - expected string')
      return
    }

    let index = Metadata.dependencies.findIndex(elem => elem.id === id)

    if (index === -1) {
      console.warn('Metadata.removeDependency() - could not find dependency')
      return
    }

    Metadata.dependencies.splice(index, 1)
  }

  static parse (serializedMetadata) {
    if (typeof serializedMetadata !== 'object' || !serializedMetadata) {
      console.warn('Metadata.parse() - serializedMetadata expects an object')
      return
    }

    Metadata.clear()

    if (serializedMetadata.hasOwnProperty('locations')) {
      serializedMetadata.locations.forEach(loc => {
        let location = new Location()
        location.props = loc
        Metadata.addLocation(location)
      })
    }

    if (serializedMetadata.hasOwnProperty('stakeholder')) {
      serializedMetadata.stakeholder.forEach(st => {
        let stakeholder = new Stakeholder()
        stakeholder.props = st
        Metadata.addStakeholder(stakeholder)
      })
    }

    if (serializedMetadata.hasOwnProperty('dependencies')) {
      serializedMetadata.dependencies.forEach(dep => {
        let dependency = new Process()
        dependency.props = dep
        Metadata.addDependency(dependency)
      })
    }

    return Metadata.getData()
  }

  static getData () {
    return {
      dependencies: Metadata.dependencies,
      locations: Metadata.locations,
      stakeholder: Metadata.stakeholder
    }
  }

  static clear () {
    Metadata.dependencies = []
    Metadata.locations = []
    Metadata.stakeholder = []
  }
}

// init
Metadata.locations = []
Metadata.stakeholder = []
Metadata.dependencies = []
