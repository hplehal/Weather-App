// namespacing
const app = {};

app.openWeatherMapkey = `c964b55bb0fa43e474f8774f8c072922`;

app.init = function() {
  console.log("ready");
  app.geoFindMe();
  $("form").on("submit", function(e) {
    e.preventDefault();
    app.address = $("#searchTextField").val();
    console.log(app.address);
    $("searchTextField").val("");

    geoCode.geocode({ address: app.address }, (results, status) => {
      if (status === "OK") {
        let latitude = results[0].geometry.location.lat();
        let longitude = results[0].geometry.location.lng();
        console.log("lat", latitude);
        console.log("lng", longitude);

        app.getOpenWeatherMapApiWithLngLat(latitude, longitude).then(res => {
          console.log(res);
        });
      } else {
        alert("Geocode was not successful for the following reason: " + status);
      }
    });
  });
  let geoCode = new google.maps.Geocoder();

  let input = document.getElementById("searchTextField");
  let options = {
    types: ["(cities)"]
  };
  let autocomplete = new google.maps.places.Autocomplete(input, options);
  //   let placeResult = new google.maps.places.PlaceResult()
  let place = autocomplete.getPlace();
  console.log(place);
};

app.getOpenWeatherMapApiWithLngLat = (latitude, longitude) => {
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

    app.getOpenWeatherMapApiWithLngLat(latitude, longitude).then(res => {
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
