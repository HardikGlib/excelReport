const PubSub = require('@google-cloud/pubsub')({
	promise: require('bluebird')
});

var mongodb = require('mongodb');
var MongoClient = mongodb.MongoClient;
var tz = require('moment');
var Promise = require('bluebird');

var url = "mongodb://35.202.5.161:27017/excelReportCloud";
//var url = "mongodb://127.0.0.1:27017/excelReportV1";

function writeDbToExcel(siteId) {
	var currentMonthStart = new tz().startOf("month").unix();
	var currentMonthStartMin  = currentMonthStart/60;
    return MongoClient.connect(url).then(function(db) {
        if(siteId) {
            return db.collection(siteId).find({"timestamp":{$gte:currentMonthStartMin}}).toArray().then(function(siteData){
                var topic = PubSub.topic('send_report');
                return topic.publish({data:siteData}).then(function(data) {
                    console.log(data);
                }).catch(function(err){
                    console.log("topic :::::::::::::::::: publish errr" + err);
                });
            }).then(function(){
                return Promise.resolve('OK 1 site');
            });
        }
        else {
            return db.listCollections().toArray().then(function(collInfos) {
                console.log(collInfos);
                return Promise.mapSeries(collInfos, function(tableName) {
    //    			collInfos.forEach(function(tableName) {
                    var tableNameSite = tableName['name'];
                    console.log(tableNameSite);
                    return db.collection(tableNameSite).find({"timestamp":{$gte:currentMonthStartMin}}).toArray().then(function(siteData){
    //                    return createSheet(siteData);
                        var topic = PubSub.topic('send_report');
                        return topic.publish(siteData).then(function(data) {
                            console.log(data);
                        }).catch(function(err){
                            console.log("topic publish errr" + err);
                            // return Promise.reject(err);
                        });
                    }).then(function(){
                        return Promise.resolve('OK 1');
                    });
                }).then(function(){
                    console.log("db closes>>>>>>>>>>>>>>>>");
                    db.close();
                    return Promise.resolve('OK 2');
                }).catch(function(err) {
                    console.log("First promise error>>>>>>." + err);
                });
            }).then(function() {
                return Promise.resolve('OK 3');
            }).catch(function(err) {
                console.log("list connection error >>>>" + err);
            });
        }
    });
}


exports.updateDb = function(event) {
//	var siteId = event.data;
//	const siteStr = Buffer.from(siteId.data,'base64').toString();
//    var site = JSON.parse(siteStr);
//    return writeDbToExcel(site.id);
    const pubsubMsg = event.data;
    const siteStr = Buffer.from(pubsubMsg.data,'base64').toString();
    var site = JSON.parse(siteStr);
    var siteMonthData = site.data;
    var siteId = site.id;
    console.log(siteMonthData);
    console.log(siteId);
//    return getHeaderList(siteMonthData, siteId);
};
