import dateFormat from 'dateformat'

export class Storage {
  static save (process) {
    console.log('Storage.save()')
    let store = global.localStorage

    let indexName = Storage.prefix + process.id
    let index = Storage.getIndex()

    store.setItem(indexName, JSON.stringify(process)) // save json
    index = index.filter(elem => elem.id !== indexName)
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
    let indexName = Storage.prefix + id

    if (Storage.exists(indexName) === false) {
      console.warn('Storage.open() - Element does not exist in Index')
      return
    }

    return JSON.parse(store.getItem(indexName))
  }

  static remove (id) {
    console.log('Storage.remove()')
    let store = global.localStorage
    let indexName = Storage.prefix + id

    if (Storage.exists(indexName) === false) {
      console.warn('Storage.remove() - Element does not exist in Index')
      return false
    }

    // remove from index
    let index = Storage.getIndex()
    index = index.filter(elem => elem.id !== indexName)
    Storage.setIndex(index)

    store.removeItem(Storage.prefix + id)

    return true
  }

  static exists (indexName) {
    console.log('Storage.exists()')

    if (typeof indexName !== 'string') {
      console.warn('Storage.exists() - expected indexName as string')
      return false
    }

    let index = Storage.getIndex()
    let found = index.find(elem => elem.id === indexName)
    return typeof found !== 'undefined'
  }

  static list (limit) {
    console.log('Storage.list()')
    let index = Storage.getIndex()
    let idList = index.map(elem => { return { id: elem.id.replace(Storage.prefix, ''), updated: dateFormat(elem.updated, 'yyyy-mm-dd - HH:MM:ss') } })
    return idList
  }
}

Storage.prefix = 'process_'
