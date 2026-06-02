/**
 * Weather Dashboard — Vanilla JS (ES modules)
 * Architecture: CONFIG → STATE → API Service → DOM → Events
 */

// =============================================================================
// CONFIG — replace API_KEY with your OpenWeatherMap key
// https://home.openweathermap.org/api_keys
// =============================================================================

const CONFIG = {
  API_KEY: "YOUR_API_KEY_HERE",
  BASE_URL: "https://api.openweathermap.org/data/2.5/weather",
  UNITS: "metric", // metric = °C, imperial = °F
  ICON_BASE_URL: "https://openweathermap.org/img/wn",
  DEFAULT_CITY: "London",
};

// =============================================================================
// STATE — single source of truth for UI-related app state
// =============================================================================

const state = {
  isLoading: false,
  lastQuery: "",
  weather: null,
  error: null,
};

// =============================================================================
// DOM — element references and rendering (no fetch logic here)
// =============================================================================

const dom = {
  form: document.getElementById("search-form"),
  input: document.getElementById("city-input"),
  searchButton: document.getElementById("search-button"),
  statusMessage: document.getElementById("status-message"),
  weatherCard: document.getElementById("weather-card"),
  welcomePanel: document.getElementById("welcome-panel"),
  cityName: document.getElementById("city-name"),
  countryName: document.getElementById("country-name"),
  weatherIcon: document.getElementById("weather-icon"),
  temperature: document.querySelector("#temperature .temp-value"),
  tempUnit: document.querySelector("#temperature .temp-unit"),
  weatherDescription: document.getElementById("weather-description"),
  humidity: document.getElementById("humidity"),
  windSpeed: document.getElementById("wind-speed"),
  feelsLike: document.getElementById("feels-like"),
};

/**
 * Maps raw API JSON into a flat view model for the UI.
 * @param {object} data - OpenWeatherMap current weather response
 * @returns {object}
 */
function normalizeWeatherData(data) {
  const unitLabel = CONFIG.UNITS === "imperial" ? "°F" : "°C";
  const speedUnit = CONFIG.UNITS === "imperial" ? "mph" : "m/s";
  const iconCode = data.weather?.[0]?.icon ?? "01d";
  const description = data.weather?.[0]?.description ?? "Unknown";

  return {
    city: data.name ?? "Unknown",
    country: data.sys?.country ?? "—",
    temperature: Math.round(data.main?.temp ?? 0),
    feelsLike: Math.round(data.main?.feels_like ?? 0),
    humidity: data.main?.humidity ?? 0,
    windSpeed: data.wind?.speed ?? 0,
    description,
    iconUrl: `${CONFIG.ICON_BASE_URL}/${iconCode}@2x.png`,
    unitLabel,
    speedUnit,
  };
}

function setLoading(isLoading) {
  state.isLoading = isLoading;
  dom.searchButton.disabled = isLoading;
  dom.input.disabled = isLoading;
  dom.searchButton.classList.toggle("is-loading", isLoading);
  dom.searchButton.querySelector(".search-button-spinner").hidden = !isLoading;
}

function showStatusMessage(message, type = "error") {
  dom.statusMessage.textContent = message;
  dom.statusMessage.hidden = false;
  dom.statusMessage.classList.toggle("is-info", type === "info");
}

function hideStatusMessage() {
  dom.statusMessage.hidden = true;
  dom.statusMessage.textContent = "";
  dom.statusMessage.classList.remove("is-info");
}

function showWelcome(show) {
  dom.welcomePanel.hidden = !show;
}

function showWeatherCard(show) {
  dom.weatherCard.hidden = !show;
}

/**
 * Renders weather data into the DOM.
 * @param {ReturnType<typeof normalizeWeatherData>} weather
 */
function renderWeather(weather) {
  dom.cityName.textContent = weather.city;
  dom.countryName.textContent = weather.country;
  dom.temperature.textContent = String(weather.temperature);
  dom.tempUnit.textContent = weather.unitLabel;
  dom.weatherDescription.textContent = weather.description;
  dom.humidity.textContent = `${weather.humidity}%`;
  dom.windSpeed.textContent = `${weather.windSpeed} ${weather.speedUnit}`;
  dom.feelsLike.textContent = `${weather.feelsLike}${weather.unitLabel}`;

  dom.weatherIcon.src = weather.iconUrl;
  dom.weatherIcon.alt = weather.description;

  showWelcome(false);
  showWeatherCard(true);
  hideStatusMessage();
}

