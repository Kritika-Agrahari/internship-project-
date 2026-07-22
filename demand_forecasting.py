# Cell 0
import numpy as np
import pandas as pd
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import seaborn as sns
import warnings
warnings.filterwarnings('ignore')


# Cell 1
import os
csv_path = 'demand_forecasting.csv'
if not os.path.exists(csv_path):
    csv_path = '/kaggle/input/datasets/raminhuseyn/demand-forecasting-dataset/demand_forecasting.csv'
df = pd.read_csv(csv_path)
df.head(3)


# Cell 2
df.info()


# Cell 3
df.isnull().sum().sum()


# Cell 4
df.duplicated().sum()


# Cell 5
df['Date'] = pd.to_datetime(df['Date'])
df = df.sort_values('Date')

# Cell 6
# pip install holidays

# Cell 7
import holidays

df['Date'] = pd.to_datetime(df['Date'])

# Sort by series and date to compute lags and rolling features correctly
df = df.sort_values(by=['Store ID', 'Product ID', 'Date']).reset_index(drop=True)

# Lags of Target
df['lag_1'] = df.groupby(['Store ID', 'Product ID'])['Demand'].shift(1)
df['lag_7'] = df.groupby(['Store ID', 'Product ID'])['Demand'].shift(7)
df['lag_30'] = df.groupby(['Store ID', 'Product ID'])['Demand'].shift(30)

# Rolling window statistics (shift by 1 day first to prevent data leakage)
df['rolling_mean_7'] = df.groupby(['Store ID', 'Product ID'])['Demand'].transform(lambda x: x.shift(1).rolling(7).mean())
df['rolling_std_7'] = df.groupby(['Store ID', 'Product ID'])['Demand'].transform(lambda x: x.shift(1).rolling(7).std())

df['rolling_mean_14'] = df.groupby(['Store ID', 'Product ID'])['Demand'].transform(lambda x: x.shift(1).rolling(14).mean())
df['rolling_std_14'] = df.groupby(['Store ID', 'Product ID'])['Demand'].transform(lambda x: x.shift(1).rolling(14).std())

df['rolling_mean_30'] = df.groupby(['Store ID', 'Product ID'])['Demand'].transform(lambda x: x.shift(1).rolling(30).mean())
df['rolling_std_30'] = df.groupby(['Store ID', 'Product ID'])['Demand'].transform(lambda x: x.shift(1).rolling(30).std())

# Day of week and weekend features
df['day_of_week'] = df['Date'].dt.dayofweek
df['is_weekend'] = df['Date'].dt.dayofweek.isin([5, 6]).astype(int)

# Indian holidays feature
in_holidays = holidays.country_holidays('IN')
df['is_holiday'] = df['Date'].apply(lambda x: 1 if x in in_holidays else 0)

# Trend feature (days since start date)
start_date = df['Date'].min()
df['trend'] = (df['Date'] - start_date).dt.days

# Pricing & supply features from original pipeline
df['Total_Earnings'] = df['Units Sold'] * df['Price'] * (1 - df['Discount']/100)
df['Products_to_sell'] = df['Units Ordered'] - df['Units Sold']

df['Price_gap_pct'] = (df['Price'] - df['Competitor Pricing']) / df['Competitor Pricing']
df['Discount_effect'] = df['Discount'] * df['Promotion']

# Inventory features — use inventory-to-demand ratio and days-of-supply instead of
# Inventory / (Inventory + 1), which saturates near 1 for any level above ~50.
df['inventory_demand_ratio'] = df['Inventory Level'] / (df['rolling_mean_7'] + 1e-6)
df['days_of_supply'] = df['Inventory Level'] / (df['rolling_mean_30'] + 1e-6)

df['Year'] = df['Date'].dt.year
df['Month'] = df['Date'].dt.month
df['Day'] = df['Date'].dt.day

# Drop rows with NaNs resulting from shifts and rolling windows (first 30 days)
df = df.dropna().reset_index(drop=True)

# Sort primarily by Date and secondarily by Store ID and Product ID for chronological validation
df = df.sort_values(by=['Date', 'Store ID', 'Product ID']).reset_index(drop=True)


# Cell 8
numeric_cols = df.select_dtypes(include="number").columns
object_cols = df.select_dtypes(include="object").columns

print("🔢 NUMERIC COLUMNS")
print("-" * 50)

