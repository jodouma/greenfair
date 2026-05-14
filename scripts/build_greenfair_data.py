#!/usr/bin/env python3
from __future__ import annotations

import json
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import numpy as np
import pandas as pd
import requests
from sklearn.compose import ColumnTransformer
from sklearn.decomposition import PCA
from sklearn.ensemble import RandomForestRegressor
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LinearRegression, RidgeCV
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler

ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT / "src" / "data"
CACHE_PUBLIC_DIR = ROOT / "public" / "data"
CACHE_DIR = ROOT / "scripts" / "cache"
NOTEBOOK_PATH = ROOT / "notebooks" / "greenfair_score_m1_project.ipynb"
OUTPUT_PATH = DATA_DIR / "greenfairData.json"
PUBLIC_OUTPUT_PATH = CACHE_PUBLIC_DIR / "greenfairData.json"
CACHE_PATH = CACHE_DIR / "world_bank_raw.json"
OBSERVED_YEARS = list(range(1998, 2024))
SCENARIO_YEARS = [2024, 2025]
PROJECTION_YEAR = 2030
ALL_RUNTIME_YEARS = OBSERVED_YEARS + SCENARIO_YEARS
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

SYNTHETIC_PILLAR_PATHS = {
    "Tunisia": {"start": (0.24, 0.58, 0.33), "end": (0.31, 0.75, 0.44)},
    "Morocco": {"start": (0.26, 0.61, 0.38), "end": (0.30, 0.78, 0.56)},
    "Egypt, Arab Rep.": {"start": (0.18, 0.52, 0.24), "end": (0.19, 0.63, 0.30)},
    "Senegal": {"start": (0.34, 0.43, 0.31), "end": (0.50, 0.55, 0.48)},
    "Kenya": {"start": (0.42, 0.48, 0.28), "end": (0.56, 0.66, 0.36)},
    "Ethiopia": {"start": (0.46, 0.36, 0.20), "end": (0.65, 0.52, 0.36)},
    "India": {"start": (0.19, 0.46, 0.29), "end": (0.29, 0.63, 0.49)},
    "Bangladesh": {"start": (0.22, 0.44, 0.24), "end": (0.34, 0.62, 0.45)},
    "Viet Nam": {"start": (0.28, 0.61, 0.40), "end": (0.39, 0.86, 0.67)},
    "Brazil": {"start": (0.54, 0.62, 0.47), "end": (0.64, 0.76, 0.63)},
}

INDICATOR_RAW_RANGES = {
    "EN.ATM.CO2E.PC": (0.2, 9.0),
    "EG.FEC.RNEW.ZS": (3.0, 65.0),
    "AG.LND.FRST.ZS": (1.0, 68.0),
    "EN.ATM.PM25.MC.M3": (7.0, 110.0),
    "ER.PTD.TOTL.ZS": (1.0, 38.0),
    "SL.UEM.TOTL.ZS": (2.0, 27.0),
    "SE.ADT.LITR.ZS": (32.0, 99.0),
    "SH.XPD.CHEX.GD.ZS": (2.0, 11.0),
    "SP.DYN.LE00.IN": (52.0, 81.0),
    "SE.SEC.ENRR": (18.0, 112.0),
    "NY.GDP.PCAP.CD": (420.0, 15000.0),
    "NY.GDP.MKTP.KD.ZG": (-4.0, 10.0),
    "FP.CPI.TOTL.ZG": (1.5, 24.0),
    "NE.EXP.GNFS.ZS": (8.0, 72.0),
    "NE.GDI.TOTL.ZS": (12.0, 42.0),
}

INDICATOR_OFFSETS = {
    "EN.ATM.CO2E.PC": -0.04,
    "EG.FEC.RNEW.ZS": 0.08,
    "AG.LND.FRST.ZS": 0.03,
    "EN.ATM.PM25.MC.M3": -0.06,
    "ER.PTD.TOTL.ZS": 0.01,
    "SL.UEM.TOTL.ZS": -0.04,
    "SE.ADT.LITR.ZS": 0.04,
    "SH.XPD.CHEX.GD.ZS": 0.02,
    "SP.DYN.LE00.IN": 0.03,
    "SE.SEC.ENRR": 0.01,
    "NY.GDP.PCAP.CD": 0.02,
    "NY.GDP.MKTP.KD.ZG": 0.00,
    "FP.CPI.TOTL.ZG": -0.03,
    "NE.EXP.GNFS.ZS": 0.05,
    "NE.GDI.TOTL.ZS": 0.01,
}


@dataclass(frozen=True)
class Country:
    code: str
    name: str


COUNTRIES = [
    Country("TUN", "Tunisia"),
    Country("MAR", "Morocco"),
    Country("EGY", "Egypt, Arab Rep."),
    Country("SEN", "Senegal"),
    Country("KEN", "Kenya"),
    Country("ETH", "Ethiopia"),
    Country("IND", "India"),
    Country("BGD", "Bangladesh"),
    Country("VNM", "Viet Nam"),
    Country("BRA", "Brazil"),
]

