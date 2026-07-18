# Model Card: Demand Forecasting Model

## Model Details
- **Name**: Store Demand Forecaster
- **Version**: 1.0.0
- **Type**: Ensemble Gradient Boosting (LightGBM + XGBoost) with Quantile LightGBM for prediction intervals
- **Date**: July 2026

## Intended Use
- **Primary Use Case**: Predicting daily product demand per store for short-term (1–28 days) inventory optimization.
- **Primary Users**: Supply chain analysts and store managers via the inventory planning dashboard.
- **Out of Scope**: Long-term strategic capacity planning (>1 year). The model is optimized for short-term operational decisions where pricing, promotions, and recent lags are highly predictive.

## Training Data
- **Data Source**: Internal transactional data (2022–2024)
- **Scope**: 5 stores × 20 products = 100 store-product series
- **Size**: ~760 daily points per series (~76,000 total observations)
- **Features**: Lagged demand (`lag_1`, `lag_7`, `lag_30`), rolling statistics (7/14/30-day mean & std), calendar/holiday features, pricing dynamics (competitor price gaps, discount effects), and exogenous flags (Weather, Epidemics, Promotions)

## Evaluation Metrics

The model is evaluated using a time-aware holdout set (last 84 days) and a 3-fold walk-forward backtest (28-day steps).

| Metric | Description |
|--------|-------------|
| **WAPE** | Weighted Absolute Percentage Error — primary business metric. Measures aggregate volume error; prevents small-volume items from skewing results. |
| **MAE** | Mean Absolute Error — primary optimization metric used during training. |
| **MAPE** | Mean Absolute Percentage Error — reported for reference. |

## Model Comparison

| Model | Notes |
|-------|-------|
| **Naive Baseline (Lag 7)** | Seasonal-naive; used as lower bound. Any useful model must beat this. |
| **LightGBM** | Primary model; best MAE on validation. |
| **XGBoost** | Secondary booster; blended with LightGBM. |
| **CatBoost** | Handles categoricals natively; added as third booster comparison. |
| **Blended Ensemble** | Validation-tuned weighted blend (LGBM-heavy). Primary production model. |
| **SARIMAX** | Per-series classical baseline on 3 representative series; used to formally justify global ML approach. |
| **Quantile LGBM** | Two models (alpha=0.1/0.9) for 80% prediction intervals. |

## Robustness Audit (Extension Deliverable)

Rather than a demographic fairness audit (which does not apply to demand forecasting), this project performs a **robustness audit across business segments**. WAPE is evaluated per Category, Region, and Seasonality to ensure no segment is systematically under-forecasted (causing stockouts) or over-forecasted (causing waste). Results are documented in the notebook under the Segment Diagnostics section.

## Known Limitations and Caveats

- **Epidemic Days**: Demand during unprecedented events exhibits higher variance. The model uses the `Epidemic` feature flag, but entirely novel disruptions not present in training data may cause degradation.
- **Cold Start Problem**: The model depends heavily on `lag_1`, `lag_7`, and rolling statistics. Brand-new products or stores without historical data require at least 30 days of data before predictions are reliable.
- **Sparse/Intermittent Series**: For products with very low, intermittent demand, MAPE may appear high. WAPE is the more reliable indicator for these items.
- **Recursive Forecast Drift**: Multi-step forecasts beyond 7 days use predicted values as lag inputs, which can compound errors. Confidence intervals widen accordingly.

## Explainability

- **Global**: SHAP summary plot showing top feature drivers across all predictions.
- **Local**: SHAP waterfall plot for individual prediction explanation.
- Key drivers (from SHAP): `lag_1`, `lag_7`, `Price_gap_pct`, `Discount_effect`, `rolling_mean_7`.

## Inference

- **Single-step**: Use `predict_demand()` helper with pre-computed lag/rolling features.
- **Multi-step / Future dates**: Use `predict_recursive()` helper, which iterates day-by-day, auto-computing lag features from prior predictions. This is the required approach for the FastAPI `/predict` endpoint.
