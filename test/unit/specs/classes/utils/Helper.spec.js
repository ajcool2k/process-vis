import { Helper } from '@/classes/utils/Helper'

require('es6-shim') // for non supported browsers like phantom.js

describe('Helper.js (rangeIntersection)', () => {
  it('should not detect intersection', () => {
    // range A: ------xxxxx--
    // range B: ---xxx-------
    let rangeA = { start: new Date(2017, 0, 6), end: new Date(2017, 0, 10) }
    let rangeB = { start: new Date(2017, 0, 3), end: new Date(2017, 0, 5) }
    expect(Helper.rangeIntersection(rangeA, rangeB)).to.equal(false)
    // inverse
    expect(Helper.rangeIntersection(rangeB, rangeA)).to.equal(false)
  })

  it('should detect intersection (inner range)', () => {
    // range A: --xxxxxxxxx--
    // range B: ---xxx-------
    let rangeA = { start: new Date(2017, 0, 2), end: new Date(2017, 0, 10) }
    let rangeB = { start: new Date(2017, 0, 3), end: new Date(2017, 0, 5) }
    expect(Helper.rangeIntersection(rangeA, rangeB)).to.equal(true)
    // inverse
    expect(Helper.rangeIntersection(rangeB, rangeA)).to.equal(true)
  })

  it('should detect intersection (cross range)', () => {
    // range A: --xxxxxxxxx--
    // range B: ---xxxxxxxxx-
    let rangeA = { start: new Date(2017, 0, 2), end: new Date(2017, 0, 10) }
    let rangeB = { start: new Date(2017, 0, 3), end: new Date(2017, 0, 11) }
    expect(Helper.rangeIntersection(rangeA, rangeB)).to.equal(true)
    // inverse
    expect(Helper.rangeIntersection(rangeB, rangeA)).to.equal(true)
  })
})

describe('Helper.js (shortName)', () => {
  it('should create initials', () => {
    let text = 'Eröffnung der Sitzung'

    let ret = Helper.shortName(text, false, 4)
    expect(ret.length).to.equal(4)
  })
})
