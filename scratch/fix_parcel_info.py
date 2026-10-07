with open("src/data/mockCases.ts", "r", encoding="utf-8") as f:
    text = f.read()

# Replace custom parcelInfo blocks in TP-2026-0105..0110
import re

pattern = r"parcelInfo:\s*\{[^\}]+\}"
replacements = [
    "parcelInfo: KNOWN_PARCELS['ED882194821TH']!",
    "parcelInfo: KNOWN_PARCELS['ED901234561TH']!",
    "parcelInfo: KNOWN_PARCELS['ED901234562TH']!",
    "parcelInfo: KNOWN_PARCELS['ED901234563TH']!",
    "parcelInfo: KNOWN_PARCELS['ED901234564TH']!",
    "parcelInfo: KNOWN_PARCELS['ED776512349TH']!"
]

# Find matches only after TP-2026-0105
pos = text.find("id: 'TP-2026-0105'")
if pos != -1:
    before = text[:pos]
    after = text[pos:]
    
    for r in replacements:
        after = re.sub(r"parcelInfo:\s*\{[^\}]+\}", r, after, count=1)
        
    text = before + after

with open("src/data/mockCases.ts", "w", encoding="utf-8") as f:
    f.write(text)

print("Updated parcelInfo references in new review cases")
