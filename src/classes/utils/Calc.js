import { _ } from 'underscore'
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

    let data = {}
    data.left = Math.round(rect.left + offsetX) - translate.x
    data.top = Math.round(rect.top + offsetY) - translate.y
    data.width = rect.width
    data.height = rect.height
    data.bottom = data.top + rect.height
    data.right = data.left + rect.width
    return data
  }

  static columnSize (containerSize, participants) {
    if (typeof containerSize === 'undefined' || containerSize === null || !containerSize.hasOwnProperty('x')) {
      console.warn('Calc.columnSize: param containerSize not correctly passed.')
      return 0
    }

    if (typeof participants === 'undefined' || participants === null) {
      console.warn('Calc.columnSize: param participants not correctly passed.')
      return 0
    }

    return Math.floor(containerSize.x / participants.length)
  }

  /**
  * Methode zum Verändern des End-Datums, basiernd auf einem Duration-Faktors
  * @param {Object} process Datenobj
  * @param {Number} factor Faktor zur Veränderung der Duration
  */
  static updateEndDate (process, factor) {
    if (typeof process === 'undefined') {
      console.warn('updateEndDate: process expected')
      return
    }

    if (typeof factor !== 'number') {
      console.warn('updateEndDate: factor as number expected')
      return
    }

    let durationMillis = process.mEnd - process.start
    let durationMillisChanged = Math.floor(durationMillis * factor)
    process.mEnd = new Date(process.start.valueOf() + durationMillisChanged)
  }

  static getDivider (timeFormat) {
    let divider = 1

    if (typeof timeFormat === 'undefined' || typeof timeFormat !== 'string') {
      console.warn('getDivider: timeFormat is missing')
      return divider
    }

    if (Calc.timeFormats.hasOwnProperty(timeFormat) === false) {
      console.warn('getDivider: unknown timeFormat ' + timeFormat)
      return divider
    }

    switch (timeFormat) {
      case 'hours':
        divider = Calc.timeFormats.hours
        break

      case 'days':
        divider = Calc.timeFormats.days
        break

      case 'months':
        divider = Calc.timeFormats.months
        break
    }

    return divider
  }

  /**
   * Methode ergänt das Model um Positionsdaten der Elemente, damit diese im Container gezeichnet werden können.
   */
  static processPosition (processes, participants, containerSize, timeFormat) {
    console.warn('processPosition')

    if (typeof processes === 'undefined' || processes instanceof Array === false) {
      console.warn('processPosition: processes are missing')
      return
    }

    if (typeof participants === 'undefined' || participants instanceof Array === false) {
      console.warn('processPosition: participants are missing')
      return
    }

    if (typeof containerSize === 'undefined' || typeof containerSize !== 'object') {
      console.warn('processPosition: containerSize is missing')
      return
    }

    if (typeof timeFormat === 'undefined' || typeof timeFormat !== 'string') {
      console.warn('processPosition: timeFormat is missing')
      return
    }

    let startProcess = Calc.getStartProcess(processes)

    // create copy of processes to work with
    let processesCopy = Helper.deepClone(processes)
    const timeSlice = Calc.timeSlice

    let colWidth = Calc.columnSize(containerSize, participants)
    let processWidth = Math.min(colWidth / 2, 100) // Bug Math.max(colWidth / 2, 100)) liefert dynamische Ergebnisse

    let divider = Calc.getDivider(timeFormat)
    processesCopy.forEach(elem => {
      let defaultEndDate = Calc.getDefaultEndDate(elem, timeFormat)

      // calc height
      let durationMillis = defaultEndDate - elem.start
      let duration = durationMillis / divider

      elem._height = Math.max(Math.ceil(timeSlice * duration), timeSlice)
      elem._width = processWidth

      elem._defaultEndDate = defaultEndDate
      // console.log('Calc.processPosition: ' + elem.id + ' - duration: ' + duration + ' - height: ' + elem._height)

      // find workspace lane
      let laneNumber = participants.indexOf(elem.initiator) + 1

      if (laneNumber === 0) {
        console.warn('Calc.processPosition: Process is not applied to any lane')
      }

      // calc position
      let x = Math.floor((colWidth * laneNumber) - (colWidth / 2) - (processWidth / 2))
      let deltaStart = elem.start - startProcess.start
      let deltaTime = deltaStart / divider
      let y = Math.ceil(deltaTime * timeSlice) + Calc.axisOffset

      elem._position = {
        x: x,
        y: y
      }
    })

    Calc.addSpace(processesCopy, timeSlice)

    // copy back values on originals (avoid reactivity if no values changes)
    for (let i = 0; i < processes.length; i++) {
      // copy primitives
      processes[i]._position.x = processesCopy[i]._position.x
      processes[i]._position.y = processesCopy[i]._position.y
      processes[i]._height = processesCopy[i]._height
      processes[i]._width = processesCopy[i]._width

      // copy enddate (keep old if it's the same)
      if (processes[i].hasOwnProperty('_defaultEndDate')) {
        let date1 = processes[i]._defaultEndDate
        let date2 = processesCopy[i]._defaultEndDate
        processes[i]._defaultEndDate = _.isEqual(date1, date2) ? date1 : date2
      } else {
        processes[i]._defaultEndDate = processesCopy[i]._defaultEndDate
      }
    }

    // console.log(processes.map(elem => elem._position.y + elem._height))
  }

  /**
   * Methode dient zum Setzen von Abständen zwischen processes
   * Dieses Verhalten kann notwendig werden, wenn Y-Startpunkt einer Node mit einem Y-Endpunkt einer anderen Node kollidieren
   * @param {Object} processes  Objekt mit allen Prozessen
   * @param {Number} timeSlice Offset-Wert um den verschoben werden soll
   */
  static addSpace (processes, timeSlice) {
    if (typeof processes === 'undefined') {
      console.warn('addSpace: processes missing')
      return false
    }

    if (typeof timeSlice !== 'number') {
      console.warn('addSpace: timeSlice missing')
      return false
    }

    if (processes.length === 0) return true

    if (_.find(processes, elem => typeof elem._position.y !== 'number')) {
      console.error('addSpace: process needs to have position y value')
      return false
    }

    if (_.find(processes, elem => typeof elem._height !== 'number')) {
      console.error('addSpace: process needs to have position y value')
      return false
    }

    // prüfe ob elem.y + height ein anderes elem.y ergibt
    // wenn vorhanden dann patche alle elemente >= elem.y (y+height) um einen offset
    let patched = false
    let successfulPatch = true
    let interation = 0

    do {
      // prepare search
      patched = false
      const yEndList = processes.map(elem => elem._position.y + elem._height)

      console.log('addSpace - Interation: ', interation++, yEndList)

      processes.forEach((elem, index) => {
        let startPosition = elem._position.y
        let foundProcesses = yEndList.filter(endPos => {
          return (startPosition >= endPos) && (startPosition < endPos + timeSlice)
        })

        if (foundProcesses.length === 0) return // next iteration

        // return

        // console.log('elem', JSON.stringify(elem))
        // console.log('foundProcesses', foundProcesses)
        // console.log('startingPos', elem._position.y)
        // console.log('endPos', elem._position.y + elem._height)
        const yEndList1 = processes.map(elem => elem._position.y + elem._height)
        console.log('beforePatch', yEndList1)

        // actual startPosition found in an endPosition for another elem
        // increment all other processes by 1
        let endPoint = elem._position.y + elem._height
        for (let i = index; i < processes.length; i++) {
          if (processes[i]._position.y + processes[i]._height >= endPoint) processes[i]._position.y += timeSlice
        }

        const yEndList2 = processes.map(elem => elem._position.y + elem._height)
        console.log('afterPatch', yEndList2)

        patched = true

        // Should not happen (just in case)
        if (foundProcesses[0] > 60000) {
          console.warn('Unexpected Calculation, stopping to avoid inifite loop')
          patched = false
          successfulPatch = false
        }
      })
    } while (patched) // run as long as something got patched

    return successfulPatch
  }

  static getDefaultEndDate (process, timeFormat) {
    if (process.end !== null && typeof process.end === 'object') return process.end

    // console.log('no enddate found')
    let defaultEndDate = new Date(process.start.getTime()) // if no endtime is set
    switch (timeFormat) {
      case 'hours':
        defaultEndDate = defaultEndDate.setHours(process.start.getHours() + 1)
        break
      case 'days':
        defaultEndDate = defaultEndDate.setDate(process.start.getDate() + 1)
        break
      case 'months':
        defaultEndDate = defaultEndDate.setMonth(process.start.getMonth() + 1)
        break
      default:
        console.warn('Calc.processPosition: incorrect timeFormat')
        defaultEndDate = defaultEndDate.setDate(process.start.getDate() + 1)
        break
    }
    defaultEndDate = new Date(defaultEndDate)
    return defaultEndDate
  }

  /**
   * Methode zum Finden des obersten Prozesses
   * @param {Object} childs
   */
  static getStartProcess (childs) {
    if (childs instanceof Array !== true) {
      console.warn('Could not parse startProcess: Processes not available')
      return undefined
    }

    if (childs.length === 0) return undefined

    let startProcess = _.min(childs, elem => elem.start)

    return startProcess
  }

  /**
   * Methode zum Finden des letzten Prozesses
   * @param {Object} childs
   */
  static getEndProcess (childs) {
    if (childs instanceof Array !== true) {
      console.warn('Could not parse endProcess: Processes not available')
      return undefined
    }

    if (childs.length === 0) return undefined

    let endProcess = _.max(childs, elem => elem.mEnd)
    return endProcess
  }

  /**
   * Methode berechnet die größe des benötigten Containers für Elemente.
   * Zur Berechnung ist es notwendig, dass addElementPosition zuvor aufgerufen wurde.
   * @see addElementPosition
   */
  static containerSize (processes, participants) {
    let containerX = 0
    let containerY = 0

    // relative approch
    processes.forEach(function (elem, index) {
      // store x / y for container size
      containerY = Math.max(containerY, elem._position.y + elem._height + Calc.containerPaddingBottom)
    })

    // easy approch
    containerX = participants.length * Calc.colWidth

    containerY = Math.max(containerY, Calc.minContainerHeight)
    containerX = Math.max(containerX, Calc.minContainerWidth)

    console.log('containerSize', { x: containerX, y: containerY })
    // return containerSize
    return { x: containerX, y: containerY }
  }
}

Calc.timeSlice = 60
Calc.minContainerHeight = 600
Calc.minContainerWidth = 800
Calc.colWidth = 400
Calc.containerPaddingBottom = 100
Calc.axisOffset = 40
Calc.timeFormats = {
  'hours': 1000 * 60 * 60,
  'days': 1000 * 60 * 60 * 24,
  'months': 1000 * 60 * 60 * 24 * 30
}