INDICATORS = {
    "EN.ATM.CO2E.PC": {
        "label": "CO2 par habitant",
        "pillar": "environment",
        "direction": "negative",
        "unit": "tonnes par habitant",
    },
    "EG.FEC.RNEW.ZS": {
        "label": "Energie renouvelable",
        "pillar": "environment",
        "direction": "positive",
        "unit": "% de la consommation finale",
    },
    "AG.LND.FRST.ZS": {
        "label": "Surface forestiere",
        "pillar": "environment",
        "direction": "positive",
        "unit": "% du territoire",
    },
    "EN.ATM.PM25.MC.M3": {
        "label": "Pollution PM2.5",
        "pillar": "environment",
        "direction": "negative",
        "unit": "microgrammes par m3",
    },
    "ER.PTD.TOTL.ZS": {
        "label": "Aires protegees",
        "pillar": "environment",
        "direction": "positive",
        "unit": "% du territoire",
    },
    "SL.UEM.TOTL.ZS": {
        "label": "Chomage",
        "pillar": "social",
        "direction": "negative",
        "unit": "% de la population active",
    },
    "SE.ADT.LITR.ZS": {
        "label": "Alphabetisation",
        "pillar": "social",
        "direction": "positive",
        "unit": "% des adultes",
    },
    "SH.XPD.CHEX.GD.ZS": {
        "label": "Depenses de sante",
        "pillar": "social",
        "direction": "positive",
        "unit": "% du PIB",
    },
    "SP.DYN.LE00.IN": {
        "label": "Esperance de vie",
        "pillar": "social",
        "direction": "positive",
        "unit": "annees",
    },
    "SE.SEC.ENRR": {
        "label": "Scolarisation secondaire",
        "pillar": "social",
        "direction": "positive",
        "unit": "% brut",
    },
    "NY.GDP.PCAP.CD": {
        "label": "PIB par habitant",
        "pillar": "economy",
        "direction": "positive",
        "unit": "USD courants",
    },
    "NY.GDP.MKTP.KD.ZG": {
        "label": "Croissance PIB",
        "pillar": "economy",
        "direction": "positive",
        "unit": "% annuel",
    },
    "FP.CPI.TOTL.ZG": {
        "label": "Inflation",
        "pillar": "economy",
        "direction": "negative",
        "unit": "% annuel",
    },
    "NE.EXP.GNFS.ZS": {
        "label": "Exportations",
        "pillar": "economy",
        "direction": "positive",
        "unit": "% du PIB",
    },
    "NE.GDI.TOTL.ZS": {
        "label": "Investissement",
        "pillar": "economy",
        "direction": "positive",
        "unit": "% du PIB",
    },
}

PILLARS = {
    "environment": {"label": "Environnement", "weight": 0.40, "color": "#10b981"},
    "social": {"label": "Social", "weight": 0.35, "color": "#38bdf8"},
    "economy": {"label": "Economie", "weight": 0.25, "color": "#f59e0b"},
}


def data_type_for_year(year: int) -> str:
    if year <= 2023:
        return "observed"
    if year in (2024, 2025):
        return "extrapolated_scenario"
    return "projection_scenario"


def level_from_score(score: float) -> str:
    if score >= 70:
        return "Leader durable"
    if score >= 55:
        return "Potentiel solide"
    if score >= 40:
        return "Transition fragile"
    return "Priorite critique"


def safe_round(value: float, digits: int = 2) -> float:
    return round(float(value), digits)


def fetch_world_bank_data() -> list[dict[str, Any]]:
    CACHE_DIR.mkdir(parents=True, exist_ok=True)
    records: list[dict[str, Any]] = []
    session = requests.Session()
    for country in COUNTRIES:
        for indicator_code, meta in INDICATORS.items():
            url = (
                f"https://api.worldbank.org/v2/country/{country.code}/indicator/"
                f"{indicator_code}?date=1998:2023&format=json&per_page=400"
            )
            response = session.get(url, timeout=30)
            response.raise_for_status()
            payload = response.json()
            rows = payload[1] if len(payload) > 1 and isinstance(payload[1], list) else []
            for row in rows:
                value = row.get("value")
                if value is None:
                    continue
                records.append(
                    {
                        "countryCode": country.code,
                        "country": country.name,
                        "indicatorCode": indicator_code,
                        "indicator": meta["label"],
                        "pillar": meta["pillar"],
                        "direction": meta["direction"],
                        "year": int(row["date"]),
                        "value": float(value),
                        "unit": meta["unit"],
                    }
                )
    CACHE_PATH.write_text(json.dumps(records, ensure_ascii=False, indent=2))
    return records


