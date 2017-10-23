const PubSub = require('@google-cloud/pubsub')({
	promise: require('bluebird')
});

var reqPromise = require("request-promise");
var Promise = require('bluebird');


function getAllSitesList() {
	var options = { method: 'GET',
		url: 'https://us-central1-chembond-flux.cloudfunctions.net/sites/',
		headers:
		{ 'postman-token': '07da16b4-16bf-329c-65c5-bd44b70398f1',
		'cache-control': 'no-cache',
		authorization: 'JWT eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFkbWluQGdlbmVzaXNhaS5jb20iLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE0OTU3OTk1MDB9.4-SBSGqLrcGWLVArEKKs-kbNRiApS8rPoTVHaLyRc8Q',
		'content-type': 'application/json' } };

	return reqPromise(options);
}

exports.getSites = function(event) {
    getAllSitesList().then(function(siteData){
	var sites = JSON.parse(siteData).message;
	var count = 0;
	//console.log(sites);
	return Promise.mapSeries(sites, function(site){
            var topic = PubSub.topic('fetch_data');
            return topic.publish({
                id: site['_id'],
                name: site['name'],
                towers: site['towers'],
            }).then(function(data) {
           	console.log(data);
            }).catch(function(err){
        //        console.log("topic publish errr" + err);
                // return Promise.reject(err);
            });
	}).catch(function(err) {
	    console.log("map series error " + err);
	});
    }).catch(function(err) {
        console.log("get all site error " + err);
    });
};
