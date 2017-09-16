/**
 * @author Jens Auerswald
 * @version 1.0
 */

import {select} from 'd3-selection'
import {scaleOrdinal} from 'd3-scale'
import {axisTop, axisLeft} from 'd3-axis'
import dateFormat from 'dateformat'
import { _ } from 'underscore'

export class Axis {
  constructor () {
    console.log('Create Axis')

    // d3 lib
    this.d3 = { select, scaleOrdinal, axisTop, axisLeft }
    this.domContainer = null
    this.domAxisGroup = {
      x: null,
      y: null
    }

    this.selector = null

    this.size = null

    this.offsetAxisX = { x: 120, y: 40 }
    this.offsetAxisY = { x: 60, y: 40 }

    this.yScale = null
    this.yAxis = null

    this.data = {
      timeline: [],
      processes: [],
      scale: { x: 1, y: 1 }
    }
  }

  setSize (size) {
    this.size = size
  }

  setData (type, data) {
    this.data[type] = data
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
    let scale = this.data.scale

    this.offsetAxisX = { x: 20 / scale.x, y: 10 + 10 / scale.x }
    this.offsetAxisY = { x: 90 / scale.x, y: 0 }

    this.data.timeline = []

    this.data.processes.map(elem => {
      this.data.timeline.push(
        {
          y: elem._position.y,
          start: dateFormat(elem.start, 'dd. mm. yyyy'),
          end: dateFormat(elem._defaultEndDate, 'dd. mm. yyyy'),
          height: elem._height
        }
      )
    })

    let data = this.data.timeline
    let domainArray = []
    let rangeArray = []

    data.forEach((elem) => {
      rangeArray.push(elem.y)
      rangeArray.push(elem.y + elem.height)
    })

    rangeArray = _.uniq(rangeArray, x => x)
    domainArray = rangeArray.map((elem, index) => index)

    this.yScale = d3.scaleOrdinal()
      .domain(domainArray) // [0, 1, 2, 3, 4, 5]
      .range(rangeArray) // [0, 200, 300, 500, 600, 800, 900, 1100, 1200, 1400, 1500, 1700]

    this.yAxis = d3.axisLeft()
      .scale(this.yScale)
      .ticks(rangeArray.length)
      .tickFormat(function (d, i) {
        let vIndex = Math.floor(i / 2)
        let v = i % 2 === 0 ? data[vIndex].start : data[vIndex].end
        return '' + v
      })
  }

  clean () {
    if (this.domAxisGroup.y) {
      this.domAxisGroup.y.remove()
      this.domAxisGroup.y = null
    }
  }

  draw () {
    console.log('draw axis')
    this.clean()
    let fontSize = '10pt' // Math.max(10, Math.floor(10 / this.data.scale.x))

    // Create an SVG group Element for the Axis elements and call the xAxis function
    if (this.data.processes.length === 0) return

    this.domAxisGroup.y = this.domContainer
      .append('g')
      .attr('class', 'axis-y')
      .attr(this.scopedProp, '')
      .style('font-size', fontSize)
      .attr('transform', 'translate(' + this.offsetAxisY.x + ',' + this.offsetAxisY.y + ')')
      .call(this.yAxis)
  }
}
