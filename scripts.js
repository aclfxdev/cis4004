// MAIN SCRIPTS FILE.

// Define the function to fetch with User-Agent
function fetchWithUserAgent(url) {
    const headers = {
        'User-Agent': 'YourAppName (youremail@example.com)', // Replace with your app name and email
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
function createWeatherCards(periods) {
    // Store the card container div from index.html
    const cardContainer = document.getElementById("card-container");
    cardContainer.innerHTML = ""; // Clear existing cards if any

    // Create a card for each element in the periods array
    periods.forEach((element) => {
        // Create the html elements
        const div = document.createElement("div");
        const h2 = document.createElement("h2");
        const img = document.createElement("img");
        const p = document.createElement("p");

        // Set the icon to be used as the large version
        const icon = element.icon.replace("medium", "large");

        // Set the new div class to "card"
        div.setAttribute("class", "card");

        // Set the new img attributes
        img.setAttribute("src", icon);
        img.setAttribute("alt", element.shortForecast);

        // Set the text content for the card title and forecast
        h2.textContent = `${element.startTime.split("T")[1].slice(0, 5)}: ${element.name}`;
        p.textContent = `${element.shortForecast}, Temp: ${element.temperature}°${element.temperatureUnit}`;

        // Append the title, image, and forecast to the card div
        div.appendChild(h2);
        div.appendChild(img);
        div.appendChild(p);

        // Append the card to the card container div
        cardContainer.appendChild(div);
    });

    // Set favicon to the first weather icon
    const head = document.getElementsByTagName("head")[0];
    const link = document.createElement("link");
    link.rel = "icon";
    link.href = periods[0].icon.replace("medium", "small");
    head.appendChild(link);
}
