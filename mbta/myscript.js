//Maya DeBellis
//Comp20 - Assignment 2
//October 2016

var myLat = 0;
var myLng = 0;
var request = new XMLHttpRequest();
var me = new google.maps.LatLng(myLat, myLng);
var myOptions = {
                        zoom: 13,
                        center: me,
                        mapTypeId: google.maps.MapTypeId.ROADMAP
                };
var map;
var marker;
var infowindow = new google.maps.InfoWindow();


var stationIcon = {
        url: 'icon.png',
        scaledSize: new google.maps.Size(20, 20),

}
var stations = [];
stations[9] = {name: "South Station", lat: 42.352271, lon: -71.05524200000001 };
stations[11] = {name: "Andrew", lat: 42.330154, lon: -71.057655 };
stations[2] = {name: "Porter Square", lat: 42.3884, lon: -71.11914899999999 };
stations[3] = {name: "Harvard Square", lat: 42.373362, lon: -71.118956 };
stations[12] = {name: "JFK/UMass", lat: 42.320685, lon: -71.052391 };
stations[18] = {name: "Savin Hill", lat: 42.31129, lon: -71.053331 };
stations[7] = {name: "Park Street", lat: 42.35639457, lon: -71.0624242 };
stations[10] = {name: "Broadway", lat: 42.342622, lon: -71.056967 };
stations[13] = {name: "North Quincy", lat: 42.275275, lon: -71.029583 };
stations[20] = {name: "Shawmut", lat: 42.29312583, lon: -71.06573796000001 };
stations[1] = {name: "Davis", lat: 42.39674, lon: -71.121815 };
stations[0] = {name: "Alewife", lat: 42.395428, lon: -71.142483 };
stations[5] = {name: "Kendall/MIT", lat: 42.36249079, lon: -71.08617653 };
stations[6] = {name: "Charles/MGH", lat: 42.361166, lon: -71.070628 };
stations[8] = {name: "Downtown Crossing", lat: 42.355518, lon: -71.060225 };
stations[15] = {name: "Quincy Center", lat: 42.251809, lon: -71.005409 };
stations[16] = {name: "Quincy Adams", lat: 42.233391, lon: -71.007153 };
stations[21] = {name: "Ashmont", lat: 42.284652, lon: -71.06448899999999 };
stations[14] = {name: "Wollaston", lat: 42.2665139, lon: -71.0203369 };
stations[19] = {name: "Fields Corner", lat: 42.300093, lon: -71.061667 };
stations[4] = {name: "Central Square", lat: 42.365486, lon: -71.103802 };
stations[17] = {name: "Braintree", lat: 42.2078543, lon: -71.0011385 };



function init()
{
        map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);
        getMyLocation();
}

function distance(lat1, lon1, lat2, lon2) {

        Number.prototype.toRad = function() {
                return this * Math.PI / 180;
        }

        var R = 3959; // miles 
        var x1 = lat2-lat1;
        var dLat = x1.toRad();  
        var x2 = lon2-lon1;
        var dLon = x2.toRad();  
        var a = Math.sin(dLat/2) * Math.sin(dLat/2) + 
                        Math.cos(lat1.toRad()) * Math.cos(lat2.toRad()) * 
                        Math.sin(dLon/2) * Math.sin(dLon/2);  
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
        var d = R * c; 

        return d;
}

function getMyLocation() {
        if (navigator.geolocation) { 
                navigator.geolocation.getCurrentPosition(function(position) {
                        myLat = position.coords.latitude;
                        myLng = position.coords.longitude;
                        var closeInfo = setStations(myLat, myLng);
                        renderMap(closeInfo);
                });
        }
        else {
                alert("Geolocation is not supported by your web browser.  What a shame!");
        }
}

//used to set each marker's listener
function setEachMarker(marker){

        google.maps.event.addListener(marker, 'click', function() {
                infowindow.setContent(marker.title);
                infowindow.open(map, marker);
        });

}

