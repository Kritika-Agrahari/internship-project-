# Week 1 Submission — Kritika Agrahari — I1

## 🔗 Project Links & Resources
- **Public Repository Link:** [ai_mlinternship](../README.md)
- **Design Document:** [docs/design_doc.md](design_doc.md)

---

## 🛠️ Technology Stack
| Component | Choice | Why (One Line Justification) |
| :--- | :--- | :--- |
| **Database / Storage** | Local CSV / RAM | File-based inputs keep the first version simple and easy to validate locally. |
| **Data Ingestion** | Python / Pandas | High performance dataframe manipulation and composite joins across multiple reference files. |
| **Model Ingestion & Serving** | Flask (Python) | Lightweight backend for serving prediction endpoints later in the build. |
| **Inference Pipeline** | LightGBM | Strong tabular forecasting baseline for the planned demand model. |
| **Visual Dashboard** | HTML5 / CSS3 / Plotly.js | Flexible charting layer for the planned dashboard experience. |

---

## 📊 Data Layer Validation
Below is the output log validating the successful ingestion, schema verification, and memory engineering of the sales, catalog, and store files:

```text
=== Starting Ingestion and Validation Audit from <local raw data directory> ===

[SUCCESS] Found sales.csv
  * Ingested shape: (sample)
  * Columns validated: [date, item_id, quantity, price_base, store_id]
  * Memory reduced after downcasting
  * Data Preview (First 3 rows):
 store_id      item_id  quantity  price_base
        ...          ...       ...        ...

[SUCCESS] Found catalog.csv
  * Ingested shape: (sample)
  * Columns validated: [item_id, dept_name, class_name, item_type]
  * Memory reduced after downcasting
  * Data Preview (First 3 rows):
     item_id                dept_name         class_name item_type
            ...                    ...                ...       ...

[SUCCESS] Found stores.csv
  * Ingested shape: (sample)
  * Columns validated: [store_id, division, format, city]
  * Memory reduced after downcasting
  * Data Preview (First 3 rows):
 store_id division           format  city
        ...     ...              ...   ...
```

---

## 🧠 What I Learned This Week
- **Memory Downcasting in Pandas**: Learned to downcast numerical data types (e.g. `int64` to `int16`/`int8`) based on minimum/maximum value limits, which reduces memory pressure on large CSV inputs.
- **Chronological Time-Series Splits**: Discovered that standard random cross-validation splits introduce future leakage (look-ahead bias) via lags and rolling aggregates. Employed date-ordered splits to simulate production evaluation.
- **Composite Key Joins**: Learned why joining retail tables on composite keys (`store_id`, `item_id`, `date`) needs careful handling of missing sequences.
- **Documentation Discipline**: Learned that the README, design doc, and submission issue all need to tell the same story or the project looks less complete than it is.

---

## 📈 Weekly Status Report

### ✅ What's Done
- [x] Created public GitHub repository.
- [x] Initial design document finalized under `docs/design_doc.md`.
- [x] Set up data ingestion and memory engineering validation script.
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
