//app.js
var app = angular.module('myApplicationModule', ['uiGmapgoogle-maps'])
	.controller('MapController', ['$scope', '$http', function($scope, $http) {
	$scope.map = { center: { latitude: 37.444618, longitude: -122.163263 }, zoom: 15 };

	//retrieve and display the sensor locations

	$scope.markers = [];

	$http.get('/api/gps').success(function(data){
		console.log(data);
		$scope.sensors = data[0];
		var length = Object.keys($scope.sensors.gpsCoord).length;

		var createMarker = function(i) {

			var array = $scope.sensors.gpsCoord[i].split(',');
			//create a model of a marker for Google Maps API
			var ret = {
		    id: i,

		    latitude: array[0],
		    longitude: array[1]
			}
		    return ret
		};

		//assign values for each marker object
		for (var i = 0; i < length; i++) {

			$scope.markers.push(createMarker(i));
		};

		console.log($scope.markers);
	}).error(function(data){
		console.log(data);
	});
}])









