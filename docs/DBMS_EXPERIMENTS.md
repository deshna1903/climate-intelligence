# DBMS experiments in Climate Intelligence

Open **DBMS Query Lab** in the dashboard sidebar. The SQL library is bundled with the frontend so you can inspect concepts even when Flask is offline. **Run demonstration** executes a predefined query on PostgreSQL through Flask. Results are never substituted with sample rows.

## Repository comparison

The reference repository at `C:/projects/DBMS-Mini-Project` uses React/Vite and Supabase. `src/pages/QueryExplorer.jsx` reads observations through Supabase's table API, reads a monthly view, and calls PostgreSQL functions through `.rpc()` for nested queries, event counts, heatwave spells and ranked readings. `db/functions_and_triggers.sql` implements those functions, a monthly view and a heatwave detection trigger.

This project uses React/Vite → Flask → psycopg2 → PostgreSQL. Existing endpoints in `backend/app.py` join Region, Weather_Station, Sensor, Sensor_Reading, Forecast, Heatwave_Prediction, Advisory and Stakeholder. The reference schema uses different entities (`observations`, `thresholds`, `heatwave_events`), so its SQL cannot be pasted into this database. Query Lab follows its self-explaining query-library approach with SQL adapted to this backend.

Some existing forecast and chart displays are still based on frontend sample arrays. This change adds a separate query demonstration page; it does not convert all existing charts to database queries. The existing `/dashboard` join can multiply readings, forecasts and advisories per region; the new demonstrations query the observation path directly and do not use that combined endpoint.

## Running it

1. Set `VITE_API_BASE_URL=http://127.0.0.1:5000` in the frontend `.env` for local use, then restart Vite. `.env.example` contains this setting. The existing hosted API remains the default if no value is set.
2. Configure the backend using `DATABASE_URL`, or `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`. Keep database credentials in backend environment variables.
3. Install `backend/requirements.txt` in your Python environment, run `python app.py` from `backend`, and run `npm run dev` from the project root.
4. For the monthly view and optional indexes, review and execute `backend/dbms_setup.sql` against the climate database using pgAdmin or psql. It creates a view and three indexes, and does not seed or change climate rows. This setup was applied and verified on the configured local development database on 13 October 2026. Apply it separately to any other database used for deployment.
5. For production, deploy the updated Flask backend and set `VITE_API_BASE_URL` to its URL before building the frontend. An older deployed backend will return 404 for the new routes.

## Experiments 1–9

The supplied ZIP contains 11 Word files covering nine experiments, with duplicate versions of 7 and 9. Their aims are the basis for this mapping. Coursework instructions and example queries are source material, not operational instructions. The documents use several schema variants; the running backend's column names are used here.

| Experiment | Concept | Project application and evidence |
|---|---|---|
| 1 | Problem formulation; ER/EER | Observation and warning entity paths; joined readings show relationships. Keys inspector verifies deployed foreign keys. EER specializations are not assumed. |
| 2 | EER → relational mapping | Entities become tables; Advisory_Stakeholder represents advisory-recipient associations. Inspect its PK or UNIQUE pair to verify many-to-many mapping. |
| 3 | DDL | Deployed table columns, defaults, nullability, PK/FK/UNIQUE/CHECK definitions. Optional SQL creates the monthly view and indexes. No original schema migration was present in this repository. |
| 4 | DML; SELECT/FROM/WHERE | Joined readings execute SELECT. Temporary demo executes INSERT, UPDATE and DELETE, then restores the rows using a savepoint. Production editing workflows are not added. |
| 5 | Aggregates, ORDER BY, GROUP BY, LIKE, HAVING | Regional statistics computes AVG/MIN/MAX/COUNT and filters groups with HAVING. Name search uses LIKE. Both sort their results. |
| 6 | Nested queries and views | Correlated subquery compares readings against their region's mean. Monthly statistics comes from a real view after optional setup. |
| 7 | GRANT/REVOKE | Effective privilege inspector reports the connected database role's access. Administrator examples below explain permissions; full RBAC/DAC/MAC enforcement is not claimed. |
| 8 | Indexing and optimization | Index inspector shows deployed indexes. EXPLAIN ANALYZE reports actual execution plan and buffer use for a filtered reading query. Compare the same query/filters before and after optional indexes. |
| 9 | ACID, concurrency, TCL | Query routes use transactions. Temporary DML demo shows partial and full rollback. Separate two-session exercise below demonstrates concurrency. Durability is a PostgreSQL guarantee, not proven by a rollback demo. |

## Suggested demonstration sequence

