var downloadCsv = require("./downloadCsv.js");


module.exports = function(match_report, original_data) {

    //rejoin invalid_results with original dataset via array.map
    var match_results = [];

    match_report.forEach(function(d) {
        for (var i = 0; i < original_data.length; i++) {
            if (d.id === original_data[i].attributes.OBJECTID) {
                match_results.push({
                    "OBJECTID": d.id,
                    "Old_LGID": original_data[i].attributes.Old_LGID,
                    "Orig_Street": original_data[i].attributes.Street,
                    "Orig_ZIP": original_data[i].attributes.ZIP,
                    "score": d.score,
                    "match_addr": (d.match_addr).replace(/,/g, " "),
                    "locator": d.locator,
                    "addr_type": d.addr_type,
                    "lat": d.lat,
                    "lng": d.lng
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
    match_results.sort(compare);

    //make downloadable
    downloadCsv(match_results, "Geocode Match");

    return match_results;

}