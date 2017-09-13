import { Helper } from '@/classes/utils/Helper'

export class Calc {
  /**
   * Methode liefert die absoluten Werte eines HTML-Dom Elements zurück.
   * getBoundingClientRect liefert nur im sichtbaren Bereich. Sobald Elemente außerhalb liegen, werden die Daten nicht mehr korrekt erfasst.
   * Da getBoundingClientRect erst nach Transformationen berechnet werden kann, werden diese nachträglich wieder herausgerechnet.
   * Diese Methode erzeugt einen reflow und sollte nur so oft wie nötig aufgerufen werden
   * @param {DOMElement} elementNode
   * @param {Object} translate Object mit {x,y} Information zur Translation eines Objekts
   */
  static absolutePosition (elementNode, translate) {
    if (typeof translate === 'undefined') {
      translate = { x: 0, y: 0 }
      console.warn('translate not applied to function - use absolutePosition')
    }

    let offsetY = 0
    let offsetX = 0

    let rect = elementNode.getBoundingClientRect() // forces reflow

    if (typeof window !== 'undefined') {
      offsetY = window.scrollY
      offsetX = window.scrollX
    } else {
      console.warn('could not access window element')
    }

    let data = {
      left: Math.round(rect.left + offsetX) - translate.x,
      top: Math.round(rect.top + offsetY) - translate.y,
      width: rect.width,
      height: rect.height,
      bottom: Math.round(rect.top + offsetY) + rect.height,
      right: Math.round(rect.left + offsetX) + rect.width
    }

    return data
  }

  static columnSize (containerSize, cols) {
    if (typeof containerSize === 'undefined' || containerSize === null || !containerSize.hasOwnProperty('x')) {
      console.warn('Calc.columnSize: param containerSize not correctly passed.')
      return 0
    }

    if (typeof cols === 'undefined' || cols === null) {
      console.warn('Calc.columnSize: param cols not correctly passed.')
      return 0
    }

    return Math.floor(containerSize.x / cols.length)
  }

  /**
  * Methode zum Verändern des End-Datums, basiernd auf einem Duration-Faktors
  * @param {Object} shape Datenobj
  * @param {Number} factor Faktor zur Veränderung der Duration
  */
  static endDateByChange (shape, factor) {
    let process = shape.p
    let durationMillis = shape.defaultEndDate - process.begin
    let durationMillisChanged = Math.floor(durationMillis * factor)
    let endDate = new Date(process.begin.getTime() + durationMillisChanged)
    process.end = endDate
    shape.defaultEndDate = endDate
  }

  /**
   * Methode ergänt das Model um Positionsdaten der Elemente, damit diese im Container gezeichnet werden können.
   */
  static shapePosition (nodesOrig, cols, containerSize, containerNode, startProcess, timeFormat) {
    console.warn('shapePosition')
    console.log(startProcess.id)
    // create copy of nodes to work with
    let nodes = nodesOrig.map(elem => Helper.copy(elem))

    const axisOffset = 40
    const timeSlice = Calc.timeSlice

    let colWidth = Calc.columnSize(containerSize, cols)
    let shapeWidth = Math.min(colWidth / 2, 100)

    let quotientHours = 1000 * 60 * 60
    let quotientDays = 1000 * 60 * 60 * 24
    let quotientMonths = 1000 * 60 * 60 * 24 * 30

    let quotient = 1
    switch (timeFormat) {
      case 'hours':
        quotient = quotientHours
        break

      case 'days':
        quotient = quotientDays
        break

      case 'months':
        quotient = quotientMonths
        break

      default:
        console.warn('Calc.shapePosition: unknown timeFormat ' + timeFormat)
        quotient = quotientDays
        break
    }

    const lanes = cols.map(elem => elem.id)

    nodes.forEach(function (elem, index) {
      let defaultEndDate = Calc.getEndDate(elem.p, timeFormat)

      // calc height
      let durationMillis = defaultEndDate - elem.p.begin
      let duration = durationMillis / quotient

      elem.height = Math.max(Math.ceil(timeSlice * duration), timeSlice)
      elem.width = shapeWidth

      elem.defaultEndDate = defaultEndDate
      // console.log('Calc.shapePosition: ' + elem.id + ' - duration: ' + duration + ' - height: ' + elem.height)

      // find workspace lane
      let laneNumber = lanes.indexOf(elem.p.participant) + 1

      if (laneNumber === 0) {
        console.warn('Calc.shapePosition: Process is not applied to any lane')
      }

      // calc position
      let x = Math.floor((colWidth * laneNumber) - (colWidth / 2) - (shapeWidth / 2))
      let deltaStart = elem.p.begin - startProcess.p.begin
      let deltaTime = deltaStart / quotient
      let y = Math.ceil(deltaTime * timeSlice) + axisOffset

      elem.position = {
        x: x,
        y: y
      }
    }, lanes)

    Calc.addSpace(nodes, timeSlice)

    // copy back values on originals (avoid reactivity if no values changes)

    for (let i = 0; i < nodesOrig.length; i++) {
      nodesOrig[i].position.x = nodes[i].position.x
      nodesOrig[i].position.y = nodes[i].position.y
      nodesOrig[i].height = nodes[i].height
      nodesOrig[i].width = nodes[i].width
      nodesOrig[i].defaultEndDate = nodes[i].defaultEndDate
    }

    // console.log(nodesOrig.map(elem => elem.position.y + elem.height))
  }

