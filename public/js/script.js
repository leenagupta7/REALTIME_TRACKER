const socket = io();

// Ask for the user's name when they open the page
const userName = prompt("Please enter your name:");

// Check if the browser supports geolocation
if (navigator.geolocation) {
  navigator.geolocation.watchPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      socket.emit("send-location", { latitude, longitude, name: userName });
    },
    (error) => {
      console.error(error);
    },
    {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0,
    }
  );
}

// Initialize the map
const map = L.map("map").setView([0, 0], 16);

// Add OpenStreetMap tiles
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: "Leena Gupta"
}).addTo(map);

// Object to store markers for each connected user
const markers = {};

// Listen for 'receive-location' events from the server
socket.on('receive-location', (data) => {
  const { id, latitude, longitude, name } = data;
  map.setView([latitude, longitude], 16);

  // If the marker already exists, update its position
  if (markers[id]) {
    markers[id].setLatLng([latitude, longitude]);
  } else {
    // Otherwise, create a new marker and add a popup with the user's name
    markers[id] = L.marker([latitude, longitude]).addTo(map);
    markers[id].bindPopup(`<b>${name}</b>`).openPopup();
  }
});

// Handle user disconnections and remove their marker
socket.on('user-disconnected', (id) => {
  if (markers[id]) {
    map.removeLayer(markers[id]);
    delete markers[id];
  }
});
