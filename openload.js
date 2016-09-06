/* OpenloadDecoder - A script which will be executed by Duktape to extract Openload links
 * 
 * Copyright (C) 2016 NitroXenon
 * 
 * This software is released under the MIT License.
 * http://opensource.org/licenses/mit-license.php
 */
var OpenloadDecoder = {
    decode: function(html) {
        Log.log("Start decoding in JS now...");
        //Log.log("html = " + html);

        var hiddenUrlPattern = /hiddenurl">(.+?)<\/span>/i;
        var hiddenUrl = hiddenUrlPattern.exec(html)[1];
        if (hiddenUrl == undefined)
            return;
        hiddenUrl = unescape(hiddenUrl);
        Log.log("hiddenUrl = " + hiddenUrl);

        var decodes = [];
        var scriptPattern = /<script[^>]*>([\s\S]*?)<\/script>/g;
        var scriptMatches = getMatches(html, scriptPattern, 1);
        for (var i = 0; i < scriptMatches.length; i++) {
            var script = scriptMatches[i];
            //Log.log("Found <script> : " + script);
            var aaEncodedPattern = /(ﾟωﾟﾉ[\s\S]*?\('_'\);)/;
            //var aaEncodedPattern = /(\uFF9F\u03C9\uFF8F\uFF89[\s\S]*?\('_'\);)/;
            var aaEncodedArr = aaEncodedPattern.exec(script);
            if (aaEncodedArr != null) {
                var aaEncoded = aaEncodedArr[1];
                //Log.log("aaEncoded = " + aaEncoded);
                var aaDecoded = "";
                try {
                    aaDecoded = AADecode.decode(aaEncoded);
                } catch (err) {
                    Log.log("Error occured while decoding AA : " + err.message);
                }
                Log.log("aaDecoded = " + aaDecoded);
                decodes.push(aaDecoded);
            }
        }
    }
};

function getMatches(string, regex, index) {
    index || (index = 1); // default to the first capturing group
    var matches = [];
    var match;
    while (match = regex.exec(string)) {
        matches.push(match[index]);
    }
    return matches;
}

/* AADecode - Decode encoded-as-aaencode JavaScript program.
 * Edited by NitroXenon to make it compatible with OpenloadDecoder
 * 
 * Copyright (C) 2010 @cat_in_136
 * 
 * This software is released under the MIT License.
 * http://opensource.org/licenses/mit-license.php
 */
var AADecode = {
    decode: function(text) {
        var evalPreamble = "(ﾟДﾟ) ['_'] ( (ﾟДﾟ) ['_'] (";
        var decodePreamble = "( (ﾟДﾟ) ['_'] (";
        var evalPostamble = ") (ﾟΘﾟ)) ('_');";
        var decodePostamble = ") ());";
        text = text.replace(/^\s*/, "").replace(/\s*$/, "");
        if (/^\s*$/.test(text)) return "";
        if (text.lastIndexOf(evalPreamble) < 0) throw new Error("Given code is not encoded as aaencode.");
        if (text.lastIndexOf(evalPostamble) != text.length - evalPostamble.length) throw new Error("Given code is not encoded as aaencode.");
        var decodingScript = text.replace(evalPreamble, decodePreamble).replace(evalPostamble, decodePostamble);
        return eval(decodingScript);
    }
};
