/**
 * Loads the app's AMD modules in Node for testing (no browser needed).
 */
var path = require('path'),
    requirejs = require('requirejs'),
    awParser = require('aw-parser'),
    PDFDocument = require('pdfkit');

var root = path.join(__dirname, '..');

// use the Node builds of the libraries the browser loads as AMD modules
requirejs.define('pdfkit', [], function() {
    return PDFDocument;
});

requirejs.define('aw-parser', [], function() {
    return awParser;
});

requirejs.config({
    baseUrl: path.join(root, 'js'),
    nodeRequire: require
});

/**
 * @param {string[]} modules - AMD module ids
 * @returns {Promise<Array>}
 */
module.exports = function load(modules) {
    return new Promise(function(resolve, reject) {
        requirejs(modules, function() {
            resolve(Array.prototype.slice.call(arguments));
        }, reject);
    });
};