  /**
   * Methode dient zum Setzen von Abständen zwischen Nodes
   * Dieses Verhalten kann notwendig werden, wenn Y-Startpunkt einer Node mit einem Y-Endpunkt einer anderen Node kollidieren
   * @param {Object} nodes  Objekt mit allen Shapes
   * @param {Number} timeSlice Offset-Wert um den verschoben werden soll
   */
  static addSpace (nodes, timeSlice) {
    // prüfe ob elem.y + height ein anderes elem.y ergibt
    // wenn vorhanden dann patche alle elemente >= elem.y (y+height) um einen offset
    let patched = false

    do {
      // prepare search
      patched = false
      const yEndList = nodes.map(elem => elem.position.y + elem.height)
      console.log('addSpace', yEndList)

      nodes.forEach(function (node, index) {
        let startPosition = node.position.y
        let foundNodes = yEndList.filter(endPos => {
          return (startPosition >= endPos) && (startPosition < endPos + timeSlice)
        })

        if (foundNodes.length === 0) return // next iteration

        // return

        console.log('node', JSON.stringify(node))
        console.log('foundNodes', foundNodes)
        console.log('startingPos', node.position.y)
        console.log('endPos', node.position.y + node.height)
        const yEndList1 = nodes.map(elem => elem.position.y + elem.height)
        console.log('beforePatch', yEndList1)

        // actual startPosition found in an endPosition for another node
        // increment all other nodes by 1
        let endPoint = node.position.y + node.height
        for (let i = index; i < nodes.length; i++) {
          if (nodes[i].position.y + nodes[i].height >= endPoint) nodes[i].position.y += timeSlice
        }

        const yEndList2 = nodes.map(elem => elem.position.y + elem.height)
        console.log('afterPatch', yEndList2)

        patched = true

        // Should not happen (just in case)
        if (foundNodes[0] > 6000) {
          console.warn('Unexpected Calculation, stopping to avoid inifite loop')
          patched = false
        }
      })
    } while (patched) // run as long as something got patched
  }

  static getEndDate (process, timeFormat) {
    if (process.end !== null && typeof process.end === 'object') return process.end

    // console.log('no enddate found')
    let defaultEndDate = new Date(process.begin.getTime()) // if no endtime is set
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
    let containerX = 0
    let containerY = 0

    // relative approch
    nodes.forEach(function (elem, index) {
      // store x / y for container size
      containerY = Math.max(containerY, elem.position.y + Calc.containerPaddingBottom)
    })

    // easy approch
    containerX = cols.length * Calc.colWidth

    // return containerSize
    return { x: containerX, y: containerY }
  }
}

Calc.timeSlice = 60
Calc.colWidth = 400
Calc.containerPaddingBottom = 300
