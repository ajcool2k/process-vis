
export class File {
  constructor (name) {
    const uniqid = require('uniqid')
    this.id = uniqid()
    this.name = typeof name === 'string' ? name : ''
    this.mimeType = 'application/octet-stream'
    this.size = 0
  }

  get mName () { return this.name }
  set mName (name) {
    if (typeof name !== 'string') {
      console.warn('File.mName expects a string')
      return
    }
    this.name = name
  }

  get mMimeType () { return this.mimeType }
  set mMimeType (mimeType) {
    if (typeof mimeType !== 'string') {
      console.warn('File.mMimeType expects a string')
      return
    }
    this.mimeType = mimeType
  }

  get mSize () { return this.size }
  set mSize (size) {
    if (typeof size !== 'number') {
      console.warn('File.mSize expects a number')
      return
    }
    this.size = size
  }

  get props () { return this }
  set props (serializedFile) {
    if (typeof serializedFile !== 'object' || !serializedFile) {
      console.warn('File.props() - serializedFile is undefined')
      return
    }

    this.id = serializedFile.id
    this.name = serializedFile.name
    this.mimeType = serializedFile.mimeType
    this.size = serializedFile.size
  }
}
