"use strict";

export {mapbox, openWeather}

const mapbox = {
    getJSONSearchQuery: function (search, tokenMapbox) {
        const baseUrl = 'https://api.mapbox.com';
        const endPointUrl = '/geocoding/v5/mapbox.places/';
        const searchText = encodeURIComponent(search) + '.json';
        return fetch(baseUrl + endPointUrl + searchText + '?' + 'access_token=' + tokenMapbox)
            .then(function (res) {
                return res.json()
            }).catch(function (err) {
                console.log(err);
            });
    }
}

const openWeather = {
    getForecastAtLocation: function (location, tokenOpenWeather) {
        return fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${location.lat.toFixed(2)}&lon=${location.lng.toFixed(2)}&appid=${tokenOpenWeather}`)
            .then(function (res) {
                return res.json()
            }).catch(function (err) {
                console.log(err);
            });
    }
}