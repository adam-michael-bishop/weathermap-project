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
	container: 'map',
	style: mapStyles.streets,
	zoom: 10,
	center: [-98.4916, 29.4252]
});
const marker = new mapboxgl.Marker({
	draggable: true
})
let windowHeight = $(window).height();
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
	let theme = '';
	if ($('html').attr("data-bs-theme") === 'dark') {
		theme = 'popup-dark';
	}
	return new mapboxgl.Popup()
		.setLngLat(coords)
		.setHTML(popupHTML)
		.setMaxWidth('250px')
		.addClassName(theme);
}

async function getFiveDayForecastAtLocation(coords) {
	const res = await Call.openWeather.getForecastAtLocation(coords, OPENWEATHER_API_KEY);
	const arr = res.list;
	const firstTime = arr[0].dt_txt.split(' ')[1];
	let forecastArray = [];
	for (let i = 0; i < arr.length; i++) {
		if (arr[i].dt_txt.split(' ')[1] === firstTime) {
			forecastArray.push(arr[i]);
		}
	}
	return {cityName: res.city.name, forecasts: forecastArray}
}

function createFiveDayForecastHTML({cityName, forecasts}) {
	let html = `<h5 class="text-center">${cityName}</h5>`;
	for (const [i, forecast] of forecasts.entries()) {
		html += `<div class="carousel-item ${i === 0 ? 'active' : ''}">
                    <div class="d-flex flex-column mx-auto px-5">
                        <p class="text-center fs-6">${days[new Date(forecast.dt * 1000).getDay()]}</p>
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
	console.log(cityName);
	return popupStart + html + popupEnd;
}

map.on('load', function () {
	$('#map').height($(window).height() - $('#main-nav').outerHeight());
	// console.log($(window).height());
	// console.log($('#main-nav').height());
	map.resize()
		.addControl(new mapboxgl.GeolocateControl({
			positionOptions: {
				enableHighAccuracy: true
			}, // When active the map will receive updates to the device's location as it changes.
			trackUserLocation: true, // Draw an arrow next to the location dot to indicate which direction the device is heading.
			showUserHeading: false
		}));
	marker.setLngLat(map.getCenter())
		.addTo(map);
	$('#search-form').submit(function (e){
		e.preventDefault();
		Call.mapbox.getJSONSearchQuery($('#search-bar').val(), MAPBOX_API_KEY)
			.then(function (res){
				marker.setLngLat(res.features[0].center)
					.togglePopup();
				map.flyTo({
					center: marker.getLngLat(),
					zoom: 8,
				})
				getFiveDayForecastAtLocation(marker.getLngLat())
					.then(function (res){
						marker.setPopup(createPopup(marker.getLngLat(), createFiveDayForecastHTML(res)))
							.togglePopup();
					})
			})
	});
	// getFiveDayForecastAtLocation(map.getCenter())
	// 	.then(function (res){
	// 		marker.setPopup(createPopup(map.getCenter(), createFiveDayForecastHTML(res)))
	// 			.togglePopup();
	// 	})
	// 	.catch(function (err){
	// 		console.log(err);
	// 	});
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
			}).catch(function (err){
				console.log(err);
		});
	});
});

$('#search-form').submit(function (e){
	e.preventDefault();
});

$('#switch-theme').change(function (){
	if (this.checked) {
		$('#theme-icon-dark').removeClass('d-none');
		$('#theme-icon-light').addClass('d-none');
		$('html').attr("data-bs-theme", "dark");
		map.setStyle(mapStyles.dark)
		marker.getPopup()
			.toggleClassName('popup-dark');
	} else {
		$('#theme-icon-light').removeClass('d-none');
		$('#theme-icon-dark').addClass('d-none');
		$('html').attr("data-bs-theme", "light");
		map.setStyle(mapStyles.streets)
		marker.getPopup()
			.toggleClassName('popup-dark');
	}
});

$(window).resize(function (){
	if (windowHeight !== window.innerHeight) {
		windowHeight = window.innerHeight;
		$('#map').height($(window).height() - $('#main-nav').outerHeight());
	}
})