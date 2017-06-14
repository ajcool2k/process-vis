export class Animate {
  static run (node, nodeId, triggerProp, style, time) {
    let animationName = nodeId + '-' + triggerProp
    console.warn('Animate: ' + animationName)
    console.log(node)
    node.style.transitionProperty = triggerProp
    node.style.transitionDuration = time + 's'
    node.style.transitionStyle = style
    /*
    if (Animate.timer.hasOwnProperty(animationName)) clearTimeout(Animate.timer[animationName])

    let timerId = setTimeout(() => {
      delete Animate.timer[animationName]   // clear timer
      Animate.clearAnimation(node, animationName)
      console.log('Animate: ' + animationName + ' css done')
    }, time * 2000)

    Animate.timer[animationName] = timerId  // save timer
    */
  }

  static afterTransition (node, handlerId, callback) {
    console.log('Animate: ' + handlerId + ' prepare')

    let fn = function () {
      console.log('Animate: ' + this.handlerId + ' afterTransition start')
      callback()
      console.log('Animate: ' + this.handlerId + ' afterTransition done')
      Animate.removeCallbackListener(this.handlerId)
      Animate.clearAnimation(this.node, this.handlerId)
      console.log('-------------------')
    }.bind({ node: node, handlerId: handlerId })

    node.removeEventListener('transitionend', fn, false)    // remove old first
    node.addEventListener('transitionend', fn, false)       // add new listener
    Animate.handler[handlerId] = { node: node, fn: fn }
    console.log('Animate: collection handler: ' + Object.keys(Animate.handler).length)
    console.log(Animate.handler)
  }

  static addCallbackListener (node, handlerId, handler) {
    node.addEventListener('transitionend', handler, false)
    Animate.handler[handlerId] = { node: node, fn: handler }
    console.log('Animate: remaining handler: ' + Object.keys(Animate.handler).length)
    console.log(Animate.handler)
  }

  static removeCallbackListener (handlerId) {
    let node = Animate.handler[handlerId].node
    node.removeEventListener('transitionend', Animate.handler[handlerId].fn, false)
    delete Animate.handler[handlerId]
    console.log('Animate: ' + handlerId + ' callback removed')
    console.log('Animate: remaining handler: ' + Object.keys(Animate.handler).length)
    console.log(Animate.handler)
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
    console.log('Animate: ' + animationName + ' styling (transition) cleared')
  }

  static clear () {
    Animate.timer = {}
    console.warn('Animate: clear()')
    for (let handlerId in Animate.handler) {
      let node = Animate.removeCallbackListener(handlerId)
      Animate.clearAnimation(node, handlerId)
    }
    console.log(Animate.handler)
  }
}

// ES6 Properties after Class
Animate.timer = {}
Animate.handler = {}
