# Prediction Input Form Specification

Based on the trained model pipeline (`demand_forecasting_artifacts.joblib`) and the historical dataset (`demand_forecasting.csv`), here is the design for the prediction input form.

## 1. Feature Analysis
The trained model (`lgbm_model` / `xgb_model`) expects a total of **31 features** during inference:
`['Store ID', 'Product ID', 'Category', 'Region', 'Inventory Level', 'Discount', 'Weather Condition', 'Promotion', 'Competitor Pricing', 'Seasonality', 'Epidemic', 'lag_1', 'lag_7', 'lag_30', 'rolling_mean_7', 'rolling_std_7', 'rolling_mean_14', 'rolling_std_14', 'rolling_mean_30', 'rolling_std_30', 'day_of_week', 'is_weekend', 'is_holiday', 'trend', 'Price_gap_pct', 'Discount_effect', 'inventory_demand_ratio', 'days_of_supply', 'Year', 'Month', 'Day']`

### The "Form vs. Backend" Split
To prevent the form from becoming overly complex and intimidating, the user should **only input raw business variables**. The backend logic must handle the remaining feature engineering dynamically before calling the model:
- **Time/Date Features** (`Year`, `Month`, `Day`, `day_of_week`, `is_weekend`, `is_holiday`, `trend`): Derived automatically from the selected **Date**.
- **Historical/Rolling Features** (`lag_*`, `rolling_*`): The backend needs to fetch historical sales data for the given `Store ID` and `Product ID` to calculate these on the fly.
- **Engineered Business Features** (`Price_gap_pct`, `Discount_effect`, `inventory_demand_ratio`, `days_of_supply`): Calculated by the backend using the raw `Price`, `Discount`, and `Inventory Level`. Note: **Price** must be collected even though it's not directly in the final 31 features, as it's required to calculate `Price_gap_pct`.

## 2. Form Fields, Types, and Sensible Defaults

Here is the exact mapping of what fields the frontend form needs, how they should be rendered, and their defaults.

| Field Name | UI Input Type | Options / Validation | Sensible Default |
| :--- | :--- | :--- | :--- |
| **Date** | Date Picker | Future dates only | **Today's Date** |
| **Store ID** | Free Text / Searchable Dropdown | Alphanumeric (e.g. `S001`) | *(Empty)* - Force user to specify |
| **Product ID** | Free Text / Searchable Dropdown | Alphanumeric (e.g. `P0001`) | *(Empty)* - Force user to specify |
| **Category** | Dropdown | `Electronics`, `Clothing`, `Groceries`, `Toys`, `Furniture` | **Electronics** (or prompt: "Select Category") |
| **Region** | Dropdown | `North`, `South`, `East`, `West` | **North** |
| **Price ($)** | Numeric Input (Free Text) | > 0, Up to 2 decimal places | **0.00** |
| **Competitor Pricing ($)** | Numeric Input (Free Text) | > 0, Up to 2 decimal places | *(Auto-fill based on Price or 0.00)* |
| **Discount (%)** | Numeric Slider / Input | 0 to 100 | **0** (No discount) |
| **Promotion** | Toggle Switch / Checkbox | `0` (No) or `1` (Yes) | **Off** (0) |
| **Inventory Level** | Numeric Input (Free Text) | Integer, ≥ 0 | **100** (or last known inventory) |
| **Weather Condition** | Dropdown | `Sunny`, `Cloudy`, `Rainy`, `Snowy` | **Sunny** |
| **Seasonality** | Dropdown | `Spring`, `Summer`, `Autumn`, `Winter` | *(Auto-select based on Date)* |
| **Epidemic / High-Impact Event** | Toggle Switch / Checkbox | `0` (No) or `1` (Yes) | **Off** (0) |
