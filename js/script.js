var eintragObjArray = [];
var idObjArray = 0;
var map, google, placeSearch, autocomplete, idToDelete;
var componentForm = {
    street_number: 'short_name',
    route: 'long_name',
    locality: 'long_name',
    administrative_area_level_1: 'short_name',
    country: 'long_name',
    postal_code: 'short_name'
};
$(document).ready(function () {
    addDefaultData();
    fillListWithData();
    google.maps.event.addDomListener(window, 'load', initialize);
    $("#save").click(getAddressFromCoords);
    $('#save').bind('click', function () {
        var txtVal = $('#txtDate').val();
        if (isDate(txtVal)) {
            alert('Valid Date');
        } else {
            alert('Invalid Date');
        }
    });

    $("#deleteItem").click(deleteItem);

    /*$("#home").on("pageshow", )*/
});

function initialize() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
            var pos = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

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



    var mapCanvas = document.getElementById('map-canvas');
    var mapOptions = {
        center: new google.maps.LatLng(47.38347, 8.535286),
        zoom: 16,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    map = new google.maps.Map(mapCanvas, mapOptions);


    GeoMarker = new GeolocationMarker();
    GeoMarker.setCircleOptions({
        fillColor: '#808080'
    });

    google.maps.event.addListenerOnce(GeoMarker, 'position_changed', function () {
        map.setCenter(this.getPosition());
        map.fitBounds(this.getBounds());
    });

    google.maps.event.addListener(GeoMarker, 'geolocation_error', function (e) {
        alert('There was an error obtaining your position. Message: ' + e.message);
    });

    GeoMarker.setMap(map);



    var GeoMarker = new GeolocationMarker(map);
}

function addDefaultData() {
    fillEintragObjArray("Bananen", "0.6", "47.38558", "8.53148", "Migros Limmatplatz", "16.06.2015", false, false);
    fillEintragObjArray("Lipton Ice Tea Lemon", "1.5", "47.37670", "8.54212", "Coop Central", "21.06.2015", false, false);
    fillEintragObjArray("Vittel 6x1.5l", "3.95", "47.38558", "8.53148", "Migros Limmatplatz", "20.06.2015", true, false);
}

function fillListWithData() {
    eintragObjArray.forEach(function (currObj) {
        $("#eintraegeList").append("<li id = " + currObj.id + "><a href = '#'>" + currObj.name + "</a></li>");
    });
    $("#eintraegeList").listview("refresh");
    $("#eintraegeList li").click(fillDetailPage);

}

function fillDetailPage() {
    var selectedObjectsId = $(this).attr("id");
    eintragObjArray.forEach(function (curObj) {
        if (curObj.id == selectedObjectsId) {
            document.getElementById('labelName').textContent = curObj.name;
            document.getElementById('labelPreis').textContent = curObj.preis;
            document.getElementById('labelAdresse').textContent = curObj.adresse;
            document.getElementById('labelGeschaeft').textContent = curObj.geschaeft;
            idToDelete = curObj.id;
            if (curObj.isDone == true) {
                $('#isDoneCheckbox').prop('checked', true).checkboxradio('refresh');
            } else {
                $('#isDoneCheckbox').prop('checked', false).checkboxradio('refresh');
            }
            if (curObj.isWichtig == true) {
                $('#isDoneCheckbox').prop('checked', true).checkboxradio('refresh');
            } else {
                $('#isDoneCheckbox').prop('checked', false).checkboxradio('refresh');
            }

            $(':mobile-pagecontainer').pagecontainer('change', '#eintragDetail', {
                transition: 'flip',
                reverse: true,
                showLoadMsg: true
            });
        }
    })

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
    var adr = getAdressFromCoords(inLng, inLat);
    alert(adr);
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
                return results[1].formatted_address;
            } else {
                alert('No results found');
            }
        } else {
            alert('Geocoder failed due to: ' + status);
        }
    });
}

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

function isDate(txtDate) {

    var currVal = txtDate;

    if (currVal == '') {
        return false;
    }
    //Declare Regex 
    var rxDatePattern = "/^(0?[1-9]|[12][0-9]|3[01])[\/\-](0?[1-9]|1[012])[\/\-]\d{4}$/";
    //DD/MM/YYYY
    var dtArray = currVal.match(rxDatePattern); // is format OK?
    if (dtArray === null) {
        return false;
    }
    //Checks for mm/dd/yyyy format.
    dtMonth = dtArray[1];
    dtDay = dtArray[3];
    dtYear = dtArray[5];
    if (dtMonth < 1 || dtMonth > 12) {
        return false;
    } else if (dtDay < 1 || dtDay > 31) {
        return false;
    } else if ((dtMonth == 4 || dtMonth == 6 || dtMonth == 9 || dtMonth == 11) && dtDay == 31) {
        return false;
    } else if (dtMonth == 2) {
        var isleap = (dtYear % 4 == 0 && (dtYear % 100 != 0 || dtYear % 400 == 0));
        if (dtDay > 29 || (dtDay == 29 && !isleap)) {
            return false;
        }
    }
    return true;
}

function getAddressFromCoords() {
    var geocoder = new google.maps.Geocoder();
    geocoder.geocode({
        'address': $("#autocomplete").val()
    }, function (results, status) {
        if (status == google.maps.GeocoderStatus.OK) {

            var inName = $("#name").val();
            var inPreis = $("#preis").val();
            var inLat = results[0].geometry.location.lat();
            var inLng = results[0].geometry.location.lng();
            var inGeschaeft = $("#geschaeft").val();
            var inDate = $("#date").val();
            var inIsWichtig = $("#flipSwitchDetail").val();
            var inIsDone = false;
            fillEintragObjArray(inName, inPreis, inLat, inLng, inGeschaeft, inDate, inIsWichtig, inIsDone);

            $("#eintraegeList").empty();
            fillListWithData();

            $(':mobile-pagecontainer').pagecontainer('change', '#home', {
                transition: 'flip',
                reverse: true,
                showLoadMsg: true
            });
        } else {
            alert('Geocode was not successful for the following reason: ' + status);
        }
    });
}

function deleteItem() {
    eintragObjArray.forEach(function (curObj) {
        if (curObj.id == idToDelete) {
            eintragObjArray.remove(idToDelete);
        }
    });
}