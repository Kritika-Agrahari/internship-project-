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

The model implements advanced feature extraction to capture consumer behavior, competitor pricing influence, and time-based characteristics:

1. **Revenue & Supply Metrics**:
   - `Total_Earnings`: Net earnings after applying discounts:
     $$\text{Total Earnings} = \text{Units Sold} \times \text{Price} \times \left(1 - \frac{\text{Discount}}{100}\right)$$
   - `Products_to_sell`: Outstanding customer demand remaining:
     $$\text{Products to sell} = \text{Units Ordered} - \text{Units Sold}$$
   - `Inventory_pressure`: Scaled inventory capacity indicator:
     $$\text{Inventory Pressure} = \frac{\text{Inventory Level}}{\text{Inventory Level} + 1}$$

2. **Competitor & Price Dynamics**:
   - `Price_diff`: Numerical price difference: $\text{Price} - \text{Competitor Pricing}$
   - `Price_ratio`: Price ratio: $\frac{\text{Price}}{\text{Competitor Pricing} + 10^{-6}}$
   - `Price_gap_pct`: Percentage gap: $\frac{\text{Price} - \text{Competitor Pricing}}{\text{Competitor Pricing}}$

3. **Promotion & Temporal Features**:
   - `Discount_effect`: Interaction term capturing promotion amplification: $\text{Discount} \times \text{Promotion}$
   - `Year`, `Month`, `Day`: Extracted from the `Date` timestamp.

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

## 📅 Timeline & Reference Documentation

- [Week 1 guide](week_1_guide.md)
- [Week 1 submission template](docs/week_1_submission_issue.md)
- [Deliverables specification](03_Deliverables_Specification.md)
- [3rd year roadmap](docs/roadmap_3rd_year.md)

## 📄 License

This project is developed for academic and learning purposes.

## 🧑‍💻 Developer

**Kritika Agrahari** (user.email: `kritikaagrahari16@gmail.com`)