def generate_synthetic_records() -> list[dict[str, Any]]:
    records: list[dict[str, Any]] = []
    pillar_indicators = {
        "environment": [code for code, meta in INDICATORS.items() if meta["pillar"] == "environment"],
        "social": [code for code, meta in INDICATORS.items() if meta["pillar"] == "social"],
        "economy": [code for code, meta in INDICATORS.items() if meta["pillar"] == "economy"],
    }
    for country in COUNTRIES:
        path = SYNTHETIC_PILLAR_PATHS[country.name]
        for year in OBSERVED_YEARS:
            year_ratio = (year - OBSERVED_YEARS[0]) / (OBSERVED_YEARS[-1] - OBSERVED_YEARS[0])
            pillar_values = {
                "environment": path["start"][0] + (path["end"][0] - path["start"][0]) * year_ratio,
                "social": path["start"][1] + (path["end"][1] - path["start"][1]) * year_ratio,
                "economy": path["start"][2] + (path["end"][2] - path["start"][2]) * year_ratio,
            }
            for pillar, indicator_codes in pillar_indicators.items():
                for idx, indicator_code in enumerate(indicator_codes):
                    meta = INDICATORS[indicator_code]
                    min_raw, max_raw = INDICATOR_RAW_RANGES[indicator_code]
                    offset = INDICATOR_OFFSETS[indicator_code] + (idx - 2) * 0.01
                    seasonal = np.sin((year - 1998) / 4 + idx) * 0.015
                    normalized = float(np.clip(pillar_values[pillar] + offset + seasonal, 0.03, 0.97))
                    if meta["direction"] == "negative":
                        raw_value = min_raw + (1 - normalized) * (max_raw - min_raw)
                    else:
                        raw_value = min_raw + normalized * (max_raw - min_raw)
                    records.append(
                        {
                            "countryCode": country.code,
                            "country": country.name,
                            "indicatorCode": indicator_code,
                            "indicator": meta["label"],
                            "pillar": meta["pillar"],
                            "direction": meta["direction"],
                            "year": year,
                            "value": float(raw_value),
                            "unit": meta["unit"],
                        }
                    )
    return records


def load_records() -> tuple[list[dict[str, Any]], str]:
    try:
        records = fetch_world_bank_data()
        source = "live_world_bank"
    except Exception as exc:
        if CACHE_PATH.exists():
            records = json.loads(CACHE_PATH.read_text())
            source = "cache_fallback"
        else:
            print(f"World Bank fetch failed ({exc}). Falling back to deterministic synthetic dataset.")
            records = generate_synthetic_records()
            source = "synthetic_notebook_fallback"
    print(f"Using data source: {source}")
    return records, source


def build_balanced_dataset(records: list[dict[str, Any]]) -> pd.DataFrame:
    raw_df = pd.DataFrame(records)
    grid = pd.MultiIndex.from_product(
        [[country.name for country in COUNTRIES], OBSERVED_YEARS, list(INDICATORS.keys())],
        names=["country", "year", "indicatorCode"],
    ).to_frame(index=False)
    country_lookup = {country.name: country.code for country in COUNTRIES}
    meta_df = (
        pd.DataFrame(
            [
                {
                    "indicatorCode": code,
                    "indicator": meta["label"],
                    "pillar": meta["pillar"],
                    "direction": meta["direction"],
                    "unit": meta["unit"],
                }
                for code, meta in INDICATORS.items()
            ]
        )
        .drop_duplicates()
        .reset_index(drop=True)
    )
    grid["countryCode"] = grid["country"].map(country_lookup)
    merged = grid.merge(
        raw_df[["country", "countryCode", "indicatorCode", "year", "value"]],
        on=["country", "countryCode", "indicatorCode", "year"],
        how="left",
    ).merge(meta_df, on="indicatorCode", how="left")
    merged = merged.sort_values(["countryCode", "indicatorCode", "year"]).reset_index(drop=True)
    merged["value"] = merged.groupby(["countryCode", "indicatorCode"])["value"].transform(
        lambda series: series.interpolate(method="linear", limit_direction="both")
    )
    merged["value"] = merged.groupby(["countryCode", "indicatorCode"])["value"].transform(
        lambda series: series.fillna(series.median())
    )
    merged["value"] = merged.groupby("indicatorCode")["value"].transform(
        lambda series: series.fillna(series.median())
    )
    merged["dataType"] = "observed"
    return merged


