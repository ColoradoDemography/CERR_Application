var analyzeResults = require("./analyzeResults.js");
var downloadCsv = require("./downloadCsv.js");


module.exports = function(data, match_results) {

    var results = [];

    //d: id city county
    //match_results: OBJECTID Orig_Street Orig_ZIP score match_addr locator addr_type lat lng


    data.forEach(function(d) {
        for (var i = 0; i < match_results.length; i++) {
            if (d.id === match_results[i].OBJECTID) {
                results.push({
                    "OBJECTID": d.id,
                    "Orig_Street": match_results[i].Orig_Street,
                    "Orig_ZIP": match_results[i].Orig_ZIP,
                    "Old_LGID": match_results[i].Old_LGID,
                    "score": match_results[i].score,
                    "match_addr": match_results[i].match_addr,
                    "locator": match_results[i].locator,
                    "addr_type": match_results[i].addr_type,
                    "lat": match_results[i].lat,
                    "lng": match_results[i].lng,
                    "city": d.city,
                    "county": d.county,
                    "New_LGID": d.place_lgid || d.county_lgid
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
    results.sort(compare);

    //make downloadable
    downloadCsv(results, "Results by Address");

    analyzeResults(data);
}