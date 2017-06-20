export class TouchSupport {
  static hasSupport () {
    TouchSupport.DEVICE_SUPPORTS_TOUCH = ('ontouchstart' in window)
    return TouchSupport.DEVICE_SUPPORTS_TOUCH
  }

  static detectUsage () {
    window.addEventListener('touchstart', function onFirstTouch () {
      // we could use a class
      document.body.classList.add('TouchSupport')

      // or set some global variable
      TouchSupport.USER_TOUCHED = true

      // we only need to know once that a human touched the screen, so we can stop listening now
      window.removeEventListener('touchstart', onFirstTouch, false)
    }, false)
  }

  static init () {
    // disable long press context menu
    window.oncontextmenu = function (event) {
      event.preventDefault()
      event.stopPropagation()
      return false
    }
  }
}

// static fields
TouchSupport.USER_TOUCHED = false
TouchSupport.DEVICE_SUPPORTS_TOUCH = false
