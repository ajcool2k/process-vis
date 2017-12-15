import { Process } from '@/classes/model/Process'
import { Calc } from '@/classes/utils/Calc'

const _ = require('lodash')
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
    let children = [
      { _position: { x: 0, y: 0 }, _height: 100 },
      { _position: { x: 0, y: 500 }, _height: 100 },
      { _position: { x: 0, y: 600 }, _height: 100 },
      { _position: { x: 0, y: 300 }, _height: 100 }
    ]
    let delegates = [1, 2, 3, 4]
    let ret = Calc.containerSize(children, delegates)

    let maxElem = _.maxBy(children, elem => elem._height)
    expect(ret).to.be.an('object')
    expect(ret.x).to.equal(Calc.colWidth * delegates.length)
    expect(ret.y).to.equal(600 + Calc.containerPaddingBottom + maxElem._height)
  })

  it('should calc correctly (x axis fit)', () => {
    let children = [
      { _position: { x: 0, y: 0 }, _height: 100 },
      { _position: { x: 0, y: 500 }, _height: 100 },
      { _position: { x: 0, y: 600 }, _height: 100 },
      { _position: { x: 0, y: 300 }, _height: 100 }
    ]
    let delegates = [1, 2, 3, 4]
    let ret = Calc.containerSize(children, delegates, true)

    let maxElem = _.maxBy(children, elem => elem._height)
    expect(ret).to.be.an('object')
    expect(ret.x).to.equal(Calc.minContainerWidth)
    expect(ret.y).to.equal(600 + Calc.containerPaddingBottom + maxElem._height)
  })

  it('should calc respect minHeight and maxHeight', () => {
    let children = [
      { _position: { x: 0, y: 0 }, _height: 100 }
    ]
    let delegates = [1]
    let ret = Calc.containerSize(children, delegates)
    expect(ret).to.be.an('object')
    expect(ret.x).to.equal(Calc.minContainerWidth)
    expect(ret.y).to.equal(Calc.minContainerHeight)
  })
})

describe('Calc.js (columnSize)', () => {
  it('should calc correctly', () => {
    let columnsize = { x: 100, y: 100 }
    let delegates = [1, 2, 3, 4]
    let ret = Calc.columnSize(columnsize, delegates)
    expect(ret).to.equal(25)
  })

  it('should calc round correctly', () => {
    let columnsize = { x: 100, y: 100 }
    let delegates = [1, 2, 3]
    let ret = Calc.columnSize(columnsize, delegates)
    expect(ret).to.equal(33)
  })

  it('should not crash on missing param 1', () => {
    let columnsize
    let delegates = [1, 2, 3, 4]
    let ret = Calc.columnSize(columnsize, delegates)
    expect(ret).to.equal(0)
  })

  it('should not crash on missing param 2', () => {
    let columnsize = { x: 100, y: 100 }
    let delegates
    let ret = Calc.columnSize(columnsize, delegates)
    expect(ret).to.equal(0)
  })
})

describe('Calc.js (getStartProcess)', () => {
  it('should return process with oldest startDate', () => {
    const children = [
      new Process('1', '1', new Date(2017, 2, 11)),
      new Process('1', '1', new Date(2017, 2, 13)),
      new Process('1', '1', new Date(2017, 2, 7)),
      new Process('1', '1', new Date(2017, 3, 4))
    ]

    let ret = Calc.getStartProcess(children)
    expect(ret).to.be.an('object')
    expect(ret).to.equal(children[2])
  })

  it('should return the first date if both start at the same time', () => {
    const children = [
      new Process('1', '1', new Date(2017, 2, 12)),
      new Process('1', '1', new Date(2017, 2, 11)),
      new Process('1', '1', new Date(2017, 2, 11)),
      new Process('1', '1', new Date(2017, 3, 11))
    ]
    let ret = Calc.getStartProcess(children)
    expect(ret).to.be.an('object')
    expect(ret).to.equal(children[1])
  })

  it('should return no process', () => {
    expect(Calc.getStartProcess([])).to.be.an('undefined')
    expect(Calc.getStartProcess()).to.be.an('undefined')
  })
})

