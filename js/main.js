"use strict";

import {MAPBOX_API_KEY, OPENWEATHER_API_KEY} from "./keys.js";

mapboxgl.accessToken = MAPBOX_API_KEY;
const mapStyles = {
    streets: 'mapbox://styles/mapbox/streets-v12',
    satellite: 'mapbox://styles/mapbox/satellite-v9',
    light: 'mapbox://styles/mapbox/light-v11',
    dark: 'mapbox://styles/mapbox/dark-v11'
}
const map = new mapboxgl.Map({
    container: 'map',
    style: mapStyles.streets,
    zoom: 8,
    center: [-98.4916, 29.4252]
});

function createMarker(coords) {
    return new mapboxgl.Marker()
        .setLngLat(coords)
        .addTo(map);
}

function search() {

}

map.on('load', function () {
    $('#map').height($(window).height());
    map.resize()
        .addControl(
            new mapboxgl.GeolocateControl({
                positionOptions: {
                    enableHighAccuracy: true
                },
                // When active the map will receive updates to the device's location as it changes.
                trackUserLocation: true,
                // Draw an arrow next to the location dot to indicate which direction the device is heading.
                showUserHeading: false
            })
        );
});
