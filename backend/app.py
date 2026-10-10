import os
import psycopg2

from flask import Flask, jsonify
from database import get_connection
from flask_cors import CORS

app = Flask(__name__)
CORS(app)


@app.route("/")
def home():
    return "Climate Intelligence Backend is Running"


@app.route("/regions")
def get_regions():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM Region")
    rows = cursor.fetchall()

    cursor.close()
    conn.close()

    regions = []

    for row in rows:
        regions.append({
            "region_id": row[0],
            "region_name": row[1],
            "state": row[2],
            "climate_zone": row[3],
            "population": row[4]
        })

    return jsonify(regions)

@app.route("/stations")
def get_stations():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT
            w.Station_ID,
            w.Station_Name,
            r.Region_Name,
            w.Status
        FROM Weather_Station w
        JOIN Region r
        ON w.Region_ID = r.Region_ID
    """)

    rows = cursor.fetchall()

    cursor.close()
    conn.close()

    stations = []

    for row in rows:
        stations.append({
            "station_id": row[0],
            "station_name": row[1],
            "region": row[2],
            "status": row[3]
        })

    return jsonify(stations)
@app.route("/readings")
def get_readings():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT
            sr.Reading_ID,
            sr.Reading_Time,
            sr.Temperature,
            sr.Humidity,
            sr.Pressure,
            sr.Wind_Speed,
            sr.Wind_Direction,
            sr.Precipitation,
            sr.Cloud_Cover,
            sr.Heat_Index,
            s.Sensor_ID,
            w.Station_Name,
            r.Region_Name
        FROM Sensor_Reading sr
        JOIN Sensor s
            ON sr.Sensor_ID = s.Sensor_ID
        JOIN Weather_Station w
            ON s.Station_ID = w.Station_ID
        JOIN Region r
            ON w.Region_ID = r.Region_ID
        ORDER BY sr.Reading_Time DESC
    """)

    rows = cursor.fetchall()
    cursor.close()
    conn.close()

    readings = []

    for row in rows:
        readings.append({
            "reading_id": row[0],
            "reading_time": str(row[1]),
            "temperature": float(row[2]) if row[2] is not None else None,
            "humidity": float(row[3]) if row[3] is not None else None,
            "pressure": float(row[4]) if row[4] is not None else None,
            "wind_speed": float(row[5]) if row[5] is not None else None,
            "wind_direction": row[6],
            "precipitation": float(row[7]) if row[7] is not None else None,
            "cloud_cover": float(row[8]) if row[8] is not None else None,
            "heat_index": float(row[9]) if row[9] is not None else None,
            "sensor_id": row[10],
            "station_name": row[11],
            "region": row[12]
        })

    return jsonify(readings)
@app.route("/forecasts")
def get_forecasts():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT
            f.Forecast_ID,
            f.Forecast_Date,
            f.Temperature,
            f.Humidity,
            f.Wind_Speed,
            f.Predicted_Heat_Index,
            r.Region_Name
        FROM Forecast f
        JOIN Region r
            ON f.Region_ID = r.Region_ID
        ORDER BY f.Forecast_Date, r.Region_Name
    """)

    rows = cursor.fetchall()
    cursor.close()
    conn.close()

    forecasts = []

    for row in rows:
        forecasts.append({
            "forecast_id": row[0],
            "forecast_date": str(row[1]),
            "temperature": float(row[2]) if row[2] is not None else None,
            "humidity": float(row[3]) if row[3] is not None else None,
            "wind_speed": float(row[4]) if row[4] is not None else None,
            "predicted_heat_index": float(row[5]) if row[5] is not None else None,
            "region": row[6]
        })

    return jsonify(forecasts)

@app.route("/predictions")
def get_predictions():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT
            hp.Prediction_ID,
            hp.Risk_Level,
            hp.Probability,
            hp.Prediction_Time,
            hp.Model_Version,
            f.Forecast_ID,
            f.Forecast_Date,
            r.Region_Name
        FROM Heatwave_Prediction hp
        JOIN Forecast f
            ON hp.Forecast_ID = f.Forecast_ID
        JOIN Region r
            ON f.Region_ID = r.Region_ID
        ORDER BY hp.Probability DESC
    """)

    rows = cursor.fetchall()
    cursor.close()
    conn.close()

    predictions = []

    for row in rows:
        predictions.append({
            "prediction_id": row[0],
            "risk_level": row[1],
            "probability": float(row[2]),
            "prediction_time": str(row[3]),
            "model_version": row[4],
            "forecast_id": row[5],
            "forecast_date": str(row[6]),
            "region": row[7]
        })

    return jsonify(predictions)

