/*globals define,_*/
/*
 * @author brollb
 *
 * This file creates the virtual node structure to be used by the output
 * generators.
 */

define([
    'plugin/PluginBase',
    'text!./metadata.json',
    './Constants',
    './utils'
],function(
    PluginBase,
    metadata,
    Constants,
    Utils
){

    'use strict';

    var pluginMetadata = JSON.parse(metadata);
    var SimpleNodes = function () {
        // Call base class's constructor
        PluginBase.call(this);
        this.generator = this.generator || this;
        this.pluginMetadata = pluginMetadata;
    };

    // basic functions and setting for plugin inheritance
    SimpleNodes.prototype = Object.create(PluginBase.prototype);
    SimpleNodes.prototype.constructor = SimpleNodes;

    SimpleNodes.prototype._loadStartingNodes = function(callback){
        var self = this;
        this._nodeCache = {};

        this._nodeCache[this.core.getPath(this.activeNode)] = this.activeNode;
        this.core.loadSubTree(this.activeNode, function(err, nodes) {
            if (err) {
                return callback(err);
            }

            nodes.forEach(function(n) {
                this._nodeCache[this.core.getPath(n)] = n;
            }, self);

            callback(null);
        });
    };

    SimpleNodes.prototype._isTypeOf = function(node,type){
        //now we make the check based upon path
        if(node === undefined || node === null || type === undefined || type === null){
            return false;
        }

        while(node) {
            if(this.core.getPath(node) === this.core.getPath(type)){
                return true;
            }
            node = this.core.getBase(node);
        }
        return false;
    };

    SimpleNodes.prototype._isConnection = function(node){
        var ptrs = this.core.getPointerNames(node);
        return ptrs.indexOf('src') !== -1 && ptrs.indexOf('dst') !== -1;
    };

    SimpleNodes.prototype.getNode = function(nodePath){
        // we check only our node cache
        return this._nodeCache[nodePath];
    };

    SimpleNodes.prototype.main = function (callback) {
        var self = this;

        // If activeNode is null, we won't be able to run 
        if(!self.generator) {
            var err = 'Generator has not been set!';
            self.logger.error(err);
            self.result.success = false;
            return callback(err,self.result);
        }

        if(!self.activeNode) {
            self._errorMessages(self.activeNode, 'Current node is null - cannot genrate template');
            return callback('Current node is null');
        }

        self.logger.info('Running '+this.getName());

        // setting up cache
        this._loadStartingNodes(function(err){
            if(err){
                // finishing
                self.result.success = false;
                callback(err,self.result);
            } else {
                // executing the plugin
                self.logger.info('Finished loading children');

                // Bad hack FIXME
                if (self.result.messages.length) {
                    self.result.messages.pop();
                }
                // REMOVE the above thing
                self._runPlugin(callback);
            }
        });
    };

    SimpleNodes.prototype._runPlugin = function(callback) {
        this.nodes = {};
        this._connections = [];

        // Change underscorejs tags to handlebar style
        _.templateSettings = {
            interpolate: /\{\{=(.+?)\}\}/g,
            evaluate: /\{\{(.+?)\}\}/g
        };

        // Load virtual tree
        var tree = this.loadVirtualTree(this.activeNode);

        // Retrieve & populate templates in topological order
        var output = this.generator.createOutputFiles(tree);

        // Save file
        var name = this.core.getAttribute(this.activeNode, 'name')+'_results';

        this._saveOutput(name, output, callback);

    };

    /**
     * Load the virtual nodes into a tree rooted at 'root'.
     *
     * @param {WebGME Node} rootNode
     * @return {VirtualNode} root
     */
    SimpleNodes.prototype.loadVirtualTree = function(rootNode) {
        var root = this.createVirtualNode(rootNode),
            current = [root],
            next,
            nodeDict,
            node,
            i;

        // Create all virtual nodes
        while (current.length) {
            next = [];
            for (i = current.length; i--;) {
                node = current[i];
                // Create node objects from attribute names
                nodeDict = this.createChildVirtualNodes(node[Constants.NODE_PATH]);
                node[Constants.CHILDREN] = SimpleNodes.values(nodeDict);
                next = next.concat(node[Constants.CHILDREN]);
            }
            current = next;
        }

        // Topological sort and connections
        current = [root];
        for (i = this._connections.length; i--;) {
            this.mergeConnectionNode(this._connections[i]);
        }

        while (current.length) {
            next = [];
            for (i = current.length; i--;) {
                node = current[i];
                // Update node objects given the connections
                // Merge connection info with src/dst nodes
                nodeDict = SimpleNodes.toPathDict(node[Constants.CHILDREN]);
                node[Constants.CHILDREN] = this.getTopologicalOrdering(nodeDict);
                next = next.concat(node[Constants.CHILDREN]);
            }
            current = next;
        }


        return root;
    };

    SimpleNodes.values = function(dict) {
        var keys = Object.keys(dict),
            res = [];

        for (var i = keys.length; i--;) {
            res.push(dict[keys[i]]);
        }
        return res;
    };

    SimpleNodes.toPathDict = function(array) {
        var res = {},
            id;
        for (var i = array.length; i--;) {
            id = array[i][Constants.NODE_PATH];
            res[id] = array[i];
        }
        return res;
    };

    /**
     * Create virtual nodes from WebGME nodes for use with the templates.
     *
     * @return {Dictionary<Node>}
     */
    SimpleNodes.prototype.createChildVirtualNodes = function(nodeId) {
        var parentNode = this.getNode(nodeId),
            nodeIds = this.core.getChildrenPaths(parentNode),
            node,
            vnode,
            base,
            virtualNodes = {},
            i;

        for (i = nodeIds.length; i--;) {
            node = this.getNode(nodeIds[i]);
            if (!this._isConnection(node)) {
                vnode = this.createVirtualNode(node);
                base = this.core.getBase(node);
                vnode[Constants.BASE] = this.createVirtualNode(base);
                virtualNodes[nodeIds[i]] = vnode;
            } else {
                this._connections.push(node);
            }
        }

        // Copy virtual nodes into this.nodes
        _.extend(this.nodes, virtualNodes);

        return virtualNodes;
    };

    SimpleNodes.prototype.createVirtualNode = function(node) {
        var id = this.core.getPath(node),
            attrNames = this.core.getAttributeNames(node),
            virtualNode = {};

        for (var i = attrNames.length; i--;) {
            virtualNode[attrNames[i]] = this.core.getAttribute(node, attrNames[i]);
        }

        // Initialize source and destination stuff
        virtualNode[Constants.NEXT] = [];
        virtualNode[Constants.PREV] = [];
        virtualNode[Constants.NODE_PATH] = id;

        return virtualNode;
    };

    SimpleNodes.prototype.mergeConnectionNode = function(conn) {
        var src = this._getPointerVirtualNode(conn, 'src', this.nodes),  // Get the virtual nodes
            dst = this._getPointerVirtualNode(conn, 'dst', this.nodes);

        // Set pointers to each other
        src[Constants.NEXT].push(dst);
        dst[Constants.PREV].push(src);
    };

    SimpleNodes.prototype._verifyExists = function(object, key, defaultValue) {
        if (object[key] === undefined) {
            object[key] = defaultValue;
        }
    };

    SimpleNodes.prototype._getPointerVirtualNode = function(node, ptr,nodes) {
        var targetId = this.core.getPointerPath(node, ptr);

        return nodes[targetId];
    };

    /**
     * Get the topological ordering of the nodes from the node dictionary.
     *
     * @param {Dictionary} nodeMap
     * @return {Array<Node>} sortedNodes
     */
    SimpleNodes.prototype.getTopologicalOrdering = function(virtualNodes) {
        var nodeIds,
            adjacencyList = {},
            sortedNodes;

        nodeIds = Object.keys(virtualNodes);

        // Create the adjacency list
        nodeIds.forEach(function(id) {
            adjacencyList[id] = virtualNodes[id][Constants.NEXT]
                .map(function(node) {
                    return node[Constants.NODE_PATH];
                });
        });

        sortedNodes = Utils.topologicalSort(nodeIds, adjacencyList);

        return sortedNodes.map(function(e) { return virtualNodes[e]; });
    };

    // Thanks to Tamas for the next two functions
    SimpleNodes.prototype._saveOutput = function(filename, filesBlob, callback){
        var self = this,
            artifact = self.blobClient.createArtifact(filename),
            files = Object.keys(filesBlob),
            fileCount = files.length,
            onFileSave = function(err) {
                if(err){
                    return callback(err);
                } 

                if (--fileCount === 0) {
                    self.blobClient.saveAllArtifacts(function(err, hashes) {
                        if (err) {
                            callback(err);
                        } else {
                            self.logger.info('Artifacts are saved here:');
                            self.logger.info(hashes);

                            // result add hashes
                            for (var j = 0; j < hashes.length; j += 1) {
                                self.result.addArtifact(hashes[j]);
                            }

                            self.result.setSuccess(true);
                            callback(null, self.result);
                        }
                    });
                }
            };

        if (fileCount === 1) {
            this.blobClient.putFile(files[0], filesBlob[files[0]], function(err, hash) {
                if (err) {
                    return callback(err);
                }

                self.logger.info('Artifacts saved as ' + files[0]);
                self.result.addArtifact(hash);
                self.result.setSuccess(true);
                callback(null, self.result);
            });
        } else {
            for (var i = files.length; i--;) {
                artifact.addFile(files[i], filesBlob[files[i]], onFileSave);
            }
        }
    };

    SimpleNodes.prototype._errorMessages = function(message){
        //TODO the erroneous node should be send to the function
        var self = this;
        self.createMessage(self.activeNode,message);
    };

    return SimpleNodes;
});
