#!/usr/bin/env python3
"""Remove crossorigin attributes from built HTML to avoid GitHub Pages CORS issues."""
import re
import sys

dist_html = "dist/index.html"
with open(dist_html, "r") as f:
    content = f.read()

# Remove crossorigin attributes but preserve spacing. This matches:
#   crossorigin
#   crossorigin=""
#   crossorigin="anonymous"
# and removes the attribute and any trailing space, but keeps leading space if followed by another attr
cleaned = re.sub(r'\s+crossorigin(?:="[^"]*"|)\s*(?=\w)', ' ', content, flags=re.IGNORECASE)

with open(dist_html, "w") as f:
    f.write(cleaned)

print("✅ Removed crossorigin attributes from dist/index.html")
