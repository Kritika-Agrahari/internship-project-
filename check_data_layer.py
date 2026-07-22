import os
import pandas as pd
import numpy as np

def reduce_mem_usage(df):
    """Downcast numeric columns to minimum safe types."""
    start_mem = df.memory_usage().sum() / 1024**2
    for col in df.columns:
        col_type = df[col].dtype
        # Only downcast true numeric columns; skip string/date/object columns.
        if pd.api.types.is_numeric_dtype(col_type):
            c_min, c_max = df[col].min(), df[col].max()
            if str(col_type)[:3] == 'int':
                if c_min > np.iinfo(np.int8).min and c_max < np.iinfo(np.int8).max:
                    df[col] = df[col].astype(np.int8)
                elif c_min > np.iinfo(np.int16).min and c_max < np.iinfo(np.int16).max:
                    df[col] = df[col].astype(np.int16)
                else:
                    df[col] = df[col].astype(np.int32)
            else:
                df[col] = df[col].astype(np.float32)
    end_mem = df.memory_usage().sum() / 1024**2
    if start_mem > 0:
        reduction = 100 * (start_mem - end_mem) / start_mem
        print(f"  * Memory reduced from {start_mem:.2f} MB to {end_mem:.2f} MB ({reduction:.1f}% reduction)")
    else:
        print(f"  * Memory usage: {end_mem:.2f} MB")
    return df

def validate_and_ingest():
    # Look for files in Downloads where raw data resides
    raw_data_dir = "C:\\Users\\kriti\\Downloads\\kuch bhi 2\\kuch bhi 2"
    if not os.path.exists(raw_data_dir):
        raw_data_dir = "C:\\Users\\kriti\\Downloads\\ml-zoomcamp-2024-competition"
        
    print(f"=== Starting Ingestion and Validation Audit from {raw_data_dir} ===")
    
    files_to_check = {
        'sales.csv': ['store_id', 'item_id', 'quantity', 'price_base', 'date'],
        'catalog.csv': ['item_id', 'dept_name', 'class_name', 'item_type'],
        'stores.csv': ['store_id', 'division', 'format', 'city']
    }
    
    for filename, columns in files_to_check.items():
        file_path = os.path.join(raw_data_dir, filename)
        if os.path.exists(file_path):
            print(f"\n[SUCCESS] Found {filename}")
            # Read first 5 rows to confirm ingestion
            df = pd.read_csv(file_path, nrows=100)
            print(f"  * Ingested shape: {df.shape}")
            print(f"  * Columns validated: {list(df.columns)}")
            
            # Run memory downcasting on the sample
            reduce_mem_usage(df)
            
            # Print sample rows
            print("  * Data Preview (First 3 rows):")
            print(df[columns[:4]].head(3).to_string(index=False))
        else:
            print(f"\n[WARNING] {filename} not found at {file_path}")

if __name__ == "__main__":
    validate_and_ingest()