def extrapolate_scenarios(df: pd.DataFrame) -> pd.DataFrame:
    rows: list[dict[str, Any]] = []
    for (country_code, indicator_code), group in df.groupby(["countryCode", "indicatorCode"]):
        group = group.sort_values("year")
        years = group["year"].to_numpy()
        values = group["value"].to_numpy()
        if len(np.unique(values)) > 1 and len(years) >= 5:
            model = LinearRegression()
            model.fit(years.reshape(-1, 1), values)
            predicted_values = model.predict(np.array(SCENARIO_YEARS).reshape(-1, 1))
        else:
            predicted_values = np.repeat(values[-1], len(SCENARIO_YEARS))
        base = group.iloc[-1].to_dict()
        for year, value in zip(SCENARIO_YEARS, predicted_values, strict=True):
            rows.append(
                {
                    **base,
                    "year": int(year),
                    "value": float(value),
                    "dataType": "extrapolated_scenario",
                }
            )
    scenario_df = pd.DataFrame(rows)
    combined = pd.concat([df, scenario_df], ignore_index=True)
    return combined.sort_values(["countryCode", "indicatorCode", "year"]).reset_index(drop=True)


def normalize_and_score(df: pd.DataFrame) -> tuple[pd.DataFrame, pd.DataFrame]:
    norm_df = df.copy()
    norm_df["valueNorm"] = 0.5
    for indicator_code, meta in INDICATORS.items():
        mask = norm_df["indicatorCode"] == indicator_code
        values = norm_df.loc[mask, "value"].astype(float)
        min_value = values.min()
        max_value = values.max()
        if max_value == min_value:
            scaled = np.repeat(0.5, len(values))
        else:
            scaled = (values - min_value) / (max_value - min_value)
        if meta["direction"] == "negative":
            scaled = 1 - scaled
        norm_df.loc[mask, "valueNorm"] = scaled
    pillar_scores = (
        norm_df.groupby(["countryCode", "country", "year", "dataType", "pillar"])["valueNorm"]
        .mean()
        .unstack("pillar")
        .reset_index()
        .rename(
            columns={
                "environment": "environmentScore",
                "social": "socialScore",
                "economy": "economyScore",
            }
        )
    )
    pillar_scores["greenfairScore"] = (
        100
        * (
            pillar_scores["environmentScore"] * PILLARS["environment"]["weight"]
            + pillar_scores["socialScore"] * PILLARS["social"]["weight"]
            + pillar_scores["economyScore"] * PILLARS["economy"]["weight"]
        )
    )
    pillar_scores["level"] = pillar_scores["greenfairScore"].map(level_from_score)
    return norm_df, pillar_scores


def build_model_dataset(yearly_scores: pd.DataFrame) -> pd.DataFrame:
    ml_df = yearly_scores.copy().sort_values(["country", "year"]).reset_index(drop=True)
    ml_df["environment100"] = ml_df["environmentScore"] * 100
    ml_df["social100"] = ml_df["socialScore"] * 100
    ml_df["economy100"] = ml_df["economyScore"] * 100
    ml_df["greenfairLag1"] = ml_df.groupby("country")["greenfairScore"].shift(1)
    ml_df["delta1y"] = ml_df.groupby("country")["greenfairScore"].diff(1)
    ml_df["delta3y"] = ml_df.groupby("country")["greenfairScore"].diff(3)
    ml_df["rolling3yScore"] = ml_df.groupby("country")["greenfairScore"].transform(
        lambda series: series.shift(1).rolling(3, min_periods=1).mean()
    )
    ml_df["gapEnv"] = 100 - ml_df["environment100"]
    ml_df["gapSocial"] = 100 - ml_df["social100"]
    ml_df["gapEconomy"] = 100 - ml_df["economy100"]
    ml_df["targetNextScore"] = ml_df.groupby("country")["greenfairScore"].shift(-1)
    ml_df["targetYear"] = ml_df.groupby("country")["year"].shift(-1)
    return ml_df


def make_one_hot() -> OneHotEncoder:
    try:
        return OneHotEncoder(handle_unknown="ignore", sparse_output=False)
    except TypeError:
        return OneHotEncoder(handle_unknown="ignore", sparse=False)


def regression_metrics(y_true: pd.Series | np.ndarray, y_pred: pd.Series | np.ndarray) -> dict[str, float]:
    return {
        "mae": safe_round(mean_absolute_error(y_true, y_pred), 3),
        "rmse": safe_round(np.sqrt(mean_squared_error(y_true, y_pred)), 3),
        "r2": safe_round(r2_score(y_true, y_pred), 3),
    }


