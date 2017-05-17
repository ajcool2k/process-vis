export class Events {

    // Settings
    static throttleFunctions = false;
    static debounceFunctions = true;
    static benchmarkFireRate = false;
    static benchmarkFireRateIterations = 100;
    
    // internal vars (don't touch)
    static scheduledAnimationFrame = {};
    static FIRE_RATE_START = 0;
    static FIRE_RATE_COUNTER = 0;

    /**
     * Auslagerung von Funktionen und Übergabe an requestAnimationFrame
     * Die Funktionen werden nur so oft ausgeführt, wie maximal gezeichnet werden kann
     * Sinnvoll, da Event-Handler sonst unnötig blockiert werden und hohe CPU-Auslastung entsteht
     * @see     // https://developers.google.com/web/fundamentals/performance/rendering/debounce-your-input-handlers
     * @requires scheduledAnimationFrame
     * @param {function} fn Funktion ohne Zugriff auf Events! Event-Parameter müssen zuvor gespeichert werden 
     * @param {String} fname Name zur Verwaltung der Funktion im scheduledAnimationFrame 
     */
    static debounce(fn, fname) {

      // Check if Setting is enabled
      if (!Utils.debounceFunctions) {
        if (Utils.benchmarkFireRate) Utils.detectFireRate();
        return fn(); 
      }
      // Prevent multiple rAF callbacks.
      if (Utils.scheduledAnimationFrame[fname]) return;

      Utils.scheduledAnimationFrame[fname] = true;
      requestAnimationFrame(fn);
      if (Utils.benchmarkFireRate) Utils.detectFireRate();
    }

    /**
     * Ausbremsen von CPU intensiven Funktionen, zum Beispiel für Eventhandler
     * @param {function} fn Funktion die ausgeführt werden soll. Events werden unterstützt
     * @param {Number} wait Zeit in ms
     * @param {Number} lastRun letzte Ausführungszeit durch Date.now()
     */
    static throttle(fn, wait, lastRun) {
      // Check if Setting is enabled    
      if (!Utils.throttleFunctions || wait < 1) {
        // if (Utils.benchmarkFireRate) Utils.detectFireRate();
        return fn(event);
      }

      if ((lastRun + wait - Date.now()) < 0) {
        fn(event);
        // if (Utils.benchmarkFireRate) Utils.detectFireRate();
        lastRun = Date.now();
      }
      return lastRun;     
    }

    /**
     * Methode dient zum Erfassen wie oft ein Event vom Client ausgeführt wird.
     */
    static detectFireRate() {
        let maxIterations = Utils.benchmarkFireRateIterations;
        if (Utils.FIRE_RATE_COUNTER == 0) {
            Utils.FIRE_RATE_START = Date.now();
            console.warn("detectFireRate started");
        }
        if (++Utils.FIRE_RATE_COUNTER == maxIterations) {
            let delta = Date.now() - Utils.FIRE_RATE_START;
            let deltaSec = delta / 1000.0;
            console.warn("detectFireRate finished!");
            console.warn("Time passed (s): " + deltaSec);
            let eventsPerSec = maxIterations / deltaSec;
            console.warn("Events per sec: " + eventsPerSec);

            // reset
            Utils.FIRE_RATE_START = Utils.FIRE_RATE_COUNTER = 0;
            return;
        }
        return;
    }

}