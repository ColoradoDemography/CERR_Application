var geocodeMatch = require("./geocodeMatch.js");
var geocodeError = require("./geocodeError.js");
var findPlace = require("./findPlace.js");


module.exports = function(batch, original_data) {



    var BATCH_STAGGER = 2000; //ms between each geocode batch request


    var str_addresses = [];
    var xhr = [];

    var completebatch = batch.map(function(d, i) {

        //stagger requests using setTimeout


        return new Promise(function(resolve, reject) {
            window.setTimeout(function() {
                str_addresses[i] = encodeURIComponent(JSON.stringify(batch[i]));

                xhr[i] = new XMLHttpRequest();
                xhr[i].open('POST', 'https://gis.state.co.us/oit/rest/services/Addresses/SALocation/GeocodeServer/geocodeAddresses');
                xhr[i].setRequestHeader("Content-type", "application/x-www-form-urlencoded");
                xhr[i].send("addresses=" + str_addresses[i] + "&outSR=&f=json");

                xhr[i].onreadystatechange = function() {
                    if (xhr[i].readyState === 4) {
                        if (xhr[i].status === 200) {
                            var data = JSON.parse(xhr[i].responseText);
                            resolve(data.locations);
                        } else {
                            reject('Error: ' + xhr[i].status);
                        }
                    }
                };
            }, i * BATCH_STAGGER);
        });


    }); //end for map batch

    Promise.all(completebatch).then(function(values) {

        var notify_geocode = document.createElement('div');
        notify_geocode.innerHTML = "<p>Geocoding Completed.</p>";
        document.body.appendChild(notify_geocode);

        var compiled_results = [];
        var invalid_results = [];
        var match_report = [];

        values.forEach(function(d) {
            d.forEach(function(e) {
                //you can count stats here, no need to wait for PROMISE to resolve
                //processed, (out of total), success, no match, percent geocoded

                //check for unmatched addresses
                if (e.location.x === "NaN" || e.location.y === "NaN") {
                    invalid_results.push(e.attributes.ResultID);
                    //link back to original dataset and fully report
                } else {
                    //push relevant information as new object that can be fed to Point2Place API
                    //output format: [{"id":"12345","lat":39.612329,"lng":-104.779962},{"id":"12346","lat":39.8019,"lng":-105.513},{"id":"12347","lat":39.755,"lng":-105.222}]
                    compiled_results.push({
                        "id": e.attributes.ResultID,
                        "lat": e.location.y,
                        "lng": e.location.x
                    });
                    match_report.push({
                        "id": e.attributes.ResultID,
                        "lat": e.location.y,
                        "lng": e.location.x,
                        "score": e.attributes.Score,
                        "match_addr": e.attributes.Match_addr,
                        "locator": e.attributes.Loc_name,
                        "addr_type": e.attributes.Addr_type
                    });

                }
            });
        });


        geocodeError(invalid_results, original_data);
        var match_results = geocodeMatch(match_report, original_data);

        findPlace(compiled_results, match_results);

    });




}