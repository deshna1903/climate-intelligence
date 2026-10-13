"""Predefined DBMS demonstrations adapted to the existing climate schema."""
from datetime import date, datetime
from decimal import Decimal
from time import perf_counter

import psycopg2
from flask import Blueprint, current_app, jsonify, request
from psycopg2.extras import RealDictCursor
from database import get_connection

query_lab = Blueprint("query_lab", __name__, url_prefix="/dbms")

EXPERIMENTS = [
    {"number": 1, "title": "ER / EER design", "application": "Region → Weather_Station → Sensor → Sensor_Reading represents the observation path. Forecast → Heatwave_Prediction → Advisory represents the warning path. Advisory_Stakeholder connects advisories and recipients as a many-to-many relationship.", "evidence": "Explore joined readings and inspect foreign keys. EER specializations are not verified by these queries."},
    {"number": 2, "title": "Mapping EER to relations", "application": "Entities become separate tables; foreign keys connect them. Advisory_Stakeholder stores the advisory-recipient relationship.", "evidence": "The constraint inspector reports actual primary, foreign and unique keys; verify a composite or unique pair on the bridge table."},
    {"number": 3, "title": "DDL and constraints", "application": "Tables, primary keys, foreign keys and CHECK constraints define the database structure and valid values.", "evidence": "Inspect deployed column definitions and constraints. The repository has no original schema migration, so constraints are reported from PostgreSQL rather than assumed."},
    {"number": 4, "title": "DML and SQL retrieval", "application": "Existing Flask endpoints SELECT climate records. The temporary-table demo runs INSERT, UPDATE, SELECT and DELETE without changing climate records.", "evidence": "Run joined readings or the DML / transaction demo. Production insert/update/delete workflows are not implemented."},
    {"number": 5, "title": "Aggregates, ORDER BY, GROUP BY, LIKE and HAVING", "application": "Summarize temperature by region, retain groups with enough readings, sort hottest regions first and search region names.", "evidence": "Run Regional statistics and Region name search; their SQL and returned rows demonstrate each clause."},
    {"number": 6, "title": "Nested queries and views", "application": "A nested AVG query finds readings above the regional average. A reusable monthly view summarizes readings for historical analytics.", "evidence": "The subquery runs on existing tables. Monthly view requires backend/dbms_setup.sql; missing setup produces an explicit error."},
    {"number": 7, "title": "Authorization: GRANT and REVOKE", "application": "Database privileges determine what the backend connection can read or modify.", "evidence": "Inspect effective table privileges for the connected role. GRANT/REVOKE examples are documented for an administrator; the browser does not change roles or permissions. RBAC/DAC/MAC are not claimed as fully implemented."},
    {"number": 8, "title": "Indexing and query optimization", "application": "Indexes can accelerate sensor/date filters and foreign-key joins. PostgreSQL chooses the plan based on table size and selectivity.", "evidence": "Inspect existing indexes and run EXPLAIN ANALYZE on the joined-readings query. Optional indexes are in backend/dbms_setup.sql. A small table may still use a sequential scan."},
    {"number": 9, "title": "ACID, concurrency and TCL", "application": "Read demonstrations use read-only transactions. The temporary-table demo uses BEGIN, SAVEPOINT, ROLLBACK TO SAVEPOINT and final ROLLBACK.", "evidence": "Live before/after rows verify rollback and savepoint behavior. COMMIT durability and simultaneous-session concurrency require the separate walkthrough in docs/DBMS_EXPERIMENTS.md."},
]

