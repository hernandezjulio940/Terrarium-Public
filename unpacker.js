//
// Unpacker for Dean Edward's p.a.c.k.e.r, a part of javascript beautifier
// written by Einar Lielmanis <einar@jsbeautifier.org>
// edited by NitroXenon for Terrarium TV
//
// Coincidentally, it can defeat a couple of other eval-based compressors.
//
// usage:
//
// if (P_A_C_K_E_R.detect(some_string)) {
//     var unpacked = P_A_C_K_E_R.unpack(some_string);
// }
//
//
var Unpacker = {
    PATTERN: /(eval\(\(?function\(.*?(,0,\{\}\)\)|split\('\|'\)\)\)))/g,

    unpack: function(html) {
        var results = [];
        var matches = getMatches(html, Unpacker.PATTERN, 1)
        for (var i = 0; i < matches.length; i++) {
            var match = matches[i];
            results.push(P_A_C_K_E_R.unpack(match));
        }

        return JSON.stringify(results);
    },
}

var P_A_C_K_E_R = {
    PATTERN: /eval\(\(?function\(.*?(,0,\{\}\)\)|split\('\|'\)\)\))/g,

    detect: function(str) {
        return (P_A_C_K_E_R.get_chunks(str).length > 0);
    },

    get_chunks: function(str) {
        var chunks = str.match(P_A_C_K_E_R.PATTERN);
        return chunks ? chunks : [];
    },

    unpack: function(str) {
        var chunks = P_A_C_K_E_R.get_chunks(str),
            chunk;
        for (var i = 0; i < chunks.length; i++) {
            chunk = chunks[i].replace(/\n$/, '');
            str = str.split(chunk).join(P_A_C_K_E_R.unpack_chunk(chunk));
        }
        return str;
    },

    unpack_chunk: function(str) {
        var unpacked_source = '';
        var __eval = eval;
        if (P_A_C_K_E_R.detect(str)) {
            try {
                eval = function(s) { // jshint ignore:line
                    unpacked_source += s;
                    return unpacked_source;
                }; // jshint ignore:line
                __eval(str);
                if (typeof unpacked_source === 'string' && unpacked_source) {
                    str = unpacked_source;
                }
            } catch (e) {
                console.log(e.toString());
            }
        }
        eval = __eval; // jshint ignore:line
        return str;
    },
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
