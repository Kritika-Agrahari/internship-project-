import React, { useState, useMemo } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

/*
=========================================================================
  API WIRING — replace the two functions below with real calls
=========================================================================
  const API_BASE_URL = "https://your-api.example.com";

  async function fetchForecast(storeId, productId) {
    const res = await fetch(
      `${API_BASE_URL}/forecasts?store_id=${storeId}&product_id=${productId}`
    );
    if (!res.ok) throw new Error("Failed to load forecast");
    return res.json(); // expected: [{ date, demand, predicted }]
  }

  async function postPrediction(payload) {
    const res = await fetch(`${API_BASE_URL}/predict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Prediction failed");
    return res.json(); // expected: { predicted_demand, confidence }
  }
=========================================================================
*/

const CATEGORIES = ["Electronics", "Groceries", "Clothing", "Furniture", "Toys"];
const REGIONS = ["North", "South", "East", "West"];
const WEATHER = ["Sunny", "Rainy", "Cloudy", "Snowy"];
const SEASONS = ["Spring", "Summer", "Autumn", "Winter"];
const STORES = ["S001", "S002", "S003", "S004", "S005"];
const PRODUCTS = ["P001", "P002", "P003", "P004", "P005"];

function seedFromString(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return h;
}

// mock forecast generator — swap for fetchForecast() above
function mockForecast(storeId, productId) {
  const seed = seedFromString(storeId + productId);
  const base = 80 + (seed % 60);
  const days = 30;
  const out = [];
  const today = new Date();
  for (let i = days; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const wobble = Math.sin(i / 4 + seed) * 12 + ((seed + i * 7) % 10) - 5;
    const actual = Math.max(5, Math.round(base + wobble));
    const predicted = Math.max(5, Math.round(actual + (((seed + i) % 7) - 3)));
    out.push({
      date: d.toISOString().slice(5, 10),
      actual,
      predicted,
    });
  }
  return out;
}

// mock prediction — swap for postPrediction() above
function mockPredict(form) {
  const seed = seedFromString(JSON.stringify(form));
  const priceEffect = Math.max(0, 100 - Number(form.price || 0) * 0.4);
  const discountEffect = Number(form.discount || 0) * 0.6;
  const promoEffect = form.promotion === "yes" ? 15 : 0;
  const noise = (seed % 20) - 10;
  const predicted = Math.max(1, Math.round(priceEffect + discountEffect + promoEffect + noise + 40));
  const confidence = 0.6 + ((seed % 30) / 100);
  return { predicted_demand: predicted, confidence: Math.min(0.95, confidence) };
}

function Field({ label, children }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 13 }}>
      <span style={{ color: "#5F5E5A", fontWeight: 500 }}>{label}</span>
      {children}
    </label>
  );
}

const inputStyle = {
  height: 36,
  borderRadius: 6,
  border: "1px solid #D3D1C7",
  padding: "0 10px",
  fontSize: 14,
  fontFamily: "inherit",
  color: "#1B1F1D",
  background: "#FFFFFF",
  outline: "none",
};

