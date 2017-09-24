import { _ } from 'underscore'
import { Process } from '@/classes/model/Process'
import { Calc } from '@/classes/utils/Calc'

require('es6-shim') // for non supported browsers like phantom.js

describe('Calc.js (getDefaultEndDate)', () => {
  it('should calc return enddate correctly', () => {
    let process = new Process('head', 1, new Date(2017, 0, 1), new Date(2017, 0, 2))
    let ret = Calc.getDefaultEndDate(process, '')
    expect(ret instanceof Date).to.equal(true)
    expect(ret.getTime()).to.equal(new Date(2017, 0, 2).getTime())
  })

  it('should calc missing enddate correctly', () => {
    let process = new Process('head', 1, new Date(2017, 0, 1), null)
    let timeFormats = [ 'hours', 'days', 'months' ]

    let retA = Calc.getDefaultEndDate(process, timeFormats[0])
    expect(retA instanceof Date).to.equal(true)
    expect(retA.getTime()).to.equal(new Date(2017, 0, 1, 1, 0, 0, 0).getTime())

    let retB = Calc.getDefaultEndDate(process, timeFormats[1])
    expect(retB instanceof Date).to.equal(true)
    expect(retB.getTime()).to.equal(new Date(2017, 0, 2).getTime())

    let retC = Calc.getDefaultEndDate(process, timeFormats[2])
    expect(retC instanceof Date).to.equal(true)
    expect(retC.getTime()).to.equal(new Date(2017, 1, 1).getTime())
  })
})

describe('Calc.js (containerSize)', () => {
  it('should calc correctly (non fit)', () => {
    let childs = [
      { _position: { x: 0, y: 0 }, _height: 100 },
      { _position: { x: 0, y: 500 }, _height: 100 },
      { _position: { x: 0, y: 600 }, _height: 100 },
      { _position: { x: 0, y: 300 }, _height: 100 }
    ]
    let participants = [1, 2, 3, 4]
    let ret = Calc.containerSize(childs, participants)

    let maxElem = _.max(childs, elem => elem._height)
    expect(ret).to.be.an('object')
    expect(ret.x).to.equal(Calc.colWidth * participants.length)
    expect(ret.y).to.equal(600 + Calc.containerPaddingBottom + maxElem._height)
  })

  it('should calc correctly (x axis fit)', () => {
    let childs = [
      { _position: { x: 0, y: 0 }, _height: 100 },
      { _position: { x: 0, y: 500 }, _height: 100 },
      { _position: { x: 0, y: 600 }, _height: 100 },
      { _position: { x: 0, y: 300 }, _height: 100 }
    ]
    let participants = [1, 2, 3, 4]
    let ret = Calc.containerSize(childs, participants, true)

    let maxElem = _.max(childs, elem => elem._height)
    expect(ret).to.be.an('object')
    expect(ret.x).to.equal(Calc.minContainerWidth)
    expect(ret.y).to.equal(600 + Calc.containerPaddingBottom + maxElem._height)
  })

  it('should calc respect minHeight and maxHeight', () => {
    let childs = [
      { _position: { x: 0, y: 0 }, _height: 100 }
    ]
    let participants = [1]
    let ret = Calc.containerSize(childs, participants)
    expect(ret).to.be.an('object')
    expect(ret.x).to.equal(Calc.minContainerWidth)
    expect(ret.y).to.equal(Calc.minContainerHeight)
  })
})

describe('Calc.js (columnSize)', () => {
  it('should calc correctly', () => {
    let columnsize = { x: 100, y: 100 }
    let participants = [1, 2, 3, 4]
    let ret = Calc.columnSize(columnsize, participants)
    expect(ret).to.equal(25)
  })

  it('should calc round correctly', () => {
    let columnsize = { x: 100, y: 100 }
    let participants = [1, 2, 3]
    let ret = Calc.columnSize(columnsize, participants)
    expect(ret).to.equal(33)
  })

  it('should not crash on missing param 1', () => {
    let columnsize
    let participants = [1, 2, 3, 4]
    let ret = Calc.columnSize(columnsize, participants)
    expect(ret).to.equal(0)
  })

  it('should not crash on missing param 2', () => {
    let columnsize = { x: 100, y: 100 }
    let participants
    let ret = Calc.columnSize(columnsize, participants)
    expect(ret).to.equal(0)
  })
})

