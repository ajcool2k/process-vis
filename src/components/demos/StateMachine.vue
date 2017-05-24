<template>
  <div id="StateMachine">
    <div id="demo">

        <h1> Finite State Machine </h1>
        <div @mousedown.left="onMouseDownLeft" @mousedown.right="onMouseDownRight" class="box"></div>
    </div>
  </div>
</template>

<script>


import { StateMachine } from '@/classes/utils/StateMachine';


export default {
  name: 'StateMachine',
  data: function() {
      return {
        fsm: null,
        box: null
      }
  },

  created: function() {
    console.log("created");

    window.oncontextmenu = function(event) {
        event.preventDefault();
        event.stopPropagation();
        return false;
    };

  },

  mounted: function() {
    console.log("mounted");

    this.box = document.querySelector('.box');
    this.fsm = new StateMachine();
    console.log(this.fsm);

    // this.fsm.addTestData();

    let a1 = this.fsm.addState("a1");
    let a2 = this.fsm.addState("a2");
    let a3 = this.fsm.addState("a3");
    let a4 = this.fsm.addState("a4");

    this.fsm.addEvent(a1, a2, { 
        name: 'onMouseDownLeft',
        action: () => {
            this.box.style.background = "red";
          }
    });      

    this.fsm.addEvent(a2, a3, { 
        name: 'onMouseDownLeft',
        action: () => { 
            this.box.style.background = "green";
          }
    });

    this.fsm.addEvent(a2, a1, { 
        name: 'onMouseDownRight',
        action: () => { 
            this.box.style.background = "none";
          }
    });


    this.fsm.addEvent(a3, a4, { 
        name: 'onMouseDownLeft',
        action: () => { 
            this.box.style.background = "blue";
          }
    });


    this.fsm.addEvent(a3, a2, { 
        name: 'onMouseDownRight',
        action: () => { 
            this.box.style.background = "red";
          }
    });

    this.fsm.addEvent(a4, a1, { 
        name: 'onMouseDownLeft',
        action: () => { 
            this.box.style.background = "none";
          }
    });

    this.fsm.addEvent(a4, a3, { 
        name: 'onMouseDownRight',
        action: () => { 
            this.box.style.background = "green";
          }
    });

    this.fsm.start(a1);
  },

  updated: function() {
    console.log("updated");
  },

  methods: {
    
      onMouseDownLeft(event) {
        console.log(event);
        event.stopPropagation();

        this.fsm.run("onMouseDownLeft");

      },
      onMouseDownRight(event) {
        console.log(event);
        event.stopPropagation();

        this.fsm.run("onMouseDownRight");
      }
  }
}

</script>

<style scoped>
  .box {
    display: inline-block;
    width: 200px;
    height: 200px;
    border: 2px solid black;
  }

</style>
