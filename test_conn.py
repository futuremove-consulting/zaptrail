#!/usr/bin/env python3
import urllib.request, urllib.parse

SUPABASE_URL = "https://ipvfualdiesjykocgoqq.supabase.co"
SUPABASE_ANON_KEY = "sb_publishable_0oN3zPTXZ5TrFwHlHz5S5g_BAlcKW4N"

# List all tables
common_tables = ["messages", "conversations", "chats", "messages_fts", "fb_messages", "whatsapp_messages"]

print("Tabelas disponíveis:")
for table in common_tables:
    url = f"{SUPABASE_URL}/rest/v1/{table}?select=count&head=true&limit=1"
    req = urllib.request.Request(url, method="GET")
    req.add_header("apikey", SUPABASE_ANON_KEY)
    req.add_header("Authorization", f"Bearer {SUPABASE_ANON_KEY}")
    try:
        with urllib.request.urlopen(req, timeout=10) as response:
            print(f"  {table}: OK (status {response.status})")
    except Exception as e:
        print(f"  {table}: Erro {e}")

# Try conversations
print("\n--- Testando conversações ---")
url = f"{SUPABASE_URL}/rest/v1/conversations?select=*&limit=3"
req = urllib.request.Request(url, method="GET")
req.add_header("apikey", SUPABASE_ANON_KEY)
req.add_header("Authorization", f"Bearer {SUPABASE_ANON_KEY}")
try:
    with urllib.request.urlopen(req, timeout=10) as response:
        body = response.read().decode("utf-8")[:500]
        print(f"Status: {response.status}")
        print(f"Body: {body}")
except Exception as e:
    print(f"Erro: {e}")