for col in numeric_cols:
    nunique = df[col].nunique()
    print(f"\n📌 {col}")
    print(f"nunique: {nunique}")
    
    if nunique < 15:
        print("unique values:", df[col].unique())

print("\n" + "=" * 60)

print("🔤 OBJECT COLUMNS")
print("-" * 50)

for col in object_cols:
    nunique = df[col].nunique()
    print(f"\n📌 {col}")
    print(f"nunique: {nunique}")
    
    if nunique < 15:
        print("unique values:", df[col].unique())


# Cell 10
plt.figure(figsize=(14,6))

sns.lineplot(data=df, x='Date', y='Units Sold', label='Units Sold', color='red') 
sns.lineplot(data=df, x='Date', y='Units Ordered', label='Units Ordered', color='#0D47A1')  

plt.title("Units Sold vs Units Ordered Over Time", fontsize=14)
plt.xlabel("Date")
plt.ylabel("Units")
plt.grid(alpha=0.2)

plt.legend()
plt.tight_layout()
plt.show()


# Cell 11
plt.figure(figsize=(10,6))

sns.scatterplot(
    data=df,
    x='Price_gap_pct',
    y='Demand',
    hue='Promotion',
    alpha=0.6
)

plt.title("Demand vs Price Gap (Competitive Effect)")
plt.grid(alpha=0.2)
plt.show()


# Cell 12
cols_for_count = ['Category','Region','Weather Condition','Seasonality','Discount','Promotion','Epidemic']
sns.set_style("darkgrid")

fig, axes = plt.subplots(4, 2, figsize=(14, 12))
axes = axes.flatten()

for i, col in enumerate(cols_for_count):
    ax = sns.countplot(
        data=df,
        x=col,
        ax=axes[i],
        palette="Set2")
    
    axes[i].set_title(f"{col} Distribution", fontsize=12, weight="bold")
    axes[i].tick_params(axis='x', rotation=30)

    for p in ax.patches:
        height = p.get_height()
        ax.annotate(
            f"{int(height)}",
            (p.get_x() + p.get_width() / 2., height),
            ha="center",
            va="bottom",
            fontsize=9)

if len(cols_for_count) < len(axes):
    for j in range(len(cols_for_count), len(axes)):
        fig.delaxes(axes[j])

plt.tight_layout()
plt.show()


# Cell 13
categorical_cols = ['Category', 'Region', 'Weather Condition', 'Seasonality']

plt.style.use("dark_background")

fig, axes = plt.subplots(2, 2, figsize=(14,10))
axes = axes.flatten()  

for i, col in enumerate(categorical_cols):
    
    n_colors = df[col].nunique()
    palette = sns.color_palette("husl", n_colors)
    
    sns.scatterplot(
        data=df,
        x='Units Sold',
        y='Demand',
        hue=col,
        palette=palette,
        alpha=0.7,
        ax=axes[i]
    )
    
    axes[i].set_title(f"{col}")
    axes[i].grid(alpha=0.2)
    
    axes[i].legend(title=col, fontsize=8)

plt.tight_layout()
plt.show()


# Cell 14
plt.style.use("dark_background")

fig, axes = plt.subplots(1, 2, figsize=(16,6))

ct_cat = pd.crosstab(df['Category'], df['Discount'])
ct_cat = ct_cat.sort_index(axis=1)
ct_cat_pct = ct_cat.div(ct_cat.sum(axis=1), axis=0) * 100

ax1 = ct_cat_pct.plot(
    kind='bar',
    stacked=True,
    colormap='viridis',
    ax=axes[0]
)

for container in ax1.containers:
    ax1.bar_label(container, fmt='%.1f%%', label_type='center', fontsize=8)

ax1.set_title("Discount Distribution by Category (%)")
ax1.set_xlabel("Category")
ax1.set_ylabel("Percentage")
ax1.legend(title="Discount", fontsize=8)


ct_season = pd.crosstab(df['Seasonality'], df['Discount'])
ct_season = ct_season.sort_index(axis=1)

order = ['Winter', 'Spring', 'Summer', 'Autumn']
ct_season = ct_season.loc[order]

ct_season_pct = ct_season.div(ct_season.sum(axis=1), axis=0) * 100

ax2 = ct_season_pct.plot(
    kind='bar',
    stacked=True,
    colormap='viridis',
    ax=axes[1]
)

