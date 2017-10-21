import { Storage } from '@/classes/utils/Storage'
import { Process } from '@/classes/model/Process'

Storage.prefix = 'proces-test_'

require('es6-shim') // for non supported browsers like phantom.js

describe('Storage.js ()', () => {
  const store = global.localStorage
  let process = new Process()

  it('should save an object', () => {
    store.clear()
    Storage.save(process)

    expect(store.hasOwnProperty(Storage.prefix + process.id)).to.equal(true)
    let json = store.getItem([Storage.prefix + process.id])

    let obj = JSON.parse(json)
    expect(obj).to.be.an('object')
    expect(obj.hasOwnProperty('id')).to.equal(true)
    expect(obj.id).to.equal(process.id)
  })

  it('should have id in index', () => {
    expect(store.hasOwnProperty('index')).to.equal(true)
    let json = store.getItem('index')
    let index = JSON.parse(json)
    let found = index.filter(elem => elem.id === Storage.prefix + process.id)
    expect(found).to.be.an('Array')
    expect(found.length).to.equal(1)
    expect(Storage.exists(Storage.prefix + process.id)).to.equal(true)
  })

  it('should return id by getIndex()', () => {
    let index = Storage.getIndex()
    let found = index.filter(elem => elem.id === Storage.prefix + process.id)
    expect(found).to.be.an('Array')
    expect(found.length).to.equal(1)
  })

  it('should update Index by setIndex()', () => {
    // before
    let index = Storage.getIndex()
    let result = index.filter(elem => elem.id.startsWith(Storage.prefix) === true)
    expect(result).to.be.an('Array')
    expect(result.length).to.equal(1)

    // update
    index.push({ id: Storage.prefix + 'abc', updated: new Date() })
    Storage.setIndex(index)

    // after
    index = Storage.getIndex()
    result = index.filter(elem => elem.id.startsWith(Storage.prefix) === true)
    expect(result).to.be.an('Array')
    expect(result.length).to.equal(2)

    // reset - remove test field
    index.splice(index.length - 1, 1)
    Storage.setIndex(index)
  })

  it('should open object from Storage', () => {
    let obj = Storage.open(process.id)
    expect(obj).to.be.an('object')
    expect(obj.hasOwnProperty('id')).to.equal(true)
    expect(obj.id).to.equal(process.id)
  })

  it('should return list from Storage', () => {
    let map = Storage.list()
    expect(map).to.be.an('Array')
    expect(map.length).to.equal(1)

    map.forEach(elem => {
      expect(elem.id).to.equal(process.id)
      expect(elem.updated).to.be.a('string')
    })
  })

  it('should remove object from Storage', () => {
    let ret = Storage.remove(process.id)
    expect(ret).to.equal(true)
    expect(store.hasOwnProperty(Storage.prefix + process.id)).to.equal(false)
  })

  it('should not be included in index anymore', () => {
    expect(store.hasOwnProperty('index')).to.equal(true)
    let json = store.getItem('index')
    let index = JSON.parse(json)
    let found = index.filter(elem => elem.id === Storage.prefix + process.id)
    expect(found).to.be.an('Array')
    expect(found.length).to.equal(0)
  })

  it('should clear Storage', () => {
    Storage.clear()
    let keys = Object.keys(store)
    expect(keys.length).to.equal(0)
  })
})
