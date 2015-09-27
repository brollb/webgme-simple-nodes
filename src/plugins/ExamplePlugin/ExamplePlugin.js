/*globals define*/
/*jshint node:true, browser:true*/

// This is the minimal working example of using this library. In practice you would
// probably still have functions like 'getName' and 'getVersion', etc.
define([
    'TemplateCreator/TemplateCreator',
    './MyOutputGenerator'
], function (
    SimpleNodes,
    MyOutputGenerator) {
    'use strict';

    /**
     * Initializes a new instance of ExamplePlugin.
     * @class
     * @augments {PluginBase}
     * @classdesc This class represents the plugin ExamplePlugin.
     * @constructor
     */
    var ExamplePlugin = function () {
        // Call base class' constructor.
        SimpleNodes.call(this);
        // Set the generator to use. This needs to be done before the 
        // SimpleNodes.prototype.main function is invoked
        this.generator = new MyOutputGenerator();
    };

    // Prototypal inheritance from PluginBase.
    ExamplePlugin.prototype = Object.create(SimpleNodes.prototype);
    ExamplePlugin.prototype.constructor = ExamplePlugin;

    return ExamplePlugin;
});