describe('Calc.js (getEndProcess)', () => {
  it('should return process with latest endDate', () => {
    const children = [
      new Process('1', '1', new Date(2017, 0, 1), new Date(2017, 0, 1)),
      new Process('1', '1', new Date(2017, 0, 1), new Date(2017, 0, 2)),
      new Process('1', '1', new Date(2017, 0, 1))
    ]

    let ret = Calc.getEndProcess(children)
    expect(ret).to.be.an('object')
    expect(ret).to.equal(children[1])
  })

  it('should return the first date if both end at the same time', () => {
    const children = [
      new Process('1', '1', new Date(2017, 0, 1), new Date(2017, 0, 1)),
      new Process('2', '1', new Date(2017, 0, 1), new Date(2017, 0, 2)),
      new Process('3', '1', new Date(2017, 0, 1), new Date(2017, 0, 2)),
      new Process('4', '1', new Date(2017, 0, 1))
    ]

    let ret = Calc.getEndProcess(children)
    expect(ret).to.be.an('object')
    expect(ret).to.equal(children[1])
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
    const delegates = ['1', '2', '3', '4']

    const children = [
      new Process('1', delegates[0], new Date(2017, 0, 1)),
      new Process('1', delegates[1], new Date(2017, 0, 2)),
      new Process('1', delegates[2], new Date(2017, 0, 2))
    ]

    children[0]._height = 100
    children[0]._position = { x: 0, y: 0 }

    children[1]._height = 100
    children[1]._position = { x: 0, y: 200 }

    children[2]._height = 100
    children[2]._position = { x: 0, y: 200 }

    const clone = require('clone')
    const childrenCopy = clone(children)

    let wasSuccessful = Calc.addSpace(children, Calc.itemSize)
    let isEqual = _.isEqual(children, childrenCopy)

    expect(wasSuccessful).to.equal(true)
    expect(isEqual).to.equal(true)
  })

  it('should add space to one', () => {
    const delegates = ['1', '2']

    const children = [
      new Process('1', delegates[0], new Date(2017, 0, 1)),
      new Process('1', delegates[1], new Date(2017, 0, 1))
    ]

    children[0]._height = 100
    children[0]._position = { x: 0, y: 0 }

    children[1]._height = 100
    children[1]._position = { x: 0, y: 100 }

    const clone = require('clone')
    const childrenCopy = clone(children)

    let wasSuccessful = Calc.addSpace(children, Calc.itemSize)
    let isEqual = _.isEqual(children, childrenCopy)

    expect(wasSuccessful).to.equal(true)
    expect(isEqual).to.equal(false)

    expect(children[0]._position.y).to.equal(childrenCopy[0]._position.y)
    expect(children[1]._position.y).to.equal(childrenCopy[1]._position.y + Calc.itemSize)
  })

  it('should add space to the first and second', () => {
    const delegates = ['1', '2', '3']

    const children = [
      new Process('1', delegates[0], new Date(2017, 0, 1)),
      new Process('1', delegates[1], new Date(2017, 0, 1)),
      new Process('1', delegates[2], new Date(2017, 0, 1))
    ]

    children[0]._height = 100
    children[0]._position = { x: 0, y: 0 }

    children[1]._height = 100
    children[1]._position = { x: 0, y: 100 }

    children[2]._height = 100
    children[2]._position = { x: 0, y: 100 }

    const clone = require('clone')
    const childrenCopy = clone(children)

    let wasSuccessful = Calc.addSpace(children, Calc.itemSize)
    let isEqual = _.isEqual(children, childrenCopy)

    expect(wasSuccessful).to.equal(true)
    expect(isEqual).to.equal(false)

    expect(children[0]._position.y).to.equal(childrenCopy[0]._position.y)
    expect(children[1]._position.y).to.equal(childrenCopy[1]._position.y + Calc.itemSize)
    expect(children[2]._position.y).to.equal(childrenCopy[2]._position.y + Calc.itemSize)
  })

  it('should add space to the first and twice to the second', () => {
    const delegates = ['1', '2', '3']

    const children = [
      new Process('1', delegates[0], new Date(2017, 0, 1)),
      new Process('1', delegates[1], new Date(2017, 0, 1)),
      new Process('1', delegates[2], new Date(2017, 0, 1))
    ]

    children[0]._height = 100
    children[0]._position = { x: 0, y: 0 }

    children[1]._height = 100
    children[1]._position = { x: 0, y: 100 }

    children[2]._height = 100
    children[2]._position = { x: 0, y: 200 }

    const clone = require('clone')
    const childrenCopy = clone(children)

    let wasSuccessful = Calc.addSpace(children, Calc.itemSize)
    let isEqual = _.isEqual(children, childrenCopy)

    expect(wasSuccessful).to.equal(true)
    expect(isEqual).to.equal(false)

    expect(children[0]._position.y).to.equal(childrenCopy[0]._position.y)
    expect(children[1]._position.y).to.equal(childrenCopy[1]._position.y + Calc.itemSize)
    expect(children[2]._position.y).to.equal(childrenCopy[2]._position.y + Calc.itemSize * 2)
  })

  it('should add space to the first and twice to the second and third', () => {
    const delegates = ['1', '2', '3']

    const children = [
      new Process('1', delegates[0], new Date(2017, 0, 1)),
      new Process('1', delegates[1], new Date(2017, 0, 2)),
      new Process('1', delegates[2], new Date(2017, 0, 3)),
      new Process('1', delegates[3], new Date(2017, 0, 3))
    ]

    children[0]._height = 100
    children[0]._position = { x: 0, y: 0 }

    children[1]._height = 100
    children[1]._position = { x: 0, y: 100 }

    children[2]._height = 100
    children[2]._position = { x: 0, y: 200 }

    children[3]._height = 100
    children[3]._position = { x: 0, y: 200 }

    const clone = require('clone')
    const childrenCopy = clone(children)

    let wasSuccessful = Calc.addSpace(children, Calc.itemSize)
    let isEqual = _.isEqual(children, childrenCopy)

    expect(wasSuccessful).to.equal(true)
    expect(isEqual).to.equal(false)

    expect(children[0]._position.y).to.equal(childrenCopy[0]._position.y)
    expect(children[1]._position.y).to.equal(childrenCopy[1]._position.y + Calc.itemSize)
    expect(children[2]._position.y).to.equal(childrenCopy[2]._position.y + Calc.itemSize * 2)
    expect(children[3]._position.y).to.equal(childrenCopy[3]._position.y + Calc.itemSize * 2)
  })
})

