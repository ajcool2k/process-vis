import { Helper } from '@/classes/utils/Helper'
const _ = require('lodash')

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

  /**
   * Dient zur Berechnung einer Spaltenbreite
   * @param {Object} containerSize aktuelle Größe des Containers
   * @param {Array} delegates  Array mit Akteuren
   */
  static columnSize (containerSize, delegates) {
    if (typeof containerSize === 'undefined' || containerSize === null || !containerSize.hasOwnProperty('x')) {
      console.warn('Calc.columnSize: param containerSize not correctly passed.')
      return 0
    }

    if (typeof delegates === 'undefined' || delegates === null) {
      console.warn('Calc.columnSize: param delegates not correctly passed.')
      return 0
    }

    return Math.floor(containerSize.x / delegates.length)
  }

  /**
  * Methode zum Verändern des End-Datums, basiernd auf einem Duration-Faktors
  * @param {Array} process Kindprozesse
  * @param {Number} factor Faktor zur Veränderung der Duration
  * @param {String} timeFormat
  */
  static updateEndDate (process, factor, timeFormat) {
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
    process.mEnd = Calc.roundDate(process.mEnd, timeFormat)
  }

  static roundDate (date, timeFormat) {
    let tmp = new Date(date.valueOf())
    switch (timeFormat) {
      case 'hours':
        tmp.setHours(tmp.getHours() + Math.round(tmp.getMinutes() / 60))
        tmp.setMinutes(0)
        tmp.setSeconds(0)
        tmp.setMilliseconds(0)
        break

      case 'days':
        tmp.setDate(tmp.getDate() + Math.round(tmp.getHours() / 24))
        tmp.setHours(0)
        tmp.setMinutes(0)
        tmp.setSeconds(0)
        tmp.setMilliseconds(0)
        break

      case 'months':
        tmp.setMonth(tmp.getMonth() + Math.round(tmp.getDay() / 30))
        tmp.setDate(0)
        tmp.setHours(0)
        tmp.setMinutes(0)
        tmp.setSeconds(0)
        tmp.setMilliseconds(0)
        break
    }

    return tmp
  }

  static incrementDate (date, timeFormat) {
    let tmp = new Date(date.valueOf())
    switch (timeFormat) {
      case 'months':
        tmp.setMonth(tmp.getMonth() + 1)
        break
      case 'days':
        tmp.setDate(tmp.getDate() + 1)
        break
      case 'hours':
        tmp.setHours(tmp.getHours() + 1)
        break
    }
    return tmp
  }

  /**
   * Dient zur Berechnung des Teilers für ein gewähltes Zeitformat
   * @param {String} timeFormat das aktuell gewählte Zeitformat
   */
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

  static findIntersected (processes, delegates) {
    let map = []

    // map processes against delegates
    delegates.forEach(elem => {
      map.push(processes.filter(p => p.initiator === elem).map(p => p.id))
    })

    // find intersections between delegate processes
    let intersectedMap = []
    // check procceses for each deleate
    map.forEach(delegatedProcesses => {
      // skip if delegate has less then 2 processes
      if (delegatedProcesses.length < 2) return

      delegatedProcesses.forEach(elem => {
        let process = processes.find(p => p.id === elem)
        let intersectList = []
        // find intersection against others
        delegatedProcesses.forEach(dP => {
          if (elem === dP) return
          let otherProcess = processes.find(p => p.id === dP)
          let ret = Helper.rangeIntersection({ start: process.start, end: process.mEnd }, { start: otherProcess.start, end: otherProcess.mEnd })
          if (!ret) return // only store intersected processes

          if (intersectList.indexOf(process.id) === -1) intersectList.push(process.id)
          if (intersectList.indexOf(otherProcess.id) === -1) intersectList.push(otherProcess.id)
        })
        if (intersectList.length === 0) return
        intersectedMap.push(intersectList)
      })
    })

    // remove duplicates
    let uniqueList = []
    intersectedMap.forEach(elem => {
      let sortedList = elem.sort()
      let sortedListJoin = sortedList.join()
      if (uniqueList.some(elem => elem.join() === sortedListJoin) === false) uniqueList.push(sortedList)
    })

    // sort by processList
    let sortedList = uniqueList.sort((a, b) => {
      let comparison = 0

      if (processes.indexOf(a) > processes.indexOf(b)) {
        comparison = 1
      } else if (processes.indexOf(b) > processes.indexOf(a)) {
        comparison = -1
      }

      return comparison
    })

    return sortedList
  }

  static updateIntersected (processes, delegates, intersectedMap, containerSize) {
    // get initial values
    let colWidth = Calc.columnSize(containerSize, delegates)
    let processWidth = Calc.processWidth(colWidth)

    // update intersections
    processes.forEach(elem => {
      // check if process is in intersectedList and find maximal intersections of processes
      let list = []
      intersectedMap.forEach(tmpList => {
        if (tmpList.indexOf(elem.id) > -1) { list = tmpList.length > list.length ? tmpList : list }
      })

      // skip this process
      if (list.length < 2) return

      // define padding
      let paddingLeft = 40
      let paddingSum = paddingLeft * (list.length + 1)

      // patch this process
      let newWidth = processWidth // initial width

      // reduce width of all processes until they fit a lane
      while ((newWidth * list.length) > (colWidth - paddingSum)) newWidth = newWidth - 10
      elem._width = newWidth

      // calculate first position to draw the process
      let laneNumber = delegates.indexOf(elem.initiator) + 1
      let center = Math.floor((colWidth * laneNumber) - (colWidth / 2))
      let firstPositionX = center - newWidth * (Math.floor(list.length / 2)) - (list.length - 1) * paddingLeft / 2

      // update position from first position
      let offset = list.length % 2 === 0 ? 0 : Math.floor(newWidth / 2)
      elem._position.x = firstPositionX - offset + newWidth * list.indexOf(elem.id) + list.indexOf(elem.id) * paddingLeft
    })
  }

  static processWidth (colWidth) {
    return Calc.processDynamicWidth === true ? Math.floor(colWidth / 2) : Math.min(Math.floor(colWidth / 2), Calc.processMinWidth)
  }

  static processPositionX (elem, colWidth, laneNumber) {
    let tmpWidth = colWidth / 2
    let processWidth = Calc.processWidth(colWidth)
    let x = Math.floor((colWidth * laneNumber) - (tmpWidth) - (processWidth / 2))

    elem._width = processWidth
    elem._position.x = x
  }

  static processPositionY (elem, startDate, divider) {
    const itemSize = Calc.itemSize
    let deltaStart = elem.start - startDate
    let deltaTime = deltaStart / divider

    let y = Math.ceil(deltaTime * itemSize) + Calc.axisOffset
    elem._position.y = y

    // calc height
    let durationMillis = elem._defaultEndDate - elem.start
    let duration = durationMillis / divider
    elem._height = Math.max(Math.ceil(itemSize * duration), itemSize)
  }

  /**
   * Methode ergänt das Model um Positionsdaten der Elemente, damit diese im Container gezeichnet werden können.
   * @param {Array} processes  Array mit allen Prozessen
   * @param {Array} delegates  Array mit Akteuren
   * @param {Object} containerSize aktuelle Größe des Containers
   * @param {String} timeFormat das aktuell gewählte Zeitformat
   */
  static processPosition (processes, delegates, containerSize, timeFormat) {
    console.warn('processPosition')

    if (typeof processes === 'undefined' || processes instanceof Array === false) {
      console.warn('processPosition: processes are missing')
      return
    }

    if (typeof delegates === 'undefined' || delegates instanceof Array === false) {
      console.warn('processPosition: delegates are missing')
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
    let divider = Calc.getDivider(timeFormat)

    let colWidth = Calc.columnSize(containerSize, delegates)

    processesCopy.forEach(elem => {
      let defaultEndDate = Calc.getDefaultEndDate(elem, timeFormat)
      elem._defaultEndDate = defaultEndDate

      // find workspace lane
      let laneNumber = delegates.indexOf(elem.initiator) + 1

      if (laneNumber === 0) {
        console.warn('Calc.processPosition: Process is not applied to any lane')
      }

      // calc position
      Calc.processPositionY(elem, startProcess.start, divider) // set y position and height
      Calc.processPositionX(elem, colWidth, laneNumber) // set x and width position
    })

    let intersectedMap = Calc.findIntersected(processesCopy, delegates)

    if (intersectedMap.length > 0) {
      Calc.updateIntersected(processesCopy, delegates, intersectedMap, containerSize) // detect overlapping processes and patch width and x position
    }

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
   * @param {Array} processes Kindprozesse des aktuellen Prozesses
   * @param {Number} itemSize Offset-Wert um den verschoben werden soll
   */
  static addSpace (processes, itemSize) {
    if (typeof processes === 'undefined') {
      console.warn('addSpace: processes missing')
      return false
    }

    if (typeof itemSize !== 'number') {
      console.warn('addSpace: itemSize missing')
      return false
    }

    if (processes.length === 0) return true

    if (processes.find(elem => typeof elem._position.y !== 'number')) {
      console.error('addSpace: process needs to have position y value')
      return false
    }

    if (processes.find(elem => typeof elem._height !== 'number')) {
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
          return (startPosition >= endPos) && (startPosition < endPos + itemSize)
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
          if (processes[i]._position.y + processes[i]._height >= endPoint) processes[i]._position.y += itemSize
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
   * @param {Array} children Kindprozesse des aktuellen Prozesses
   */
  static getStartProcess (children) {
    if (children instanceof Array !== true) {
      console.warn('Could not parse startProcess: Processes not available')
      return undefined
    }

    if (children.length === 0) return undefined

    let startProcess = _.minBy(children, elem => elem.start)

    return startProcess
  }

  /**
   * Methode zum Finden des letzten Prozesses
   * @param {Array} children Kindprozesse des aktuellen Prozesses
   */
  static getEndProcess (children) {
    if (children instanceof Array !== true) {
      console.warn('Could not parse endProcess: Processes not available')
      return undefined
    }

    if (children.length === 0) return undefined

    let endProcess = _.maxBy(children, elem => elem.mEnd)
    return endProcess
  }

  /**
   * Methode berechnet die größe des benötigten Containers für Elemente.
   * Zur Berechnung ist es notwendig, dass addElementPosition zuvor aufgerufen wurde.
   * @param {Array} processes  Kindprozesse
   * @param {Array} delegates  Akteure des Prozesses (Initiatoren der Kindprozesse)
   * @param {Boolean} fit  (optional) true/false - fit X-Achse in minContainerSize
   * @see addElementPosition
   */
  static containerSize (processes, delegates, fit) {
    let containerX = 0
    let containerY = 0

    // relative approch
    processes.forEach(function (elem, index) {
      // store x / y for container size
      containerY = Math.max(containerY, elem._position.y + elem._height + Calc.containerPaddingBottom)
    })

    // easy approch
    containerX = fit === true ? Calc.minContainerWidth : delegates.length * Calc.colWidth

    containerY = Math.max(containerY, Calc.minContainerHeight)
    containerX = Math.max(containerX, Calc.minContainerWidth)

    console.log('containerSize', { x: containerX, y: containerY })
    // return containerSize
    return { x: containerX, y: containerY }
  }
}

Calc.itemSize = 60
Calc.minContainerHeight = 600
Calc.minContainerWidth = 800
Calc.colWidth = 400
Calc.processDynamicWidth = false
Calc.processMinWidth = 100
Calc.containerPaddingBottom = 100
Calc.axisOffset = 40
Calc.timeFormats = {
  'hours': 1000 * 60 * 60,
  'days': 1000 * 60 * 60 * 24,
  'months': 1000 * 60 * 60 * 24 * 30
}
