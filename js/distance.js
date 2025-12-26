// Simple geocode using OpenStreetMap Nominatim
async function geocode(query) {
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
    query
  )}&format=json&limit=1`;

  const res = await fetch(url, {
    headers: {
      "User-Agent": "Personal long-distance site (learning project)"
    }
  });

  const data = await res.json();
  if (!data.length) return null;

  return {
    lat: parseFloat(data[0].lat),
    lon: parseFloat(data[0].lon),
    display: data[0].display_name
  };
}

// Haversine distance in miles
function distanceMiles(lat1, lon1, lat2, lon2) {
  const R = 3958.8; // earth radius in miles
  const toRad = (d) => (d * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

let map;
let youMarker;
let themMarker;

function initMap() {
  const mapEl = document.getElementById("distanceMap");
  if (!mapEl) return;

  map = L.map("distanceMap").setView([20, 0], 2); // world view

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap"
  }).addTo(map);
}

function initDistanceUI() {
  const form = document.getElementById("distanceForm");
  const result = document.getElementById("distanceResult");
  const caption = document.getElementById("mapCaption");

  if (!form || !result || !caption) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const youQ = document.getElementById("youAddress").value.trim();
    const themQ = document.getElementById("themAddress").value.trim();

    if (!youQ || !themQ) {
      result.textContent = "enter both locations 💌";
      return;
    }

    result.textContent = "finding our dots on the map…";

    const [you, them] = await Promise.all([geocode(youQ), geocode(themQ)]);

    if (!you) {
      result.textContent = "couldn't find your location 😭";
      return;
    }
    if (!them) {
      result.textContent = "couldn't find their location 😭";
      return;
    }

    // place / update markers
    if (!youMarker) {
      youMarker = L.marker([you.lat, you.lon], { title: "You" }).addTo(map);
    } else {
      youMarker.setLatLng([you.lat, you.lon]);
    }

    if (!themMarker) {
      themMarker = L.marker([them.lat, them.lon], { title: "Them" }).addTo(map);
    } else {
      themMarker.setLatLng([them.lat, them.lon]);
    }

    // zoom to show both
    const group = L.featureGroup([youMarker, themMarker]);
    map.fitBounds(group.getBounds(), { padding: [40, 40] });

    // calculate miles
    const miles = Math.round(
      distanceMiles(you.lat, you.lon, them.lat, them.lon)
    );

    result.textContent = `right now, we're about ${miles.toLocaleString()} miles apart.`;

    caption.textContent = `you: ${you.display} · them: ${them.display}`;
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initMap();
  initDistanceUI();
});

