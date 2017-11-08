export class Version {
  static isSupported (version) {
    if (typeof version !== 'string') {
      console.warn('Version.isSupported() - expected string')
      return false
    }

    return Version.supportedVersions.indexOf(version) > -1
  }
}

/*
  Anpassung 1.0 zu 1.0.1
  childs zu children korrigiert
*/

Version.supportedVersions = ['unknown', '1.0', '1.0.1']
Version.minSupported = Version.supportedVersions[0]
Version.actualVersion = '1.0.1'
