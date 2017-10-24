export class Validator {
  static isValid (obj) {
    // check type
    if (typeof obj !== 'object') {
      Validator.lastError = 'Validator - Object expected'
      return false
    }

    // check properties
    if (!obj.hasOwnProperty('id') || !obj.hasOwnProperty('model') || !obj.hasOwnProperty('metadata')) {
      Validator.lastError = 'Validator - Properties missing'
      return false
    }

    // valid
    return true
  }
}

Validator.lastError = ''
