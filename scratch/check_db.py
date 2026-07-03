import os
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv(dotenv_path="../.env")

url = os.environ.get("VITE_SUPABASE_URL")
key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY") or os.environ.get("VITE_SUPABASE_ANON_KEY")

supabase: Client = create_client(url, key)

try:
    res = supabase.table('parcels').select('*').limit(1).execute()
    print("KEYS:", res.data[0].keys() if res.data else "No data")
    if res.data:
        print("RECORD:", res.data[0])
except Exception as e:
    print("ERROR:", e)
