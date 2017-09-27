
export class Transformation {
  constructor (type, info, decision) {
    this.type = typeof type === 'string' ? type : '='
    this.info = typeof info === 'string' ? info : ''
    this.decision = 'false'
    // this.mDecision = decision
  }

  get mType () { return this.type }
  set mType (type) {
    if (typeof type !== 'string') {
      console.warn('Transformation.mType expects a string')
      return false
    }

    let whitelist = ['<', '>', '=']

    if (whitelist.indexOf(type) === -1) {
      console.warn('Transformation.mType is not a valid value')
      return false
    }

    this.type = type

    return true
  }

  get mInfo () { return this.info }
  set mInfo (info) {
    if (typeof info !== 'string') {
      console.warn('Transformation.mInfo expects a string')
      return false
    }

    this.info = info

    return true
  }

  get mDecision () { return this.decision === 'true' }
  set mDecision (decision) {
    if (typeof decision !== 'boolean' && typeof decision !== 'string') {
      console.warn('Transformation.mDecision expects a string or boolean')
      return false
    }

    if (typeof decision === 'string' && decision !== 'true' && decision !== 'false') {
      console.warn('Transformation.mDecision string expects value true or false')
      return false
    }

    if (typeof decision === 'boolean') {
      decision = decision === true ? 'true' : 'false'
    }

    this.decision = decision

    return true
  }

  get props () { return this }
  set props (serializedTransformation) {
    if (!serializedTransformation || typeof serializedTransformation === 'undefined') {
      console.warn('Transformation.props() - serializedTransformation is undefined')
      return
    }
    this.type = serializedTransformation.type
    this.info = serializedTransformation.info
    this.decision = serializedTransformation.decision
  }
}