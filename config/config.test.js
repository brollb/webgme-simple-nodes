/*jshint node: true*/
/**
 * @author lattmann / https://github.com/lattmann
 */

var config = require('./config.webgme');

config.server.port = 9001;
config.mongo.uri = 'mongodb://127.0.0.1:27017/webgme_tests';

config.requirejsPaths = {
    'SimpleNodes': 'src/plugins/SimpleNodes'
};

module.exports = config;
