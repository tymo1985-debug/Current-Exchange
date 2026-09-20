# Current-Exchange — Currency Picker UX patch

Target baseline: `c58d6c2450508998c329d91b19a03ff981c04b86`

Implements:
- no automatic keyboard when the currency selector opens;
- Favorites, Recent, and All currencies sections;
- star/unstar any currency;
- persistence of favorites and recent currencies in `glassCurrencyState`;
- RU / UA / DE / EN labels for the new selector UI;
- focus return after closing the bottom sheet;
- browser zoom restored by removing `user-scalable=no`;
- PWA cache/version bumped to 2.4.

Existing conversion logic and static Quick Pairs are intentionally preserved.

## Apply

```bash
python3 apply_currency_picker.py /path/to/Current-Exchange
```

Or place the script in the repository root and run:

```bash
python3 apply_currency_picker.py
```

The script validates every expected source anchor before writing any file. If the repository has diverged from the target baseline, it stops instead of partially applying the patch.

After applying:

```bash
git diff -- app.js index.html styles.css sw.js
```

Recommended manual checks:
1. Open either currency selector: the keyboard must stay closed.
2. Tap the search field: keyboard opens and filtering works.
3. Star/unstar currencies and reload: choices persist.
4. Select currencies and reopen: Recent is updated.
5. Switch RU / UA / DE / EN while the picker is open.
6. Verify Quick Pairs, swap, calculator, Travel Mode, and refresh still work.
7. Reload the installed PWA once so the new `glass-currency-v2.4.0` cache activates.
