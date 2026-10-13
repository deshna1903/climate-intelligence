# Climate Intelligence Frontend

## DBMS Query Lab

The sidebar now includes a Query Lab with 11 SQL demonstrations and explanations
mapped to experiments 1–9. Read the [experiment walkthrough](docs/DBMS_EXPERIMENTS.md)
for repository comparison, local setup, optional view/index SQL and viva guidance.

Set `VITE_API_BASE_URL` using `.env.example` and restart Vite to select your Flask
backend. Run or deploy the updated backend to execute demonstrations. The query
library remains readable while the backend is offline; result rows come only from
PostgreSQL. The temporary DML demonstration rolls back all changes.

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

This version combines Flask/PostgreSQL data with sample data in some frontend charts. DBMS Query Lab executes its demonstrations against PostgreSQL. It includes:

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

Existing dashboard, station, stakeholder and reading requests use the configured Flask API. Some charts still use sample arrays. For local development, set `VITE_API_BASE_URL=http://127.0.0.1:5000` and restart Vite. An existing endpoint is:

`http://127.0.0.1:5000/regions`

Do not connect React directly to PostgreSQL. The intended flow is:

PostgreSQL → Flask REST API → React frontend.