for container in ax2.containers:
    ax2.bar_label(container, fmt='%.1f%%', label_type='center', fontsize=8)

ax2.set_title("Discount Distribution by Season (%)")
ax2.set_xlabel("Season")
ax2.set_ylabel("Percentage")
ax2.legend(title="Discount", fontsize=8)


plt.tight_layout()
plt.show()


# Cell 15
plt.figure(figsize=(8,5))

season_avg = df.groupby('Seasonality')['Total_Earnings'].mean().sort_values()

ax = sns.barplot(
    x=season_avg.index,
    y=season_avg.values,
    palette="viridis"
)

for container in ax.containers:
    ax.bar_label(container, fmt='%.0f', label_type='center')

plt.title("Average Total Earnings by Season")
plt.ylabel("Avg Earnings")

plt.tight_layout()
plt.show()


# Cell 16
plt.figure(figsize=(14,6))

sns.lineplot(
    data=df,
    x='Date',
    y='Total_Earnings',
    hue='Seasonality',
    palette='husl'
)

plt.title("Total Earnings Over Time by Season")
plt.grid(alpha=0.2)

plt.tight_layout()
plt.show()


# Cell 17
plt.figure(figsize=(8,5))

sns.histplot(df['Products_to_sell'], bins=50, kde=True, color='orange')

plt.title("Products_to_sell Distribution")
plt.grid(alpha=0.2)

plt.show()


# Cell 18
plt.figure(figsize=(8,5))

sns.scatterplot(
    data=df,
    x='Demand',
    y='Products_to_sell',
    hue='Seasonality',
    alpha=0.6
)

plt.title("Demand vs Products to Sell (Stock Gap Analysis)")
plt.xlabel("Demand")
plt.ylabel("Products to Sell")

plt.grid(alpha=0.2)
plt.tight_layout()
plt.show()


# Cell 19
plt.style.use("default")

corr = df.select_dtypes(include='number').corr()

mask = np.triu(np.ones_like(corr, dtype=bool))

plt.figure(figsize=(10,8))

sns.heatmap(
    corr,
    mask=mask,
    annot=True,
    fmt=".2f",
    cmap="viridis",
    center=0,
    linewidths=0.5
)

plt.title("Correlation Heatmap (Lower Triangle)")
plt.tight_layout()
plt.show()


# Cell 20
df_model = df.copy()

leakage_cols = [
    'Units Sold',
    'Units Ordered',
    'Products_to_sell',
    'Total_Earnings',
    'Price'
 ]

df_model = df_model.drop(columns=[c for c in leakage_cols if c in df_model.columns])

# Reduce redundancy among highly collinear price features while keeping a stable signal feature.
price_like_cols = ['Price_diff', 'Price_ratio', 'Price_gap_pct']
available_price_cols = [c for c in price_like_cols if c in df_model.columns]

if len(available_price_cols) > 1:
    keep_col = 'Price_gap_pct' if 'Price_gap_pct' in available_price_cols else available_price_cols[0]
    drop_cols = [c for c in available_price_cols if c != keep_col]
    df_model = df_model.drop(columns=drop_cols)
    print(f"Dropped redundant price features: {drop_cols}; kept {keep_col}")

df_model = df_model.sort_values(['Date', 'Store ID', 'Product ID']).reset_index(drop=True)

# Cell 22
# Time-aware split: train -> validation tail -> test tail
max_date = df_model['Date'].max()
test_start_date = max_date - pd.Timedelta(days=84)
valid_start_date = test_start_date - pd.Timedelta(days=28)

train_mask = df_model['Date'] <= valid_start_date
valid_mask = (df_model['Date'] > valid_start_date) & (df_model['Date'] <= test_start_date)
test_mask = df_model['Date'] > test_start_date

y = np.log1p(df_model['Demand'])
X = df_model.drop(columns=['Demand'])

X_train = X.loc[train_mask].drop(columns=['Date'])
X_valid = X.loc[valid_mask].drop(columns=['Date'])
X_test = X.loc[test_mask].drop(columns=['Date'])

y_train = y.loc[train_mask]
y_valid = y.loc[valid_mask]
y_test = y.loc[test_mask]

cat_cols = [
    c for c in ['Store ID', 'Product ID', 'Category', 'Region', 'Weather Condition', 'Seasonality']
    if c in X_train.columns
]

