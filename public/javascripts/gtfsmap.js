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
        const sid = feature.properties.stop_id;
        layer.bindPopup(feature.properties.stop_name + " " + feature.properties.stop_id).on('click', updateTimetable);
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

async function updateTimetable(event){
    const stop_id = event.target.feature.properties.stop_id;
    console.log(event.target.feature.properties.stop_id);
    const response = await fetch('/timetable/' + stop_id);
    const json = await response.json();
//    console.log(json);

    const html = `
    <table>
    ${
        json.map(function(i){
            return `
    <tr>
        <td>${i['service_id']}</td>
        <td>${i['departure_time']}</td>
        <td>${i['trip_headsign']}行き</td>
        <td>${i['route_long_name']}</td>
        <td>${i['agency_name']}</td>
        <td>${i['shape_id']}</td>
    </tr>`;
        }).join('\n')
    }
    </table>
    `;

    document.querySelector("#timetable").innerHTML = html;
}

