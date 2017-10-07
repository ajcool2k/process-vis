import { File } from '@/classes/model/File'

export class Result {
  constructor (name, description, text, copyright) {
    const uniqid = require('uniqid')
    this.id = uniqid()
    this.name = typeof name === 'string' ? name : ''
    this.description = typeof description === 'string' ? description : ''
    this.text = typeof text === 'string' ? text : ''
    this.copyright = typeof copyright === 'string' ? copyright : ''

    this.files = []

    this.created = new Date()
    this.modified = new Date()
  }

  get mName () { return this.name }
  set mName (name) {
    if (typeof name !== 'string') {
      console.warn('Result.mName expects a string')
      return false
    }
    this.name = name

    return true
  }

  get mDescription () { return this.description }
  set mDescription (description) {
    if (typeof description !== 'string') {
      console.warn('Result.mDescription expects a string')
      return false
    }
    this.description = description

    return true
  }

  get mText () { return this.text }
  set mText (text) {
    if (typeof text !== 'string') {
      console.warn('Result.mText expects a string')
      return false
    }
    this.text = text

    return true
  }

  get mCopyright () { return this.copyright }
  set mCopyright (copyright) {
    if (typeof copyright !== 'string') {
      console.warn('Result.mCopyright expects a string')
      return false
    }
    this.copyright = copyright

    return true
  }

  get mFiles () { return this.files }
  set mFiles (files) {
    if (files instanceof Array !== false) {
      console.warn('Result.mFiles expects an Array')
      return false
    }

    this.files = files

    return true
  }

  getFile (id) {
    if (typeof id !== 'string') {
      console.warn('Result.getFile() - expected string as an id')
      return false
    }

    let file = this.files.find(elem => elem.id === id)
    if (file === false) {
      console.warn('Result.getFile() - could not find file')
      return
    }
    return file
  }

  addFile (file) {
    if (file instanceof File !== false) {
      console.warn('Result.addFile() - expected instanceof File')
      return false
    }

    this.files.push(file)
    return true
  }

  removeFile (id) {
    if (typeof id !== 'string') {
      console.warn('Result.removeFile() - expected string as an id')
      return false
    }

    let index = this.files.findIndex(elem => elem.id === id)

    if (index === -1) {
      console.warn('Result.removeFile() - could not find file')
      return false
    }
    this.files.splice(index, 1)
    return true
  }

  get props () { return this }
  set props (serializedResult) {
    if (typeof serializedResult !== 'object' || !serializedResult) {
      console.warn('Result.props() - serializedResult is undefined')
      return
    }

    this.id = serializedResult.id
    this.name = serializedResult.name
    this.description = serializedResult.description
    this.text = serializedResult.text
    this.copyright = serializedResult.copyright
    this.files = serializedResult.files

    serializedResult.files.forEach(serializedFile => {
      let file = new File()
      file.props = serializedFile
      this.files.addFile(file)
    })

    this.created = serializedResult.created ? new Date(serializedResult.created) : null
    this.modified = serializedResult.modified ? new Date(serializedResult.modified) : null
  }
}
