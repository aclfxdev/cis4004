// MAIN SCRIPTS FILE.

// --- Weather Icons Mapping ---
// Maps keywords from the forecast condition to weather-icons CSS classes.
const weatherIconClassMap = {
    "Clear": "wi-day-sunny",
    "Sunny": "wi-day-sunny",
    "Mostly Sunny": "wi-day-sunny-overcast",
    "Partly Cloudy": "wi-day-cloudy",
    "Mostly Cloudy": "wi-cloudy",
    "Cloudy": "wi-cloudy",
    "Overcast": "wi-cloudy",
    "Rain": "wi-day-rain", 
    "Showers": "wi-day-showers",
    "Thunderstorm": "wi-day-thunderstorm",
    "Snow": "wi-day-snow",
    "Sleet": "wi-sleet",
    "Fog": "wi-fog"
};

function getWeatherIconClass(condition) {
    for (const key in weatherIconClassMap) {
        if (condition.indexOf(key) !== -1) {
            return weatherIconClassMap[key];
        }
    }
    return "wi-na";
}

// Define the function to fetch with User-Agent
function fetchWithUserAgent(url) {
    const headers = {
        "User-Agent": "CIS-4004 Weather Forecasting (ch797590@ucf.edu / ja939451@ucf.edu)",
        "Accept": "application/json"
    };

    return fetch(url, { headers })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .catch(error => {
            console.error("Error fetching data:", error);
            throw error;
        });
}

// ================= Cookie Helpers =================
function setCookie(cname, cvalue, exdays) {
    const d = new Date();
    d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
    const expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname) {
    const name = cname + "=";
    const decodedCookie = decodeURIComponent(document.cookie);
    const ca = decodedCookie.split(";");
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i].trim();
        if (c.indexOf(name) === 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

// ================= Dark Mode Functions (Cookie-Based) =================
function applyTheme(theme) {
    if (theme === "dark") {
        document.body.classList.add("dark-mode");
    } else {
        document.body.classList.remove("dark-mode");
    }
}

function initTheme() {
    const themeCookie = getCookie("theme");
    let theme;
    if (themeCookie) {
        theme = themeCookie;
    } else {
        const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
        theme = prefersDark ? "dark" : "light";
    }
    applyTheme(theme);
    const toggleSwitch = document.getElementById("theme-toggle");
    if (toggleSwitch) {
        toggleSwitch.checked = theme === "dark";
        toggleSwitch.addEventListener("change", function () {
            if (document.body.classList.contains("dark-mode")) {
                document.body.classList.remove("dark-mode");
                setCookie("theme", "light", 30);
            } else {
                document.body.classList.add("dark-mode");
                setCookie("theme", "dark", 30);
            }
        });
    }
}

document.addEventListener("DOMContentLoaded", initTheme);

// ================= Geolocation =================
if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
        (position) => {
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;
            console.log(`%cLatitude: ${latitude}\nLongitude: ${longitude}`, "color: green");

            // Fetch endpoints using latitude and longitude
            getEndpoints(latitude, longitude);
        },
        (error) => {
            console.error(`%cError getting location: ${error.message}`, "color:red");
        }
    );
} else {
    console.error("%cGeolocation is not supported by this browser!", "color: red");
}

// ================= Weather.gov API Functions =================
async function getEndpoints(latitude, longitude) {
    try {
        const url = `https://api.weather.gov/points/${latitude},${longitude}`;
        const data = await fetchWithUserAgent(url);

        // Store hourly forecast URL from data
        const hourlyForecastUrl = data.properties.forecastHourly;

        // Fetch hourly weather forecast
        getForecast(hourlyForecastUrl);
    } catch (error) {
        console.error(`%c${error.message}`, "color: red");
    }
}

async function getForecast(hourlyForecastUrl) {
    try {
        const data = await fetchWithUserAgent(hourlyForecastUrl);
        const periods = data.properties.periods;
        const now = new Date();
        const cutoff = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        const filteredPeriods = periods.filter(period => {
            const periodStart = new Date(period.startTime);
            return periodStart >= now && periodStart <= cutoff;
        });

        console.log("Filtered periods:", filteredPeriods);
        createWeatherCards(filteredPeriods);
    } catch (error) {
        console.error(`%c${error.message}`, "color: red");
    }
}

