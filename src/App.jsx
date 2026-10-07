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
const [loading, setLoading] = useState(true);
const [error, setError] = useState("");

useEffect(() => {
  fetch("http://127.0.0.1:5000/dashboard")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to fetch dashboard data");
      }
      return response.json();
    })
    .then((data) => {
      setDashboardData(data);
      setLoading(false);
    })
    .catch((err) => {
      console.error(err);
      setError("Could not connect to Flask backend");
      setLoading(false);
    });
}, []);

console.log("Dashboard data:", dashboardData);

const liveRegions = dashboardData.map((item, index) => ({
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
  probability: item.probability
}));

useEffect(() => {
  if (liveRegions.length > 0 && !selected) {
    setSelected(liveRegions[0]);
  }
}, [liveRegions, selected]);



  const filteredRegions = useMemo(() =>
  liveRegions.filter(r =>
    r.name.toLowerCase().includes(search.toLowerCase())
  ), [liveRegions, search]);

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
          {page === "Live Weather" && <LiveWeather selected={selected} setSelected={setSelected} />}
          {page === "Regions & Stations" && <Regions regions={filteredRegions} selected={selected} setSelected={setSelected} />}
          {page === "Forecast" && <Forecast />}
          {page === "AI Prediction" && <Prediction selected={selected} />}
          {page === "Alerts & Advisories" && <Alerts />}
          {page === "Stakeholders" && <Stakeholders />}
          {page === "Historical Analytics" && <Analytics />}
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
        <div className="panel-head"><div><span className="section-kicker">CURRENT HEATWAVE STATUS</span><h2>{selected.name} <span className={"risk-pill " + riskClass(selected.risk)}>{selected.risk}</span></h2></div><button className="select-btn"><Navigation size={15}/> {selected.station} <ChevronDown size={15}/></button></div>
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

      <section className="panel risk-panel">
        <div className="panel-head"><div><span className="section-kicker">REGION RISK MAP</span><h2>Heatwave Monitor</h2></div><span className="live-tag">● LIVE</span></div>
        <div className="fake-map">
          <div className="map-shape"></div>
          {regions.map((r,i) => <button key={r.id} className={"map-pin p"+i+" "+riskClass(r.risk)} onClick={() => setSelected(r)} title={r.name}><span></span><b>{r.name}</b></button>)}
          <div className="map-caption"><Globe2 size={15}/> Maharashtra • 5 monitored regions</div>
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

function LiveWeather({selected,setSelected}) {
  return <><div className="region-tabs">{regions.map(r=><button className={selected.id===r.id?"selected":""} onClick={()=>setSelected(r)} key={r.id}>{r.name}</button>)}</div><div className="weather-detail"><section className="panel current-card"><div className="sun-large"><Sun size={54}/></div><span>Current conditions</span><strong>{selected.temp}°C</strong><b>Heat Index {selected.heat}°C</b><em className={"risk-pill "+riskClass(selected.risk)}>{selected.risk} Risk</em></section><section className="panel weather-metrics"><h2>Atmospheric conditions</h2><div className="metric-grid"><Metric icon={Droplets} name="Humidity" val={selected.humidity+"%"}/><Metric icon={Wind} name="Wind Speed" val={selected.wind+" km/h"}/><Metric icon={Gauge} name="Pressure" val={selected.pressure + " hPa"}/>
<Metric icon={CloudSun} name="Cloud Cover" val={selected.cloudCover + "%"}/>
<Metric icon={Navigation} name="Wind Direction" val={selected.windDirection}/><Metric icon={Activity} name="Station Status" val="Active"/></div></section></div><section className="panel"><div className="panel-head"><div><span className="section-kicker">LIVE SENSOR DATA</span><h2>Temperature & Heat Index</h2></div></div><ResponsiveContainer width="100%" height={300}><LineChart data={hourly}><CartesianGrid strokeDasharray="3 3"/><XAxis dataKey="time"/><YAxis/><Tooltip/><Line dataKey="temp" name="Temperature" stroke="#ff7a2f" strokeWidth={3}/><Line dataKey="heat" name="Heat Index" stroke="#ef4444" strokeWidth={3}/></LineChart></ResponsiveContainer></section></>;
}
function Metric({icon:Icon,name,val}) { return <div className="metric"><div><Icon size={19}/></div><span>{name}</span><strong>{val}</strong></div> }

