const form = document.getElementById("weatherForm");
const cityInput = document.getElementById("cityInput");

const weatherCard = document.getElementById("weatherCard");
const cityName = document.getElementById("cityName");
const condition = document.getElementById("condition");
const temperature = document.getElementById("temperature");
const wind = document.getElementById("wind");
const time = document.getElementById("time");
const weatherIcon = document.getElementById("weatherIcon");

const loading = document.getElementById("loading");
const errorMessage = document.getElementById("errorMessage");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const city = cityInput.value.trim();

  if (!city) return;

  weatherCard.classList.add("hidden");
  errorMessage.textContent = "";
  loading.classList.remove("hidden");

  try {
    const location = await getCoordinates(city);
    const weather = await getWeather(
      location.latitude,
      location.longitude
    );

    displayWeather(location, weather);

  } catch (error) {
    errorMessage.textContent = error.message;
  }

  loading.classList.add("hidden");
});

async function getCoordinates(city) {
  const url =
    `https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1`;

  const response = await fetch(url);
  const data = await response.json();

  if (!data.results) {
    throw new Error("City not found");
  }

  return data.results[0];
}

async function getWeather(lat, lon) {
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code,wind_speed_10m`;

  const response = await fetch(url);
  const data = await response.json();

  return data.current;
}

function displayWeather(location, weather) {

  cityName.textContent =
    `${location.name}, ${location.country}`;

  temperature.textContent =
    `${Math.round(weather.temperature_2m)}°C`;

  wind.textContent =
    `${weather.wind_speed_10m} km/h`;

  time.textContent =
    new Date(weather.time).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit"
    });

  const weatherData =
    getWeatherInfo(weather.weather_code);

  condition.textContent =
    weatherData.text;

  weatherIcon.textContent =
    weatherData.icon;

  weatherCard.classList.remove("hidden");
}

function getWeatherInfo(code) {

  const weatherCodes = {

    0: {
      text: "Clear Sky",
      icon: "☀️"
    },

    1: {
      text: "Mostly Clear",
      icon: "🌤️"
    },

    2: {
      text: "Partly Cloudy",
      icon: "⛅"
    },

    3: {
      text: "Cloudy",
      icon: "☁️"
    },

    45: {
      text: "Fog",
      icon: "🌫️"
    },

    61: {
      text: "Rain",
      icon: "🌧️"
    },

    71: {
      text: "Snow",
      icon: "❄️"
    },

    95: {
      text: "Thunderstorm",
      icon: "⛈️"
    }
  };

  return weatherCodes[code] || {
    text: "Unknown",
    icon: "🌍"
  };
}