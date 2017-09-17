import { _ } from 'underscore'
import { Process } from '@/classes/model/Process'
import { Calc } from '@/classes/utils/Calc'

describe('Calc.js (getDefaultEndDate)', () => {
  it('should calc return enddate correctly', () => {
    let process = new Process('head', 1, new Date(2017, 0, 1), new Date(2017, 0, 2), true)
    let ret = Calc.getDefaultEndDate(process, '')
    expect(ret instanceof Date).to.equal(true)
    expect(ret.getTime()).to.equal(new Date(2017, 0, 2).getTime())
  })

  it('should calc missing enddate correctly', () => {
    let process = new Process('head', 1, new Date(2017, 0, 1), null, true)
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
  it('should calc correctly', () => {
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
