from __future__ import annotations

import os
import sys


required = ["LANGFUSE_PUBLIC_KEY", "LANGFUSE_SECRET_KEY", "LANGFUSE_HOST"]
missing = [name for name in required if not os.getenv(name)]

if missing:
    print("Missing Langfuse environment variables: " + ", ".join(missing))
    sys.exit(1)

print("Langfuse environment variables are present.")
print("Next step: add the Langfuse v3 client or decorators in agent/agent.py and create a test trace.")

