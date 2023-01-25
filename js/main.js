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
	style: localStorage.getItem("theme") !== 'dark' ? mapStyles.streets : mapStyles.dark,
	zoom: 1,
	center: [-98.4916, 29.4252]
});
const marker = new mapboxgl.Marker({
	draggable: true
});
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
	return new mapboxgl.Popup({
		closeButton: false
	})
		.setLngLat(coords)
		.setHTML(popupHTML)
		.setMaxWidth('250px')
		.addClassName(theme);
}

function getFiveDayForecastAtLocation(coords, res) {
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
	return popupStart + html + popupEnd;
}

function displaySearchNotFoundAlert(res) {
	const searchTerm = res.query.join( ' ');
	let	hideSearchAlertTimeout = setTimeout(function () {
		if (!($('#search-not-found').hasClass('d-none'))) {
			$('#search-not-found').addClass('d-none');
			clearTimeout(hideSearchAlertTimeout);
		}
	}, 5000);
	$('#search-not-found')
		.removeClass('d-none')
		.text(`${searchTerm[0].toUpperCase() + searchTerm.substring(1, searchTerm.length)} was not found.`)
		.click(function (){
			$(this).addClass('d-none');
			clearTimeout(hideSearchAlertTimeout);
		});
}

function displayErrorMessage() {
	$('#error-message').text(`Something went wrong ¯\\_(ツ)_/¯ click to dismiss`)
		.removeClass('d-none')
		.click(function (){
			$(this).addClass('d-none');
		})
}

function hideAlerts() {
	$('#error-message').addClass('d-none');
	$('#search-not-found').addClass('d-none');
}

function moveMarkerAndDisplayForecast(newLocation) {
	console.log(newLocation);
	Call.openWeather.getForecastAtLocation(newLocation, OPENWEATHER_API_KEY)
		.then(function (res) {
			const forecast = getFiveDayForecastAtLocation(newLocation, res);
			marker.setPopup(createPopup(newLocation, createFiveDayForecastHTML(forecast)))
				.togglePopup();
		}).catch(function () {
			let popup = new mapboxgl.Popup({
				closeButton: false
			}).addClassName('warning-popup')
				.setLngLat(marker.getLngLat())
				.setHTML(`Something went wrong. Try moving the pin to a new location`)
				.setMaxWidth('100px');
			marker.setPopup(popup).togglePopup();
	});
}

function fixMarkerLng({lng, lat}) {
	let newCoords = {lng: lng, lat: lat}
	if (lng > 180) {
		newCoords.lng -= 360;
	} else if (lng < -180) {
		newCoords.lng += 360;
	}
	return newCoords
}

map.on('load', function () {
	$('#map-loading').addClass('d-none');
	$('#map').height($(window).height() - $('#main-nav').outerHeight());
	$('#search-form').submit(function (e){
		e.preventDefault();
		hideAlerts();
		Call.mapbox.getJSONSearchQuery($('#search-bar').val(), MAPBOX_API_KEY)
			.then(function (res){
				if (res.features.length === 0) {
					displaySearchNotFoundAlert(res);
				}
				marker.setLngLat(res.features[0].center)
					.togglePopup();
				map.flyTo({
					center: marker.getLngLat(),
					zoom: 8,
				});
				moveMarkerAndDisplayForecast(marker.getLngLat());
			}).catch(function (){
				displayErrorMessage();
		});
	});
	const geocoder = new MapboxGeocoder({
		accessToken: mapboxgl.accessToken,
		mapboxgl: mapboxgl,
		marker: false
	});
	map.resize()
		.addControl(geocoder);
	geocoder.on('result', function (result){
		console.log(result);
		marker.setLngLat(result.result.center);
		moveMarkerAndDisplayForecast({lat: result.result.center[1], lng: result.result.center[0]});
	})
	marker.setLngLat(map.getCenter())
		.addTo(map);
	moveMarkerAndDisplayForecast(map.getCenter());
	marker.on('dragstart', function (){
		if (marker.getPopup().isOpen()) {
			marker.togglePopup()
		}
	});
	marker.on('dragend', function (){
		marker.getPopup()
			.removeClassName('warning-popup')
			.setHTML(`<div id="popup-loading" class="spinner-border" role="status">
						<span class="visually-hidden">Loading...</span>
					</div>`);
		marker.togglePopup();
		console.log(marker.getLngLat());
		moveMarkerAndDisplayForecast(fixMarkerLng(marker.getLngLat()));
	});
});

$('html').attr('data-bs-theme', `${localStorage.getItem('theme')}`)

$('#search-form').submit(function (e){
	e.preventDefault();
});

$('#switch-theme')
	.prop("checked", localStorage.getItem('theme') === 'dark')
	.change(function (){
	if (this.checked) {
		// $('#theme-icon-dark').removeClass('d-none');
		// $('#theme-icon-light').addClass('d-none');
		$('html').attr("data-bs-theme", "dark");
		map.setStyle(mapStyles.dark);
		if (!(marker.getPopup()._classList.has('warning-popup'))) {
			marker.getPopup()
				.addClassName('popup-dark');
		}
		localStorage.setItem('theme', 'dark');
	} else {
		// $('#theme-icon-light').removeClass('d-none');
		// $('#theme-icon-dark').addClass('d-none');
		$('html').attr("data-bs-theme", "light");
		map.setStyle(mapStyles.streets)
		if (!(marker.getPopup()._classList.has('warning-popup'))) {
		marker.getPopup()
			.removeClassName('popup-dark');
		}
		localStorage.setItem('theme', 'light');

	}
});

$(window).resize(function (){
	if (windowHeight !== window.innerHeight) {
		windowHeight = window.innerHeight;
		$('#map').height($(window).height() - $('#main-nav').outerHeight());
	}
})