// Scripts for Web APIs below (later).

if (navigator.geolocation)
{
  navigator.geolocation.getCurrentPosition((position) => {console.log(position)}, (error) => console.error("%cError getting location: ${error.message}", "color:red"))
}

else
{
  console.error("%cGeolocation is not supported by this browser!", "color: red")
}
