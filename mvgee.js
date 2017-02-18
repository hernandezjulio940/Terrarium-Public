/* MvGee Firewall Bypasser - A script which will be executed by Duktape to bypass MvGee custom firewall
 * 
 * Copyright (C) 2017 NitroXenon
 * 
 * This software is released under the GPLv3 License.
Copyright (C) 2016 NitroXenon
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
var MvGeeFirewallBypasser = {
    bypass: function(url, html) {
        try {
            var challengeMatch = /<input[^>]*id="chain"[^>]*challenge="([^"]+)"/gi.exec(html);

            if (!challengeMatch || challengeMatch == null || challengeMatch == undefined || challengeMatch.length < 2)
                return;

            var challenge = challengeMatch[1];
            var decryptedChallenge = hashFnc(challenge);
            var challengePostLink = "http://mvgee.com/io/1.0/firewall";

            Log.d("challenge = " + challenge);
            Log.d("decryptedChallenge = " + decryptedChallenge);
            Log.d("challengePostLink = " + challengePostLink);
          
            //Post url, post data, referer
            Http.post(challengePostLink, decryptedChallenge, url);
        } catch (err) {
            Log.d(err.toString());
        }
    },
    isEnabled: function() {
        return true;
    }
};

//Extracted from the Firewall page (human verification)
var hashFnc = function(a) {
        for (var e, f, g, h, i, j, m, b = 0, c = 0, d = [], k = [e = 0x67452301, f = 0xEFCDAB89, ~e, ~f, 0xC3D2E1F0], l = [], n = decodeURI(encodeURI(a)), o = n.length; c <= o;) l[c >> 2] |= (n.charCodeAt(c) || 128) << 8 * (3 - c++ % 4);
        for (l[m = o + 8 >> 2 | 15] = o << 3; b <= m; b += 16) {
            for (e = k, c = 0; c < 80; e = [0 | [(j = ((n = e[0]) << 5 | n >>> 27) + e[4] + (d[c] = c < 16 ? ~~l[b + c] : j << 1 | j >>> 31) + 1518500248) + ((f = e[1]) & (g = e[2]) | ~f & (h = e[3])), i = j + (f ^ g ^ h) + 341375144, j + (f & g | f & h | g & h) + 982459459, i + 1535294389][0 | c++/ 20], n, f << 30 | f >>> 2, g, h])j = d[c - 3] ^ d[c - 8] ^ d[c - 14] ^ d[c - 16];
                        for (c = 5; c;) k[--c] = k[c] + e[c] | 0
                    }
                    for (a = ""; c < 40;) a += (k[c >> 3] >> 4 * (7 - c++ % 8) & 15).toString(16);
                    return a
                }
