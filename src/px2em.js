var fs = require('fs');
var paths = require('path');

var config = {
    px: 12,
    fixNumber: 9,
    type: 'em',
    cssClass: 'em'
};
var reg = {
    // 数字+px 10px
    px: /\d+px/g,
    // font-size 10px
    fontSize: /font-size.*\d+px/g,
    // number
    num: /[^0-9.]+/g
};
var cssFormate = function (path, px, callback, conf) {
    conf && (config = conf);
    var chunk = fs.readFileSync(path, 'utf-8');
    var fileContent = cssSplit(chunk);
    cssBlock(px, fileContent, function (emFile) {
        emToFile(path, emFile, callback);
    });
    callback && callback();
};

var cssSplit = function (chunk) {
    var stack = [];
    var stackTmp = [];
    var tmp = '';
    var index = 0;
    var fileContent = chunk.split('{');
    for (var i = 0; i < fileContent.length; i++) {
        if (i < fileContent.length - 1) fileContent[i] += '{';
        if (fileContent[i].indexOf('}') !== -1) {
            var right = fileContent[i].split('}');
            for (var j = 0; j < right.length; j++) {
                if (j < right.length - 1) right[j] += '}';
                stack.push(right[j]);
            }
        } else {
            stack.push(fileContent[i]);
        }
    }
    stack.forEach(function (item) {
        if (item.indexOf('{') !== -1) {
            index++;
        } else if (item.indexOf('}') !== -1) {
            index--;
        }
        tmp += item;
        if (index === 0) {
            stackTmp.push(tmp);
            tmp = '';
        }
    });

    return stackTmp;
};

var pxToem = function (chunk, px) {
    var emChunk = chunk.replace(/[\d\.]+px/g, function () {
        var args = Array.prototype.slice.call(arguments)[0];
        var num = args.split('px')[0];
        // 特殊处理1px的情况
        return (num / px * 12 < 1) ? ('1px') : (num / px).toFixed(config.fixNumber) + config.type;
    });
    return emChunk;
};

var cssBlock = function (px, cssfile, callback) {
    var emFile = '';
    for (var i = 0; i < cssfile.length; i++) {
        var fontSize = 0;

        //if (cssfile[i].indexOf('{') !== -1) {
        //    cssfile[i] += '}';
        //}
        if (cssfile[i].indexOf('font-size') !== -1) {
            // 先把font-size/14处理
            cssfile[i] = cssfile[i].replace(reg.fontSize, function () {
                var args = Array.prototype.slice.call(arguments)[0];
                fontSize = args.replace(reg.num, '');
                return 'font-size: ' + (fontSize / (px || config.px)) + config.type;
            });
        }
        fontSize = (fontSize && config.type !== 'rem') ? fontSize : (px || config.px);
        emFile += pxToem(cssfile[i], fontSize);
    }
    callback(emFile);
};

var emToFile = function (path, emChunk, callback) {
    fs.writeFileSync(path, emChunk, 'utf-8');
    console.log(path + '-->px2em success!');
};

module.exports = cssFormate;
