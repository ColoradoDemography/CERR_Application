var Papa = require("../../lib/js/papaparse.js");

var makePostRequest = require("./makePostRequest.js");
/**
 * This function loads a file, and parses it into two arrays
 * @params {File} uploaded_file a Javascript File Object
 * @returns {Array} batch An Array of [Array of Objects] to be fed to the OIT Geocoding Service.
 * @returns {Array} original_data number, to link back to at a future time... perhaps we can include this data in the batched data? 
 */
module.exports = function(uploaded_file) {

    var original_data = [];
    var BATCH_COUNT = 500; //number of records processed per each geocode batch request
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
            container.attributes.Old_LGID = parseInt(fields[i][1]);
            container.attributes.Street = fields[i][2];
            container.attributes.ZIP = fields[i][3];

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

        makePostRequest(batch, original_data);
    };

}