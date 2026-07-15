# Dashboard Specification

This document outlines the design and technical requirements for the Demand Forecasting Dashboard, focusing on data visualization, filtering, and aggregation.

## 1. Primary View & Layout

The dashboard should focus on actionable insights, allowing the user to quickly see overall demand trends and drill down into specific areas.

### Main Sections:
1. **Global Filters Panel (Top or Sidebar):**
   - **Date Range Picker:** Select the historical + forecast horizon (e.g., Last 30 Days + Next 14 Days).
   - **Dropdowns (Multi-select):** `Region`, `Store ID`, `Category`, `Product ID`.
   - **Apply Filters Button:** To prevent excessive API calls while configuring filters.

2. **Key Performance Indicators (KPI Cards) - Top Row:**
   - **Total Forecasted Demand** (for the selected period).
   - **Expected Revenue** (Forecasted Demand × Average Price).
   - **Top Performing Category** (by volume).
   - **Inventory Alert** (Count of products where forecast > current inventory).

## 2. Charts and Visualizations

| Chart Type | Purpose | Description |
| :--- | :--- | :--- |
| **Main Line Chart** | Trend Analysis & Backtesting | Shows **Demand over Time**. Historical actuals are a solid line; Forecast is a dashed line. If the user filters down to a single product, it can also show inventory levels. |
| **Bar Chart / Pie Chart** | Composition | **Demand by Category** or **Demand by Region**. Helps visualize the split of the forecasted volume. |
| **Horizontal Bar Chart** | Ranking | **Top 10 Products** by forecasted demand volume. |
| **Data Table** | Deep Dive | A detailed, sortable, and exportable table showing: `Date`, `Region`, `Store ID`, `Product ID`, `Forecasted Demand`, `Current Inventory`, and `Stockout Risk` (Boolean). |

## 3. Data Aggregation Strategy

**Problem:** The ML model predicts at the most granular level: `(Store ID, Product ID, Date)`. If a user wants to view "Total Demand for Electronics in the North Region," the raw predictions must be aggregated.

**Proposed Solution:** 
- **Backend Aggregation (Recommended):** The API should accept the filter parameters and return *already aggregated* data for the charts. Returning hundreds of thousands of granular rows to the browser will cause severe performance issues and crash the client. 
- **Client-Side Aggregation (Fallback):** Only feasible if the dashboard enforces strict filters (e.g., forcing the user to select a single Store and Product before rendering charts). 
- **Decision:** We will use **Backend Aggregation**. The frontend will pass the selected filters and the requested grouping level (e.g., `group_by=Date` for the line chart, `group_by=Category` for the bar chart) to the backend. The API will run a SQL/Pandas `groupby` operation on the predictions and return a lightweight JSON payload.
