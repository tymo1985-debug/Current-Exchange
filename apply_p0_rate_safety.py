#!/usr/bin/env python3
from pathlib import Path
import re
import shutil
import subprocess
import sys
import tempfile

repo = Path(sys.argv[1]).resolve() if len(sys.argv) > 1 else Path.cwd().resolve()
required = ["app.js", "sw.js"]
missing = [name for name in required if not (repo / name).is_file()]
if missing:
    raise SystemExit(f"Missing required files in {repo}: {', '.join(missing)}")

app = (repo / "app.js").read_text(encoding="utf-8")
sw = (repo / "sw.js").read_text(encoding="utf-8")

def replace_once(text, old, new, label):
    count = text.count(old)
    if count != 1:
        raise SystemExit(
            f"Patch anchor '{label}' expected exactly once, found {count}. "
            "Stop: repository source does not match the supported Current-Exchange baseline."
        )
    return text.replace(old, new, 1)

app = replace_once(
    app,
    "const FALLBACK = {EUR_PLN:4.28,EUR_CZK:24.5,EUR_USD:1.08,EUR_GBP:.84,PLN_CZK:5.72,USD_PLN:3.96};\n",
    "",
    "FALLBACK removal",
)

app = replace_once(
    app,
    "Object.assign(I18N.en,{rateComparison:'Rate comparison',compareSubtitle:'Online and exchange office',comparisonCountry:'Comparison source',cashEyebrow:'RATE COMPARISON',cashTitle:'Online and exchange office'});",
    "Object.assign(I18N.en,{rateComparison:'Rate comparison',compareSubtitle:'Online and exchange office',comparisonCountry:'Comparison source',cashEyebrow:'RATE COMPARISON',cashTitle:'Online and exchange office'});\n"
    "Object.assign(I18N.ru,{rateLoaded:'Курс получен',savedRate:'Сохранённый курс',rateUnavailable:'Курс недоступен',sameCurrency:'Одинаковая валюта',dataFor:'данные за',savedAt:'сохранён',noSavedRate:'нет сохранённого курса',rateUpdatedToast:'Курс обновлён',savedRateToast:'Используется сохранённый курс',rateUnavailableToast:'Курс недоступен',comparisonNeedsFresh:'Для сравнения обновите онлайн-курс'});\n"
    "Object.assign(I18N.uk,{rateLoaded:'Курс отримано',savedRate:'Збережений курс',rateUnavailable:'Курс недоступний',sameCurrency:'Однакова валюта',dataFor:'дані за',savedAt:'збережено',noSavedRate:'немає збереженого курсу',rateUpdatedToast:'Курс оновлено',savedRateToast:'Використовується збережений курс',rateUnavailableToast:'Курс недоступний',comparisonNeedsFresh:'Для порівняння оновіть онлайн-курс'});\n"
    "Object.assign(I18N.de,{rateLoaded:'Kurs geladen',savedRate:'Gespeicherter Kurs',rateUnavailable:'Kurs nicht verfügbar',sameCurrency:'Gleiche Währung',dataFor:'Daten vom',savedAt:'gespeichert',noSavedRate:'kein gespeicherter Kurs',rateUpdatedToast:'Kurs aktualisiert',savedRateToast:'Gespeicherter Kurs wird verwendet',rateUnavailableToast:'Kurs nicht verfügbar',comparisonNeedsFresh:'Für den Vergleich den Onlinekurs aktualisieren'});\n"
    "Object.assign(I18N.en,{rateLoaded:'Rate loaded',savedRate:'Saved rate',rateUnavailable:'Rate unavailable',sameCurrency:'Same currency',dataFor:'data for',savedAt:'saved',noSavedRate:'no saved rate',rateUpdatedToast:'Rate updated',savedRateToast:'Using saved rate',rateUnavailableToast:'Rate unavailable',comparisonNeedsFresh:'Refresh the online rate to compare'});",
    "P0 i18n",
)

app = replace_once(
    app,
    "const state = {from:params.get('from') || saved.from || 'EUR',to:params.get('to') || saved.to || 'PLN',rate:1,cashRate:null,cashKind:null,activeInput:'from',updated:null,pickerSide:'from',lang:saved.lang||((navigator.language||'ru').slice(0,2))};",
    "const state = {from:params.get('from') || saved.from || 'EUR',to:params.get('to') || saved.to || 'PLN',rate:null,rateStatus:'loading',rateDataDate:null,rateFetchedAt:null,cashRate:null,cashKind:null,activeInput:'from',pickerSide:'from',lang:saved.lang||((navigator.language||'ru').slice(0,2))};",
    "rate state",
)

