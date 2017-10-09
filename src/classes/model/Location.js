
export class Location {
  constructor (address, zip, city, room, geoCoords) {
    const uniqid = require('uniqid')
    this.id = uniqid()
    this.address = typeof address === 'string' ? address : ''
    this.zip = typeof zip === 'string' ? zip : ''
    this.city = typeof city === 'string' ? city : ''
    this.room = typeof room === 'string' ? room : ''

    this.geoCoords = { lat: null, lng: null }
    this.mGeoCoords = geoCoords
  }

  get mAddress () { return this.address }
  set mAddress (address) {
    if (typeof address !== 'string') {
      console.warn('Location.mAddress expects a string')
      return
    }
    this.address = address
  }

  get mZip () { return this.zip }
  set mZip (zip) {
    if (typeof zip !== 'string') {
      console.warn('Location.mZip expects a string')
      return
    }
    this.zip = zip
  }

  get mCity () { return this.city }
  set mCity (city) {
    if (typeof city !== 'string') {
      console.warn('Location.mCity expects a string')
      return
    }
    this.city = city
  }

  get mCopyright () { return this.copyright }
  set mCopyright (copyright) {
    if (typeof copyright !== 'string') {
      console.warn('Location.mCopyright expects a string')
      return
    }
    this.copyright = copyright
  }

  get mRoom () { return this.room }
  set mRoom (room) {
    if (typeof room !== 'string') {
      console.warn('Location.mRoom expects a String')
      return
    }
    this.room = room
  }

  get mGeoCoords () { return this.geoCoords }
  set mGeoCoords (geoCoords) {
    if (typeof geoCoords !== 'object' || !geoCoords || !geoCoords.hasOwnProperty('lat') || !geoCoords.hasOwnProperty('lng')) {
      console.warn('Location.mGeoCoords expects an Object with lat and lng')
      return
    }

    this.geoCoords = { lat: geoCoords.lat, lng: geoCoords.lng }
  }

  get props () { return this }
  set props (serializedLocation) {
    if (typeof serializedLocation !== 'object' || !serializedLocation) {
      console.warn('Location.props() - serializedLocation expects and object')
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
