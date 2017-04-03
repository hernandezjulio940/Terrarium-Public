//Thank you @Tithen-Firion
var id = "{encodedString}"
var decoded = "";
var document = {};
var window = this;
var $ = function() {
    return {
        text: function(a) {
            if (a)
                decoded = a;
            else
                return id;
        },
        ready: function(a) {
            a()
        }
    }
};

(function(d) {
    var f = function() {};
    var s = '';
    var o = null;
    ['close', 'createAttribute', 'createDocumentFragment', 'createElement', 'createElementNS', 'createEvent', 'createNSResolver', 'createRange', 'createTextNode', 'createTreeWalker', 'evaluate', 'execCommand', 'getElementById', 'getElementsByName', 'getElementsByTagName', 'importNode', 'open', 'queryCommandEnabled', 'queryCommandIndeterm', 'queryCommandState', 'queryCommandValue', 'write', 'writeln'].forEach(function(e) {
        d[e] = f;
    });
    ['anchors', 'applets', 'body', 'defaultView', 'doctype', 'documentElement', 'embeds', 'firstChild', 'forms', 'images', 'implementation', 'links', 'location', 'plugins', 'styleSheets'].forEach(function(e) {
        d[e] = o;
    });
    ['URL', 'characterSet', 'compatMode', 'contentType', 'cookie', 'designMode', 'domain', 'lastModified', 'referrer', 'title'].forEach(function(e) {
        d[e] = s;
    });
})(document);

{decryptionScript};

decoded;
