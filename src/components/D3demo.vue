<template>
  <div id="D3demo">
    <h1>D3</h1>
    <div id="grid"></div>
  </div>
</template>

<script>

//import * as d3 from "d3";

import {select} from "d3-selection";
import {scaleLinear} from "d3-scale";
import {axisTop} from "d3-axis";
import {axisLeft} from "d3-axis";

var d3 = { select, scaleLinear, axisTop, axisLeft };

export default {
  name: 'D3demo',
  data: function() {
      return {
      }
  },

  created: function() {
    console.log("created");
  },

  mounted: function() {
    console.log("mounted");

    var gridData = this.gridData();    
    // I like to log the data to the console for quick debugging
    console.log(gridData);   

    var grid = d3.select("#grid")
        .append("svg")
        .attr("class","grid")
        .attr("width","800")
        .attr("height","600")
        .attr("viewBox","0 0 800 600")
        .attr("preserveAspectRatio","xMidYMid meet");
    
    var row = grid.selectAll(".row")
        .data(gridData)
        .enter().append("g")
        .attr("class", "row");

    var column = row.selectAll(".square")
        .data(function(d) { return d; })
        .enter().append("rect")
        .attr("class","square")
        .attr("x", function(d) { return d.x; })
        .attr("y", function(d) { return d.y; })
        .attr("width", function(d) { return d.width; })
        .attr("height", function(d) { return d.height; })
        .style("fill", "#fff")
        .style("stroke", "#ccc");

    //Create the Scale we will use for the Axis
    var xScale = d3.scaleLinear()
        .domain([0, 80])
        .range([0, 800]);

    var yScale = d3.scaleLinear()
        .domain([0, 60])
        .range([0, 600])
        ;        

    //Create the Axis
    var xAxis = d3.axisTop()
        .scale(xScale)
        .ticks(8);
    
    var yAxis = d3.axisLeft()
        .scale(yScale)
        .ticks(6);

    //Create an SVG group Element for the Axis elements and call the xAxis function
    var xAxisGroup = grid.append("g")
        .call(xAxis);

    var yAxisGroup = grid.append("g")
        .call(yAxis);        

  },

  updated: function() {
    console.log("updated");
  },

  methods: {

    gridData() {
      var data = new Array();
      var xpos = 1; //starting xpos and ypos at 1 so the stroke will show when we make the grid below
      var ypos = 1;
      var width = 100;
      var height = 100;

      // iterate for rows 
      for (var row = 0; row < 6; row++) {
          data.push( new Array() );

          // iterate for cells/columns inside rows
          for (var column = 0; column < 8; column++) {
              data[row].push({
                  x: xpos,
                  y: ypos,
                  width: width,
                  height: height
              })
              // increment the x position. I.e. move it over by 50 (width variable)
              xpos += width;
          }
          // reset the x position after a row is complete
          xpos = 1;
          // increment the y position for the next row. Move it down 50 (height variable)
          ypos += height; 
      }
      return data;
    }

  }
}

</script>

<style>
  .grid {
    display: block;
    margin: auto;
    padding: 50px;
  }
</style>