@app.route("/advisories")
def get_advisories():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT
            a.Advisory_ID,
            a.Alert_Level,
            a.Message,
            a.Issued_Time,
            hp.Prediction_ID,
            hp.Risk_Level,
            hp.Probability,
            r.Region_Name
        FROM Advisory a
        JOIN Heatwave_Prediction hp
            ON a.Prediction_ID = hp.Prediction_ID
        JOIN Forecast f
            ON hp.Forecast_ID = f.Forecast_ID
        JOIN Region r
            ON f.Region_ID = r.Region_ID
        ORDER BY a.Issued_Time DESC
    """)

    rows = cursor.fetchall()
    cursor.close()
    conn.close()

    advisories = []

    for row in rows:
        advisories.append({
            "advisory_id": row[0],
            "alert_level": row[1],
            "message": row[2],
            "issued_time": str(row[3]),
            "prediction_id": row[4],
            "risk_level": row[5],
            "probability": float(row[6]),
            "region": row[7]
        })

    return jsonify(advisories)

@app.route("/stakeholders")
def get_stakeholders():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT
            s.Stakeholder_ID,
            s.Name,
            s.Organization,
            s.Contact,
            r.Region_Name
        FROM Stakeholder s
        LEFT JOIN Region r
            ON s.Region_ID = r.Region_ID
        ORDER BY s.Name
    """)

    rows = cursor.fetchall()
    cursor.close()
    conn.close()

    stakeholders = []

    for row in rows:
        stakeholders.append({
            "stakeholder_id": row[0],
            "name": row[1],
            "organization": row[2],
            "contact": row[3],
            "region": row[4]
        })

    return jsonify(stakeholders)

@app.route("/advisory-stakeholders")
def get_advisory_stakeholders():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT
            ast.Advisory_ID,
            a.Alert_Level,
            r.Region_Name,
            ast.Stakeholder_ID,
            s.Name,
            s.Organization,
            ast.Sent_Time,
            ast.Status
        FROM Advisory_Stakeholder ast
        JOIN Advisory a
            ON ast.Advisory_ID = a.Advisory_ID
        JOIN Stakeholder s
            ON ast.Stakeholder_ID = s.Stakeholder_ID
        LEFT JOIN Region r
            ON s.Region_ID = r.Region_ID
        ORDER BY ast.Sent_Time DESC
    """)

    rows = cursor.fetchall()
    cursor.close()
    conn.close()

    mappings = []

    for row in rows:
        mappings.append({
            "advisory_id": row[0],
            "alert_level": row[1],
            "region": row[2],
            "stakeholder_id": row[3],
            "stakeholder_name": row[4],
            "organization": row[5],
            "sent_time": str(row[6]),
            "status": row[7]
        })

    return jsonify(mappings)

@app.route("/dashboard")
def get_dashboard():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT
    r.Region_Name,
    sr.Temperature,
    sr.Humidity,
    sr.Pressure,
    sr.Wind_Speed,
    sr.Wind_Direction,
    sr.Cloud_Cover,
    sr.Heat_Index,
    hp.Risk_Level,
    hp.Probability,
    a.Alert_Level,
    a.Message
        FROM Region r
        JOIN Weather_Station ws
            ON r.Region_ID = ws.Region_ID
        JOIN Sensor s
            ON ws.Station_ID = s.Station_ID
        JOIN Sensor_Reading sr
            ON s.Sensor_ID = sr.Sensor_ID
        JOIN Forecast f
            ON r.Region_ID = f.Region_ID
        JOIN Heatwave_Prediction hp
            ON f.Forecast_ID = hp.Forecast_ID
        JOIN Advisory a
            ON hp.Prediction_ID = a.Prediction_ID
        ORDER BY hp.Probability DESC
    """)

    rows = cursor.fetchall()
    cursor.close()
    conn.close()

    dashboard = []

    for row in rows:
        dashboard.append({
           "region": row[0],
    "temperature": float(row[1]),
    "humidity": float(row[2]),
    "pressure": float(row[3]),
    "wind_speed": float(row[4]),
    "wind_direction": row[5],
    "cloud_cover": float(row[6]),
    "heat_index": float(row[7]),
    "risk_level": row[8],
    "probability": float(row[9]),
    "alert_level": row[10],
    "message": row[11]
        })

    return jsonify(dashboard)

if __name__ == "__main__":
    app.run(debug=True)