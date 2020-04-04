// namespacing
const app = {};
// Store the Key inside a variable
app.openWeatherMapkey = `c964b55bb0fa43e474f8774f8c072922`;
// Create an Init Function
app.init = function() {
  console.log("ready");
  //   Add the autocomplete functionality
  app.searchAutoComplete();
  // activate geolocation when event is initiated
  $("#find-me").on("click", () => app.geoFindMe());

  $("form").on("submit", function(e) {
    e.preventDefault();
    app.city = $("#searchTextField").val();
    $("searchTextField").val("");
    app.getGeoCode();
  });
};
//Creating an ajax call from the OpenWeatherMapAPI and taking in Latitude and Longitude parameters
app.getOpenWeatherMapApiWithLngLat = (latitude, longitude) => {
  let api = $.ajax({
    url: `https://api.openweathermap.org/data/2.5/forecast`,
    method: "GET",
    dataType: "json",
    data: {
      units: "metric",
      lat: latitude,
      lon: longitude,
      appid: app.openWeatherMapkey
    }
  });
  return api;
};

// Create a method that stores the autocomplete functionality
app.searchAutoComplete = () => {
  const input = document.getElementById("searchTextField");
  const options = {
    types: ["(cities)"]
  };
  new google.maps.places.Autocomplete(input, options);
};

// create a method that gets the long and lat of the searched city location
app.getGeoCode = () => {
  const geoCode = new google.maps.Geocoder();
  geoCode.geocode({ address: app.city }, (results, status) => {
    if (status === "OK") {
      const latitude = results[0].geometry.location.lat();
      const longitude = results[0].geometry.location.lng();

      app.getOpenWeatherMapApiWithLngLat(latitude, longitude).then(res => {
        let getCurrentWeatherObj = res.list[0];
        console.log(res);
        $(".cityName").text(app.city);
        app.displayCurrWeather(getCurrentWeatherObj);
        app.displayNextFour(res);
        console.log(app.getCurrentWeatherObj);
      });
    } else {
      alert("Geocode was not successful for the following reason: " + status);
    }
  });
};
app.dateToday = () => {
  let today = new Date();
  let date = `${today.getFullYear()}-${today.getMonth() +
    1}-${today.getDate()}`;
};

app.displayNextFour = res => {
  $(".displayFour").empty();
  for (let i = 1; i <= 4; i++) {
    let currListObj = res.list[i];
    console.log(currListObj);
    let dateArr = currListObj.dt_txt.split(" ");
    let weatherHtml = `
    <div class="weatherCard">
        <h3 class="timeHeader">${dateArr[1]}</h3>
        <i class="wi wi-owm-${currListObj.weather[0].id}"></i>
        <h4 class="weatherDescription">${
          currListObj.weather[0].description
        }</h4>
        <span class="temp-details">${Math.round(
          currListObj.main.temp
        )}&deg C</span>
    </div>
    `;
    $(".displayFour").append(weatherHtml);
  }
};

app.displayCurrWeather = list => {
  let iconNum = list.weather[0].id;
  $(".weather-icon").empty();
  $(".temp").empty();
  $(".weather-icon").append(`<i class="wi wi-owm-${iconNum}"></i>`);
  console.log(list.weather[0].description);
  $(".weatherDescription").text(list.weather[0].description);
  const weatherTempHtml = `<span class="temp-details">${Math.round(
    list.main.temp
  )}&deg C</span>`;
  $(".temp").append(weatherTempHtml);
};

// Made a method that take the geolocation of the user
app.geoFindMe = () => {
  const $status = $("#status");
  const $mapLink = $("#map-link");

  const success = function(position) {
    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;

    app.getOpenWeatherMapApiWithLngLat(latitude, longitude).then(res => {
      let getCurrentLocationName = res.city.name;
      let getCurrentWeatherObj = res.list[0];
      $(".cityName").text(getCurrentLocationName);
      app.displayCurrWeather(getCurrentWeatherObj);
      app.displayNextFour(res);
      //   console.log(app.getCurrentWeatherObj);
    });
  };
  const error = err => {
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
