//Hier werden Objekte in einem Array gespeichert, um anschliessend mit denen zu arbeiten
var eintragObjArray = [];
//Hier werden Marker in einem Array gespeichert, um anschliessend mit denen zu arbeiten
var markerArray = [];
//Objekt mit "Ja" & "Nein" Wert, um Wartung zu erleichtern
var jaNeinObj = {
    ja: "Ja",
    nein: "Nein"
};
//Id von jedem Objekt in eintragObjArray
var idObjArray = 0;
//Id von jedem Objekt in markerArray
var idMarkerArray = 0;
//Speichert, ob die Seite schon mal geladen wurde
var loadedOnce = false;
//Ganz viele globale Variablen
var map, detailMap, google, placeSearch, autocomplete, idToDelete, markerIdToDelete, currentLocation, directionsDisplay;
/*var componentForm = {
    street_number: 'short_name',
    route: 'long_name',
    locality: 'long_name',
    administrative_area_level_1: 'short_name',
    country: 'long_name',
    postal_code: 'short_name'
};*/

//Wenn das Dokument fertig ist, alles initialisieren 
$(document).ready(function () {
    addDefaultData();
    fillListWithData();
    google.maps.event.addDomListener(window, 'load', initialize);
    $("#save").click(addNewItemToList);
    $("#deleteItem").click(deleteItem);

    $(document).on("pageshow", "#eintragDetail", function () {
        google.maps.event.trigger(detailMap, 'resize');
    });

    $(document).on("pageshow", "#home", function () {
        google.maps.event.trigger(map, 'resize');
    });
});

//Initial Methode, um WebApp mit Werten zu fuellen und diverse globale Variablen bzw. Services zu initialisieren
function initialize() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
            var pos = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
            currentLocation = pos;
            map.setCenter(pos);
        }, function () {
            handleNoGeolocation(true);
        });
    } else {
        // Browser doesn't support Geolocation
        handleNoGeolocation(false);
    }

    autocomplete = new google.maps.places.Autocomplete(
        /** @type {HTMLInputElement} */
        (document.getElementById('autocomplete')), {
            types: ['geocode']
        });

    directionsDisplay = new google.maps.DirectionsRenderer();

    var mapCanvas = document.getElementById('map-canvas');
    var mapOptions = {
        zoom: 16,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    map = new google.maps.Map(mapCanvas, mapOptions);

    addMarkerToMap();

    GeoMarker = new GeolocationMarker();
    GeoMarker.setCircleOptions({
        fillColor: '#808080'
    });

    google.maps.event.addListenerOnce(GeoMarker, 'position_changed', function () {
        map.setCenter(this.getPosition());
        //map.fitBounds(this.getBounds());   
    });

    google.maps.event.addListener(GeoMarker, 'geolocation_error', function (e) {
        alert('There was an error obtaining your position. Message: ' + e.message);
    });

    GeoMarker.setMap(map);

    var GeoMarker = new GeolocationMarker(map);
}

//Daten aus eintragObjArray verwendet, um erste eintraege zu haben
function addDefaultData() {
    fillEintragObjArray("Bananen", "0.6", "47.38558", "8.53148", "Migros Limmatplatz", "16.06.2015", false, false);
    fillEintragObjArray("Lipton Ice Tea Lemon", "1.5", "47.37670", "8.54212", "Coop Central", "21.06.2015", true, false);
    fillEintragObjArray("Vittel 6x1.5l", "3.95", "47.38558", "8.53148", "Migros Limmatplatz", "20.06.2015", true, false);
}

//Generiert 3 stanrard Eintraege
function fillListWithData() {
    $("#eintraegeList").empty();
    eintragObjArray.forEach(function (currObj) {
        $("#eintraegeList").append("<li id = " + currObj.id + "><a href = '#'>" + currObj.name + "</a></li>");
        localStorage.setItem(currObj.id, currObj.name);
    });
    $("#eintraegeList").listview("refresh");
    $("#eintraegeList li").click(fillDetailPage);

}

