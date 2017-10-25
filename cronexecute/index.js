const PubSub = require('@google-cloud/pubsub')({
	promise: require('bluebird')
});

var Promise = require('bluebird');
var cron = require('node-cron');

exports.cronFuncCall = function(event) {
    cron.schedule('* * 23 * *', function(){
        console.log('running a get sites function at 11pm');
    });

    cron.schedule('* 30 23 * *', function(){
        console.log('running a build report function at 11:30pm');
    });
});
