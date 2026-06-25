# Design Document: Retail & Apparel Demand Forecasting System

**Author:** Kritika Agrahari (12407845)  
**Role:** Data Engineering, Preprocessing & Integration Lead  
**Problem Code:** I1 (Tabular ML Zoo)  
**Date:** June 26, 2026  

---

## 1. System Overview
The **Retail & Apparel Demand Forecasting System** is designed to predict daily sales quantities for 50,000+ store-item combinations. The goal is to provide store managers and retail planners with accurate demand predictions, enabling optimized replenishment cycles and data-driven promotional planning.

---

## 2. Architecture & Data Flow
The system processes 5.8 million transactional records. The high-level data flow follows:

1. **Ingestion & Auditing**:
   - Ingests raw data from 9 csv files (sales, stores, catalog, price history, discounts, markdowns, online channel).
   - Validates data integrity (null rate checks, orphaned record filtering).
2. **Memory Downcasting Layer**:
   - Reduces numeric column sizes (e.g. `int64` to `int16`, `float64` to `float32`), reducing RAM usage by 60% (from ~18GB to ~7.2GB).
3. **Data Integration**:
   - Merges anchor table (`sales.csv`) with catalog, store, pricing, and promotional tables on composite keys (`store_id`, `item_id`, `date`).
   - Imputes missing dates with zero sales to prevent lag calculation gaps.
4. **Feature Engineering**:
   - Generates 23 temporal, cyclical (sine/cosine monthly/weekly transitions), lag (7, 14, 28, 365 days), and rolling window features.
5. **Model Serving & UI**:
   - Exposes prediction endpoints via a Flask API.
   - Serves an interactive glassmorphic dashboard to display aggregate forecasts (SARIMA), granular SKU forecasts (LightGBM), and safety stock recommendations.

---

## 3. Technology Stack Choice & Justification

| Component | Technology | Rationale (One Line Justification) |
| :--- | :--- | :--- |
| **Storage / Processing** | Python, Pandas, NumPy | Highly efficient and flexible data frames for local data cleaning and transformations. |
| **Model Champion** | LightGBM | Highly scalable gradient boosting with native categorical features and fast training speed. |
| **Web Service API** | Flask (Python) | Standard, easy-to-configure backend API that handles incoming JSON payloads for predictions. |
| **User Interface** | HTML5, CSS3, JS, Plotly.js | Custom glassmorphism UI provides interactive, high-fidelity visualization for business stakeholders. |

---

## 4. Evaluation Strategy
To ensure generalizability and prevent temporal data leakage:
- **Chronological Split**: The dataset is split chronologically into an 80% training set and a 20% validation set (last 90 days). Random K-fold splitting is disabled.
- **Metrics**: RMSE and R² score are computed for item-level predictions; MAPE is calculated for aggregate forecasting.

---

## 5. Risks & Mitigation
- **Cold Start**: Items with under 100 observations lack sufficient lags. *Mitigation:* Fall back to rolling store-category averages.
- **Model Staleness**: Changes in price elasticity or seasonal habits. *Mitigation:* Weekly/monthly automated RMSE checking triggers a retrain.