meta_valid = df_model.loc[valid_mask, ['Date', 'Category', 'Region', 'Seasonality', 'Store ID', 'Product ID']].reset_index(drop=True)
meta_test = df_model.loc[test_mask, ['Date', 'Category', 'Region', 'Seasonality', 'Store ID', 'Product ID']].reset_index(drop=True)

print('Train range:', df_model.loc[train_mask, 'Date'].min().date(), 'to', df_model.loc[train_mask, 'Date'].max().date())
print('Valid range:', df_model.loc[valid_mask, 'Date'].min().date(), 'to', df_model.loc[valid_mask, 'Date'].max().date())
print('Test range :', df_model.loc[test_mask, 'Date'].min().date(), 'to', df_model.loc[test_mask, 'Date'].max().date())
print('Rows -> Train:', X_train.shape[0], ', Valid:', X_valid.shape[0], ', Test:', X_test.shape[0])

# TargetEncoder remains inside each model pipeline so folds do not leak target statistics.

# Cell 23
from sklearn.model_selection import RandomizedSearchCV, TimeSeriesSplit
from sklearn.pipeline import Pipeline
from category_encoders import TargetEncoder
from xgboost import XGBRegressor
from lightgbm import LGBMRegressor

tscv = TimeSeriesSplit(n_splits=4)

lgb_pipeline = Pipeline([
    ('encoder', TargetEncoder(cols=cat_cols, smoothing=0.3)),
    ('regressor', LGBMRegressor(
        random_state=42,
        reg_alpha=0.1,
        reg_lambda=0.1,
        verbose=-1
    ))
])

xgb_pipeline = Pipeline([
    ('encoder', TargetEncoder(cols=cat_cols, smoothing=0.3)),
    ('regressor', XGBRegressor(
        random_state=42,
        objective='reg:squarederror'
    ))
])

lgb_params = {
    'regressor__n_estimators': [300, 500, 800],
    'regressor__learning_rate': [0.02, 0.05, 0.08],
    'regressor__num_leaves': [15, 25, 31],
    'regressor__max_depth': [3, 4, 5],
    'regressor__min_child_samples': [20, 50, 80],
    'regressor__subsample': [0.7, 0.85, 1.0],
    'regressor__colsample_bytree': [0.7, 0.85, 1.0],
    'regressor__reg_alpha': [0.1, 1.0, 5.0],
    'regressor__reg_lambda': [0.1, 1.0, 5.0],
}

xgb_params = {
    'regressor__n_estimators': [300, 500, 800],
    'regressor__learning_rate': [0.02, 0.05, 0.08],
    'regressor__max_depth': [3, 4, 5],
    'regressor__min_child_weight': [5, 10, 15],
    'regressor__subsample': [0.7, 0.85, 1.0],
    'regressor__colsample_bytree': [0.7, 0.85, 1.0],
    'regressor__reg_alpha': [0.1, 1.0, 5.0],
    'regressor__reg_lambda': [0.1, 1.0, 5.0],
}

lgb_search = RandomizedSearchCV(
    lgb_pipeline,
    lgb_params,
    n_iter=12,
    cv=tscv,
    scoring='neg_mean_absolute_error',
    n_jobs=2,
    verbose=1,
    random_state=42
)

xgb_search = RandomizedSearchCV(
    xgb_pipeline,
    xgb_params,
    n_iter=12,
    cv=tscv,
    scoring='neg_mean_absolute_error',
    n_jobs=2,
    verbose=1,
    random_state=42
)

lgb_search.fit(X_train, y_train)
xgb_search.fit(X_train, y_train)

lgb_best = lgb_search.best_estimator_
xgb_best = xgb_search.best_estimator_

print('Best CV MAE (LGBM):', -lgb_search.best_score_)
print('Best CV MAE (XGB) :', -xgb_search.best_score_)

# Cell 24
from sklearn.metrics import mean_absolute_error, r2_score

def forecasting_metrics(y_true, y_pred):
    y_true = np.asarray(y_true)
    y_pred = np.asarray(y_pred)

    mae = mean_absolute_error(y_true, y_pred)
    r2 = r2_score(y_true, y_pred)
    mape = np.mean(np.abs((y_true - y_pred) / np.clip(y_true, 1, None))) * 100
    wape = (np.sum(np.abs(y_true - y_pred)) / np.sum(np.abs(y_true))) * 100

    return {
        'MAE': mae,
        'R2': r2,
        'MAPE_%': mape,
        'WAPE_%': wape
    }

