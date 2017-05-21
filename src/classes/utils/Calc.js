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

    /**
     * Methode ergänt das Model um Positionsdaten der Elemente, damit diese im Container gezeichnet werden können.
     */
    static addElementPosition(nodes) {
        nodes.forEach(function(elem, index) {
            let x = 150 * elem.p.participant;
            let y = elem.p.time * 3 + 40;

            elem.position = { 
                x: x,
                y: y
            };
        });
    }

    /**
     * Methode berechnet die größe des benötigten Containers für Elemente.
     * Zur Berechnung ist es notwendig, dass addElementPosition zuvor aufgerufen wurde.
     * @see addElementPosition
     */
    static containerSize(nodes) {

      var containerX = 0;
      var containerY = 0;

      nodes.forEach(function(elem, index) {
        // store x / y for container size
        containerX = Math.max(containerX, elem.position.x * 2);
        containerY = Math.max(containerY, elem.position.y + 300);
      });
      
      // return containerSize
      return { x: containerX, y: containerY };
    }

}