# Snow Day Calculator Free (`snowdaycalculatorfree.com`)

> Fast, SEO-optimized, weather-based Snow Day Calculator & Predictor platform powered by an intelligent multi-provider routing and winter weather forecasting engine.

Snow Day Calculator Free is a commercial-ready winter weather application engineered to run efficiently on a modest VPS (e.g. Hostinger KVM VPS) via Coolify and Docker with zero external database dependencies.

---

## 🌟 Key Upgrades & Architecture

- **Multi-Provider Regional Routing**: Automatically routes weather queries to the optimal regional meteorological agency based on the **target weather location** (e.g. NOAA in the US, MSC GeoMet in Canada, FMI in Finland, Met Office in the UK, and MET Norway globally).
- **$0 API Subscription Baseline**: Works out-of-the-box with 100% free, authorized meteorological APIs (MET Norway, NOAA/NWS, FMI, MSC GeoMet) without requiring any paid subscriptions.
- **Strict Commercial Mode (`SITE_COMMERCIAL=true`)**: Overrides priority to ensure no provider with non-commercial free licensing restrictions (such as Open-Meteo's public free tier) is ever accidentally selected for commercial or ad-supported traffic.
- **3-State Circuit Breakers (`CLOSED`, `OPEN`, `HALF_OPEN`)**: Automatically isolates failing or unresponsive providers and probes for recovery without degrading visitor response times.
- **Local Rate-Limit & Quota Protection**: Sliding-window tracking for requests-per-minute, hour, and day with internal 80% warning, 95% critical, and 100% cooldown triggers.
- **Stale-While-Revalidate & Emergency Fallback**: Dual in-memory caching serving fresh data (15 mins) and 24-hour stale cache fallback if all live external providers experience simultaneous upstream outages.
- **Centralized Attribution & Telemetry**: Built-in `/internal/provider-status` dashboard and `<DataSourceAttribution />` displaying transparent provider credits and fallback notices.

---

## 🧭 Regional Priority Routing Matrix

The router selects candidate providers based on the **requested weather location**:

| Region | Priority 1 | Priority 2 | Priority 3 | Priority 4 | Priority 5 |
|---|---|---|---|---|---|
| **United States (`US`)** | **NOAA / NWS** | MET Norway | WeatherAPI | WeatherMetro | Visual Crossing |
| **Canada (`CA`)** | **MSC GeoMet** | MET Norway | WeatherAPI | WeatherMetro | Visual Crossing |
| **Norway (`NO`)** | **MET Norway** | WeatherAPI | WeatherMetro | — | — |
| **Finland (`FI`)** | **FMI** | MET Norway | WeatherAPI | WeatherMetro | — |
| **United Kingdom (`GB`)** | **Met Office** | MET Norway | WeatherAPI | WeatherMetro | — |
| **India (`IN`)** | **MET Norway** | WeatherAPI | WeatherMetro | Visual Crossing | — |
| **Rest of World (`GLOBAL`)** | **MET Norway** | WeatherAPI | WeatherMetro | Visual Crossing | Met Office |

*Note: Open-Meteo is only eligible if explicitly enabled (`OPENMETEO_ENABLED=true`) and configured in self-hosted or commercial mode when `SITE_COMMERCIAL=true`.*

---

## 📊 Weather Provider Directory & Licensing Terms

| Provider | Region | Commercial Free Use | API Key | Role | Known Free Quota | Attribution Requirement |
|---|---|---|---|---|---|---|
| **MET Norway** | Global / NO | ✅ Yes (Fair Use) | None | Primary Global | Fair-use policy (~20 req/sec) | "Weather forecast from MET Norway (api.met.no)" |
| **NOAA / NWS** | USA | ✅ Yes (Public Domain) | None | Primary USA | Fair-use policy (~30 req/min) | "NOAA / National Weather Service (weather.gov)" |
| **MSC GeoMet** | Canada | ✅ Yes (OGL-Canada) | None | Primary Canada | Fair-use policy | "Contains information licensed under Open Government Licence – Canada" |
| **FMI** | Finland | ✅ Yes (CC-BY 4.0) | None | Primary Finland | Fair-use policy | "Meteorological data from Finnish Meteorological Institute" |
| **UK Met Office** | UK | ✅ Yes (OGL) | Optional | Primary UK | Fair-use tier with key | "Contains public sector information licensed under Open Government Licence" |
| **WeatherAPI** | Global | ✅ Yes (with Free Key) | Optional | Fallback | 1,000,000 req/mo (Free tier) | "Powered by WeatherAPI.com" |
| **Visual Crossing** | Global | ✅ Yes (with Free Key) | Optional | Fallback | 1,000 records/day (Free tier) | "Weather data by Visual Crossing" |
| **Open-Meteo** | Global | ❌ No (Free is Non-Commercial) | None | Adapter | Non-commercial only | "Weather data by Open-Meteo.com (CC-BY 4.0)" |

---

## ⚙️ Environment Configuration

```bash
# Public Site Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SITE_NAME="Weather Hub"

# Commercial Policy Mode (true / false)
SITE_COMMERCIAL=true

# Provider Enable Flags (Default: true for no-key providers)
METNO_ENABLED=true
METNO_USER_AGENT=WeatherHub/1.0 (https://yourdomain.com contact@yourdomain.com)

NOAA_ENABLED=true
NOAA_USER_AGENT=WeatherHub/1.0 (https://yourdomain.com contact@yourdomain.com)

FMI_ENABLED=true
MSC_GEOMET_ENABLED=true

# Optional API Keys (Leave blank to use zero-cost default providers)
WEATHERAPI_ENABLED=true
WEATHERAPI_API_KEY=

VISUALCROSSING_ENABLED=true
VISUALCROSSING_API_KEY=

METOFFICE_ENABLED=true
METOFFICE_API_KEY=

OPENMETEO_ENABLED=false
OPENMETEO_MODE=public # 'public', 'self-hosted', or 'commercial'
```

---

## 🛠️ Internal Telemetry & Monitoring

- **Status Dashboard**: Visit `/internal/provider-status` to inspect live circuit breaker states, request rate limits, and health scores.
- **Debug Parameter**: Append `?debugWeather=true` to any `/api/weather` or city page URL during development to view response latency, cache hits, and selected provider ID.

---

## 🚀 Running Tests & Build

```bash
# Run unit test suite (28 test cases across all modules)
npm test

# Build production standalone bundle
npm run build

# Run locally
npm run dev
```

---

## 🐳 Docker & Coolify Deployment

Deploy directly to your VPS using Coolify:
1. Connect your GitHub repository.
2. Select **Dockerfile** build pack.
3. Paste environment variables from `.env.example`.
4. Deploy! The container runs on Node.js 20 Alpine as non-root user `nextjs` with automatic health checks on `/api/health`.
