var parseString = require('xml2js').parseString;
var express = require('express');
var request = require('request');
var path = require('path');
var app = express();
var http = require('http');
var _s = require('underscore.string');
var debug = require('debug')('horses');

var APIKEY = '76e253a5c51ecf1dbf17e9ea6b9d6a2f';

app.use(express.static('public'));

//routes 

app.get('/api/gps', function(req, res){
	request('http://api.landscape-computing.com/nboxws/rest/v1/zone/pa_1/?key=76e253a5c51ecf1dbf17e9ea6b9d6a2f', function (err, response, body) {
	  	if (!err && response.statusCode == 200) {
	  		
			//XML
			if (_s(body).startsWith("<")) {
				//XML -> JSON

				parsedJSON = parseString(body, function(err, result) {

		    		if (err) {
		    			debug(err)
		  			}

		  			else {


		  				debug(''+'XML'+JSON.stringify(result));
		  				
		  				parsed = result["zone"];
				    	//Hashtable for sensor_id and coordinates
				    	//var array = new Array();

				    	//for (var i = 0; i < Object.keys(sensorList).length; i++) {

				    		//array[sensorList[i]['guid'].toString()] = sensorList[i]['gpsCoordList'].toString();	
			    		return JSON.stringify(parsed)
		    		}
		    	
				})

			} else {
				debug('JSON'+body);
				parsedJSON = body;
			}

			debug('RESULT' + JSON.stringify(parsedJSON));

			//var sensorList = parsedJSON['zone']['sensorIdList']['0']['sensorId'];

			res.send(parsedJSON);

		}
		
	    else {
	  		res.send('broken_b');
	    }

	  //upon success of creating the hashtable
	})
});



app.get('*', function(req, res){
	res.sendFile(path.join(__dirname + '/public/index.html'));

});

app.listen(8080);

