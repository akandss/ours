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
let youMarker;     // your (football) marker
let themMarker;    // his (Patriots) marker
let routeLine;     // dotted line between you + him

// custom marker icons
const footballIcon = L.icon({
  iconUrl: "images/football_logo.png",
  iconSize: [32, 32],
  iconAnchor: [17, 34], // bottom center
  popupAnchor: [0, -34]
});

const patriotsIcon = L.icon({
  iconUrl: "images/patriots_logo.jpeg",
  iconSize: [32, 32],
  iconAnchor: [18, 36],
  popupAnchor: [0, -36]
});
function cityState(displayName) {
  if (!displayName) return "";

  const parts = displayName.split(",").map(p => p.trim());

  // Typical formats:
  // "Boston, Suffolk County, Massachusetts, United States"
  // "San Francisco, California, United States"
  // "Austin, Travis County, Texas, United States"

  const city = parts[0];
  let state = "";

  for (let i = 1; i < parts.length; i++) {
    if (parts[i].length <= 20 && !parts[i].includes("County")) {
      state = parts[i];
      break;
    }
  }

  return state ? `${city}, ${state}` : city;
}


  // center roughly on US to start
  map = L.map("distanceMap").setView([39.5, -98.35], 4);

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

    const youLatLng = [you.lat, you.lon];
    const themLatLng = [them.lat, them.lon];

    const youLabel = cityState(you.display);
    const themLabel = cityState(them.display);

// place / update YOUR marker (football)
if (!youMarker) {
  youMarker = L.marker(youLatLng, {
    title: "You",
    icon: footballIcon,
    zIndexOffset: 1000
  }).addTo(map);

  youMarker.bindTooltip(youLabel, {
    direction: "top",
    offset: [0, -10],
    opacity: 0.95,
    sticky: true
  });
} else {
  youMarker.setLatLng(youLatLng);
  youMarker.setTooltipContent(youLabel);
}

// place / update THEIR marker (Patriots)
if (!themMarker) {
  themMarker = L.marker(themLatLng, {
    title: "Them",
    icon: patriotsIcon,
    zIndexOffset: 1000
  }).addTo(map);

  themMarker.bindTooltip(themLabel, {
    direction: "top",
    offset: [0, -10],
    opacity: 0.95,
    sticky: true
  });
} else {
  themMarker.setLatLng(themLatLng);
  themMarker.setTooltipContent(themLabel);
}


    // create / update dotted line between the two
    if (!routeLine) {
      routeLine = L.polyline([youLatLng, themLatLng], {
        color: "#2F5D7C",
        weight: 2.5,
        opacity: 0.8,
        dashArray: "6 6"   // dotted pattern
      }).addTo(map);
    } else {
      routeLine.setLatLngs([youLatLng, themLatLng]);
    }

    // zoom to show both markers + line nicely
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


