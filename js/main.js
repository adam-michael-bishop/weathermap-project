"use strict";

import {MAPBOX_API_KEY, OPENWEATHER_API_KEY} from "./keys.js";
import * as Call from "./call.js";

mapboxgl.accessToken = MAPBOX_API_KEY;
const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const mapStyles = {
	streets: 'mapbox://styles/mapbox/streets-v12',
	satellite: 'mapbox://styles/mapbox/satellite-v9',
	light: 'mapbox://styles/mapbox/light-v11',
	dark: 'mapbox://styles/mapbox/dark-v11'
}
const map = new mapboxgl.Map({
	container: 'map', style: mapStyles.streets, zoom: 10, center: [-98.4916, 29.4252]
});
const popupStart = `
<div id="carouselExampleControls" class="carousel carousel-dark slide" data-bs-interval="false">
  <div class="carousel-inner">`
const popupEnd = `
<button class="carousel-control-prev" type="button" data-bs-target="#carouselExampleControls" data-bs-slide="prev">
    <span class="carousel-control-prev-icon" aria-hidden="true"></span>
    <span class="visually-hidden">Previous</span>
  </button>
  <button class="carousel-control-next" type="button" data-bs-target="#carouselExampleControls" data-bs-slide="next">
    <span class="carousel-control-next-icon" aria-hidden="true"></span>
    <span class="visually-hidden">Next</span>
  </button>
</div>`

function createPopup(coords, popupHTML = '') {
	return new mapboxgl.Popup()
		.setLngLat(coords)
		.setHTML(popupHTML)
		.setMaxWidth('250px');
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

function createFiveDayForecastHTML(forecastArray) {
	let html = '';
	for (const [i, forecast] of forecastArray.entries()) {
		html += `<div class="carousel-item ${i === 0 ? 'active' : ''}">
                    <div class="d-flex flex-column mx-auto px-5">
                        <h5 class="text-center mt-4">${days[new Date(forecast.dt * 1000).getDay()]}</h5>
                        <div class="d-flex">
                            <p>${forecast.weather[0].description}</p>
                            <img class="weather-img ms-auto" src="http://openweathermap.org/img/w/${forecast.weather[0].icon}.png" alt="${forecast.weather[0].main}">
                        </div>
                        <ul class="list-group list-group-flush">
                            <li class="list-group-item">Temp: ${forecast.main.temp} &#8457;</li>
                            <li class="list-group-item">Humidity: ${forecast.main.humidity}%</li>
                            <li class="list-group-item">Wind: ${forecast.wind.speed}mph</li>
                        </ul>
                    </div>
                 </div>`
	}
	return popupStart + html + popupEnd;
}

map.on('load', function () {
	$('#map').height($(window).height());
	map.resize()
		.addControl(new mapboxgl.GeolocateControl({
			positionOptions: {
				enableHighAccuracy: true
			}, // When active the map will receive updates to the device's location as it changes.
			trackUserLocation: true, // Draw an arrow next to the location dot to indicate which direction the device is heading.
			showUserHeading: false
		}));
	const marker = new mapboxgl.Marker({
		draggable: true
	})
		.setLngLat(map.getCenter())
		.addTo(map);
	getFiveDayForecastAtLocation(map.getCenter())
		.then(function (res){
			marker.setPopup(createPopup(map.getCenter(), createFiveDayForecastHTML(res)))
				.togglePopup();
		});
	marker.on('dragstart', function (){
		if (marker.getPopup().isOpen()) {
			marker.togglePopup()
		}
	});
	marker.on('dragend', function (){
		const newLocation = marker.getLngLat();
		getFiveDayForecastAtLocation(newLocation)
			.then(function (res){
				marker.setPopup(createPopup(newLocation, createFiveDayForecastHTML(res)))
					.togglePopup();
			});
	});
});

