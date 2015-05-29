var parseString = require('xml2js').parseString;
var express = require('express');
var request = require('request');
var path = require('path');
var app = express();
var _s = require('underscore.string');
var debug = require('debug')('horses');

var APIKEY = '76e253a5c51ecf1dbf17e9ea6b9d6a2f';

app.use(express.static('public'));

//routes 

app.get('/api/gps', function(req, res){

	request('http://api.landscape-computing.com/nboxws/rest/v1/site/pa/query/summary/?key=76e253a5c51ecf1dbf17e9ea6b9d6a2f', function (err, response, body) {
		var occupancyArray = new Array();
		var res = body.split("|");
		res.shift();
		res.pop();
		for (var i = 0; i < res.length; i++){
			sensorId = res[i].split(":")[0];
			occupied = res[i].split(":")[1][1];
			occupancyArray[sensorId] = occupied;
		}
	});

	//then do this...

	request('http://api.landscape-computing.com/nboxws/rest/v1/zone/pa_1/?key=76e253a5c51ecf1dbf17e9ea6b9d6a2f', function (err, response, body) {

	  	if (!err && response.statusCode == 200) {
			
			if (_s(body).startsWith("<")) {
				//if XML, then convert to JSON 

				parseString(body, function(err, result) {

		    		if (err) {
		    			debug(err)
		  			} else {

		  				sensors = result['zone']['sensorIdList'][0]['sensorId'];

		  				var array = new Array();

		  				for (var i = 0; i < Object.keys(sensors).length; i++){
		  					coordinates = sensors[i]["gpsCoordList"][0]["gpsCoord"];
		  					sensorId = sensors[i]["guid"][0].toString();
		  					array[sensorId] = coordinates;
		  				}
		    		}
				})

			} else {
				result = JSON.parse(body)['sensorId'];
				var coordinatesArray = new Array();

				for (var i = 0; i < Object.keys(result).length; i++){
					coordinates = result[i]["gpsCoord"];
					sensorId = result[i]["guid"].toString();
					coordinatesArray[sensorId] = coordinates;
				}
			debug(array);
			}
		} else {
	  		debug('broken_b');
	    }
	})
});

app.get('*', function(req, res){
	res.sendFile(path.join(__dirname + '/public/index.html'));

});

app.listen(8080);

