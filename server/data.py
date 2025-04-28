import kagglehub

# Download latest version
path = kagglehub.dataset_download("apoorvwatsky/bank-transaction-data")

print("Path to dataset files:", path)