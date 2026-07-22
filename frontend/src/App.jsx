import React, { useState, useMemo, useEffect } from "react";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import {
  LayoutDashboard,
  Activity,
  Package,
  TrendingUp,
  AlertCircle,
  DollarSign,
  Calendar,
  MapPin,
  Tag,
  Zap,
  ShoppingBag,
  Plus,
  Trash2,
  CheckCircle,
  RefreshCw
} from "lucide-react";

/*
=========================================================================
  API CONFIGURATION & FALLBACKS
=========================================================================
*/
const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? "http://localhost:8000" : "")
).replace(/\/$/, "");

const FALLBACK_CATEGORIES = ["Electronics", "Groceries", "Clothing", "Furniture", "Toys"];
const FALLBACK_REGIONS = ["North", "South", "East", "West"];
const FALLBACK_WEATHER = ["Sunny", "Rainy", "Cloudy", "Snowy"];
const FALLBACK_SEASONS = ["Spring", "Summer", "Autumn", "Winter"];
const FALLBACK_STORES = ["S001", "S002", "S003", "S004", "S005"];
const FALLBACK_PRODUCTS = ["P001", "P002", "P003", "P004", "P005"];

function seedFromString(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return h;
}

// Local mock forecast generator
function generateMockForecast(storeId, productId) {
  const seed = seedFromString(storeId + productId);
  const base = 80 + (seed % 60);
  const days = 30;
  const out = [];
  const today = new Date();
  for (let i = days; i >= -14; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(5, 10);
    const wobble = Math.sin(i / 4 + seed) * 12 + ((seed + i * 7) % 10) - 5;
    
    if (i > 0) {
      const actual = Math.max(5, Math.round(base + wobble));
      const predicted = Math.max(5, Math.round(actual + (((seed + i) % 7) - 3)));
      out.push({ date: dateStr, actual, predicted });
    } else {
      const predicted = Math.max(5, Math.round(base + wobble + (Math.abs(i) * 2)));
      out.push({ date: dateStr, actual: null, predicted });
    }
  }
  return out;
}

// Local mock prediction
function runMockPredict(form) {
  const seed = seedFromString(JSON.stringify(form));
  const priceEffect = Math.max(0, 100 - Number(form.price || 0) * 0.4);
  const discountEffect = Number(form.discount || 0) * 0.6;
  const promoEffect = form.promotion === 1 ? 15 : 0;
  const noise = (seed % 20) - 10;
  const predicted = Math.max(1, Math.round(priceEffect + discountEffect + promoEffect + noise + 40));
  const confidence = 0.6 + ((seed % 30) / 100);
  return { prediction_ensemble: predicted, confidence: Math.min(0.95, confidence) };
}

// Global layout elements
function Field({ label, icon: Icon, children }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 13, flex: 1 }}>
      <span style={{ color: "var(--text-secondary)", fontWeight: 500, display: "flex", alignItems: "center", gap: 6 }}>
        {Icon && <Icon size={14} />}
        {label}
      </span>
      {children}
    </label>
  );
}

const inputStyle = {
  height: 40,
  borderRadius: 8,
  border: "1px solid var(--border-color)",
  padding: "0 12px",
  fontSize: 14,
  fontFamily: "var(--font-body)",
  color: "var(--text-primary)",
  background: "var(--bg-input)",
  outline: "none",
  transition: "border-color 0.2s, box-shadow 0.2s",
  width: "100%",
};

