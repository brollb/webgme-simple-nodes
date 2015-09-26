define([], function() {
    var equals = function(a, b) {
        return a === b;
    };

    var topologicalSort = function(nodes, al) {
        var sortedNodes = [],
            edgeCounts = {},
            len = nodes.length,
            nodeId,
            id,
            i;

        // Populate incoming edge counts
        edgeCounts = getIncomingCounts(al);

        while (sortedNodes.length < len) {
            // Find a node with zero edges...
            i = nodes.length;
            nodeId = null;
            while (i-- && !nodeId) {
                if (edgeCounts[nodes[i]] === 0) {
                    nodeId = nodes.splice(i,1)[0];
                    hasCycle = false;
                }
            }

            if (nodeId === null) {  // has a cycle! no sort available
                return null;
            }

            // Add the node 
            sortedNodes.push(nodeId);

            // Update edge counts
            i = al[nodeId].length;
            while (i--) {
                id = al[nodeId][i];
                edgeCounts[id]--;
            }

        }
        return sortedNodes;
    };

    var getIncomingCounts = function(adjacencyList) {
        var allDsts = [],
            ids = Object.keys(adjacencyList),
            result = {};

        for (var i = ids.length; i--;) {
            allDsts = allDsts.concat(adjacencyList[ids[i]]);
        }

        // Get the counts for each id
        ids.forEach(function(id) {
            result[id] = allDsts.filter(equals.bind(null, id)).length;
        });

        return result;
    };

    var reverseAdjacencyList = function(adjacencyList) {
        var ids = Object.keys(adjacencyList),
            result = {};

        // Initialize the result keys
        ids.forEach(function(id) {
            result[id] = [];
        });

        // Populate the result
        var src,dst;
        for (var i = ids.length; i--;) {
            src = ids[i];
            for (var j = adjacencyList[src].length; j--;) {
                dst = adjacencyList[src][j];
                result[dst].push(src);
            }
        }

        return result;
    };

    var nestedSeparator = '_';
    var isPrimitive = function(obj) {
        return typeof obj !== 'object' || obj instanceof Array;
    };

    var extend = function(base) {
        var src;
        for (var i = 1; i < arguments.length; i++) {
            src = arguments[i];
            for (var key in src) {
                base[key] = src[key];
            }
        }
    };

    var flattenWithPrefix = function(prefix, object) {
        var ids = Object.keys(object),
            flatObject = {};

        for (var i = ids.length; i--;) {
            if (isPrimitive(object[ids[i]])) {
                flatObject[prefix+ids[i]] = object[ids[i]];
            } else {
                extend(flatObject, 
                    flattenWithPrefix(prefix+ids[i]+nestedSeparator ,object[ids[i]]));
            }
        }

        return flatObject;
    };

    var omit = function(object, keys) {
        var result = {};
        for (var key in object) {
            if (keys.indexOf(key) === -1) {
                result[key] = object[key];
            }
        }
        return result;
    };

    return {
        equals: equals,
        reverseAdjacencyList: reverseAdjacencyList,
        topologicalSort: topologicalSort,
        nestedSeparator: nestedSeparator,
        flattenWithPrefix: flattenWithPrefix,
        omit: omit
    };
});
