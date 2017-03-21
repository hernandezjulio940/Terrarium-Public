//Created by NitroXenon
//Github: https://github.com/NitroXenon/Terrarium-Public/blob/gh-pages/openload2.js
//This script hooks all the browser functions used in the descryption script
//eval() this script and you'll get the decoded url

//The output decoded value
var decodedValue = "";
//The encoded string
var encoded = "{encodedString}";
//This is our custom variable of r. It can be any string value. (Original e.g.: dy72acuj8w)
var r = "r";
//Custom document object (because document only presents in browser)
var document = {};
//Custom jQuery stuff
var $ = function(selector) {
    if (selector == '#streamurl') {
        //$("#streamurl") called
        return {
            //The final value is set by calling $("#streamurl").text(decodedValue)
            //So we need to hook this function to get the result
            //Result example: Djj9S0OU_XE~1490176146~14.199.0.0~P9V2fKPR
            text: function(result) {
                //$("#streamurl").text() called
                result = 'https://openload.co/stream/' + result + '?mime=true';
                decodedValue = result;
            }
        }
    } else if (selector == '#' + r) {
        return {
            //The encoded string is queried
            text: function() {
                return encoded;
            }
        }
    } else if (selector == document) {
        return {
            //Hook $(document).ready() because we're not in browser environment
            ready: function(func) {
                //$(document).ready() called
                func();
            }
        }
    } else {
        //unknown selector called
    }
}

/**
  *
  * The following is the decryption taken from the Openlaod embed webpage
  *
  */


{decryptionScript}

;

decodedValue;
