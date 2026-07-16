# UI/UX Screen Plan

This document outlines the structure, navigation, and component breakdown for the frontend application screens. The goal is to create a seamless, premium user experience.

## 1. Shared Layout & Navigation

To provide a cohesive experience across the application, both pages will be wrapped in a unified layout component.

- **Persistent Navigation:** A sleek, vertical Sidebar on the left (or a top Navigation Bar) containing:
  - App Logo / Brand Name (e.g., "DemandIQ").
  - **Links:** 
    - `📊 Dashboard` (Home)
    - `🔮 New Prediction` (Simulator)
  - **Footer Area:** User profile / Settings / Theme Toggle (Light/Dark mode).
- **Main Content Area:** The large area to the right (or below) the navigation where the page components render. It will feature a subtle, soft-colored background (e.g., light gray `#f4f7f6` or dark `#0f172a`) to make white/glass-panel cards pop.

## 2. Dashboard Page (Historical & Forecast View)

This is the landing page. It provides a macro view of business health.

**Component Layout (Top to Bottom):**
1. **Header & Global Filters:** 
   - Page Title: "Overview & Forecast"
   - Filter Bar: Date Range, Region, Category dropdowns.
2. **KPI Metrics Row:** 
   - 4 distinct cards (e.g., Total Forecast Volume, Stockout Alerts, Top Region, Average Discount).
3. **Primary Visualization Area:**
   - **Main Chart (Full Width):** A dual-axis Line Chart showing `Actual Demand` (historical) fading into `Forecasted Demand`.
4. **Secondary Insights (Split 50/50):**
   - **Left Panel:** Bar chart showing "Demand by Category".
   - **Right Panel:** Horizontal Bar chart showing "Top 5 Products".
5. **Data Table (Bottom):** 
   - A paginated table showing the granular breakdown, sortable by `Stockout Risk` or `Demand Volume`.

## 3. Prediction Page (Single-Item Simulator)

This page acts as a "What-If" simulator for a specific product and date. 

**Component Layout (Split View):**
1. **Header:** 
   - Page Title: "Demand Simulator"
2. **Main Split View:**
   - **Left Side - The Input Form (60% width):** 
     - Grouped inputs inside a clean card. 
     - *Section 1: Identifiers* (Store ID, Product ID, Date)
     - *Section 2: Pricing & Promos* (Price, Discount, Promotion Toggle)
     - *Section 3: Environment* (Weather, Seasonality, Epidemic Toggle)
     - *Action:* A prominent "Run Prediction" button.
   - **Right Side - Result Display (40% width):**
     - **Before Run:** A soft placeholder state (e.g., "Enter parameters to generate a forecast").
     - **After Run:** 
       - **Hero Metric:** A massive, animated number showing the predicted `Units Demanded`.
       - **Confidence/Range:** A sub-metric showing the expected variance (e.g., ± 12 units).
       - **Insights Panel:** A small textual summary (e.g., "High demand driven by *Promotion* and *Weather: Sunny*").
