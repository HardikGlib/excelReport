// var Promise = require('bluebird').Promise;
var mongodb = require('mongodb');
var reqPromise = require("request-promise");
var tz = require('moment');
var MongoClient = mongodb.MongoClient;
// var moment = require('moment-timezone');
var Promise = require('bluebird');

var url = "mongodb://35.192.28.117:27017/excelReportCloud";


function getTowerMetaData(towerId) {
	var options = { method: 'GET',
		url: 'https://us-central1-chembond-flux.cloudfunctions.net/towers/'+towerId,
		headers:
		{ 'postman-token': '6e52cfec-4621-09ec-a568-0f3d3e233db1',
		'cache-control': 'no-cache',
		authorization: 'JWT eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFkbWluQGdlbmVzaXNhaS5jb20iLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE0OTU3OTk1MDB9.4-SBSGqLrcGWLVArEKKs-kbNRiApS8rPoTVHaLyRc8Q',
		'content-type': 'application/json' } };

	return reqPromise(options);
}


function getTowerRawData(towerId, currentStartMin, currentEndMin) {

	var options = { method: 'GET',
	url: 'https://us-central1-chembond-flux.cloudfunctions.net/data/'+towerId,
	qs: { offline: '1', from: currentStartMin, to: currentEndMin },
	headers:
		{ 'postman-token': '8801a201-ae78-1e13-27ea-5422525be7dc',
		'cache-control': 'no-cache',
		authorization: 'JWT eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFkbWluQGdlbmVzaXNhaS5jb20iLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE0OTU3OTk1MDB9.4-SBSGqLrcGWLVArEKKs-kbNRiApS8rPoTVHaLyRc8Q',
		'content-type': 'application/json' } };

	return reqPromise(options);
}


function insertDataToDb(date,tableName,dataListBy,siteName) {
	MongoClient.connect(url, function(err, db) {
		var myobj = { "timestamp": date, "data": dataListBy, "site":siteName };
		db.collection(tableName).insertOne(myobj, function(err1, res) {
			console.log("1 document inserted>>>" + tableName);
			// console.log(dataListBy);
		});
		db.close();
	});
}

function tableCheck(tableName) {
	MongoClient.connect(url, function(err, db) {
		db.listCollections().toArray(function(err, collInfos) {
		    // console.log(collInfos);
		    if(collInfos.length > 0) {
		    	var dbCheck = true;
		    	collInfos.forEach(function(existTable) {
		    		if(existTable['name'] === tableName) {
		    			dbCheck = false;
		    		}
		    	});

		    	if(dbCheck) {
		    		db.createCollection(tableName, function(err, res) {
					    console.log("Newly Collection created!");
					    db.close();
					});
		    	}
		    }
		    else {
		    	db.createCollection(tableName, function(err, res) {
				    console.log("Collection created!");
				    db.close();
				});
		    }
		});
	});
}


exports.getSiteData = function(event) {
    const pubsubMsg = event.data;
    const siteStr = Buffer.from(pubsubMsg.data,'base64').toString();
    var site = JSON.parse(siteStr);
    console.log(site['name']);
//    console.log("site>>>>");
//    console.log(site);
    var currentStartMin = 25137030;//new tz().startOf("day").unix();
    var currentEndMin = 25137749;

    Promise.mapSeries(site['towers'], function(singleTowerId) {
	 	var dataById = {};
	 	// dataById[singleTowerId] = [];
	 	dataById[singleTowerId] = {};
	 	return getTowerMetaData(singleTowerId).then(function(metaData) {
	 		var metaDataJson = JSON.parse(metaData).message;
	 		// console.log(metaDataJson['name']);
	 			var obj_metaDataJson = JSON.parse(metaDataJson['attribs']);

	 			if(obj_metaDataJson[0]['type'] ==='OFFLINE') {
	 			return getTowerRawData(singleTowerId, currentStartMin, currentEndMin).then(function(rawData) {
	 				var rawDataJson = JSON.parse(rawData).message;
	 				// console.log(rawDataJson);
	 				return rawDataJson;
	 			}).then(function(rawDataJsonObj) {

	 				var dataDict = {};
	 				dataDict['gen'] = {};
	 				obj_metaDataJson.forEach(function(specValue, specIndex) {
	 					var specFactorId = specValue.id;
	 					dataDict[specFactorId] = [];
	 					// dataDict['timestamp'] = [];

	 					rawDataJsonObj.forEach(function(specRawValue, specRawIndex) {
	 						if(specRawValue[specFactorId] !== undefined) {
	 							// console.log(specRawValue[specFactorId]);
	 							dataDict[specFactorId].push(specRawValue[specFactorId]);
	 							// dataDict['timestamp'].push(specRawValue['timestamp']);
	 						}
	 					});
	 					dataDict[specFactorId].push({'low':specValue.low,'high':specValue.high,'type':specValue.type});
	 				});
	 				// dataDict['name'] = metaDataJson['name'];
	 				dataDict['gen']['name'] = metaDataJson['name'];
	 				dataDict['gen']['type'] = metaDataJson['type'];
	 				return dataDict;

	 			}).then(function(rawDataReturn) {
	 				return Promise.resolve(rawDataReturn);
	 			}).catch(function(err) {
	 				console.log("firing error");
	 			});

	 		}


	 	}).then(function(metaDataReturn) {
	 		// dataById[singleTowerId].push(metaDataReturn);
	 		dataById[singleTowerId] = metaDataReturn;
	 		return Promise.resolve(dataById);
	 	}).catch(function(err) {
	 		console.log("error fired on single tower metadata>>>>" + err);
	 		console.log(singleTowerId);
	 	});

	 }).then(function(siteListReturn) {
	 	// console.log("data insert to db");
	 	tableCheck(site['id']);
	 	insertDataToDb(currentStartMin,site['id'],siteListReturn,site['name']);
	 }).catch(function(err) {
	 	console.log("site error " + err);
	 });
};
