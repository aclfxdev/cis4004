// ================= Authentication Functions =================

// Checks the user's authentication status using Azure Easy Auth.
function checkAuthStatus() {
    fetch('/.auth/me')
        .then(response => {
            if (!response.ok) throw new Error("Login check failed.");
            return response.json();
        })
        .then(data => {
            const loginBtn = document.getElementById("login-btn");
            const logoutBtn = document.getElementById("logout-btn");
            const accountStatus = document.getElementById("account-status");

            if (!loginBtn || !logoutBtn || !accountStatus) {
                console.error("Auth elements not found.");
                return;
            }

            // Azure Easy Auth returns an object with clientPrincipal when authenticated.
            if (data && data.clientPrincipal) {
                const user = data.clientPrincipal;
                accountStatus.innerText = "Signed in as " + (user.userDetails || "User");
                loginBtn.style.display = "none";
                logoutBtn.style.display = "inline-block";
                // Store state for cross-page sync.
                localStorage.setItem("isLoggedIn", "true");
                localStorage.setItem("userID", user.userDetails || "User");
            } else {
                accountStatus.innerText = "Not signed in";
                loginBtn.style.display = "inline-block";
                logoutBtn.style.display = "none";
                localStorage.removeItem("isLoggedIn");
                localStorage.removeItem("userID");
            }
        })
        .catch(error => {
            console.error("Error checking login status:", error);
            const accountStatus = document.getElementById("account-status");
            if (accountStatus) accountStatus.innerText = "Error checking login status";
        });
}

// Sync login status across pages using localStorage.
function syncLoginStatus() {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    const userID = localStorage.getItem("userID");
    const loginBtn = document.getElementById("login-btn");
    const logoutBtn = document.getElementById("logout-btn");
    const accountStatus = document.getElementById("account-status");

    if (!loginBtn || !logoutBtn || !accountStatus) return;

    if (isLoggedIn === "true" && userID) {
        accountStatus.innerText = "Signed in as " + userID;
        loginBtn.style.display = "none";
        logoutBtn.style.display = "inline-block";
    } else {
        accountStatus.innerText = "Not signed in";
        loginBtn.style.display = "inline-block";
        logoutBtn.style.display = "none";
    }
}

// Store the last visited page in localStorage.
function storeLastPage() {
    localStorage.setItem("lastPage", window.location.href);
}

// Retrieve the stored URL; if none, default to the root.
function getRedirectUrl() {
    return localStorage.getItem("lastPage") || "/";
}

// Setup the login and logout button behavior.
document.addEventListener("DOMContentLoaded", () => {
    const loginBtn = document.getElementById("login-btn");
    const logoutBtn = document.getElementById("logout-btn");

    if (loginBtn) {
        // When clicked, store the current URL.
        loginBtn.addEventListener("click", storeLastPage);
        // Set the redirect URL to the last visited page.
        loginBtn.href = "/.auth/login/google?post_login_redirect_uri=" + encodeURIComponent(getRedirectUrl());
    }

    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            // Clear login state and redirect to home.
            localStorage.removeItem("isLoggedIn");
            localStorage.removeItem("userID");
            window.location.href = "/.auth/logout?post_logout_redirect_uri=/";
        });
    }

    // Sync the authentication status from localStorage and then check the live status.
    syncLoginStatus();
    checkAuthStatus();
});

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
    const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    const theme = themeCookie || (prefersDark ? "dark" : "light");
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
    d.setTime(d.getTime() + exdays*24*60*60*1000);
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

// ================= Google Maps Integration =================

let map;
let marker;

function initMap() {
    const initialLocation = { lat: 39.8283, lng: -98.5795 }; // Center of the US
    map = new google.maps.Map(document.getElementById("map"), {
        center: initialLocation,
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

async function fetchWithUserAgent(url) {
    const headers = {
        "User-Agent": "CIS-4004 Weather Forecasting (ch797590@ucf.edu / ja939451@ucf.edu)",
        "Accept": "application/json"
    };
    const response = await fetch(url, { headers });
    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return response.json();
}

async function getEndpoints(latitude, longitude) {
    try {
        const url = `https://api.weather.gov/points/${latitude},${longitude}`;
        const data = await fetchWithUserAgent(url);
        getForecast(data.properties.forecastHourly);
    } catch (error) {
        console.error("Error fetching weather data:", error);
    }
}

async function getForecast(hourlyForecastUrl) {
    try {
        const data = await fetchWithUserAgent(hourlyForecastUrl);
        const periods = data.properties.periods;
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
