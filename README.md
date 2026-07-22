# 📈 Retail & Apparel Demand Forecasting System

[![Project Type](https://img.shields.io/badge/Type-AI%20%7C%20ML-blue)]
[![Domain](https://img.shields.io/badge/Domain-Indian%20Retail-green)]
[![Status](https://img.shields.io/badge/Status-Modeling%20%26%20Evaluation-orange)]
[![Academic Year](https://img.shields.io/badge/Year-2025--2026-purple)]

An ML-focused retail forecasting project for Indian apparel stores, built around demand prediction, data validation, and inventory planning for mid-market brands. 

This repository contains the end-to-end Machine Learning pipeline for demand forecasting, including Exploratory Data Analysis (EDA), advanced feature engineering, target encoding, and hyperparameter-tuned modeling using LightGBM and XGBoost.

---

## 🗂️ Project Structure & Contents

| Path | Purpose |
| :--- | :--- |
| **[demand-forecasting-with-advanced-feature-engineeri.ipynb](demand-forecasting-with-advanced-feature-engineeri.ipynb)** | Jupyter notebook containing EDA, Feature Engineering, Modeling, Hyperparameter Tuning, and Evaluation. |
| **[check_data_layer.py](check_data_layer.py)** | Validates sample CSV ingestion and applies memory downcasting checks. |
| **[requirements.txt](requirements.txt)** | Python package dependencies needed to run the project. |
| **[docs/api_contract.md](docs/api_contract.md)** | Frontend-facing API contract for forecast, metadata, and health endpoints. |
| **[docs/design_doc.md](docs/design_doc.md)** | System design doc and technical rationale for forecasting. |
| **[docs/roadmap_3rd_year.md](docs/roadmap_3rd_year.md)** | Personal extension roadmap for the 3rd year portfolio. |
| **[03_Deliverables_Specification.md](03_Deliverables_Specification.md)** | Official internship deliverables and submission rules. |

---

## 📊 Dataset Overview

The dataset contains **76,000 records** and **16 variables**:

| Feature Name | Type | Description |
| :--- | :--- | :--- |
| `Date` | Object / Date | Date of transaction |
| `Store ID` | Object | Unique identifier for the store |
| `Product ID` | Object | Unique identifier for the product |
| `Category` | Object | Category of the product (e.g., Electronics, Apparel) |
| `Region` | Object | Geographical region of the store (e.g., North, South) |
| `Inventory Level` | Integer | Stock count at the store |
| `Units Sold` | Integer | Units of the product sold |
| `Units Ordered` | Integer | Units of the product ordered |
| `Price` | Float | Unit price of the product |
| `Discount` | Integer | Discount percentage applied |
| `Weather Condition` | Object | Weather conditions (e.g., Snowy, Sunny, Rainy) |
| `Promotion` | Integer / Binary | Indicator of active promotion (0 or 1) |
| `Competitor Pricing`| Float | Competitor's unit price for the product |
| `Seasonality` | Object | Season designation (e.g., Winter, Summer) |
| `Epidemic` | Integer / Binary | Indicator of epidemic conditions (0 or 1) |
| **`Demand`** *(Target)*| Integer | The actual demand to forecast |

---

## 🛠️ Feature Engineering Pipeline

The model implements an advanced temporal feature extraction pipeline to capture consumer demand dynamics, pricing incentives, competitor influence, and calendar effects:

1. **Temporal Dynamics (Lags & Rolling Window Statistics)**:
   - `lag_1`, `lag_7`, `lag_30`: Previous target values capturing demand from 1, 7, and 30 days ago to reflect short-term momentum and weekly/monthly seasonality.
   - `rolling_mean_7` / `rolling_std_7`: Rolling average and standard deviation of demand over the past 7 days (shifted by 1 day to prevent future data leakage).
   - `rolling_mean_14` / `rolling_std_14`: Rolling average and standard deviation over the past 14 days (shifted by 1 day).
   - `rolling_mean_30` / `rolling_std_30`: Rolling average and standard deviation over the past 30 days (shifted by 1 day).

2. **Time & Calendar Context**:
   - `day_of_week`: Day of the week (0 = Monday, 6 = Sunday) to model intra-week variation.
   - `is_weekend`: Binary flag indicating if the transaction occurred on a weekend.
   - `is_holiday`: Binary flag mapping Indian public holidays using the `holidays` package.
   - `trend`: Linear trend feature representing days elapsed since the start of the dataset.

3. **Inventory & Supply Optimization**:
   - `inventory_demand_ratio`: Scaled ratio of current inventory to rolling 7-day average demand.
   - `days_of_supply`: Scaled ratio of current inventory to rolling 30-day average demand.

4. **Competitor & Price Dynamics**:
   - `Price_gap_pct`: Percentage gap relative to competitor pricing:
     $$\text{Price Gap \%} = \frac{\text{Price} - \text{Competitor Pricing}}{\text{Competitor Pricing}}$$
   - `Discount_effect`: Interaction term capturing promotion amplification:
     $$\text{Discount Effect} = \text{Discount} \times \text{Promotion}$$
   - `Total_Earnings` & `Products_to_sell`: Financial and order backlog metrics computed prior to feature selection.
   - `Year`, `Month`, `Day`: Extracted calendar fields from the `Date` timestamp.

---

## 🤖 Modeling & Training Workflow

### 1. Data Preprocessing & Target Transformation
- **Target Normalization**: Log-transformation ($\log(1+y)$) is applied to the target variable `Demand` to reduce skewness and stabilize variance. Predictions are converted back using the exponential function ($\exp(x)-1$) during evaluation.
- **Preventing Data Leakage**: Columns containing post-hoc information (like `Units Sold`, `Units Ordered`, `Products_to_sell`, `Total_Earnings`) along with metadata (`Store ID`, `Date`, `Price`) are dropped during training to prevent leakage.
- **Target Encoding**: High-cardinality categorical features (`Category`, `Region`, `Weather Condition`, `Seasonality`, `Product ID`) are mapped to target statistics using `TargetEncoder` with a smoothing factor of `0.3`.

### 2. Model Selection & Hyperparameter Tuning
We use 5-Fold Cross Validation (`KFold`) and `RandomizedSearchCV` to tune optimal hyperparameters for two gradient boosting algorithms:
- **LightGBM Regressor** (tuned parameters include: number of leaves, min child samples, learning rate, trees, subsampling)
- **XGBoost Regressor** (tuned parameters include: max depth, min child weight, learning rate, trees, subsampling)

### 3. Model Blending (Ensemble)
A final meta-model is formed using a 50/50 weighted average of LightGBM and XGBoost predictions, yielding superior generalization.

---

## 📈 Performance Comparison

The performance of each model evaluated on the test dataset:

| Model | Mean Absolute Error (MAE) | R² Score |
| :--- | :---: | :---: |
| XGBoost | 8.4956 | 91.43% |
| LightGBM | 7.9652 | 91.93% |
| **Ensemble (50/50 Blend)** | **7.8004** | **92.26%** |

*The Ensemble model successfully reduces forecasting error to an MAE of 7.80 and explains over 92.26% of target variance.*

---

## 🚀 Getting Started

### Prerequisites
Make sure you have Python 3.8+ installed.

### Setup & Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/Kritika-Agrahari/internship-project-.git
   cd internship-project-
   ```
2. Initialize and activate a virtual environment:
   ```bash
   python -m venv .venv
   .venv\Scripts\activate
   ```
3. Install the dependencies:
   ```bash
   pip install -r requirements.txt
   ```

### Running the Pipeline
- **Data Layer Validation**: Run the memory-downcasting check script:
  ```bash
  python check_data_layer.py
  ```
- **Forecasting Notebook**: Open and run the Jupyter notebook for EDA and model training:
  ```bash
  jupyter notebook demand-forecasting-with-advanced-feature-engineeri.ipynb
  ```

---

## 🚀 Stretch Goals (Beyond Phase 6: Deploy)

As this project evolves into a production-grade application, the following phases are planned as stretch goals:

### Phase 7 — Data Persistence & Feedback Loop
- **Prediction Logging & Actuals Ingestion**: Store every prediction and match it back to actual sales data once available (e.g., using PostgreSQL).
- **Drift Monitoring**: Track rolling MAE/WAPE week over week. Implement simple feature drift detection (Population Stability Index).
- **Retraining Pipeline**: Establish a retraining script with a promotion gate to ensure models improve dynamically rather than remaining static.

### Phase 8 — Auth
- **User Accounts**: Implement sign-up/login functionality using managed providers like Clerk, Auth0, or Supabase.
- **Route Protection**: Protect API routes in FastAPI using auth middleware.

### Phase 9 — Billing & Subscriptions
- **Stripe Integration**: Introduce subscription tiers (Free/Pro/Enterprise) or usage-based billing.
- **Access Control**: FastAPI middleware to check plan constraints before serving predictions.

---

## 📅 Timeline & Reference Documentation

- [Week 1 guide](week_1_guide.md)
- [Week 1 learnings](week_1_learning.md)
- [Week 1 submission template](docs/week_1_submission_issue.md)
- [Deliverables specification](03_Deliverables_Specification.md)
- [3rd year roadmap](docs/roadmap_3rd_year.md)

## 📄 License

This project is developed for academic and learning purposes.

## 🧑‍💻 Developer

**Kritika Agrahari** (user.email: `kritikaagrahari16@gmail.com`)