//sets marker for each station and the polyline to the current location
function setStations(mylat, mylon) {

        var closestStation;
        var currentClose = 100;

        for (var i in stations) {
                stations[i].marker = new google.maps.Marker({
                        position: {lat: stations[i].lat, lng: stations[i].lon},
                        title: stations[i].name,
                        icon: stationIcon,
                        map: map
                });

                setEachMarker(stations[i].marker);

                var distanceBtwn = distance(mylat, mylon, stations[i].lat, stations[i].lon);

                if (distanceBtwn < currentClose){
                        currentClose = distanceBtwn;
                        closestStation = stations[i];
                }

        }

        var ClosestCoordinates = [
                {lat: mylat, lng: mylon},
                {lat: closestStation.lat, lng: closestStation.lon}
        ];
        var toClosestStation = new google.maps.Polyline({
                  path: ClosestCoordinates,
                  geodesic: true,
                  strokeColor: 'green',
                  strokeOpacity: 1.0,
                  strokeWeight: 2
        });
        toClosestStation.setMap(map);

        setPolyline();
        setTrainInfo();

        return {station: closestStation, dist: currentClose};
}

function setTrainInfo(){

        request = new XMLHttpRequest();
        request.open("get", "https://young-reaches-22225.herokuapp.com/redline.json", true);
        request.onreadystatechange = parseData;
        request.send();
}

//parse JSON data and add to marker titles
function parseData(){

        if (request.readyState == 4 && request.status == 200) {
                theData = request.responseText;
                trainInfo = JSON.parse(theData);

                for (i in trainInfo["TripList"]["Trips"]){
                        trainDestination = trainInfo["TripList"]["Trips"][i]["Destination"];

                        for (j in trainInfo["TripList"]["Trips"][i]["Predictions"]){
                                
                                for (k in stations){
                                        if (stations[k].name == trainInfo["TripList"]["Trips"][i]["Predictions"][j]["Stop"]){

                                                var currentStops = stations[k].marker.title;
                                                mins = (trainInfo["TripList"]["Trips"][i]["Predictions"][j]["Seconds"]/60).toPrecision(2);
                                                newstop = "<p> train to " + trainDestination + " in " + mins + " min </p>";
                  
                                                stations[k].marker.title = currentStops + newstop;
                                        }
                                }
                        }
                }
        }
}

function setPolyline() {

        var pathCoords = [];
        for (var i = 0; i <= 17; i++){
                pathCoords.push({lat: stations[i].lat, lng: stations[i].lon});
        }

        var redlineBraintree = new google.maps.Polyline({
                  path: pathCoords,
                  geodesic: true,
                  strokeColor: '#FF0000',
                  strokeOpacity: 1.0,
                  strokeWeight: 2
        });
        redlineBraintree.setMap(map);

        var ashmontCoords = [];
        ashmontCoords.push({lat: stations[12].lat, lng: stations[12].lon});
        for (var i = 18; i <= 21; i++){
                ashmontCoords.push({lat: stations[i].lat, lng: stations[i].lon});
        }

        var redlineAshmont = new google.maps.Polyline({
                  path: ashmontCoords,
                  geodesic: true,
                  strokeColor: '#FF0000',
                  strokeOpacity: 1.0,
                  strokeWeight: 2
        });
        redlineAshmont.setMap(map);

}

//render the map!
function renderMap(closeInfo) {
        me = new google.maps.LatLng(myLat, myLng);
        map.panTo(me);

        marker = new google.maps.Marker({
                position: me,
                title: "<h4> Closest station: </h4>" + closeInfo.station.name +
                "<h4> Distance: </h4>" + closeInfo.dist.toPrecision(4) + "miles",
                map: map
        });
                
        google.maps.event.addListener(marker, 'click', function() {
                infowindow.setContent(marker.title);
                infowindow.open(map, marker);
        });
}






