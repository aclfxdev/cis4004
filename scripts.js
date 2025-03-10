// ================= Authentication Functions =================

function checkAuthStatus() {
    fetch('/.auth/me')
        .then(response => response.json())
        .then(data => {
            const loginBtn = document.getElementById("login-btn");
            const logoutBtn = document.getElementById("logout-btn");
            const accountStatus = document.getElementById("account-status");

            if (data.clientPrincipal) {
                accountStatus.innerText = "Signed in as " + data.clientPrincipal.userDetails;
                loginBtn.style.display = "none";
                logoutBtn.style.display = "inline-block";
                localStorage.setItem("isLoggedIn", "true");
            } else {
                accountStatus.innerText = "Not signed in";
                loginBtn.style.display = "inline-block";
                logoutBtn.style.display = "none";
                localStorage.removeItem("isLoggedIn");
            }
        })
        .catch(() => document.getElementById("account-status").innerText = "Error checking login status");
}

function getRedirectUrl() {
    return localStorage.getItem("lastPage") || window.location.href;
}

document.addEventListener("DOMContentLoaded", () => {
    const loginBtn = document.getElementById("login-btn");
    const logoutBtn = document.getElementById("logout-btn");

    loginBtn.href = "/.auth/login/google?post_login_redirect_uri=" + encodeURIComponent(getRedirectUrl());
    
    logoutBtn.addEventListener("click", () => {
        localStorage.clear();
        window.location.href = "/.auth/logout?post_logout_redirect_uri=/";
    });

    checkAuthStatus();
});

// ================= Google Maps Integration =================

let map, marker;

function initMap() {
    map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 39.8283, lng: -98.5795 },
        zoom: 4
    });

    map.addListener("click", (event) => {
        const clickedLocation = event.latLng;
        if (marker) {
            marker.setPosition(clickedLocation);
        } else {
            marker = new google.maps.Marker({
                position: clickedLocation,
                map: map
            });
        }
        getEndpoints(clickedLocation.lat(), clickedLocation.lng());
    });
}

// ================= Weather API Integration =================

async function fetchWithUserAgent(url) {
    const headers = {
        "User-Agent": "CIS-4004 Weather Forecasting",
        "Accept": "application/json"
    };
    const response = await fetch(url, { headers });
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
    return response.json();
}

async function getEndpoints(latitude, longitude) {
    try {
        const url = `https://api.weather.gov/points/${latitude},${longitude}`;
        const data = await fetchWithUserAgent(url);

        if (!data.properties || !data.properties.forecastHourly) {
            console.error("No forecast data available.");
            return;
        }

        document.getElementById("location-info").textContent = 
            `Location: ${data.properties.relativeLocation.properties.city}, ${data.properties.relativeLocation.properties.state}`;
        
        getForecast(data.properties.forecastHourly);
    } catch (error) {
        console.error("Error fetching weather data:", error);
    }
}

async function getForecast(hourlyForecastUrl) {
    try {
        const data = await fetchWithUserAgent(hourlyForecastUrl);
        const periods = data.properties.periods.slice(0, 24);
        displayWeather(periods);
    } catch (error) {
        console.error("Error fetching forecast:", error);
    }
}

function displayWeather(periods) {
    const row1Container = document.getElementById("row-1");
    const row2Container = document.getElementById("row-2");
    row1Container.innerHTML = "";
    row2Container.innerHTML = "";

    periods.slice(0, 12).forEach(period => row1Container.appendChild(createWeatherCard(period)));
    periods.slice(12, 24).forEach(period => row2Container.appendChild(createWeatherCard(period)));
}

function createWeatherCard(period) {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
        <h3>${new Date(period.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true })}</h3>
        <i class="wi ${getWeatherIconClass(period.shortForecast)} wi-3x"></i>
        <p>${period.shortForecast}<br>${period.temperature}°${period.temperatureUnit}</p>
    `;
    return card;
}

// ================= Weather Icons Mapping =================

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

// ================= Dark Mode Functions =================

function applyTheme(theme) {
    if (theme === "dark") {
        document.body.classList.add("dark-mode");
    } else {
        document.body.classList.remove("dark-mode");
    }
}

function initTheme() {
    const themeCookie = getCookie("theme");
    let theme = themeCookie || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    applyTheme(theme);

    const toggleSwitch = document.getElementById("theme-toggle");
    if (toggleSwitch) {
        toggleSwitch.checked = theme === "dark";
        toggleSwitch.addEventListener("change", function () {
            const newTheme = document.body.classList.contains("dark-mode") ? "light" : "dark";
            applyTheme(newTheme);
            setCookie("theme", newTheme, 30);
        });
    }
}

document.addEventListener("DOMContentLoaded", initTheme);

// ================= Cookie Helpers =================

function setCookie(cname, cvalue, exdays) {
    const d = new Date();
    d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
    document.cookie = `${cname}=${cvalue};expires=${d.toUTCString()};path=/`;
}

function getCookie(cname) {
    const name = cname + "=";
    const decodedCookie = decodeURIComponent(document.cookie);
    const ca = decodedCookie.split(";");
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i].trim();
        if (c.indexOf(name) === 0) return c.substring(name.length, c.length);
    }
    return "";
}