y_valid_true = np.expm1(y_valid)
y_test_true = np.expm1(y_test)

valid_lgb_pred = np.expm1(lgb_best.predict(X_valid))
valid_xgb_pred = np.expm1(xgb_best.predict(X_valid))

test_lgb_pred = np.expm1(lgb_best.predict(X_test))
test_xgb_pred = np.expm1(xgb_best.predict(X_test))

results = []

for model_name, pred in [('LightGBM', test_lgb_pred), ('XGBoost', test_xgb_pred)]:
    row = {'Model': model_name}
    row.update(forecasting_metrics(y_test_true, pred))
    results.append(row)

results_df = pd.DataFrame(results).sort_values('MAE').reset_index(drop=True)
print(results_df)

# Segment diagnostics to detect systematic errors across business slices.
test_diag = meta_test.copy()
test_diag['actual'] = y_test_true.values
test_diag['pred_lgb'] = test_lgb_pred
test_diag['pred_xgb'] = test_xgb_pred

def segment_wape(diag_df, pred_col, by_col):
    grp = diag_df.groupby(by_col).agg(
        abs_err=(pred_col, lambda s: np.abs(s - diag_df.loc[s.index, 'actual']).sum()),
        actual_sum=('actual', 'sum')
    )
    grp['WAPE_%'] = (grp['abs_err'] / grp['actual_sum']) * 100
    return grp[['WAPE_%']].sort_values('WAPE_%', ascending=False)

print('Top segment WAPE by Category (LGBM):')
print(segment_wape(test_diag, 'pred_lgb', 'Category').head())

print('Top segment WAPE by Region (LGBM):')
print(segment_wape(test_diag, 'pred_lgb', 'Region').head())

print('Top segment WAPE by Seasonality (LGBM):')
print(segment_wape(test_diag, 'pred_lgb', 'Seasonality').head())

# Cell 25
plot_metrics = results_df.melt(id_vars='Model', value_vars=['MAE', 'WAPE_%', 'MAPE_%'],
                               var_name='Metric', value_name='Value')

plt.figure(figsize=(12, 5))
ax = sns.barplot(data=plot_metrics, x='Metric', y='Value', hue='Model', palette='viridis')
plt.title('Model Error Metrics on Chronological Test Set')
plt.ylabel('Metric Value')
plt.grid(axis='y', alpha=0.2)

for p in ax.patches:
    height = p.get_height()
    if np.isfinite(height):
        ax.annotate(f"{height:.2f}",
                    (p.get_x() + p.get_width() / 2., height),
                    ha='center', va='bottom', fontsize=8)

plt.tight_layout()
plt.show()

# Cell 26
from joblib import dump

# Tune blend weight on validation tail instead of fixed 50/50.
weights = np.linspace(0.0, 1.0, 21)
blend_trials = []

for w in weights:
    valid_blend = w * valid_lgb_pred + (1 - w) * valid_xgb_pred
    blend_trials.append((w, mean_absolute_error(y_valid_true, valid_blend)))

best_w, best_valid_mae = min(blend_trials, key=lambda x: x[1])
print(f'Best blend weight for LGBM: {best_w:.2f} (validation MAE={best_valid_mae:.4f})')

ensemble_pred = best_w * test_lgb_pred + (1 - best_w) * test_xgb_pred
ensemble_row = {'Model': 'Blended Ensemble'}
ensemble_row.update(forecasting_metrics(y_test_true, ensemble_pred))

results_final_df = pd.concat([results_df, pd.DataFrame([ensemble_row])], ignore_index=True)
results_final_df = results_final_df.sort_values('MAE').reset_index(drop=True)
print(results_final_df)

# Predicted vs actual trend over time (daily aggregation on the test horizon).
trend_plot = meta_test[['Date']].copy()
trend_plot['actual'] = y_test_true.values
trend_plot['ensemble'] = ensemble_pred
trend_plot['lgbm'] = test_lgb_pred
trend_plot['xgboost'] = test_xgb_pred

daily_trend = trend_plot.groupby('Date', as_index=False)[['actual', 'ensemble', 'lgbm', 'xgboost']].mean()