app = replace_once(
    app,
    "let installPrompt, inputTimer;",
    "let installPrompt, inputTimer, rateRequestController=null, rateRequestId=0, cashRequestController=null, cashRequestId=0;",
    "request controllers",
)

app = replace_once(
    app,
    "function applyLanguage(){if(!I18N[state.lang])state.lang='en';document.documentElement.lang=state.lang;$('languageSelect').value=state.lang;document.querySelector('.topbar h1').textContent=t('title');document.querySelectorAll('[data-i18n]').forEach(el=>el.textContent=t(el.dataset.i18n));renderMarket()}",
    "function applyLanguage(){if(!I18N[state.lang])state.lang='en';document.documentElement.lang=state.lang;$('languageSelect').value=state.lang;document.querySelector('.topbar h1').textContent=t('title');document.querySelectorAll('[data-i18n]').forEach(el=>el.textContent=t(el.dataset.i18n));renderRateStatus();renderMarket()}",
    "language/status refresh",
)

app = replace_once(
    app,
    "function ageLabel(date){if(!date)return 'нет сохранённых данных';const mins=Math.max(0,Math.round((Date.now()-date.getTime())/60000));if(mins<1)return 'только что';if(mins<60)return `${mins} мин назад`;const hours=Math.round(mins/60);return `${hours} ч назад`}\n"
    "function cacheKey(){return `rate_${state.from}_${state.to}`}\n"
    "function getCached(){try{return JSON.parse(localStorage.getItem(cacheKey()))}catch{return null}}",
    "function validRate(value){const n=Number(value);return Number.isFinite(n)&&n>0}\n"
    "function formatRateDate(value){if(!value)return '—';const date=/^\\d{4}-\\d{2}-\\d{2}$/.test(String(value))?new Date(`${value}T12:00:00`):new Date(value);return Number.isNaN(date.getTime())?'—':new Intl.DateTimeFormat(state.lang,{day:'2-digit',month:'2-digit',year:'numeric'}).format(date)}\n"
    "function formatSavedAt(value){if(!value)return '—';const date=new Date(value);return Number.isNaN(date.getTime())?'—':new Intl.DateTimeFormat(state.lang,{dateStyle:'short',timeStyle:'short'}).format(date)}\n"
    "function cacheKey(from=state.from,to=state.to){return `rate_${from}_${to}`}\n"
    "function getCached(from=state.from,to=state.to){try{const raw=JSON.parse(localStorage.getItem(cacheKey(from,to)));if(!raw||!validRate(raw.rate))return null;return{rate:Number(raw.rate),dataDate:raw.dataDate||raw.updated||null,fetchedAt:raw.fetchedAt||null}}catch{return null}}\n"
    "function hasRate(){return validRate(state.rate)}",
    "cache helpers",
)

old_rate_block = r'''function calculate(source=state.activeInput,animate=true){
  if(source==='from'){$('toAmount').value=formatInput(amountValue($('fromAmount').value)*state.rate)}
  else {$('fromAmount').value=formatInput(amountValue($('toAmount').value)/state.rate)}
  $('rateText').textContent=`1 ${state.from} = ${format(state.rate,'',false)} ${state.to}`;
  if(animate){const el=source==='from'?$('toAmount'):$('fromAmount');el.classList.remove('value-pop');void el.offsetWidth;el.classList.add('value-pop')}
  renderTravel();
  renderMarket();
}
async function loadRate(showToast=false){
  $('refreshButton').classList.add('loading');$('networkStatus').textContent=t('updating');$('statusDot').className='';
  if(state.from===state.to){state.rate=1;state.updated=new Date();finishRate(true);return}
  try{
    const response=await fetch(`https://api.frankfurter.dev/v2/rate/${state.from}/${state.to}`,{cache:'no-store'});
    if(!response.ok)throw new Error('Rate unavailable'); const data=await response.json(); state.rate=data.rate;state.updated=new Date(data.date||Date.now());
    localStorage.setItem(cacheKey(),JSON.stringify({rate:state.rate,updated:state.updated.toISOString()}));finishRate(true);if(showToast)toast('Курс обновлён');
  }catch(error){
    const cached=getCached(); const fallback=FALLBACK[`${state.from}_${state.to}`] || (FALLBACK[`${state.to}_${state.from}`]?1/FALLBACK[`${state.to}_${state.from}`]:null);
    if(cached){state.rate=cached.rate;state.updated=new Date(cached.updated)}else if(fallback){state.rate=fallback;state.updated=null}else{state.rate=1;state.updated=null}
    finishRate(false);if(showToast)toast(cached?'Используется сохранённый курс':'Сеть недоступна');
  }
}
function finishRate(online){$('refreshButton').classList.remove('loading');$('statusDot').className=online?'online':'offline';$('networkStatus').textContent=online?t('fresh'):t('offline');$('updatedAt').textContent=state.updated?`${t('updated')} ${ageLabel(state.updated)}`:'—';calculate(state.activeInput,false);loadCashBenchmark()}'''

