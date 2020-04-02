// namespacing
const app = {};

app.openWeatherMapkey = `c964b55bb0fa43e474f8774f8c072922`;
app.googleApiKey = `AIzaSyAotphSu71XilyWpuIqlELH9bqar7oi49Y`;

app.init = function() {
  console.log("ready");
  app.geoFindMe();
  let input = document.getElementById("searchTextField");
  let options = {
    types: ["(cities)"]
  };
  let autocomplete = new google.maps.places.Autocomplete(input, options);
  let place = autocomplete.getPlace();
};
// app.getGoogleApi = () => {
//   let googleApi = $.ajax({
//     url: `https://maps.googleapis.com/maps/api/place/autocomplete/js`,
//     method: "GET",
//     dataType: "json",
//     data: {
//       key: app.googleApiKey,
//       input: "Toronto"
//     }
//   });
//   return googleApi;
// };
app.getOpenWeatherMapApi = (latitude, longitude) => {
  let api = $.ajax({
    url: `http://api.openweathermap.org/data/2.5/forecast`,
    method: "GET",
    dataType: "json",
    data: {
      lat: latitude,
      lon: longitude,
      appid: app.openWeatherMapkey
    }
  });
  return api;
};
// geolocation
app.geoFindMe = function() {
  const $status = $("#status");
  const $mapLink = $("#map-link");

  const success = function(position) {
    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;

    app.getOpenWeatherMapApi(latitude, longitude).then(res => {
      console.log(res);
    });

    $status.text("");
    $mapLink.attr(
      "href",
      `https://www.openstreetmap.org/#map=18/${latitude}/${longitude}`
    );
    $mapLink.text(`Latitude: ${latitude} °, Longitude: ${longitude} °`);
  };
  const error = function(err) {
    $status.text("Unable to retrieve your Location!");
  };

  if (!navigator.geolocation) {
    $status.text("Geolocation is not supported by your browser!");
  } else {
    $status.text("Locating");
    navigator.geolocation.getCurrentPosition(success, error);
  }
};

$(document).ready(app.init());
