#!/usr/bin/env python3
import sys
import os

# Add the pilotcrm path to access the classifier
sys.path.insert(0, 'pilotcrm-main/pilotcrm/apps/pilotcrm/src')

# Supabase credentials from environment
SUPABASE_URL = os.environ.get('SUPABASE_URL', 'https://ipvfualdiesjykocgoqq.supabase.co')
SUPABASE_KEY = os.environ.get('SUPABASE_PUB_KEY', 'sb_publishable_0oN3zPTXZ5TrFwHlHz5S5g_BAlcKW4N')

print(f"Supabase URL: {SUPABASE_URL}")
print(f"Supabase Key: {SUPABASE_KEY[:20]}...")
print("Python script running successfully")