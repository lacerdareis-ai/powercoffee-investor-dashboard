#!/usr/bin/env python3
"""Fetch latest data from Google Sheets and update data.json"""
import json, os, requests

TOKEN_PATH = os.path.expanduser("~/.hermes/google_token.json")
with open(TOKEN_PATH) as f:
    token = json.load(f)["token"]

SHEET_ID = "1cECO9T_Pet00U3O1jERMCAjXRobWWu-FQV_rfGMbeoA"
# Implementation: fetch and transform...
print("Fetch sheet and rebuild data.json")
