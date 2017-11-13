import { Validator } from '@/classes/utils/Validator'

require('es6-shim') // for non supported browsers like phantom.js

describe('Validator.js (isValid)', () => {
  it('should be valid', () => {
    let obj = { id: '', model: '', metadata: '' }
    expect(Validator.isValid(obj)).to.equal(true)
  })

  it('should not validate wrong param type', () => {
    // params
    expect(Validator.isValid(null)).to.equal(false) // null
    expect(Validator.isValid(undefined)).to.equal(false) // undefined
    expect(Validator.isValid('')).to.equal(false) // string
    expect(Validator.isValid([])).to.equal(false) // array
    expect(Validator.isValid(true)).to.equal(false) // array
  })

  it('should not validate missing data', () => {
    // params
    expect(Validator.isValid(null)).to.equal(false) // null
    expect(Validator.isValid(undefined)).to.equal(false) // undefined
    expect(Validator.isValid('')).to.equal(false) // string
    expect(Validator.isValid([])).to.equal(false) // array
    expect(Validator.isValid(true)).to.equal(false) // array

    // missing data
    expect(Validator.isValid({})).to.equal(false)
    expect(Validator.isValid({ id: '' })).to.equal(false)
    expect(Validator.isValid({ id: '', model: '' })).to.equal(false)
  })
})
