import { _ } from 'underscore'
import { Process } from '@/classes/model/Process'
import { Calc } from '@/classes/utils/Calc'

describe('Calc.js (getEndDate)', () => {
  it('should calc return enddate correctly', () => {
    let process = new Process('head', 1, new Date(2017, 0, 1), new Date(2017, 0, 2), true)
    let ret = Calc.getEndDate(process, '')
    expect(ret instanceof Date).to.equal(true)
    expect(ret.getTime()).to.equal(new Date(2017, 0, 2).getTime())
  })

  it('should calc missing enddate correctly', () => {
    let process = new Process('head', 1, new Date(2017, 0, 1), null, true)
    let timeFormats = [ 'hours', 'days', 'months' ]

    let retA = Calc.getEndDate(process, timeFormats[0])
    expect(retA instanceof Date).to.equal(true)
    expect(retA.getTime()).to.equal(new Date(2017, 0, 1, 1, 0, 0, 0).getTime())

    let retB = Calc.getEndDate(process, timeFormats[1])
    expect(retB instanceof Date).to.equal(true)
    expect(retB.getTime()).to.equal(new Date(2017, 0, 2).getTime())

    let retC = Calc.getEndDate(process, timeFormats[2])
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
