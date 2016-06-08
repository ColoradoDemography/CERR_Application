require("!style!css!../css/app.css");


var handleFiles = require("./handleFiles.js");


document.getElementById('fileItem').addEventListener('change', function() {

    handleFiles(this.files[0])

});




//   https://gis.state.co.us/oit/rest/services/Addresses/SALocation/GeocodeServer/geocodeAddresses?addresses={"records":[{"attributes":{"OBJECTID":220185,"Street":"38445 County Road 29","ZIP":"80615"}},{"attributes":{"OBJECTID":220186,"Street":"1070 Poplar Avenue","ZIP":"80304"}},{"attributes":{"OBJECTID":220187,"Street":"8035 W Ontario Place","ZIP":"80128"}},{"attributes":{"OBJECTID":220188,"Street":"242 Mallard Ct","ZIP":"80550"}},{"attributes":{"OBJECTID":220189,"Street":"24133 Hwy 34","ZIP":"80701"}},{"attributes":{"OBJECTID":220190,"Street":"4384 Apple Court","ZIP":"80301"}},{"attributes":{"OBJECTID":220191,"Street":"2800 Xavier Street","ZIP":"80212"}},{"attributes":{"OBJECTID":220192,"Street":"2757 Sternwheeler Drive","ZIP":"80524"}},{"attributes":{"OBJECTID":220193,"Street":"8086 Jellison Court","ZIP":"80005"}},{"attributes":{"OBJECTID":220194,"Street":"5035 Georgetown Drive","ZIP":"80538"}},{"attributes":{"OBJECTID":220195,"Street":"1602 27th Avenue Court","ZIP":"80634"}},{"attributes":{"OBJECTID":220196,"Street":"32929 County Road 51","ZIP":"80631"}},{"attributes":{"OBJECTID":220197,"Street":"2501 Grape Street","ZIP":"80207"}},{"attributes":{"OBJECTID":220198,"Street":"1437 Venice Lane","ZIP":"80503"}},{"attributes":{"OBJECTID":220199,"Street":"1633 33rd ave","ZIP":"80634"}},{"attributes":{"OBJECTID":220200,"Street":"2555 S Pearl St","ZIP":"80210"}},{"attributes":{"OBJECTID":220201,"Street":"13255 West Utah Avenue","ZIP":"80228"}}]}&outSR=&f=pjson