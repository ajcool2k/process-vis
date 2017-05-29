/**
 * @author Jens Auerswald
 * @version 1.0
 */

import {select} from "d3-selection";
import {scaleLinear, scaleBand} from "d3-scale";

import {axisTop} from "d3-axis";
import {axisLeft} from "d3-axis";


export class Axis {

    // d3 lib
	d3 = { select, scaleBand, scaleLinear, axisTop, axisLeft };
    
    domContainer = null;

    domAxisGroup = {
        x: null,
        y: null
    }

    selector = null;

    size = null;
    offset = {x: 20, y: 20 }

    xScale = null;
    yScale = null;
    xAxis = null;
    yAxis = null;

    data = {
        actorNames: []
    }

    constructor() {
        console.log('Create Axis');
    }

    setSize(size) {
        this.size = size;
        this.applySettings();
    }

    setData(type, data) {
        this.data[type] = data;
        this.applySettings();
    }

    create(selector, size) {
        this.selector = selector;
        this.size = size;

        let d3 = this.d3;
 
        this.domContainer = d3
        .select(selector)
        .attr("transform","translate(" + this.offset.x + "," + this.offset.y + ")");
	}

    applySettings() {
        let d3 = this.d3;

        this.xScale = d3.scaleBand()
            .domain(this.data.actorNames)
            .range([0, this.size.x - 2 * this.offset.x]);

        this.yScale = d3.scaleLinear()
            .domain([0, 60])
            .range([0, this.size.y - 2 * this.offset.y]);

        this.xAxis = d3.axisTop()
            .scale(this.xScale)
            .ticks(8);
    
        this.yAxis = d3.axisLeft()
            .scale(this.yScale)
            .ticks(6);        
    }

	clean() {

		if (this.domAxisGroup.x) {
			this.domAxisGroup.x.remove();
			this.domAxisGroup.x = null;
		}

		if (this.domAxisGroup.y) {
			this.domAxisGroup.y.remove();
			this.domAxisGroup.y = null;
		}        

	}

    draw() {
        console.log('draw axis');
        this.clean();

        // Create an SVG group Element for the Axis elements and call the xAxis function
        this.domAxisGroup.x = this.domContainer.append("g")
            .call(this.xAxis);

        this.domAxisGroup.y = this.domContainer.append("g")
            .call(this.yAxis);
    }

};    
