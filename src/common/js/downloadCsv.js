var Papa = require("../../lib/js/papaparse.js");
var saveAs = require("../../lib/js/file-saver.js").saveAs;

module.exports = function(objArray, link_text) {


    var str = Papa.unparse(objArray);


    var spacer = document.createElement("span");
    var whitespace = document.createTextNode("\u00A0\u00A0\u00A0\u00A0");
    spacer.appendChild(whitespace);
    var link = document.createElement("span");

    link.innerHTML = "-" + link_text + "-";
    document.body.appendChild(link);
    document.body.appendChild(whitespace);

    var blob = new Blob([str], {
        type: "text/csv;charset=utf-8"
    });
    link.addEventListener('click', function() {
        saveAs(blob, link_text + '.csv');
    });


}