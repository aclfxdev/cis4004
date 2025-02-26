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

// Creating the weather cards function (horizontal layout)
function createWeatherCards(periods) {
    // Store the card container div from index.html
    const cardContainer = document.getElementById("card-container");
    cardContainer.innerHTML = ""; // Clear existing content

    // Iterate over each forecast period and create a card
    periods.forEach((element) => {
        const div = document.createElement("div");
        div.className = "card dark-mode";

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
        p.innerHTML = `${element.shortForecast}<br>${element.temperature}°${element.temperatureUnit}`;

        div.appendChild(h3);
        div.appendChild(iconElem);
        div.appendChild(p);

        // Append the card to the container
        cardContainer.appendChild(div);
    });
}