function renderError(message) {
  state.error = message;
  showStatusMessage(message, "error");
}

// =============================================================================
// API SERVICE — network layer only (no DOM updates)
// =============================================================================

/**
 * Builds the request URL for a city query.
 * @param {string} city
 * @returns {string}
 */
function buildWeatherUrl(city) {
  const params = new URLSearchParams({
    q: city.trim(),
    appid: CONFIG.API_KEY,
    units: CONFIG.UNITS,
  });
  return `${CONFIG.BASE_URL}?${params.toString()}`;
}

/**
 * Translates HTTP status codes into user-facing messages.
 * @param {number} status
 * @param {object|null} body
 * @returns {string}
 */
function getErrorMessageForStatus(status, body) {
  const apiMessage = body?.message;

  switch (status) {
    case 404:
      return "City not found. Check the spelling and try again.";
    case 401:
      return "Invalid API key. Update CONFIG.API_KEY in app.js.";
    case 429:
      return "Too many requests. Please wait a moment and try again.";
    case 500:
    case 502:
    case 503:
      return "Weather service is temporarily unavailable. Try again later.";
    default:
      return apiMessage
        ? `Unable to fetch weather: ${apiMessage}`
        : `Something went wrong (error ${status}). Please try again.`;
  }
}

/**
 * Fetches current weather for a city.
 * @param {string} city
 * @returns {Promise<object>} Normalized weather view model
 */
async function fetchWeatherByCity(city) {
  if (!city?.trim()) {
    throw new Error("Please enter a city name.");
  }

  if (CONFIG.API_KEY === "YOUR_API_KEY_HERE" || !CONFIG.API_KEY.trim()) {
    throw new Error(
      "Add your OpenWeatherMap API key to CONFIG.API_KEY in app.js."
    );
  }

  const url = buildWeatherUrl(city);
  let response;

  try {
    response = await fetch(url);
  } catch {
    throw new Error(
      "Network error. Check your internet connection and try again."
    );
  }

  let data = null;

  try {
    data = await response.json();
  } catch {
    if (!response.ok) {
      throw new Error(getErrorMessageForStatus(response.status, null));
    }
    throw new Error("Received an invalid response from the weather service.");
  }

  if (!response.ok) {
    throw new Error(getErrorMessageForStatus(response.status, data));
  }

  if (!data?.main || !data?.weather?.length) {
    throw new Error("Unexpected data format from the weather service.");
  }

  return normalizeWeatherData(data);
}

// =============================================================================
// CONTROLLER — orchestrates state, API, and DOM
// =============================================================================

/**
 * Main flow: validate → loading → fetch → render or show error.
 * @param {string} city
 */
async function handleSearch(city) {
  const query = city.trim();
  if (!query) {
    renderError("Please enter a city name.");
    dom.input.focus();
    return;
  }

  state.lastQuery = query;
  state.error = null;
  setLoading(true);
  hideStatusMessage();

  try {
    const weather = await fetchWeatherByCity(query);
    state.weather = weather;
    renderWeather(weather);
  } catch (err) {
    state.weather = null;
    const message =
      err instanceof Error ? err.message : "An unexpected error occurred.";
    renderError(message);
  } finally {
    setLoading(false);
    dom.input.focus();
  }
}

// =============================================================================
// EVENTS — wire user interactions
// =============================================================================

function initEventListeners() {
  dom.form.addEventListener("submit", (event) => {
    event.preventDefault();
    handleSearch(dom.input.value);
  });

  dom.input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      dom.form.requestSubmit();
    }
  });
}

function initApp() {
  if (!dom.form || !dom.input) {
    console.error("Required DOM elements are missing.");
    return;
  }

  initEventListeners();

  // Optional: load a default city on first visit
  handleSearch(CONFIG.DEFAULT_CITY);
}

initApp();
