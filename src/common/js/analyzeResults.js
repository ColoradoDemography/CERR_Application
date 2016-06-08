var downloadCsv = require("./downloadCsv.js");

module.exports = function(data) {


    var notify_processed = document.createElement('div');
    notify_processed.innerHTML = "<p>Data mapped to City/County combinations.  Processing final reports....</p>";
    document.body.appendChild(notify_processed);

    var placeCount = {};

    data.forEach(function(d) {

        if (!placeCount[d.city + "|" + d.county]) {
            placeCount[d.city + "|" + d.county] = {};
            placeCount[d.city + "|" + d.county].city = d.city;
            placeCount[d.city + "|" + d.county].county = d.county;
            placeCount[d.city + "|" + d.county].count = 1;
        } else {
            placeCount[d.city + "|" + d.county].count++;
        }

    });

    var collapsed_result = [];
    for (var key in placeCount) {
        collapsed_result.push(placeCount[key]);
    }

    //sort by county, then place
    function compare(a, b) {

        if ((a.county + a.city) < (b.county + b.city)) {
            return -1;
        } else if ((a.county + a.city) > (b.county + b.city)) {
            return 1;
        } else {
            return 0;
        }

    }

    //sort data
    collapsed_result.sort(compare);


    //create download link
    downloadCsv(collapsed_result, 'Total Count by City and County');


}