describe('Calc.js (processPosition)', () => {
  const clone = require('clone')

  const delegates = ['1', '2', '3', '4']
  const childrenUntouched = [
    new Process('1', delegates[0], new Date(2017, 0, 1)),
    new Process('1', delegates[1], new Date(2017, 0, 4)),
    new Process('1', delegates[2], new Date(2017, 0, 7)),
    new Process('1', delegates[3], new Date(2017, 0, 10))
  ]

  const containerSize = { x: Calc.minContainerWidth, y: Calc.minContainerHeight }
  const timeFormat = 'days'

  it('should not add private properties', () => {
    const children = clone(childrenUntouched)
    Calc.processPosition(undefined, childrenUntouched, containerSize, timeFormat)
    expect(_.isEqual(children, childrenUntouched)).to.equal(true)
    Calc.processPosition(children, undefined, containerSize, timeFormat)
    expect(_.isEqual(children, childrenUntouched)).to.equal(true)
    Calc.processPosition(children, delegates, undefined, timeFormat)
    expect(_.isEqual(children, childrenUntouched)).to.equal(true)
    Calc.processPosition(children, delegates, containerSize, undefined)
    expect(_.isEqual(children, childrenUntouched)).to.equal(true)
  })

  it('should add private properties', () => {
    const children = clone(childrenUntouched)
    Calc.processPosition(children, delegates, containerSize, timeFormat)
    expect(children).to.be.an('array')
    expect(children.length).to.equal(4)
    expect(_.isEqual(children, childrenUntouched)).to.equal(false)

    children.forEach(elem => {
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
    const children = clone(childrenUntouched)
    Calc.processPosition(children, delegates, containerSize, timeFormat)
    const colWidth = Calc.columnSize(containerSize, delegates)

    children.forEach(elem => {
      expect(elem).to.have.property('_position')
      expect(elem._position).to.have.property('x')
      expect(elem._position.x).to.be.a('number')
      expect(elem._position.x).to.be.above(0)
      let laneNumber = delegates.indexOf(elem.initiator) + 1
      let x = Math.floor((colWidth * laneNumber) - (colWidth / 2) - (elem._width / 2))
      expect(elem._position.x).to.equal(x)
    })
  })

  it('should calculate position y', () => {
    const children = clone(childrenUntouched)
    Calc.processPosition(children, delegates, containerSize, timeFormat)
    let startProcess = Calc.getStartProcess(children)

    children.forEach(elem => {
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
      let y = Math.ceil(deltaTime * Calc.itemSize) + Calc.axisOffset
      expect(elem._position.y).to.equal(y)
    })
  })

  it('should calculate height without endDate', () => {
    const delegates = ['1', '2', '3']
    const children = [
      new Process('1', delegates[0], new Date(2017, 0, 1))
    ]

    Calc.processPosition(children, delegates, containerSize, timeFormat)

    let elem = children[0]
    expect(elem._height).to.equal(Calc.itemSize)
  })

  it('should calculate height with endDate', () => {
    const delegates = ['1', '2', '3']
    const children = [
      new Process('1', delegates[1], new Date(2017, 0, 4), new Date(2017, 0, 5)),
      new Process('1', delegates[2], new Date(2017, 1, 4), new Date(2017, 1, 6))
    ]

    Calc.processPosition(children, delegates, containerSize, timeFormat)

    let elem

    elem = children[0]
    expect(elem._height).to.equal(Calc.itemSize)

    elem = children[1]
    expect(elem._height).to.equal(Calc.itemSize * 2)
  })
})

describe('Calc.js (Intersections)', () => {
  const delegates = ['1', '2']
  const children = [
    new Process('1', delegates[0], new Date(2017, 0, 1), new Date(2017, 0, 8)), // this
    new Process('1', delegates[0], new Date(2017, 0, 4), new Date(2017, 0, 5)), // and this
    new Process('1', delegates[0], new Date(2017, 0, 9), new Date(2017, 0, 10)),

    new Process('1', delegates[1], new Date(2017, 0, 4))
  ]

  it('should find intersetionList', () => {
    let intersectedMap = Calc.findIntersected(children, delegates)
    expect(intersectedMap.length).to.equal(1)

    let entry = [ children[0].id, children[1].id ].sort().join()
    expect(intersectedMap[0].join()).to.equal(entry)

    // reverse
    let reverseChildren = children.reverse()
    let intersectedMap2 = Calc.findIntersected(reverseChildren, delegates)
    expect(intersectedMap2.length).to.equal(1)

    let reverseEntry = [ reverseChildren[2].id, reverseChildren[3].id ].sort().join()
    expect(intersectedMap2[0].join()).to.equal(reverseEntry)
  })
})
