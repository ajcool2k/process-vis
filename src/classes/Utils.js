import { Process } from '@/classes/Process';


export class Utils {

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
     * Methode liefert die absoluten Werte eines HTML-Dom Elements zurück.
     * getBoundingClientRect liefert nur im sichtbaren Bereich. Sobald Elemente außerhalb liegen, werden die Daten nicht mehr korrekt erfasst.
     * Diese Methode erzeugt einen reflow und sollte nur so oft wie nötig aufgerufen werden
     * @param {DOMElement} elementNode 
     */
    static absolutePosition(elementNode) {
        let rect = elementNode.getBoundingClientRect(); // forces reflow

        var data = {
            left: Math.round(rect.left + window.scrollX),
            top: Math.round(rect.top + window.scrollY),
            width: rect.width,
            height: rect.height,
            bottom: Math.round(rect.top + window.scrollY) + rect.height,
            right: Math.round(rect.left + window.scrollX) + rect.width
        }

        return data;
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

    static generateData() {

        var nodes = Array();

        nodes.push( { id: 'head', p: new Process('head', 0 * 24, 0, 0), shape: 'ellipse', bgColor: '#aaa' } );
        nodes.push( { id: 'n0', p: new Process('n0', 1 * 24, 1, 100 ), shape: 'roundrectangle', bgColor: '#F5A45D' } );
        nodes.push( { id: 'n1', p: new Process('n1', 2 * 24, 1, 200 ), shape: 'roundrectangle', bgColor: '#F5A45D' } );
        nodes.push( { id: 'n2', p: new Process('n2', 1 * 24, 2, 200 ), shape: 'roundrectangle', bgColor: '#F5A45D' } );
        nodes.push( { id: 'n3', p: new Process('n3', 1 * 24, 1, 350 ), shape: 'roundrectangle', bgColor: '#F5A45D' } );
        nodes.push( { id: 'n4', p: new Process('n4', 3 * 24, 2, 280 ), shape: 'roundrectangle', bgColor: '#F5A45D' } );
        nodes.push( { id: 'tail', p: new Process('tail', 0 * 24, 0, 450 ), shape: 'ellipse', bgColor: '#aaa' } );

        var edges = Array();

        edges.push({ source: 'head', target: 'n0' } );
        edges.push({ source: 'n0', target: 'n1' } );
        edges.push({ source: 'n0', target: 'n2' } );
        edges.push({ source: 'n1', target: 'n3' } );
        edges.push({ source: 'n3', target: 'tail' } );
        edges.push({ source: 'n2', target: 'n4' } );
        edges.push({ source: 'n4', target: 'n3' } );

        var participants = Array();
        
        participants.push([1, 'A1']);
        participants.push([2, 'A2']);
        participants.push([3, 'A3']);
        participants.push([4, 'A4']);
        participants.push([5, 'A5']);

        return {
            nodes: nodes,
            edges: edges
        }
    }

    static printPath(collection) {
        let pathArray = collection.jsons()
        let ret = "path: ";

        pathArray.forEach(function(elem) {
            ret += elem.group === 'nodes' ? elem.data.id : " > ";
        });

        console.log(ret);
    }

}