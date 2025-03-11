// Cookie helper functions
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

// Dark mode functions using cookies
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

// Weather Icons Mapping
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

// Function to fetch with User-Agent for weather.gov API requests
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

// Retrieve endpoints from weather.gov
async function getEndpoints(latitude, longitude) {
    try {
        const url = `https://api.weather.gov/points/${latitude},${longitude}`;
        const data = await fetchWithUserAgent(url);
        
        // NEW: Extract nearest city and state from relativeLocation
        const { city, state } = data.properties.relativeLocation.properties;
        // Extract the radar station code
        const stationCode = data.properties.radarStation;
        
        // Update the location-info div with this information
        const locationInfoDiv = document.getElementById("location-info");
        if (locationInfoDiv) {
            locationInfoDiv.textContent = `Nearest City: ${city}, ${state} | Station: ${stationCode}`;
        }
        
        // Retrieve the hourly forecast URL
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
        console.log("Filtered periods:", filteredPeriods);
        createWeatherCards(filteredPeriods);
    } catch (error) {
        console.error(`%c${error.message}`, "color: red");
    }
}

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

// Helper function to create a simple pin element
function createPin(color = "#4285F4") {
    const pinDiv = document.createElement("div");
    pinDiv.style.width = "30px";
    pinDiv.style.height = "30px";
    pinDiv.style.backgroundColor = color;
    pinDiv.style.borderRadius = "50%";
    pinDiv.style.border = "2px solid white";
    pinDiv.style.boxShadow = "0 0 5px rgba(0,0,0,0.3)";
    return pinDiv;
}

// Google Maps Integration
let map;
let marker;

function initMap() {
    const initialLocation = { lat: 39.8283, lng: -98.5795 };
    map = new google.maps.Map(document.getElementById("map"), {
        center: initialLocation,
        zoom: 4,
        mapId: "4a26c61826571d78"
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