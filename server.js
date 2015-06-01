var parseString = require('xml2js').parseString;
var express = require('express');
var request = require('request');
var path = require('path');
var app = express();
var _s = require('underscore.string');
var debug = require('debug')('horses');

var APIKEY = '76e253a5c51ecf1dbf17e9ea6b9d6a2f';

app.use(express.static('public'));

//functions

var coordinatesArray = new Array();


function occupancyCall(ca, fn) {
	request('http://api.landscape-computing.com/nboxws/rest/v1/site/pa/query/summary/?key=76e253a5c51ecf1dbf17e9ea6b9d6a2f', function (err, response, body) {
			var gacArray = new Array();
			var occupancyArray = new Array();
			var res = body.split("|");
			res.shift();
			res.pop();
			debug('creating occupany hashtable...')
			for (var i = 0; i < res.length; i++){
				sensorId = res[i].split(":")[0];
				debug(res[i]);
				if (coordinatesArray[sensorId] !== undefined) {
					//only using one of 4 corners in parking spot
					gacArray.push([sensorId,coordinatesArray[sensorId][0],res[i].split(":")[1][1]])
				}
			}
			fn(gacArray);

			//return gacArray
	});
}

//routes 

app.get('/api/gps', function(req, res){
	request('http://api.landscape-computing.com/nboxws/rest/v1/zone/pa_1/?key=76e253a5c51ecf1dbf17e9ea6b9d6a2f', function (err, response, body) {

	  	if (!err && response.statusCode == 200) {
			
			if (_s(body).startsWith("<")) {
				//if XML, then convert to JSON 

				parseString(body, function(err, result) {

		    		if (err) {
		    			//XML parsing not successful
		    			debug(err)
		  			} else {
		  				debug('parsing XML...');

		  				sensors = result['zone']['sensorIdList'][0]['sensorId'];

		  				debug('creating XML hashtable...');

		  				for (var i = 0; i < Object.keys(sensors).length; i++){
		  					coordinates = sensors[i]["gpsCoordList"][0]["gpsCoord"];
		  					sensorId = sensors[i]["guid"][0].toString();
		  					coordinatesArray[sensorId] = coordinates;
		  				}
		    		}
				})

			} else {
				result = JSON.parse(body)['sensorId'];

				debug('creating JSON hashtable...');


				for (var i = 0; i < Object.keys(result).length; i++){
					coordinates = result[i]["gpsCoord"];
					sensorId = result[i]["guid"].toString();
					coordinatesArray[sensorId] = coordinates;
				}
			}
			debug('calling for sensor occupancies...');
			occupancyCall(coordinatesArray, function(gacArray){
				debug('sending sensor information to angular');
				thing = gacArray;
				debug(thing);
				res.send(thing);
			});

		} else {
	  		//contains error or request not successful
	    }
	})
});

app.get('*', function(req, res){
	res.sendFile(path.join(__dirname + '/public/index.html'));
});

app.listen(8080);

