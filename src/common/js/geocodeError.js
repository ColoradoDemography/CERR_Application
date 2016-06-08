var downloadCsv = require("./downloadCsv.js");

module.exports = function(invalid_results, original_data) {



    //rejoin invalid_results with original dataset via array.map
    var error_results = [];

    invalid_results.forEach(function(d) {
        for (var i = 0; i < original_data.length; i++) {
            if (d === original_data[i].attributes.OBJECTID) {
                error_results.push({
                    "OBJECTID": d,
                    "Street": original_data[i].attributes.Street,
                    "ZIP": original_data[i].attributes.ZIP,
                    "Old_LGID": original_data[i].attributes.Old_LGID
                });
            }
        }

    });

    //sort by county, then place
    function compare(a, b) {

        if (a.OBJECTID < b.OBJECTID) {
            return -1;
        } else if (a.OBJECTID > b.OBJECTID) {
            return 1;
        } else {
            return 0;
        }

    }

    //sort by id
    error_results.sort(compare);

    //make downloadable
    downloadCsv(error_results, "Geocode Error");


}