new_rate_block = r'''function calculate(source=state.activeInput,animate=true){
  if(!hasRate()){
    if(source==='from')$('toAmount').value='';else $('fromAmount').value='';
    $('rateText').textContent=`1 ${state.from} = — ${state.to}`;renderTravel();renderMarket();return;
  }
  if(source==='from'){$('toAmount').value=formatInput(amountValue($('fromAmount').value)*state.rate)}
  else {$('fromAmount').value=formatInput(amountValue($('toAmount').value)/state.rate)}
  $('rateText').textContent=`1 ${state.from} = ${format(state.rate,'',false)} ${state.to}`;
  if(animate){const el=source==='from'?$('toAmount'):$('fromAmount');el.classList.remove('value-pop');void el.offsetWidth;el.classList.add('value-pop')}
  renderTravel();renderMarket();
}
function renderRateStatus(){
  const status=state.rateStatus;
  if(status==='loading'){$('statusDot').className='';$('networkStatus').textContent=t('updating');$('updatedAt').textContent='—';return}
  $('statusDot').className=status==='online'||status==='identity'?'online':status==='cached'?'cached':'offline';
  $('networkStatus').textContent=status==='online'?t('rateLoaded'):status==='cached'?t('savedRate'):status==='identity'?t('sameCurrency'):t('rateUnavailable');
  if(status==='online')$('updatedAt').textContent=state.rateDataDate?`${t('dataFor')} ${formatRateDate(state.rateDataDate)}`:'—';
  else if(status==='cached')$('updatedAt').textContent=state.rateFetchedAt?`${t('savedAt')} ${formatSavedAt(state.rateFetchedAt)} · ${t('dataFor')} ${formatRateDate(state.rateDataDate)}`:(state.rateDataDate?`${t('dataFor')} ${formatRateDate(state.rateDataDate)}`:'—');
  else if(status==='identity')$('updatedAt').textContent='1:1';
  else $('updatedAt').textContent=t('noSavedRate');
}
async function loadRate(showToast=false){
  const requestId=++rateRequestId,from=state.from,to=state.to;
  rateRequestController?.abort();cashRequestController?.abort();cashRequestId++;
  const controller=new AbortController();rateRequestController=controller;
  state.rate=null;state.rateStatus='loading';state.rateDataDate=null;state.rateFetchedAt=null;renderRateStatus();calculate(state.activeInput,false);
  if(from===to){state.rate=1;finishRate('identity');return}
  try{
    const response=await fetch(`https://api.frankfurter.dev/v2/rate/${from}/${to}`,{cache:'no-store',signal:controller.signal});
    if(!response.ok)throw new Error('Rate unavailable');const data=await response.json(),rate=Number(data.rate);
    if(!validRate(rate))throw new Error('Invalid rate');
    if(requestId!==rateRequestId||controller.signal.aborted||state.from!==from||state.to!==to)return;
    state.rate=rate;state.rateDataDate=data.date||null;state.rateFetchedAt=new Date().toISOString();
    localStorage.setItem(cacheKey(from,to),JSON.stringify({rate:state.rate,dataDate:state.rateDataDate,fetchedAt:state.rateFetchedAt}));
    finishRate('online');if(showToast)toast(t('rateUpdatedToast'));
  }catch(error){
    if(error?.name==='AbortError'||requestId!==rateRequestId||state.from!==from||state.to!==to)return;
    const cached=getCached(from,to);
    if(cached){state.rate=cached.rate;state.rateDataDate=cached.dataDate;state.rateFetchedAt=cached.fetchedAt;finishRate('cached');if(showToast)toast(t('savedRateToast'))}
    else{state.rate=null;state.rateDataDate=null;state.rateFetchedAt=null;finishRate('unavailable');if(showToast)toast(t('rateUnavailableToast'))}
  }
}
function finishRate(status){
  state.rateStatus=status;$('refreshButton').classList.remove('loading');renderRateStatus();calculate(state.activeInput,false);loadCashBenchmark();
}'''