function createWeatherCards(periods) {
    const row1Container = document.getElementById("row-1");
    const row2Container = document.getElementById("row-2");

    if (!row1Container || !row2Container) {
        console.warn("⚠️ Forecast containers not found.");
        return;
    }

    row1Container.innerHTML = "";
    row2Container.innerHTML = "";
    const firstHalf = periods.slice(0, 12);
    const secondHalf = periods.slice(12, 24);

    function createCard(element) {
        const div = document.createElement("div");
        div.className = "card";
        
        const h3 = document.createElement("h3");
        const iconElem = document.createElement("i");
        const p = document.createElement("p");

        const iconClass = getWeatherIconClass(element.shortForecast);
        iconElem.className = `wi ${iconClass}`;
        iconElem.classList.add("wi-3x");

        const localTime = new Date(element.startTime).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true
        });
        h3.textContent = localTime;

        let tempText;
        if (element.temperatureUnit === "F") {
            const fahrenheit = element.temperature;
            const celsius = Math.round((fahrenheit - 32) * 5 / 9);
            tempText = `${fahrenheit}°F (${celsius}°C)`;
        } else {
            tempText = `${element.temperature}°${element.temperatureUnit}`;
        }
        p.innerHTML = `${element.shortForecast}<br>${tempText}`;

        div.appendChild(h3);
        div.appendChild(iconElem);
        div.appendChild(p);
        return div;
    }

    firstHalf.forEach(element => row1Container.appendChild(createCard(element)));
    secondHalf.forEach(element => row2Container.appendChild(createCard(element)));
}

// ================= Google Maps Integration =================
let map;
let marker;

function initMap() {
    const initialLocation = { lat: 39.8283, lng: -98.5795 };
    map = new google.maps.Map(document.getElementById("map"), {
        center: initialLocation,
        zoom: 4
    });

    map.addListener("click", (event) => {
        const clickedLocation = event.latLng;
        if (marker) {
            marker.position = clickedLocation;
        } else {
            marker = new google.maps.marker.AdvancedMarkerElement({
                position: clickedLocation,
                map: map,
                title: "Selected Location",
                content: createPin("#4285F4")
            });
        }
        const lat = clickedLocation.lat();
        const lng = clickedLocation.lng();
        getEndpoints(lat, lng);
    });
}

// Helper function to create a pin using PinView
function createPin(color = "#4285F4") {
    const pinView = new google.maps.marker.PinView({
        scale: 1,
        background: color
    });
    return pinView.element;
}

// Function to check authentication status across all pages
function checkAuthStatus() {
    fetch('/.auth/me', {
		credentials: 'include'  // Explicitly include cookies
	})
        .then(response => response.json())
        .then(data => {
            if (data.length > 0) {
                const user = data[0];
                document.getElementById("account-status").innerText = "Signed in as " + user.user_id;
                document.getElementById("login-btn").style.display = "none";
                document.getElementById("logout-btn").style.display = "inline-block";
            } else {
                document.getElementById("account-status").innerText = "Not signed in";
                document.getElementById("login-btn").style.display = "inline-block";
                document.getElementById("logout-btn").style.display = "none";
            }
        })
        .catch(error => {
            console.error("Error checking login status:", error);
            document.getElementById("account-status").innerText = "Error checking login status";
        });
}

// Auth check and dynamically update login button redirect
window.addEventListener('load', function() {
    // First, update the login button's redirect dynamically:
    const loginBtn = document.getElementById("login-btn");
    if (loginBtn) {
        const currentPath = window.location.pathname;
        loginBtn.href = "/.auth/login/google?post_login_redirect_uri=" + encodeURIComponent(currentPath);
        console.log("Updated login btn href:", loginBtn.href);
    }
    
    // Then, check the authentication status:
    checkAuthStatus();
});

let currentUserId = null;

function showSavedLocationsSection() {
    document.getElementById("saved-locations-container").style.display = "block";
}

function loadSavedLocations() {
    fetch(`/api/locations/${currentUserId}`)
        .then(res => res.json())
        .then(locations => {
            const list = document.getElementById("saved-locations-list");
            list.innerHTML = '';
            locations.forEach(loc => {
                const item = document.createElement("li");
                item.className = "list-group-item";
                item.innerHTML = `<strong>${loc.location_name}</strong> (${loc.latitude}, ${loc.longitude})`;
                item.addEventListener("click", () => getEndpoints(loc.latitude, loc.longitude));
                list.appendChild(item);
            });
        });
}

