/*globals define*/

define([
    'SimpleNodes/Generator',
    'underscore',
    'SimpleNodes/Constants'
], function(
    OutputGenerator,
    _,
    Constants
) {
    var MyGenerator = function() {
        // OutputGenerator provides a helper method called 'createTemplateFromNodes'
        // This method will take a list of nodes (generally the root node's children).
        // For each of these nodes (which are already topologically sorted), it
        // will look up the template based on the child's base type and populate
        // it with the given child node.

        // The lookups for the templates are done in 'this.template' which is set 
        // here. 
        this.template = {
            box: 'There is a box with the name "{{=name}}" with {{='+
                Constants.NEXT.length+'}} outgoing edges\n',
            thing: 'My "size" attribute is {{= size }} ({{= name }})\n'
        };
    };

    _.extend(MyGenerator.prototype, OutputGenerator.prototype);

    /**
     * Create the output files stored in a JS Object where the 
     * key is the file name and the value is the file content.
     *
     * @param {Virtual Node} root
     * @return {Object}
     */
    MyGenerator.prototype.createOutputFiles = function(root) {
        var outputFiles = {};

        // Here you can use the inherited 'createTemplateFromNodes'
        outputFiles[root.name+'_results.txt'] = this.createTemplateFromNodes(root[Constants.CHILDREN]);

        // You can also create whatever output files you want
        var additionalTemplate = _.template('console.log(\'Hello, {{= name }}!\');');
        outputFiles['hello_root.js'] = additionalTemplate(root);
        return outputFiles;
    };

    return MyGenerator;
});
