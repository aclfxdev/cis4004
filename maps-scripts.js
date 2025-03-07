/* Dark Mode Functionality for Forecast Map */
function applyTheme(theme) {
    if (theme === "dark") {
        document.body.classList.add("dark-mode");
    } else {
        document.body.classList.remove("dark-mode");
    }
}

function initTheme() {
    const storedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    const theme = storedTheme ? storedTheme : (prefersDark ? "dark" : "light");
    applyTheme(theme);
    const toggleSwitch = document.getElementById("theme-toggle");
    if (toggleSwitch) {
        toggleSwitch.checked = theme === "dark";
        toggleSwitch.addEventListener("change", function () {
            if (document.body.classList.contains("dark-mode")) {
                document.body.classList.remove("dark-mode");
                localStorage.setItem("theme", "light");
            } else {
                document.body.classList.add("dark-mode");
                localStorage.setItem("theme", "dark");
            }
        });
    }
}

document.addEventListener("DOMContentLoaded", initTheme);

/* Weather Icons Mapping */
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

// Fetch with User-Agent for weather.gov API requests
function fetchWithUserAgent(url) {
    const headers = {
        'User-Agent': 'CIS-4004 Weather Forecasting (email@example.com)',
        'Accept': 'application/json',
    };
    return fetch(url, { headers })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        });
}

// Retrieve endpoints from weather.gov
async function getEndpoints(latitude, longitude) {
    try {
        const url = `https://api.weather.gov/points/${latitude},${longitude}`;
        const data = await fetchWithUserAgent(url);
        const hourlyForecastUrl = data.properties.forecastHourly;
        getForecast(hourlyForecastUrl);
    } catch (error) {
        console.error(error);
    }
}

// Get forecast data and filter for the next 24 hours
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
        createWeatherCards(filteredPeriods);
    } catch (error) {
        console.error(error);
    }
}

// Render forecast cards into two rows (first 12 and last 12)
function createWeatherCards(periods) {
    const row1Container = document.getElementById("row-1");
    const row2Container = document.getElementById("row-2");
    row1Container.innerHTML = "";
    row2Container.innerHTML = "";
    const firstHalf = periods.slice(0, 12);
    const secondHalf = periods.slice(12, 24);

    function createCard(element) {
        const div = document.createElement("div");
        div.className = "card";
        
        const h3 = document.createElement("h3");
        // Create an icon element using weather-icons
        const iconElem = document.createElement("i");
        const p = document.createElement("p");

        const iconClass = getWeatherIconClass(element.shortForecast);
        iconElem.className = `wi ${iconClass}`;
        iconElem.classList.add("wi-3x");

        const localTime = new Date(element.startTime).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
        h3.textContent = localTime;

        // Format temperature with Fahrenheit and Celsius if needed.
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

// --- Google Maps Integration ---
let map;
let marker;

function initMap() {
    // Center map on the US by default
    const initialLocation = { lat: 39.8283, lng: -98.5795 };
    map = new google.maps.Map(document.getElementById("map"), {
        center: initialLocation,
        zoom: 4
    });

    // When the map is clicked, place (or move) a marker and fetch forecast data.
    map.addListener("click", (event) => {
        const clickedLocation = event.latLng;
        if (marker) {
            // Update the position of the existing marker using AdvancedMarkerElement
            marker.setOptions({ position: clickedLocation });
        } else {
            // Create a new marker using AdvancedMarkerElement
            marker = new google.maps.marker.AdvancedMarkerElement({
                position: clickedLocation,
                map: map,
                title: "Selected Location"
            });
        }
        const lat = clickedLocation.lat();
        const lng = clickedLocation.lng();
        getEndpoints(lat, lng);
    });
}
