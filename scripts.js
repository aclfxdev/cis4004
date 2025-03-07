// MAIN SCRIPTS FILE.

// --- Weather Icons Mapping ---
// Maps keywords from the forecast condition to weather-icons CSS classes.
// You can expand this mapping as needed.
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
    // Add additional mappings as needed.
};

// Returns a weather-icons CSS class based on the condition.
function getWeatherIconClass(condition) {
    // Loop through mapping keys and check if the condition includes the key.
    for (const key in weatherIconClassMap) {
        if (condition.indexOf(key) !== -1) {
            return weatherIconClassMap[key];
        }
    }
    // Default icon if no match is found.
    return "wi-na";
}

// Define the function to fetch with User-Agent
function fetchWithUserAgent(url) {
    const headers = {
        'User-Agent': 'CIS-4004 Weather Forecasting (ch797590@ucf.edu / ja939451@ucf.edu)', // Application name & email.
        'Accept': 'application/json',
    };

    return fetch(url, { headers })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .catch(error => {
            console.error('Error fetching data:', error);
            throw error;
        });
}

// Dark Mode Functions

// Applies the chosen theme by toggling a class on the document body
function applyTheme(theme) {
    if (theme === "dark") {
        document.body.classList.add("dark-mode");
    } else {
        document.body.classList.remove("dark-mode");
    }
}

// Initialize theme based on localStorage or system preferences,
// and set the toggle switch position accordingly.
function initTheme() {
    const storedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    const theme = storedTheme ? storedTheme : (prefersDark ? "dark" : "light");
    applyTheme(theme);
    
    // Set the toggle switch state (if it exists)
    const toggleSwitch = document.getElementById("theme-toggle");
    if (toggleSwitch) {
        toggleSwitch.checked = theme === "dark";
    }
}

// Toggle theme and store the user preference
function toggleTheme() {
    if (document.body.classList.contains("dark-mode")) {
        document.body.classList.remove("dark-mode");
        localStorage.setItem("theme", "light");
    } else {
        document.body.classList.add("dark-mode");
        localStorage.setItem("theme", "dark");
    }
}

// Wait for the DOM to load to initialize the theme and attach toggle events
document.addEventListener("DOMContentLoaded", function() {
    initTheme();

    // Attach event listener to the toggle switch (if it exists)
    const toggleSwitch = document.getElementById("theme-toggle");
    if (toggleSwitch) {
        toggleSwitch.addEventListener("change", toggleTheme);
    }
});

// Get visitor's Geolocation data function
if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
        (position) => {
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;
            console.log(
                `%cLatitude: ${latitude}\nLongitude: ${longitude}`,
                "color: green"
            );

            // Fetch endpoints using latitude and longitude
            getEndpoints(latitude, longitude);
        },
        (error) => {
            console.error(
                `%cError getting location: ${error.message}`,
                "color:red"
            );
        }
    );
} else {
    console.error("%cGeolocation is not supported by this browser!", "color: red");
}

// Weather.gov endpoint API function
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

// Weather.gov forecast API function
async function getForecast(hourlyForecastUrl) {
    try {
        const data = await fetchWithUserAgent(hourlyForecastUrl);

        // Store periods from data
        const periods = data.properties.periods;

        // Calculate current time and the cutoff time 24 hours later
        const now = new Date();
        const cutoff = new Date(now.getTime() + 24 * 60 * 60 * 1000);

        // Filter forecast periods to include only those starting between now and the next 24 hours
        const filteredPeriods = periods.filter(period => {
            const periodStart = new Date(period.startTime);
            return periodStart >= now && periodStart <= cutoff;
        });

        console.log("Filtered periods:", filteredPeriods);

        // Create weather cards on page using filtered data
        createWeatherCards(filteredPeriods);
    } catch (error) {
        console.error(`%c${error.message}`, "color: red");
    }
}

// Creating the weather cards function (two rows layout)
function createWeatherCards(periods) {
    // Get the two row containers
    const row1Container = document.getElementById("row-1");
    const row2Container = document.getElementById("row-2");

    // Clear any existing content
    row1Container.innerHTML = "";
    row2Container.innerHTML = "";

    // Split the periods into two groups (first 12 and last 12)
    const firstHalf = periods.slice(0, 12);
    const secondHalf = periods.slice(12, 24);

    // Function to create a card for a forecast period
    function createCard(element) {
        const div = document.createElement("div");
        div.className = "card";

        const h3 = document.createElement("h3");
        // Instead of an <img>, we'll create an <i> element for the icon.
        const iconElem = document.createElement("i");
        const p = document.createElement("p");

        // Determine the icon class based on the forecast condition.
        const iconClass = getWeatherIconClass(element.shortForecast);
        // Add the weather-icons base class and the mapped class.
        iconElem.className = `wi ${iconClass}`;
        // Optionally, adjust icon size via a CSS class (e.g., wi-3x)
        iconElem.classList.add("wi-3x");

        // Format the start time for display
        const localTime = new Date(element.startTime).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
        });
        h3.textContent = localTime;

        // Format the temperature to include Celsius if Fahrenheit.
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

    // Append first half to the first row
    firstHalf.forEach(element => {
        row1Container.appendChild(createCard(element));
    });

    // Append second half to the second row
    secondHalf.forEach(element => {
        row2Container.appendChild(createCard(element));
    });
}

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
    const ca = decodedCookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i].trim();
        if (c.indexOf(name) === 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

// Updated dark mode functions using cookies
function applyTheme(theme) {
    if (theme === "dark") {
        document.body.classList.add("dark-mode");
    } else {
        document.body.classList.remove("dark-mode");
    }
}

function initTheme() {
    // First, check cookie for dark mode preference
    const themeCookie = getCookie("theme");
    let theme;
    if (themeCookie) {
        theme = themeCookie;
    } else {
        // Fallback: use local preference
        const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
        theme = prefersDark ? "dark" : "light";
    }
    applyTheme(theme);

    // Set the state of the dark mode toggle if it exists
    const toggleSwitch = document.getElementById("theme-toggle");
    if (toggleSwitch) {
        toggleSwitch.checked = theme === "dark";
        toggleSwitch.addEventListener("change", function () {
            if (document.body.classList.contains("dark-mode")) {
                document.body.classList.remove("dark-mode");
                setCookie("theme", "light", 30); // store for 30 days
            } else {
                document.body.classList.add("dark-mode");
                setCookie("theme", "dark", 30);
            }
        });
    }
}

document.addEventListener("DOMContentLoaded", initTheme);

