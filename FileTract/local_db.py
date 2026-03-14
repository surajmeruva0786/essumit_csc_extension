import sqlite3
import json
import os
from datetime import datetime
from typing import List, Dict, Any, Optional

DB_PATH = os.path.join(os.path.dirname(__file__), 'desktop_apps.db')

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Create applications table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS applications (
        id TEXT PRIMARY KEY,
        citizen_name TEXT NOT NULL,
        service TEXT NOT NULL,
        date TEXT NOT NULL,
        status TEXT NOT NULL,
        risk TEXT NOT NULL,
        risk_score INTEGER NOT NULL,
        fields_json TEXT NOT NULL
    )
    ''')
    
    # Create sync staging table (single row that holds the currently staging app)
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS sync_stage (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        staged_application_id TEXT,
        staged_at TEXT
    )
    ''')
    
    conn.commit()
    conn.close()

def save_application(app_data: Dict[str, Any]) -> str:
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Generate ID if not provided
    app_id = app_data.get('id')
    if not app_id:
        # e.g. REF2026031501
        date_prefix = datetime.now().strftime('%Y%m%d')
        cursor.execute("SELECT count(*) FROM applications WHERE id LIKE ?", (f"REF{date_prefix}%",))
        count = cursor.fetchone()[0] + 1
        app_id = f"REF{date_prefix}{count:02d}"
        
    date_str = app_data.get('date', datetime.now().strftime('%d/%m/%Y'))
    
    fields_json = app_data.get('fields_json') or app_data.get('data_json', '{}')
    if not fields_json:
        fields_json = '{}'
    if isinstance(fields_json, (list, dict)):
        fields_json = json.dumps(fields_json)
        
    cursor.execute('''
    INSERT OR REPLACE INTO applications 
    (id, citizen_name, service, date, status, risk, risk_score, fields_json)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        app_id,
        app_data.get('name', 'Unknown citizen'),
        app_data.get('service', 'General Service'),
        date_str,
        app_data.get('status', 'प्रक्रियाधीन'),
        app_data.get('risk', 'Low'),
        app_data.get('riskScore', 0),
        fields_json
    ))
    
    conn.commit()
    conn.close()
    return app_id

def get_all_applications() -> List[Dict[str, Any]]:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM applications ORDER BY date DESC, id DESC")
    rows = cursor.fetchall()
    
    apps = []
    for row in rows:
        apps.append({
            'id': row['id'],
            'name': row['citizen_name'],
            'service': row['service'],
            'date': row['date'],
            'status': row['status'],
            'risk': row['risk'],
            'riskScore': row['risk_score'],
            'fields_json': json.loads(row['fields_json']) if row['fields_json'] else {}
        })
        
    conn.close()
    return apps

def stage_application_for_sync(app_id: str) -> bool:
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Verify app exists
    cursor.execute("SELECT id FROM applications WHERE id = ?", (app_id,))
    if not cursor.fetchone():
        conn.close()
        return False
        
    cursor.execute('''
    INSERT OR REPLACE INTO sync_stage (id, staged_application_id, staged_at)
    VALUES (1, ?, ?)
    ''', (app_id, datetime.now().isoformat()))
    
    # Mark app as synced in applications table optionally, 
    # but the frontend just needs the data exported. Let's just stage it.
    
    conn.commit()
    conn.close()
    return True

def get_staged_sync() -> Optional[Dict[str, Any]]:
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT staged_application_id FROM sync_stage WHERE id = 1")
    row = cursor.fetchone()
    if not row or not row['staged_application_id']:
        conn.close()
        return None
        
    app_id = row['staged_application_id']
    cursor.execute(
        "SELECT id, citizen_name, service, date, status, fields_json FROM applications WHERE id = ?",
        (app_id,)
    )
    app_row = cursor.fetchone()
    conn.close()
    
    if not app_row or not app_row['fields_json']:
        return None

    # Return full record — keep fields_json as a JSON STRING so the JS side can parse it
    return {
        'id': app_row['id'],
        'name': app_row['citizen_name'],
        'citizen_name': app_row['citizen_name'],
        'service': app_row['service'],
        'date': app_row['date'],
        'status': app_row['status'],
        'fields_json': app_row['fields_json'],   # Raw JSON string
    }


def clear_staged_sync():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE sync_stage SET staged_application_id = NULL WHERE id = 1")
    conn.commit()
    conn.close()