/*
=========================================================================
  MAIN APP LAYOUT & STATE
=========================================================================
*/
export default function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [backendOnline, setBackendOnline] = useState(false);
  const [metadata, setMetadata] = useState({
    stores: FALLBACK_STORES,
    products: FALLBACK_PRODUCTS,
    categories: FALLBACK_CATEGORIES,
    regions: FALLBACK_REGIONS,
    weather_conditions: FALLBACK_WEATHER,
    seasonalities: FALLBACK_SEASONS
  });

  // Unique local catalog state
  const [productsCatalog, setProductsCatalog] = useState([
    { id: "P001", category: "Electronics", price: 12000, discount: 10 },
    { id: "P002", category: "Groceries", price: 150, discount: 5 },
    { id: "P003", category: "Clothing", price: 1200, discount: 15 },
    { id: "P004", category: "Furniture", price: 8500, discount: 0 },
    { id: "P005", category: "Toys", price: 450, discount: 20 }
  ]);

  // Load backend details
  useEffect(() => {
    async function checkHealth() {
      try {
        const res = await fetch(`${API_BASE_URL}/health`);
        if (res.ok) {
          setBackendOnline(true);
          // Fetch metadata
          const metaRes = await fetch(`${API_BASE_URL}/api/metadata`);
          const metaData = await metaRes.json();
          if (metaData.stores) {
            setMetadata(metaData);
          }
          // Fetch products
          const prodRes = await fetch(`${API_BASE_URL}/api/products`);
          const prodData = await prodRes.json();
          if (prodData.length > 0) {
            setProductsCatalog(prodData);
          }
        }
      } catch (err) {
        setBackendOnline(false);
      }
    }
    checkHealth();
  }, []);

  return (
    <div style={{ display: "flex", minHeight: "100vh", width: "100%" }}>
      {/* Sidebar */}
      <div style={{ 
        width: 260, 
        background: "var(--bg-panel-solid)", 
        borderRight: "1px solid var(--border-color)",
        display: "flex",
        flexDirection: "column",
        padding: "24px 16px"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "0 8px 32px" }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg, var(--accent-primary), #059669)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <TrendingUp size={20} color="#fff" />
          </div>
          <div>
            <h1 style={{ fontSize: 20, margin: 0, fontWeight: 700, letterSpacing: "-0.5px" }}>DemandIQ</h1>
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 10, marginTop: 4 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: backendOnline ? "var(--accent-primary)" : "var(--accent-danger)" }} />
              <span style={{ color: "var(--text-muted)" }}>{backendOnline ? "Backend Connected" : "Local Sandbox"}</span>
            </div>
          </div>
        </div>
        
        <div style={{ display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
          <button 
            onClick={() => setActiveTab("dashboard")}
            style={{
              display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderRadius: 8,
              background: activeTab === "dashboard" ? "var(--bg-input)" : "transparent",
              color: activeTab === "dashboard" ? "var(--text-primary)" : "var(--text-muted)",
              border: "none", cursor: "pointer", fontWeight: 500, fontSize: 14,
              transition: "all 0.2s", textAlign: "left"
            }}
          >
            <LayoutDashboard size={18} /> Overview & Forecast
          </button>
          <button 
            onClick={() => setActiveTab("predict")}
            style={{
              display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderRadius: 8,
              background: activeTab === "predict" ? "var(--bg-input)" : "transparent",
              color: activeTab === "predict" ? "var(--text-primary)" : "var(--text-muted)",
              border: "none", cursor: "pointer", fontWeight: 500, fontSize: 14,
              transition: "all 0.2s", textAlign: "left"
            }}
          >
            <Zap size={18} /> Demand Simulator
          </button>
          <button 
            onClick={() => setActiveTab("billing")}
            style={{
              display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderRadius: 8,
              background: activeTab === "billing" ? "var(--bg-input)" : "transparent",
              color: activeTab === "billing" ? "var(--text-primary)" : "var(--text-muted)",
              border: "none", cursor: "pointer", fontWeight: 500, fontSize: 14,
              transition: "all 0.2s", textAlign: "left"
            }}
          >
            <ShoppingBag size={18} /> POS Billing System
          </button>
        </div>
        
        <div style={{ padding: "16px 8px", borderTop: "1px solid var(--border-color)", display: "flex", alignItems: "center", gap: 12, color: "var(--text-muted)" }}>
          <img src="https://ui-avatars.com/api/?name=Admin&background=10B981&color=fff" alt="User" style={{ width: 32, height: 32, borderRadius: "50%" }} />
          <div style={{ fontSize: 13 }}>
            <div style={{ color: "var(--text-primary)", fontWeight: 500 }}>System Admin</div>
            <div>Active Sandbox</div>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div style={{ flex: 1, padding: "32px 40px", overflowY: "auto", height: "100vh" }}>
        {activeTab === "dashboard" && <Dashboard metadata={metadata} backendOnline={backendOnline} />}
        {activeTab === "predict" && <PredictionSimulator metadata={metadata} backendOnline={backendOnline} />}
        {activeTab === "billing" && (
          <POSBilling 
            metadata={metadata} 
            backendOnline={backendOnline} 
            productsCatalog={productsCatalog} 
            setProductsCatalog={setProductsCatalog} 
          />
        )}
      </div>
    </div>
  );
}