describe('Calc.js (getStartProcess)', () => {
  it('should return process with oldest startDate', () => {
    const childs = [
      new Process('1', '1', new Date(2017, 2, 11)),
      new Process('1', '1', new Date(2017, 2, 13)),
      new Process('1', '1', new Date(2017, 2, 7)),
      new Process('1', '1', new Date(2017, 3, 4))
    ]

    let ret = Calc.getStartProcess(childs)
    expect(ret).to.be.an('object')
    expect(ret).to.equal(childs[2])
  })

  it('should return the first date if both start at the same time', () => {
    const childs = [
      new Process('1', '1', new Date(2017, 2, 12)),
      new Process('1', '1', new Date(2017, 2, 11)),
      new Process('1', '1', new Date(2017, 2, 11)),
      new Process('1', '1', new Date(2017, 3, 11))
    ]
    let ret = Calc.getStartProcess(childs)
    expect(ret).to.be.an('object')
    expect(ret).to.equal(childs[1])
  })

  it('should return no process', () => {
    expect(Calc.getStartProcess([])).to.be.an('undefined')
    expect(Calc.getStartProcess()).to.be.an('undefined')
  })
})

describe('Calc.js (getEndProcess)', () => {
  it('should return process with latest endDate', () => {
    const childs = [
      new Process('1', '1', new Date(2017, 0, 1), new Date(2017, 0, 1)),
      new Process('1', '1', new Date(2017, 0, 1), new Date(2017, 0, 2)),
      new Process('1', '1', new Date(2017, 0, 1))
    ]

    let ret = Calc.getEndProcess(childs)
    expect(ret).to.be.an('object')
    expect(ret).to.equal(childs[1])
  })

  it('should return the first date if both end at the same time', () => {
    const childs = [
      new Process('1', '1', new Date(2017, 0, 1), new Date(2017, 0, 1)),
      new Process('2', '1', new Date(2017, 0, 1), new Date(2017, 0, 2)),
      new Process('3', '1', new Date(2017, 0, 1), new Date(2017, 0, 2)),
      new Process('4', '1', new Date(2017, 0, 1))
    ]

    let ret = Calc.getEndProcess(childs)
    expect(ret).to.be.an('object')
    expect(ret).to.equal(childs[1])
  })

  it('should return no process', () => {
    expect(Calc.getEndProcess([])).to.be.an('undefined')
    expect(Calc.getEndProcess()).to.be.an('undefined')
  })
})

describe('Calc.js (updateEndDate)', () => {
  it('should update date', () => {
    let process = new Process('1', '1', new Date(2017, 0, 1), new Date(2017, 0, 2))

    let dateBefore = process.mEnd
    Calc.updateEndDate(process, 2)

    // add one day
    let newDate = new Date(dateBefore)
    newDate.setDate(newDate.getDate() + 1)
    expect(process.mEnd.valueOf()).to.be.equal(newDate.valueOf())

    let dateBefore2 = process.mEnd
    Calc.updateEndDate(process, 0.5)
    let newDate2 = new Date(dateBefore2)
    newDate2.setDate(newDate2.getDate() - 1)
    expect(process.mEnd.valueOf()).to.be.equal(newDate2.valueOf())
  })

  it('should not update date', () => {
    let process = new Process('1', '1', new Date(2017, 0, 1), new Date(2017, 0, 2))
    let dateBefore = process.mEnd.valueOf()
    Calc.updateEndDate(process)
    let dateAfter = process.mEnd.valueOf()

    expect(dateBefore).to.be.equal(dateAfter)
  })

  it('should not update date without endDate', () => {
    let process = new Process('1', '1', new Date(2017, 0, 1))

    let dateBefore = process.mEnd

    Calc.updateEndDate(process, 2)

    // add one day
    let dateAfter = process.mEnd
    expect(dateBefore.valueOf()).to.be.equal(dateAfter.valueOf())
  })

  it('should update duration', () => {
    let process = new Process('1', '1', new Date(2017, 0, 1), new Date(2017, 0, 2))

    let durationBefore = process.mDuration
    Calc.updateEndDate(process, 2)
    expect(process.mDuration).to.be.above(0)
    expect(process.mDuration).to.be.equal(2 * durationBefore)

    let durationBefore2 = process.mDuration
    Calc.updateEndDate(process, 0.5)
    expect(process.mDuration).to.be.above(0)
    expect(process.mDuration).to.be.equal(0.5 * durationBefore2)
  })

  it('should not update date without endDate', () => {
    let process = new Process('1', '1', new Date(2017, 0, 1))
    let durationBefore = process.mDuration
    Calc.updateEndDate(process, 2)
    let durationAfter = process.mDuration
    expect(durationBefore).to.be.equal(durationAfter)
  })
})

