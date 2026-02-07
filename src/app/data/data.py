import pandas as pd
import json

# 1. Read the Excel file
df = pd.read_excel("cccc.xlsx")  # put your Excel file in the same folder

# 2. Group products by lab and remove duplicates
labs_grouped = df.groupby("LABORATOIRE")["PRODUIT"].apply(lambda x: list(set(x))).reset_index()

# 3. Convert to list of dicts
labs_json = []
for _, row in labs_grouped.iterrows():
    labs_json.append({
        "lab": row["LABORATOIRE"].strip(),
        "products": [p.strip() for p in row["PRODUIT"]]
    })

# 4. Save as JSON
with open("labs.json", "w", encoding="utf-8") as f:
    json.dump(labs_json, f, ensure_ascii=False, indent=2)

print("JSON file created: labs.json")
