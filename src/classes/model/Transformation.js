
export class Transformation {
  constructor (type, info, decision) {
    this.type = typeof type === 'string' ? type : '='
    this.info = typeof info === 'string' ? info : ''

    this.decision = decision === true
  }

  get mType () { return this.type }
  set mType (type) {
    if (typeof type !== 'string') {
      console.warn('Transformation.mType expects a string')
      return
    }

    let whitelist = ['<', '>', '=']

    if (whitelist.indexOf(type) === -1) {
      console.warn('Transformation.mType is not a valid value')
      return
    }

    this.type = type
  }

  get mInfo () { return this.info }
  set mInfo (info) {
    if (typeof info !== 'string') {
      console.warn('Transformation.mInfo expects a string')
      return
    }

    this.info = info
  }

  get mDecision () { return this.decision }
  set mDecision (decision) {
    if (typeof decision !== 'boolean' && typeof decision !== 'string') {
      console.warn('Transformation.mDecision expects a string or boolean')
      return
    }

    if (typeof decision === 'string' && decision !== 'true' && decision !== 'false') {
      console.warn('Transformation.mDecision string expects value true or false')
      return
    }

    if (typeof decision === 'string') {
      decision = decision === 'true'
    }

    this.decision = decision
  }

  get props () { return this }
  set props (serializedTransformation) {
    if (typeof serializedTransformation !== 'object' || !serializedTransformation) {
      console.warn('Transformation.props() - serializedTransformation expects an object')
      return
    }
    this.type = serializedTransformation.type
    this.info = serializedTransformation.info
    this.decision = serializedTransformation.decision
  }
}
