export class Tests {
  static run (domElem, fn, change, times) {
    for (let i = 0; i < times; i++) {
      setTimeout(() => {
        fn(domElem, change, change)
      }, 0)
    }
  }

  static translate (domElem, x, y) {
    // store position
    Tests.lastPosition.x += x
    domElem.style.transform = 'translate(' + Tests.lastPosition.x + 'px, ' + Tests.lastPosition.y + 'px)'
    Tests.lastPosition.y += y
    domElem.style.transform = 'translate(' + Tests.lastPosition.x + 'px, ' + Tests.lastPosition.y + 'px)'
    // console.log('Position', Tests.lastPosition)
  }

  static position (domElem, x, y) {
    // store position
    Tests.lastPosition.x += x
    domElem.style.left = Tests.lastPosition.x + 'px'
    Tests.lastPosition.y += y
    domElem.style.top = Tests.lastPosition.y + 'px'
    // console.log('Position', Tests.lastPosition)
  }

  static reset (domElem) {
    Tests.position(domElem, 0, 0)
  }

  static changeColor (domElem) {
    Tests.lastColorIndex = (Tests.lastColorIndex + 1) % Tests.colors.length
    domElem.style.background = Tests.colors[Tests.lastColorIndex]
  }
}

Tests.colors = ['red', 'blue', 'green', 'orange', 'yellow']
Tests.lastPosition = { x: 0, y: 0 }
Tests.lastColorIndex = 0
