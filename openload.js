/* OpenloadDecoder - A script which will be executed by Duktape to extract Openload links
 * 
 * Copyright (C) 2017 NitroXenon
 * 
 * This software is released under the GPLv3 License.
 */
const DOTALL = 32;
const CASE_INSENSITIVE = 2;

var OpenloadDecoder = {
    decode: function(html) {
        Log.d("Start decoding in JS now...");

        var results = [];

        /*
        try {
            html = unpackHtml(html);
        } catch (err) {
            Log.d(err.toString());
        }
        */

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
                    try {
                        var aaEncoded = aaEncodedArr[j];
                        var aaDecoded = aadecode(aaEncoded);

                        //Log.d("aaDecoded = " + aaDecoded);

                        var idPattern = /window\.r\s*=\s*['"]([^'^"]+?)['"]/gi;
                        var id = idPattern.exec(aaDecoded)[1];
                        Log.d("id = " + id);

                        var spanPattern = new RegExp('<span[^>]+?id="' + id + '[^"]*?"[^>]*?>([^<]+?)</span>', 'gi');
                        var spanMatches = getMatches(html, spanPattern, 1);

                        for (var spanIdx = 0; spanIdx < spanMatches.length; spanIdx++) {
                            try {
                                var encoded = spanMatches[spanIdx];

                                Log.d("encoded = " + encoded);

                                /*
                                 * 2017-03-19 Openload decode algo
                                 * Credit: samsamsam (https://gitlab.com/samsamsam) (https://github.com/samsamsam-iptvplayer)
                                 *
                                 * The following algo code is a JavaScript port from samsamsam's awesome work
                                 *
                                 * Original algo in Python by samsamsam:
                                 * https://gitlab.com/iptvplayer-for-e2/iptvplayer-for-e2/commit/31d575760a1803e5e88a43be0a8d560635c655cf
                                 */

                                var y = encoded.charCodeAt(0);
                                var e = y - 0x37;
                                var d = Math.max(2, e);
                                e = Math.min(d, encoded.length - 0x24 - 2);
                                var t = encoded.substr(e, 0x24);
                                var h = 0;
                                var g = [];

                                while (h < t.length) {
                                    var f = t.substr(h, 3);
                                    g.push(parseInt(f, 0x8));
                                    h += 3;
                                }

                                var v = encoded.substr(0, e).toString() + encoded.substr(e + 0x24, encoded.length).toString();
                                var p = [];
                                var i = 0;

                                h = 0;
                                while (h < v.length) {
                                    var B = v.substr(h, 2);
                                    var C = v.substr(h, 3);
                                    var f = parseInt(B, 0x10);

                                    h += 0x2;

                                    if (i % 3 == 0) {
                                        f = parseInt(C, 8);
                                        h += 1
                                    } else if (i % 2 == 0 && i != 0 && v.charCodeAt(i - 1) < 0x3C) {
                                        f = parseInt(C, 0xA);
                                        h += 1;
                                    }

                                    A = g[i % 0x7];
                                    f ^= 0xD5;
                                    f ^= A;
                                    p.push(String.fromCharCode(f));
                                    i += 1;
                                }

                                var decodedUrl = "";
                                for (var u = 0; u < p.length; u++) {
                                    var w = p[u].toString();
                                    decodedUrl += w;
                                }

                                var streamUrl = "https://openload.co/stream/" + decodedUrl + "?mime=true";
                                Log.d("streamUrl = " + streamUrl);

                                results.push(streamUrl);
                            } catch (err) {
                                Log.d("Error " + err.message);
                            }
                        }
                    } catch (err2) {
                        Log.d("Error " + err2.message);
                    }
                }
            }
        } catch (err3) {
            Log.d("Error occurred while trying to get link using eval()\n" + err3.message);
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

function sortObject(obj) {
    return Object.keys(obj).sort().reduce(function(result, key) {
        result[key] = obj[key];
        return result;
    }, {});
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