export default function DemandForecastApp() {
  const [tab, setTab] = useState("dashboard");
  const [storeId, setStoreId] = useState(STORES[0]);
  const [productId, setProductId] = useState(PRODUCTS[0]);

  const [form, setForm] = useState({
    storeId: STORES[0],
    productId: PRODUCTS[0],
    category: CATEGORIES[0],
    region: REGIONS[0],
    weather: WEATHER[0],
    season: SEASONS[0],
    date: new Date().toISOString().slice(0, 10),
    price: 50,
    discount: 10,
    promotion: "no",
    competitorPrice: 55,
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const forecastData = useMemo(() => mockForecast(storeId, productId), [storeId, productId]);

  const kpis = useMemo(() => {
    const totalDemand = forecastData.reduce((s, d) => s + d.actual, 0);
    const avgDemand = Math.round(totalDemand / forecastData.length);
    const last = forecastData[forecastData.length - 1];
    const prev = forecastData[forecastData.length - 2];
    const delta = last && prev ? last.actual - prev.actual : 0;
    const mae = Math.round(
      forecastData.reduce((s, d) => s + Math.abs(d.actual - d.predicted), 0) / forecastData.length
    );
    return { totalDemand, avgDemand, delta, mae };
  }, [forecastData]);

  function updateForm(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handlePredict(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      // Swap mockPredict(form) for: await postPrediction(form)
      await new Promise((r) => setTimeout(r, 500));
      const res = mockPredict(form);
      setResult(res);
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  const tabBtnStyle = (active) => ({
    padding: "8px 16px",
    borderRadius: 6,
    border: "1px solid " + (active ? "#0F6E56" : "#D3D1C7"),
    background: active ? "#0F6E56" : "#FFFFFF",
    color: active ? "#FFFFFF" : "#5F5E5A",
    fontSize: 14,
    fontWeight: 500,
    cursor: "pointer",
  });

  return (
    <div
      style={{
        fontFamily: "Inter, system-ui, sans-serif",
        background: "#F3F4F2",
        minHeight: "100vh",
        padding: "24px",
        color: "#1B1F1D",
      }}
    >
      <div style={{ maxWidth: 960, margin: "0 auto" }}>
        <header style={{ marginBottom: 20 }}>
          <h1
            style={{
              fontFamily: "Georgia, 'Fraunces', serif",
              fontSize: 26,
              fontWeight: 600,
              margin: 0,
              letterSpacing: "-0.01em",
            }}
          >
            Demand Forecast Studio
          </h1>
          <p style={{ color: "#5F5E5A", fontSize: 14, marginTop: 4 }}>
            Dashboard and prediction tool — currently running on mock data. Wire in your API in
            the code header to go live.
          </p>
        </header>

        <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
          <button style={tabBtnStyle(tab === "dashboard")} onClick={() => setTab("dashboard")}>
            Dashboard
          </button>
          <button style={tabBtnStyle(tab === "predict")} onClick={() => setTab("predict")}>
            Predict demand
          </button>
        </div>

        {tab === "dashboard" && (
          <div>
            <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
              <Field label="Store">
                <select style={inputStyle} value={storeId} onChange={(e) => setStoreId(e.target.value)}>
                  {STORES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </Field>
              <Field label="Product">
                <select style={inputStyle} value={productId} onChange={(e) => setProductId(e.target.value)}>
                  {PRODUCTS.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </Field>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
                gap: 12,
                marginBottom: 24,
              }}
            >
              {[
                { label: "Total demand (30d)", value: kpis.totalDemand },
                { label: "Avg daily demand", value: kpis.avgDemand },
                { label: "Latest day change", value: (kpis.delta >= 0 ? "+" : "") + kpis.delta },
                { label: "Avg abs. error (MAE)", value: kpis.mae },
              ].map((k) => (
                <div
                  key={k.label}
                  style={{
                    background: "#FFFFFF",
                    border: "1px solid #E2E1DC",
                    borderRadius: 10,
                    padding: "14px 16px",
                  }}
                >
                  <div style={{ fontSize: 12, color: "#5F5E5A", marginBottom: 6 }}>{k.label}</div>
                  <div style={{ fontSize: 22, fontWeight: 600, fontFamily: "'IBM Plex Mono', monospace" }}>
                    {k.value}
                  </div>
                </div>
              ))}
            </div>

            <div
              style={{
                background: "#FFFFFF",
                border: "1px solid #E2E1DC",
                borderRadius: 10,
                padding: "16px",
                marginBottom: 24,
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 12, color: "#5F5E5A" }}>
                Actual vs predicted demand — last 30 days
              </div>
              <div style={{ width: "100%", height: 260 }}>
                <ResponsiveContainer>
                  <LineChart data={forecastData}>
                    <CartesianGrid stroke="#E2E1DC" vertical={false} />
                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#5F5E5A" }} />
                    <YAxis tick={{ fontSize: 11, fill: "#5F5E5A" }} />
                    <Tooltip />
                    <Line type="monotone" dataKey="actual" stroke="#0F6E56" strokeWidth={2} dot={false} name="Actual" />
                    <Line type="monotone" dataKey="predicted" stroke="#BA7517" strokeWidth={2} dot={false} strokeDasharray="4 3" name="Predicted" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div style={{ display: "flex", gap: 16, marginTop: 8, fontSize: 12, color: "#5F5E5A" }}>
                <span><span style={{ display: "inline-block", width: 10, height: 10, background: "#0F6E56", borderRadius: 2, marginRight: 4 }} />Actual</span>
                <span><span style={{ display: "inline-block", width: 10, height: 10, background: "#BA7517", borderRadius: 2, marginRight: 4 }} />Predicted</span>
              </div>
            </div>

            <div style={{ background: "#FFFFFF", border: "1px solid #E2E1DC", borderRadius: 10, padding: "16px" }}>
              <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 12, color: "#5F5E5A" }}>
                Recent forecasts
              </div>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ textAlign: "left", color: "#5F5E5A", borderBottom: "1px solid #E2E1DC" }}>
                    <th style={{ padding: "6px 4px" }}>Date</th>
                    <th style={{ padding: "6px 4px" }}>Actual</th>
                    <th style={{ padding: "6px 4px" }}>Predicted</th>
                    <th style={{ padding: "6px 4px" }}>Error</th>
                  </tr>
                </thead>
                <tbody>
                  {forecastData.slice(-8).reverse().map((row) => (
                    <tr key={row.date} style={{ borderBottom: "1px solid #F0EFEA" }}>
                      <td style={{ padding: "6px 4px" }}>{row.date}</td>
                      <td style={{ padding: "6px 4px", fontFamily: "'IBM Plex Mono', monospace" }}>{row.actual}</td>
                      <td style={{ padding: "6px 4px", fontFamily: "'IBM Plex Mono', monospace" }}>{row.predicted}</td>
                      <td style={{ padding: "6px 4px", fontFamily: "'IBM Plex Mono', monospace", color: Math.abs(row.actual - row.predicted) > 10 ? "#C1440E" : "#5F5E5A" }}>
                        {row.actual - row.predicted}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === "predict" && (
          <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
            <form
              onSubmit={handlePredict}
              style={{
                flex: "1 1 360px",
                background: "#FFFFFF",
                border: "1px solid #E2E1DC",
                borderRadius: 10,
                padding: "20px",
                display: "flex",
                flexDirection: "column",
                gap: 14,
              }}
            >
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <Field label="Store">
                  <select style={inputStyle} value={form.storeId} onChange={(e) => updateForm("storeId", e.target.value)}>
                    {STORES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </Field>
                <Field label="Product">
                  <select style={inputStyle} value={form.productId} onChange={(e) => updateForm("productId", e.target.value)}>
                    {PRODUCTS.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                </Field>
                <Field label="Category">
                  <select style={inputStyle} value={form.category} onChange={(e) => updateForm("category", e.target.value)}>
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </Field>
                <Field label="Region">
                  <select style={inputStyle} value={form.region} onChange={(e) => updateForm("region", e.target.value)}>
                    {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                </Field>
                <Field label="Weather">
                  <select style={inputStyle} value={form.weather} onChange={(e) => updateForm("weather", e.target.value)}>
                    {WEATHER.map((w) => <option key={w} value={w}>{w}</option>)}
                  </select>
                </Field>
                <Field label="Season">
                  <select style={inputStyle} value={form.season} onChange={(e) => updateForm("season", e.target.value)}>
                    {SEASONS.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </Field>
                <Field label="Date">
                  <input type="date" style={inputStyle} value={form.date} onChange={(e) => updateForm("date", e.target.value)} />
                </Field>
                <Field label="Promotion running">
                  <select style={inputStyle} value={form.promotion} onChange={(e) => updateForm("promotion", e.target.value)}>
                    <option value="no">No</option>
                    <option value="yes">Yes</option>
                  </select>
                </Field>
                <Field label="Price">
                  <input type="number" style={inputStyle} value={form.price} onChange={(e) => updateForm("price", e.target.value)} />
                </Field>
                <Field label="Competitor price">
                  <input type="number" style={inputStyle} value={form.competitorPrice} onChange={(e) => updateForm("competitorPrice", e.target.value)} />
                </Field>
                <Field label="Discount (%)">
                  <input type="number" style={inputStyle} value={form.discount} onChange={(e) => updateForm("discount", e.target.value)} />
                </Field>
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  height: 40,
                  borderRadius: 8,
                  border: "none",
                  background: "#0F6E56",
                  color: "#FFFFFF",
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: loading ? "default" : "pointer",
                  opacity: loading ? 0.7 : 1,
                }}
              >
                {loading ? "Predicting..." : "Predict demand"}
              </button>
              {error && <div style={{ color: "#C1440E", fontSize: 13 }}>{error}</div>}
            </form>

            <div style={{ flex: "1 1 260px", display: "flex", flexDirection: "column", gap: 12 }}>
              <div
                style={{
                  background: "#FFFFFF",
                  border: "1px solid #E2E1DC",
                  borderRadius: 10,
                  padding: "20px",
                  minHeight: 180,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  textAlign: "center",
                }}
              >
                {!result && !loading && (
                  <div style={{ color: "#5F5E5A", fontSize: 13 }}>
                    Fill in the form and click Predict demand to see a forecast here.
                  </div>
                )}
                {loading && <div style={{ color: "#5F5E5A", fontSize: 13 }}>Running prediction…</div>}
                {result && (
                  <>
                    <div style={{ fontSize: 12, color: "#5F5E5A", marginBottom: 6 }}>Predicted demand</div>
                    <div style={{ fontSize: 40, fontWeight: 600, fontFamily: "'IBM Plex Mono', monospace", color: "#0F6E56" }}>
                      {result.predicted_demand}
                    </div>
                    <div style={{ fontSize: 12, color: "#5F5E5A", marginTop: 10, marginBottom: 4 }}>
                      Confidence: {Math.round(result.confidence * 100)}%
                    </div>
                    <div style={{ width: "100%", height: 8, background: "#E2E1DC", borderRadius: 4, overflow: "hidden" }}>
                      <div
                        style={{
                          width: `${Math.round(result.confidence * 100)}%`,
                          height: "100%",
                          background: "#0F6E56",
                        }}
                      />
                    </div>
                  </>
                )}
              </div>
              <div style={{ fontSize: 12, color: "#5F5E5A", padding: "0 4px" }}>
                This result is generated with mock logic. Once your API is wired in (see
                postPrediction at the top of the file), it will call your trained model directly.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
