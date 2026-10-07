with open("src/data/mockCases.ts", "r", encoding="utf-8") as f:
    text = f.read()

import re
matches = re.findall(r"status:\s*'([A-Z_]+)'", text)
from collections import Counter
c = Counter(matches)
print("Statuses in mockCases.ts:")
for k, v in c.items():
    print(f"  {k}: {v}")
