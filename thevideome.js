/* TheVideoDecoder - A script which will be executed by Duktape to extract TheVideo.me links
 * 
 * Copyright (C) 2017 NitroXenon
 * 
 * This software is released under the GPLv3 License.

Copyright (C) 2015 NitroXenon
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
var TheVideoDecoder = {
    decode: function(url, html) {
        Log.d("Start decoding in JS now...");

        var results = [];

        var keyMatch = /thief\s*=\s*['"]([^'"]+?)['"]/g.exec(html);
        
        if (keyMatch == null)
            return JSON.stringify(results);
        
        var key = "";
        
        if (keyMatch != null)
            key = keyMatch[1];
        
        key = key.replace("+", "");
        
        var getVtLink = "https://thevideo.me/vsign/player/" + key;
        var getVtLinkResult = Http.get(getVtLink, url);

        Log.d("key = " + key);
        Log.d("getVtLink = " + getVtLink);
        Log.d("getVtLinkResult = " + getVtLinkResult);

        var vtMatch = /\|([a-z0-9]{40}[a-z0-9]+?)\|/g.exec(getVtLinkResult);
        if (vtMatch == null)
            return JSON.stringify(results);

        var vt = vtMatch[1];

        var linkMatches = getMatches(html, /"file"\s*:\s*"([^"]+)"\s*,\s*"label"\s*:\s*"([^"]+)/g, 1);
        var qualityMatches = getMatches(html, /"file"\s*:\s*"([^"]+)"\s*,\s*"label"\s*:\s*"([^"]+)/g, 2);

        for (var i = 0; i < linkMatches.length; i++) {
            try {
                var link = linkMatches[i] + "?direct=false&ua=1&vt=" + vt;
                var quality = qualityMatches[i];

                Log.d("link = " + link);
                Log.d("quality = " + quality);

                results.push({
                    quality: quality,
                    link: link
                });
            } catch (err) {
                Log.d(err.message);
            }
        }

        return JSON.stringify(results);
    },
    isEnabled: function() {
        return true;
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
