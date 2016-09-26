var px2em = require('../src/px2em');
var path = require('path');
var fs = require('fs');

var srcPath = path.join(__dirname, './src/common.css');
var buildPath = path.join(__dirname, './dist/test.css');
var css = fs.readFileSync(srcPath, 'utf8');

fs.writeFileSync(buildPath, css, 'utf8');

px2em(buildPath);
