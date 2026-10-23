#!/usr/bin/env python3
import urllib.request, urllib.parse
SUPABASE_URL="https://ipvfualdiesjykocgoqq.supabase.co"
SUPABASE_SECRET_KEY="sb_secret_GZiZqbnB1PgKcB5HEZ68WQ_Lc2p7d-X"
tables=["messages","conversations"]
for t in tables:
    u=f"{SUPABASE_URL}/rest/v1/{t}?select=*&limit=3"
    r=urllib.request.Request(u,method="GET")
    r.add_header("apikey",SUPABASE_SECRET_KEY)
    r.add_header("Authorization",f"Bearer {SUPABASE_SECRET_KEY}")
    try:
        with urllib.request.urlopen(r,timeout=10) as resp: 
            body = resp.read().decode()
            print(f"{t}: status={resp.status}, len={len(body)}, body={body[:100]}")
    except Exception as e: print(f"{t}: ERROR {e}")