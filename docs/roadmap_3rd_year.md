# Indian Apparel Demand Forecasting & Secure Analytics System — 3rd Year Extension Roadmap

## What this project is today (2-3 lines)
Currently, this is a local retail forecasting project centered on apparel demand prediction, data validation, and documentation. The current scope emphasizes the data layer and the planned modeling stack rather than a fully deployed product.

---

## The arc: where this could be by 3rd year internship (May 2027)
By May 2027, this project will evolve from a static web application into a **Production-Grade MLOps & Inventory Intelligence Platform**. It will feature live-updating data streams (via Kafka), containerized deployment on cloud infrastructure, an automated model retraining loop using MLflow to manage drift, and deep learning forecasting architectures (such as Temporal Fusion Transformers) to improve accuracy on highly volatile items.

---

## 3rd Year Semester Plan (Aug 2026 - Dec 2026)

### Milestone 1 (Aug-Sep 2026): MLOps Foundation & Experiment Tracking
- **What I'll add**: Integrate MLflow to log training runs, hyperparameters, metrics (RMSE, R²), and model files. Add automatic feature validation using Great Expectations.
- **Tools I'll learn**: MLflow, Great Expectations, DVC (Data Version Control).
- **Time commitment**: 6–8 hours/week.
- **Done looks like**: A model registry showing at least 3 model versions with their associated hyperparameters and metrics, and a training run that validates schema integrity before training.

### Milestone 2 (Oct-Nov 2026): Containerization & Cloud Deployment
- **What I'll add**: Containerize the Flask backend, frontend, and retraining workers using Docker Compose. Deploy the multi-service stack to a cloud platform (AWS ECS or GCP Cloud Run).
- **Tools I'll learn**: Docker, AWS (ECS, S3), GitHub Actions (CI/CD).
- **Time commitment**: 8 hours/week.
- **Done looks like**: A public, working URL hosting the forecasting system, automatically redeployed via a GitHub Actions pipeline when new commits are pushed.

### Milestone 3 (Nov-Dec 2026): Real-time Ingestion & Retraining
- **What I'll add**: Simulate a live store transaction feed using Apache Kafka and implement an automated drift-detection job that triggers model retraining when prediction error degrades by more than 10%.
- **Tools I'll learn**: Apache Kafka, Apache Spark Streaming, Docker Compose (multi-service orchestration).
- **Time commitment**: 8–10 hours/week.
- **Done looks like**: A live dashboard that updates sales metrics every minute and triggers a training worker when simulated drift is introduced.

---

## 3rd Year Internship Plan (Jun-Jul 2027)
In the summer of 2027, this project will transition into an **Enterprise Inventory Risk Engine** (e.g. Fintech Churn & Fraud radar or Large-scale Supply Chain optimization). The core data ingestion and gradient boosting pipelines will be expanded to ingest external economic markers, weather APIs, and public holiday feeds to optimize supply chains across thousands of distribution hubs.

### Commercialization & SaaS Expansion (Stretch Phases)
- **Phase 7 (Feedback Loop)**: Mature the data persistence layer to ingest actuals against predictions and trigger retraining via drift monitoring.
- **Phase 8 (Auth & Identity)**: Integrate user accounts (Clerk/Auth0/Supabase) and secure API endpoints for multi-tenant access.
- **Phase 9 (Billing & Subscriptions)**: Implement Stripe for subscription tiers and usage-based metering, fully transforming the project into a monetizable forecasting API.

---

## What I'll need from the placement / mentor ecosystem
- **Cloud Credits**: Access to AWS or GCP free-tier/student credits to host the live platform and model registry.
- **MLOps Guidance**: Mentorship on managing Kafka consumer groups and setting up continuous training workflows.
- **Peer Code Reviews**: Collaboration with data engineering students to review pipeline performance.

---

## Risks & open questions
- **Data Scaling Costs**: Storing and training models on larger volumes of data will incur cloud storage and compute costs. *Mitigation:* Train models on downsampled slices or use local DuckDB storage.
- **Kafka Complexity**: Managing real-time message offsets and windowing functions without data loss can be challenging. *Mitigation:* Start with batch uploads before transitioning to fully asynchronous streaming.