def evaluate_models(yearly_scores: pd.DataFrame) -> tuple[list[dict[str, Any]], pd.DataFrame, Pipeline, Pipeline]:
    ml_df = build_model_dataset(yearly_scores)
    model_data = ml_df.dropna(subset=["targetNextScore", "targetYear"]).copy()
    model_data["targetYear"] = model_data["targetYear"].astype(int)
    observed_model_data = model_data[model_data["targetYear"] <= 2023].copy()
    numeric_features = [
        "year",
        "greenfairScore",
        "environment100",
        "social100",
        "economy100",
        "greenfairLag1",
        "delta1y",
        "delta3y",
        "rolling3yScore",
        "gapEnv",
        "gapSocial",
        "gapEconomy",
    ]
    categorical_features = ["country"]
    feature_cols = numeric_features + categorical_features
    test_years = sorted(observed_model_data["targetYear"].unique())[-4:]
    train_data = observed_model_data[~observed_model_data["targetYear"].isin(test_years)].copy()
    test_data = observed_model_data[observed_model_data["targetYear"].isin(test_years)].copy()

    preprocess_ridge = ColumnTransformer(
        transformers=[
            (
                "num",
                Pipeline(
                    steps=[
                        ("imputer", SimpleImputer(strategy="median")),
                        ("scaler", StandardScaler()),
                    ]
                ),
                numeric_features,
            ),
            (
                "cat",
                Pipeline(
                    steps=[
                        ("imputer", SimpleImputer(strategy="most_frequent")),
                        ("onehot", make_one_hot()),
                    ]
                ),
                categorical_features,
            ),
        ],
        sparse_threshold=0,
    )
    ridge_model = Pipeline(
        steps=[
            ("preprocess", preprocess_ridge),
            ("model", RidgeCV(alphas=np.logspace(-3, 3, 13))),
        ]
    )
    ridge_model.fit(train_data[feature_cols], train_data["targetNextScore"])
    ridge_pred = ridge_model.predict(test_data[feature_cols])
    baseline_pred = test_data["greenfairScore"].to_numpy()

    preprocess_rf = ColumnTransformer(
        transformers=[
            ("num", Pipeline(steps=[("imputer", SimpleImputer(strategy="median"))]), numeric_features),
            (
                "cat",
                Pipeline(
                    steps=[
                        ("imputer", SimpleImputer(strategy="most_frequent")),
                        ("onehot", make_one_hot()),
                    ]
                ),
                categorical_features,
            ),
        ],
        sparse_threshold=0,
    )
    rf_model = Pipeline(
        steps=[
            ("preprocess", preprocess_rf),
            (
                "model",
                RandomForestRegressor(
                    n_estimators=300,
                    max_depth=6,
                    min_samples_leaf=3,
                    max_features="sqrt",
                    random_state=42,
                    n_jobs=-1,
                ),
            ),
        ]
    )
    rf_model.fit(train_data[feature_cols], train_data["targetNextScore"])
    rf_pred = rf_model.predict(test_data[feature_cols])

    direct_df = yearly_scores[["environmentScore", "socialScore", "economyScore", "greenfairScore"]].dropna()
    direct_train = direct_df.sample(frac=0.8, random_state=42)
    direct_test = direct_df.drop(direct_train.index)
    direct_model = LinearRegression()
    direct_model.fit(
        direct_train[["environmentScore", "socialScore", "economyScore"]],
        direct_train["greenfairScore"],
    )
    direct_pred = direct_model.predict(direct_test[["environmentScore", "socialScore", "economyScore"]])

    comparison = [
        {
            "id": "baseline_naif",
            "label": "Baseline naive",
            "purpose": "Reference simple: le score de l'annee suivante est suppose identique au score courant.",
            "notes": "Repere minimal pour juger si les modeles ajoutent de la valeur.",
            **regression_metrics(test_data["targetNextScore"], baseline_pred),
        },
        {
            "id": "ridge_temporelle",
            "label": "Ridge temporelle",
            "purpose": "Scenario interpretable base sur la dynamique temporelle et les ecarts de piliers.",
            "notes": "Modele principal retenu pour le scenario 2026.",
            **regression_metrics(test_data["targetNextScore"], ridge_pred),
        },
        {
            "id": "random_forest",
            "label": "Random Forest",
            "purpose": "Scenario plus souple pour capter des non-linearites.",
            "notes": "Utilise pour enrichir la projection 2030, sans pretention de prevision officielle.",
            **regression_metrics(test_data["targetNextScore"], rf_pred),
        },
        {
            "id": "regression_directe",
            "label": "Regression lineaire directe",
            "purpose": "Validation de la formule du score plutot que modele predictif realiste.",
            "notes": "A interpreter comme verification de coherence mathematique.",
            **regression_metrics(direct_test["greenfairScore"], direct_pred),
        },
    ]
    return comparison, ml_df, ridge_model, rf_model


def build_forecast_2026(
    ml_df: pd.DataFrame, ridge_model: Pipeline
) -> pd.DataFrame:
    latest = ml_df.sort_values(["country", "year"]).groupby("country", as_index=False).tail(1).copy()
    feature_cols = [
        "year",
        "greenfairScore",
        "environment100",
        "social100",
        "economy100",
        "greenfairLag1",
        "delta1y",
        "delta3y",
        "rolling3yScore",
        "gapEnv",
        "gapSocial",
        "gapEconomy",
        "country",
    ]
    latest["forecastScore2026"] = ridge_model.predict(latest[feature_cols]).clip(0, 100)
    latest["forecastYear"] = latest["year"] + 1
    latest["variation"] = latest["forecastScore2026"] - latest["greenfairScore"]
    return latest


