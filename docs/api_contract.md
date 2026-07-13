# API Contract — Demand Forecasting Frontend

This document defines the frontend-facing contract for the forecasting service. The repository does not currently contain a running Flask/FastAPI backend, so this is the canonical request/response spec to implement against.

## Base Assumptions

- All predictions are for daily demand.
- `Demand` is measured in units.
- `Price` and `Competitor Pricing` are in INR per unit.
- `Discount` is a percentage from `0` to `100`.
- Forecast responses return both the individual model outputs and the blended ensemble output.
- The current notebook helper expects already-engineered feature rows, so server-side feature engineering is required if the frontend sends only raw business inputs.

## Endpoints

### 1. `GET /health`

Purpose: lightweight readiness check for the frontend and deployment health probes.

Response `200 OK`

```json
{
  "status": "ok",
  "service": "demand-forecasting-api",
  "version": "1.0.0"
}
```

### 2. `GET /metadata/feature-options`

Purpose: populate dropdowns and filter controls in the dashboard and forecast form.

Response `200 OK`

```json
{
  "stores": ["S001", "S002"],
  "products": ["P001", "P002"],
  "categories": ["Apparel", "Electronics"],
  "regions": ["North", "South", "East", "West"],
  "weather_conditions": ["Sunny", "Rainy", "Cloudy", "Snowy"],
  "seasonality": ["Winter", "Spring", "Summer", "Autumn"]
}
```

### 3. `POST /predict`

Purpose: single forecast from the input form.

Request body

```json
{
  "date": "2026-07-17",
  "store_id": "S001",
  "product_id": "P001",
  "category": "Apparel",
  "region": "North",
  "weather_condition": "Sunny",
  "seasonality": "Summer",
  "inventory_level": 140,
  "units_ordered": 150,
  "price": 499.0,
  "discount": 10,
  "promotion": 1,
  "competitor_pricing": 525.0,
  "epidemic": 0,
  "history": {
    "lag_1": 42.0,
    "lag_7": 39.0,
    "lag_30": 41.0,
    "rolling_mean_7": 40.5,
    "rolling_std_7": 3.2,
    "rolling_mean_14": 41.1,
    "rolling_std_14": 4.0,
    "rolling_mean_30": 38.9,
    "rolling_std_30": 5.6
  }
}
```

Field notes:

- `date`: ISO-8601 date string, `YYYY-MM-DD`.
- `store_id`, `product_id`, `category`, `region`, `weather_condition`, `seasonality`: string identifiers / labels.
- `inventory_level`, `units_ordered`, `promotion`, `epidemic`: integer values.
- `price`, `competitor_pricing`: decimal numbers in INR per unit.
- `discount`: integer percentage.
- `history`: optional if the backend can derive lag and rolling features from stored history, but required if the backend is stateless.

Response `200 OK`

```json
{
  "request_id": "b7a5f2c4-2bf1-4d2e-8e0d-1d0d1db8e1a1",
  "model": {
    "name": "blended-ensemble",
    "lgbm_version": "1.0.0",
    "xgboost_version": "1.0.0"
  },
  "forecast": {
    "prediction_lgbm": 123.4,
    "prediction_xgboost": 121.8,
    "prediction_ensemble": 122.6,
    "unit": "units"
  },
  "input": {
    "date": "2026-07-17",
    "store_id": "S001",
    "product_id": "P001"
  }
}
```

### 4. `GET /forecasts`

Purpose: dashboard feed for aggregate forecasts and SKU-level exploration.

Query parameters

- `store_id` optional string
- `product_id` optional string
- `start_date` required ISO date string
- `end_date` required ISO date string
- `granularity` optional string, defaults to `daily`

Example: `GET /forecasts?store_id=S001&product_id=P001&start_date=2026-07-01&end_date=2026-07-31&granularity=daily`

Response `200 OK`

```json
{
  "filters": {
    "store_id": "S001",
    "product_id": "P001",
    "start_date": "2026-07-01",
    "end_date": "2026-07-31",
    "granularity": "daily"
  },
  "data": [
    {
      "date": "2026-07-01",
      "store_id": "S001",
      "product_id": "P001",
      "forecast_lgbm": 118.2,
      "forecast_xgboost": 121.1,
      "forecast_ensemble": 119.6,
      "actual_demand": 116.0,
      "unit": "units"
    }
  ],
  "summary": {
    "rows": 1,
    "forecast_total": 119.6,
    "actual_total": 116.0
  }
}
```

### 5. `POST /predict/batch`

Purpose: optional batch form submission when the frontend wants to score multiple rows at once.

Request body

```json
{
  "rows": [
    {
      "date": "2026-07-17",
      "store_id": "S001",
      "product_id": "P001",
      "category": "Apparel",
      "region": "North",
      "weather_condition": "Sunny",
      "seasonality": "Summer",
      "inventory_level": 140,
      "units_ordered": 150,
      "price": 499.0,
      "discount": 10,
      "promotion": 1,
      "competitor_pricing": 525.0,
      "epidemic": 0,
      "history": {
        "lag_1": 42.0,
        "lag_7": 39.0,
        "lag_30": 41.0,
        "rolling_mean_7": 40.5,
        "rolling_std_7": 3.2,
        "rolling_mean_14": 41.1,
        "rolling_std_14": 4.0,
        "rolling_mean_30": 38.9,
        "rolling_std_30": 5.6
      }
    }
  ]
}
```

Response `200 OK`

```json
{
  "count": 1,
  "predictions": [
    {
      "row_index": 0,
      "prediction_lgbm": 123.4,
      "prediction_xgboost": 121.8,
      "prediction_ensemble": 122.6,
      "unit": "units"
    }
  ]
}
```

## Error Responses

### 400 Bad Request

Use for validation failures, missing required fields, or unsupported values.

```json
{
  "error": {
    "code": "validation_error",
    "message": "Invalid request payload",
    "details": [
      {
        "field": "date",
        "issue": "Must be YYYY-MM-DD"
      }
    ]
  },
  "request_id": "b7a5f2c4-2bf1-4d2e-8e0d-1d0d1db8e1a1"
}
```

### 401 Unauthorized / 403 Forbidden

Use if the backend is protected by a token or API key.

```json
{
  "error": {
    "code": "unauthorized",
    "message": "Missing or invalid credentials"
  }
}
```

### 500 Internal Server Error

Use for unexpected model, storage, or runtime failures.

```json
{
  "error": {
    "code": "internal_error",
    "message": "Forecasting service failed"
  },
  "request_id": "b7a5f2c4-2bf1-4d2e-8e0d-1d0d1db8e1a1"
}
```

## Auth

- No auth is implemented in the repository today.
- If the service is exposed publicly, use `Authorization: Bearer <token>` on every request.
- If you prefer an API-key model, send `x-api-key: <key>` and keep the frontend origin restricted.

## CORS

The backend should allow the frontend origin explicitly.

Recommended policy:

- `Access-Control-Allow-Origin`: the deployed frontend origin, or `http://localhost:5173` for local development.
- `Access-Control-Allow-Methods`: `GET, POST, OPTIONS`
- `Access-Control-Allow-Headers`: `Content-Type, Authorization, x-api-key`

## Implementation Notes

- The current notebook helper in [DEMAND FORCASTING .ipynb](../DEMAND%20FORCASTING%20.ipynb) returns `prediction_lgbm`, `prediction_xgboost`, and `prediction_ensemble`.
- If the backend keeps using that helper, the API response should preserve those field names exactly.
- If the backend computes features server-side, the `history` block should be treated as required unless cached historical features are available.