plt.figure(figsize=(14, 5))
plt.plot(daily_trend['Date'], daily_trend['actual'], label='Actual', linewidth=2, color='black')
plt.plot(daily_trend['Date'], daily_trend['ensemble'], label='Ensemble Forecast', linewidth=2, color='tab:blue')
plt.plot(daily_trend['Date'], daily_trend['lgbm'], label='LGBM', alpha=0.6, linestyle='--')
plt.plot(daily_trend['Date'], daily_trend['xgboost'], label='XGBoost', alpha=0.6, linestyle='--')
plt.title('Daily Actual vs Forecast on Test Horizon')
plt.xlabel('Date')
plt.ylabel('Demand')
plt.legend()
plt.grid(alpha=0.2)
plt.tight_layout()
plt.show()

artifacts = {
    'lgbm_model': lgb_best,
    'xgb_model': xgb_best,
    'blend_weight_lgbm': best_w,
    'feature_columns': X_train.columns.tolist(),
    'categorical_columns': cat_cols
}

dump(artifacts, 'demand_forecasting_artifacts.joblib')
print('Saved model artifacts to demand_forecasting_artifacts.joblib')

# Cell 28
import gc
import numpy as np
import pandas as pd

from sklearn.model_selection import ParameterSampler
from sklearn.metrics import mean_absolute_error
from category_encoders import TargetEncoder
from lightgbm import LGBMRegressor, early_stopping
from xgboost import XGBRegressor
from joblib import dump

# ---------------- Encode categorical variables ---------------- #

fast_encoder = TargetEncoder(cols=cat_cols, smoothing=0.3)

X_train_enc = fast_encoder.fit_transform(X_train.copy(), y_train)
X_valid_enc = fast_encoder.transform(X_valid.copy())
X_test_enc = fast_encoder.transform(X_test.copy())

# ---------------- Hyperparameter Tuning Function ---------------- #

def tune_with_early_stopping(model_type="lgbm", n_iter=10, random_state=42):

    if model_type == "lgbm":

        param_grid = {
            "learning_rate": [0.02, 0.05, 0.08],
            "num_leaves": [31, 50, 70],
            "max_depth": [-1, 5, 10],
            "min_child_samples": [10, 20, 30],
            "subsample": [0.7, 0.85, 1.0],
            "colsample_bytree": [0.7, 0.85, 1.0],
            "reg_alpha": [0.0, 0.1, 0.3],
            "reg_lambda": [0.0, 0.1, 0.3],
        }

        sampler = ParameterSampler(
            param_grid,
            n_iter=n_iter,
            random_state=random_state
        )

        best_model = None
        best_mae = float("inf")
        best_params = None

        for params in sampler:

            model = LGBMRegressor(
                n_estimators=1000,
                random_state=42,
                verbose=-1,
                **params
            )

            model.fit(
                X_train_enc,
                y_train,
                eval_set=[(X_valid_enc, y_valid)],
                eval_metric="l1",
                callbacks=[early_stopping(50, verbose=False)]
            )

            pred = np.expm1(model.predict(X_valid_enc))

            mae = mean_absolute_error(
                np.expm1(y_valid),
                pred
            )

            if mae < best_mae:
                best_mae = mae
                best_model = model
                best_params = params

            gc.collect()

        return best_model, best_mae, best_params

    # ---------------- XGBoost ---------------- #

    param_grid = {
        "learning_rate": [0.02, 0.05, 0.08],
        "max_depth": [4, 6, 8],
        "min_child_weight": [1, 3, 5],
        "subsample": [0.7, 0.85, 1.0],
        "colsample_bytree": [0.7, 0.85, 1.0],
        "reg_alpha": [0.0, 0.1, 0.3],
        "reg_lambda": [0.0, 0.1, 0.3],
    }

    sampler = ParameterSampler(
        param_grid,
        n_iter=n_iter,
        random_state=random_state
    )

    best_model = None
    best_mae = float("inf")
    best_params = None

    for params in sampler:

        model = XGBRegressor(
            objective="reg:squarederror",
            random_state=42,
            n_estimators=300,
            max_bin=256,
            tree_method="hist",
            n_jobs=1,
            verbosity=0,
            **params
        )

        model.fit(
            X_train_enc,
            y_train,
            eval_set=[(X_valid_enc, y_valid)],
            verbose=False
        )

        pred = np.expm1(model.predict(X_valid_enc))

        mae = mean_absolute_error(
            np.expm1(y_valid),
            pred
        )

        if mae < best_mae:
            best_mae = mae
            best_model = model
            best_params = params

        del model
        gc.collect()

    return best_model, best_mae, best_params


