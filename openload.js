/* OpenloadDecoder - A script which will be executed by Duktape to extract Openload links
 * 
 * JavaScript (for Duktape Java) port of openload urlresolver plugin by tknorris.
 *
 * Original plugin in Python : 
 * https://github.com/tknorris/script.module.urlresolver/blob/master/lib/urlresolver/plugins/ol_gmu.py
 * 
 * Copyright (C) 2016 NitroXenon
 * 
 * This software is released under the GPLv3 License.

openload.io urlresolver plugin
Copyright (C) 2015 tknorris
This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.
This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU General Public License for more details.
You should have received a copy of the GNU General Public License
along with this program. If not, see <http://www.gnu.org/licenses/>.
*/
const DOTALL = 32;
const CASE_INSENSITIVE = 2;

var OpenloadDecoder = {
    decode: function(html) {
        Log.d("Start decoding in JS now...");

        var results = [];

        try {
            html = unpackHtml(html);
        } catch (err) {
            Log.d(err.toString());
        }

        //Try to get link using eval() first
        try {
            var scriptPattern = /<script[^>]*>([\s\S]*?)<\/script>/gi;
            var scriptMatches = getMatches(html, scriptPattern, 1);
            for (var i = 0; i < scriptMatches.length; i++) {
                var script = scriptMatches[i];
                //var aaEncodedPattern = /(ﾟωﾟﾉ[\s\S]*?\('_'\);)/;
                var aaEncodedPattern = /(\uFF9F\u03C9\uFF9F\uFF89[\s\S]*?\('_'\);)/g;
                var aaEncodedArr = getMatches(script, aaEncodedPattern, 1);
                for (var j = 0; j < aaEncodedArr.length; j++) {
                    var aaEncoded = aaEncodedArr[j];
                    var aaDecoded = "";
                    try {
                        aaDecoded = aadecode(aaEncoded);
                    } catch (err) {
                        Log.d("Error decoding AA : " + err.message);
                    }
                    Log.d("aaDecoded = " + aaDecoded);

                    var jsDocReadyPattern = /\$\(.*\)\.ready\(\s*function\(.*\)\s*{([\s\S]*?)}\);/g;
                    var jsDocReadyArr = jsDocReadyPattern.exec(aaDecoded);

                    if (jsDocReadyArr == null)
                        continue;

                    var jsDocReady = jsDocReadyArr[1];
                    Log.d("jsDocReady = " + jsDocReady);

                    var jsVarPattern = /var\s+(.*?)\s*=\s*\$\(['"]#(.*?)['"]\)\.text\(\);/gi;
                    var jsVarNameArr = getMatches(jsDocReady, jsVarPattern, 1);
                    var jsTagIdArr = getMatches(jsDocReady, jsVarPattern, 2);

                    if (jsVarNameArr.length <= 0 || jsTagIdArr.length <= 0)
                        continue;

                    for (var i = 0; i < jsVarNameArr.length; i++) {
                        var jsVarName = jsVarNameArr[i];
                        var jsTagId = jsTagIdArr[i];

                        Log.d("jsVarName = " + jsVarName);
                        Log.d("jsTagId = " + jsTagId);

                        var htmlSpanPattern = new RegExp("<span id=\"" + jsTagId + "\">(.*?)</span>", "g");
                        var htmlSpanArr = htmlSpanPattern.exec(html);

                        if (htmlSpanArr == null)
                            continue;

                        var htmlSpan = newUnescape(htmlSpanArr[1]);

                        Log.d("htmlSpan = " + htmlSpan);

                        jsDocReady = jsDocReady.replace(new RegExp("var\\s+" + jsVarName + "\\s*=\\s*\\$\\(['\"]#.*['\"]\\)\\.text\\(\\);", "g"), "var " + jsVarName + " = \"" + htmlSpan.replace(/"/g, "\\\"") + "\";");
                    }

                    jsDocReady = jsDocReady.replace(/\$\(['"].+['"]\)\.text\((.+?)\);/g, "($1);");
                    Log.d("New jsDocReady = " + jsDocReady);

                    var jsToBeEvaluated = aaDecoded.replace(/\$\(.*\)\.ready\(\s*function\(.*\)\s*{[\s\S]*?}\);/g, jsDocReady);
                    Log.d("jsToBeEvaluated = " + jsToBeEvaluated);

                    var evalResult = eval(jsToBeEvaluated);
                    Log.d("evalResult = " + evalResult);

                    var streamUrl = "https://openload.co/stream/" + evalResult + "?mime=true";
                    results.push(streamUrl);
                }
            }
        } catch (err) {
            Log.d("Error occurred while trying to get link using eval()\n" + err.message);
        }

        //Try to get link by decrypting the link
        try {
            var hiddenId = '';
            var decodes = [];
            var magicNumbers = getAllMagicNumbers();

            var hiddenUrlPattern = /<span[^>]*>([^<]+)<\/span>\s*<span[^>]*>[^<]+<\/span>\s*<span[^>]+id="streamurl"/gi;
            var hiddenUrl = hiddenUrlPattern.exec(html)[1];
            Log.d("hiddenUrl = " + hiddenUrl);
            if (hiddenUrl == undefined)
                return;

            hiddenUrl = newUnescape(hiddenUrl);
            Log.d("unescapedHiddenUrl = " + hiddenUrl);

            var hiddenUrlChars = getCharsFromString(hiddenUrl);
            var magic = 0;
            if (hiddenUrlChars.length > 1) {
                magic = hiddenUrlChars[hiddenUrlChars.length - 1].charCodeAt(0);
            }

            for (var x = 0; x < magicNumbers.length; x++) {
                var s = [];
                var magicNumber = magicNumbers[x];
                Log.d("magicNumber = " + magicNumber);

                for (var i = 0; i < hiddenUrlChars.length; i++) {
                    var c = hiddenUrlChars[i];
                    var j = c.charCodeAt(0);
                    //Log.d("c = " + c + "; j = " + j);

                    if (j == magic)
                        j -= 1;
                    else if (j == magic - 1)
                        j += 1;

                    if (j >= 33 & j <= 126)
                        j = 33 + ((j + 14) % 94);

                    if (i == (hiddenUrl.length - 1))
                        j += parseInt(magicNumber);

                    s.push(String.fromCharCode(j));
                }
                var res = s.join('');
                Log.d("res = " + res);

                results.push("https://openload.co/stream/" + res + "?mime=true");
            }
        } catch (err) {
            Log.d("Error occurred while trying to get link by decrypting the link\n" + err.message);
        }

        return JSON.stringify(results);
    },
    isEnabled: function() {
        return false;
    }
};

function unpackHtml(html) {
    Log.d("unpacking html");

    var replaceArr = ['j', '_', '__', '___'];

    var stringsPattern = '\\{\\s*var\\s+a\\s*=\\s*"([^"]+)';
    var strings = getJavaRegexMatches(html, stringsPattern, 1, CASE_INSENSITIVE);
    Log.d("stringsLen = " + strings.length);

    if (strings.length <= 0)
        return html;

    var shiftsPattern = "\\)\\);\\}\\((\\d+)\\)";
    var shifts = getJavaRegexMatches(html, shiftsPattern, 1, -1);
    var zippedArr = zip(strings, shifts);

    for (var i = 0, len = zippedArr.length; i < len; ++i) {
        var arr = zippedArr[i];
        var str = arr[0];
        var shift = arr[1];

        Log.d("str = " + str);
        Log.d("shift = " + shift);

        var res = caesarShift(str, parseInt(shift));
        res = JavaUrlDecoder.decode(res);

        for (j = 0, len2 = replaceArr.length; j < len2; ++j) {
            res = res.replace(j.toString(), replaceArr[j]);
        }

        html += ("<script>" + res + "</script>");

        Log.d("res = " + res);
    }

    return html;
}

function caesarShift(s, shift) {
    if (!shift)
        shift = 13;
    else
        shift = parseInt(shift);

    var s2 = "";
    var z = "Z";
    var zCode = z.charCodeAt(0);
    var chars = getCharsFromString(s);

    for (var i = 0, len = chars.length; i < len; ++i) {
        var c = chars[i];
        var cCode = c.charCodeAt(0);
        if (isAlpha(c)) {
            var limit;
            if (cCode <= zCode)
                limit = 90;
            else
                limit = 122;
            //Log.d("limit = " + limit);

            var newCode = cCode + shift;
            if (newCode > limit) {
                newCode = newCode - 26;
            }
            s2 += String.fromCharCode(newCode);
        } else {
            s2 += c;
        }
    }

    Log.d("s2 = " + s2);

    return s2;
}

function getAllMagicNumbers(decodes) {
    /*
    var magicNumbers = [];
    if (decodes.length > 0) {
        var charDecodePattern = /charCodeAt\(\d+\)\s*\+\s*(\d+)\)/g;
        for (var i = 0; i < decodes.length; i++) {
            var decodedStr = decodes[i];
            var charDecodeArr = charDecodePattern.exec(decodedStr);
            if (charDecodeArr == null || charDecodeArr.length <= 0 || charDecodeArr[1] == undefined)
                continue;
            magicNumbers.push(charDecodeArr[1]);
            break;
        }
    }

    if (magicNumbers.length <= 0) {
        magicNumbers = [0, 1, 2, 3, 4];
    }
    return magicNumbers;
    */

    return [3];
}

function getMatches(string, regex, index) {
    index || (index = 1); // default to the first capturing group
    var matches = [];
    var match;
    while (match = regex.exec(string)) {
        matches.push(match[index]);
    }
    return matches;
}

function isAlpha(s) {
    return /^[a-zA-Z()]+$/.test(s);
}

function zip(x, y) {
    return x.map(function(e, i) {
        return [e, y[i]];
    });
}

function getCharsFromString(s) {
    return s.split(/(?=(?:[\0-\t\x0B\f\x0E-\u2027\u202A-\uD7FF\uE000-\uFFFF]|[\uD800-\uDBFF][\uDC00-\uDFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]))/);
}

function getJavaRegexMatches(string, regex, index, mode) {
    if (mode && mode > -1)
        return JSON.parse(JavaRegex.findAllWithMode(string, regex, index, mode));
    else
        return JSON.parse(JavaRegex.findAll(string, regex, index));
}

/*!
 * unescape <https://github.com/jonschlinkert/unescape>
 * Edited by NitroXenon to make it compatible with OpenloadDecoder 
 *
 * Copyright (c) 2014 Jon Schlinkert, contributors.
 *
 * Licensed under the MIT License
 */

/**
 * Convert HTML entities to HTML characters.
 *
 * @param  {String} `str` String with HTML entities to un-escape.
 * @return {String}
 */

var newUnescape = function(str) {
    if (str == null) return '';

    var re = new RegExp('(' + Object.keys(chars)
        .join('|') + ')', 'g');

    return String(str).replace(re, function(match) {
        return chars[match];
    });
};

var chars = {
    '&#39;': '\'',
    '&amp;': '&',
    '&gt;': '>',
    '&lt;': '<',
    '&quot;': '"'
};

/* AADecode - Decode encoded-as-aaencode JavaScript program.
 * Edited by NitroXenon to make it compatible with OpenloadDecoder
 * 
 * Copyright (C) 2010 @cat_in_136
 * 
 * This software is released under the MIT License.
 * http://opensource.org/licenses/mit-license.php
 */

function aadecode(text) {
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

/*
 * jjdecode function written by Syed Zainudeen
 * Edited by NitroXenon to make it compatible with OpenloadDecoder
 */
function jjdecode(t) {
    var result = "";

    //clean it
    t = t.replace(/^\s+|\s+$/g, "");

    var startpos;
    var endpos;
    var gv;
    var gvl;

    if (t.indexOf("\"\'\\\"+\'+\",") == 0) //palindrome check
    {
        //locate jjcode
        startpos = t.indexOf('$$+"\\""+') + 8;
        endpos = t.indexOf('"\\"")())()');

        //get gv
        gv = t.substring((t.indexOf('"\'\\"+\'+",') + 9), t.indexOf("=~[]"));
        gvl = gv.length;
    } else {
        //get gv
        gv = t.substr(0, t.indexOf("="));
        gvl = gv.length;

        //locate jjcode
        startpos = t.indexOf('"\\""+') + 5;
        endpos = t.indexOf('"\\"")())()');
    }

    if (startpos == endpos) {
        throw new Error("No data !");
    }

    //start decoding
    var data = t.substring(startpos, endpos);

    //hex decode string
    var b = ["___+", "__$+", "_$_+", "_$$+", "$__+", "$_$+", "$$_+", "$$$+", "$___+", "$__$+", "$_$_+", "$_$$+", "$$__+", "$$_$+", "$$$_+", "$$$$+"];

    //lotu
    var str_l = "(![]+\"\")[" + gv + "._$_]+";
    var str_o = gv + "._$+";
    var str_t = gv + ".__+";
    var str_u = gv + "._+";

    //0123456789abcdef
    var str_hex = gv + ".";

    //s
    var str_s = '"';
    var gvsig = gv + ".";

    var str_quote = '\\\\\\"';
    var str_slash = '\\\\\\\\';

    var str_lower = "\\\\\"+";
    var str_upper = "\\\\\"+" + gv + "._+";

    var str_end = '"+'; //end of s loop



    while (data != "") {
        //l o t u
        if (0 == data.indexOf(str_l)) {
            data = data.substr(str_l.length);
            result = result + "l";
            continue;
        } else if (0 == data.indexOf(str_o)) {
            data = data.substr(str_o.length);
            result = result + "o";
            continue;
        } else if (0 == data.indexOf(str_t)) {
            data = data.substr(str_t.length);
            result = result + "t";
            continue;
        } else if (0 == data.indexOf(str_u)) {
            data = data.substr(str_u.length);
            result = result + "u";
            continue;
        }

        //0123456789abcdef
        if (0 == data.indexOf(str_hex)) {
            data = data.substr(str_hex.length);

            //check every element of hex decode string for a match 
            var i = 0;
            for (i = 0; i < b.length; i++) {
                if (0 == data.indexOf(b[i])) {
                    data = data.substr((b[i]).length);
                    result = result + i.toString(16);
                    break;
                }
            }
            continue;
        }

        //start of s block
        if (0 == data.indexOf(str_s)) {
            data = data.substr(str_s.length);

            //check if "R
            if (0 == data.indexOf(str_upper)) // r4 n >= 128
            {
                data = data.substr(str_upper.length); //skip sig

                var ch_str = "";
                for (j = 0; j < 2; j++) //shouldn't be more than 2 hex chars
                {
                    //gv + "."+b[ c ]				
                    if (0 == data.indexOf(gvsig)) {
                        data = data.substr(gvsig.length); //skip gvsig	

                        for (k = 0; k < b.length; k++) //for every entry in b
                        {
                            if (0 == data.indexOf(b[k])) {
                                data = data.substr(b[k].length);
                                ch_str += k.toString(16) + "";
                                break;
                            }
                        }
                    } else {
                        break; //done
                    }
                }

                result = result + String.fromCharCode(parseInt(ch_str, 16));
                continue;
            } else if (0 == data.indexOf(str_lower)) //r3 check if "R // n < 128
            {
                data = data.substr(str_lower.length); //skip sig

                var ch_str = "";
                var ch_lotux = ""
                var temp = "";
                var b_checkR1 = 0;
                for (j = 0; j < 3; j++) //shouldn't be more than 3 octal chars
                {

                    if (j > 1) //lotu check
                    {
                        if (0 == data.indexOf(str_l)) {
                            data = data.substr(str_l.length);
                            ch_lotux = "l";
                            break;
                        } else if (0 == data.indexOf(str_o)) {
                            data = data.substr(str_o.length);
                            ch_lotux = "o";
                            break;
                        } else if (0 == data.indexOf(str_t)) {
                            data = data.substr(str_t.length);
                            ch_lotux = "t";
                            break;
                        } else if (0 == data.indexOf(str_u)) {
                            data = data.substr(str_u.length);
                            ch_lotux = "u";
                            break;
                        }
                    }

                    //gv + "."+b[ c ]							
                    if (0 == data.indexOf(gvsig)) {
                        temp = data.substr(gvsig.length);
                        for (k = 0; k < 8; k++) //for every entry in b octal
                        {
                            if (0 == temp.indexOf(b[k])) {
                                if (parseInt(ch_str + k + "", 8) > 128) {
                                    b_checkR1 = 1;
                                    break;
                                }

                                ch_str += k + "";
                                data = data.substr(gvsig.length); //skip gvsig
                                data = data.substr(b[k].length);
                                break;
                            }
                        }

                        if (1 == b_checkR1) {
                            if (0 == data.indexOf(str_hex)) //0123456789abcdef
                            {
                                data = data.substr(str_hex.length);

                                //check every element of hex decode string for a match 
                                var i = 0;
                                for (i = 0; i < b.length; i++) {
                                    if (0 == data.indexOf(b[i])) {
                                        data = data.substr((b[i]).length);
                                        ch_lotux = i.toString(16);
                                        break;
                                    }
                                }

                                break;
                            }
                        }
                    } else {
                        break; //done
                    }
                }

                result = result + (String.fromCharCode(parseInt(ch_str, 8)) + ch_lotux);
                continue; //step out of the while loop
            } else //"S ----> "SR or "S+
            {

                // if there is, loop s until R 0r +
                // if there is no matching s block, throw error

                var match = 0;
                var n;

                //searching for mathcing pure s block
                while (true) {
                    n = data.charCodeAt(0);
                    if (0 == data.indexOf(str_quote)) {
                        data = data.substr(str_quote.length);
                        result = result + '"';
                        match += 1;
                        continue;
                    } else if (0 == data.indexOf(str_slash)) {
                        data = data.substr(str_slash.length);
                        result = result + '\\';
                        match += 1;
                        continue;
                    } else if (0 == data.indexOf(str_end)) //reached end off S block ? +
                    {
                        if (match == 0) {
                            throw new Error("+ no match S block: " + data);
                        }
                        data = data.substr(str_end.length);

                        break; //step out of the while loop
                    } else if (0 == data.indexOf(str_upper)) //r4 reached end off S block ? - check if "R n >= 128
                    {
                        if (match == 0) {
                            throw new Error("no match S block n>128: " + data);
                        }

                        data = data.substr(str_upper.length); //skip sig

                        var ch_str = "";
                        var ch_lotux = "";
                        for (j = 0; j < 10; j++) //shouldn't be more than 10 hex chars
                        {

                            if (j > 1) //lotu check
                            {
                                if (0 == data.indexOf(str_l)) {
                                    data = data.substr(str_l.length);
                                    ch_lotux = "l";
                                    break;
                                } else if (0 == data.indexOf(str_o)) {
                                    data = data.substr(str_o.length);
                                    ch_lotux = "o";
                                    break;
                                } else if (0 == data.indexOf(str_t)) {
                                    data = data.substr(str_t.length);
                                    ch_lotux = "t";
                                    break;
                                } else if (0 == data.indexOf(str_u)) {
                                    data = data.substr(str_u.length);
                                    ch_lotux = "u";
                                    break;
                                }
                            }

                            //gv + "."+b[ c ]				
                            if (0 == data.indexOf(gvsig)) {
                                data = data.substr(gvsig.length); //skip gvsig

                                for (k = 0; k < b.length; k++) //for every entry in b
                                {
                                    if (0 == data.indexOf(b[k])) {
                                        data = data.substr(b[k].length);
                                        ch_str += k.toString(16) + "";
                                        break;
                                    }
                                }
                            } else {
                                break; //done
                            }
                        }

                        result = result + String.fromCharCode(parseInt(ch_str, 16));
                        break; //step out of the while loop
                    } else if (0 == data.indexOf(str_lower)) //r3 check if "R // n < 128
                    {
                        if (match == 0) {
                            throw new Error("no match S block n<128: " + data);
                        }

                        data = data.substr(str_lower.length); //skip sig

                        var ch_str = "";
                        var ch_lotux = ""
                        var temp = "";
                        var b_checkR1 = 0;
                        for (j = 0; j < 3; j++) //shouldn't be more than 3 octal chars
                        {

                            if (j > 1) //lotu check
                            {
                                if (0 == data.indexOf(str_l)) {
                                    data = data.substr(str_l.length);
                                    ch_lotux = "l";
                                    break;
                                } else if (0 == data.indexOf(str_o)) {
                                    data = data.substr(str_o.length);
                                    ch_lotux = "o";
                                    break;
                                } else if (0 == data.indexOf(str_t)) {
                                    data = data.substr(str_t.length);
                                    ch_lotux = "t";
                                    break;
                                } else if (0 == data.indexOf(str_u)) {
                                    data = data.substr(str_u.length);
                                    ch_lotux = "u";
                                    break;
                                }
                            }

                            //gv + "."+b[ c ]							
                            if (0 == data.indexOf(gvsig)) {
                                temp = data.substr(gvsig.length);
                                for (k = 0; k < 8; k++) //for every entry in b octal
                                {
                                    if (0 == temp.indexOf(b[k])) {
                                        if (parseInt(ch_str + k + "", 8) > 128) {
                                            b_checkR1 = 1;
                                            break;
                                        }

                                        ch_str += k + "";
                                        data = data.substr(gvsig.length); //skip gvsig
                                        data = data.substr(b[k].length);
                                        break;
                                    }
                                }

                                if (1 == b_checkR1) {
                                    if (0 == data.indexOf(str_hex)) //0123456789abcdef
                                    {
                                        data = data.substr(str_hex.length);

                                        //check every element of hex decode string for a match 
                                        var i = 0;
                                        for (i = 0; i < b.length; i++) {
                                            if (0 == data.indexOf(b[i])) {
                                                data = data.substr((b[i]).length);
                                                ch_lotux = i.toString(16);
                                                break;
                                            }
                                        }
                                    }
                                }
                            } else {
                                break; //done
                            }
                        }

                        result = result + (String.fromCharCode(parseInt(ch_str, 8)) + ch_lotux);
                        break; //step out of the while loop
                    } else if ((0x21 <= n && n <= 0x2f) || (0x3A <= n && n <= 0x40) || (0x5b <= n && n <= 0x60) || (0x7b <= n && n <= 0x7f)) {
                        result = result + data.charAt(0);
                        data = data.substr(1);
                        match += 1;
                    }

                }
                continue;
            }
        }

        throw new Error("no match : " + data);
        break;
    }

    return result;
}