describe('Calc.js (getDivider)', () => {
  it('should return 1 for wrong format', () => {
    expect(Calc.getDivider()).to.equal(1)
    expect(Calc.getDivider('test')).to.equal(1)
    expect(Calc.getDivider(null)).to.equal(1)
  })

  it('should return correct divider', () => {
    expect(Object.keys(Calc.timeFormats).length).to.equal(3)
    const formats = Object.keys(Calc.timeFormats)
    formats.forEach(format => {
      let divider = Calc.getDivider(format)
      expect(divider).to.be.a('number')
      expect(divider).to.be.above(0)
      expect(divider).to.equal(Calc.timeFormats[format])
    })
  })
})

describe('Calc.js (addSpace)', () => {
  it('should not add space', () => {
    const participants = ['1', '2', '3', '4']

    const childs = [
      new Process('1', participants[0], new Date(2017, 0, 1)),
      new Process('1', participants[1], new Date(2017, 0, 2)),
      new Process('1', participants[2], new Date(2017, 0, 2))
    ]

    childs[0]._height = 100
    childs[0]._position = { x: 0, y: 0 }

    childs[1]._height = 100
    childs[1]._position = { x: 0, y: 200 }

    childs[2]._height = 100
    childs[2]._position = { x: 0, y: 200 }

    const clone = require('clone')
    const childsCopy = clone(childs)

    let wasSuccessful = Calc.addSpace(childs, Calc.timeSlice)
    let isEqual = _.isEqual(childs, childsCopy)

    expect(wasSuccessful).to.equal(true)
    expect(isEqual).to.equal(true)
  })

  it('should add space to one', () => {
    const participants = ['1', '2']

    const childs = [
      new Process('1', participants[0], new Date(2017, 0, 1)),
      new Process('1', participants[1], new Date(2017, 0, 1))
    ]

    childs[0]._height = 100
    childs[0]._position = { x: 0, y: 0 }

    childs[1]._height = 100
    childs[1]._position = { x: 0, y: 100 }

    const clone = require('clone')
    const childsCopy = clone(childs)

    let wasSuccessful = Calc.addSpace(childs, Calc.timeSlice)
    let isEqual = _.isEqual(childs, childsCopy)

    expect(wasSuccessful).to.equal(true)
    expect(isEqual).to.equal(false)

    expect(childs[0]._position.y).to.equal(childsCopy[0]._position.y)
    expect(childs[1]._position.y).to.equal(childsCopy[1]._position.y + Calc.timeSlice)
  })

  it('should add space to the first and second', () => {
    const participants = ['1', '2', '3']

    const childs = [
      new Process('1', participants[0], new Date(2017, 0, 1)),
      new Process('1', participants[1], new Date(2017, 0, 1)),
      new Process('1', participants[2], new Date(2017, 0, 1))
    ]

    childs[0]._height = 100
    childs[0]._position = { x: 0, y: 0 }

    childs[1]._height = 100
    childs[1]._position = { x: 0, y: 100 }

    childs[2]._height = 100
    childs[2]._position = { x: 0, y: 100 }

    const clone = require('clone')
    const childsCopy = clone(childs)

    let wasSuccessful = Calc.addSpace(childs, Calc.timeSlice)
    let isEqual = _.isEqual(childs, childsCopy)

    expect(wasSuccessful).to.equal(true)
    expect(isEqual).to.equal(false)

    expect(childs[0]._position.y).to.equal(childsCopy[0]._position.y)
    expect(childs[1]._position.y).to.equal(childsCopy[1]._position.y + Calc.timeSlice)
    expect(childs[2]._position.y).to.equal(childsCopy[2]._position.y + Calc.timeSlice)
  })

  it('should add space to the first and twice to the second', () => {
    const participants = ['1', '2', '3']

    const childs = [
      new Process('1', participants[0], new Date(2017, 0, 1)),
      new Process('1', participants[1], new Date(2017, 0, 1)),
      new Process('1', participants[2], new Date(2017, 0, 1))
    ]

    childs[0]._height = 100
    childs[0]._position = { x: 0, y: 0 }

    childs[1]._height = 100
    childs[1]._position = { x: 0, y: 100 }

    childs[2]._height = 100
    childs[2]._position = { x: 0, y: 200 }

    const clone = require('clone')
    const childsCopy = clone(childs)

    let wasSuccessful = Calc.addSpace(childs, Calc.timeSlice)
    let isEqual = _.isEqual(childs, childsCopy)

    expect(wasSuccessful).to.equal(true)
    expect(isEqual).to.equal(false)

    expect(childs[0]._position.y).to.equal(childsCopy[0]._position.y)
    expect(childs[1]._position.y).to.equal(childsCopy[1]._position.y + Calc.timeSlice)
    expect(childs[2]._position.y).to.equal(childsCopy[2]._position.y + Calc.timeSlice * 2)
  })

  it('should add space to the first and twice to the second and third', () => {
    const participants = ['1', '2', '3']

    const childs = [
      new Process('1', participants[0], new Date(2017, 0, 1)),
      new Process('1', participants[1], new Date(2017, 0, 2)),
      new Process('1', participants[2], new Date(2017, 0, 3)),
      new Process('1', participants[3], new Date(2017, 0, 3))
    ]

    childs[0]._height = 100
    childs[0]._position = { x: 0, y: 0 }

    childs[1]._height = 100
    childs[1]._position = { x: 0, y: 100 }

    childs[2]._height = 100
    childs[2]._position = { x: 0, y: 200 }

    childs[3]._height = 100
    childs[3]._position = { x: 0, y: 200 }

    const clone = require('clone')
    const childsCopy = clone(childs)

    let wasSuccessful = Calc.addSpace(childs, Calc.timeSlice)
    let isEqual = _.isEqual(childs, childsCopy)

    expect(wasSuccessful).to.equal(true)
    expect(isEqual).to.equal(false)

    expect(childs[0]._position.y).to.equal(childsCopy[0]._position.y)
    expect(childs[1]._position.y).to.equal(childsCopy[1]._position.y + Calc.timeSlice)
    expect(childs[2]._position.y).to.equal(childsCopy[2]._position.y + Calc.timeSlice * 2)
    expect(childs[3]._position.y).to.equal(childsCopy[3]._position.y + Calc.timeSlice * 2)
  })
})

