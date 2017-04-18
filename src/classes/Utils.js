import { Process } from '@/classes/Process';


export class Utils {

    static generateData() {

        var nodes = Array();

        nodes.push( { id: 'head', p: new Process('head', 0 * 24, 0, 0), shape: 'ellipse', bgColor: '#aaa' } );
        nodes.push( { id: 'n0', p: new Process('n0', 1 * 24, 1, 100 ), shape: 'roundrectangle', bgColor: '#F5A45D' } );
        nodes.push( { id: 'n1', p: new Process('n1', 2 * 24, 1, 200 ), shape: 'roundrectangle', bgColor: '#F5A45D' } );
        nodes.push( { id: 'n2', p: new Process('n2', 1 * 24, 2, 200 ), shape: 'roundrectangle', bgColor: '#F5A45D' } );
        nodes.push( { id: 'n3', p: new Process('n3', 1 * 24, 1, 350 ), shape: 'roundrectangle', bgColor: '#F5A45D' } );
        nodes.push( { id: 'n4', p: new Process('n4', 3 * 24, 2, 280 ), shape: 'roundrectangle', bgColor: '#F5A45D' } );
        nodes.push( { id: 'tail', p: new Process('tail', 0 * 24, 0, 450 ), shape: 'ellipse', bgColor: '#aaa' } );

        var edges = Array();

        edges.push({ source: 'head', target: 'n0' } );
        edges.push({ source: 'n0', target: 'n1' } );
        edges.push({ source: 'n0', target: 'n2' } );
        edges.push({ source: 'n1', target: 'n3' } );
        edges.push({ source: 'n3', target: 'tail' } );
        edges.push({ source: 'n2', target: 'n4' } );
        edges.push({ source: 'n4', target: 'n3' } );

        var participants = Array();
        
        participants.push([1, 'A1']);
        participants.push([2, 'A2']);
        participants.push([3, 'A3']);
        participants.push([4, 'A4']);
        participants.push([5, 'A5']);

        return {
            nodes: nodes,
            edges: edges
        }
    }

    static printPath(collection) {
        let pathArray = collection.jsons()
        let ret = "path: ";

        pathArray.forEach(function(elem) {
            ret += elem.group === 'nodes' ? elem.data.id : " > ";
        });

        console.log(ret);
    }

}