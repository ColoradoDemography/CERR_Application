document.getElementById('fileItem').addEventListener('change', function() {
    handleFiles(this.files[0]);

});


var BATCH_COUNT = 500; //number of records processed per each geocode batch request
var BATCH_STAGGER = 2000; //ms between each geocode batch request

var original_data = [];
var match_results = []; //join with data that was run through Point2Place API

function handleFiles(uploaded_file) {


    var reader = new FileReader();

    reader.readAsText(uploaded_file);

    reader.onload = function() {
        var data = reader.result;
        var fields = (Papa.parse(data)).data;

        var batch = [];
        var batchcount = 0;

        var addresses = {};
        addresses.records = [];

        var notify_count = document.createElement('div');
        notify_count.innerHTML = "<p>File Upload Complete.  Counted " + (fields.length - 1) + " records.</p>"; // -1 since last record empty (may not always hold true)
        document.body.appendChild(notify_count);

        fields.forEach(function(d, i) {

            var container = {};
            container.attributes = {};
            container.attributes.OBJECTID = parseInt(fields[i][0]);
            container.attributes.Street = fields[i][1];
            container.attributes.ZIP = fields[i][2];

            //last record can sometimes be empty
            if (fields[i][0] !== "") {
                batchcount++;
                addresses.records.push(container);
                original_data.push(container); //save this data to link back to later for error and geocoding report.
            }

            if ((batchcount === BATCH_COUNT) || (i === fields.length - 1)) {
                //reset
                batch.push(addresses);
                addresses = {};
                addresses.records = [];
                batchcount = 0;
            }

        });

        make_post_request(batch);

    };


}

function make_post_request(batch) {

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

        errorReport(invalid_results); //to write
        geocodingSummary(match_report); //to write

        findPlace(compiled_results);

    });

} //end make_post_request

function geocodingSummary(match_report) {

    //rejoin invalid_results with original dataset via array.map
    match_results = []; //it is a global

    match_report.forEach(function(d) {
        for (var i = 0; i < original_data.length; i++) {
            if (d.id === original_data[i].attributes.OBJECTID) {
                match_results.push({
                    "OBJECTID": d.id,
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
    downloadCsv(match_results, "Match Report");

}


function errorReport(invalid_results) {

    //rejoin invalid_results with original dataset via array.map
    var error_results = [];

    invalid_results.forEach(function(d) {
        for (var i = 0; i < original_data.length; i++) {
            if (d === original_data[i].attributes.OBJECTID) {
                error_results.push({
                    "OBJECTID": d,
                    "Street": original_data[i].attributes.Street,
                    "ZIP": original_data[i].attributes.ZIP
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
    downloadCsv(error_results, "Error Report");

}


function findPlace(compiled_results) {

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
                xhr[i].open('POST', 'http://red-meteor-147235.nitrousapp.com:4567/lookup');
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

        byAddressReport(parsed_response);
    });

}

function byAddressReport(data) {

    //d: id city county
    //match_results: OBJECTID Orig_Street Orig_ZIP score match_addr locator addr_type lat lng

    results = [];

    data.forEach(function(d) {
        for (var i = 0; i < match_results.length; i++) {
            if (d.id === match_results[i].OBJECTID) {
                results.push({
                    "OBJECTID": d.id,
                    "Orig_Street": match_results[i].Orig_Street,
                    "Orig_ZIP": match_results[i].Orig_ZIP,
                    "score": match_results[i].score,
                    "match_addr": match_results[i].match_addr,
                    "locator": match_results[i].locator,
                    "addr_type": match_results[i].addr_type,
                    "lat": match_results[i].lat,
                    "lng": match_results[i].lng,
                    "city": d.city,
                    "county": d.county
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

function analyzeResults(data) {


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
    downloadCsv(collapsed_result, 'Total Count by City &amp; County');

}

//adapted: http://www.zachhunter.com/2011/06/json-to-csv/
function downloadCsv(objArray, link_text) {


  var str = Papa.unparse(objArray);


    var encodedUri = encodeURI("data:text/csv;charset=utf-8," + str);
  
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


//stats:  
//Unmatched Report
//Matched report
//Matched per City/County Combo


//   https://gis.state.co.us/oit/rest/services/Addresses/SALocation/GeocodeServer/geocodeAddresses?addresses={"records":[{"attributes":{"OBJECTID":220185,"Street":"38445 County Road 29","ZIP":"80615"}},{"attributes":{"OBJECTID":220186,"Street":"1070 Poplar Avenue","ZIP":"80304"}},{"attributes":{"OBJECTID":220187,"Street":"8035 W Ontario Place","ZIP":"80128"}},{"attributes":{"OBJECTID":220188,"Street":"242 Mallard Ct","ZIP":"80550"}},{"attributes":{"OBJECTID":220189,"Street":"24133 Hwy 34","ZIP":"80701"}},{"attributes":{"OBJECTID":220190,"Street":"4384 Apple Court","ZIP":"80301"}},{"attributes":{"OBJECTID":220191,"Street":"2800 Xavier Street","ZIP":"80212"}},{"attributes":{"OBJECTID":220192,"Street":"2757 Sternwheeler Drive","ZIP":"80524"}},{"attributes":{"OBJECTID":220193,"Street":"8086 Jellison Court","ZIP":"80005"}},{"attributes":{"OBJECTID":220194,"Street":"5035 Georgetown Drive","ZIP":"80538"}},{"attributes":{"OBJECTID":220195,"Street":"1602 27th Avenue Court","ZIP":"80634"}},{"attributes":{"OBJECTID":220196,"Street":"32929 County Road 51","ZIP":"80631"}},{"attributes":{"OBJECTID":220197,"Street":"2501 Grape Street","ZIP":"80207"}},{"attributes":{"OBJECTID":220198,"Street":"1437 Venice Lane","ZIP":"80503"}},{"attributes":{"OBJECTID":220199,"Street":"1633 33rd ave","ZIP":"80634"}},{"attributes":{"OBJECTID":220200,"Street":"2555 S Pearl St","ZIP":"80210"}},{"attributes":{"OBJECTID":220201,"Street":"13255 West Utah Avenue","ZIP":"80228"}}]}&outSR=&f=pjson