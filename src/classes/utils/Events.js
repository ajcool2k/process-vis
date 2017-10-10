export class Events {
  /**
   * Auslagerung von Funktionen und Übergabe an requestAnimationFrame
   * Die Funktionen werden nur so oft ausgeführt, wie maximal gezeichnet werden kann
   * Sinnvoll, da Event-Handler sonst unnötig blockiert werden und hohe CPU-Auslastung entsteht
   * @see     // https://developers.google.com/web/fundamentals/performance/rendering/debounce-your-input-handlers
   * @requires scheduledAnimationFrame
   * @param {function} fn Funktion ohne Zugriff auf Events! Event-Parameter müssen zuvor gespeichert werden
   * @param {String} fname Name zur Verwaltung der Funktion im scheduledAnimationFrame
   */
  static debounce (fn, fname) {
    // Check if Setting is enabled
    if (!Events.debounceFunctions) {
      if (Events.benchmarkFireRate) Events.detectFireRate()
      return fn()
    }
    // Prevent multiple rAF callbacks.
    if (Events.scheduledAnimationFrame[fname]) return

    Events.scheduledAnimationFrame[fname] = true
    window.requestAnimationFrame(fn)
    if (Events.benchmarkFireRate) Events.detectFireRate()
  }

  /**
   * Ausbremsen von CPU intensiven Funktionen, zum Beispiel für Eventhandler
   * @param {function} fn Funktion die ausgeführt werden soll.
   * @param {Event} fnEvent Event der Funktion
   * @param {Number} wait Zeit in ms
   * @param {Number} lastRun letzte Ausführungszeit durch Date.now()
   */
  static throttle (fn, fnEvent, wait, lastRun) {
    // Check if Setting is enabled
    if (!Events.throttleFunctions || wait < 1) {
      // if (Events.benchmarkFireRate) Events.detectFireRate()
      return fn(fnEvent)
    }

    if ((lastRun + wait - Date.now()) < 0) {
      fn(fnEvent)
      // if (Events.benchmarkFireRate) Events.detectFireRate()
      lastRun = Date.now()
    }
    return lastRun
  }

  /**
   * Methode dient zum Erfassen wie oft ein Event vom Client ausgeführt wird.
   */
  static detectFireRate () {
    let maxIterations = Events.benchmarkFireRateIterations
    if (Events.FIRE_RATE_COUNTER === 0) {
      Events.FIRE_RATE_START = Date.now()
      console.warn('detectFireRate started')
    }
    if (++Events.FIRE_RATE_COUNTER === maxIterations) {
      let delta = Date.now() - Events.FIRE_RATE_START
      let deltaSec = delta / 1000.0
      console.warn('detectFireRate finished!')
      console.warn('Time passed (s): ' + deltaSec)
      let eventsPerSec = maxIterations / deltaSec
      console.warn('Events per sec: ' + eventsPerSec)

      // reset
      Events.FIRE_RATE_START = Events.FIRE_RATE_COUNTER = 0
    }
  }
}

// Settings
Events.throttleFunctions = false
Events.debounceFunctions = true
Events.benchmarkFireRate = false
Events.benchmarkFireRateIterations = 100

// internal vars (don't touch)
Events.scheduledAnimationFrame = {}
Events.FIRE_RATE_START = 0
Events.FIRE_RATE_COUNTER = 0