describe('Calc.js (processPosition)', () => {
  const clone = require('clone')

  const participants = ['1', '2', '3', '4']
  const childsUntouched = [
    new Process('1', participants[0], new Date(2017, 0, 1)),
    new Process('1', participants[1], new Date(2017, 0, 4)),
    new Process('1', participants[2], new Date(2017, 0, 7)),
    new Process('1', participants[3], new Date(2017, 0, 10))
  ]

  const containerSize = { x: Calc.minContainerWidth, y: Calc.minContainerHeight }
  const timeFormat = 'days'

  it('should not add private properties', () => {
    const childs = clone(childsUntouched)
    Calc.processPosition(undefined, childsUntouched, containerSize, timeFormat)
    expect(_.isEqual(childs, childsUntouched)).to.equal(true)
    Calc.processPosition(childs, undefined, containerSize, timeFormat)
    expect(_.isEqual(childs, childsUntouched)).to.equal(true)
    Calc.processPosition(childs, participants, undefined, timeFormat)
    expect(_.isEqual(childs, childsUntouched)).to.equal(true)
    Calc.processPosition(childs, participants, containerSize, undefined)
    expect(_.isEqual(childs, childsUntouched)).to.equal(true)
  })

  it('should add private properties', () => {
    const childs = clone(childsUntouched)
    Calc.processPosition(childs, participants, containerSize, timeFormat)
    expect(childs).to.be.an('array')
    expect(childs.length).to.equal(4)
    expect(_.isEqual(childs, childsUntouched)).to.equal(false)

    childs.forEach(elem => {
      expect(elem).to.have.property('_defaultEndDate')
      expect(elem._defaultEndDate).to.be.an('date')

      expect(elem).to.have.property('_width')
      expect(elem._width).to.be.a('number')
      expect(elem._width).to.be.above(0)

      expect(elem).to.have.property('_height')
      expect(elem._height).to.be.a('number')
      expect(elem._height).to.be.above(0)

      expect(elem).to.have.property('_position')
      expect(elem._position).to.have.property('x')
      expect(elem._position.x).to.be.a('number')
      expect(elem._position.x).to.be.above(0)

      expect(elem._position).to.have.property('y')
      expect(elem._position.y).to.be.a('number')
      expect(elem._position.y).to.be.above(0)
    })
  })

  it('should calculate position x', () => {
    const childs = clone(childsUntouched)
    Calc.processPosition(childs, participants, containerSize, timeFormat)
    const colWidth = Calc.columnSize(containerSize, participants)

    childs.forEach(elem => {
      expect(elem).to.have.property('_position')
      expect(elem._position).to.have.property('x')
      expect(elem._position.x).to.be.a('number')
      expect(elem._position.x).to.be.above(0)
      let laneNumber = participants.indexOf(elem.initiator) + 1
      let x = Math.floor((colWidth * laneNumber) - (colWidth / 2) - (elem._width / 2))
      expect(elem._position.x).to.equal(x)
    })
  })

  it('should calculate position y', () => {
    const childs = clone(childsUntouched)
    Calc.processPosition(childs, participants, containerSize, timeFormat)
    let startProcess = Calc.getStartProcess(childs)

    childs.forEach(elem => {
      expect(elem.start).to.be.an('date')
      expect(startProcess.start).to.be.an('date')

      expect(elem).to.have.property('_position')
      expect(elem._position).to.have.property('y')
      expect(elem._position.x).to.be.a('number')
      expect(elem._position.x).to.be.above(0)

      let divider = Calc.getDivider(timeFormat)
      expect(divider).to.not.equal(0)
      let deltaStart = elem.start - startProcess.start
      expect(deltaStart).to.be.a('number')
      let deltaTime = deltaStart / divider
      let y = Math.ceil(deltaTime * Calc.timeSlice) + Calc.axisOffset
      expect(elem._position.y).to.equal(y)
    })
  })

  it('should calculate height without endDate', () => {
    const participants = ['1', '2', '3']
    const childs = [
      new Process('1', participants[0], new Date(2017, 0, 1))
    ]

    Calc.processPosition(childs, participants, containerSize, timeFormat)

    let elem = childs[0]
    expect(elem._height).to.equal(Calc.timeSlice)
  })

  it('should calculate height with endDate', () => {
    const participants = ['1', '2', '3']
    const childs = [
      new Process('1', participants[1], new Date(2017, 0, 4), new Date(2017, 0, 5)),
      new Process('1', participants[2], new Date(2017, 1, 4), new Date(2017, 1, 6))
    ]

    Calc.processPosition(childs, participants, containerSize, timeFormat)

    let elem

    elem = childs[0]
    expect(elem._height).to.equal(Calc.timeSlice)

    elem = childs[1]
    expect(elem._height).to.equal(Calc.timeSlice * 2)
  })
})