function Regions({regions:rs,selected,setSelected}) {
  return <section className="panel table-panel"><div className="panel-head"><div><span className="section-kicker">MONITORING NETWORK</span><h2>Regions & Weather Stations</h2></div><span className="count-pill">{rs.length} regions</span></div><div className="table-scroll"><table><thead><tr><th>Region</th><th>Weather Station</th><th>Temperature</th><th>Heat Index</th><th>Risk</th><th>Probability</th><th>Status</th></tr></thead><tbody>{rs.map(r=><tr key={r.id} onClick={()=>setSelected(r)}><td><strong>{r.name}</strong><small>Maharashtra</small></td><td>{r.station}</td><td><b>{r.temp}°C</b></td><td>{r.heat}°C</td><td><span className={"risk-pill "+riskClass(r.risk)}>{r.risk}</span></td><td>{r.probability}%</td><td><span className="status"><i></i> Active</span></td></tr>)}</tbody></table></div></section>
}

function Forecast() {
 return <><div className="forecast-cards">{forecast.map(f=><div className="forecast-card" key={f.day}><span>{f.day}</span><Sun size={28}/><strong>{f.temp}°C</strong><small>Feels {f.heat}°C</small><em className={"risk-pill "+riskClass(f.risk)}>{f.risk}</em></div>)}</div><section className="panel"><div className="panel-head"><div><span className="section-kicker">5-DAY OUTLOOK</span><h2>Temperature Forecast</h2></div></div><ResponsiveContainer width="100%" height={330}><AreaChart data={forecast}><defs><linearGradient id="fc" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#ff7a2f" stopOpacity=".25"/><stop offset="100%" stopColor="#ff7a2f" stopOpacity="0"/></linearGradient></defs><CartesianGrid strokeDasharray="3 3" vertical={false}/><XAxis dataKey="day"/><YAxis domain={[30,50]}/><Tooltip/><Area type="monotone" dataKey="temp" stroke="#ff7a2f" fill="url(#fc)" strokeWidth={3}/><Line type="monotone" dataKey="heat" stroke="#ef4444" strokeWidth={3}/></AreaChart></ResponsiveContainer></section></>;
}

function Prediction({selected}) {
 return <div className="prediction-page"><section className="panel prediction-hero"><div><span className="section-kicker">AI HEATWAVE PREDICTION • MODEL v1.0</span><h2>{selected.name} Heatwave Risk</h2><p>Prediction generated from weather and forecast conditions.</p></div><div className="big-prob"><strong>{selected.probability}%</strong><span>Heatwave Probability</span><em className={"risk-pill "+riskClass(selected.risk)}>{selected.risk} Risk</em></div></section><div className="factor-grid"><Factor icon="🌡️" title="Temperature" value={selected.temp+"°C"} note="Elevated" /><Factor icon="💧" title="Humidity" value={selected.humidity+"%"} note="Low" /><Factor icon="🌬️" title="Wind Speed" value={selected.wind+" km/h"} note="Low" /><Factor icon="🔥" title="Heat Index" value={selected.heat+"°C"} note="Elevated" /></div><section className="panel"><div className="panel-head"><div><span className="section-kicker">INTERPRETATION</span><h2>Why is the risk elevated?</h2></div></div><div className="reason-list"><div>🌡️ <span><strong>High temperature</strong><small>Temperature is above the project's high-risk threshold.</small></span></div><div>💧 <span><strong>Low humidity</strong><small>Dry atmospheric conditions are contributing to heat stress.</small></span></div><div>📈 <span><strong>Forecast conditions</strong><small>Forecasted heat index remains elevated.</small></span></div></div></section></div>
}
function Factor({icon,title,value,note}) {return <div className="factor-card"><span>{icon}</span><small>{title}</small><strong>{value}</strong><em>{note}</em></div>}