READINGS_SQL = """SELECT sr.Reading_ID, sr.Reading_Time, sr.Temperature, sr.Humidity,
       sr.Heat_Index, ws.Station_Name, r.Region_Name
FROM Sensor_Reading sr
JOIN Sensor s ON sr.Sensor_ID = s.Sensor_ID
JOIN Weather_Station ws ON s.Station_ID = ws.Station_ID
JOIN Region r ON ws.Region_ID = r.Region_ID
WHERE (%(region)s IS NULL OR r.Region_Name = %(region)s)
  AND (%(start)s IS NULL OR sr.Reading_Time >= %(start)s::date)
  AND (%(end)s IS NULL OR sr.Reading_Time < %(end)s::date + INTERVAL '1 day')
ORDER BY sr.Reading_Time DESC, sr.Reading_ID DESC
LIMIT %(limit)s"""


def definition(query_id, title, concepts, experiments, description, sql, filters=()):
    return {"id": query_id, "title": title, "concepts": concepts,
            "experiments": experiments, "description": description,
            "sql": sql, "filters": list(filters), "method": "GET"}


QUERIES = [
    definition("readings", "Joined sensor readings", "SELECT · JOIN · WHERE · ORDER BY", [1, 2, 4],
               "Trace a reading through its sensor, station and region. Dates are inclusive; results are bounded.", READINGS_SQL, ["region", "dates"]),
    definition("statistics", "Regional statistics", "AVG · MIN · MAX · COUNT · GROUP BY · HAVING", [5],
               "Summarize observed temperature and filter regions by minimum reading count.", """SELECT r.Region_Name, COUNT(*) AS reading_count,
       ROUND(AVG(sr.Temperature)::numeric, 2) AS avg_temperature,
       MIN(sr.Temperature) AS min_temperature, MAX(sr.Temperature) AS peak_temperature
FROM Region r JOIN Weather_Station ws ON ws.Region_ID = r.Region_ID
JOIN Sensor s ON s.Station_ID = ws.Station_ID
JOIN Sensor_Reading sr ON sr.Sensor_ID = s.Sensor_ID
WHERE (%(region)s IS NULL OR r.Region_Name = %(region)s)
GROUP BY r.Region_ID, r.Region_Name
HAVING COUNT(*) >= %(minimum)s
ORDER BY peak_temperature DESC NULLS LAST, r.Region_Name
LIMIT %(limit)s""", ["region", "minimum"]),
    definition("search", "Region name search", "LIKE · ORDER BY", [4, 5],
               "Search using SQL LIKE. Percent and underscore in the search text act as SQL wildcards.", """SELECT Region_ID, Region_Name, State, Climate_Zone, Population
FROM Region WHERE LOWER(Region_Name) LIKE LOWER(%(pattern)s)
ORDER BY Region_Name LIMIT %(limit)s""", ["search"]),
    definition("above-average", "Readings above regional average", "CORRELATED SUBQUERY · AVG", [6],
               "Compare each reading with the average across all sensors in its own region.", """SELECT r.Region_Name, ws.Station_Name, sr.Reading_Time, sr.Temperature
FROM Sensor_Reading sr JOIN Sensor s ON s.Sensor_ID = sr.Sensor_ID
JOIN Weather_Station ws ON ws.Station_ID = s.Station_ID
JOIN Region r ON r.Region_ID = ws.Region_ID
WHERE (%(region)s IS NULL OR r.Region_Name = %(region)s)
  AND sr.Temperature > (
    SELECT AVG(sr2.Temperature) FROM Sensor_Reading sr2
    JOIN Sensor s2 ON s2.Sensor_ID = sr2.Sensor_ID
    JOIN Weather_Station ws2 ON ws2.Station_ID = s2.Station_ID
    WHERE ws2.Region_ID = r.Region_ID)
ORDER BY sr.Temperature DESC, sr.Reading_ID LIMIT %(limit)s""", ["region"]),
    definition("monthly", "Monthly climate view", "VIEW · GROUP BY", [3, 5, 6],
               "Read a deployed SQL view. Install backend/dbms_setup.sql first if the view is missing.", """SELECT * FROM climate_lab_monthly_stats
WHERE (%(region)s IS NULL OR region_name = %(region)s)
ORDER BY month DESC, region_name LIMIT %(limit)s""", ["region"]),
    definition("columns", "Deployed table columns", "DDL · DATA TYPES · NOT NULL", [2, 3],
               "Inspect actual column types, defaults and nullability in the public schema.", """SELECT table_name, column_name, data_type, is_nullable, column_default
FROM information_schema.columns WHERE table_schema = 'public'
ORDER BY table_name, ordinal_position LIMIT %(limit)s"""),
    definition("constraints", "Keys and constraints", "PRIMARY KEY · FOREIGN KEY · UNIQUE · CHECK", [1, 2, 3],
               "Read the deployed constraint definitions, including the advisory-recipient relationship.", """SELECT c.relname AS table_name, con.conname AS constraint_name,
       pg_get_constraintdef(con.oid) AS definition
FROM pg_constraint con JOIN pg_class c ON c.oid = con.conrelid
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public' ORDER BY c.relname, con.conname LIMIT %(limit)s"""),
    definition("privileges", "Effective database privileges", "GRANT · REVOKE · ACCESS CONTROL", [7],
               "Show the current backend database role and its effective privileges. This checks access; it does not grant or revoke it.", """SELECT current_user AS database_role, tablename,
       has_table_privilege(current_user, format('%I.%I', schemaname, tablename), 'SELECT') AS can_select,
       has_table_privilege(current_user, format('%I.%I', schemaname, tablename), 'INSERT') AS can_insert,
       has_table_privilege(current_user, format('%I.%I', schemaname, tablename), 'UPDATE') AS can_update,
       has_table_privilege(current_user, format('%I.%I', schemaname, tablename), 'DELETE') AS can_delete
FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename LIMIT %(limit)s""".replace("%I", "%%I")),
    definition("indexes", "Deployed indexes", "CREATE INDEX · INDEX INSPECTION", [8],
               "Inspect existing index definitions. Index presence alone does not prove a speed improvement.", """SELECT tablename, indexname, indexdef FROM pg_indexes
WHERE schemaname = 'public' ORDER BY tablename, indexname LIMIT %(limit)s"""),
    definition("plan", "Reading query execution plan", "EXPLAIN ANALYZE · BUFFERS", [8],
               "Execute the bounded reading SELECT and inspect actual scan/join choices, timing and buffer usage.",
               "EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON)\n" + READINGS_SQL, ["region", "dates"]),
    definition("transaction", "Temporary DML / transaction demo", "INSERT · UPDATE · DELETE · SAVEPOINT · ROLLBACK", [4, 9],
               "Use a connection-local temporary table to show DML and partial rollback. The final rollback removes the entire demo; climate data is untouched.", """BEGIN;
CREATE TEMP TABLE climate_lab_demo (id integer PRIMARY KEY, temperature numeric);
INSERT INTO climate_lab_demo VALUES (1, 40), (2, 42);
SAVEPOINT before_changes;
UPDATE climate_lab_demo SET temperature = 45 WHERE id = 1;
DELETE FROM climate_lab_demo WHERE id = 2;
SELECT * FROM climate_lab_demo ORDER BY id;
ROLLBACK TO SAVEPOINT before_changes;
SELECT * FROM climate_lab_demo ORDER BY id;
ROLLBACK;"""),
]
QUERIES[-1]["method"] = "POST"
QUERY_BY_ID = {q["id"]: q for q in QUERIES}


