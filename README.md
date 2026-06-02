# Weather Dashboard

A real-time weather dashboard built with **HTML5**, **CSS3**, and **vanilla JavaScript (ES6+)**. Search any city to view current temperature, humidity, wind speed, and conditions powered by the [OpenWeatherMap Current Weather API](https://openweathermap.org/current).

![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?logo=javascript&logoColor=black)

## Features

- **Async API integration** — `fetch` with `async/await`, modular API and DOM layers
- **Error handling** — network failures, invalid cities (404), rate limits (429), and invalid API keys surfaced in the UI
- **Dynamic rendering** — city, country, temperature (°C), humidity, wind, description, and weather icons
- **Interactive search** — submit button or **Enter** key, with loading spinner during requests
- **Responsive design** — optimized for desktop, tablet, and mobile

## Project structure

```
weatherdash/
├── index.html   # Semantic markup & accessibility
├── styles.css   # Custom responsive UI (no CSS framework)
├── app.js       # Config, state, API service, DOM, events
└── server.js    # Optional local dev server
```

## Quick start

### 1. Get an API key

1. Create a free account at [OpenWeatherMap](https://home.openweathermap.org/users/sign_up).
2. Generate a key at [API keys](https://home.openweathermap.org/api_keys).
3. Open `app.js` and set your key:

```javascript
const CONFIG = {
  API_KEY: "your_openweathermap_api_key_here",
  // ...
};
```

> **Never commit your real API key.** Keep the placeholder in the repo and add your key locally only.

### 2. Run locally

**Option A — Open in browser**

Double-click `index.html` or open it in Chrome via **File → Open**.

**Option B — Localhost (recommended)**

ES modules and API calls work more reliably over HTTP:

```bash
node server.js
```

Then open [http://localhost:3000](http://localhost:3000).

## Architecture

| Layer | Responsibility |
| ----- | -------------- |
| **CONFIG** | API key, base URL, units (`metric` / `imperial`) |
| **STATE** | Loading flag, last query, weather data, errors |
| **API service** | `fetch`, JSON parsing, HTTP error mapping |
| **DOM** | Render weather card, status messages, loading UI |
| **Controller** | `handleSearch()` orchestrates the async flow |

### Async flow

1. User submits a city → `handleSearch()` sets loading state.
2. `fetchWeatherByCity()` calls OpenWeatherMap and normalizes the JSON.
3. On success, `renderWeather()` updates the DOM; on failure, `renderError()` shows a user-friendly message.
4. `finally` clears loading state regardless of outcome.

## Configuration

| Setting | Default | Description |
| ------- | ------- | ----------- |
| `API_KEY` | `YOUR_API_KEY_HERE` | OpenWeatherMap API key |
| `UNITS` | `metric` | `metric` = °C, `imperial` = °F |
| `DEFAULT_CITY` | `London` | City loaded on first visit |

## Tech stack

- HTML5, CSS3, Vanilla JavaScript (ES modules)
- [OpenWeatherMap API](https://openweathermap.org/api)
- [DM Sans](https://fonts.google.com/specimen/DM+Sans) via Google Fonts

## License

MIT — use freely for learning and personal projects.
