// Scripts for Web APIs below (later).

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