def json_value(value):
    if isinstance(value, Decimal):
        return float(value)
    if isinstance(value, (datetime, date)):
        return value.isoformat()
    if isinstance(value, dict):
        return {k: json_value(v) for k, v in value.items()}
    if isinstance(value, (list, tuple)):
        return [json_value(v) for v in value]
    return value


def parameters():
    start = request.args.get("start") or None
    end = request.args.get("end") or None
    for value in (start, end):
        if value:
            date.fromisoformat(value)
    if start and end and date.fromisoformat(start) > date.fromisoformat(end):
        raise ValueError("Start date must be on or before end date.")
    limit = int(request.args.get("limit", 100))
    minimum = int(request.args.get("minimum", 1))
    if not 1 <= limit <= 500 or not 1 <= minimum <= 1000000:
        raise ValueError("Limit must be 1–500 and minimum readings 1–1000000.")
    region = request.args.get("region") or None
    search = request.args.get("search", "")
    if len(region or "") > 200 or len(search) > 200:
        raise ValueError("Filter text must be at most 200 characters.")
    return {"region": region, "start": start, "end": end,
            "limit": limit, "minimum": minimum, "pattern": "%" + search + "%"}


@query_lab.get("/catalog")
def catalog():
    # Display PostgreSQL format placeholders literally; execution retains escaping.
    queries = [dict(q, sql=q["sql"].replace("%%I", "%I")) for q in QUERIES]
    return jsonify(experiments=EXPERIMENTS, queries=queries)


