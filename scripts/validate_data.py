#!/usr/bin/env python3
from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA_PATH = ROOT / "src" / "data" / "greenfairData.json"

EXPECTED_COUNTRIES = {
    "TUN": "Tunisia",
    "MAR": "Morocco",
    "EGY": "Egypt, Arab Rep.",
    "SEN": "Senegal",
    "KEN": "Kenya",
    "ETH": "Ethiopia",
    "IND": "India",
    "BGD": "Bangladesh",
    "VNM": "Viet Nam",
    "BRA": "Brazil",
}
EXPECTED_NEGATIVE = {
    "EN.ATM.CO2E.PC",
    "EN.ATM.PM25.MC.M3",
    "FP.CPI.TOTL.ZG",
    "SL.UEM.TOTL.ZS",
}
EXPECTED_CLUSTERS = {
    "Bangladesh": 0,
    "Egypt, Arab Rep.": 0,
    "Ethiopia": 0,
    "India": 0,
    "Kenya": 0,
    "Morocco": 0,
    "Senegal": 0,
    "Tunisia": 0,
    "Brazil": 1,
    "Viet Nam": 1,
}


def assert_true(condition: bool, message: str) -> None:
    if not condition:
        raise AssertionError(message)


def main() -> None:
    assert_true(DATA_PATH.exists(), "greenfairData.json is missing. Run npm run data:build first.")
    payload = json.loads(DATA_PATH.read_text())

    countries = {entry["code"]: entry["name"] for entry in payload["countries"]}
    assert_true(countries == EXPECTED_COUNTRIES, "Country list does not match the 10 expected countries.")

    indicators = payload["indicators"]
    assert_true(len(indicators) == 15, "Expected 15 indicators.")

    weights = payload["weights"]
    total_weight = sum(float(value) for value in weights.values())
    assert_true(abs(total_weight - 1.0) < 1e-9, "Pillar weights must sum to 1.0.")

    negative = set(payload["negativeIndicators"])
    assert_true(negative == EXPECTED_NEGATIVE, "Negative indicator list is incorrect.")

    indicator_directions = {entry["code"]: entry["direction"] for entry in indicators}
    for code in EXPECTED_NEGATIVE:
        assert_true(indicator_directions.get(code) == "negative", f"{code} must be marked negative.")

    score_rows = payload["yearlyScores"]
    assert_true(len(score_rows) > 0, "yearlyScores must not be empty.")
    for row in score_rows:
        assert_true(0 <= row["greenfairScore"] <= 100, f"Score out of range for {row['country']} {row['year']}.")
        for pillar_score in row["pillarScores"].values():
            assert_true(0 <= pillar_score <= 100, f"Pillar score out of range for {row['country']} {row['year']}.")

    year_map = {entry["year"]: entry["dataType"] for entry in payload["years"]}
    assert_true(year_map[2024] == "extrapolated_scenario", "2024 must be flagged as extrapolated.")
    assert_true(year_map[2025] == "extrapolated_scenario", "2025 must be flagged as extrapolated.")
    assert_true(year_map[2030] == "projection_scenario", "2030 must be flagged as projection.")

    projections = payload["projection2030"]
    assert_true(all(item["dataType"] == "projection_scenario" for item in projections), "Projection rows must be flagged.")

    clusters = {entry["country"]: entry["cluster"] for entry in payload["clusterAssignments"]}
    assert_true(clusters == EXPECTED_CLUSTERS, "Cluster assignments do not match expected notebook grouping.")

    json_text = DATA_PATH.read_text()
    secret_pattern = re.compile(r"(AIza[0-9A-Za-z_-]+|sk-[A-Za-z0-9]+|GEMINI_API_KEY|OPENAI_API_KEY|GOOGLE_API_KEY)", re.I)
    assert_true(secret_pattern.search(json_text) is None, "Potential secret detected in generated JSON.")

    print("GreenFair data validation passed.")


if __name__ == "__main__":
    main()
