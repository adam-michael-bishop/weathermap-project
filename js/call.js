"use strict";

export {mapbox, openWeather}

const mapbox = {
    getJSONSearchQuery: function (search) {
        const baseUrl = 'https://api.mapbox.com';
        const endPointUrl = '/geocoding/v5/mapbox.places/';
        const searchText = encodeURIComponent(search) + '.json';
        return fetch(baseUrl + endPointUrl + searchText + '?' + 'access_token=' + mapboxgl.accessToken)
            .then(function (res) {
                if (res.ok) {
                    return res.json()
                }
            }).catch(function (err) {
                return err
            });
    }
}

const openWeather = {
    getForecastAtLocation: function (location) {
        // proxy through Netlify Function so OPENWEATHER_API_KEY stays server-side
        const url = `/.netlify/functions/api?fn=openweather-forecast&lat=${location.lat.toFixed(2)}&lon=${location.lng.toFixed(2)}`;
        return fetch(url)
            .then(function (res) {
                if (res.ok) {
                    return res.json()
                }
            }).catch(function (err) {
                return err
            });
    }
}