document.getElementById("save-location-form")?.addEventListener("submit", function (e) {
    e.preventDefault();
    const location_name = document.getElementById("location-name").value;
    const latitude = parseFloat(document.getElementById("latitude").value);
    const longitude = parseFloat(document.getElementById("longitude").value);

    fetch("/api/locations", {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: currentUserId, location_name, latitude, longitude })
    }).then(() => {
        loadSavedLocations();
        e.target.reset();
    });
});

function checkAuthStatus() {
    fetch('/.auth/me', {
        credentials: 'include'
    })
        .then(response => response.json())
        .then(data => {
            if (data.length > 0) {
                const user = data[0];
                currentUserId = user.user_id;
                document.getElementById("account-status").innerText = "Signed in as " + currentUserId;
                document.getElementById("login-btn").style.display = "none";
                document.getElementById("logout-btn").style.display = "inline-block";
                showSavedLocationsSection();
                loadSavedLocations();
            } else {
                document.getElementById("account-status").innerText = "Not signed in";
                document.getElementById("login-btn").style.display = "inline-block";
                document.getElementById("logout-btn").style.display = "none";
            }
        });
}

/*
function loadBookmarks() {
  if (!currentUserId) return;

  fetch(`/api/locations/${currentUserId}`)
    .then(res => res.json())
    .then(locations => {
      const container = document.getElementById("saved-locations-list");
      container.innerHTML = '';

      locations.forEach(loc => {
        const card = document.createElement("div");
        card.className = "col-12 mb-4 p-3 border rounded bg-dark text-white";

        card.innerHTML = `
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <strong>${loc.location_name}</strong> (${loc.latitude.toFixed(4)}, ${loc.longitude.toFixed(4)})
            </div>
            <button class="btn btn-sm btn-danger" onclick="deleteBookmark(${loc.id})">Delete</button>
          </div>
          <div id="forecast-${loc.id}" class="row mt-3"></div>
        `;

        container.appendChild(card);

        // Show the 24-hour forecast for this bookmark
        getEndpointsForBookmarks(loc.latitude, loc.longitude, `forecast-${loc.id}`);
      });
    })
    .catch(err => {
      console.error("❌ Error loading bookmarks:", err);
    });
}


function deleteBookmark(id) {
  if (confirm("Are you sure you want to delete this bookmark?")) {
    fetch(`/api/locations/${id}`, {
      method: "DELETE"
    })
    .then(res => res.json())
    .then(() => {
      loadBookmarks(); // Refresh the list
    })
    .catch(err => {
      console.error("❌ Failed to delete bookmark:", err);
    });
  }
}


function getEndpointsForBookmark(lat, lon, cityStationId, row1Id, row2Id) {
  fetchWithUserAgent(`https://api.weather.gov/points/${lat},${lon}`)
    .then(data => {
      const { city, state } = data.properties.relativeLocation.properties;
      const station = data.properties.radarStation;
      document.getElementById(cityStationId).textContent = `Nearest City: ${city}, ${state} | Station: ${station}`;
      return fetchWithUserAgent(data.properties.forecastHourly);
    })
    .then(data => {
      const now = new Date();
      const cutoff = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      const periods = data.properties.periods.filter(p => {
        const start = new Date(p.startTime);
        return start >= now && start <= cutoff;
      });

      const row1 = document.getElementById(row1Id);
      const row2 = document.getElementById(row2Id);

      if (!row1 || !row2) {
        console.warn("Missing row containers:", row1Id, row2Id);
        return;
      }

      row1.innerHTML = '';
      row2.innerHTML = '';

      periods.forEach((p, i) => {
        const card = document.createElement("div");
        card.className = "card p-2 text-center";
        card.style.width = "120px";

        const icon = getWeatherIconClass(p.shortForecast);
        const time = new Date(p.startTime).toLocaleTimeString([], {
          hour: "2-digit", minute: "2-digit", hour12: true
        });
        const fahrenheit = p.temperature;
        const celsius = Math.round((fahrenheit - 32) * 5 / 9);

        card.innerHTML = `
          <h6>${time}</h6>
          <i class="wi ${icon} wi-3x"></i>
          <p>${p.shortForecast}<br>${fahrenheit}°F (${celsius}°C)</p>
        `;

        if (i < 12) row1.appendChild(card);
        else row2.appendChild(card);
      });
    })
    .catch(err => console.error("Forecast loading failed:", err));
}
*/


if (window.location.pathname.includes("bookmarks.html")) {
    checkAuthStatus(); // ensures currentUserId is set
    loadBookmarks();   // loads and renders forecasts
}
