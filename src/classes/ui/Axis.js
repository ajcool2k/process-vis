/**
 * @author Jens Auerswald
 * @version 1.0
 */

import {select} from 'd3-selection'
import {scaleLinear, scaleBand} from 'd3-scale'
import {axisTop, axisLeft} from 'd3-axis'

export class Axis {
  constructor () {
    console.log('Create Axis')

    // d3 lib
    this.d3 = { select, scaleBand, scaleLinear, axisTop, axisLeft }
    this.domContainer = null
    this.domAxisGroup = {
      x: null,
      y: null
    }

    this.selector = null

    this.size = null

    this.offsetAxisX = { x: 20, y: 40 }
    this.offsetAxisY = { x: 60, y: 40 }

    this.xScale = null
    this.yScale = null
    this.xAxis = null
    this.yAxis = null

    this.data = {
      actorNames: []
    }
  }

  setSize (size) {
    this.size = size
    this.applySettings()
  }

  setData (type, data) {
    this.data[type] = data
    this.applySettings()
  }

  create (selector, size, scopedProp) {
    this.selector = selector
    this.size = size
    this.scopedProp = typeof scopedProp === 'string' ? scopedProp : 'no-scope'

    let d3 = this.d3

    this.domContainer = d3
      .select(selector)
  }

  applySettings () {
    let d3 = this.d3

    let data = [
      { y: 0, start: 1, end: 5 },
      { y: 300, start: 6, end: 10 },
      { y: 600, start: 11, end: 15 },
      { y: 900, start: 16, end: 20 },
      { y: 1200, start: 21, end: 25 },
      { y: 1500, start: 26, end: 30 }
    ]

    let domainArray = []
    let rangeArray = []

    data.forEach((elem) => {
      domainArray.push(domainArray.length)
      domainArray.push(domainArray.length)
      rangeArray.push(elem.y)
      rangeArray.push(elem.y + 200)
    })

    this.xScale = d3.scaleBand()
        .domain(this.data.actorNames)
        .range([0, this.size.x - 2 * this.offsetAxisX.x])

    this.yScale = d3.scaleLinear()
        .domain(domainArray)            // [0, 1, 2, 3, 4, 5]
        .range(rangeArray)              // [0, 200, 300, 500, 600, 800, 900, 1100, 1200, 1400, 1500, 1700]

    this.xAxis = d3.axisTop()
        .scale(this.xScale)
        .ticks(this.data.actorNames.length)


    this.yAxis = d3.axisLeft()
        .scale(this.yScale)
        .ticks(rangeArray.length)
        .tickFormat(function (d, i) {
          let vIndex = Math.floor(i / 2)
          let v = i % 2 === 0 ? data[vIndex].start : data[vIndex].end
          return 'Tag ' + v
        })
  }

  clean () {
    if (this.domAxisGroup.x) {
      this.domAxisGroup.x.remove()
      this.domAxisGroup.x = null
    }

    if (this.domAxisGroup.y) {
      this.domAxisGroup.y.remove()
      this.domAxisGroup.y = null
    }
  }

  draw () {
    console.log('draw axis')
    this.clean()

    // Create an SVG group Element for the Axis elements and call the xAxis function
    this.domAxisGroup.x = this.domContainer
        .append('g')
        .attr('class', 'axis-x')
        .attr(this.scopedProp, '')
        .attr('transform', 'translate(' + this.offsetAxisX.x + ',' + 20 + ')')
        .call(this.xAxis)

    this.domAxisGroup.y = this.domContainer
        .append('g')
        .attr('class', 'axis-y')
        .attr(this.scopedProp, '')
        .attr('transform', 'translate(' + this.offsetAxisY.x + ',' + this.offsetAxisY.y + ')')
        .call(this.yAxis)
  }
}
