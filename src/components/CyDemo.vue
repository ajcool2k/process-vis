<template>
  <div id="CyDemo">
    <h1>Cytoscape Demo</h1>
    <p><a href="http://js.cytoscape.org/#getting-started">docs</a></p>
    <div id="cy"></div>
  </div>
</template>

<script>

import cytoscape from 'cytoscape';

import { Utils } from '@/classes/Utils';

import { Project } from '@/classes/Project';
import { Process } from '@/classes/Process';
import { Participant } from '@/classes/Participant';


export default {
  name: 'CyDemo',
  data: function() {
      return {
      }
  },

  created: function() {
    console.log("created");
    
  },

  mounted: function() {
    console.log("mounted");

    var cy = cytoscape({

        container: document.getElementById('cy'), // container to render in
        elements: [], // list of graph elements to start with
        style: [ // the stylesheet for the graph
            {
            selector: 'node',
            style: {
                'background-color': '#666',
                
                'content': 'data(id)',
                'shape': 'data(shape)',
                'width': '100px',
                'height': '40px',                
               // 'background-image': 'data(image)',
                'background-fit': 'contain',
                'background-clip': 'none',
                'background-color': '#F5A45D',
                'text-valign': 'center',
                'color': '#fff'                
            }
            },
            {
            selector: 'edge',
            style: {
                'width': 3,
                'curve-style': 'segments',
                'segment-distances': 0,

                'line-color': '#ccc',
                'target-arrow-color': '#ccc',
                'target-arrow-shape': 'triangle',
                'label': 'data(weight)'
            }
            }
        ],
        layout: {
            name: 'grid',
            fit: true // whether to fit the viewport to the graph 
        }
    });
    
    window['cytoscape'] = cy; 

    var data = Utils.generateData();

    let nodes = data.nodes;
    let edges = data.edges;

    console.log(data);

    cy.batch(function(){
        nodes.forEach(function(elem, index) {
            console.log(elem);
            console.log(index);

            cy.add({
                group: "nodes",
                data: { id: elem.id, weight: elem.p.duration, shape: elem.shape },
                position: { x: 150 * elem.p.participant, y: elem.p.time + 40 }
            });
        });
 
        edges.forEach(function(elem, index) {
            console.log(elem);

            let sourceNode = _.find(nodes, function(o) {
                return o.id === elem.source;
            });

            cy.add({
                group: "edges",
                data: { id: "e" + index, source: elem.source, target: elem.target, weight: sourceNode.p.duration }
            });
        });
        // search
        /*

        var aStar = cy.elements().aStar({ root: "#head", goal: "#tail", directed: true, weight: function(e) {
            let edgeWeight = e.data('weight');
            console.log(edgeWeight); 
            return edgeWeight;
           }
        });

        console.log(aStar);
        console.log(aStar.path.json());
        aStar.path.select();

        var dijkstra = cy.elements().dijkstra('#head', function(e){
            return e.data('weight');
        }, true);

        var path = dijkstra.pathTo( '#tail' );
        Utils.printPath(path);
        var distTo = dijkstra.distanceTo( '#tail' );
        console.log(distTo);        
        */

    });


  },

  updated: function() {
    console.log("updated");
  },

  methods: {}
}

</script>

<style>

    #cy {
        width: 100vw;
        height: 100vh;
        display: block;
    }

</style>
