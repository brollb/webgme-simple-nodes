[![Build Status](https://travis-ci.org/webgme/webgme-simple-nodes.svg?branch=master)](https://travis-ci.org/webgme/webgme-simple-nodes)
# 'Simple Nodes' Plugin for the WebGME
This plugin converts the WebGME nodes to simple JSON objects (where all children are topologically sorted) then calls a custom `OutputGenerator` which can be created to create custom text files using these simplified data types.

## Quick Start
If you are using the `webgme-setup-tool`, you can add this to an existing WebGME app with:

```
webgme add TemplateCreator brollb/webgme-simple-nodes
```