# ---------------- Train Models ---------------- #

fast_lgb_model, fast_lgb_val_mae, fast_lgb_params = tune_with_early_stopping(
    model_type="lgbm",
    n_iter=10,
    random_state=42
)

fast_xgb_model, fast_xgb_val_mae, fast_xgb_params = tune_with_early_stopping(
    model_type="xgb",
    n_iter=10,
    random_state=42
)

print("Fast LGBM Validation MAE :", round(fast_lgb_val_mae, 4))
print("Fast XGB Validation MAE  :", round(fast_xgb_val_mae, 4))

# ---------------- Test Predictions ---------------- #

fast_lgb_test = np.expm1(fast_lgb_model.predict(X_test_enc))
fast_xgb_test = np.expm1(fast_xgb_model.predict(X_test_enc))

fast_results = []

for name, pred in [
    ("Fast LGBM", fast_lgb_test),
    ("Fast XGB", fast_xgb_test),
]:
    row = {"Model": name}
    row.update(forecasting_metrics(y_test_true, pred))
    fast_results.append(row)

fast_results_df = (
    pd.DataFrame(fast_results)
    .sort_values("MAE")
    .reset_index(drop=True)
)

print(fast_results_df)

# ---------------- Save Models ---------------- #

fast_artifacts = {
    "encoder": fast_encoder,
    "lgbm_model": fast_lgb_model,
    "xgb_model": fast_xgb_model,
    "lgbm_best_params": fast_lgb_params,
    "xgb_best_params": fast_xgb_params,
    "feature_columns": X_train.columns.tolist(),
    "categorical_columns": cat_cols,
}

dump(fast_artifacts, "demand_forecasting_fast_artifacts.joblib")

print("Saved fast artifacts successfully.")

# Cell 29
from sklearn.model_selection import ParameterSampler
from lightgbm import early_stopping

# Encode categoricals once using train-only statistics, then tune boosted trees with early stopping.
fast_encoder = TargetEncoder(cols=cat_cols, smoothing=0.3)
X_train_enc = fast_encoder.fit_transform(X_train.copy(), y_train)
X_valid_enc = fast_encoder.transform(X_valid.copy())
X_test_enc = fast_encoder.transform(X_test.copy())

def tune_with_early_stopping(model_type='lgbm', n_iter=10, random_state=42):
    if model_type == 'lgbm':
        param_grid = {
            'learning_rate': [0.02, 0.05, 0.08],
            'num_leaves': [31, 50, 70],
            'max_depth': [-1, 5, 10],
            'min_child_samples': [10, 20, 30],
            'subsample': [0.7, 0.85, 1.0],
            'colsample_bytree': [0.7, 0.85, 1.0],
            'reg_alpha': [0.0, 0.1, 0.3],
            'reg_lambda': [0.0, 0.1, 0.3],
        }
        sampler = list(ParameterSampler(param_grid, n_iter=n_iter, random_state=random_state))
        best_model, best_mae, best_params = None, float('inf'), None

        for params in sampler:
            model = LGBMRegressor(
                n_estimators=3000,
                random_state=42,
                verbose=-1,
                **params
            )
            model.fit(
                X_train_enc, y_train,
                eval_set=[(X_valid_enc, y_valid)],
                eval_metric='l1',
                callbacks=[early_stopping(stopping_rounds=75, verbose=False)]
            )
            pred_valid = np.expm1(model.predict(X_valid_enc))
            mae = mean_absolute_error(np.expm1(y_valid), pred_valid)

            if mae < best_mae:
                best_mae = mae
                best_model = model
                best_params = params

        return best_model, best_mae, best_params

    param_grid = {
        'learning_rate': [0.02, 0.05, 0.08],
        'max_depth': [4, 6, 8],
        'min_child_weight': [1, 3, 5],
        'subsample': [0.7, 0.85, 1.0],
        'colsample_bytree': [0.7, 0.85, 1.0],
        'reg_alpha': [0.0, 0.1, 0.3],
        'reg_lambda': [0.0, 0.1, 0.3],
    }
    sampler = list(ParameterSampler(param_grid, n_iter=n_iter, random_state=random_state))
    best_model, best_mae, best_params = None, float('inf'), None

    for params in sampler:
        model = XGBRegressor(
            n_estimators=3000,
            random_state=42,
            objective='reg:squarederror',
            **params
        )
        model.fit(
            X_train_enc, y_train,
            eval_set=[(X_valid_enc, y_valid)],
            verbose=False
        )
        pred_valid = np.expm1(model.predict(X_valid_enc))
        mae = mean_absolute_error(np.expm1(y_valid), pred_valid)

        if mae < best_mae:
            best_mae = mae
            best_model = model
            best_params = params

    return best_model, best_mae, best_params

