import { Process } from '@/classes/model/Process'
import { Result } from '@/classes/model/Result'
import { File } from '@/classes/model/File'

import { Metadata } from '@/classes/model/Metadata'
import { Location } from '@/classes/model/Location'
import { Stakeholder } from '@/classes/model/Stakeholder'
import { Exchange } from '@/classes/utils/Exchange'

require('es6-shim') // for non supported browsers like phantom.js

const _ = require('lodash')

describe('Process.js', () => {
  it('should create Process-Object with Parameters', () => {
    let process = new Process('testProcess', 'stakeholderId', new Date(2017, 0, 1), new Date(2017, 0, 2))
    expect(process instanceof Process).to.equal(true)
    expect(process.id).to.be.a('string')
    expect(process.name).to.equal('testProcess')
    expect(process.initiator).to.equal('stakeholderId')
    expect(process.start.valueOf()).to.equal(new Date(2017, 0, 1).valueOf())
    expect(process.end.valueOf()).to.equal(new Date(2017, 0, 2).valueOf())
  })

  it('should create Process-Object without Parameters', () => {
    let process = new Process()
    expect(process instanceof Process).to.equal(true)
    expect(process.id).to.be.a('string')
    expect(process.name).to.equal('')
    expect(process.initiator).to.equal('')
    expect(process.start).to.be.a('null')
    expect(process.end).to.be.a('null')
  })

  it('should create Process-Object with empty default attributes', () => {
    let process = new Process()

    // Default Values
    expect(process.connection).to.be.a('object')
    expect(process.transformation).to.be.a('object')

    expect(process.results).to.be.an('array')
    expect(process.childs).to.be.an('array')
    expect(process.stakeholder).to.be.an('array')
    expect(process.location).to.be.an('array')
    expect(process.participants).to.be.an('array')

    expect(process.description).to.equal('')
    expect(process.reference).to.equal('')
    expect(process.participation).to.equal('closed')
    expect(process.parent).to.equal('')
    expect(process.created).to.be.a('date')
    expect(process.modified).to.be.a('date')
  })

  it('should create Process-Object with unique ID', () => {
    const processes = []

    processes.push(new Process())
    processes.push(new Process())
    processes.push(new Process('testProcess', 'stakeholderId', new Date(2017, 0, 1), new Date(2017, 0, 2)))
    processes.push(new Process('testProcess', 'stakeholderId', new Date(2017, 0, 1), new Date(2017, 0, 2)))
    processes.push(new Process('testProcess', 'stakeholderId', new Date(2017, 0, 1), new Date(2017, 0, 2)))

    let processIds = processes.map(elem => elem.id)
    let uniqueIds = _.uniq(processIds)

    expect(uniqueIds.length).to.equal(processIds.length)
  })

  it('should import contents on an Process-Object', () => {
    // prepare object to export
    let processBefore = new Process()

    let stakeholder1 = new Stakeholder()
    let stakeholder2 = new Stakeholder()
    let stakeholder3 = new Stakeholder()

    let child1 = new Process('child 1', stakeholder1.id)
    let child2 = new Process('child 2', stakeholder2.id)
    let child3 = new Process('child 3', stakeholder3.id)

    processBefore.setChilds([child1, child2, child3])

    child1.addConnectionTo(child2)
    child2.addConnectionTo(child3)

    // add some sub types to child1
    let result = new Result()

    let file = new File()
    file.mSize = 1024 * 1024
    result.addFile(file)

    child1.addResult(result)

    let location = new Location('Friedrich-List-Platz 1', '01069', 'Dresden', 'A117', { lat: '51.035467', lng: '13.736129' })
    child1.addLocation(location)

    // add a participant
    let stakeholder = new Stakeholder('Moon Inc.')
    processBefore.addStakeholder(stakeholder)
    child1.addParticipant(stakeholder.id)

    // add a delegate
    let delegate = new Stakeholder('Sun Inc.')
    processBefore.addStakeholder(delegate)
    processBefore.addDelegate(delegate.id)

    // export and import back
    let metadataBefore = Metadata.getData()
    let processBeforeWrapper = Exchange.wrapProcess(processBefore, metadataBefore)
    Exchange.storeProcess(processBeforeWrapper)

    let processAfterWrapper = Exchange.openProcess(processBefore.id)
    let processAfter = new Process()
    processAfter.props = processAfterWrapper.model
    let metadataAfter = Metadata.parse(processAfterWrapper.metadata)

    processBefore.clean() // remove tmp vars

    // console.log('processBefore', JSON.stringify(processBefore))
    // console.log('processAfter', JSON.stringify(processAfter))

    // check for deep equal state
    expect(_.isEqual(processAfter, processBefore)).to.equal(true)
    expect(_.isEqual(metadataAfter, metadataBefore)).to.equal(true)

    // clear Storage
    Exchange.removeProcess(processBefore.id)
  })
})
