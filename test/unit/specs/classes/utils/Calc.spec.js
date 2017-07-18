import { Process } from '@/classes/Process'
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
    let nodes = [
      { position: { x: 0, y: 0 } },
      { position: { x: 0, y: 500 } },
      { position: { x: 0, y: 600 } },
      { position: { x: 0, y: 300 } }
    ]
    let cols = [1, 2, 3, 4]
    let ret = Calc.containerSize(nodes, cols)

    expect(ret).to.be.an('object')
    expect(ret.x).to.equal(Calc.colWidth * cols.length)
    expect(ret.y).to.equal(600 + Calc.containerPaddingBottom)
  })
})

describe('Calc.js (columnSize)', () => {
  it('should calc correctly', () => {
    let columnsize = { x: 100, y: 100 }
    let cols = [1, 2, 3, 4]
    let ret = Calc.columnSize(columnsize, cols)
    expect(ret).to.equal(25)
  })

  it('should calc round correctly', () => {
    let columnsize = { x: 100, y: 100 }
    let cols = [1, 2, 3]
    let ret = Calc.columnSize(columnsize, cols)
    expect(ret).to.equal(33)
  })

  it('should not crash on missing param 1', () => {
    let columnsize
    let cols = [1, 2, 3, 4]
    let ret = Calc.columnSize(columnsize, cols)
    expect(ret).to.equal(0)
  })

  it('should not crash on missing param 2', () => {
    let columnsize = { x: 100, y: 100 }
    let cols
    let ret = Calc.columnSize(columnsize, cols)
    expect(ret).to.equal(0)
  })
})
