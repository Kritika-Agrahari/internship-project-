# Week 1 Learning Reflection — Kritika Agrahari

Here is a summary of the key technical concepts and best practices I learned during Week 1 of the internship:

- **Memory Downcasting in Pandas**: Learned how to optimize memory usage by downcasting numerical data types (e.g., converting `int64` to `int16`/`int8` or `float64` to `float32`) based on the minimum and maximum value limits. This significantly reduces the RAM footprint when loading and processing large retail CSV files.
- **Chronological Time-Series Splits**: Understood that standard random cross-validation splits introduce future leakage (look-ahead bias) for time-series forecasting. Using date-ordered splits is essential to properly simulate real-world production evaluation.
- **Composite Key Joins**: Discovered that joining retail transaction and catalog tables on composite keys (such as `store_id`, `item_id`, and `date`) requires robust handling of missing sequences and potential incomplete records to maintain data integrity.
- **Incremental Data Validation**: Realized the value of building a dedicated data-layer validation script (`check_data_layer.py`) to audit schemas, verify types, and measure memory usage before implementing the core modeling/inference pipelines.
- **Documentation Discipline**: Learned that maintaining clear, aligned documentation across the README, design documents, and status templates is critical for ensuring a project is readable, reproducible, and easily understood by mentors and peers.
