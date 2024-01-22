// Define the map variable globally
var mymap;

document.addEventListener('DOMContentLoaded', function () {
    // Leaflet map initialization code here
    mymap = L.map('map').setView([0, 0], 2);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(mymap);

    // Fetch earthquake data using Fetch API
    fetch('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson')
        .then(response => {
            if (!response.ok) {
                throw new Error(`Network response was not ok (${response.status} ${response.statusText})`);
            }
            return response.json();
        })
        .then(data => {
            // Define marker size based on magnitude
            function markerSize(magnitude) {
                // Handle cases where magnitude is missing or NaN
                return isNaN(magnitude) ? 0 : magnitude * 50000;
            }

            // Define color scale for magnitude using D3
            var magnitudeColorScale = d3.scaleSequential(d3.interpolateReds)
                .domain([0, d3.max(data.features, d => d.properties.mag)]);

// Loop through earthquake features and create circle markers
data.features.forEach(feature => {
    var properties = feature.properties;
    var geometry = feature.geometry;

    // Check if latitude, longitude, magnitude, and depth are defined
    if (geometry && geometry.coordinates && geometry.coordinates.length === 3) {
        var latitude = geometry.coordinates[1];
        var longitude = geometry.coordinates[0];
        var magnitude = properties.mag;
        var depth = geometry.coordinates[2];

        // Update color scale to d3.interpolateGreens
        var depthColorScale = d3.scaleSequential(d3.interpolateGreens)
            .domain([0, 90]);

        // Create circle marker
        var circleMarker = L.circle([latitude, longitude], {
            fillOpacity: 0.75,
            color: 'white',
            fillColor: depthColorScale(depth),
            radius: markerSize(magnitude)
        }).bindPopup(`<h1>Earthquake</h1> <hr> <h3>Magnitude: ${magnitude}</h3> <h3>Depth: ${depth} km</h3> <h3>Latitude: ${latitude}</h3> <h3>Longitude: ${longitude}</h3>`).addTo(mymap);
    }
});

// Add legend for depth
var depthLegend = L.control({ position: 'bottomleft' });

depthLegend.onAdd = function (map) {
    var div = L.DomUtil.create('div', 'info legend');
    var depthLabels = [0, 10, 30, 50, 70, 90];
    var depthColorScale = d3.scaleSequential(d3.interpolateGreens)
        .domain([0, 90]);

    // Create a legend with colors and depth labels
    div.innerHTML += '<strong>Depth</strong><br>';
    for (var i = 0; i < depthLabels.length - 1; i++) {
        var startColor = d3.color(depthColorScale(depthLabels[i])).hex();
        var endColor = d3.color(depthColorScale(depthLabels[i + 1])).hex();
        div.innerHTML +=
            '<div style="background: linear-gradient(to right, ' + startColor + ', ' + endColor + '); height: 20px;"></div>' +
            '<label>' + depthLabels[i] + '&ndash;' + depthLabels[i + 1] + ' km</label><br>';
    }
    var lastColor = d3.color(depthColorScale(depthLabels[depthLabels.length - 1])).hex();
    div.innerHTML +=
        '<div style="background: linear-gradient(to right, ' + lastColor + ', ' + lastColor + '); height: 20px;"></div>' +
        '<label>' + depthLabels[depthLabels.length - 1] + '+ km</label><br>';

    return div;
};

depthLegend.addTo(mymap);
        })
        .catch(error => console.error('Error fetching earthquake data:', error));
});