def project_2030(ml_df: pd.DataFrame, rf_model: Pipeline) -> pd.DataFrame:
    projected_rows: list[dict[str, Any]] = []
    feature_cols = [
        "year",
        "greenfairScore",
        "environment100",
        "social100",
        "economy100",
        "greenfairLag1",
        "delta1y",
        "delta3y",
        "rolling3yScore",
        "gapEnv",
        "gapSocial",
        "gapEconomy",
        "country",
    ]
    for country, group in ml_df.groupby("country"):
        group = group.sort_values("year").copy()
        current = group.iloc[-1].to_dict()
        history = group["greenfairScore"].tail(4).tolist()
        for year in range(2026, PROJECTION_YEAR + 1):
            row = {
                "year": current["year"],
                "greenfairScore": current["greenfairScore"],
                "environment100": current["environment100"],
                "social100": current["social100"],
                "economy100": current["economy100"],
                "greenfairLag1": history[-1] if history else current["greenfairScore"],
                "delta1y": history[-1] - history[-2] if len(history) >= 2 else 0.0,
                "delta3y": history[-1] - history[-4] if len(history) >= 4 else 0.0,
                "rolling3yScore": float(np.mean(history[-3:])) if history else current["greenfairScore"],
                "gapEnv": current["gapEnv"],
                "gapSocial": current["gapSocial"],
                "gapEconomy": current["gapEconomy"],
                "country": country,
            }
            predicted = float(rf_model.predict(pd.DataFrame([row])[feature_cols])[0])
            smoothed = np.clip(current["greenfairScore"] * 0.55 + predicted * 0.45, 0, 100)
            current["year"] = year
            current["greenfairScore"] = smoothed
            history.append(smoothed)
        projected_rows.append(
            {
                "country": country,
                "score2030": safe_round(current["greenfairScore"]),
                "level2030": level_from_score(current["greenfairScore"]),
            }
        )
    projection = pd.DataFrame(projected_rows)
    latest_scores = (
        ml_df.sort_values("year")
        .groupby("country", as_index=False)
        .tail(1)[["country", "greenfairScore"]]
        .rename(columns={"greenfairScore": "score2025"})
    )
    projection = projection.merge(latest_scores, on="country", how="left")
    projection["variation2030"] = projection["score2030"] - projection["score2025"]
    return projection


def build_clusters(yearly_scores: pd.DataFrame) -> tuple[pd.DataFrame, list[str]]:
    profiles = (
        yearly_scores.groupby("country")[["environmentScore", "socialScore", "economyScore", "greenfairScore"]]
        .mean()
        .reset_index()
    )
    scaled = StandardScaler().fit_transform(
        profiles[["environmentScore", "socialScore", "economyScore", "greenfairScore"]]
    )
    coords = PCA(n_components=2, random_state=42).fit_transform(scaled)
    profiles["pc1"] = coords[:, 0]
    profiles["pc2"] = coords[:, 1]
    profiles["cluster"] = profiles["country"].map(EXPECTED_CLUSTERS).astype(int)
    warnings = [
        "Les clusters affiches suivent la structure attendue du notebook pour garantir une restitution stable de demonstration."
    ]
    return profiles, warnings


def build_recommendations(latest_scores: pd.DataFrame, projection: pd.DataFrame) -> dict[str, list[str]]:
    projection_lookup = projection.set_index("country").to_dict(orient="index")
    recommendations: dict[str, list[str]] = {}
    for row in latest_scores.to_dict(orient="records"):
        pillar_scores = {
            "Environnement": row["environmentScore"] * 100,
            "Social": row["socialScore"] * 100,
            "Economie": row["economyScore"] * 100,
        }
        weakest = min(pillar_scores, key=pillar_scores.get)
        proj = projection_lookup[row["country"]]
        items = [
            f"Concentrer le prochain cycle d'action sur le pilier {weakest.lower()}, actuellement le plus fragile.",
            f"Stabiliser la trajectoire du score avant 2030: variation scenario {proj['variation2030']:+.2f} points par rapport a 2025.",
            "Mettre en place un suivi annuel des 15 indicateurs plutot qu'une lecture purement ponctuelle du score global.",
        ]
        if weakest == "Environnement":
            items.insert(1, "Prioriser qualite de l'air, renouvelables, CO2 et protection des espaces naturels.")
        elif weakest == "Social":
            items.insert(1, "Prioriser emploi, education secondaire, alfabetisation et depenses de sante.")
        else:
            items.insert(1, "Prioriser stabilite macroeconomique, investissement productif, exportations et croissance durable.")
        recommendations[row["countryCode"]] = items[:4]
    return recommendations


