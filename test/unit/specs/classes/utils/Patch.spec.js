import { Patch } from '@/classes/utils/Patch'
import { Version } from '@/classes/model/Version'

require('es6-shim') // for non supported browsers like phantom.js

describe('Patch.js (updateModel)', () => {
  const _ = require('lodash')
  const clone = require('clone')

  it('should not update wrong param', () => {
    Patch.updateModel(undefined)
    Patch.updateModel(null)
    Patch.updateModel('')
    Patch.updateModel([])
    Patch.updateModel(true)
    Patch.updateModel(false)
  })

  it('should not update model without data', () => {
    let model = {}
    const copy = clone(model)
    Patch.updateModel(model)
    let isEqual = _.isEqual(model, copy)
    expect(isEqual).to.equal(true)
  })

  it('should not update unsupported model', () => {
    let model = { dmv: 'unsupported' }
    const copy = clone(model)
    Patch.updateModel(model)
    let isEqual = _.isEqual(model, copy)
    expect(isEqual).to.equal(true)
  })

  it('should not update latest model', () => {
    let model = { dmv: Version.actualVersion }
    const copy = clone(model)
    Patch.updateModel(model)
    let isEqual = _.isEqual(model, copy)
    expect(isEqual).to.equal(true)
  })

  it('should update unknown model to latest version', () => {
    let model = { dmv: 'unknown' }
    const copy = clone(model)
    Patch.updateModel(model)
    let isEqual = _.isEqual(model, copy)
    expect(isEqual).to.equal(false)
    expect(model.dmv).to.equal(Version.actualVersion)
  })
})
