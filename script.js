// namespacing
const app = {};
// Store the Key inside a variable
app.openWeatherMapkey = `c964b55bb0fa43e474f8774f8c072922`;
app.timeZoneDbKey = ``;
// Create an Init Function
app.init = function() {
  console.log("ready");
  //   Add the autocomplete functionality
  app.searchAutoComplete();
  // activate geolocation when event is initiated
  $("#findMe").on("click", () => app.geoFindMe());

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

app.getTimezoneApi = (latitude, longitude) => {
  let timeZoneApi = $.ajax({
    url: `http://api.timezonedb.com/v2.1/get-time-zone`,
    method: "GET",
    dataType: "json",
    data: {
      key: "XIG2FLO77EH1",
      format: "json",
      by: "position",
      lat: latitude,
      lng: longitude
    }
  });
  return timeZoneApi;
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

      app.getTimezoneApi(latitude, longitude).then(res => {
        console.log(res);
      });

      app.getOpenWeatherMapApiWithLngLat(latitude, longitude).then(res => {
        let getCurrentWeatherObj = res.list[0];
        console.log(res);
        $(".cityName").text(app.city);
        app.displayCurrWeather(getCurrentWeatherObj);
        app.displayNextFour(res);
      });
      $("#forecast").css("display", "flex");
      app.smoothScroll();
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
    let dateArr = currListObj.dt_txt.split(" ");
    let weatherHtml = `
    <div class="weatherCard">
        <h3 class="timeHeader">${app.checkTime(dateArr[1])}</h3>
        <i class="wi wi-owm-${app.dayOrNight}-${currListObj.weather[0].id}"></i>
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

app.checkTime = time => {
  if (time.includes("3:")) {
    app.dayOrNight = "night";
    return "3 AM";
  } else if (time.includes("6:")) {
    app.dayOrNight = "day";
    return "6 AM";
  } else if (time.includes("9:")) {
    app.dayOrNight = "day";
    return "9 AM";
  } else if (time.includes("12:")) {
    app.dayOrNight = "day";
    return "12 NOON";
  } else if (time.includes("15:")) {
    app.dayOrNight = "day";
    return "3 PM";
  } else if (time.includes("18:")) {
    app.dayOrNight = "day";
    return "6 PM";
  } else if (time.includes("21:")) {
    app.dayOrNight = "night";
    return "9 PM";
  } else if (time.includes("00:")) {
    app.dayOrNight = "night";
    return "MIDNIGHT";
  }
};

app.displayCurrWeather = list => {
  let iconNum = list.weather[0].id;
  let dateArr = list.dt_txt.split(" ");
  app.checkTime(dateArr[1]);
  $(".weather-icon").empty();
  $(".temp").empty();
  $(".weather-icon").append(
    `<i class="wi wi-owm-${app.dayOrNight}-${iconNum}"></i>`
  );
  console.log(list.weather[0].description);
  $(".weatherDescription").text(list.weather[0].description);
  const weatherTempHtml = `<span class="temp-details">${Math.round(
    list.main.temp
  )}&deg C</span>`;
  $(".temp").append(weatherTempHtml);
};
app.smoothScroll = () => {
  $("html").animate(
    {
      scrollTop: $("#forecast").offset().top
    },
    1500
  );
};
// Made a method that take the geolocation of the user
app.geoFindMe = () => {
  const $status = $("#status");
  const $mapLink = $("#map-link");

  const success = function(position) {
    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;

    app.getTimezoneApi(latitude, longitude).then(res => {
      console.log(res);
    });

    app.getOpenWeatherMapApiWithLngLat(latitude, longitude).then(res => {
      let getCurrentLocationName = res.city.name;
      let getCurrentWeatherObj = res.list[0];
      $(".cityName").text(getCurrentLocationName);
      app.displayCurrWeather(getCurrentWeatherObj);
      app.displayNextFour(res);
      //   console.log(app.getCurrentWeatherObj);
    });
    $("#forecast").css("display", "flex");
    app.smoothScroll();
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