//Fuellt Detail Seite mit Werten vom selektierten Objekt aus eintragObjArray
function fillDetailPage() {
    var selectedObjectsId = $(this).attr("id");
    var index = -1;
    eintragObjArray.forEach(function (curObj) {
        index++;
        if (curObj.id == selectedObjectsId) {
            idToDelete = index;
            markerIdToDelete = index;
            document.getElementById('labelName').textContent = curObj.name;
            document.getElementById('labelPreis').textContent = curObj.preis;
            document.getElementById('labelAdresse').textContent = curObj.adresse;
            document.getElementById('labelGeschaeft').textContent = curObj.geschaeft;
            document.getElementById('labelDate').textContent = curObj.date;

            if (curObj.isDone == true) {
                $('#isDoneCheckbox').prop('checked', true);
            } else {
                $('#isDoneCheckbox').prop('checked', false);

            }

            if (curObj.isWichtig == true) {
                document.getElementById('labelIsWichtig').textContent = jaNeinObj.ja;
            } else {
                document.getElementById('labelIsWichtig').textContent = jaNeinObj.nein;

            }

            if (curObj.isDone == true) {
                document.getElementById('labelIsDone').textContent = jaNeinObj.ja;
            } else {
                document.getElementById('labelIsDone').textContent = jaNeinObj.nein;

            }


            $("#isDone").click(function () {
                curObj.isDone = !curObj.isDone;
                if (curObj.isDone) {
                    $('#labelIsDone').text(jaNeinObj.ja);

                } else {
                    $('#labelIsDone').text(jaNeinObj.nein);
                }

            });

            //alert("isWichtig: " + curObj.isWichtig);
            /* var fts = $('#flipSwitchDetail');
 if (curObj.isWichtig == false) {
     fts.val('off');
 } else {
     fts.val('on');
 }*/
            //fts.flipswitch('refresh');

            drawDetailMap(curObj.lat, curObj.lng);

            $(':mobile-pagecontainer').pagecontainer('change', '#eintragDetail', {
                transition: 'flip',
                reverse: true,
                showLoadMsg: true
            });
        }
    });
}

//Meldung an User fals ein Fehler bei Positinosermittlung entsteht
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

//Methode, um Eintraege in eintragObjArray hinzuzufuegen und div. andere Methoden auszufuehren
function fillEintragObjArray(inName, inPreis, inLat, inLng, inGeschaeft, inDate, inIsWichtig, inIsDone) {
    var lat = parseFloat(inLat);
    var lng = parseFloat(inLng);
    var adr = getAdressFromCoords(lat, lng);
    var newEintrag = {
        id: idObjArray,
        name: inName,
        preis: inPreis,
        lng: inLng,
        lat: inLat,
        adresse: "Limmatplatz",
        geschaeft: inGeschaeft,
        date: inDate,
        isWichtig: inIsWichtig,
        isDone: inIsDone
    };
    idObjArray += 1;
    eintragObjArray.push(newEintrag);
    addMarkerToMap();
    localStorage.setItem(newEintrag.id, newEintrag.name);

}

//Hollt die Adresse aus Koordinaten
function getAdressFromCoords(inLat, inLng) {
    var latlng = new google.maps.LatLng(inLat, inLng);
    var geocoder = new google.maps.Geocoder();
    geocoder.geocode({
        'latLng': latlng
    }, function (results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
            if (results[1]) {
                //alert(results[1].formatted_address);
                //addMarkerToMap();
                return results[1].formatted_address;
            } else {
                alert('No results found');

            }
        } else {
            alert('Geocoder failed due to: ' + status);
        }

    });

}

/*$.when($.ajax("/page1.php"), $.ajax("/page2.php")).done(function (a1, a2) {
    // a1 and a2 are arguments resolved for the page1 and page2 ajax requests, respectively.
    // Each argument is an array with the following structure: [ data, statusText, jqXHR ]
    var data = a1[0] + a2[0]; // a1[ 0 ] = "Whip", a2[ 0 ] = " It"
    if (/Whip It/.test(data)) {
        alert("We got what we came for!");
    }
});*/

/*function adressFromCoords(inName, inPreis, inLat, inLng, inGeschaeft, inDate, inIsWichtig, inIsDone) {
    var lat = parseFloat(inLat);
    var lng = parseFloat(inLng);
    var latlng = new google.maps.LatLng(lat, lng);
    var geocoder = new google.maps.Geocoder();
    setTimeout(null, 5000)
    geocoder.geocode({
        'latLng': latlng
    }, function (results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
            if (results[1]) {
                var newEintrag = {
                    id: idObjArray,
                    name: inName,
                    preis: inPreis,
                    lng: inLng,
                    lat: inLat,
                    adresse: results[1].formatted_address,
                    geschaeft: inGeschaeft,
                    date: inDate,
                    isWichtig: inIsWichtig,
                    isDone: inIsDone
                };
                idObjArray += 1;
                eintragObjArray.push(newEintrag);
                addMarkerToMap();
                localStorage.setItem(newEintrag.id, newEintrag.name);
            } else {
                alert('No results found');
            }
        } else {
            alert('Geocoder failed due to: ' + status);
        }
    });
}*/


