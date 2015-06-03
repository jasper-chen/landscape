var parseString = require('xml2js').parseString;
var express = require('express');
var request = require('request');
var path = require('path');
var app = express();
var _s = require('underscore.string');

var APIKEY = '76e253a5c51ecf1dbf17e9ea6b9d6a2f';

app.use(express.static('./public'));

var coordinatesArray = new Array();

var APIKEY = '76e253a5c51ecf1dbf17e9ea6b9d6a2f'
function occupancyCall(ca, fn) {
	/* callback to join coordinate and parking sensor occupancy data*/
	request('http://api.landscape-computing.com/nboxws/rest/v1/site/pa/query/summary/?key=' + APIKEY, function (err, response, body) {
			var joinedArray = new Array();
			var occupancyArray = new Array();
			var res = body.split("|");
			res.shift(); //cleaning array by removing the first element
			res.pop(); //and the last
			for (var i = 0; i < res.length; i++){
				/*combine sensorId, coordinates and occupancy boolean in an array*/
				sensorId = res[i].split(":")[0];
				if (coordinatesArray[sensorId] !== undefined) {
					joinedArray.push([sensorId,coordinatesArray[sensorId][0],res[i].split(":")[1][1]]);
				};
			};
			fn(joinedArray);
	});
}

//routes 

app.get('/api/gps', function(req, res){
	request('http://api.landscape-computing.com/nboxws/rest/v1/zone/pa_1/?key=' + APIKEY, function (err, response, body) {
		/*api call to retrieve coordinate data on sensors in palo alto zone*/
	  	if (!err && response.statusCode == 200) {
			if (_s(body).startsWith("<")) {
				//identifies if data retrieved is in XML or JSON formatt
				parseString(body, function(err, result) {
		    		if (err) {
		    			console.log(err);
		  			} else {
		  				//parse through JSON object
		  				sensors = result['zone']['sensorIdList'][0]['sensorId'];
		  				for (var i = 0; i < Object.keys(sensors).length; i++){
		  					coordinates = sensors[i]["gpsCoordList"][0]["gpsCoord"];
		  					sensorId = sensors[i]["guid"][0].toString();
		  					coordinatesArray[sensorId] = coordinates;
		  				};
		    		};
				})
			} else {
				//parse through JSON object
				result = JSON.parse(body)['sensorId'];
				for (var i = 0; i < Object.keys(result).length; i++){
					coordinates = result[i]["gpsCoord"];
					sensorId = result[i]["guid"].toString();
					coordinatesArray[sensorId] = coordinates;
				};
			};
			//make a second API call to retrieve parking occupancy data
			occupancyCall(coordinatesArray, function(array){
				res.send(array); //send array containing sensorId, coordinates and occupancy boolean
			});
		} else {
	  		console.log(err);
	    };
	})
});

app.get('*', function(req, res){
	res.sendFile(path.join(__dirname + '/public/index.html'));
});

app.listen(process.env.PORT);

