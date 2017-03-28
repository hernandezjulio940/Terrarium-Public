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

{decryptionScript};

decoded;
