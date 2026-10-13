-- Optional setup for experiments 3, 6 and 8. Review and run on the climate DB.
-- Uses the unquoted table names already queried by backend/app.py.
BEGIN;
CREATE OR REPLACE VIEW climate_lab_monthly_stats AS
SELECT r.Region_ID AS region_id, r.Region_Name AS region_name,
       date_trunc('month', sr.Reading_Time)::date AS month,
       COUNT(*) AS reading_count,
       ROUND(AVG(sr.Temperature)::numeric, 2) AS avg_temperature,
       MIN(sr.Temperature) AS min_temperature,
       MAX(sr.Temperature) AS peak_temperature
FROM Region r
JOIN Weather_Station ws ON ws.Region_ID = r.Region_ID
JOIN Sensor s ON s.Station_ID = ws.Station_ID
JOIN Sensor_Reading sr ON sr.Sensor_ID = s.Sensor_ID
GROUP BY r.Region_ID, r.Region_Name, date_trunc('month', sr.Reading_Time)::date;

CREATE INDEX IF NOT EXISTS climate_lab_sensor_reading_time
    ON Sensor_Reading (Sensor_ID, Reading_Time DESC);
CREATE INDEX IF NOT EXISTS climate_lab_station_region ON Weather_Station (Region_ID);
CREATE INDEX IF NOT EXISTS climate_lab_sensor_station ON Sensor (Station_ID);
COMMIT;