fast_lgb_model, fast_lgb_val_mae, fast_lgb_params = tune_with_early_stopping('lgbm', n_iter=10, random_state=42)
fast_xgb_model, fast_xgb_val_mae, fast_xgb_params = tune_with_early_stopping('xgb', n_iter=10, random_state=42)

print('Fast LGBM valid MAE:', round(fast_lgb_val_mae, 4))
print('Fast XGB valid MAE :', round(fast_xgb_val_mae, 4))

fast_lgb_test = np.expm1(fast_lgb_model.predict(X_test_enc))
fast_xgb_test = np.expm1(fast_xgb_model.predict(X_test_enc))

fast_results = []
for model_name, pred in [('Fast LGBM', fast_lgb_test), ('Fast XGB', fast_xgb_test)]:
    row = {'Model': model_name}
    row.update(forecasting_metrics(y_test_true, pred))
    fast_results.append(row)

fast_results_df = pd.DataFrame(fast_results).sort_values('MAE').reset_index(drop=True)
print(fast_results_df)

# Save a dedicated fast-inference bundle using encoded-model workflow.
fast_artifacts = {
    'encoder': fast_encoder,
    'lgbm_model': fast_lgb_model,
    'xgb_model': fast_xgb_model,
    'lgbm_best_params': fast_lgb_params,
    'xgb_best_params': fast_xgb_params,
    'feature_columns': X_train.columns.tolist(),
    'categorical_columns': cat_cols
}
dump(fast_artifacts, 'demand_forecasting_fast_artifacts.joblib')
print('Saved fast artifacts to demand_forecasting_fast_artifacts.joblib')

# Cell 31
from joblib import load

def _align_inference_features(df_input, feature_columns):
    df_inf = df_input.copy()

    if 'Demand' in df_inf.columns:
        df_inf = df_inf.drop(columns=['Demand'])
    if 'Date' in df_inf.columns:
        df_inf = df_inf.drop(columns=['Date'])

    for col in feature_columns:
        if col not in df_inf.columns:
            df_inf[col] = 0

    extra_cols = [c for c in df_inf.columns if c not in feature_columns]
    if extra_cols:
        df_inf = df_inf.drop(columns=extra_cols)

    return df_inf[feature_columns]

def predict_demand(df_features, artifacts_path='demand_forecasting_artifacts.joblib'):
    artifacts = load(artifacts_path)
    feature_columns = artifacts['feature_columns']

    X_inf = _align_inference_features(df_features, feature_columns)

    # Pipeline artifacts: models already include target encoder step.
    if 'encoder' not in artifacts:
        lgb_pred = np.expm1(artifacts['lgbm_model'].predict(X_inf))
        xgb_pred = np.expm1(artifacts['xgb_model'].predict(X_inf))
        w = artifacts.get('blend_weight_lgbm', 0.5)
        ensemble = w * lgb_pred + (1 - w) * xgb_pred
    else:
        # Fast artifacts: encode first, then run raw models.
        X_inf_enc = artifacts['encoder'].transform(X_inf)
        lgb_pred = np.expm1(artifacts['lgbm_model'].predict(X_inf_enc))
        xgb_pred = np.expm1(artifacts['xgb_model'].predict(X_inf_enc))
        ensemble = 0.5 * lgb_pred + 0.5 * xgb_pred

    pred_df = pd.DataFrame({
        'prediction_lgbm': lgb_pred,
        'prediction_xgboost': xgb_pred,
        'prediction_ensemble': ensemble
    })
    return pred_df

# Example usage (uncomment):
# new_preds = predict_demand(df_model.tail(20))
# display(new_preds.head())

