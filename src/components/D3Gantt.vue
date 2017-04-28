<template>
  <div id="D3Gantt">
    <h1>Gantt</h1>
    <div id="gantt">
      <button type="button" @click="addTask()">Add Task</button>
      <button type="button" @click="removeTask()">Remove Task</button>
      <!--
      <script type="text/javascript" src="http://d3js.org/d3.v3.min.js"></script>
      <script type="text/javascript" src="http://static.mentful.com/gantt-chart-d3v21.js"></script>
      <script type="text/javascript" src="example2.js"></script>    
      -->
    </div>
  </div>
</template>

<script>

//import * as d3 from "d3";
//import {scaleLinear} from "d3-scale";


export default {
  name: 'D3Gantt',
  data: function() {
      return {
        tasks: [],
        taskStatus: {},
        taskNames: [],
        gantt: null
      }
  },

  created: function() {
    console.log("created");
  },

  mounted: function() {
    console.log("mounted");

    // var gantt = require('@/classes/ui/Gantt');
    this.gantt = d3.gantt();

    this.tasks = [
      {"startDate":new Date("Sun Dec 09 01:36:45 EST 2012"),"endDate":new Date("Sun Dec 09 02:36:45 EST 2012"),"taskName":"E Job","status":"RUNNING"}
      ];
    let tasks = this.tasks;

    this.taskStatus = {
        "SUCCEEDED" : "bar",
        "FAILED" : "bar-failed",
        "RUNNING" : "bar-running",
        "KILLED" : "bar-killed"
    };
    let taskStatus = this.taskStatus;

    this.taskNames = [ "D Job", "P Job", "E Job", "A Job", "N Job" ];
    let taskNames = this.taskNames;


    tasks.sort(function(a, b) {
        return a.endDate - b.endDate;
    });

    var maxDate = tasks[tasks.length - 1].endDate;
    
    tasks.sort(function(a, b) {
        return a.startDate - b.startDate;
    });
    
    var minDate = tasks[0].startDate;

    var format = "%H:%M";

    var gantt = d3.gantt().taskTypes(taskNames).taskStatus(taskStatus).tickFormat(format);
    //gantt.timeDomain([new Date("Sun Dec 09 04:54:19 EST 2012"),new Date("Sun Jan 09 04:54:19 EST 2013")]);
    //gantt.timeDomainMode("fixed");
    gantt(tasks);

  },

  updated: function() {
    console.log("updated");
  },

  methods: {

    addTask() {
        let tasks = this.tasks;
        let taskStatus = this.taskStatus;
        let taskNames = this.taskNames;

        var lastEndDate = Date.now();
        if (tasks.length > 0) {
          lastEndDate = tasks[tasks.length - 1].endDate;
        }
        
        var taskStatusKeys = Object.keys(taskStatus);
        var taskStatusName = taskStatusKeys[Math.floor(Math.random()*taskStatusKeys.length)];
        var taskName = taskNames[Math.floor(Math.random()*taskNames.length)];
        
        tasks.push({"startDate":d3.time.hour.offset(lastEndDate,Math.ceil(1*Math.random())),"endDate":d3.time.hour.offset(lastEndDate,(Math.ceil(Math.random()*3))+1),"taskName":taskName,"status":taskStatusName});
        this.gantt.redraw(tasks);
    },
    removeTask() {
        let tasks = this.tasks;
        tasks.pop();
        this.gantt.redraw(tasks);
    }
  }
}

</script>

<style>
  html,body,#wrapper {
    width: 100%;
    height: 100%;
    margin: 0px;
  }
  
  .chart {
    font-family: Arial, sans-serif;
    font-size: 12px;
  }
  
  .axis path,.axis line {
    fill: none;
    stroke: #000;
    shape-rendering: crispEdges;
  }
  
  .bar {
    fill: #33b5e5;
  }
  
  .bar-failed {
    fill: #CC0000;
  }
  
  .bar-running {
    fill: #669900;
  }
  
  .bar-succeeded {
    fill: #33b5e5;
  }
  
  .bar-killed {
    fill: #ffbb33;
  }
  
  #forkme_banner {
    display: block;
    position: absolute;
    top: 0;
    right: 10px;
    z-index: 10;
    padding: 10px 50px 10px 10px;
    color: #fff;
    background:
      url('http://dk8996.github.io/Gantt-Chart/images/blacktocat.png')
      #0090ff no-repeat 95% 50%;
    font-weight: 700;
    box-shadow: 0 0 10px rgba(0, 0, 0, .5);
    border-bottom-left-radius: 2px;
    border-bottom-right-radius: 2px;
    text-decoration: none;
  }
</style>
