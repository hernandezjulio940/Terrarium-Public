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

(function(d, w) {
    var f = function() {};
    var s = '';
    var o = null;
    var b = false;
    var n = 0;
    var df = ['close', 'createAttribute', 'createDocumentFragment', 'createElement', 'createElementNS', 'createEvent', 'createNSResolver', 'createRange', 'createTextNode', 'createTreeWalker', 'evaluate', 'execCommand', 'getElementById', 'getElementsByName', 'getElementsByTagName', 'importNode', 'open', 'queryCommandEnabled', 'queryCommandIndeterm', 'queryCommandState', 'queryCommandValue', 'write', 'writeln'];
    df.forEach(function(e) {
        d[e] = f;
    });
    var do_ = ['anchors', 'applets', 'body', 'defaultView', 'doctype', 'documentElement', 'embeds', 'firstChild', 'forms', 'images', 'implementation', 'links', 'location', 'plugins', 'styleSheets'];
    do_.forEach(function(e) {
        d[e] = o;
    });
    var ds = ['URL', 'characterSet', 'compatMode', 'contentType', 'cookie', 'designMode', 'domain', 'lastModified', 'referrer', 'title'];
    ds.forEach(function(e) {
        d[e] = s;
    });
    var wb = ['closed', 'isSecureContext'];
    wb.forEach(function(e) {
        w[e] = b;
    });
    var wf = ['addEventListener', 'alert', 'atob', 'blur', 'btoa', 'cancelAnimationFrame', 'captureEvents', 'clearInterval', 'clearTimeout', 'close', 'confirm', 'createImageBitmap', 'dispatchEvent', 'fetch', 'find', 'focus', 'getComputedStyle', 'getSelection', 'matchMedia', 'moveBy', 'moveTo', 'open', 'postMessage', 'print', 'prompt', 'releaseEvents', 'removeEventListener', 'requestAnimationFrame', 'resizeBy', 'resizeTo', 'scroll', 'scrollBy', 'scrollTo', 'setInterval', 'setTimeout', 'stop'];
    wf.forEach(function(e) {
        w[e] = f;
    });
    var wn = ['devicePixelRatio', 'innerHeight', 'innerWidth', 'length', 'outerHeight', 'outerWidth', 'pageXOffset', 'pageYOffset', 'screenX', 'screenY', 'scrollX', 'scrollY'];
    wn.forEach(function(e) {
        w[e] = n;
    });
    var wo = ['applicationCache', 'caches', 'crypto', 'external', 'frameElement', 'frames', 'history', 'indexedDB', 'localStorage', 'location', 'locationbar', 'menubar', 'navigator', 'onabort', 'onanimationend', 'onanimationiteration', 'onanimationstart', 'onbeforeunload', 'onblur', 'oncanplay', 'oncanplaythrough', 'onchange', 'onclick', 'oncontextmenu', 'ondblclick', 'ondevicemotion', 'ondeviceorientation', 'ondrag', 'ondragend', 'ondragenter', 'ondragleave', 'ondragover', 'ondragstart', 'ondrop', 'ondurationchange', 'onemptied', 'onended', 'onerror', 'onfocus', 'onhashchange', 'oninput', 'oninvalid', 'onkeydown', 'onkeypress', 'onkeyup', 'onlanguagechange', 'onload', 'onloadeddata', 'onloadedmetadata', 'onloadstart', 'onmessage', 'onmousedown', 'onmouseenter', 'onmouseleave', 'onmousemove', 'onmouseout', 'onmouseover', 'onmouseup', 'onoffline', 'ononline', 'onpagehide', 'onpageshow', 'onpause', 'onplay', 'onplaying', 'onpopstate', 'onprogress', 'onratechange', 'onreset', 'onresize', 'onscroll', 'onseeked', 'onseeking', 'onselect', 'onshow', 'onstalled', 'onstorage', 'onsubmit', 'onsuspend', 'ontimeupdate', 'ontoggle', 'ontransitionend', 'onunload', 'onvolumechange', 'onwaiting', 'onwebkitanimationend', 'onwebkitanimationiteration', 'onwebkitanimationstart', 'onwebkittransitionend', 'onwheel', 'opener', 'parent', 'performance', 'personalbar', 'screen', 'scrollbars', 'self', 'sessionStorage', 'speechSynthesis', 'statusbar', 'toolbar', 'top'];
    wo.forEach(function(e) {
        w[e] = o;
    });
    var ws = ['name'];
    ws.forEach(function(e) {
        w[e] = s;
    });
})(document, window);

{decryptionScript};

Duktape.enc("base64", decoded);
