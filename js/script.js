//var x = document.getElementById("demo");
var marker;
var eintragObjArray = [];
var idObjArray = 0;
var map;
var google;
$(document).ready(function () {
alert("rem win");
    google.maps.event.addDomListener(window, 'load', initialize);
    addGetIdEventListener();
});

function initialize() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
            var pos = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

            marker = new google.maps.Marker({
                map: map,
                position: pos,
                icon: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png'
            });

            map.setCenter(pos);
        }, function () {
            handleNoGeolocation(true);
        });
    } else {
        // Browser doesn't support Geolocation
        handleNoGeolocation(false);
    }

    addDefaultData();

    var mapCanvas = document.getElementById('map-canvas');
    var mapOptions = {
        center: new google.maps.LatLng(47.38347, 8.535286),
        zoom: 16,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    map = new google.maps.Map(mapCanvas, mapOptions);
}

function addDefaultData() {
    fillEintragObjArray("Bananen", "0.6", "47.38558", "8.53148", "Migros Limmatplatz", "16.06.2015", false, false);
    fillEintragObjArray("Lipton Ice Tea Lemon", "1.5", "47.37670", "8.54212", "Coop Central", "21.06.2015", false, false);
    fillEintragObjArray("Vittel 6x1.5l", "3.95", "47.38558", "8.53148", "Migros Limmatplatz", "20.06.2015", true, false);
    eintragObjArray.forEach(function (currObj) {
        $("#eintraegeList").append("<li id = " + currObj.id + "><a href = '#'>" + currObj.name + "</a></li>");
    });
    $("#eintraegeList").listview("refresh");
    addGetIdEventListener();
}

function addGetIdEventListener() {
    $('#eintraegeList li').click(function () {
        var selectedObjectsId = $(this).attr("id");
        eintragObjArray.forEach(function (curObj) {
            if (curObj.id == selectedObjectsId) {

                //alert(curObj.name);
            }
        })


        /*        if (typeof (Storage) != "undefined") {
                    // Store
                    localStorage.setItem("lastname", "Smith");
                    // Retrieve
                    document.getElementById("result").innerHTML = localStorage.getItem("lastname");
                } else {
                    document.getElementById("result").innerHTML = "Sorry, your browser does not support Web Storage...";
                }

                $.mobile.changePage("#eintragDetail", {
                    data: {
                        "param1": "value1"
                    }
                });*/
    });
}

function handleNoGeolocation(errorFlag) {
    var content;
    if (errorFlag) {
        content = 'Error: The Geolocation service failed.';
    } else {
        content = 'Error: Your browser doesn\'t support geolocation.';
    }
    var options = {
        map: map,
        position: new google.maps.LatLng(60, 105),
        content: content
    };
    //var infowindow = new google.maps.InfoWindow(options);
    map.controls[google.maps.ControlPosition.BOTTOM_LEFT].push(centerControlDiv);
    map.setCenter(options.position);
}

function fillEintragObjArray(inName, inPreis, inLat, inLng, inGeschaeft, inDate, inIsWichtig, inIsDone) {
    getAdressFromCoords(inLng, inLat);
    var adress = "Limmatplatz";
    var newEintrag = {
        id: idObjArray,
        name: inName,
        preis: inPreis,
        lng: inLng,
        lat: inLat,
        adresse: adress,
        geschaeft: inGeschaeft,
        date: inDate,
        isWichtig: inIsWichtig,
        done: inIsDone
    };
    idObjArray += 1;
    eintragObjArray.push(newEintrag);
}

function getAdressFromCoords(inLng, inLat) {
    var lat = parseFloat(inLat);
    var lng = parseFloat(inLng);
    var latlng = new google.maps.LatLng(lat, lng);
    var geocoder = new google.maps.Geocoder();
    geocoder.geocode({
        'latLng': latlng
    }, function (results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
            if (results[1]) {
                map.setZoom(11);
                marker = new google.maps.Marker({
                    position: latlng,
                    map: map
                });
                //alert(results[1].formatted_address);
                return results[1].formatted_address;
            } else {
                alert('No results found');
            }
        } else {
            alert('Geocoder failed due to: ' + status);
        }
    });
}

/*
    function getLocation() {
    if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(showPosition);
    } else {
    x.innerHTML = "Geolocation is not supported by this browser.";
    }
    }


    function datepicker() {
        $("#datepicker").datepicker({
            changeMonth: true, //this option for allowing user to select month
            changeYear: true //this option for allowing user to select from year range
        });
    }

    function showPosition(position) {
    x.innerHTML = "Latitude: " + position.coords.latitude +
    "<br>Longitude: " + position.coords.longitude;
    }


    */