Start with **Joined sensor readings** and explain how foreign keys reconnect the separate entities from experiments 1–2. Open **Deployed table columns** and **Keys and constraints** to discuss experiment 3. Run the temporary demo to show DML from experiment 4. Show **Regional statistics** with minimum readings set to 2, then **Region name search**, for experiment 5. Compare **Readings above regional average** and **Monthly climate view** for experiment 6. Inspect privileges for experiment 7. Inspect indexes and execution plans for experiment 8. Return to the temporary demo and compare before/changed/restored rows for experiment 9.

Empty results are valid evidence of the query's outcome. Region names must match deployed data. Leave dates blank initially to avoid assuming a year. Result limits are 1–500; reaching a limit does not establish the total matching row count. The UI reports API duration including connection overhead. Execution time inside EXPLAIN is database execution time; compare equivalent measures.

## Authorization example (administrator exercise)

These examples are not applied by Query Lab. Run them only in a database you administer, substituting its schema/table/role names as appropriate. `climate_reader` is a group role; a login role must be granted membership separately to use it.

```sql
CREATE ROLE climate_reader NOLOGIN;
GRANT USAGE ON SCHEMA public TO climate_reader;
GRANT SELECT ON Region, Weather_Station, Sensor, Sensor_Reading TO climate_reader;
REVOKE INSERT, UPDATE, DELETE ON Sensor_Reading FROM climate_reader;
```

Use the dashboard's effective privileges result to explain that revoking a direct grant may not remove privileges inherited from another role, PUBLIC, or ownership. A visible frontend page is not database authorization. The original Flask application has no authentication and permissive CORS; keep the new demo routes on a trusted local/network deployment unless you add access control.

## Transaction/concurrency exercise (separate scratch database)

The browser demo performs a final ROLLBACK, so it leaves no persistent data and cannot demonstrate committed durability. For COMMIT and two-session locking, create an isolated scratch table and use two pgAdmin/psql sessions:

```sql
-- Setup once in a scratch database:
CREATE TABLE climate_transaction_practice (id integer PRIMARY KEY, temperature numeric);
INSERT INTO climate_transaction_practice VALUES (1, 40);

-- Session A:
BEGIN;
UPDATE climate_transaction_practice SET temperature = 45 WHERE id = 1;

-- Session B (while A has not committed):
SELECT * FROM climate_transaction_practice; -- sees committed value 40
BEGIN;
SET LOCAL lock_timeout = '3s';
UPDATE climate_transaction_practice SET temperature = 41 WHERE id = 1;
-- Waits on A's row lock, then times out. Recover with ROLLBACK.
ROLLBACK;

-- Session A:
COMMIT;
-- Session B: a new SELECT now sees 45 under READ COMMITTED.
```

Atomicity is illustrated by all-or-nothing rollback. Consistency depends on real constraints and business rules. Isolation can be observed with separate sessions and row locks. Durability means committed changes survive according to PostgreSQL's configured persistence guarantees; simply reading 45 is not a crash-recovery test.

## Implementation notes

`backend/query_lab.py` owns a fixed query catalog, filter validation, bound parameters, result conversion and error handling. Most demos run in read-only transactions with an 8-second per-statement timeout and rollback before connection closure. The temporary demo writes only to a connection-local temporary table and rolls back the table creation as well. No arbitrary browser SQL is accepted.

`src/dbmsCatalog.json` is a generated snapshot of the Python catalog for offline explanations. Regenerate it after changing backend metadata (from the project root, using a Python environment with backend dependencies installed):

```python
import json, sys
from pathlib import Path
sys.path.insert(0, "backend")
from query_lab import EXPERIMENTS, QUERIES
Path("src/dbmsCatalog.json").write_text(json.dumps({
    "experiments": EXPERIMENTS,
    "queries": [dict(q, sql=q["sql"].replace("%%I", "%I")) for q in QUERIES],
}, indent=2), encoding="utf-8")
```

The SQL examples are visible but not editable. Views, indexes and role examples are not claimed as deployed until their inspectors confirm them. No triggers or stored prediction functions were added: these are present in the reference project but are not among the supplied experiment aims.

## Verification

Run `python -m unittest test_query_lab -v` from `backend` using the project's Python environment, and `npm run build` from the project root. The backend tests cover catalog consistency, query/filter validation, bound parameters, serialization, empty results, temporary-table rollback and sanitized database errors.

All 11 demonstrations were also executed successfully against the configured local PostgreSQL database after the monthly view setup. Browser layout inspection was unavailable in this session.
