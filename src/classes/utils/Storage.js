import dateFormat from 'dateformat'

export class Storage {
  static save (process) {
    console.log('Storage.save()')
    let store = global.localStorage

    let indexName = 'process_' + process.id
    let index = Storage.getIndex()

    store.setItem(indexName, JSON.stringify(process)) // save json
    var _ = require('lodash')

    index = _.remove(index, (elem) => elem.id !== indexName)
    index.push({ id: indexName, updated: new Date() }) // add to index

    index.sort((a, b) => { return new Date(b.updated) - new Date(a.updated) }) // sort index

    Storage.setIndex(index) // save index
  }

  static getIndex () {
    let store = global.localStorage
    let index = store.getItem('index')
    return index === null ? [] : JSON.parse(index)
  }

  static setIndex (index) {
    if (index === null || typeof index === 'undefined') {
      console.warn('Storafe.setIndex() should not be empty')
      return
    }

    let store = global.localStorage
    store.setItem('index', JSON.stringify(index))
  }

  static clear () {
    console.log('Storage.clear()')
    global.localStorage.clear()
  }

  static open (id) {
    console.log('Storage.open()')
    let store = global.localStorage
    let str = store.getItem('process_' + id)
    return JSON.parse(str)
  }

  static remove (id) {
    console.log('Storage.remove()')
  }

  static exists (id) {
    console.log('Storage.exists()')
  }

  static list (limit) {
    console.log('Storage.list()')
    let index = Storage.getIndex()
    let idList = index.map(elem => { return { id: elem.id.replace('process_', ''), updated: dateFormat(elem.updated, 'yyyy-mm-dd - HH:MM:ss') } })
    return idList
  }
}
