// MAIN SCRIPTS FILE.

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

        // Create weather cards on page
        createWeatherCards(periods);
    } catch (error) {
        console.error(`%c${error.message}`, "color: red");
    }
}

// Creating the weather cards function
function createWeatherCards(periods) 
{
    // Store the card container div from index.html
    const cardContainer = document.getElementById("card-container");
    cardContainer.innerHTML = ""; // Clear existing content

    // Group periods by day
    const days = {};
    periods.forEach((element) => 
    {
        const date = new Date(element.startTime).toLocaleDateString([], { 
            month: '2-digit', 
            day: '2-digit', 
            year: 'numeric' 
        });
        if (!days[date]) 
        {
            days[date] = [];
        }
        days[date].push(element);
    });

    // Create a column for each day
    for (const [date, dayPeriods] of Object.entries(days)) 
    {
        // Create a column container for the day
        const dayColumn = document.createElement("div");
        dayColumn.className = "day-column";

        // Add a header for the day
        const dayHeader = document.createElement("h2");
        dayHeader.className = "day-header";
        const formattedHeader = new Date(dayPeriods[0].startTime).toLocaleDateString([], {
            weekday: 'short',
            month: 'long',
            day: 'numeric',
        });
        dayHeader.textContent = formattedHeader;
        dayColumn.appendChild(dayHeader);

        // Add hourly cards for the day
        dayPeriods.forEach((element) => 
        {
            const div = document.createElement("div");
            div.className = "card";

            const h3 = document.createElement("h3");
            const img = document.createElement("img");
            const p = document.createElement("p");

            const icon = element.icon.replace("medium", "large");

            img.setAttribute("src", icon);
            img.setAttribute("alt", element.shortForecast);

            const localTime = new Date(element.startTime).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
            });

            h3.textContent = localTime;
            p.textContent = `${element.shortForecast}, Temp: ${element.temperature}°${element.temperatureUnit}`;

            div.appendChild(h3);
            div.appendChild(img);
            div.appendChild(p);

            dayColumn.appendChild(div);
        });

        // Append the day's column to the card container
        cardContainer.appendChild(dayColumn);
    }
}
