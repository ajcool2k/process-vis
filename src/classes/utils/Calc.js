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
  static shapePosition (nodes, cols, containerSize, containerNode, startProcess, timeFormat) {
    let axisOffset = 40
    let timeSlice = 60

    let colWidth = Calc.columnSize(containerSize, cols)
    let shapeWidth = Math.min(colWidth / 2, 100)
    nodes.forEach(function (elem, index) {
      let shape = containerNode.querySelector('.shape[data-id="' + elem.id + '"]')
      shape.style.width = shapeWidth + 'px'

      let defaultEndDate = Calc.getEndDate(elem.p, timeFormat)

      // calc height
      let durationMillis = defaultEndDate - elem.p.begin
      let durationDays = (durationMillis / 1000 / 60 / 60 / 24)
      elem.height = Math.max(Math.ceil(timeSlice * durationDays), 16)
      elem.defaultEndDate = defaultEndDate
      console.log('Calc.shapePosition: ' + elem.id + ' - duration: ' + durationDays + ' - height: ' + elem.height)

      // calc position
      let x = Math.floor((colWidth * elem.p.participant) - (colWidth / 2) - (shapeWidth / 2))
      let deltaStart = elem.p.begin - startProcess.p.begin
      let deltaDays = deltaStart / 1000 / 60 / 60 / 24
      let y = deltaDays * timeSlice + axisOffset

      elem.position = {
        x: x,
        y: y
      }
    })
  }

  static addSpace () {
    // prüfe ob elem.y + height ein anderes elem.y ergibt
    // wenn vorhanden dann patche alle elemente >= elem.y (y+height) um einen offset

  }

  static getEndDate (process, timeFormat) {
    if (process.end !== null && typeof process.end === 'object') return process.end

    console.log('no enddate found')
    let defaultEndDate = new Date(process.begin.getTime())  // if no endtime is set
    switch (timeFormat) {
      case 'hours':
        defaultEndDate = defaultEndDate.setHours(process.begin.getHours() + 1)
        break
      case 'days':
        defaultEndDate = defaultEndDate.setDate(process.begin.getDate() + 1)
        break
      case 'months':
        defaultEndDate = defaultEndDate.setMonth(process.begin.getMonth() + 1)
        break
      default:
        console.warn('Calc.shapePosition: incorrect timeFormat')
        defaultEndDate = defaultEndDate.setDate(process.begin.getDate() + 1)
        break
    }
    defaultEndDate = new Date(defaultEndDate)
    return defaultEndDate
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
