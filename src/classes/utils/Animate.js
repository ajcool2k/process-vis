export class Animate {
  static run (node, nodeId, triggerProp, style, time) {
    // console.warn('Animate: ' + nodeId + '-' + triggerProp)
    node.style.transitionProperty = triggerProp
    node.style.transitionDuration = time + 's'
    node.style.transitionStyle = style
  }

  static afterTransition (node, handlerId, callback) {
    // console.log('Animate: ' + handlerId + ' prepare')
    let fn = () => {
      // console.log('Animate: ' + handlerId + ' afterTransition start')
      callback()
      // console.log('Animate: ' + handlerId + ' afterTransition done')
      Animate.removeCallbackListener(handlerId)
      Animate.clearAnimation(node, handlerId)
      // console.log('-------------------')
    }

    node.removeEventListener('transitionend', fn, false)    // remove old first
    node.addEventListener('transitionend', fn, false)       // add new listener
    Animate.handler[handlerId] = { node: node, fn: fn }
    // console.log('Animate: collection handler: ' + Object.keys(Animate.handler).length)
    // console.log(Animate.handler)
  }

  static addCallbackListener (node, handlerId, handler) {
    node.addEventListener('transitionend', handler, false)
    Animate.handler[handlerId] = { node: node, fn: handler }
    // console.log('Animate: remaining handler: ' + Object.keys(Animate.handler).length)
    // console.log(Animate.handler)
  }

  static removeCallbackListener (handlerId) {
    let node = Animate.handler[handlerId].node
    node.removeEventListener('transitionend', Animate.handler[handlerId].fn, false)
    delete Animate.handler[handlerId]
    // console.log('Animate: ' + handlerId + ' callback removed')
    // console.log('Animate: remaining handler: ' + Object.keys(Animate.handler).length)
    // console.log(Animate.handler)
    return node
  }

  static clearAnimation (node, animationName) {
    if (!node || typeof node === 'undefined') {
      console.warn('Animate: clearAnimation expected node, got undefined')
      return
    }

    node.style.transitionProperty = 'none'
    node.style.transitionDuration = 'initial'
    node.style.transitionStyle = 'none'
    // console.log('Animate: ' + animationName + ' styling (transition) cleared')
  }

  static clear () {
    console.warn('Animate: clear()')
    for (let handlerId in Animate.handler) {
      let node = Animate.removeCallbackListener(handlerId)
      Animate.clearAnimation(node, handlerId)
    }
    // console.log(Animate.handler)
  }
}

// ES6 Properties after Class
Animate.handler = {}
