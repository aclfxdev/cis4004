// ================= Authentication =================

// Function to check authentication status
function checkAuthStatus() {
    fetch('/.auth/me')
        .then(response => response.json())
        .then(data => {
            let loginBtn = document.getElementById("login-btn");
            let logoutBtn = document.getElementById("logout-btn");
            let accountStatus = document.getElementById("account-status");

            if (data.length > 0) {
                // User is logged in
                const user = data[0];
                if (accountStatus) accountStatus.innerText = "Signed in as " + (user.user_id || "User");
                if (loginBtn) loginBtn.style.display = "none";
                if (logoutBtn) logoutBtn.style.display = "inline-block";
            } else {
                // User is not logged in
                if (accountStatus) accountStatus.innerText = "Not signed in";
                if (loginBtn) loginBtn.style.display = "inline-block";
                if (logoutBtn) logoutBtn.style.display = "none";
            }
        })
        .catch(error => {
            console.error("Error checking login status:", error);
        });
}

// Run authentication check on page load
document.addEventListener("DOMContentLoaded", checkAuthStatus);


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
    let theme = themeCookie || (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
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

// ================= Cookie Helpers =================
function setCookie(cname, cvalue, exdays) {
    const d = new Date();
    d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
    document.cookie = cname + "=" + cvalue + ";expires=" + d.toUTCString() + ";path=/";
}

function getCookie(cname) {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(";");
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i].trim();
        if (c.indexOf(name) === 0) return c.substring(name.length, c.length);
    }
    return "";
}

// ================= Google Maps Integration =================
let map;
let marker;

function initMap() {
    const initialLocation = { lat: 39.8283, lng: -98.5795 };
    map = new google.maps.Map(document.getElementById("map"), { center: initialLocation, zoom: 4 });

    map.addListener("click", (event) => {
        const clickedLocation = event.latLng;
        marker = new google.maps.Marker({ position: clickedLocation, map: map });
        getEndpoints(clickedLocation.lat(), clickedLocation.lng());
    });
}

// Function to get weather data for selected map location
async function getEndpoints(latitude, longitude) {
    try {
        const url = `https://api.weather.gov/points/${latitude},${longitude}`;
        const data = await fetchWithUserAgent(url);
        getForecast(data.properties.forecastHourly);
    } catch (error) {
        console.error("Error fetching weather data:", error);
    }
}

// Fetch and display weather forecast
async function getForecast(hourlyForecastUrl) {
    try {
        const data = await fetchWithUserAgent(hourlyForecastUrl);
        const periods = data.properties.periods;
        displayWeather(periods);
    } catch (error) {
        console.error("Error fetching forecast:", error);
    }
}

// Display weather forecast
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
