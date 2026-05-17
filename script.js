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

form.addEventListener("submit", async function (event) {
  event.preventDefault();

  const city = cityInput.value.trim();

  if (city === "") {
    errorMessage.textContent = "Please enter a city name.";
    return;
  }

  weatherCard.classList.add("hidden");
  errorMessage.textContent = "";
  loading.classList.remove("hidden");

  try {
    const location = await getCoordinates(city);
    const weather = await getWeather(location.latitude, location.longitude);

    displayWeather(location, weather);
  } catch (error) {
    errorMessage.textContent = error.message;
  } finally {
    loading.classList.add("hidden");
  }
});

async function getCoordinates(city) {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Could not connect to location service.");
  }

  const data = await response.json();

  if (!data.results || data.results.length === 0) {
    throw new Error("City not found. Please try another city.");
  }

  return data.results[0];
}

async function getWeather(latitude, longitude) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code,wind_speed_10m`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Could not load weather data.");
  }

  const data = await response.json();

  if (!data.current) {
    throw new Error("Weather data not available.");
  }

  return data.current;
}

function displayWeather(location, weather) {
  const weatherData = getWeatherInfo(weather.weather_code);

  cityName.textContent = `${location.name}, ${location.country}`;
  condition.textContent = weatherData.text;
  temperature.textContent = `${Math.round(weather.temperature_2m)}°C`;
  wind.textContent = `${weather.wind_speed_10m} km/h`;
  weatherIcon.textContent = weatherData.icon;

  time.textContent = new Date(weather.time).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit"
  });

  weatherCard.classList.remove("hidden");
}

function getWeatherInfo(code) {
  const weatherCodes = {
    0: { text: "Clear Sky", icon: "☀️" },
    1: { text: "Mainly Clear", icon: "🌤️" },
    2: { text: "Partly Cloudy", icon: "⛅" },
    3: { text: "Overcast", icon: "☁️" },
    45: { text: "Fog", icon: "🌫️" },
    48: { text: "Rime Fog", icon: "🌫️" },
    51: { text: "Light Drizzle", icon: "🌦️" },
    53: { text: "Drizzle", icon: "🌦️" },
    55: { text: "Dense Drizzle", icon: "🌧️" },
    61: { text: "Light Rain", icon: "🌧️" },
    63: { text: "Rain", icon: "🌧️" },
    65: { text: "Heavy Rain", icon: "⛈️" },
    71: { text: "Light Snow", icon: "🌨️" },
    73: { text: "Snow", icon: "🌨️" },
    75: { text: "Heavy Snow", icon: "❄️" },
    80: { text: "Rain Showers", icon: "🌦️" },
    81: { text: "Rain Showers", icon: "🌧️" },
    82: { text: "Heavy Showers", icon: "⛈️" },
    95: { text: "Thunderstorm", icon: "⛈️" }
  };

  return weatherCodes[code] || {
    text: "Unknown Weather",
    icon: "🌍"
  };
}


