/*globals _,define*/
// This object uses the JSON representations of the WebGME nodes and the 
// given templates provided in ./templates to generate the desired files.
//
// In this context, the JSON representations of the nodes are called virtual
// nodes.
define(['./Constants'], function(Constants) {

    'use strict';

    var Generator = function() {
    };

    /**
     * Create the template from the sorted nodes. It assumes that 
     * the template to be used is stored as this.template
     *
     * @param {Array <VirtualNode>} nodeIds
     * @return {String} output
     */
    Generator.prototype.createTemplateFromNodes = function(nodes) {
        var len = nodes.length,
            template,
            snippet,
            baseName,
            output = '',
            node;

        // For each node, get the snippet from the base name, populate
        // it and add it to the template
        for (var i = 0; i < len; i++) {
            node = nodes[i];
            baseName = node[Constants.BASE].name;
            template = _.template(this.template[baseName]);
            snippet = template(node);

            output += snippet;
        }

        return output;
    };

    /**
     * Create the output files stored in a JS Object where the 
     * key is the file name and the value is the file content.
     *
     * A "virtual node" is simply a JSON representation of the WebGME node
     * with all children topologically sorted.
     *
     * @param {Virtual Node} tree
     * @return {Object}
     */
    Generator.prototype.createOutputFiles = function(/*tree*/) {
        // Override this function in child classes
    };

    return Generator;
});
