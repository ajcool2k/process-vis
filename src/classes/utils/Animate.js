export class Animate {
  static start (node, handlerId, triggerProp, style, time) {
    // update view
    node.style.transitionProperty = triggerProp
    node.style.transitionDuration = time + 's'
    node.style.transitionStyle = style

    // timeout for unchanged dom elements
    setTimeout(() => {
      if (typeof Animate.handler[handlerId] !== 'undefined') Animate.handler[handlerId].fnAfter()
    }, time * 2000)
  }

  static afterTransition (node, handlerId, fnAfter) {
    if (!fnAfter || typeof fnAfter !== 'function') return

    // console.log('Animate: ' + handlerId + ' prepare')
    let fn = () => {
      // console.log('Animate: ' + handlerId + ' afterTransition start')
      fnAfter()
      // console.log('Animate: ' + handlerId + ' afterTransition done')
      Animate.removeTransitionHandler(handlerId)
       // console.log('Animate: remaining handler: ' + Object.keys(Animate.handler).length)
      Animate.clearAnimation(node, handlerId)
      // console.log('-------------------')
    }

    Animate.addTransitionDoneHandler(node, handlerId, fn)
  }

  static addTransitionDoneHandler (node, handlerId, handler) {
    node.removeEventListener('transitionend', handler, false)    // remove old first
    node.addEventListener('transitionend', handler, false)
    Animate.handler[handlerId] = typeof Animate.handler[handlerId] !== 'undefined' ? Animate.handler[handlerId] : {}
    Animate.handler[handlerId].node = node
    Animate.handler[handlerId].fnAfter = handler

    // console.log('Animate: remaining handler: ' + Object.keys(Animate.handler).length)
    // console.log(Animate.handler)
  }

  static removeTransitionHandler (handlerId) {
    let node = Animate.handler[handlerId].node
    node.removeEventListener('transitionend', Animate.handler[handlerId].fnAfter, false)
    delete Animate.handler[handlerId]

    // console.log('Animate: ' + handlerId + ' callback removed')
    // console.log('Animate: remaining handler: ' + Object.keys(Animate.handler).length)
    // console.log(Animate.handler)
    return node
  }

  static clearAnimation (node) {
    if (!node || typeof node === 'undefined') {
      console.warn('Animate: clearAnimation expected node, got undefined')
      return
    }

    node.style.transitionProperty = 'none'
    node.style.transitionDuration = 'initial'
    node.style.transitionStyle = 'none'
  }

  static clear () {
    console.warn('Animate: clear()')
    for (let handlerId in Animate.handler) {
      let node = Animate.removeTransitionHandler(handlerId)
      Animate.clearAnimation(node)
    }
    console.log(Animate)
  }
}

// ES6 Properties after Class
Animate.handler = {}
