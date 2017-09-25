
export class Location {
  constructor (address, zip, city, room, geoCoords) {
    const uniqid = require('uniqid')
    this.id = uniqid()
    this.address = typeof address === 'string' ? address : ''
    this.zip = typeof zip === 'string' ? zip : ''
    this.city = typeof city === 'string' ? city : ''
    this.room = typeof room === 'string' ? room : ''
    this.geoCoords = typeof geoCoords === 'object' ? geoCoords : {}
  }

  get mAddress () { return this.address }
  set mAddress (address) {
    if (typeof address !== 'string') {
      console.warn('Location.mAddress expects a string')
      return false
    }
    this.address = address

    return true
  }

  get mZip () { return this.zip }
  set mZip (zip) {
    if (typeof zip !== 'string') {
      console.warn('Location.mZip expects a string')
      return false
    }
    this.zip = zip

    return true
  }

  get mCity () { return this.city }
  set mCity (city) {
    if (typeof city !== 'string') {
      console.warn('Location.mCity expects a string')
      return false
    }
    this.city = city

    return true
  }

  get mCopyright () { return this.copyright }
  set mCopyright (copyright) {
    if (typeof copyright !== 'string') {
      console.warn('Location.mCopyright expects a string')
      return false
    }
    this.copyright = copyright

    return true
  }

  get mRoom () { return this.room }
  set mRoom (room) {
    if (typeof room !== 'string') {
      console.warn('Location.mRoom expects a String')
      return false
    }
    this.room = room

    return true
  }

  get mGeoCoords () { return this.geoCoords }
  set mGeoCoords (geoCoords) {
    if (typeof geoCoords !== 'object') {
      console.warn('Location.mGeoCoords expects an Object')
      return false
    }

    if (!geoCoords.hasOwnProperty('lat') || !geoCoords.hasOwnProperty('lat')) {
      console.warn('Location.mGeoCoords expects an Object')
      return false
    }

    this.geoCoords = geoCoords

    return true
  }

  get props () { return this }
  set props (serializedLocation) {
    if (!serializedLocation || typeof serializedLocation === 'undefined') {
      console.warn('Location.props() - serializedLocation is undefined')
      return
    }

    this.id = serializedLocation.id
    this.address = serializedLocation.address
    this.zip = serializedLocation.zip
    this.city = serializedLocation.city
    this.room = serializedLocation.room
    this.geoCoords = serializedLocation.geoCoords
  }
}
