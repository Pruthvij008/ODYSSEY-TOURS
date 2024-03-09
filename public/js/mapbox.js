/* eslint-disable */

const locationwwww = JSON.parse(
  document.getElementById('map').dataset.locations
);
console.log(locationwwww);
maptilersdk.config.apiKey = 'DrLHBz4sGQJTXNNCWdc3';
const locations = JSON.parse(document.getElementById('map').dataset.locations);
const map = new maptilersdk.Map({
  container: 'map',
  style: maptilersdk.MapStyle.STREETS,
  center: locationwwww[0].coordinates,
  zoom: 7
});

locations.forEach(location => {
  // Create a custom marker element
  const el = document.createElement('div');
  el.className = 'marker';
  //   // You can add any custom styling or content to your marker element
  //   marker.innerHTML = '<img src="path/to/your-marker-icon.png" alt="Marker">';

  // Set the marker's position
  const { coordinates } = location;
  const lngLat = new maptilersdk.LngLat(coordinates[0], coordinates[1]);

  // Add the marker to the map
  new maptilersdk.Marker({ element: el, anchor: 'bottom' })
    .setLngLat(lngLat)
    .addTo(map);
});
