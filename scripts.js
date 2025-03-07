// MAIN SCRIPTS FILE.

// --- Weather Icons Mapping ---
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

// ================= Authentication Functions =================
// ================= Authentication Functions =================
// Function to check authentication status and sync across pages
function checkAuthStatus() {
    fetch('/.auth/me')
        .then(response => response.json())
        .then(data => {
            let loginBtn = document.getElementById("login-btn");
            let logoutBtn = document.getElementById("logout-btn");
            let accountStatus = document.getElementById("account-status");

            if (!loginBtn || !logoutBtn || !accountStatus) {
                console.error("Auth elements not found, retrying...");
                setTimeout(checkAuthStatus, 500);
                return;
            }

            if (data.length > 0) {
                const user = data[0];
                accountStatus.innerText = "Signed in as " + (user.user_id || "User");
                loginBtn.style.display = "none";
                logoutBtn.style.display = "inline-block";

                // Store login status in localStorage for cross-page sync
                localStorage.setItem("isLoggedIn", "true");
                localStorage.setItem("userID", user.user_id || "User");
            } else {
                accountStatus.innerText = "Not signed in";
                loginBtn.style.display = "inline-block";
                logoutBtn.style.display = "none";

                // Remove login status from localStorage
                localStorage.removeItem("isLoggedIn");
                localStorage.removeItem("userID");
            }
        })
        .catch(error => {
            console.error("Error checking login status:", error);
            let accountStatus = document.getElementById("account-status");
            if (accountStatus) {
                accountStatus.innerText = "Error checking login status";
            }
        });
}

// Function to sync login status across all pages using localStorage
function syncLoginStatus() {
    let isLoggedIn = localStorage.getItem("isLoggedIn");
    let userID = localStorage.getItem("userID");

    let loginBtn = document.getElementById("login-btn");
    let logoutBtn = document.getElementById("logout-btn");
    let accountStatus = document.getElementById("account-status");

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

// Function to store the last visited page before login
function storeLastPage() {
    localStorage.setItem("lastPage", window.location.href);
}

// Function to get the last visited page for redirection
function getRedirectUrl() {
    return localStorage.getItem("lastPage") || "index.html";
}

// Ensure login button stores last page before signing in
document.addEventListener("DOMContentLoaded", () => {
    let loginBtn = document.getElementById("login-btn");
    if (loginBtn) {
        loginBtn.addEventListener("click", storeLastPage);
        loginBtn.href = "/.auth/login/google?post_login_redirect_uri=" + encodeURIComponent(getRedirectUrl());
    }

    // Run login sync and check authentication
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