app = replace_once(app, old_rate_block, new_rate_block, "rate loading block")

old_cash_block = r'''async function loadCashBenchmark(){state.cashRate=null;state.cashKind=null;if($('marketCountry').value!=='PL'||(state.from!=='PLN'&&state.to!=='PLN')){renderMarket();return}const foreign=state.from==='PLN'?state.to:state.from;if(foreign==='PLN'){renderMarket();return}try{const response=await fetch(`https://api.nbp.pl/api/exchangerates/rates/c/${foreign}/?format=json`,{cache:'no-store'});if(!response.ok)throw new Error();const item=(await response.json()).rates[0];if(state.to==='PLN'){state.cashRate=item.bid;state.cashKind='buy'}else{state.cashRate=1/item.ask;state.cashKind='sell'}renderMarket()}catch{renderMarket()}}
function renderMarket(){if(!$('marketCountry'))return;const manual=$('marketCountry').value==='manual';$('manualMarket').classList.toggle('hidden',!manual);$('marketAvailable').classList.toggle('hidden',manual);if(manual){const rate=parseValue($('manualRate').value);state.cashRate=rate||null;renderDifference();return}$('onlineRateValue').textContent=`${format(state.rate)} ${state.to}`;if(!state.cashRate){$('cashRateValue').textContent='—';$('differenceText').textContent=t('unavailable');$('differenceText').className='';return}$('cashRateValue').textContent=`${format(state.cashRate)} ${state.to} · ${t(state.cashKind)}`;renderDifference()}
function renderDifference(){if(!state.cashRate){if($('marketCountry').value==='manual')$('differenceText').textContent='—';return}const amount=amountValue($('fromAmount').value);const cash=amount*state.cashRate,online=amount*state.rate,diff=cash-online,pct=online?diff/online*100:0;$('differenceText').textContent=`${t('difference')}: ${diff>=0?'+':''}${format(diff)} ${state.to} (${pct>=0?'+':''}${pct.toFixed(2)}%)`;$('differenceText').className=diff>=0?'positive':'negative'}'''

new_cash_block = r'''async function loadCashBenchmark(){
  const requestId=++cashRequestId,from=state.from,to=state.to;cashRequestController?.abort();const controller=new AbortController();cashRequestController=controller;
  state.cashRate=null;state.cashKind=null;
  if($('marketCountry').value!=='PL'){renderMarket();return}
  if(state.rateStatus!=='online'){renderMarket();return}
  if(from!=='PLN'&&to!=='PLN'){renderMarket();return}
  const foreign=from==='PLN'?to:from;if(foreign==='PLN'){renderMarket();return}
  try{const response=await fetch(`https://api.nbp.pl/api/exchangerates/rates/c/${foreign}/?format=json`,{cache:'no-store',signal:controller.signal});if(!response.ok)throw new Error();const item=(await response.json()).rates[0];if(requestId!==cashRequestId||controller.signal.aborted||state.from!==from||state.to!==to)return;if(to==='PLN'){state.cashRate=item.bid;state.cashKind='buy'}else{state.cashRate=1/item.ask;state.cashKind='sell'}renderMarket()}catch(error){if(error?.name!=='AbortError'&&requestId===cashRequestId&&state.from===from&&state.to===to)renderMarket()}
}
function renderMarket(){if(!$('marketCountry'))return;const manual=$('marketCountry').value==='manual';$('manualMarket').classList.toggle('hidden',!manual);$('marketAvailable').classList.toggle('hidden',manual);if(manual){const rate=parseValue($('manualRate').value);state.cashRate=rate||null;renderDifference();return}$('onlineRateValue').textContent=hasRate()?`${format(state.rate)} ${state.to}`:'—';if(state.rateStatus==='cached'){$('cashRateValue').textContent='—';$('differenceText').textContent=t('comparisonNeedsFresh');$('differenceText').className='';return}if(!state.cashRate){$('cashRateValue').textContent='—';$('differenceText').textContent=hasRate()?t('unavailable'):t('rateUnavailable');$('differenceText').className='';return}$('cashRateValue').textContent=`${format(state.cashRate)} ${state.to} · ${t(state.cashKind)}`;renderDifference()}
function renderDifference(){if(!hasRate()){$('differenceText').textContent=t('rateUnavailable');$('differenceText').className='';return}if(!state.cashRate){if($('marketCountry').value==='manual')$('differenceText').textContent='—';return}const amount=amountValue($('fromAmount').value);const cash=amount*state.cashRate,online=amount*state.rate,diff=cash-online,pct=online?diff/online*100:0;$('differenceText').textContent=`${t('difference')}: ${diff>=0?'+':''}${format(diff)} ${state.to} (${pct>=0?'+':''}${pct.toFixed(2)}%)`;$('differenceText').className=diff>=0?'positive':'negative'}'''

