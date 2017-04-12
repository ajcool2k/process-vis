export class Conf {

    static digrapheDebugmode(graph) {

        // This will represent our event receiver object.
        var receiver = {
        onNodeAdded: function (node) {
            console.log(node.id, 'has been added !');
        },
        onNodeRemoved: function (id) {
            console.log(id, 'has been removed !');
        },
        onEdgeAdded: function (edge) {
            console.log(edge.source.id, '->', edge.target.id, 'created !');
        },
        onEdgeRemoved: function (source, target) {
            console.log(source, '->', target, 'removed !');
        }
        };

        graph.on('node.added', receiver.onNodeAdded);
        graph.on('node.removed', receiver.onNodeRemoved);
        graph.on('edge.added', receiver.onEdgeAdded);
        graph.on('edge.removed', receiver.onEdgeRemoved); 
    }

}