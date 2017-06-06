export class Calc {
  /**
   * Methode liefert die absoluten Werte eines HTML-Dom Elements zurück.
   * getBoundingClientRect liefert nur im sichtbaren Bereich. Sobald Elemente außerhalb liegen, werden die Daten nicht mehr korrekt erfasst.
   * Diese Methode erzeugt einen reflow und sollte nur so oft wie nötig aufgerufen werden
   * @param {DOMElement} elementNode
   */
  static absolutePosition (elementNode) {
    let rect = elementNode.getBoundingClientRect() // forces reflow

    let data = {
      left: Math.round(rect.left + window.scrollX),
      top: Math.round(rect.top + window.scrollY),
      width: rect.width,
      height: rect.height,
      bottom: Math.round(rect.top + window.scrollY) + rect.height,
      right: Math.round(rect.left + window.scrollX) + rect.width
    }

    return data
  }

  static columnSize (containerSize, cols) {
    return containerSize.x / cols.length
  }

  /**
   * Methode ergänt das Model um Positionsdaten der Elemente, damit diese im Container gezeichnet werden können.
   */
  static shapePosition (nodes, cols, containerSize, containerNode, startProcess) {
    let colWidth = Calc.columnSize(containerSize, cols)
    let shapeWidth = Math.min(colWidth / 2, 100)
    nodes.forEach(function (elem, index) {
      let shape = containerNode.querySelector('.shape[data-id="' + elem.id + '"]')
      shape.style.width = shapeWidth + 'px'

      let x = (colWidth * elem.p.participant) - (colWidth / 2) - (shapeWidth / 2)
      let diff = elem.p.begin - startProcess.p.begin
      diff = diff / 1000 / 60 / 60 / 24
      // 40px offset
      // 340 = 5 * x + 40 => 300 = 5x => x = 60       
      let y = diff * 60 + 40

      elem.position = {
        x: x,
        y: y
      }
    })
  }

  /**
   * Methode berechnet die größe des benötigten Containers für Elemente.
   * Zur Berechnung ist es notwendig, dass addElementPosition zuvor aufgerufen wurde.
   * @see addElementPosition
   */
  static containerSize (nodes, cols) {
    let colWidth = 400
    let containerX = 0
    let containerY = 0

    // relative approch
    nodes.forEach(function (elem, index) {
      // store x / y for container size
      containerX = Math.max(containerX, elem.position.x)
      containerY = Math.max(containerY, elem.position.y + 300)
    })

    // easy approch
    containerX = cols.length * colWidth

    // return containerSize
    return { x: containerX, y: containerY }
  }
}
