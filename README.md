# Climate Intelligence Frontend

A beginner-friendly React + Vite dashboard for the **Climate Intelligence System for Heatwave Monitoring, Prediction & Early Warning**.

## Run locally

1. Open this folder in VS Code.
2. Make sure Node.js is installed.
3. Open Terminal in this folder.
4. Run:

```bash
npm install
npm run dev
```

5. Open the localhost URL shown by Vite, usually:
`http://localhost:5173`

## Current version

This version is a polished frontend prototype with local sample data matching the existing PostgreSQL project data. It includes:

- Dashboard
- Live Weather
- Regions & Stations
- Forecast
- Heatwave Prediction
- Alerts & Advisories
- Stakeholders
- Historical Analytics
- Search
- Region selection
- Charts
- Risk indicators
- Dark mode
- Responsive layout

## Connecting Flask

The current UI uses sample data so it works immediately. Next, replace the sample data/API layer with calls to the Flask backend, for example:

`http://127.0.0.1:5000/regions`

Do not connect React directly to PostgreSQL. The intended flow is:

PostgreSQL → Flask REST API → React frontend.
