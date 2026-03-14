import sqlite3
import os

# Try to find the DB file
db_paths = [
    'FileTract/local_data.db',
    'FileTract/applications.db',
    'FileTract/csc_sahayak.db',
]

db_file = None
for p in db_paths:
    if os.path.exists(p):
        db_file = p
        print(f"Found DB: {p}")
        break

if not db_file:
    # Search for any .db files
    for root, dirs, files in os.walk('FileTract'):
        for f in files:
            if f.endswith('.db'):
                print(f"Found DB file: {os.path.join(root, f)}")
    print("No known DB found")
    exit(1)

conn = sqlite3.connect(db_file)
c = conn.cursor()

# Show tables
c.execute("SELECT name FROM sqlite_master WHERE type='table'")
tables = c.fetchall()
print("Tables:", tables)

for (table,) in tables:
    print(f"\n--- {table} ---")
    c.execute(f"PRAGMA table_info({table})")
    cols = c.fetchall()
    print("Columns:", [col[1] for col in cols])
    c.execute(f"SELECT * FROM {table} LIMIT 3")
    rows = c.fetchall()
    print("Rows:", rows)

conn.close()
