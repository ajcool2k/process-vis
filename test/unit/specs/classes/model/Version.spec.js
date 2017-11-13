import { Version } from '@/classes/model/Version'

require('es6-shim') // for non supported browsers like phantom.js

describe('Version.js (isSupported)', () => {
  it('should not validate wrong param', () => {
    expect(Version.isSupported()).to.equal(false)
    expect(Version.isSupported(null)).to.equal(false)
    expect(Version.isSupported('')).to.equal(false)
    expect(Version.isSupported({})).to.equal(false)
    expect(Version.isSupported([])).to.equal(false)
  })

  it('should validate supported version', () => {
    expect(Version.isSupported(Version.minSupported)).to.equal(true)
    expect(Version.isSupported(Version.actualVersion)).to.equal(true)
    Version.supportedVersions.forEach(v => {
      expect(Version.isSupported(v)).to.equal(true)
    })
  })

  it('should not validate wrong version', () => {
    expect(Version.isSupported('1')).to.equal(false)
  })
})
