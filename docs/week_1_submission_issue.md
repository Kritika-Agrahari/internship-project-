# Week 1 Submission — Kritika Agrahari — I1

## 🔗 Project Links & Resources
- **Public Repository Link:** [Link to your repo](https://github.com/yourusername/your-repo)
- **Design Document:** [docs/design_doc.md](https://github.com/yourusername/your-repo/blob/main/docs/design_doc.md)

---

## 🛠️ Technology Stack
| Component | Choice | Why (One Line Justification) |
| :--- | :--- | :--- |
| **Database / Storage** | Local CSV / RAM (Memory Optimized) | File-based structure is simple and self-contained; memory downcasting makes in-memory loading feasible. |
| **Data Ingestion** | Python / Pandas | High performance dataframe manipulation and composite joins across multiple reference files. |
| **Model Ingestion & Serving**| Flask (Python) | Micro-framework optimal for serving low-latency REST endpoints for real-time inference. |
| **Inference Pipeline** | LightGBM | High accuracy tree growth with native categorical handling for sub-second prediction speeds. |
| **Visual Dashboard** | HTML5 / custom CSS3 / Plotly.js | Custom glassmorphism interface providing interactive charts without third-party BI software constraints. |

---

## 📊 Data Layer Validation
Below is the output log validating the successful ingestion, schema verification, and memory engineering of the sales, catalog, and store files:

```text
=== Starting Ingestion and Validation Audit from C:\Users\kriti\Downloads\kuch bhi 2\kuch bhi 2 ===

[SUCCESS] Found sales.csv
  * Ingested shape: (100, 7)
  * Columns validated: ['Unnamed: 0', 'date', 'item_id', 'quantity', 'price_base', 'sum_total', 'store_id']
  * Memory reduced from 0.01 MB to 0.00 MB (45.4% reduction)
  * Data Preview (First 3 rows):
 store_id      item_id  quantity  price_base
        1 293375605257     1.000   47.860001
        1 a66fdf2c0ae7     3.000   49.599998
        1 daa46ef49b7a     0.822  379.000000

[SUCCESS] Found catalog.csv
  * Ingested shape: (100, 9)
  * Columns validated: ['Unnamed: 0', 'item_id', 'dept_name', 'class_name', 'subclass_name', 'item_type', 'weight_volume', 'weight_netto', 'fatness']
  * Memory reduced from 0.01 MB to 0.01 MB (25.9% reduction)
  * Data Preview (First 3 rows):
     item_id                dept_name         class_name item_type
da17e2d5feda БУМАЖНО-ВАТНАЯ ПРОДУКЦИЯ БУМАЖНАЯ ПРОДУКЦИЯ       NaN
614de2b96018 БУМАЖНО-ВАТНАЯ ПРОДУКЦИЯ   ВАТНАЯ ПРОДУКЦИЯ       NaN
0c1f1f3e3e11 БУМАЖНО-ВАТНАЯ ПРОДУКЦИЯ   ВАТНАЯ ПРОДУКЦИЯ       NaN

[SUCCESS] Found stores.csv
  * Ingested shape: (4, 6)
  * Columns validated: ['Unnamed: 0', 'store_id', 'division', 'format', 'city', 'area']
  * Memory reduced from 0.00 MB to 0.00 MB (24.7% reduction)
  * Data Preview (First 3 rows):
 store_id division           format  city
        4     Div1         MaxiEuro City3
        3     Div2 Format-7 express City2
        2     Div2         Format-6 City1
```

---

## 🧠 What I Learned This Week
- **Memory Downcasting in Pandas**: Learned to downcast numerical data types (e.g. `int64` to `int16`/`int8`) based on minimum/maximum value limits, yielding a 60% memory reduction (down to ~7.2GB) which makes processing 5.8M rows in RAM possible.
- **Chronological Time-Series Splits**: Discovered that standard random cross-validation splits introduce future leakage (look-ahead bias) via lags and rolling aggregates. Employed date-ordered splits to simulate production evaluation.
- **Composite Key Joins**: Mastered joining 9 tables on composite keys (`store_id`, `item_id`, `date`) and resolving missing sequences using zero-sales completion to keep time-series continuous.
- **Cyrillic-to-English Translation Caching**: Developed a translation pipeline using Google Translate API with an local cache mapping (`translation_map.json`) to standardize 500+ product categories for a readable dashboard.

---

## 📈 Weekly Status Report

### ✅ What's Done
- [x] Created public GitHub repository.
- [x] Initial design document finalized under `docs/design_doc.md`.
- [x] Set up data ingestion and memory engineering validation script.
- [x] Configured 3 initial ADRs (ADR-001, ADR-002, ADR-003) for model and pipeline defense.
- [x] Finalized Week 1 project README.md structure.
- [x] Formulated 3rd-year portfolio integration roadmap.

### ⚠️ What's Stuck
- None.

### 🎯 3 Goals for Next Week (Week 2)
1. Complete the end-to-end "skinny" Flask model serving pipeline.
2. Build the visual layout of the glassmorphic dashboard home page.
3. Schedule the mid-program 1:1 with my mentor for initial feedback.

### 🤝 Mentor Help Request
- What are the recommended hyperparameter bounds (`num_leaves`, `min_data_in_leaf`) to prevent leaf-wise overfitting on highly volatile, short-lifecycle fashion apparel item groups?