function Alerts() { return <section className="alerts-page">{alerts.map(a=><div className={"panel alert-card "+riskClass(a.level)} key={a.region}><div className={"alert-icon "+riskClass(a.level)}><AlertTriangle size={21}/></div><div className="alert-content"><div><span className={"risk-pill "+riskClass(a.level)}>{a.level} Alert</span><h2>{a.region}</h2></div><p>{a.text}</p><div className="alert-meta"><span>Issued {a.time}</span><span>👥 {a.recipients} stakeholder{a.recipients!==1?"s":""}</span><span>● Sent</span></div></div><button className="outline-btn">View details</button></div>)}</section> }

function Stakeholders() {
  const [filter, setFilter] = useState("");
  const [sent, setSent] = useState({});
  const list = stakeholders.filter(s => `${s.name} ${s.org} ${s.region}`.toLowerCase().includes(filter.toLowerCase()));
  return <section className="panel table-panel">
    <div className="panel-head">
      <div><span className="section-kicker">ALERT NETWORK</span><h2>Stakeholders</h2><p className="panel-subtitle">People and organizations who receive heatwave advisories.</p></div>
      <span className="count-pill">{stakeholders.length} registered</span>
    </div>
    <div className="stake-toolbar"><div className="stake-search"><Search size={15}/><input value={filter} onChange={e=>setFilter(e.target.value)} placeholder="Search stakeholder, organization or region..." /></div><span className="count-pill">{list.length} shown</span></div>
    <div className="stake-grid">
      {list.map(s=>{ const isSent = sent[s.name] || s.status === "Sent"; return <div className="stake-card" key={s.name}>
        <div className="person-avatar">{s.name.split(" ").map(x=>x[0]).slice(0,2).join("")}</div>
        <div><strong>{s.name}</strong><span>{s.org}</span><small>📍 {s.region}</small></div>
        <div className="stake-actions"><em className={isSent ? "stake-sent" : "stake-pending"}><i></i>{isSent ? "Sent" : "Pending"}</em><button className="small-action" onClick={()=>setSent({...sent,[s.name]:true})}>{isSent ? "Resend" : "Notify"}</button></div>
      </div>})}
    </div>
    {list.length === 0 && <div className="empty-state"><Users size={28}/><strong>No stakeholders found</strong><span>Try a different name, organization or region.</span></div>}
  </section>
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

function Analytics() { return <><section className="analytics-grid"><div className="panel wide"><div className="panel-head"><div><span className="section-kicker">7-DAY TREND</span><h2>Regional Temperature</h2></div></div><ResponsiveContainer width="100%" height={310}><LineChart data={history}><CartesianGrid strokeDasharray="3 3" vertical={false}/><XAxis dataKey="day"/><YAxis domain={[30,48]}/><Tooltip/><Line dataKey="Pune" stroke="#ff7a2f" strokeWidth={3}/><Line dataKey="Mumbai" stroke="#2784ff" strokeWidth={3}/><Line dataKey="Nagpur" stroke="#8b5cf6" strokeWidth={3}/></LineChart></ResponsiveContainer></div><div className="panel"><div className="panel-head"><div><span className="section-kicker">RISK DISTRIBUTION</span><h2>Current Risk</h2></div></div><ResponsiveContainer width="100%" height={260}><PieChart><Pie data={[{name:"Severe",value:2},{name:"High",value:2},{name:"Moderate",value:1}]} dataKey="value" innerRadius={65} outerRadius={95} paddingAngle={4}>{[0,1,2].map((x,i)=><Cell key={i} fill={["#ef4444","#f59e0b","#eab308"][i]}/>)}</Pie><Tooltip/></PieChart></ResponsiveContainer><div className="pie-legend"><span><i className="red"></i>Severe 2</span><span><i className="orange"></i>High 2</span><span><i className="yellow"></i>Moderate 1</span></div></div></section><section className="panel"><div className="panel-head"><div><span className="section-kicker">REGIONAL COMPARISON</span><h2>Current Temperatures</h2></div></div><ResponsiveContainer width="100%" height={280}><BarChart data={regions}><CartesianGrid strokeDasharray="3 3" vertical={false}/><XAxis dataKey="name"/><YAxis domain={[0,50]}/><Tooltip/><Bar dataKey="temp" fill="#ff7a2f" radius={[6,6,0,0]}/><Bar dataKey="heat" fill="#ef4444" radius={[6,6,0,0]}/></BarChart></ResponsiveContainer></section></> }

export default App;