//Fuegt Marker zur Uebersichts-Karte hinzu 
function addMarkerToMap() {
    if (!loadedOnce) {
        //alert("add");
        setTimeout(null, 1500)
            //map.clearOverlays();
        loadedOnce = true;
    }
    eintragObjArray.forEach(function (curObj) {
        var lat = parseFloat(curObj.lat);
        var lng = parseFloat(curObj.lng);
        var latlng = new google.maps.LatLng(lat, lng);
        marker = new google.maps.Marker({
            position: latlng,
            map: map
        });
        idMarkerArray++;

        var markerObj = {
            marker: marker,
            id: idMarkerArray
        };
        markerArray.push(markerObj);
    })

}

//Sucht die aktuelle Position des Client
function geolocate() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
            var geolocation = new google.maps.LatLng(
                position.coords.latitude, position.coords.longitude);
            var circle = new google.maps.Circle({
                center: geolocation,
                radius: position.coords.accuracy
            });
            autocomplete.setBounds(circle.getBounds());
        });
    }
}

//Neues Objekt zur Liste hinzufuegen + Validation
function addNewItemToList() {
    var errorMessage = "";
    var geocoder = new google.maps.Geocoder();
    geocoder.geocode({
        'address': $("#autocomplete").val()
    }, function (results, status) {
        if ($("#autocomplete").val() != '') {
            if (status == google.maps.GeocoderStatus.OK) {
                var isValid = true;
                var inName = $("#name").val();
                var inPreis = $("#preis").val();
                /*alert(results[0].geometry.location.lat());*/
                var inLat = results[0].geometry.location.lat();
                var inLng = results[0].geometry.location.lng();
                var inGeschaeft = $("#geschaeft").val();
                var inDate = $("#date").val();
                var isDringlich = false;
                if ($('#flipSwitchNewEintrag').is(":checked")) {
                    isDringlich = true;
                }
                var inIsDone = false;
                if (inName == '') {
                    isValid = false;
                    errorMessage += "Namen eingeben";
                }

                if (!$.isNumeric(inPreis)) {
                    isValid = false;
                    errorMessage += "Nummerischen eingeben";
                }

                if (inGeschaeft == '') {
                    isValid = false;
                    errorMessage += "Geschaeft eingeben";
                }

                if (isValid) {
                    fillEintragObjArray(inName, inPreis, inLat, inLng, inGeschaeft, inDate, isDringlich, inIsDone);
                    fillListWithData();
                    $(':mobile-pagecontainer').pagecontainer('change', '#home', {
                        transition: 'flip',
                        reverse: true,
                        showLoadMsg: true
                    });
                    $(':input').val('');

                } else {
                    $('#fehlerMeldungen').text(errorMessage);
                    alert("Bitte eingabe überprüfen! 1");
                }
            } else {
                alert('Geocode was not successful for the following reason: ' + status);
            }
        } else {
            $('#fehlerMeldungen').text(errorMessage);

            alert("Bitte eingabe überprüfen! 2");
        }
    });
}

//Ein Element von eintragObjArray entfernen und Abhaengigkeiten anpassen
function deleteItem() {
    eintragObjArray.splice(idToDelete, 1);
    alert(markerArray[markerIdToDelete].id);
    addMarkerToMap();
    fillListWithData();
    deleteMarker(markerIdToDelete);

}

//Detail Map initialisieren und Laufroute zeichnen
function drawDetailMap(inLat, inLng) {
    var lat = parseFloat(inLat);
    var lng = parseFloat(inLng);
    var latlng = new google.maps.LatLng(lat, lng);
    var canvas = document.getElementById('detailMap');
    var mapOptions = {
        zoom: 16,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        center: latlng,
        zoom: 16
    };


    detailMap = new google.maps.Map(canvas, mapOptions);

    var start = currentLocation;
    var end = new google.maps.LatLng(lat, lng);
    var request = {
        origin: start,
        destination: end,
        travelMode: google.maps.TravelMode.WALKING
    };
    var directionsService = new google.maps.DirectionsService();
    directionsService.route(request, function (response, status) {
        if (status == google.maps.DirectionsStatus.OK) {
            directionsDisplay.setDirections(response);
        }
    });
    directionsDisplay.setMap(detailMap);
}

//Bestimmten Marker von der Karte entfernen
function deleteMarker(id) {
    for (var i = 0; i < markerArray.length; i++) {
        if (markerArray[i].id == id) {
            markerArray[i].setMap(null);
            markerArray.splice(i, 1);
            return;
        }
    }
}