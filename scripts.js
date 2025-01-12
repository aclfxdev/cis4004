// MAIN SCRIPTS FILE.

// Get visitor's Geolocation data function //

if (navigator.geolocation)
{
  navigator.geolocation.getCurrentPosition
  (
    (position) => // Geolocation was a success.
    { 
      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;
      console.log
      (
        `%cLatitude: ${latitude}\nLongitude: ${longitude}`,
        "color: green"
      )
    },
    (error) => // Geolocation was a failure.
    {
      console.error
      (
        `%cError getting location: ${error.message}`,
        "color:red"
      )
    }
  )
}

else
{
  console.error("%cGeolocation is not supported by this browser!", "color: red")
}

// Weather.gov endpoint API function //

async function getEndpoints(latitude, longitude)
{
  try
  {
    // Utilize lat. & long. to retrieve gridpoints.
    const response = await fetch(`https://api.weather.gov/points/${latitude},${longitude}`)

    // If fetch fails:
    if (!response.ok)
    {
      throw new Error(`Fetching endpoints failed.\nNetwork response: ${response.status}`)
    }

    // Await response, parse JSON, store data.
    const data = await response.json();
    
    // Store office and points from data.
    const office = data.properties.gridId;
    const gridX = data.properties.gridX;
    const gridY = data.properties.gridY;

    // Call weather API to receive forecast according to data.
    getForecast(office, gridX, gridY);
  }

  catch(error)
  {
    console.error(`%c${error.message}`, "color: red")
  }
}

// Weather.gov forecast API function //

async function getForecast(office, gridX, gridY)
{
  try
  {
    // Utilize office, gridX, & gridY as gridpoints.
    const response = await fetch(`https://api.weather.gov/gridpoints/${office}/${gridX},${gridY}/forecast`)

    // If fetch fails:
    if (!response.ok)
    {
      throw new Error(`Fetching forecast failed.\nNetwork response: ${response.status}`)
    }

    // Await response, parse JSON, store data.
    const data = await response.json();
  }

  catch(error)
  {
    console.error(`%c${error.message}`, "color: red")
  }
  
  // Store periods from data.
  const periods = data.properties.periods

  // Create weather cards on page
  createWeatherCards(periods)
}

// Creating the weather cards function //
function createWeatherCards(periods)
{
  // Store the card container div from index.html
    const cardContainer = document.getElementById("card-container")
    // Create a card for each element in the periods array
    periods.forEach((element) => {
        // Create the html elements
        const div = document.createElement("div")
        const h2  = document.createElement("h2")
        const img = document.createElement("img")
        const p   = document.createElement("p")
        // Set the icon to be used as the large version
        const icon = element.icon.replace("medium", "large")
        // Set the new div class to "card"
        div.setAttribute("class", "card")
        // Set the new img attributes
        img.setAttribute("src", icon)
        img.setAttribute("alt", element.shortForecast)
        // Set the text content for the card title and forecast
        h2.textContent = element.name
        p.textContent  = element.shortForecast
        // Append the title, image, and forecast to the card div
        div.appendChild(h2)
        div.appendChild(img)
        div.appendChild(p)
        // Append the card to the card container div
        cardContainer.appendChild(div)
    })
    // Set favicon to the first weather icon
    const head = document.getElementsByTagName("head")[0]
    const link = document.createElement("link")
    link.rel   = "icon"
    link.href  = periods[0].icon.replace("medium", "small")
    head.appendChild(link)
}
