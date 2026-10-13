import json
import unittest
from datetime import datetime
from decimal import Decimal
from pathlib import Path
from unittest.mock import MagicMock, patch

import psycopg2
from app import app
from query_lab import EXPERIMENTS, QUERIES


class QueryLabTests(unittest.TestCase):
    def setUp(self):
        self.client = app.test_client()

    def test_catalog_matches_frontend_snapshot(self):
        live = self.client.get("/dbms/catalog").get_json()
        bundled = json.loads((Path(__file__).parents[1] / "src/dbmsCatalog.json").read_text())
        self.assertEqual(live, bundled)
        self.assertEqual([e["number"] for e in EXPERIMENTS], list(range(1, 10)))
        self.assertEqual(len(QUERIES), 11)

    @patch("query_lab.get_connection")
    def test_rejects_unknown_queries_invalid_filters_and_methods(self, connection):
        self.assertEqual(self.client.get("/dbms/queries/drop-table").status_code, 404)
        for query in ["limit=501", "limit=0", "minimum=0", "start=bad", "start=2026-10-14&end=2026-10-13", "region=" + "x" * 201]:
            self.assertEqual(self.client.get("/dbms/queries/readings?" + query).status_code, 400)
        self.assertEqual(self.client.get("/dbms/queries/transaction").status_code, 405)
        self.assertEqual(self.client.post("/dbms/queries/readings").status_code, 405)
        connection.assert_not_called()

    @patch("query_lab.get_connection")
    def test_bound_parameters_readonly_serialization_and_cleanup(self, connection):
        conn = connection.return_value
        cursor = conn.cursor.return_value.__enter__.return_value
        cursor.fetchall.return_value = [{"temperature": Decimal("43.12"), "reading_time": datetime(2026, 10, 13, 12)}]
        suspicious = "Pune'; DROP TABLE Region; --"
        response = self.client.get("/dbms/queries/readings", query_string={"region": suspicious, "limit": 1})
        self.assertEqual(response.status_code, 200)
        conn.set_session.assert_called_once_with(readonly=True, autocommit=False)
        sql, params = cursor.execute.call_args_list[-1].args
        self.assertNotIn(suspicious, sql)
        self.assertEqual(params["region"], suspicious)
        self.assertEqual(response.json["rows"][0]["temperature"], 43.12)
        self.assertEqual(response.json["rows"][0]["reading_time"], "2026-10-13T12:00:00")
        self.assertTrue(response.json["at_limit"])
        conn.rollback.assert_called_once()
        conn.close.assert_called_once()

    @patch("query_lab.get_connection")
    def test_empty_results_preserve_columns(self, connection):
        cursor = connection.return_value.cursor.return_value.__enter__.return_value
        cursor.fetchall.return_value = []
        cursor.description = [MagicMock()]
        cursor.description[0].name = "region_name"
        response = self.client.get("/dbms/queries/search")
        self.assertEqual(response.json["columns"], ["region_name"])
        self.assertEqual(response.json["rows"], [])

    @patch("query_lab.get_connection")
    def test_temp_demo_restores_rows_and_never_commits(self, connection):
        conn = connection.return_value
        cursor = conn.cursor.return_value.__enter__.return_value
        before = [{"id": 1, "temperature": 40}, {"id": 2, "temperature": 42}]
        cursor.fetchall.side_effect = [before, [{"id": 1, "temperature": 45}], before]
        response = self.client.post("/dbms/queries/transaction")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json["rows"]), 5)
        statements = [call.args[0] for call in cursor.execute.call_args_list]
        self.assertIn("ROLLBACK TO SAVEPOINT before_changes", statements)
        self.assertTrue(any(sql.startswith("CREATE TEMP TABLE") for sql in statements))
        conn.commit.assert_not_called()
        conn.rollback.assert_called_once()
        conn.close.assert_called_once()

    @patch("query_lab.get_connection")
    def test_database_error_is_sanitized_and_closes_connection(self, connection):
        conn = connection.return_value
        cursor = conn.cursor.return_value.__enter__.return_value
        cursor.execute.side_effect = psycopg2.OperationalError("secret connection details")
        response = self.client.get("/dbms/queries/readings")
        self.assertEqual(response.status_code, 503)
        self.assertNotIn("secret", response.get_data(as_text=True))
        conn.close.assert_called_once()


if __name__ == "__main__":
    unittest.main()
