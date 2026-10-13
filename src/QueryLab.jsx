import React, { useEffect, useRef, useState } from "react";
import { BookOpen, Database, Play, Terminal, Download, AlertTriangle } from "lucide-react";
import { API_BASE } from "./api";
import catalog from "./dbmsCatalog.json";

function cellValue(value) {
  if (value === null || value === undefined) return "NULL";
  if (typeof value === "object") return JSON.stringify(value, null, 2);
  return String(value);
}

export default function QueryLab() {
  const [queryId, setQueryId] = useState("readings");
  const [filters, setFilters] = useState({ region: "", start: "", end: "", search: "", minimum: "1", limit: "100" });
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState("");
  const pending = useRef(null);
  const query = catalog.queries.find(item => item.id === queryId);
  const shows = name => query.filters.includes(name);

  useEffect(() => () => pending.current?.abort(), []);

  function selectQuery(id) {
    pending.current?.abort();
    pending.current = null;
    setQueryId(id); setResult(null); setError(""); setBusy(false);
  }

  function update(name, value) { setFilters(previous => ({ ...previous, [name]: value })); }

  async function run(event) {
    event.preventDefault();
    if (shows("dates") && filters.start && filters.end && filters.start > filters.end) {
      setError("Start date must be on or before end date."); return;
    }
    pending.current?.abort();
    const controller = new AbortController();
    pending.current = controller;
    setBusy(true); setError(""); setResult(null);
    const params = new URLSearchParams({ limit: query.id === "transaction" ? "100" : filters.limit });
    if (shows("region") && filters.region.trim()) params.set("region", filters.region.trim());
    if (shows("dates")) {
      if (filters.start) params.set("start", filters.start);
      if (filters.end) params.set("end", filters.end);
    }
    if (shows("minimum")) params.set("minimum", filters.minimum);
    if (shows("search")) params.set("search", filters.search);
    try {
      const response = await fetch(`${API_BASE}/dbms/queries/${query.id}?${params}`, { method: query.method, signal: controller.signal });
      const data = await response.json().catch(() => null);
      if (!response.ok) throw new Error(data?.error || `Query API returned ${response.status}. Deploy the updated Flask backend and check VITE_API_BASE_URL.`);
      if (!data || !Array.isArray(data.rows) || !Array.isArray(data.columns)) throw new Error("The query API returned an invalid result.");
      if (pending.current === controller) { setResult(data); setSubmitted(params.toString()); }
    } catch (err) {
      if (err.name !== "AbortError" && pending.current === controller) setError(err.message === "Failed to fetch" ? "Cannot reach the query API. Start or deploy the updated Flask backend and check VITE_API_BASE_URL." : err.message);
    } finally {
      if (pending.current === controller) setBusy(false);
    }
  }

  function exportCsv() {
    const escape = value => {
      const text = cellValue(value);
      // Prevent spreadsheet applications treating exported text as a formula.
      const safe = /^[=+\-@\t\r]/.test(text) ? "'" + text : text;
      return '"' + safe.replaceAll('"', '""') + '"';
    };
    const lines = [result.columns.map(escape).join(","), ...result.rows.map(row => result.columns.map(column => escape(row[column])).join(","))];
    const url = URL.createObjectURL(new Blob([lines.join("\r\n")], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a"); link.href = url; link.download = `climate-${queryId}.csv`; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return <div className="query-lab">
    <section className="panel lab-intro">
      <div className="lab-intro-icon"><Database size={25}/></div>
      <div><span className="section-kicker">FROM EXPERIMENT TO APPLICATION</span><h2>See the database behind the dashboard</h2><p>Choose a demonstration, inspect its SQL and run it against PostgreSQL. Each demonstration links to your DBMS experiments.</p></div>
      <span className="lab-chip">9 experiments</span>
    </section>
    <div className="lab-workspace">
      <section className="panel lab-picker" aria-label="Query demonstrations">
        <h2><Terminal size={17}/> Query library</h2>
        {catalog.queries.map(item => <button key={item.id} className={`lab-query ${queryId === item.id ? "selected" : ""}`} onClick={() => selectQuery(item.id)} aria-pressed={queryId === item.id}><strong>{item.title}</strong><span>{item.concepts}</span><small>Experiment {item.experiments.join(", ")}</small></button>)}
      </section>
      <div className="lab-detail">
        <section className="panel">
          <div className="lab-title"><div><span className="section-kicker">EXPERIMENT {query.experiments.join(" / ")}</span><h2>{query.title}</h2></div><span className="lab-chip">{query.method === "POST" ? "Temporary-table demo" : "Read-only query"}</span></div>
          <p className="lab-description">{query.description}</p>
          <div className="lab-tags">{query.concepts.split(" · ").map(tag => <span key={tag}>{tag}</span>)}</div>
          <details className="lab-sql" open><summary>SQL executed by Flask</summary><pre><code>{query.sql}</code></pre><p>Named placeholders are bound by psycopg2; filter values are sent separately from SQL.</p></details>
          <form className="lab-filters" onSubmit={run}>
            {shows("region") && <label>Region name<input value={filters.region} maxLength={200} onChange={e => update("region", e.target.value)} placeholder="All regions (e.g. Pune)"/></label>}
            {shows("dates") && <><label>From date<input type="date" value={filters.start} onChange={e => update("start", e.target.value)}/></label><label>To date<input type="date" value={filters.end} onChange={e => update("end", e.target.value)}/></label></>}
            {shows("search") && <label>Region contains<input value={filters.search} maxLength={200} onChange={e => update("search", e.target.value)} placeholder="e.g. pu"/></label>}
            {shows("minimum") && <label>Minimum readings<input type="number" min="1" max="1000000" required value={filters.minimum} onChange={e => update("minimum", e.target.value)}/></label>}
            {query.id !== "transaction" && <label>Maximum rows<input type="number" min="1" max="500" required value={filters.limit} onChange={e => update("limit", e.target.value)}/></label>}
            <button className="lab-run" type="submit" disabled={busy}><Play size={15}/>{busy ? "Running…" : "Run demonstration"}</button>
          </form>
          {error && <div className="lab-error" role="alert"><AlertTriangle size={18}/><span>{error}</span></div>}
        </section>
        <section className="panel lab-results" aria-live="polite" aria-busy={busy}>
          <div className="lab-title"><h2>Query results</h2>{result && <button className="small-action" onClick={exportCsv}><Download size={13}/> Export CSV</button>}</div>
          {!result && <div className="lab-empty"><Database size={28}/><strong>{busy ? "Waiting for PostgreSQL…" : "Ready to explore"}</strong><p>Results appear here after you run a demonstration. No sample rows are shown.</p></div>}
          {result && <><div className="lab-result-meta"><span>{result.row_count} returned rows</span><span>{result.elapsed_ms} ms including connection</span><span>{result.source}</span></div><p className="lab-bound">Executed filters: {decodeURIComponent(submitted).replaceAll("&", " · ")}. {result.at_limit && "Row limit reached; more matches may exist."}</p>
            {result.rows.length ? <div className="lab-table-wrap"><table><thead><tr>{result.columns.map(column => <th key={column}>{column.replaceAll("_", " ")}</th>)}</tr></thead><tbody>{result.rows.map((row, index) => <tr key={index}>{result.columns.map(column => <td key={column}>{typeof row[column] === "object" && row[column] !== null ? <pre>{cellValue(row[column])}</pre> : cellValue(row[column])}</td>)}</tr>)}</tbody></table></div> : <p className="lab-description">No matching rows. Try broader filters or check whether the database contains data.</p>}
            <p className="lab-bound">{result.transaction}</p></>}
        </section>
      </div>
    </div>
    <section className="panel"><div className="lab-title"><h2><BookOpen size={18}/> Your experiments in this project</h2><span className="lab-chip">Viva walkthrough</span></div><div className="lab-experiments">{catalog.experiments.map(experiment => <article key={experiment.number}><span className="lab-number">{String(experiment.number).padStart(2, "0")}</span><div><h3>{experiment.title}</h3><p>{experiment.application}</p><p className="lab-evidence"><strong>How to demonstrate:</strong> {experiment.evidence}</p></div></article>)}</div></section>
  </div>;
}
