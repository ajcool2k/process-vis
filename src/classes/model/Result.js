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
      return
    }
    this.name = name
  }

  get mDescription () { return this.description }
  set mDescription (description) {
    if (typeof description !== 'string') {
      console.warn('Result.mDescription expects a string')
      return
    }
    this.description = description
  }

  get mText () { return this.text }
  set mText (text) {
    if (typeof text !== 'string') {
      console.warn('Result.mText expects a string')
      return
    }
    this.text = text
  }

  get mCopyright () { return this.copyright }
  set mCopyright (copyright) {
    if (typeof copyright !== 'string') {
      console.warn('Result.mCopyright expects a string')
      return
    }
    this.copyright = copyright
  }

  get mFiles () { return this.files }
  set mFiles (files) {
    if (files instanceof Array !== false) {
      console.warn('Result.mFiles expects an Array')
      return
    }

    this.files = files
  }

  getFile (id) {
    if (typeof id !== 'string') {
      console.warn('Result.getFile() - expected string as an id')
      return
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
      return
    }

    this.files.push(file)
  }

  removeFile (id) {
    if (typeof id !== 'string') {
      console.warn('Result.removeFile() - expected string as an id')
      return
    }

    let index = this.files.findIndex(elem => elem.id === id)

    if (index === -1) {
      console.warn('Result.removeFile() - could not find file')
      return
    }
    this.files.splice(index, 1)
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
