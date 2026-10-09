import React, { useEffect, useMemo, useState } from "react";
import {
  Activity, AlertTriangle, BarChart3, Bell, ChevronDown, CloudSun,
  Database, Droplets, Gauge, Globe2, LayoutDashboard, Map,
  Menu, Moon, Navigation, RefreshCw, Search, Settings, ShieldAlert,
  Sun, Thermometer, Users, Wind, X, Zap
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, CartesianGrid, Cell, LineChart, Line,
  PieChart, Pie, ResponsiveContainer, Tooltip, XAxis, YAxis
} from "recharts";

const regions = [
  { id: 1, name: "Pune", temp: 43.1, heat: 46.2, humidity: 30, wind: 5.9, risk: "Severe", probability: 91.5, station: "Pune Central Station", advisory: "Severe heatwave conditions are expected." },
  { id: 2, name: "Mumbai", temp: 37.0, heat: 41.5, humidity: 64, wind: 9.5, risk: "Moderate", probability: 58.2, station: "Mumbai Coastal Station", advisory: "Moderate heat conditions are expected." },
  { id: 3, name: "Nashik", temp: 41.5, heat: 44.3, humidity: 34, wind: 6.0, risk: "High", probability: 82.7, station: "Nashik Weather Station", advisory: "High heatwave risk detected." },
  { id: 4, name: "Nagpur", temp: 43.0, heat: 45.8, humidity: 30, wind: 5.0, risk: "Severe", probability: 89.3, station: "Nagpur Central Station", advisory: "Severe heat conditions are expected." },
  { id: 5, name: "Aurangabad", temp: 42.0, heat: 44.9, humidity: 32, wind: 6.0, risk: "High", probability: 78.6, station: "Aurangabad Station", advisory: "High heatwave risk detected." }
]; 

const hourly = [
  { time: "9 AM", temp: 38.5, heat: 41.2 }, { time: "10 AM", temp: 40.2, heat: 43.5 },
  { time: "11 AM", temp: 42.3, heat: 45.1 }, { time: "12 PM", temp: 43.1, heat: 46.2 },
  { time: "1 PM", temp: 44.0, heat: 46.8 }, { time: "2 PM", temp: 43.7, heat: 46.4 },
  { time: "3 PM", temp: 42.8, heat: 45.5 }
];

const forecast = [
  { day: "Today", temp: 43, heat: 46.2, risk: "Severe" },
  { day: "Tomorrow", temp: 44, heat: 46.8, risk: "Severe" },
  { day: "Oct 1", temp: 42, heat: 44.9, risk: "High" },
  { day: "Oct 2", temp: 40, heat: 43.1, risk: "High" },
  { day: "Oct 3", temp: 38, heat: 41.0, risk: "Moderate" }
];

const history = [
  { day: "Sep 23", Pune: 39, Mumbai: 34, Nagpur: 40 },
  { day: "Sep 24", Pune: 40, Mumbai: 35, Nagpur: 41 },
  { day: "Sep 25", Pune: 41, Mumbai: 36, Nagpur: 42 },
  { day: "Sep 26", Pune: 40, Mumbai: 35, Nagpur: 41 },
  { day: "Sep 27", Pune: 42, Mumbai: 36, Nagpur: 43 },
  { day: "Sep 28", Pune: 43, Mumbai: 37, Nagpur: 43 },
  { day: "Sep 29", Pune: 43.1, Mumbai: 37, Nagpur: 43 }
];

const alerts = [
  { region: "Pune", level: "Severe", text: "Avoid prolonged outdoor exposure and stay hydrated.", time: "2:15 PM", recipients: 2 },
  { region: "Nagpur", level: "Severe", text: "Activate heatwave response measures.", time: "1:50 PM", recipients: 1 },
  { region: "Nashik", level: "High", text: "Limit outdoor activities during peak afternoon hours.", time: "1:20 PM", recipients: 1 },
  { region: "Aurangabad", level: "High", text: "Monitor weather conditions and follow safety guidelines.", time: "12:45 PM", recipients: 0 }
];

const stakeholders = [
  { name: "Dr. Anjali Mehta", org: "Pune Health Department", region: "Pune", status: "Sent" },
  { name: "Rajesh Patil", org: "Pune Disaster Management", region: "Pune", status: "Sent" },
  { name: "Sneha Kulkarni", org: "Mumbai Municipal Authority", region: "Mumbai", status: "Sent" },
  { name: "Amit Sharma", org: "Nashik Emergency Services", region: "Nashik", status: "Sent" },
  { name: "Neha Joshi", org: "Nagpur Health Department", region: "Nagpur", status: "Sent" }
];

const nav = [
  ["Dashboard", LayoutDashboard], ["Live Weather", Thermometer], ["Regions & Stations", Map],
  ["Forecast", CloudSun], ["AI Prediction", Zap], ["Alerts & Advisories", Bell],
  ["Stakeholders", Users], ["Historical Analytics", BarChart3]
];

function riskClass(risk) {
  return risk.toLowerCase();
}