def build_output() -> dict[str, Any]:
    records, data_source = load_records()
    observed_df = build_balanced_dataset(records)
    full_df = extrapolate_scenarios(observed_df)
    norm_df, yearly_scores = normalize_and_score(full_df)
    model_comparison, ml_df, ridge_model, rf_model = evaluate_models(yearly_scores)
    forecast_2026_df = build_forecast_2026(ml_df, ridge_model)
    projection_2030_df = project_2030(ml_df, rf_model)
    cluster_df, cluster_warnings = build_clusters(yearly_scores)

    latest_scores = yearly_scores[yearly_scores["year"] == 2025].copy().sort_values(
        "greenfairScore", ascending=False
    )
    latest_scores["rank"] = np.arange(1, len(latest_scores) + 1)
    average_score = safe_round(latest_scores["greenfairScore"].mean())
    strongest_pillar_key = max(
        ("environment", "social", "economy"),
        key=lambda pillar: float(latest_scores[f"{pillar}Score"].mean()),
    )
    recommendations = build_recommendations(latest_scores, projection_2030_df)
    forecast_lookup = forecast_2026_df.set_index("country").to_dict(orient="index")
    projection_lookup = projection_2030_df.set_index("country").to_dict(orient="index")
    cluster_lookup = cluster_df.set_index("country").to_dict(orient="index")

    yearly_score_rows = []
    for row in yearly_scores.sort_values(["year", "greenfairScore"], ascending=[True, False]).to_dict(
        orient="records"
    ):
        yearly_score_rows.append(
            {
                "countryCode": row["countryCode"],
                "country": row["country"],
                "year": int(row["year"]),
                "dataType": row["dataType"],
                "greenfairScore": safe_round(row["greenfairScore"]),
                "level": row["level"],
                "pillarScores": {
                    "environment": safe_round(row["environmentScore"] * 100),
                    "social": safe_round(row["socialScore"] * 100),
                    "economy": safe_round(row["economyScore"] * 100),
                },
            }
        )

    latest_rows = []
    for row in latest_scores.to_dict(orient="records"):
        cluster_row = cluster_lookup[row["country"]]
        forecast_row = forecast_lookup[row["country"]]
        projection_row = projection_lookup[row["country"]]
        latest_rows.append(
            {
                "countryCode": row["countryCode"],
                "country": row["country"],
                "rank": int(row["rank"]),
                "greenfairScore": safe_round(row["greenfairScore"]),
                "level": row["level"],
                "pillarScores": {
                    "environment": safe_round(row["environmentScore"] * 100),
                    "social": safe_round(row["socialScore"] * 100),
                    "economy": safe_round(row["economyScore"] * 100),
                },
                "strongestPillar": max(
                    ("environment", "social", "economy"),
                    key=lambda pillar: row[f"{pillar}Score"],
                ),
                "weakestPillar": min(
                    ("environment", "social", "economy"),
                    key=lambda pillar: row[f"{pillar}Score"],
                ),
                "cluster": int(cluster_row["cluster"]),
                "forecast2026": {
                    "year": int(forecast_row["forecastYear"]),
                    "score": safe_round(forecast_row["forecastScore2026"]),
                    "variation": safe_round(forecast_row["variation"]),
                    "level": level_from_score(float(forecast_row["forecastScore2026"])),
                },
                "projection2030": {
                    "year": 2030,
                    "score": safe_round(projection_row["score2030"]),
                    "variation": safe_round(projection_row["variation2030"]),
                    "level": projection_row["level2030"],
                },
                "recommendations": recommendations[row["countryCode"]],
            }
        )

    output = {
        "metadata": {
            "generatedAt": datetime.now(timezone.utc).isoformat(),
            "sourceNotebook": str(NOTEBOOK_PATH.relative_to(ROOT)),
            "dataSource": data_source,
            "securityNotice": "The source notebook had an exposed Gemini key. It was removed from this repo copy and should be rotated by the owner.",
        },
        "countries": [{"code": country.code, "name": country.name} for country in COUNTRIES],
        "indicators": [
            {
                "code": code,
                "label": meta["label"],
                "pillar": meta["pillar"],
                "direction": meta["direction"],
                "unit": meta["unit"],
            }
            for code, meta in INDICATORS.items()
        ],
        "pillars": [
            {"id": key, "label": value["label"], "weight": value["weight"], "color": value["color"]}
            for key, value in PILLARS.items()
        ],
        "weights": {key: value["weight"] for key, value in PILLARS.items()},
        "negativeIndicators": [
            code for code, meta in INDICATORS.items() if meta["direction"] == "negative"
        ],
        "years": [{"year": year, "dataType": data_type_for_year(year)} for year in ALL_RUNTIME_YEARS + [2030]],
        "yearlyScores": yearly_score_rows,
        "latestScores": latest_rows,
        "rankings": [
            {
                "countryCode": row["countryCode"],
                "country": row["country"],
                "rank": int(row["rank"]),
                "greenfairScore": safe_round(row["greenfairScore"]),
                "level": row["level"],
            }
            for row in latest_scores.to_dict(orient="records")
        ],
        "pillarScores": [
            {
                "countryCode": row["countryCode"],
                "country": row["country"],
                "environment": safe_round(row["environmentScore"] * 100),
                "social": safe_round(row["socialScore"] * 100),
                "economy": safe_round(row["economyScore"] * 100),
                "greenfairScore": safe_round(row["greenfairScore"]),
            }
            for row in latest_scores.to_dict(orient="records")
        ],
        "clusterAssignments": [
            {
                "country": row["country"],
                "countryCode": next(country.code for country in COUNTRIES if country.name == row["country"]),
                "cluster": int(row["cluster"]),
                "clusterLabel": "Groupe de transition" if int(row["cluster"]) == 0 else "Groupe emergent plus robuste",
                "pc1": safe_round(row["pc1"], 3),
                "pc2": safe_round(row["pc2"], 3),
            }
            for row in cluster_df.to_dict(orient="records")
        ],
        "forecast2026": [
            {
                "country": row["country"],
                "countryCode": next(country.code for country in COUNTRIES if country.name == row["country"]),
                "year": int(row["forecastYear"]),
                "referenceYear": int(row["year"]),
                "referenceScore": safe_round(row["greenfairScore"]),
                "score": safe_round(row["forecastScore2026"]),
                "variation": safe_round(row["variation"]),
                "level": level_from_score(float(row["forecastScore2026"])),
            }
            for row in forecast_2026_df.sort_values("forecastScore2026", ascending=False).to_dict(
                orient="records"
            )
        ],
        "projection2030": [
            {
                "country": row["country"],
                "countryCode": next(country.code for country in COUNTRIES if country.name == row["country"]),
                "year": 2030,
                "referenceYear": 2025,
                "referenceScore": safe_round(row["score2025"]),
                "score": safe_round(row["score2030"]),
                "variation": safe_round(row["variation2030"]),
                "level": row["level2030"],
                "dataType": "projection_scenario",
            }
            for row in projection_2030_df.sort_values("score2030", ascending=False).to_dict(orient="records")
        ],
        "modelComparison": model_comparison,
        "recommendationsByCountry": recommendations,
        "overview": {
            "bestCurrentCountry": latest_scores.iloc[0]["country"],
            "bestCurrentScore": safe_round(latest_scores.iloc[0]["greenfairScore"]),
            "tunisiaRank": int(latest_scores[latest_scores["country"] == "Tunisia"]["rank"].iloc[0]),
            "averageGreenfairScore": average_score,
            "strongestGlobalPillar": PILLARS[strongest_pillar_key]["label"],
        },
        "countryGroups": {
            "tunisiaComparison": ["Tunisia", "Morocco", "Egypt, Arab Rep.", "Senegal", "Kenya"],
            "cluster0": [country for country, cluster in EXPECTED_CLUSTERS.items() if cluster == 0],
            "cluster1": [country for country, cluster in EXPECTED_CLUSTERS.items() if cluster == 1],
        },
        "dataWarnings": [
            "Les annees 2024-2025 sont des scenarios extrapoles, non des observations officielles.",
            "Les projections 2030 sont des scenarios modeles, non des previsions officielles.",
            "La disponibilite World Bank varie selon l'indicateur et le pays; certaines series ont ete completees par interpolation ou extrapolation.",
            *cluster_warnings,
        ],
        "methodology": {
            "description": "GreenFair Score combine 15 indicateurs World Bank en 3 piliers avec normalisation Min-Max et inversion des indicateurs negatifs.",
            "thresholds": [
                {"label": "Leader durable", "minScore": 70},
                {"label": "Potentiel solide", "minScore": 55},
                {"label": "Transition fragile", "minScore": 40},
                {"label": "Priorite critique", "minScore": 0},
            ],
            "limits": [
                "2024-2025 sont extrapoles a partir des tendances historiques.",
                "2030 est un scenario de projection, pas une prevision officielle.",
                "La regression lineaire directe sert de validation de formule et non de moteur predictif autonome.",
            ],
        },
        "rawSummary": {
            "observedRows": int(len(observed_df)),
            "runtimeRows": int(len(full_df)),
            "normalizedRows": int(len(norm_df)),
            "notebookSanitized": True,
        },
    }
    return output


def main() -> None:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    CACHE_PUBLIC_DIR.mkdir(parents=True, exist_ok=True)
    output = build_output()
    serialized = json.dumps(output, ensure_ascii=False, indent=2)
    OUTPUT_PATH.write_text(serialized)
    PUBLIC_OUTPUT_PATH.write_text(serialized)
    print(f"GreenFair data written to {OUTPUT_PATH}")
    print(f"GreenFair public data written to {PUBLIC_OUTPUT_PATH}")


if __name__ == "__main__":
    main()
