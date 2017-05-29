<template>
  <div id="D3Gantt">
    <h1>Gantt</h1>
    <div id="gantt">
      <button type="button" @click="addTask()">Add Task</button>
      <button type="button" @click="removeTask()">Remove Task</button>
      <button type="button" @click="changeTimeDomain('1hr')">1 HR</button>
      <button type="button" @click="changeTimeDomain('3hr')">3 HR</button>
      <button type="button" @click="changeTimeDomain('6hr')">6 HR</button>
      <button type="button" @click="changeTimeDomain('1day')">1 DAY</button>
      <button type="button" @click="changeTimeDomain('1week')">1 WEEK</button>
      <button type="button" @click="fixedTimeDomain()">fixed</button>
      <button type="button" @click="fitTimeDomain()">fit</button>
    </div>
    <div class="svg-container"></div>
  </div>
</template>

<script>

//import * as d3 from "d3";

import {select, selectAll} from "d3-selection";
import {scaleTime, scaleBand} from "d3-scale";
import {axisLeft, axisBottom} from "d3-axis";
import {timeDay, timeHour } from "d3-time";
import {timeFormat } from "d3-time-format";
import {transition } from "d3-transition";

var d3 = {  select, selectAll,
            scaleTime, scaleBand, 
            axisLeft, axisBottom, 
            timeDay, timeHour,
            timeFormat,
            transition,
        };

import { ganttExt } from '@/classes/ui/Gantt';


export default {
  name: 'D3Gantt',
  data: function() {
      return {
        tasks: [],
        taskStatus: {},
        taskNames: [],
        timeDomainString: "",
        gantt: null
      }
  },

  created: function() {
    console.log("created");
  },

  mounted: function() {
    console.log("mounted");

    d3['gantt'] = ganttExt;

    this.format = "%H:%M";
    this.timeDomainString = "1day";

    this.tasks = [
    {
        "startDate": new Date("Sun Dec 09 01:36:45 EST 2012"),
        "endDate": new Date("Sun Dec 09 02:36:45 EST 2012"),
        "taskName": "E Job",
        "status": "FAILED"
    },

    {
        "startDate": new Date("Sun Dec 09 04:56:32 EST 2012"),
        "endDate": new Date("Sun Dec 09 06:35:47 EST 2012"),
        "taskName": "A Job",
        "status": "RUNNING"
    }];
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

    

    // prepare
    this.gantt = d3.gantt(d3)
                .setContainer(".svg-container")
                .taskTypes(taskNames)
                .taskStatus(taskStatus)
                .tickFormat(this.format)
                ;

    // apply data
    this.gantt(tasks);

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
        
        tasks.push({"startDate":d3.timeHour.offset(lastEndDate,Math.ceil(1*Math.random())),"endDate":d3.timeHour.offset(lastEndDate,(Math.ceil(Math.random()*3))+1),"taskName":taskName,"status":taskStatusName});
        
        this.changeTimeDomain(this.timeDomainString);
        this.gantt.redraw(tasks);
    },

    removeTask() {
        let tasks = this.tasks;
        tasks.pop();
        
        this.changeTimeDomain(this.timeDomainString);
        this.gantt.redraw(tasks);
    },

    getEndDate() {
        var lastEndDate = Date.now();
        let tasks = this.tasks;

        if (tasks.length > 0) {
          lastEndDate = tasks[tasks.length - 1].endDate;
        }
        return lastEndDate;
    },
    
    fixedTimeDomain() {
      this.gantt.timeDomainMode("fixed");
      this.changeTimeDomain(this.timeDomainString);
    },

    fitTimeDomain() {
      this.gantt.timeDomainMode("fit");
      this.changeTimeDomain(this.timeDomainString);
    },    
    
    changeTimeDomain(timeDomainString) {
      this.timeDomainString = timeDomainString;

      let gantt = this.gantt;
      let format = this.format;
      let getEndDate = this.getEndDate;

      switch (timeDomainString) {
          case "1hr":
            format = "%H:%M:%S";
            gantt.timeDomain([ d3.timeHour.offset(getEndDate(), -1), getEndDate() ]);
            break;

          case "3hr":
            format = "%H:%M";
            gantt.timeDomain([ d3.timeHour.offset(getEndDate(), -3), getEndDate() ]);
            break;

          case "6hr":
            format = "%H:%M";
            gantt.timeDomain([ d3.timeHour.offset(getEndDate(), -6), getEndDate() ]);
            break;

          case "1day":
            format = "%H:%M";
            gantt.timeDomain([ d3.timeDay.offset(getEndDate(), -1), getEndDate() ]);
            break;

          case "1week":
            format = "%a %H:%M";
            gantt.timeDomain([ d3.timeDay.offset(getEndDate(), -7), getEndDate() ]);
            break;

          default:
            format = "%H:%M"
        }
        
        gantt
          .tickFormat(this.format)
          .redraw(this.tasks);
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
  
</style>
