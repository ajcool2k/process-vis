export class Calc {

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

}