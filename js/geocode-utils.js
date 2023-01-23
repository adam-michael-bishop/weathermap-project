"use strict";

export {getJSONSearchQuery}

function getJSONSearchQuery(search, token) {
    const baseUrl = 'https://api.mapbox.com';
    const endPointUrl = '/geocoding/v5/mapbox.places/';
    const searchText = encodeURIComponent(search) + '.json';
    return fetch(baseUrl + endPointUrl + searchText + '?' + 'access_token=' + token)
        .then(function (res){
            return res.json();
        }).catch(function (err){
            console.log(err);
        });
}