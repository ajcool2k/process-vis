import { Metadata } from '@/classes/model/Metadata'
import { Location } from '@/classes/model/Location'
import { Stakeholder } from '@/classes/model/Stakeholder'

const _ = require('lodash')

describe('Metadata.js', () => {
  it('should be empty on init', () => {
    let metadata = Metadata.getData()
    expect(metadata).to.be.an('object')
    expect(metadata.locations).to.be.an('Array')
    expect(metadata.locations.length).to.equal(0)
    expect(metadata.stakeholder).to.be.an('Array')
    expect(metadata.stakeholder.length).to.equal(0)
  })

  it('should clear', () => {
    Metadata.locations = [ new Location() ]
    Metadata.stakeholder = [ new Stakeholder() ]

    Metadata.clear()

    let metadata = Metadata.getData()
    expect(metadata.locations.length).to.equal(0)
    expect(metadata.stakeholder.length).to.equal(0)
  })

  it('should add a location', () => {
    Metadata.clear()

    let location = new Location()
    Metadata.addLocation(location)

    let metadata = Metadata.getData()
    expect(metadata).to.be.an('object')
    expect(metadata.locations).to.be.an('Array')
    expect(metadata.locations.length).to.equal(1)
    expect(metadata.locations[0].id).to.equal(location.id)
  })

  it('should get a locationList', () => {
    Metadata.clear()

    let location = new Location()
    Metadata.addLocation(location)

    let locationList = Metadata.getLocations()
    expect(locationList).to.be.an('Array')
    expect(locationList.length).to.equal(1)
    expect(locationList[0].id).to.equal(location.id)
  })

  it('should set a locationList', () => {
    Metadata.clear()

    let location1 = new Location()
    let location2 = new Location()
    let location3 = new Location()

    let locationList = [ location1, location2, location3 ]
    Metadata.setLocations(locationList)

    let responseList = Metadata.getLocations()

    expect(_.isEqual(responseList, locationList)).to.equal(true)
  })

  it('should not set a locationList', () => {
    Metadata.clear()

    let location1 = new Location()
    let location2 = new Location()
    let location3 = new Location()

    let locationList = [ location1, location2, location3 ]
    Metadata.locations = locationList

    let ret = null
    ret = Metadata.setLocations()
    expect(ret).to.equal(false)

    ret = Metadata.setLocations(null)
    expect(ret).to.equal(false)

    ret = Metadata.setLocations(location1)
    expect(ret).to.equal(false)

    ret = Metadata.setLocations({})
    expect(ret).to.equal(false)

    expect(Metadata.getLocations()).to.equal(locationList)
  })

  it('should find a location', () => {
    let location = new Location()
    let location2 = new Location()

    Metadata.addLocation(location)
    Metadata.addLocation(location2)

    let elem = null

    elem = Metadata.findLocation(location.id)
    expect(elem instanceof Location).to.equal(true)
    expect(elem.id).to.equal(location.id)

    elem = Metadata.findLocation(location2.id)
    expect(elem instanceof Location).to.equal(true)
    expect(elem.id).to.equal(location2.id)
  })

  it('should not find a location', () => {
    let location = new Location()

    Metadata.addLocation(location)

    let elem = null

    elem = Metadata.findLocation(location.id + '#007')
    expect(typeof elem === 'undefined').to.equal(true)

    elem = Metadata.findLocation()
    expect(typeof elem === 'undefined').to.equal(true)

    elem = Metadata.findLocation(null)
    expect(typeof elem === 'undefined').to.equal(true)
  })

  it('should remove a location', () => {
    Metadata.clear()

    let location1 = new Location()
    let location2 = new Location()
    let location3 = new Location()

    Metadata.locations = [ location1, location2, location3 ]

    let ret = Metadata.removeLocation(location2.id)
    expect(ret).to.equal(true)

    let metadata = Metadata.getData()

    expect(metadata).to.be.an('object')
    expect(metadata.locations).to.be.an('Array')
    expect(metadata.locations.length).to.equal(2)

    expect(metadata.locations[0].id).to.equal(location1.id)
    expect(metadata.locations[1].id).to.equal(location3.id)
  })

  it('should not remove a location', () => {
    Metadata.clear()

    let location = new Location()

    Metadata.addLocation(location)

    let ret = null

    ret = Metadata.removeLocation(location.id + '#007')
    expect(ret).to.equal(false)

    ret = Metadata.removeLocation()
    expect(ret).to.equal(false)

    ret = Metadata.removeLocation(null)
    expect(ret).to.equal(false)

    let metadata = Metadata.getData()
    expect(metadata).to.be.an('object')
    expect(metadata.locations).to.be.an('Array')
    expect(metadata.locations.length).to.equal(1)
  })

  it('should add a stakeholder', () => {
    Metadata.clear()

    let stakeholder = new Stakeholder()
    Metadata.addStakeholder(stakeholder)

    let metadata = Metadata.getData()
    expect(metadata).to.be.an('object')
    expect(metadata.stakeholder).to.be.an('Array')
    expect(metadata.stakeholder.length).to.equal(1)
    expect(metadata.stakeholder[0].id).to.equal(stakeholder.id)
  })

  it('should get a stakeholderList', () => {
    Metadata.clear()

    let stakeholder = new Stakeholder()
    Metadata.addStakeholder(stakeholder)

    let stakeholderList = Metadata.getStakeholder()
    expect(stakeholderList).to.be.an('Array')
    expect(stakeholderList.length).to.equal(1)
    expect(stakeholderList[0].id).to.equal(stakeholder.id)
  })

  it('should set a stakeholderList', () => {
    Metadata.clear()

    let stakeholder1 = new Stakeholder()
    let stakeholder2 = new Stakeholder()
    let stakeholder3 = new Stakeholder()

    let stakeholderList = [ stakeholder1, stakeholder2, stakeholder3 ]
    Metadata.setStakeholder(stakeholderList)

    let responseList = Metadata.getStakeholder()

    expect(_.isEqual(responseList, stakeholderList)).to.equal(true)
  })

  it('should not set a stakeholderList', () => {
    Metadata.clear()

    let stakeholder1 = new Stakeholder()
    let stakeholder2 = new Stakeholder()
    let stakeholder3 = new Stakeholder()

    let stakeholderList = [ stakeholder1, stakeholder2, stakeholder3 ]
    Metadata.stakeholder = stakeholderList

    let ret = null
    ret = Metadata.setStakeholder()
    expect(ret).to.equal(false)

    ret = Metadata.setStakeholder(null)
    expect(ret).to.equal(false)

    ret = Metadata.setStakeholder(stakeholder1)
    expect(ret).to.equal(false)

    ret = Metadata.setStakeholder({})
    expect(ret).to.equal(false)

    expect(Metadata.getStakeholder()).to.equal(stakeholderList)
  })

  it('should find a stakeholder', () => {
    let stakeholder = new Stakeholder()
    let stakeholder2 = new Stakeholder()

    Metadata.addStakeholder(stakeholder)
    Metadata.addStakeholder(stakeholder2)

    let elem = null

    elem = Metadata.findStakeholder(stakeholder.id)
    expect(elem instanceof Stakeholder).to.equal(true)
    expect(elem.id).to.equal(stakeholder.id)

    elem = Metadata.findStakeholder(stakeholder2.id)
    expect(elem instanceof Stakeholder).to.equal(true)
    expect(elem.id).to.equal(stakeholder2.id)
  })

  it('should not find a stakeholder', () => {
    let stakeholder = new Stakeholder()

    Metadata.addStakeholder(stakeholder)

    let elem = null

    elem = Metadata.findStakeholder(stakeholder.id + '#007')
    expect(typeof elem === 'undefined').to.equal(true)

    elem = Metadata.findStakeholder()
    expect(typeof elem === 'undefined').to.equal(true)

    elem = Metadata.findStakeholder(null)
    expect(typeof elem === 'undefined').to.equal(true)
  })

  it('should remove a stakeholder', () => {
    Metadata.clear()

    let stakeholder1 = new Stakeholder()
    let stakeholder2 = new Stakeholder()
    let stakeholder3 = new Stakeholder()

    Metadata.stakeholder = [ stakeholder1, stakeholder2, stakeholder3 ]

    let ret = Metadata.removeStakeholder(stakeholder2.id)
    expect(ret).to.equal(true)

    let metadata = Metadata.getData()

    expect(metadata).to.be.an('object')
    expect(metadata.stakeholder).to.be.an('Array')
    expect(metadata.stakeholder.length).to.equal(2)

    expect(metadata.stakeholder[0].id).to.equal(stakeholder1.id)
    expect(metadata.stakeholder[1].id).to.equal(stakeholder3.id)
  })

  it('should not remove a stakeholder', () => {
    Metadata.clear()

    let stakeholder = new Stakeholder()

    Metadata.addStakeholder(stakeholder)

    let ret = null

    ret = Metadata.removeStakeholder(stakeholder.id + '#007')
    expect(ret).to.equal(false)

    ret = Metadata.removeStakeholder()
    expect(ret).to.equal(false)

    ret = Metadata.removeStakeholder(null)
    expect(ret).to.equal(false)

    let metadata = Metadata.getData()
    expect(metadata).to.be.an('object')
    expect(metadata.stakeholder).to.be.an('Array')
    expect(metadata.stakeholder.length).to.equal(1)
  })

  it('should be singleton', () => {
    let metadata = Metadata.getData()
    expect(metadata.stakeholder.length).to.be.above(0)
  })

  it('should parse', () => {
    Metadata.clear()

    let stakeholder = new Stakeholder()
    Metadata.addStakeholder(stakeholder)

    let location = new Location()
    Metadata.addLocation(location)

    let metadata = Metadata.getData()

    expect(metadata.locations.length).to.equal(1)
    expect(metadata.stakeholder.length).to.equal(1)

    let serializedMetadata = JSON.stringify(Metadata.getData())
    expect(serializedMetadata).to.be.an('string')

    Metadata.clear()

    let parsedMetadata = Metadata.parse(JSON.parse(serializedMetadata))

    expect(parsedMetadata).to.be.an('object')
    expect(parsedMetadata.locations.length).to.equal(1)
    expect(parsedMetadata.locations[0] instanceof Location).to.equal(true)

    expect(parsedMetadata.stakeholder.length).to.equal(1)
    expect(parsedMetadata.stakeholder[0] instanceof Stakeholder).to.equal(true)

    expect(_.isEqual(metadata, parsedMetadata)).to.equal(true)
  })
})
