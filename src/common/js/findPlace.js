var resultsByAddress = require("./resultsByAddress.js");

module.exports = function(compiled_results, match_results) {


    var BATCH_COUNT = 500; //number of records processed per each geocode batch request
    var BATCH_STAGGER = 2000; //ms between each geocode batch request

    var batchindex = 0;
    var placebatch = [];
    placebatch[batchindex] = [];
    var counter = 0;

    for (var k = 0; k < compiled_results.length; k++) {
        placebatch[batchindex].push(compiled_results[k]);
        counter++;
        if (counter === BATCH_COUNT) {
            batchindex++;
            placebatch[batchindex] = [];
            counter = 0;
        }
    }


    var begin_pt2pl = document.createElement('div');
    begin_pt2pl.innerHTML = "<p>Looking up City/County...</p>";
    document.body.appendChild(begin_pt2pl);

    var JSONObject = {};
    var xhr = [];

    var promisearray = placebatch.map(function(d, i) {

        //stagger requests using setTimeout

        return new Promise(function(resolve, reject) {

            window.setTimeout(function() {

                JSONObject = {};
                JSONObject.data = placebatch[i];
                JSONObject.districts = "false";

                xhr[i] = new XMLHttpRequest();
                xhr[i].open('POST', 'https:/gis.dola.colorado.gov/pt2pl/place');
                xhr[i].setRequestHeader("content-type", "application/json");

                xhr[i].send(JSON.stringify(JSONObject));

                xhr[i].onreadystatechange = function() {
                    if (xhr[i].readyState === 4) {
                        if (xhr[i].status === 200) {
                            var data = xhr[i].responseText;
                            var parsed_response = JSON.parse(data);
                            resolve(parsed_response);
                        } else {
                            reject('Error: ' + xhr[i].status);
                        }
                    }
                };

            }, i * BATCH_STAGGER);

        });

    }); //end placebatch map

    Promise.all(promisearray).then(function(values) {

        //push back into big array
        var parsed_response = [];

        values.forEach(function(d) {
            d.forEach(function(e) {

                parsed_response.push(e);

            });
        });

        resultsByAddress(parsed_response, match_results);
    });


}