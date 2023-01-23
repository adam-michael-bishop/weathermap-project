"use strict";

import {MAPBOX_API_KEY, OPENWEATHER_API_KEY} from "./keys.js";
import * as Call from "./call.js";

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
    zoom: 10,
    center: [-98.4916, 29.4252]
});

function createPopup(coords, popupHTML = '') {
    return new mapboxgl.Popup()
        .setLngLat(coords)
        .setHTML(popupHTML);
}

function search() {

}

async function getFiveDayForecastAtLocation(coords) {
    const res = await Call.openWeather.getForecastAtLocation(coords, OPENWEATHER_API_KEY);
    const arr = res.list;
    const firstTime = arr[0].dt_txt.split(' ')[1];
    let forecast = [];
    for (let i = 0; i < arr.length; i++) {
        if (arr[i].dt_txt.split(' ')[1] === firstTime) {
            forecast.push(arr[i]);
        }
    }
    return forecast;
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
    const marker = new mapboxgl.Marker()
        .setLngLat(map.getCenter())
        .setPopup(createPopup(map.getCenter()))
        .addTo(map)
        .togglePopup();
});

