[![Build Status](https://travis-ci.org/brollb/webgme-simple-nodes.svg?branch=master)](https://travis-ci.org/brollb/webgme-simple-nodes)
[![Code Climate](https://codeclimate.com/github/brollb/webgme-simple-nodes/badges/gpa.svg)](https://codeclimate.com/github/brollb/webgme-simple-nodes)
[![npm](https://img.shields.io/npm/v/webgme-simple-nodes.svg?maxAge=2592000)]()
# 'Simple Nodes' Plugin for the WebGME
This plugin converts the WebGME nodes to simple JSON objects (where all children are topologically sorted) then calls a custom `Generator` which can be created to create custom text files using these simplified data types.

## Overview
This library is composed of two objects: `SimpleNodes` and the `Generator`. The `SimpleNodes` converts the WebGME nodes into JSON then passes them to an `Generator` which handles creating any necessary files (from any templates, etc).

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
If you are using the `webgme-cli`, you can add this to an existing WebGME app with:

```
webgme add plugin SimpleNodes brollb/webgme-simple-nodes
```

### Usage
The `SimpleNodes` can be extended in your plugin with

```
define(['SimpleNodes/SimpleNodes',
        ...], function(SimpleNodes,
        ...) {

    'use strict';
    var MyPlugin = function() {
        SimpleNodes.call(this);
        ...
    };

    _.extend(MyPlugin.prototype, SimpleNodes.prototype);
```

An `Generator` can be created similarly with 

```
define(['SimpleNodes/Generator',
        ...], function(Generator,
                       ...) {
    'use strict';

    var MyGenerator = function() {
        this.template = /* define template info here */
    };

    _.extend(MyGenerator.prototype, Generator.prototype);

```

More details on using these can be found in the example in `src/plugins/ExamplePlugin`