@query_lab.route("/queries/<query_id>", methods=["GET", "POST"])
def run_query(query_id):
    query = QUERY_BY_ID.get(query_id)
    if not query:
        return jsonify(error="Unknown demonstration."), 404
    if request.method != query["method"]:
        return jsonify(error="Use " + query["method"] + " for this demonstration."), 405
    try:
        params = parameters()
    except (ValueError, TypeError):
        return jsonify(error="Invalid filters. Use ISO dates, start ≤ end, limit 1–500, minimum 1–1000000, and text up to 200 characters."), 400
    conn = None
    started = perf_counter()
    try:
        conn = get_connection()
        conn.set_session(readonly=query_id != "transaction", autocommit=False)
        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            cursor.execute("SET LOCAL statement_timeout = '8s'")
            if query_id == "transaction":
                cursor.execute("CREATE TEMP TABLE climate_lab_demo (id integer PRIMARY KEY, temperature numeric)")
                cursor.execute("INSERT INTO climate_lab_demo VALUES (1, 40), (2, 42)")
                cursor.execute("SELECT * FROM climate_lab_demo ORDER BY id")
                before = cursor.fetchall()
                cursor.execute("SAVEPOINT before_changes")
                cursor.execute("UPDATE climate_lab_demo SET temperature = 45 WHERE id = 1")
                cursor.execute("DELETE FROM climate_lab_demo WHERE id = 2")
                cursor.execute("SELECT * FROM climate_lab_demo ORDER BY id")
                changed = cursor.fetchall()
                cursor.execute("ROLLBACK TO SAVEPOINT before_changes")
                cursor.execute("SELECT * FROM climate_lab_demo ORDER BY id")
                restored = cursor.fetchall()
                rows = [{"stage": label, **dict(row)} for label, values in
                        [("Before changes", before), ("After UPDATE / DELETE", changed),
                         ("After ROLLBACK TO SAVEPOINT", restored)] for row in values]
            else:
                cursor.execute(query["sql"], params)
                rows = cursor.fetchall()
            columns = list(rows[0]) if rows else [column.name for column in cursor.description]
        conn.rollback()
        return jsonify(query_id=query_id, columns=columns, rows=json_value(rows),
                       row_count=len(rows), elapsed_ms=round((perf_counter() - started) * 1000, 2),
                       limit=params["limit"], at_limit=len(rows) >= params["limit"], source="PostgreSQL",
                       transaction="Rolled back; no persistent changes")
    except psycopg2.Error as error:
        current_app.logger.warning("DBMS query %s failed (%s)", query_id, error.pgcode or "connection")
        if error.pgcode == "42P01" and query_id == "monthly":
            return jsonify(error="Monthly view is missing. Apply backend/dbms_setup.sql to your climate database, then retry."), 503
        if error.pgcode == "57014":
            return jsonify(error="Query exceeded the 8-second statement timeout. Narrow your filters."), 504
        return jsonify(error="Database query failed. Check the backend connection, schema and role privileges."), 503
    finally:
        if conn is not None:
            conn.close()
