# Tech Stack & Architecture Specification

Based on the existing Python/ML ecosystem and the requirements for the input form and dashboard, here is the proposed technology stack for the Demand Forecasting application.

## 1. Backend Architecture

Since the core machine learning pipeline (`joblib` models, Pandas data processing) is in Python, the backend must be built in Python to seamlessly integrate the prediction logic.

- **Framework:** **FastAPI**
  - *Why:* It's the modern standard for ML APIs. It is lightweight, extremely fast, handles async requests natively, and provides out-of-the-box Swagger UI documentation, making it easy to test our endpoints before the frontend is even ready.
- **Data Processing:** `Pandas` and `NumPy` for on-the-fly feature engineering and dashboard data aggregation.
- **Model Inference:** `scikit-learn` and `joblib` for loading the saved pipeline.

## 2. Frontend Architecture

To keep the application responsive, maintainable, and modern, we will use a decoupled Single Page Application (SPA) architecture that calls the FastAPI backend via HTTP.

- **Framework:** **React.js** (scaffolded via **Vite**)
  - *Why:* React's component-based architecture is perfect for building isolated dashboard widgets (KPI cards, charts, forms). Vite will give us a blazing fast local development server compared to Create React App.
- **Styling:** **Vanilla CSS** or **CSS Modules**
  - *Why:* We want to focus on clean, premium aesthetics (glassmorphism, vibrant colors, modern typography) without being bogged down by heavy utility frameworks unless specifically requested.

## 3. State Management

The dashboard's state is relatively flat and localized. 

- **Choice:** Built-in React Hooks (`useState`, `useEffect`, `useMemo`).
- **Why:** The application doesn't have deeply nested component trees that need to share complex global state, which makes Redux massive overkill. We will simply use `fetch()` inside `useEffect` hooks to pull data from the FastAPI endpoints, store the resulting JSON in `useState`, and pass it down as props to the charting components.

## 4. Charting & Visualization

- **Choice:** **Recharts**
- **Why:** Recharts is built specifically for React with declarative, composable components (e.g., `<LineChart>`, `<BarChart>`). It handles responsiveness out of the box and natively accepts arrays of JSON objects, which maps perfectly to the expected JSON payload from our FastAPI backend. It's much easier to integrate into a React tree than Chart.js (which relies on canvas and direct DOM manipulation).
