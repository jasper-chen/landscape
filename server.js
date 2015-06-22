"use strict";

var express = require('express');
var request = require('request');
var path = require('path');
var app = express();

app.use(express.static('./public'));

var coordinatesArray = [];

var APIKEY = ''; /* INSERT API KEY HERE'

function occupancyCall(ca, fn) {
	/* callback to join coordinate and parking sensor occupancy data*/
	request('http://api.landscape-computing.com/nboxws/rest/v1/site/pa/query/summary/?key=' + APIKEY, function (err, response, body) {
			var joinedArray = [];
			var res = body.split("|");
			res.shift(); //cleaning array by removing the first element
			res.pop(); //and the last
			for (var i = 0; i < res.length; i++){
				/*combine sensorId, coordinates and occupancy boolean in an array*/
				var sensorId = res[i].split(":")[0];
				if (coordinatesArray[sensorId] !== undefined) {
					joinedArray.push([sensorId,coordinatesArray[sensorId][0],res[i].split(":")[1][1]]);
				}
			}
			fn(joinedArray);
	});
}

//routes 

app.get('/api/gps', function(req, res){
	request('http://api.landscape-computing.com/nboxws/rest/v1/zone/pa_2/?key=' + APIKEY, {headers: {'Accept': "application/json"}}, function (err, response, body) {
		/*api call to retrieve coordinate data on sensors in palo alto zone*/
	  	if (!err && response.statusCode == 200) {
				//parse through JSON object
			try { var result = JSON.parse(body).sensorId;
				for (var i = 0; i < Object.keys(result).length; i++){
					var coordinates = result[i].gpsCoord;
					var sensorId = result[i].guid.toString();
					coordinatesArray[sensorId] = coordinates;
				}

				//make a second API call to retrieve parking occupancy data
				occupancyCall(coordinatesArray, function(array){
					res.send(array); //send array containing sensorId, coordinates and occupancy boolean
				});
			} catch (err) {
				console.log(err);
			}
		} else {
	  		console.log(err);
	    }
	});
});

app.get('*', function(req, res){
	res.sendFile(path.join(__dirname + '/public/index.html'));
});

app.listen(process.env.PORT || 3000);

