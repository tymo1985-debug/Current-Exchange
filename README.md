# Current-Exchange — P0 Rate Safety

Prepared against the current repository state whose latest commit was
`f2004c4814df91a1194d6253b590e2be15f1c810`.

Production files changed by the patch: `app.js`, `sw.js`.

## Fixes

- removes hard-coded fallback exchange rates;
- never substitutes `1` for an unavailable market rate;
- explicit live / saved / unavailable / same-currency states;
- validates cached rates and stores market-data date + local fetch timestamp;
- remains compatible with legacy `{rate, updated}` cache entries without claiming an invented save time;
- `AbortController` + request-id + captured-pair checks for Frankfurter;
- the same race protection for NBP;
- avoids mixing a live NBP benchmark with a saved Frankfurter rate;
- service worker makes Frankfurter and NBP network-only;
- removes the obsolete `api.frankfurter.app` rule;
- bumps service-worker cache to `glass-currency-v2.5.0`.

## Apply

From the repository root:

```bash
python3 apply_p0_rate_safety.py
python3 verify_p0_rate_safety.py
```

Or pass the repository path explicitly:

```bash
python3 apply_p0_rate_safety.py /path/to/Current-Exchange
python3 verify_p0_rate_safety.py /path/to/Current-Exchange
```

The patch validates every expected source anchor before writing either production file.
If Node.js is installed, it also runs `node --check` before writing.

## Browser checks

1. Online pair: live rate + market data date.
2. Offline with cache: saved-rate status; no pretending it is live.
3. Offline without cache: target amount blank, rate line shows `—`, status says unavailable.
4. Rapid pair switching: late response from an older pair must never overwrite the newest pair.
5. Restore network and refresh: live rate replaces saved/unavailable state.
6. Same currency: exactly 1:1 without a market request.
7. Reload installed PWA: API responses must not come from Cache Storage.
8. PLN comparison: automatic NBP comparison runs only with a live Frankfurter rate.