function App() {
  const [page, setPage] = useState("Dashboard");
const [selected, setSelected] = useState(regions[0]);
  const [sidebar, setSidebar] = useState(true);
  const [dark, setDark] = useState(false);
  const [search, setSearch] = useState("");
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [notifications, setNotifications] = useState(alerts);
  const [displayName, setDisplayName] = useState("Deshna Shah");
  const [dashboardData, setDashboardData] = useState([]);
  const [stationData, setStationData] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState("");


useEffect(() => {
  let active = true;

  async function loadDashboard() {
    try {
      const response = await fetch(
        "http://127.0.0.1:5000/dashboard"
      );

      if (!response.ok) {
        throw new Error("Dashboard API failed");
      }

      const data = await response.json();

      if (!Array.isArray(data)) {
        throw new Error("Invalid dashboard response");
      }

      if (active) {
        setDashboardData(data);
        setError("");
      }
    } catch (err) {
      console.error("Dashboard loading error:", err);

      if (active) {
        setError("Could not connect to Flask backend");
      }
    } finally {
      if (active) {
        setLoading(false);
      }
    }
  }

  loadDashboard();

  return () => {
    active = false;
  };
}, []);

console.log("Station data:", stationData);
console.log("Selected region:", selected);

const liveRegions = dashboardData.map((item, index) => {
  const regionStation = stationData.find(
    (station) => station.region === item.region
  );

  return {
    id: index + 1,
    name: item.region,
    temp: item.temperature,
    heat: item.heat_index,
    humidity: item.humidity,
    pressure: item.pressure,
    wind: item.wind_speed,
    windDirection: item.wind_direction,
    cloudCover: item.cloud_cover,
    risk: item.risk_level,
    probability: item.probability,
    station: regionStation?.station_name || "Station unavailable",
    stationStatus: regionStation?.status || "Unknown"
  };
});
useEffect(() => {
  if (liveRegions.length === 0) return;

  setSelected((previous) => {
    const matchingRegion =
      liveRegions.find((r) => r.name === previous?.name) ||
      liveRegions[0];

    if (
      previous &&
      previous.name === matchingRegion.name &&
      previous.temp === matchingRegion.temp &&
      previous.heat === matchingRegion.heat &&
      previous.pressure === matchingRegion.pressure &&
      previous.cloudCover === matchingRegion.cloudCover &&
      previous.station === matchingRegion.station &&
      previous.stationStatus === matchingRegion.stationStatus
    ) {
      return previous;
    }

    return matchingRegion;
  });
}, [dashboardData, stationData]);

  const filteredRegions = useMemo(() =>
  liveRegions.filter(r =>
    r.name.toLowerCase().includes(search.toLowerCase())
  ), [liveRegions, search]);

if (loading) {
  return (
    <div style={{ padding: "40px", textAlign: "center" }}>
      Loading climate data...
    </div>
  );
}

if (error) {
  return (
    <div style={{ padding: "40px", textAlign: "center" }}>
      <h2>Unable to load climate data</h2>
      <p>{error}</p>
      <p>Please make sure the Flask backend is running.</p>
    </div>
  );
}



  return (
    <div className={dark ? "app dark" : "app"}>
      <aside className={sidebar ? "sidebar open" : "sidebar"}>
        <div className="brand">
          <div className="brand-mark"><Sun size={21}/></div>
          <div><strong>ClimateIQ</strong><span>Heatwave Intelligence</span></div>
          <button className="icon-btn mobile-close" onClick={() => setSidebar(false)}><X size={18}/></button>
        </div>
        <div className="nav-label">MONITORING</div>
        <nav>
          {nav.map(([label, Icon]) => (
            <button key={label} className={page === label ? "nav-item active" : "nav-item"} onClick={() => {setPage(label); setSidebar(false);}}>
              <Icon size={18}/><span>{label}</span>
              {label === "Alerts & Advisories" && <b className="nav-badge">4</b>}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="system-status"><span className="pulse"></span><div><strong>System Online</strong><small>All services operational</small></div></div>
          <button className={page === "Settings" ? "nav-item active" : "nav-item"} onClick={() => {setPage("Settings"); setSidebar(false);}}><Settings size={18}/><span>Settings</span></button>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <button className="icon-btn menu-btn" onClick={() => setSidebar(!sidebar)}><Menu size={21}/></button>
          <div className="crumb"><span>Climate Intelligence</span><i>/</i><strong>{page}</strong></div>
          <div className="top-actions">
            <div className="search"><Search size={17}/><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search region..." /></div>
            <button className="icon-btn" onClick={() => setDark(!dark)} title="Toggle dark mode">{dark ? <Sun size={18}/> : <Moon size={18}/>}</button>
            <div className="top-popover-wrap">
              <button className="icon-btn notification" onClick={() => {setNotificationsOpen(!notificationsOpen); setProfileOpen(false);}} title="Notifications"><Bell size={18}/>{notifications.length > 0 && <span></span>}</button>
              {notificationsOpen && <NotificationPanel notifications={notifications} onClose={() => setNotificationsOpen(false)} onClear={() => setNotifications([])} />}
            </div>
            <div className="top-popover-wrap">
              <button className="avatar avatar-btn" onClick={() => {setProfileOpen(!profileOpen); setNotificationsOpen(false);}} title="Profile">{displayName.split(" ").map(x=>x[0]).slice(0,2).join("").toUpperCase()}</button>
              {profileOpen && <ProfilePanel displayName={displayName} setDisplayName={setDisplayName} onClose={() => setProfileOpen(false)} />}
            </div>
          </div>
        </header>

        <div className="content">
          <div className="page-heading">
            <div><div className="eyebrow"><span className="live-dot"></span> LIVE MONITORING</div><h1>{page}</h1><p>Real-time climate intelligence for heatwave monitoring, prediction and early warning.</p></div>
            <div className="updated"><RefreshCw size={14}/> Last updated <strong>2:35 PM</strong></div>
          </div>

          {page === "Dashboard" && <Dashboard selected={selected} setSelected={setSelected} filteredRegions={filteredRegions} />}
          {page === "Live Weather" && <LiveWeather
  selected={selected}
  setSelected={setSelected}
  regions={liveRegions}
/>}
          {page === "Regions & Stations" && <Regions regions={filteredRegions} selected={selected} setSelected={setSelected} />}
          {page === "Forecast" && <Forecast selected={selected} />}
          {page === "AI Prediction" && <Prediction selected={selected} />}
          {page === "Alerts & Advisories" && <Alerts regions={liveRegions} />}
          {page === "Stakeholders" && <Stakeholders />}
          {page === "Historical Analytics" && <Analytics regions={liveRegions} />}
          {page === "Settings" && <SettingsPage dark={dark} setDark={setDark} />}
        </div>
      </main>
    </div>
  );
}

function KPI({icon: Icon, label, value, sub, tone=""}) {
  return <div className="kpi"><div className={"kpi-icon " + tone}><Icon size={19}/></div><div><span>{label}</span><strong>{value}</strong>{sub && <small>{sub}</small>}</div></div>
}

function Dashboard({selected, setSelected, filteredRegions}) {
  const [showStations, setShowStations] = useState(false);


   if (!selected) {
    return <p>Loading dashboard data...</p>;
  }
  return <>
    <div className="kpis">
  <KPI
    icon={Thermometer}
    label="Current Temperature"
    value={selected.temp + "°C"}
    sub={selected.name}
    tone="orange"
  />

  <KPI
    icon={Gauge}
    label="Heat Index"
    value={selected.heat + "°C"}
    sub="Feels significantly hotter"
    tone="red"
  />

  <KPI
    icon={ShieldAlert}
    label="High-Risk Regions"
    value={filteredRegions.filter(r => r.risk === "Severe" || r.risk === "High").length}
    sub={`${filteredRegions.filter(r => r.risk === "Severe").length} severe • ${filteredRegions.filter(r => r.risk === "High").length} high`}
    tone="purple"
  />

  <KPI
    icon={Zap}
    label="Prediction Probability"
    value={selected.probability + "%"}
    sub={`${selected.name} • Model v1.0`}
    tone="blue"
  />

  <KPI
    icon={Activity}
    label="Active Stations"
    value={filteredRegions.length + " / " + filteredRegions.length}
    sub="All systems reporting"
    tone="green"
  />
</div>

    <div className="grid-main">
      <section className="panel hero-panel">
        <div className="panel-head"><div><span className="section-kicker">CURRENT HEATWAVE STATUS</span><h2>{selected.name} <span className={"risk-pill " + riskClass(selected.risk)}>{selected.risk}</span></h2></div>
<div style={{ position: "relative" }}>
  <button
    type="button"
    className="select-btn"
    onClick={() => setShowStations(!showStations)}
  >
    <Navigation size={15} />
    {selected.station || selected.name + " Station"}
    <ChevronDown size={15} />
  </button>

  {showStations && (
    <div
      className="panel"
      style={{
        position: "absolute",
        top: "100%",
        right: 0,
        zIndex: 50,
        minWidth: 220,
        maxHeight: 250,
        overflowY: "auto",
        padding: 8
      }}
    >
      {filteredRegions.map((r) => (
        <button
          key={r.id}
          type="button"
          onClick={() => {
            setSelected(r);
            setShowStations(false);
          }}
          style={{
            display: "block",
            width: "100%",
            padding: 10,
            textAlign: "left",
            border: "none",
            borderRadius: 6,
            background: "transparent",
            color: "inherit",
            cursor: "pointer"
          }}
        >
          {r.station || r.name + " Station"}
        </button>
      ))}
    </div>
  )}
</div>
</div>
        <div className="hero-body">
          <div className="temperature"><Sun size={35}/><strong>{selected.temp}°</strong><span>Feels like {selected.heat}°C</span></div>
          <div className="weather-grid">
            <MiniWeather icon={Droplets} label="Humidity" value={selected.humidity + "%"} />
            <MiniWeather icon={Wind} label="Wind Speed" value={selected.wind + " km/h"} />
            <MiniWeather icon={Gauge} label="Pressure" value={selected.pressure + " hPa"} />
            <MiniWeather icon={CloudSun} label="Cloud Cover" value={selected.cloudCover + "%"} />
          </div>
        </div>
        <div className="chart-wrap"><div className="chart-title"><span>Today's temperature trend</span><span className="legend"><i></i> Temperature <i className="heat"></i> Heat Index</span></div>
          <ResponsiveContainer width="100%" height={190}><AreaChart data={hourly}><defs><linearGradient id="temp" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#ff8a3d" stopOpacity=".28"/><stop offset="100%" stopColor="#ff8a3d" stopOpacity="0"/></linearGradient></defs><CartesianGrid strokeDasharray="3 3" vertical={false}/><XAxis dataKey="time"/><YAxis domain={[35,50]}/><Tooltip/><Area type="monotone" dataKey="temp" stroke="#ff7a2f" fill="url(#temp)" strokeWidth={2.5}/><Line type="monotone" dataKey="heat" stroke="#ef4444" strokeWidth={2.5} dot={false}/></AreaChart></ResponsiveContainer>
        </div>
            </section>

      <section className="panel advisory-panel">
        <div className="panel-head">
          <div>
            <span className="section-kicker">EARLY WARNING</span>
            <h2>Heatwave Advisory</h2>
          </div>
          <span className={"risk-pill " + riskClass(selected.risk)}>
            {selected.risk} Risk
          </span>
        </div>

        <div className="advisory-content">
          <div className="advisory-icon">
            <ShieldAlert size={28} />
          </div>

          <div>
            <strong>
              {selected.name} is currently under {selected.risk.toLowerCase()} heat risk.
            </strong>

            <p>
              {selected.risk === "Severe"
                ? "Extreme heat conditions detected. Stay hydrated, avoid direct sunlight, and limit outdoor activity."
                : selected.risk === "High"
                ? "High heat conditions detected. Stay hydrated, avoid prolonged outdoor exposure, and take regular breaks."
                : "Moderate heat conditions detected. Stay hydrated and take regular breaks during outdoor activity."}
            </p>
          </div>
        </div>

        <div className="advisory-stats">
          <span>🌡️ {selected.temp}°C temperature</span>
          <span>🔥 {selected.heat}°C heat index</span>
          <span>📍 {selected.name}</span>
        </div>
      </section>

      <section className="panel risk-panel">
        <div className="panel-head"><div><span className="section-kicker">REGION RISK MAP</span><h2>Heatwave Monitor</h2></div><span className="live-tag">● LIVE</span></div>
        <div className="fake-map">
          <div className="map-shape"></div>

{filteredRegions.map((r, i) => {
  const positions = [
    { left: "43%", top: "37%" },
    { left: "25%", top: "44%" },
    { left: "36%", top: "25%" },
    { left: "67%", top: "40%" },
    { left: "55%", top: "64%" },
    { left: "34%", top: "73%" },
    { left: "49%", top: "59%" },
    { left: "73%", top: "55%" },
    { left: "58%", top: "31%" },
    { left: "27%", top: "52%" }
  ];

  const position = positions[i % positions.length];

  return (
    <button
      key={r.id}
      className={"map-pin " + riskClass(r.risk)}
      style={{
        position: "absolute",
        left: position.left,
        top: position.top
      }}
      onClick={() => setSelected(r)}
      title={r.name}
    >
      <span></span>
      <b>{r.name}</b>
    </button>
  );
})}
          <div className="map-caption"><Globe2 size={15}/> Maharashtra • {filteredRegions.length} monitored regions</div>
        </div>
        <div className="risk-list">{filteredRegions.map(r => <button className="risk-row" key={r.id} onClick={() => setSelected(r)}><span className={"risk-dot "+riskClass(r.risk)}></span><strong>{r.name}</strong><span>{r.temp}°C</span><em>{r.risk}</em></button>)}</div>
      </section>
    </div>

    <div className="grid-bottom">
      <section className="panel">
        <div className="panel-head"><div><span className="section-kicker">PREDICTION</span><h2>Heatwave Probability</h2></div><button className="text-btn">View details →</button></div>
        <div className="prediction-row"><div className="gauge"><div className="gauge-inner"><strong>{selected.probability}%</strong><span>Probability</span></div></div><div className="prediction-copy"><span className={"risk-pill "+riskClass(selected.risk)}>{selected.risk} Risk</span><p>Based on temperature, humidity, wind and forecast conditions.</p><div className="factors"><span>🌡 High temperature</span><span>💧 Low humidity</span><span>🌬 Low wind</span></div></div></div>
      </section>
      <section className="panel">
        <div className="panel-head"><div><span className="section-kicker">EARLY WARNING</span><h2>Active Advisories</h2></div><button className="text-btn">View all →</button></div>
        <div className="alert-mini"><div className="alert-icon severe"><AlertTriangle size={18}/></div><div><strong>Pune — Severe Alert</strong><p>Avoid prolonged outdoor exposure and stay hydrated.</p></div><span>2:15 PM</span></div>
        <div className="alert-mini"><div className="alert-icon high"><AlertTriangle size={18}/></div><div><strong>Nashik — High Alert</strong><p>Limit outdoor activities during peak afternoon hours.</p></div><span>1:20 PM</span></div>
      </section>
    </div>
  </>;
}

function MiniWeather({icon: Icon,label,value}) { return <div className="mini-weather"><Icon size={17}/><span>{label}</span><strong>{value}</strong></div> }


function LiveWeather({ selected, setSelected, regions: rs = [] }) {
  if (!selected) {
    return <p>Loading region data...</p>;
  }

  const display = (value, unit = "") =>
    value == null ? "N/A" : `${value}${unit}`;

  return (
    <>
      <div className="region-tabs">
        {rs.map((r) => (
          <button
            key={r.id}
            className={selected.name === r.name ? "selected" : ""}
            onClick={() => setSelected(r)}
          >
            {r.name}
          </button>
        ))}
      </div>

      <div className="weather-detail">
        <section className="panel current-card">
          <div className="sun-large">
            <Sun size={54} />
          </div>
          <span>Current conditions</span>
          <strong>{display(selected.temp, "°C")}</strong>
          <b>Heat Index {display(selected.heat, "°C")}</b>
          <em className={"risk-pill " + riskClass(selected.risk || "Moderate")}>
            {selected.risk || "Unknown"} Risk
          </em>
        </section>

        <section className="panel weather-metrics">
          <h2>Atmospheric conditions</h2>
          <div className="metric-grid">
            <Metric icon={Droplets} name="Humidity"
              val={display(selected.humidity, "%")} />
            <Metric icon={Wind} name="Wind Speed"
              val={display(selected.wind, " km/h")} />
            <Metric icon={Gauge} name="Pressure"
              val={display(selected.pressure, " hPa")} />
            <Metric icon={CloudSun} name="Cloud Cover"
              val={display(selected.cloudCover, "%")} />
            <Metric icon={Navigation} name="Wind Direction"
              val={display(selected.windDirection)} />
            <Metric icon={Activity} name="Station Status"
              val={selected.stationStatus || "Not available"} />
          </div>
        </section>
      </div>

      <section className="panel">
        <div className="panel-head">
          <div>
            <span className="section-kicker">SENSOR DATA</span>
            <h2>Temperature & Heat Index</h2>
          </div>
        </div>

        <p style={{ fontSize: 12, opacity: 0.7, marginBottom: 12 }}>
          Illustrative hourly trend — not live sensor history.
        </p>

        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={hourly}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip />
            <Line dataKey="temp" name="Temperature"
              stroke="#ff7a2f" strokeWidth={3} />
            <Line dataKey="heat" name="Heat Index"
              stroke="#ef4444" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      </section>
    </>
  );
}

function Metric({icon:Icon,name,val}) { return <div className="metric"><div><Icon size={19}/></div><span>{name}</span><strong>{val}</strong></div> }


function Regions({ regions: rs, selected, setSelected }) {
  const [stations, setStations] = useState([]);
  const [regionDetails, setRegionDetails] = useState([]);
  const [loadingStations, setLoadingStations] = useState(true);
  const [stationError, setStationError] = useState("");
  const [expandedRegion, setExpandedRegion] = useState(null);

  useEffect(() => {
    let active = true;

    async function loadNetwork() {
      try {
        const [stationResponse, regionResponse] =
          await Promise.all([
            fetch("http://127.0.0.1:5000/stations"),
            fetch("http://127.0.0.1:5000/regions")
          ]);

        if (!stationResponse.ok || !regionResponse.ok) {
          throw new Error("Unable to load monitoring network");
        }

        const stationData = await stationResponse.json();
        const regionData = await regionResponse.json();

        if (!Array.isArray(stationData) ||
            !Array.isArray(regionData)) {
          throw new Error("Invalid API response");
        }

        if (active) {
          setStations(stationData);
          setRegionDetails(regionData);
          setStationError("");
        }
      } catch (error) {
        console.error("Monitoring network error:", error);

        if (active) {
          setStationError(
            "Could not load stations and regions from Flask."
          );
        }
      } finally {
        if (active) setLoadingStations(false);
      }
    }

    loadNetwork();

    return () => {
      active = false;
    };
  }, []);

  function getStations(regionName) {
    return stations.filter(
      (station) => station.region === regionName
    );
  }

  function getRegionDetails(regionName) {
    return regionDetails.find(
      (region) => region.region_name === regionName
    );
  }

  return (
    <section className="panel table-panel">
      <div className="panel-head">
        <div>
          <span className="section-kicker">
            POSTGRESQL MONITORING NETWORK
          </span>
          <h2>Regions & Weather Stations</h2>
          <p className="panel-subtitle">
            Regional weather conditions and registered
            monitoring stations.
          </p>
        </div>

        <span className="count-pill">
          {rs.length} regions
        </span>
      </div>

      {loadingStations && (
        <p>Loading weather stations...</p>
      )}

      {stationError && (
        <p>{stationError}</p>
      )}

      {!loadingStations && !stationError && (
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Region</th>
                <th>Weather Station</th>
                <th>Temperature</th>
                <th>Heat Index</th>
                <th>Risk</th>
                <th>Probability</th>
                <th>Status</th>
                <th>Details</th>
              </tr>
            </thead>

            <tbody>
              {rs.map((r) => {
                const regionStations = getStations(r.name);
                const details = getRegionDetails(r.name);
                const isExpanded = expandedRegion === r.name;

                return (
                  <React.Fragment key={r.id}>
                    <tr>
                      <td>
                        <strong>{r.name}</strong>
                        <small>{details?.state || "Unknown state"}</small>
                      </td>

                      <td>
                        {regionStations.length
                          ? regionStations
                              .map((s) => s.station_name)
                              .join(", ")
                          : "No station registered"}
                      </td>

                      <td><b>{r.temp}°C</b></td>
                      <td>{r.heat}°C</td>

                      <td>
                        <span
                          className={
                            "risk-pill " + riskClass(r.risk)
                          }
                        >
                          {r.risk}
                        </span>
                      </td>

                      <td>{r.probability}%</td>

                      <td>
                        {regionStations.length
                          ? regionStations
                              .map((s) => s.status || "Unknown")
                              .join(", ")
                          : "No station"}
                      </td>

                      <td>
                        <button
                          type="button"
                          className="small-action"
                          onClick={() => {
                            setSelected(r);
                            setExpandedRegion(
                              isExpanded ? null : r.name
                            );
                          }}
                        >
                          {isExpanded ? "Hide" : "View"}
                        </button>
                      </td>
                    </tr>

                    {isExpanded && (
                      <tr>
                        <td colSpan={8}>
                          <div className="alert-details">
                            <h3>{r.name} — Region Details</h3>

                            <p>
                              <strong>State:</strong>{" "}
                              {details?.state || "Not available"}
                            </p>

                            <p>
                              <strong>Climate Zone:</strong>{" "}
                              {details?.climate_zone || "Not available"}
                            </p>

                            <p>
                              <strong>Population:</strong>{" "}
                              {details?.population != null
                                ? Number(details.population)
                                    .toLocaleString("en-IN")
                                : "Not available"}
                            </p>

                            <p>
                              <strong>Registered Stations:</strong>{" "}
                              {regionStations.length}
                            </p>

                            {regionStations.map((station) => (
                              <p key={station.station_id}>
                                <strong>{station.station_name}</strong>
                                {" — "}
                                {station.status || "Unknown status"}
                              </p>
                            ))}

                            <p>
                              <strong>Current Heatwave Risk:</strong>{" "}
                              {r.risk}
                            </p>

                            <p>
                              <strong>Heatwave Probability:</strong>{" "}
                              {r.probability}%
                            </p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}



function Forecast({ selected }) {
  const forecast = [
    { dayOffset: 0, tempChange: 0, heatChange: 0 },
    { dayOffset: 1, tempChange: 0.5, heatChange: 0.6 },
    { dayOffset: 2, tempChange: -0.6, heatChange: -0.8 },
    { dayOffset: 3, tempChange: -1.5, heatChange: -1.7 },
    { dayOffset: 4, tempChange: -2.3, heatChange: -2.5 }
  ].map((item, index) => {
    const date = new Date();
    date.setDate(date.getDate() + item.dayOffset);

    const temp = Number((selected.temp + item.tempChange).toFixed(1));
    const heat = Number((selected.heat + item.heatChange).toFixed(1));

    const risk =
      heat >= 45 ? "Severe" :
      heat >= 43 ? "High" :
      "Moderate";

    return {
      day: index === 0
        ? "Today"
        : index === 1
          ? "Tomorrow"
          : date.toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short"
            }),
      temp,
      heat,
      risk
    };
  });

  return (
    <div className="forecast-page">
      <section className="panel">
        <div className="panel-head">
          <div>
            <span className="section-kicker">ILLUSTRATIVE 5-DAY OUTLOOK</span>
            <h2>{selected.name} Temperature Forecast</h2>
            <p className="panel-subtitle">
              Demonstration estimates based on current conditions.
              These are not verified weather forecasts.
            </p>
          </div>
          <span className={"risk-pill " + riskClass(selected.risk)}>
            Current: {selected.risk}
          </span>
        </div>

        <div className="forecast-cards">
          {forecast.map((f) => (
            <div className="forecast-card" key={f.day}>
              <span>{f.day}</span>
              <Sun size={28} />
              <strong>{f.temp}°C</strong>
              <small>Heat index {f.heat}°C</small>
              <em className={"risk-pill " + riskClass(f.risk)}>
                {f.risk}
              </em>
            </div>
          ))}
        </div>
      </section>

      <section className="panel">
        <div className="panel-head">
          <div>
            <span className="section-kicker">TEMPERATURE & HEAT INDEX</span>
            <h2>Five-Day Trend</h2>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={330}>
          <AreaChart data={forecast}>
            <defs>
              <linearGradient id="forecastTemp" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ff7a2f" stopOpacity={0.25} />
                <stop offset="100%" stopColor="#ff7a2f" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="day" />
            <YAxis domain={["dataMin - 3", "dataMax + 3"]} />
            <Tooltip />
            <Area
              type="monotone"
              dataKey="temp"
              name="Temperature (°C)"
              stroke="#ff7a2f"
              fill="url(#forecastTemp)"
              strokeWidth={3}
            />
            <Line
              type="monotone"
              dataKey="heat"
              name="Heat Index (°C)"
              stroke="#ef4444"
              strokeWidth={3}
            />
          </AreaChart>
        </ResponsiveContainer>
      </section>

      <section className="panel">
        <div className="panel-head">
          <div>
            <span className="section-kicker">RISK OUTLOOK</span>
            <h2>Daily Heat Risk</h2>
          </div>
        </div>

        <div className="forecast-risk-list">
          {forecast.map((f) => (
            <div className="risk-row" key={f.day}>
              <strong>{f.day}</strong>
              <span>{f.heat}°C heat index</span>
              <em className={"risk-pill " + riskClass(f.risk)}>
                {f.risk}
              </em>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}



function Prediction({ selected }) {
  const temperature = Number(selected.temp);
  const humidity = Number(selected.humidity);
  const wind = Number(selected.wind);
  const heatIndex = Number(selected.heat);
  const probability = Number(selected.probability);

  const risk = selected.risk || "Unknown";

  const factors = [
    {
      icon: "🌡️",
      title: "Temperature",
      value: `${temperature}°C`,
      note:
        temperature >= 40
          ? "Very High"
          : temperature >= 35
          ? "High"
          : "Moderate"
    },
    {
      icon: "💧",
      title: "Humidity",
      value: `${humidity}%`,
      note:
        humidity >= 60
          ? "High"
          : humidity >= 40
          ? "Moderate"
          : "Low"
    },
    {
      icon: "🌬️",
      title: "Wind Speed",
      value: `${wind} km/h`,
      note:
        wind >= 15
          ? "Strong"
          : wind >= 8
          ? "Moderate"
          : "Light"
    },
    {
      icon: "🔥",
      title: "Heat Index",
      value: `${heatIndex}°C`,
      note:
        heatIndex >= 45
          ? "Severe"
          : heatIndex >= 43
          ? "High"
          : "Moderate"
    }
  ];

  const explanations = [
    {
      icon: "🌡️",
      title: "Temperature Conditions",
      description:
        temperature >= 40
          ? `The temperature in ${selected.name} is ${temperature}°C, indicating extremely hot conditions.`
          : temperature >= 35
          ? `The temperature in ${selected.name} is ${temperature}°C, indicating elevated heat exposure.`
          : `The temperature in ${selected.name} is ${temperature}°C.`
    },
    {
      icon: "💧",
      title: "Humidity Conditions",
      description:
        humidity >= 60
          ? `Humidity is ${humidity}%. High humidity can make it harder for the body to cool itself through sweating.`
          : humidity >= 40
          ? `Humidity is ${humidity}%, indicating moderate atmospheric moisture.`
          : `Humidity is ${humidity}%, indicating relatively dry atmospheric conditions.`
    },
    {
      icon: "🔥",
      title: "Heat Index",
      description:
        heatIndex >= 45
          ? `The heat index is ${heatIndex}°C, indicating severe apparent heat exposure.`
          : heatIndex >= 43
          ? `The heat index is ${heatIndex}°C, indicating high apparent heat exposure.`
          : `The heat index is ${heatIndex}°C, indicating comparatively lower apparent heat exposure.`
    },
    {
      icon: "🌬️",
      title: "Wind Conditions",
      description:
        wind < 8
          ? `Wind speed is ${wind} km/h. Light winds may provide limited convective cooling.`
          : `Wind speed is ${wind} km/h. Air movement can influence outdoor heat exposure.`
    }
  ];

  return (
    <div className="prediction-page">

      <section className="panel prediction-hero">
        <div>
          <span className="section-kicker">
            HEATWAVE RISK ASSESSMENT
          </span>

          <h2>{selected.name} Heatwave Risk</h2>

          <p>
            Risk assessment based on the weather data
            available for the selected region.
          </p>
        </div>

        <div className="big-prob">
          <strong>
            {Number.isFinite(probability)
              ? `${probability}%`
              : "N/A"}
          </strong>

          <span>Stored Heatwave Probability</span>

          <em className={"risk-pill " + riskClass(risk)}>
            {risk} Risk
          </em>
        </div>
      </section>

      <div className="factor-grid">
        {factors.map((factor) => (
          <Factor
            key={factor.title}
            icon={factor.icon}
            title={factor.title}
            value={factor.value}
            note={factor.note}
          />
        ))}
      </div>

      <section className="panel">
        <div className="panel-head">
          <div>
            <span className="section-kicker">
              WEATHER FACTOR ANALYSIS
            </span>

            <h2>Understanding the Risk</h2>
          </div>
        </div>

        <div className="reason-list">
          {explanations.map((item) => (
            <div key={item.title}>
              {item.icon}

              <span>
                <strong>{item.title}</strong>
                <small>{item.description}</small>
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="panel">
        <div className="panel-head">
          <div>
            <span className="section-kicker">
              ASSESSMENT SUMMARY
            </span>

            <h2>Regional Heatwave Outlook</h2>
          </div>
        </div>

        <p>
          {selected.name} currently has a{" "}
          <strong>{risk.toLowerCase()}</strong>{" "}
          recorded heatwave risk level, with a stored
          probability of{" "}
          <strong>
            {Number.isFinite(probability)
              ? `${probability}%`
              : "N/A"}
          </strong>.
        </p>

        <p>
          The assessment considers temperature,
          humidity, wind speed, and heat index.
          The explanations are rule-based and
          illustrative; they are not generated
          by a trained AI model.
        </p>
      </section>

    </div>
  );
}
function Factor({icon,title,value,note}) {return <div className="factor-card"><span>{icon}</span><small>{title}</small><strong>{value}</strong><em>{note}</em></div>}


function Alerts({ regions = [] }) {
  const [expandedRegion, setExpandedRegion] = useState(null);

  const getAlertMessage = (region) => {
    if (region.risk === "Severe") {
      return `Severe heat conditions have been recorded in ${region.name}. Avoid prolonged outdoor exposure, especially during peak afternoon hours.`;
    }

    if (region.risk === "High") {
      return `High heat exposure has been recorded in ${region.name}. Stay hydrated, take regular breaks, and monitor local weather updates.`;
    }

    return `Moderate heat exposure has been recorded in ${region.name}. Continue taking precautions during hot weather.`;
  };

  const getPrecautions = (risk) => {
    if (risk === "Severe") {
      return [
        "Limit outdoor activities during peak heat hours.",
        "Drink water regularly and stay in shaded or cool areas.",
        "Check on elderly people, children, and vulnerable residents.",
        "Seek medical assistance if symptoms of heat illness occur."
      ];
    }

    if (risk === "High") {
      return [
        "Avoid unnecessary exposure to direct sunlight.",
        "Drink sufficient water throughout the day.",
        "Take frequent breaks during outdoor activities."
      ];
    }

    return [
      "Stay hydrated.",
      "Wear light and breathable clothing.",
      "Monitor local weather conditions."
    ];
  };

  return (
    <section className="alerts-page">
      {regions.length === 0 ? (
        <div className="panel">
          <h2>No region data available</h2>
          <p>
            Unable to generate regional risk summaries.
            Please check the Flask backend connection.
          </p>
        </div>
      ) : (
        regions.map((region) => {
          const isExpanded = expandedRegion === region.name;

          return (
            <div
              className={
                "panel alert-card " + riskClass(region.risk)
              }
              key={region.id}
            >
              <div
                className={
                  "alert-icon " + riskClass(region.risk)
                }
              >
                <AlertTriangle size={21} />
              </div>

              <div className="alert-content">
                <div>
                  <span
                    className={
                      "risk-pill " + riskClass(region.risk)
                    }
                  >
                    {region.risk} Risk
                  </span>

                  <h2>{region.name}</h2>
                </div>

                <p>{getAlertMessage(region)}</p>

                <div className="alert-meta">
                  <span>
                    🌡️ Temperature: {region.temp}°C
                  </span>

                  <span>
                    🔥 Heat Index: {region.heat}°C
                  </span>

                  <span>
                    📊 Risk Probability: {region.probability}%
                  </span>

                  <span>● Risk assessment</span>
                </div>

                {isExpanded && (
                  <div className="alert-details">
                    <h3>Recommended Precautions</h3>

                    <ul>
                      {getPrecautions(region.risk).map(
                        (precaution, index) => (
                          <li key={index}>
                            {precaution}
                          </li>
                        )
                      )}
                    </ul>

                    <p>
                      <strong>Advisory information:</strong>{" "}
                      This is a demonstration risk advisory
                      generated from the available regional
                      weather data. It is not an official
                      government-issued alert.
                    </p>
                  </div>
                )}
              </div>

              <button
                type="button"
                className="outline-btn"
                onClick={() =>
                  setExpandedRegion(
                    isExpanded ? null : region.name
                  )
                }
              >
                {isExpanded ? "Hide details" : "View details"}
              </button>
            </div>
          );
        })
      )}
    </section>
  );
}


function Stakeholders() {
  const [filter, setFilter] = useState("");
  const [stakeholderData, setStakeholderData] = useState([]);
  const [advisoryRecords, setAdvisoryRecords] = useState([]);
  const [loadingStakeholders, setLoadingStakeholders] = useState(true);
  const [stakeholderError, setStakeholderError] = useState("");
  const [selectedStakeholder, setSelectedStakeholder] = useState(null);

  useEffect(() => {
    let active = true;

    async function loadStakeholders() {
      try {
        const [stakeholderResponse, advisoryResponse] =
          await Promise.all([
            fetch("http://127.0.0.1:5000/stakeholders"),
            fetch("http://127.0.0.1:5000/advisory-stakeholders")
          ]);

        if (!stakeholderResponse.ok || !advisoryResponse.ok) {
          throw new Error("Failed to retrieve stakeholder records");
        }

        const stakeholdersJson = await stakeholderResponse.json();
        const advisoriesJson = await advisoryResponse.json();

        if (active) {
          setStakeholderData(stakeholdersJson);
          setAdvisoryRecords(advisoriesJson);
          setStakeholderError("");
        }
      } catch (error) {
        console.error("Stakeholder API error:", error);

        if (active) {
          setStakeholderError(
            "Unable to load stakeholder records from Flask."
          );
        }
      } finally {
        if (active) {
          setLoadingStakeholders(false);
        }
      }
    }

    loadStakeholders();

    return () => {
      active = false;
    };
  }, []);

  const list = stakeholderData.filter((s) =>
    `${s.name ?? ""} ${s.organization ?? ""} ${s.region ?? ""}`
      .toLowerCase()
      .includes(filter.toLowerCase())
  );

  function getLatestAdvisory(stakeholderId) {
    return advisoryRecords.find(
      (record) =>
        String(record.stakeholder_id) === String(stakeholderId)
    );
  }

  return (
    <section className="panel table-panel">
      <div className="panel-head">
        <div>
          <span className="section-kicker">
            DATABASE-CONNECTED ALERT NETWORK
          </span>
          <h2>Stakeholders</h2>
          <p className="panel-subtitle">
            Registered people and organizations associated
            with regional heatwave advisories.
          </p>
        </div>

        <span className="count-pill">
          {stakeholderData.length} registered
        </span>
      </div>

      <div className="stake-toolbar">
        <div className="stake-search">
          <Search size={15} />

          <input
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Search stakeholder, organization or region..."
          />
        </div>

        <span className="count-pill">
          {list.length} shown
        </span>
      </div>

      {loadingStakeholders && (
        <div className="empty-state">
          <strong>Loading stakeholders...</strong>
          <span>Retrieving records from PostgreSQL.</span>
        </div>
      )}

      {stakeholderError && (
        <div className="empty-state">
          <AlertTriangle size={28} />
          <strong>Connection error</strong>
          <span>{stakeholderError}</span>
        </div>
      )}

      {!loadingStakeholders && !stakeholderError && (
        <>
          <div className="stake-grid">
            {list.map((s) => {
              const advisory = getLatestAdvisory(s.stakeholder_id);
              const status = advisory?.status || "No advisory";
              const hasAdvisory = Boolean(advisory);

              return (
                <div
                  className="stake-card"
                  key={s.stakeholder_id}
                >
                  <div className="person-avatar">
                    {(s.name || "?")
                      .split(" ")
                      .filter(Boolean)
                      .map((word) => word[0])
                      .slice(0, 2)
                      .join("")
                      .toUpperCase()}
                  </div>

                  <div>
                    <strong>{s.name}</strong>
                    <span>{s.organization || "Not specified"}</span>
                    <small>
                      📍 {s.region || "Unassigned region"}
                    </small>
                  </div>

                  <div className="stake-actions">
                    <em
                      className={
                        status.toLowerCase() === "sent"
                          ? "stake-sent"
                          : "stake-pending"
                      }
                    >
                      <i></i>
                      {status}
                    </em>

                    <button
                      type="button"
                      className="small-action"
                      onClick={() =>
                        setSelectedStakeholder(
                          selectedStakeholder === s.stakeholder_id
                            ? null
                            : s.stakeholder_id
                        )
                      }
                    >
                      {selectedStakeholder === s.stakeholder_id
                        ? "Hide"
                        : "Details"}
                    </button>
                  </div>

                  {selectedStakeholder === s.stakeholder_id && (
                    <div
                      className="alert-details"
                      style={{ gridColumn: "1 / -1" }}
                    >
                      <h3>Stakeholder Details</h3>

                      <p>
                        <strong>Organization:</strong>{" "}
                        {s.organization || "Not specified"}
                      </p>

                      <p>
                        <strong>Region:</strong>{" "}
                        {s.region || "Not assigned"}
                      </p>

                      <p>
                        <strong>Advisory status:</strong>{" "}
                        {status}
                      </p>

                      {hasAdvisory && (
                        <>
                          <p>
                            <strong>Advisory ID:</strong>{" "}
                            {advisory.advisory_id}
                          </p>

                          <p>
                            <strong>Alert level:</strong>{" "}
                            {advisory.alert_level}
                          </p>

                          <p>
                            <strong>Recorded time:</strong>{" "}
                            {advisory.sent_time || "Not available"}
                          </p>
                        </>
                      )}

                      {!hasAdvisory && (
                        <p>
                          No advisory assignment has been
                          recorded for this stakeholder.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {list.length === 0 && (
            <div className="empty-state">
              <Users size={28} />
              <strong>No stakeholders found</strong>
              <span>
                Try another search or check your database records.
              </span>
            </div>
          )}
        </>
      )}
    </section>
  );
}


function NotificationPanel({notifications, onClose, onClear}) {
  return <div className="top-popover notification-panel">
    <div className="popover-head"><div><strong>Notifications</strong><small>{notifications.length ? `${notifications.length} active alert${notifications.length===1?"":"s"}` : "All caught up"}</small></div><button onClick={onClose}><X size={15}/></button></div>
    {notifications.length ? <div className="notification-list">{notifications.map((n,i)=><div className="notification-item" key={n.region+i}><div className={`alert-icon ${riskClass(n.level)}`}><AlertTriangle size={15}/></div><div><strong>{n.region} — {n.level}</strong><p>{n.text}</p><small>{n.time}</small></div></div>)}</div> : <div className="empty-state compact"><Bell size={25}/><strong>No new notifications</strong><span>New heatwave alerts will appear here.</span></div>}
    <div className="popover-footer"><button onClick={onClear}>Mark all as read</button><button onClick={onClose}>Close</button></div>
  </div>
}

function ProfilePanel({displayName, setDisplayName, onClose}) {
  const [name, setName] = useState(displayName);
  const save = () => { if(name.trim()) setDisplayName(name.trim()); onClose(); };
  return <div className="top-popover profile-panel">
    <div className="popover-head"><div><strong>Profile</strong><small>Dashboard user</small></div><button onClick={onClose}><X size={15}/></button></div>
    <div className="profile-body"><div className="profile-avatar-large">{name.split(" ").map(x=>x[0]).slice(0,2).join("").toUpperCase()}</div><label>Display name<input value={name} onChange={e=>setName(e.target.value)} /></label><small className="profile-note">Your avatar initials are generated from this name.</small></div>
    <div className="popover-footer"><button onClick={save}>Save changes</button><button onClick={onClose}>Cancel</button></div>
  </div>
}

function SettingsPage({dark,setDark}) {
  const [units, setUnits] = useState("Celsius");
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [alertSound, setAlertSound] = useState(true);
  return <div className="settings-page">
    <section className="panel settings-hero"><div className="settings-icon"><Settings size={23}/></div><div><span className="section-kicker">SYSTEM PREFERENCES</span><h2>Settings</h2><p>Customize how the Climate Intelligence dashboard behaves on this device.</p></div></section>
    <section className="panel settings-card"><div className="settings-section-title"><div><strong>Appearance</strong><span>Control the dashboard theme and temperature display.</span></div></div>
      <SettingRow icon={dark ? Moon : Sun} title="Dark mode" description="Use a darker interface for low-light viewing." control={<Toggle checked={dark} onChange={()=>setDark(!dark)} />} />
      <div className="setting-row"><div className="setting-symbol"><Thermometer size={17}/></div><div className="setting-copy"><strong>Temperature unit</strong><span>Choose how temperatures are displayed.</span></div><select value={units} onChange={e=>setUnits(e.target.value)}><option>Celsius</option><option>Fahrenheit</option></select></div>
    </section>
    <section className="panel settings-card"><div className="settings-section-title"><div><strong>Monitoring</strong><span>Control live dashboard refresh behaviour.</span></div></div>
      <SettingRow icon={RefreshCw} title="Auto refresh" description="Keep monitoring data refreshed automatically." control={<Toggle checked={autoRefresh} onChange={()=>setAutoRefresh(!autoRefresh)} />} />
      <SettingRow icon={Bell} title="Alert sound" description="Play a notification sound when a new alert arrives." control={<Toggle checked={alertSound} onChange={()=>setAlertSound(!alertSound)} />} />
    </section>
    <section className="panel settings-card settings-info"><Database size={19}/><div><strong>Database connection</strong><span>Frontend is currently using demo data. PostgreSQL will be connected through the Flask API in the next integration step.</span></div><b>Demo mode</b></section>
  </div>
}

function SettingRow({icon:Icon,title,description,control}) { return <div className="setting-row"><div className="setting-symbol"><Icon size={17}/></div><div className="setting-copy"><strong>{title}</strong><span>{description}</span></div>{control}</div> }
function Toggle({checked,onChange}) { return <button className={`toggle ${checked ? "on" : ""}`} onClick={onChange} aria-label="Toggle setting"><span></span></button> }


function Analytics({ regions = [] }) {
  const [readings, setReadings] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState("All");
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [historyError, setHistoryError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadReadings() {
      try {
        const response = await fetch(
          "http://127.0.0.1:5000/readings"
        );

        if (!response.ok) {
          throw new Error("Failed to load historical readings");
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
          throw new Error("Invalid readings response");
        }

        if (active) {
          setReadings(data);
          setHistoryError("");
        }
      } catch (error) {
        console.error("Historical readings error:", error);

        if (active) {
          setHistoryError(
            "Unable to retrieve historical data from Flask."
          );
        }
      } finally {
        if (active) {
          setLoadingHistory(false);
        }
      }
    }

    loadReadings();

    return () => {
      active = false;
    };
  }, []);

  const regionNames = [
    ...new Set(readings.map((r) => r.region).filter(Boolean))
  ].sort();

  const filteredReadings = readings.filter(
    (r) =>
      selectedRegion === "All" ||
      r.region === selectedRegion
  );

  // Use actual timestamps rather than fabricated dates.
  // Each reading remains a separate observation.
  const chronological = [...filteredReadings]
    .filter(
      (r) =>
        r.reading_time &&
        Number.isFinite(Date.parse(r.reading_time))
    )
    .sort(
      (a, b) =>
        Date.parse(a.reading_time) -
        Date.parse(b.reading_time)
    );

  const chartData = chronological.map((r) => ({
    time: new Date(r.reading_time).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit"
    }),
    temperature:
      r.temperature == null ? null : Number(r.temperature),
    heatIndex:
      r.heat_index == null ? null : Number(r.heat_index),
    humidity:
      r.humidity == null ? null : Number(r.humidity),
    region: r.region,
    station: r.station_name
  }));

  const temperatures = filteredReadings
    .map((r) => Number(r.temperature))
    .filter(Number.isFinite);

  const heatIndices = filteredReadings
    .filter((r) => r.heat_index != null)
    .map((r) => Number(r.heat_index))
    .filter(Number.isFinite);

  const maximumTemperature = temperatures.length
    ? Math.max(...temperatures).toFixed(1)
    : "N/A";

  const averageHeatIndex = heatIndices.length
    ? (
        heatIndices.reduce((sum, value) => sum + value, 0) /
        heatIndices.length
      ).toFixed(1)
    : "N/A";

  const riskCounts = ["Severe", "High", "Moderate"].map(
    (risk) => ({
      name: risk,
      value: regions.filter(
        (r) =>
          r.risk?.toLowerCase() === risk.toLowerCase()
      ).length
    })
  );

  const riskColors = {
    Severe: "#ef4444",
    High: "#f59e0b",
    Moderate: "#eab308"
  };

  const comparisonData = regions.map((r) => ({
    name: r.name,
    temp: Number(r.temp),
    heat: Number(r.heat)
  }));

  return (
    <>
      <section className="panel">
        <div className="panel-head">
          <div>
            <span className="section-kicker">
              POSTGRESQL WEATHER HISTORY
            </span>
            <h2>Historical Weather Analytics</h2>
            <p className="panel-subtitle">
              Explore recorded weather observations and
              compare regional heatwave conditions.
            </p>
          </div>
        </div>

        <div className="stake-toolbar">
          <div>
            <strong>Filter by Region</strong>
          </div>

          <select
            value={selectedRegion}
            onChange={(e) =>
              setSelectedRegion(e.target.value)
            }
            className="outline-btn"
          >
            <option value="All">All Regions</option>

            {regionNames.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </div>

        {loadingHistory && (
          <p>Loading historical records...</p>
        )}

        {historyError && (
          <p>{historyError}</p>
        )}

        {!loadingHistory && !historyError && (
          <div className="factor-grid">
            <Factor
              icon="📊"
              title="Recorded Observations"
              value={String(filteredReadings.length)}
              note="Database records"
            />

            <Factor
              icon="🌡️"
              title="Maximum Temperature"
              value={
                maximumTemperature === "N/A"
                  ? "N/A"
                  : `${maximumTemperature}°C`
              }
              note="Recorded maximum"
            />

            <Factor
              icon="🔥"
              title="Average Heat Index"
              value={
                averageHeatIndex === "N/A"
                  ? "N/A"
                  : `${averageHeatIndex}°C`
              }
              note="Recorded average"
            />

            <Factor
              icon="📍"
              title="Regions in History"
              value={String(regionNames.length)}
              note="Available regions"
            />
          </div>
        )}
      </section>

      {!loadingHistory && !historyError && (
        <section className="analytics-grid">
          <div className="panel wide">
            <div className="panel-head">
              <div>
                <span className="section-kicker">
                  RECORDED WEATHER OBSERVATIONS
                </span>
                <h2>Temperature & Heat Index Trend</h2>
              </div>
            </div>

            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={310}>
                <LineChart data={chartData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                  />

                  <XAxis
                    dataKey="time"
                    minTickGap={25}
                  />

                  <YAxis domain={["auto", "auto"]} />

                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) {
                        return null;
                      }

                      const point = payload[0].payload;

                      return (
                        <div
                          style={{
                            background: "#1e293b",
                            color: "#fff",
                            padding: 12,
                            borderRadius: 8
                          }}
                        >
                          <strong>{point.region}</strong>
                          <p>{point.station}</p>
                          <p>{point.time}</p>
                          <p>
                            Temperature: {point.temperature}°C
                          </p>
                          <p>
                            Heat Index: {point.heatIndex}°C
                          </p>
                        </div>
                      );
                    }}
                  />

                  <Line
                    type="monotone"
                    dataKey="temperature"
                    name="Temperature"
                    stroke="#ff7a2f"
                    strokeWidth={3}
                    connectNulls={false}
                  />

                  <Line
                    type="monotone"
                    dataKey="heatIndex"
                    name="Heat Index"
                    stroke="#ef4444"
                    strokeWidth={3}
                    connectNulls={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p>No historical readings available.</p>
            )}
          </div>

          <div className="panel">
            <div className="panel-head">
              <div>
                <span className="section-kicker">
                  CURRENT DATABASE RISK
                </span>
                <h2>Risk Distribution</h2>
              </div>
            </div>

            {regions.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie
                      data={riskCounts.filter(
                        (item) => item.value > 0
                      )}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={65}
                      outerRadius={95}
                      paddingAngle={4}
                    >
                      {riskCounts
                        .filter((item) => item.value > 0)
                        .map((item) => (
                          <Cell
                            key={item.name}
                            fill={riskColors[item.name]}
                          />
                        ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>

                <div className="pie-legend">
                  {riskCounts.map((item) => (
                    <span key={item.name}>
                      <i
                        style={{
                          display: "inline-block",
                          width: 9,
                          height: 9,
                          borderRadius: "50%",
                          background: riskColors[item.name],
                          marginRight: 6
                        }}
                      />
                      {item.name} {item.value}
                    </span>
                  ))}
                </div>
              </>
            ) : (
              <p>No current risk data available.</p>
            )}
          </div>
        </section>
      )}

      <section className="panel">
        <div className="panel-head">
          <div>
            <span className="section-kicker">
              REGIONAL COMPARISON
            </span>
            <h2>Current Temperatures</h2>
          </div>
        </div>

        {comparisonData.length > 0 ? (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={comparisonData}>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
              />

              <XAxis dataKey="name" />

              <YAxis domain={[0, "auto"]} />

              <Tooltip />

              <Bar
                dataKey="temp"
                name="Temperature"
                fill="#ff7a2f"
                radius={[6, 6, 0, 0]}
              />

              <Bar
                dataKey="heat"
                name="Heat Index"
                fill="#ef4444"
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p>No regional comparison data available.</p>
        )}
      </section>
    </>
  );
}

export default App;