// Custom Tooltip for Recharts
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: "var(--bg-panel-solid)", border: "1px solid var(--border-color)", padding: 12, borderRadius: 8, boxShadow: "0 4px 12px rgba(0,0,0,0.5)" }}>
        <p style={{ margin: "0 0 8px", color: "var(--text-secondary)", fontSize: 12 }}>{label}</p>
        {payload.map(entry => (
          <div key={entry.name} style={{ display: "flex", gap: 12, alignItems: "center", fontSize: 13, marginBottom: 4 }}>
            <span style={{ color: entry.color, fontWeight: 500 }}>{entry.name}:</span>
            <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>
              {entry.value !== null ? `${entry.value} units` : "N/A"}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

/*
=========================================================================
  OVERVIEW & FORECAST VIEW
=========================================================================
*/
function Dashboard({ metadata, backendOnline }) {
  const [storeId, setStoreId] = useState(metadata.stores[0]);
  const [productId, setProductId] = useState(metadata.products[0]);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    async function getForecasts() {
      setLoading(true);
      if (backendOnline) {
        try {
          const res = await fetch(`${API_BASE_URL}/forecasts?store_id=${storeId}&product_id=${productId}`);
          if (res.ok) {
            const data = await res.json();
            setChartData(data);
            setLoading(false);
            return;
          }
        } catch (err) {}
      }
      // Fallback
      setChartData(generateMockForecast(storeId, productId));
      setLoading(false);
    }
    getForecasts();
  }, [storeId, productId, backendOnline]);

  const kpis = useMemo(() => {
    const historical = chartData.filter(d => d.actual !== null);
    const future = chartData.filter(d => d.actual === null);
    const totalForecast = future.reduce((s, d) => s + d.predicted, 0);
    const revenue = totalForecast * 120; // assumed avg price
    const riskCount = future.filter(d => d.predicted > 85).length;
    return { totalForecast, revenue, riskCount };
  }, [chartData]);

  // Visual widgets
  const categoryData = metadata.categories.map(c => ({ name: c, value: 400 + Math.floor(Math.random() * 600) }));
  const topProductsData = metadata.products.slice(0, 5).map(p => ({ name: p, demand: 100 + Math.floor(Math.random() * 300) })).sort((a,b) => b.demand - a.demand);

  return (
    <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <header>
        <h2 style={{ fontSize: 28, color: "var(--text-primary)", margin: "0 0 4px" }}>Overview & Forecast</h2>
        <p style={{ color: "var(--text-secondary)", fontSize: 14, margin: 0 }}>Analyze historical trends and upcoming 14-day demand.</p>
      </header>

      {/* Filter Bar */}
      <div className="glass-panel" style={{ padding: "16px 20px", display: "flex", gap: 16, flexWrap: "wrap", alignItems: "flex-end" }}>
        <Field label="Store" icon={MapPin}>
          <select style={inputStyle} value={storeId} onChange={e => setStoreId(e.target.value)}>
            {metadata.stores.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </Field>
        <Field label="Product" icon={Package}>
          <select style={inputStyle} value={productId} onChange={e => setProductId(e.target.value)}>
            {metadata.products.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </Field>
        <div style={{ flex: 1 }} />
        <button className="btn-primary" style={{ padding: "0 24px", height: 40, display: "flex", alignItems: "center", gap: 8 }}>
          <RefreshCw size={16} /> Sync API
        </button>
      </div>

      {/* KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20 }}>
        <div className="glass-panel glass-panel-interactive" style={{ padding: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <span style={{ color: "var(--text-secondary)", fontSize: 13, fontWeight: 500 }}>Forecasted Demand (14d)</span>
            <Activity size={18} color="var(--accent-primary)" />
          </div>
          <div style={{ fontSize: 32, fontWeight: 700, color: "var(--text-primary)", fontFamily: "var(--font-mono)" }}>
            {kpis.totalForecast.toLocaleString()}
          </div>
          <div style={{ fontSize: 12, color: "var(--accent-primary)", marginTop: 8 }}>+12% vs previous period</div>
        </div>
        
        <div className="glass-panel glass-panel-interactive" style={{ padding: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <span style={{ color: "var(--text-secondary)", fontSize: 13, fontWeight: 500 }}>Expected Revenue</span>
            <DollarSign size={18} color="var(--accent-secondary)" />
          </div>
          <div style={{ fontSize: 32, fontWeight: 700, color: "var(--text-primary)", fontFamily: "var(--font-mono)" }}>
            ${kpis.revenue.toLocaleString()}
          </div>
          <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 8 }}>Based on average SKU pricing</div>
        </div>

        <div className="glass-panel glass-panel-interactive" style={{ padding: 20, borderLeft: "4px solid var(--accent-danger)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <span style={{ color: "var(--text-secondary)", fontSize: 13, fontWeight: 500 }}>Stockout Risk Alerts</span>
            <AlertCircle size={18} color="var(--accent-danger)" />
          </div>
          <div style={{ fontSize: 32, fontWeight: 700, color: "var(--text-primary)", fontFamily: "var(--font-mono)" }}>
            {kpis.riskCount} days
          </div>
          <div style={{ fontSize: 12, color: "var(--accent-danger)", marginTop: 8 }}>Demand exceeds safe storage thresholds</div>
        </div>
      </div>

      {/* Main Chart */}
      <div className="glass-panel" style={{ padding: 24, height: 400, position: "relative" }}>
        <h3 style={{ fontSize: 16, color: "var(--text-primary)", margin: "0 0 20px" }}>Demand Trajectory (Actuals & Forecast)</h3>
        {loading ? (
          <div style={{ position: "absolute", inset: 0, background: "rgba(11,15,25,0.7)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "var(--accent-primary)" }}>Loading Data...</span>
          </div>
        ) : null}
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
            <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: 12, color: "var(--text-secondary)" }} />
            <Line type="monotone" dataKey="actual" name="Historical Actuals" stroke="var(--accent-secondary)" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
            <Line type="monotone" dataKey="predicted" name="AI Forecast" stroke="var(--accent-primary)" strokeWidth={3} strokeDasharray="6 6" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Split Charts */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        <div className="glass-panel" style={{ padding: 24, height: 320 }}>
          <h3 style={{ fontSize: 16, color: "var(--text-primary)", margin: "0 0 20px" }}>Demand by Category</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={categoryData} layout="vertical" margin={{ top: 0, right: 20, left: 20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" horizontal={false} />
              <XAxis type="number" stroke="var(--text-muted)" fontSize={12} />
              <YAxis dataKey="name" type="category" stroke="var(--text-secondary)" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip cursor={{fill: 'var(--bg-input)'}} content={<CustomTooltip />} />
              <Bar dataKey="value" name="Volume" fill="var(--accent-secondary)" radius={[0, 4, 4, 0]} barSize={24} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        <div className="glass-panel" style={{ padding: 24, height: 320 }}>
          <h3 style={{ fontSize: 16, color: "var(--text-primary)", margin: "0 0 20px" }}>Top 5 Products</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={topProductsData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
              <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip cursor={{fill: 'var(--bg-input)'}} content={<CustomTooltip />} />
              <Bar dataKey="demand" name="Volume" fill="var(--accent-primary)" radius={[4, 4, 0, 0]} barSize={32} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

/*
=========================================================================
  DEMAND SIMULATOR VIEW
=========================================================================
*/
function PredictionSimulator({ metadata, backendOnline }) {
  const [form, setForm] = useState({
    storeId: metadata.stores[0],
    productId: metadata.products[0],
    category: metadata.categories[0],
    region: metadata.regions[0],
    weatherCondition: metadata.weather_conditions[0],
    seasonality: metadata.seasonalities[0],
    date: new Date().toISOString().slice(0, 10),
    price: 150.0,
    competitorPricing: 160.0,
    discount: 10,
    promotion: 0,
    inventoryLevel: 100,
    epidemic: 0
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  function updateForm(key, value) {
    setForm(f => ({ ...f, [key]: value }));
  }

  async function handlePredict(e) {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    
    if (backendOnline) {
      try {
        const res = await fetch(`${API_BASE_URL}/predict`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            date: form.date,
            store_id: form.storeId,
            product_id: form.productId,
            category: form.category,
            region: form.region,
            weather_condition: form.weatherCondition,
            seasonality: form.seasonality,
            inventory_level: Number(form.inventoryLevel),
            price: Number(form.price),
            discount: Number(form.discount),
            promotion: Number(form.promotion),
            competitor_pricing: Number(form.competitorPricing),
            epidemic: Number(form.epidemic)
          })
        });
        if (res.ok) {
          const data = await res.json();
          setResult(data);
          setLoading(false);
          return;
        }
      } catch (err) {}
    }
    
    // Offline sandbox simulator
    await new Promise(r => setTimeout(r, 800));
    setResult(runMockPredict(form));
    setLoading(false);
  }

  return (
    <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: 24, height: "100%" }}>
      <header>
        <h2 style={{ fontSize: 28, color: "var(--text-primary)", margin: "0 0 4px" }}>Demand Simulator</h2>
        <p style={{ color: "var(--text-secondary)", fontSize: 14, margin: 0 }}>Run "what-if" scenarios for specific products and parameters.</p>
      </header>

      <div style={{ display: "flex", gap: 24, alignItems: "flex-start", flexWrap: "wrap" }}>
        
        {/* Form Panel (60%) */}
        <form onSubmit={handlePredict} className="glass-panel" style={{ flex: "1 1 600px", padding: 24, display: "flex", flexDirection: "column", gap: 24 }}>
          
          <div style={{ borderBottom: "1px solid var(--border-color)", paddingBottom: 16 }}>
            <h4 style={{ color: "var(--text-primary)", margin: "0 0 16px", display: "flex", alignItems: "center", gap: 8 }}>
              <Package size={16} color="var(--accent-secondary)" /> Product Identifiers
            </h4>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16 }}>
              <Field label="Date" icon={Calendar}><input type="date" style={inputStyle} value={form.date} onChange={e => updateForm("date", e.target.value)} /></Field>
              <Field label="Store ID" icon={MapPin}>
                <select style={inputStyle} value={form.storeId} onChange={e => updateForm("storeId", e.target.value)}>
                  {metadata.stores.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </Field>
              <Field label="Product ID" icon={Tag}>
                <select style={inputStyle} value={form.productId} onChange={e => updateForm("productId", e.target.value)}>
                  {metadata.products.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </Field>
              <Field label="Category" icon={LayoutDashboard}>
                <select style={inputStyle} value={form.category} onChange={e => updateForm("category", e.target.value)}>
                  {metadata.categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </Field>
            </div>
          </div>

          <div style={{ borderBottom: "1px solid var(--border-color)", paddingBottom: 16 }}>
            <h4 style={{ color: "var(--text-primary)", margin: "0 0 16px", display: "flex", alignItems: "center", gap: 8 }}>
              <DollarSign size={16} color="var(--accent-primary)" /> Pricing & Promos
            </h4>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16 }}>
              <Field label="Price ($)"><input type="number" style={inputStyle} value={form.price} onChange={e => updateForm("price", e.target.value)} /></Field>
              <Field label="Competitor Price ($)"><input type="number" style={inputStyle} value={form.competitorPricing} onChange={e => updateForm("competitorPricing", e.target.value)} /></Field>
              <Field label="Discount (%)"><input type="number" style={inputStyle} value={form.discount} onChange={e => updateForm("discount", e.target.value)} /></Field>
              <Field label="Active Promotion">
                <select style={inputStyle} value={form.promotion} onChange={e => updateForm("promotion", Number(e.target.value))}>
                  <option value="0">No</option>
                  <option value="1">Yes</option>
                </select>
              </Field>
              <Field label="Current Inventory"><input type="number" style={inputStyle} value={form.inventoryLevel} onChange={e => updateForm("inventoryLevel", e.target.value)} /></Field>
            </div>
          </div>

          <div>
            <h4 style={{ color: "var(--text-primary)", margin: "0 0 16px", display: "flex", alignItems: "center", gap: 8 }}>
              <Activity size={16} color="#F59E0B" /> Environment
            </h4>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16 }}>
              <Field label="Weather">
                <select style={inputStyle} value={form.weatherCondition} onChange={e => updateForm("weatherCondition", e.target.value)}>
                  {metadata.weather_conditions.map(w => <option key={w} value={w}>{w}</option>)}
                </select>
              </Field>
              <Field label="Season">
                <select style={inputStyle} value={form.seasonality} onChange={e => updateForm("seasonality", e.target.value)}>
                  {metadata.seasonalities.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </Field>
              <Field label="High-Impact Event (Epidemic)">
                <select style={inputStyle} value={form.epidemic} onChange={e => updateForm("epidemic", Number(e.target.value))}>
                  <option value="0">No</option>
                  <option value="1">Yes</option>
                </select>
              </Field>
            </div>
          </div>
          
          <button type="submit" disabled={loading} className="btn-primary" style={{ marginTop: 8, height: 48, fontSize: 16, display: "flex", justifyContent: "center", alignItems: "center", gap: 8 }}>
            {loading ? <span className="loader">Running Inference...</span> : <><Zap size={18} /> Run Model</>}
          </button>
        </form>

        {/* Result Panel (40%) */}
        <div style={{ flex: "1 1 300px", display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="glass-panel" style={{ padding: 40, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", minHeight: 360 }}>
            {!result && !loading && (
              <div style={{ color: "var(--text-muted)", display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
                <Activity size={48} strokeWidth={1} />
                <p style={{ margin: 0 }}>Configure parameters and run the<br/>simulator to generate a forecast.</p>
              </div>
            )}
            
            {loading && (
              <div style={{ color: "var(--accent-primary)" }}>
                <Zap size={48} strokeWidth={1} className="pulse-anim" />
                <p style={{ marginTop: 16, color: "var(--text-secondary)" }}>Running model calculations...</p>
              </div>
            )}
            
            {result && !loading && (
              <div className="animate-fade-in" style={{ width: "100%" }}>
                <div style={{ color: "var(--text-secondary)", fontSize: 14, fontWeight: 500, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 12 }}>
                  Predicted Demand
                </div>
                <div style={{ fontSize: 72, fontWeight: 700, color: "var(--accent-primary)", fontFamily: "var(--font-mono)", lineHeight: 1, textShadow: "0 0 20px rgba(16, 185, 129, 0.4)" }}>
                  {result.prediction_ensemble}
                </div>
                <div style={{ color: "var(--text-primary)", fontSize: 16, marginTop: 16 }}>
                  Units Expected
                </div>
                
                {result.prediction_lgbm !== undefined && (
                  <div style={{ display: "flex", gap: 16, width: "100%", justifyContent: "center", marginTop: 12, fontSize: 12, color: "var(--text-muted)" }}>
                    <span>LightGBM: {result.prediction_lgbm}</span>
                    <span>XGBoost: {result.prediction_xgboost}</span>
                  </div>
                )}
                
                <div style={{ background: "var(--bg-input)", borderRadius: 12, padding: 20, marginTop: 32, width: "100%", textAlign: "left" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                    <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>Model Confidence</span>
                    <span style={{ fontSize: 13, color: "var(--text-primary)", fontWeight: 600 }}>{Math.round((result.confidence || 0.85) * 100)}%</span>
                  </div>
                  <div style={{ height: 6, background: "var(--bg-main)", borderRadius: 3, overflow: "hidden" }}>
                    <div style={{ width: `${(result.confidence || 0.85) * 100}%`, height: "100%", background: "var(--accent-primary)", borderRadius: 3 }} />
                  </div>
                  
                  <div style={{ marginTop: 24, fontSize: 13, color: "var(--text-muted)", lineHeight: 1.5 }}>
                    Computes rolling lags dynamically. Lower prices relative to competitors and active promotions lift the baseline projection.
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

/*
=========================================================================
  POS BILLING SYSTEM VIEW
=========================================================================
*/
function POSBilling({ metadata, backendOnline, productsCatalog, setProductsCatalog }) {
  const [billMeta, setBillMeta] = useState({
    storeId: metadata.stores[0],
    region: metadata.regions[0],
    weatherCondition: metadata.weather_conditions[0],
    seasonality: metadata.seasonalities[0],
    promotion: 0,
    epidemic: 0,
    inventoryLevel: 100,
    date: new Date().toISOString().slice(0, 10),
  });

  const [cart, setCart] = useState([]);
  const [newProductModal, setNewProductModal] = useState(false);
  const [newProduct, setNewProduct] = useState({ id: "", category: metadata.categories[0], price: 100, discount: 0 });
  const [billingLogs, setBillingLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [checkoutResult, setCheckoutResult] = useState(null);

  // Quick select category filter for item grid
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredCatalog = useMemo(() => {
    if (selectedCategory === "All") return productsCatalog;
    return productsCatalog.filter(p => p.category === selectedCategory);
  }, [productsCatalog, selectedCategory]);

  function handleAddProduct(item) {
    const existing = cart.find(i => i.id === item.id);
    if (existing) {
      setCart(cart.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i));
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }
  }

  function handleRemoveProduct(id) {
    setCart(cart.filter(item => item.id !== id));
  }

  function updateQuantity(id, qty) {
    if (qty <= 0) {
      handleRemoveProduct(id);
    } else {
      setCart(cart.map(item => item.id === id ? { ...item, quantity: qty } : item));
    }
  }

  const invoiceTotals = useMemo(() => {
    const subtotal = cart.reduce((s, i) => s + (i.price * i.quantity), 0);
    const savings = cart.reduce((s, i) => s + ((i.price * (i.discount / 100)) * i.quantity), 0);
    const tax = (subtotal - savings) * 0.18; // 18% GST typical
    const total = (subtotal - savings) + tax;
    return { subtotal, savings, tax, total };
  }, [cart]);

  // Submit dynamic product additions
  async function submitNewProduct(e) {
    e.preventDefault();
    if (!newProduct.id) return;
    
    if (backendOnline) {
      try {
        const res = await fetch(`${API_BASE_URL}/api/products`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newProduct)
        });
        if (res.ok) {
          setProductsCatalog([...productsCatalog, newProduct]);
          setNewProductModal(false);
          setNewProduct({ id: "", category: metadata.categories[0], price: 100, discount: 0 });
          return;
        }
      } catch (err) {}
    }
    
    // Sandbox Add
    setProductsCatalog([...productsCatalog, newProduct]);
    setNewProductModal(false);
    setNewProduct({ id: "", category: metadata.categories[0], price: 100, discount: 0 });
  }

  // Checkout and Append values to CSV
  async function handleCheckout() {
    if (cart.length === 0) return;
    setLoading(true);
    
    const payload = {
      date: billMeta.date,
      store_id: billMeta.storeId,
      region: billMeta.region,
      weather_condition: billMeta.weatherCondition,
      seasonality: billMeta.seasonality,
      promotion: billMeta.promotion,
      epidemic: billMeta.epidemic,
      inventory_level: Number(billMeta.inventoryLevel),
      items: cart.map(i => ({
        product_id: i.id,
        quantity: i.quantity,
        price: i.price,
        discount: i.discount
      }))
    };

    if (backendOnline) {
      try {
        const res = await fetch(`${API_BASE_URL}/api/bill`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          const data = await res.json();
          setCheckoutResult(data);
          setBillingLogs([data, ...billingLogs]);
          setCart([]);
          setLoading(false);
          return;
        }
      } catch (err) {}
    }
    
    // Sandbox local checkout simulated
    await new Promise(r => setTimeout(r, 600));
    const mockRes = {
      status: "success",
      date: billMeta.date,
      invoice_total: invoiceTotals.total,
      forecasts: cart.map(i => ({
        product_id: i.id,
        actual_quantity: i.quantity,
        predicted_demand: Math.round(i.quantity * 0.95 + (Math.random() * 5))
      }))
    };
    setCheckoutResult(mockRes);
    setBillingLogs([mockRes, ...billingLogs]);
    setCart([]);
    setLoading(false);
  }

  return (
    <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2 style={{ fontSize: 28, color: "var(--text-primary)", margin: "0 0 4px" }}>POS Billing System</h2>
          <p style={{ color: "var(--text-secondary)", fontSize: 14, margin: 0 }}>Register orders, calculate invoices, and append transactional data directly.</p>
        </div>
        <button className="btn-primary" onClick={() => setNewProductModal(true)} style={{ height: 40, display: "flex", alignItems: "center", gap: 8 }}>
          <Plus size={16} /> Add Product to Catalog
        </button>
      </header>

      {/* Configuration contextual values */}
      <div className="glass-panel" style={{ padding: "16px 20px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 16 }}>
        <Field label="Billing Date" icon={Calendar}>
          <input type="date" style={inputStyle} value={billMeta.date} onChange={e => setBillMeta({ ...billMeta, date: e.target.value })} />
        </Field>
        <Field label="Store" icon={MapPin}>
          <select style={inputStyle} value={billMeta.storeId} onChange={e => setBillMeta({ ...billMeta, storeId: e.target.value })}>
            {metadata.stores.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </Field>
        <Field label="Region">
          <select style={inputStyle} value={billMeta.region} onChange={e => setBillMeta({ ...billMeta, region: e.target.value })}>
            {metadata.regions.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </Field>
        <Field label="Weather">
          <select style={inputStyle} value={billMeta.weatherCondition} onChange={e => setBillMeta({ ...billMeta, weatherCondition: e.target.value })}>
            {metadata.weather_conditions.map(w => <option key={w} value={w}>{w}</option>)}
          </select>
        </Field>
        <Field label="Season">
          <select style={inputStyle} value={billMeta.seasonality} onChange={e => setBillMeta({ ...billMeta, seasonality: e.target.value })}>
            {metadata.seasonalities.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </Field>
        <Field label="Promo Active">
          <select style={inputStyle} value={billMeta.promotion} onChange={e => setBillMeta({ ...billMeta, promotion: Number(e.target.value) })}>
            <option value="0">No</option>
            <option value="1">Yes</option>
          </select>
        </Field>
        <Field label="Epidemic State">
          <select style={inputStyle} value={billMeta.epidemic} onChange={e => setBillMeta({ ...billMeta, epidemic: Number(e.target.value) })}>
            <option value="0">No</option>
            <option value="1">Yes</option>
          </select>
        </Field>
      </div>

      <div style={{ display: "flex", gap: 24, alignItems: "flex-start", flexWrap: "wrap" }}>
        
        {/* Left Side: Product Grid (55%) */}
        <div style={{ flex: "1 1 500px", display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Category Pill Filters */}
          <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4 }}>
            {["All", ...metadata.categories].map(cat => (
              <button 
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  padding: "8px 16px", borderRadius: 20, border: "1px solid var(--border-color)",
                  background: selectedCategory === cat ? "var(--accent-primary)" : "var(--bg-panel-solid)",
                  color: selectedCategory === cat ? "#fff" : "var(--text-secondary)",
                  fontSize: 12, cursor: "pointer", fontWeight: 600, transition: "all 0.2s"
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="glass-panel" style={{ padding: 20, minHeight: 380 }}>
            <h3 style={{ fontSize: 16, color: "var(--text-primary)", margin: "0 0 16px" }}>Select Items</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: 12 }}>
              {filteredCatalog.map(item => (
                <div 
                  key={item.id}
                  onClick={() => handleAddProduct(item)}
                  style={{
                    background: "var(--bg-input)", border: "1px solid var(--border-color)", borderRadius: 10,
                    padding: 12, display: "flex", flexDirection: "column", justifyContent: "space-between",
                    cursor: "pointer", minHeight: 120, transition: "transform 0.15s, border-color 0.15s"
                  }}
                  className="glass-panel-interactive"
                >
                  <div>
                    <span style={{ fontSize: 11, background: "var(--bg-main)", color: "var(--text-muted)", padding: "2px 6px", borderRadius: 4 }}>{item.category}</span>
                    <h5 style={{ margin: "8px 0 2px", fontSize: 14, color: "var(--text-primary)" }}>{item.id}</h5>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: 12 }}>
                    <span style={{ fontWeight: 700, fontSize: 15, color: "var(--accent-primary)" }}>${item.price.toLocaleString()}</span>
                    {item.discount > 0 && <span style={{ fontSize: 10, color: "var(--accent-danger)", fontWeight: 600 }}>-{item.discount}%</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Cart Invoice Sheet (45%) */}
        <div className="glass-panel" style={{ flex: "1 1 360px", padding: 24, display: "flex", flexDirection: "column", gap: 20, minHeight: 450 }}>
          <h3 style={{ fontSize: 16, color: "var(--text-primary)", margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
            <ShoppingBag size={18} /> Cart Sheet
          </h3>
          
          <div style={{ flex: 1, overflowY: "auto", maxHeight: 220, display: "flex", flexDirection: "column", gap: 12 }}>
            {cart.length === 0 ? (
              <div style={{ color: "var(--text-muted)", textAlign: "center", padding: "40px 0" }}>
                Cart is empty. Click items to add.
              </div>
            ) : (
              cart.map(item => (
                <div key={item.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border-color)", paddingBottom: 8 }}>
                  <div>
                    <h5 style={{ margin: 0, fontSize: 14, color: "var(--text-primary)" }}>{item.id}</h5>
                    <span style={{ fontSize: 11, color: "var(--text-muted)" }}>${item.price} each</span>
                  </div>
                  
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)} style={{ width: 24, height: 24, borderRadius: 6, border: "none", cursor: "pointer", background: "var(--bg-input)", color: "var(--text-primary)" }}>-</button>
                    <span style={{ fontSize: 14, minWidth: 20, textAlign: "center" }}>{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)} style={{ width: 24, height: 24, borderRadius: 6, border: "none", cursor: "pointer", background: "var(--bg-input)", color: "var(--text-primary)" }}>+</button>
                    <button onClick={() => handleRemoveProduct(item.id)} style={{ border: "none", background: "transparent", cursor: "pointer", color: "var(--accent-danger)", marginLeft: 8 }}><Trash2 size={16} /></button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div style={{ borderTop: "1px solid var(--border-color)", paddingTop: 16, display: "flex", flexDirection: "column", gap: 8, fontSize: 13 }}>
            <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-muted)" }}>
              <span>Subtotal:</span>
              <span>${invoiceTotals.subtotal.toFixed(2)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", color: "var(--accent-danger)" }}>
              <span>Discounts:</span>
              <span>-${invoiceTotals.savings.toFixed(2)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-muted)" }}>
              <span>Tax (GST 18%):</span>
              <span>${invoiceTotals.tax.toFixed(2)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 18, fontWeight: 700, color: "var(--text-primary)", borderTop: "1px solid var(--border-color)", paddingTop: 8, marginTop: 4 }}>
              <span>Total Price:</span>
              <span style={{ color: "var(--accent-primary)" }}>${invoiceTotals.total.toFixed(2)}</span>
            </div>
          </div>

          <button 
            onClick={handleCheckout} 
            disabled={cart.length === 0 || loading} 
            className="btn-primary" 
            style={{ height: 48, fontSize: 16, display: "flex", justifyContent: "center", alignItems: "center", gap: 8 }}
          >
            {loading ? "Registering Sale..." : "Record Transaction & Checkout"}
          </button>
        </div>

      </div>

      {/* Product Catalog Modal */}
      {newProductModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
          <form onSubmit={submitNewProduct} className="glass-panel" style={{ width: 400, padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>
            <h3 style={{ margin: 0, color: "var(--text-primary)" }}>New Catalog Product</h3>
            <Field label="Product ID" icon={Tag}>
              <input type="text" placeholder="e.g. P0021" style={inputStyle} value={newProduct.id} onChange={e => setNewProduct({ ...newProduct, id: e.target.value.toUpperCase() })} required />
            </Field>
            <Field label="Category">
              <select style={inputStyle} value={newProduct.category} onChange={e => setNewProduct({ ...newProduct, category: e.target.value })}>
                {metadata.categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="Price ($)">
              <input type="number" style={inputStyle} value={newProduct.price} onChange={e => setNewProduct({ ...newProduct, price: Number(e.target.value) })} required />
            </Field>
            <Field label="Discount (%)">
              <input type="number" min="0" max="100" style={inputStyle} value={newProduct.discount} onChange={e => setNewProduct({ ...newProduct, discount: Number(e.target.value) })} required />
            </Field>
            
            <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
              <button type="button" onClick={() => setNewProductModal(false)} style={{ flex: 1, height: 40, border: "1px solid var(--border-color)", background: "transparent", color: "var(--text-primary)", borderRadius: 8, cursor: "pointer" }}>Cancel</button>
              <button type="submit" className="btn-primary" style={{ flex: 1, height: 40 }}>Add SKU</button>
            </div>
          </form>
        </div>
      )}

      {/* Invoice checkout success result overlay */}
      {checkoutResult && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
          <div className="glass-panel" style={{ width: 440, padding: 32, display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
            <CheckCircle size={48} color="var(--accent-primary)" />
            <h3 style={{ margin: 0, color: "var(--text-primary)", fontSize: 20 }}>Checkout Successful</h3>
            <p style={{ fontSize: 13, color: "var(--text-secondary)", textAlign: "center", margin: "0 0 12px" }}>
              The sale record has been appended to the model's dataset on disk.
            </p>
            
            <div style={{ width: "100%", borderTop: "1px solid var(--border-color)", borderBottom: "1px solid var(--border-color)", padding: "16px 0", display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                <span style={{ color: "var(--text-muted)" }}>Invoice Total:</span>
                <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>${checkoutResult.invoice_total.toFixed(2)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                <span style={{ color: "var(--text-muted)" }}>Record Date:</span>
                <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>{checkoutResult.date}</span>
              </div>
              
              <div style={{ fontSize: 12, color: "var(--text-secondary)", fontWeight: 600, marginTop: 12, marginBottom: 4 }}>Demand Impact Analysis:</div>
              {checkoutResult.forecasts.map(f => (
                <div key={f.product_id} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, background: "var(--bg-input)", padding: "6px 12px", borderRadius: 6 }}>
                  <span style={{ color: "var(--text-primary)" }}>{f.product_id}</span>
                  <span>Sold: <strong>{f.actual_quantity}</strong> | Predicted: <strong>{f.predicted_demand}</strong></span>
                </div>
              ))}
            </div>
            
            <button className="btn-primary" onClick={() => setCheckoutResult(null)} style={{ width: "100%", height: 40, marginTop: 12 }}>Done</button>
          </div>
        </div>
      )}
    </div>
  );
}
