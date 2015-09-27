[![Build Status](https://travis-ci.org/brollb/webgme-simple-nodes.svg?branch=master)](https://travis-ci.org/brollb/webgme-simple-nodes)
# 'Simple Nodes' Plugin for the WebGME
This plugin converts the WebGME nodes to simple JSON objects (where all children are topologically sorted) then calls a custom `OutputGenerator` which can be created to create custom text files using these simplified data types.

## Overview
This library is composed of two objects: `TemplateCreator` and the `OutputGenerator`. The `TemplateCreator` converts the WebGME nodes into JSON then passes them to an `OutputGenerator` which handles creating any necessary files (from any templates, etc).

## Quick Start (for the example)
+ Clone this repo
+ Install dependencies (with `npm install`)
+ Start project (with `npm start` - make sure you have a local mongodb instance running)
+ Navigate to `http://localhost:8888` in a browser
+ Create a new project from the seed `ExampleModel`
+ Open the `Example` box
+ Click the "play button" in the top left and run `ExamplePlugin`

## Quick Start (for development)
### Installation
If you are using the `webgme-setup-tool`, you can add this to an existing WebGME app with:

```
webgme add TemplateCreator brollb/webgme-simple-nodes
```

### Usage
The `TemplateCreator` can be extended in your plugin with

```
define(['TemplateCreator/TemplateCreator',
        ...], function(TemplateCreator,
        ...) {

    'use strict';
    var MyPlugin = function() {
        TemplateCreator.call(this);
        ...
    };

    _.extend(MyPlugin.prototype, TemplateCreator.prototype);
```

An `OutputGenerator` can be created similarly with 

```
define(['TemplateCreator/outputs/OutputGenerator',
        ...], function(OutputGenerator,
                       ...) {
    'use strict';

    var MyOutputGenerator = function() {
        this.template = /* define template info here */
    };

    _.extend(MyOutputGenerator.prototype, OutputGenerator.prototype);

```

More details on using these can be found in the example in `src/plugins/ExamplePlugin`
