#!/usr/bin/env python3
from pathlib import Path
import sys

repo = Path(sys.argv[1]).resolve() if len(sys.argv) > 1 else Path.cwd().resolve()
app = (repo / "app.js").read_text(encoding="utf-8")
sw = (repo / "sw.js").read_text(encoding="utf-8")

checks = [
    ("FALLBACK removed", "FALLBACK" not in app),
    ("Unavailable market rate is null", "rate:null" in app),
    ("Frankfurter uses AbortController", "signal:controller.signal" in app and "api.frankfurter.dev" in app),
    ("Rate request-id guard exists", "requestId!==rateRequestId" in app),
    ("NBP request-id guard exists", "requestId!==cashRequestId" in app),
    ("Captured pair used for cache key", "cacheKey(from,to)" in app),
    ("Cached entry contains data date", "dataDate:state.rateDataDate" in app),
    ("Cached entry contains fetch timestamp", "fetchedAt:state.rateFetchedAt" in app),
    ("Explicit cached state exists", "finishRate('cached')" in app),
    ("Explicit unavailable state exists", "finishRate('unavailable')" in app),
    ("Travel mode tolerates no rate", "hasRate()?format(v*state.rate" in app),
    ("SW uses current Frankfurter hostname", "api.frankfurter.dev" in sw),
    ("SW does not use old Frankfurter hostname", "api.frankfurter.app" not in sw),
    ("SW makes NBP network-only", "api.nbp.pl" in sw),
    ("SW cache bumped", "glass-currency-v2.5.0" in sw),
]

width = max(len(name) for name, _ in checks)
failed = False
for name, ok in checks:
    print(f"{name:<{width}}  {'PASS' if ok else 'FAIL'}")
    failed |= not ok

raise SystemExit(1 if failed else 0)