app = replace_once(app, old_cash_block, new_cash_block, "cash benchmark block")

app = replace_once(
    app,
    "  $('travelList').innerHTML=values.slice(1).map(v=>`<div class=\"travel-row\"><span>${format(v,'',true)} ${state.from}</span><b>${format(v*state.rate,'',false)} ${state.to}</b></div>`).join('');",
    "  $('travelList').innerHTML=values.slice(1).map(v=>`<div class=\"travel-row\"><span>${format(v,'',true)} ${state.from}</span><b>${hasRate()?format(v*state.rate,'',false):'—'} ${state.to}</b></div>`).join('');",
    "travel unavailable state",
)

app = replace_once(
    app,
    "function swap(){const oldFrom=amountValue($('fromAmount').value);[state.from,state.to]=[state.to,state.from];state.rate=1/state.rate;state.activeInput='from';$('fromAmount').value=formatInput(amountValue($('toAmount').value));$('toAmount').value=formatInput(oldFrom);$('swapButton').classList.toggle('spinning');animateSwap();renderCurrencies();calculate('from');save();loadRate()}",
    "function swap(){const fromValue=$('fromAmount').value,toValue=$('toAmount').value,available=hasRate();[state.from,state.to]=[state.to,state.from];state.activeInput='from';if(available&&toValue){$('fromAmount').value=toValue;$('toAmount').value=fromValue}else{$('toAmount').value=''}state.rate=null;$('swapButton').classList.toggle('spinning');animateSwap();renderCurrencies();save();loadRate()}",
    "safe swap",
)

sw = re.sub(
    r"const CACHE = 'glass-currency-v[^']+';",
    "const CACHE = 'glass-currency-v2.5.0';",
    sw,
    count=1,
)

sw = replace_once(
    sw,
    "  if (url.hostname === 'api.frankfurter.app') {\n"
    "    event.respondWith(fetch(event.request).catch(() => caches.match(event.request)));\n"
    "    return;\n"
    "  }\n"
    "  event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request).then(response => {",
    "  if (url.hostname === 'api.frankfurter.dev' || url.hostname === 'api.nbp.pl') {\n"
    "    event.respondWith(fetch(event.request));\n"
    "    return;\n"
    "  }\n"
    "  if (url.origin !== self.location.origin) return;\n"
    "  event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request).then(response => {",
    "service-worker API policy",
)

required_checks = {
    "no FALLBACK": "FALLBACK" not in app,
    "null unavailable rate": "rate:null" in app,
    "AbortController": "new AbortController()" in app,
    "Frankfurter request-id guard": "requestId!==rateRequestId" in app,
    "NBP request-id guard": "requestId!==cashRequestId" in app,
    "explicit unavailable state": "finishRate('unavailable')" in app,
    "dated cache": "dataDate:state.rateDataDate,fetchedAt:state.rateFetchedAt" in app,
    "Frankfurter network-only SW": "api.frankfurter.dev" in sw,
    "NBP network-only SW": "api.nbp.pl" in sw,
    "old Frankfurter hostname removed": "api.frankfurter.app" not in sw,
}
failed = [name for name, ok in required_checks.items() if not ok]
if failed:
    raise SystemExit("Internal patch validation failed: " + ", ".join(failed))

node = shutil.which("node")
if node:
    with tempfile.TemporaryDirectory() as td:
        temp_app = Path(td) / "app.js"
        temp_sw = Path(td) / "sw.js"
        temp_app.write_text(app, encoding="utf-8")
        temp_sw.write_text(sw, encoding="utf-8")
        for temp in (temp_app, temp_sw):
            result = subprocess.run([node, "--check", str(temp)], capture_output=True, text=True)
            if result.returncode != 0:
                raise SystemExit(f"JavaScript syntax check failed for {temp.name}:\n{result.stderr}")

(repo / "app.js").write_text(app, encoding="utf-8")
(repo / "sw.js").write_text(sw, encoding="utf-8")

print("P0 rate-safety patch applied successfully.")
print("Changed production files: app.js, sw.js")
print("Service worker cache: glass-currency-v2.5.0")
print("No hard-coded or 1:1 fallback is used for unavailable market rates.")
