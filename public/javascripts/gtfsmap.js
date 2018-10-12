var mymap = L.map('mapid').setView([34.673716, 133.923387], 15);

L.tileLayer(
    'http://{s}.tile.osm.org/{z}/{x}/{y}.png', 
    { attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors' }
).addTo(mymap);
getStops("stops");

const geojsonMarkerOptions = {
    radius: 8,
    fillColor: "#ff7800",
    color: "#000",
    weight: 1,
    opacity: 1,
    fillOpacity: 0.8
};


function onEachFeature(feature, layer) {
    // does this feature have a property named popupContent?
    if (feature.properties && feature.properties.stop_name) {
        layer.bindPopup(feature.properties.stop_name);

        console.log(feature.properties.stop_id);
    }
}


async function getStops(url) {
    const response = await fetch(url);
    const json = await response.json();
//    console.log(json);

    L.geoJSON(json, {
        onEachFeature: onEachFeature,
        pointToLayer: function (feature, latlng) {
            return L.circleMarker(latlng, geojsonMarkerOptions);
        }
    }).addTo(mymap);
}
