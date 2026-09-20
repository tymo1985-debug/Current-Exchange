#!/usr/bin/env python3
from pathlib import Path
import sys

repo = Path(sys.argv[1]).resolve() if len(sys.argv) > 1 else Path.cwd().resolve()

required = ["app.js", "index.html", "styles.css", "sw.js"]
missing = [name for name in required if not (repo / name).is_file()]
if missing:
    raise SystemExit(f"Missing required files in {repo}: {', '.join(missing)}")

files = {name: (repo / name).read_text(encoding="utf-8") for name in required}

def replace_once(text, old, new, label):
    count = text.count(old)
    if count != 1:
        raise SystemExit(
            f"Patch anchor '{label}' expected once, found {count}. "
            "This patch targets Current-Exchange commit c58d6c2."
        )
    return text.replace(old, new, 1)

app = files["app.js"]
html = files["index.html"]
css = files["styles.css"]
sw = files["sw.js"]

app = replace_once(
    app,
    "const FAVORITES = [['EUR','PLN'],['EUR','CZK'],['PLN','CZK'],['EUR','USD'],['USD','PLN']];",
    "const QUICK_PAIRS = [['EUR','PLN'],['EUR','CZK'],['PLN','CZK'],['EUR','USD'],['USD','PLN']];\n"
    "const DEFAULT_FAVORITE_CURRENCIES = ['EUR','CZK','PLN','USD'];\n"
    "const MAX_RECENT_CURRENCIES = 6;",
    "quick pair constants",
)

app = replace_once(
    app,
    "Object.assign(I18N.en,{rateComparison:'Rate comparison',compareSubtitle:'Online and exchange office',comparisonCountry:'Comparison source',cashEyebrow:'RATE COMPARISON',cashTitle:'Online and exchange office'});",
    "Object.assign(I18N.en,{rateComparison:'Rate comparison',compareSubtitle:'Online and exchange office',comparisonCountry:'Comparison source',cashEyebrow:'RATE COMPARISON',cashTitle:'Online and exchange office'});\n"
    "Object.assign(I18N.ru,{currencies:'ВАЛЮТЫ',chooseCurrency:'Выберите валюту',currencySearch:'Название или код',favoriteCurrencies:'ИЗБРАННЫЕ',recentCurrencies:'НЕДАВНИЕ',allCurrencies:'ВСЕ ВАЛЮТЫ',currencyNotFound:'Валюта не найдена',favoriteHint:'Добавить в избранное',unfavoriteHint:'Убрать из избранного'});\n"
    "Object.assign(I18N.uk,{currencies:'ВАЛЮТИ',chooseCurrency:'Виберіть валюту',currencySearch:'Назва або код',favoriteCurrencies:'ОБРАНІ',recentCurrencies:'НЕДАВНІ',allCurrencies:'УСІ ВАЛЮТИ',currencyNotFound:'Валюту не знайдено',favoriteHint:'Додати до обраного',unfavoriteHint:'Прибрати з обраного'});\n"
    "Object.assign(I18N.de,{currencies:'WÄHRUNGEN',chooseCurrency:'Währung wählen',currencySearch:'Name oder Code',favoriteCurrencies:'FAVORITEN',recentCurrencies:'ZULETZT VERWENDET',allCurrencies:'ALLE WÄHRUNGEN',currencyNotFound:'Keine Währung gefunden',favoriteHint:'Zu Favoriten hinzufügen',unfavoriteHint:'Aus Favoriten entfernen'});\n"
    "Object.assign(I18N.en,{currencies:'CURRENCIES',chooseCurrency:'Choose currency',currencySearch:'Name or code',favoriteCurrencies:'FAVORITES',recentCurrencies:'RECENT',allCurrencies:'ALL CURRENCIES',currencyNotFound:'Currency not found',favoriteHint:'Add to favorites',unfavoriteHint:'Remove from favorites'});",
    "picker i18n",
)

app = replace_once(
    app,
    "const state = {from:params.get('from') || saved.from || 'EUR',to:params.get('to') || saved.to || 'PLN',rate:1,cashRate:null,cashKind:null,activeInput:'from',updated:null,pickerSide:'from',lang:saved.lang||((navigator.language||'ru').slice(0,2))};\n"
    "let installPrompt, inputTimer;",
    "const state = {from:params.get('from') || saved.from || 'EUR',to:params.get('to') || saved.to || 'PLN',rate:1,cashRate:null,cashKind:null,activeInput:'from',updated:null,pickerSide:'from',lang:saved.lang||((navigator.language||'ru').slice(0,2))};\n"
    "function normalizeCurrencyCodes(list){return [...new Set((Array.isArray(list)?list:[]).filter(code=>CURRENCIES[code]))]}\n"
    "let favoriteCurrencies=Array.isArray(saved.favoriteCurrencies)?normalizeCurrencyCodes(saved.favoriteCurrencies):[...DEFAULT_FAVORITE_CURRENCIES];\n"
    "let recentCurrencies=normalizeCurrencyCodes(saved.recentCurrencies).slice(0,MAX_RECENT_CURRENCIES);\n"
    "let currencySheetReturnFocus=null;\n"
    "let installPrompt, inputTimer;",
    "picker state",
)

app = replace_once(
    app,
    "function save(){localStorage.setItem('glassCurrencyState',JSON.stringify({from:state.from,to:state.to,travel:$('travelToggle').checked,theme:document.body.classList.contains('light')?'light':'dark',lang:state.lang}))}",
    "function save(){localStorage.setItem('glassCurrencyState',JSON.stringify({from:state.from,to:state.to,travel:$('travelToggle').checked,theme:document.body.classList.contains('light')?'light':'dark',lang:state.lang,favoriteCurrencies,recentCurrencies}))}",
    "persist picker state",
)

app = replace_once(
    app,
    "function applyLanguage(){if(!I18N[state.lang])state.lang='en';document.documentElement.lang=state.lang;$('languageSelect').value=state.lang;document.querySelector('.topbar h1').textContent=t('title');document.querySelectorAll('[data-i18n]').forEach(el=>el.textContent=t(el.dataset.i18n));renderMarket()}",
    "function applyLanguage(){if(!I18N[state.lang])state.lang='en';document.documentElement.lang=state.lang;$('languageSelect').value=state.lang;document.querySelector('.topbar h1').textContent=t('title');document.querySelectorAll('[data-i18n]').forEach(el=>el.textContent=t(el.dataset.i18n));$('currencySearch').placeholder=t('currencySearch');if($('currencySheet').classList.contains('open'))renderCurrencyList($('currencySearch').value);renderMarket()}",
    "language picker refresh",
)

app = replace_once(
    app,
    "  $('favorites').innerHTML=FAVORITES.map(([a,b])=>`<button class=\"pair-chip\" data-pair=\"${a}_${b}\">${CURRENCIES[a].flag} ${a} <span>→</span> ${b}</button>`).join('');",
    "  $('favorites').innerHTML=QUICK_PAIRS.map(([a,b])=>`<button class=\"pair-chip\" data-pair=\"${a}_${b}\">${CURRENCIES[a].flag} ${a} <span>→</span> ${b}</button>`).join('');",
    "quick pairs render",
)

old_picker = r'''function openSheet(side){state.pickerSide=side;$('currencySearch').value='';renderCurrencyList();$('currencySheet').classList.add('open');$('sheetBackdrop').classList.add('open');document.body.style.overflow='hidden';setTimeout(()=>$('currencySearch').focus(),350)}
function closeSheet(){$('currencySheet').classList.remove('open');$('sheetBackdrop').classList.remove('open');document.body.style.overflow=''}
function renderCurrencyList(query=''){
  const q=query.trim().toLocaleLowerCase('ru');const entries=Object.entries(CURRENCIES).filter(([code,v])=>!q||code.toLowerCase().includes(q)||v.name.toLocaleLowerCase('ru').includes(q));
  $('currencyList').innerHTML=entries.map(([code,v])=>`<button class="currency-option" data-code="${code}"><span class="flag">${v.flag}</span><span><b>${code}</b><small>${v.name}</small></span><span class="check">${state[state.pickerSide]===code?'✓':''}</span></button>`).join('') || '<p class="offline-note">Валюта не найдена</p>';
}
function selectCurrency(code){const other=state.pickerSide==='from'?'to':'from';if(state[other]===code)state[other]=state[state.pickerSide];state[state.pickerSide]=code;state.activeInput='from';renderCurrencies();save();closeSheet();animateSwap();loadRate()}'''

new_picker = r'''function openSheet(side){
  state.pickerSide=side;currencySheetReturnFocus=document.activeElement instanceof HTMLElement?document.activeElement:null;$('currencySearch').value='';renderCurrencyList();$('currencySheet').classList.add('open');$('sheetBackdrop').classList.add('open');document.body.style.overflow='hidden';
  setTimeout(()=>$('closeSheet').focus({preventScroll:true}),60);
}
function closeSheet(){
  $('currencySheet').classList.remove('open');$('sheetBackdrop').classList.remove('open');document.body.style.overflow='';
  if(currencySheetReturnFocus?.isConnected)currencySheetReturnFocus.focus({preventScroll:true});currencySheetReturnFocus=null;
}
function currencyOptionMarkup(code){
  const v=CURRENCIES[code],selected=state[state.pickerSide]===code,favorite=favoriteCurrencies.includes(code),favoriteLabel=favorite?t('unfavoriteHint'):t('favoriteHint');
  return `<div class="currency-option-row"><button class="currency-option" data-code="${code}"><span class="flag">${v.flag}</span><span><b>${code}</b><small>${v.name}</small></span><span class="check">${selected?'✓':''}</span></button><button class="currency-favorite${favorite?' active':''}" data-favorite-code="${code}" aria-pressed="${favorite}" aria-label="${favoriteLabel}: ${code}">${favorite?'★':'☆'}</button></div>`;
}
function currencyGroupMarkup(label,codes){return codes.length?`<section class="currency-group"><div class="currency-group-label">${label}</div>${codes.map(currencyOptionMarkup).join('')}</section>`:''}
function renderCurrencyList(query=''){
  const q=query.trim().toLocaleLowerCase('ru'),allCodes=Object.keys(CURRENCIES);
  if(q){const matches=allCodes.filter(code=>code.toLowerCase().includes(q)||CURRENCIES[code].name.toLocaleLowerCase('ru').includes(q));$('currencyList').innerHTML=matches.length?currencyGroupMarkup(t('allCurrencies'),matches):`<p class="offline-note currency-empty">${t('currencyNotFound')}</p>`;return}
  const favorites=favoriteCurrencies.filter(code=>CURRENCIES[code]),recents=recentCurrencies.filter(code=>CURRENCIES[code]&&!favorites.includes(code)),remaining=allCodes.filter(code=>!favorites.includes(code)&&!recents.includes(code));
  $('currencyList').innerHTML=currencyGroupMarkup(t('favoriteCurrencies'),favorites)+currencyGroupMarkup(t('recentCurrencies'),recents)+currencyGroupMarkup(t('allCurrencies'),remaining);
}
function toggleFavoriteCurrency(code){
  if(!CURRENCIES[code])return;favoriteCurrencies=favoriteCurrencies.includes(code)?favoriteCurrencies.filter(item=>item!==code):[...favoriteCurrencies,code];save();renderCurrencyList($('currencySearch').value);
}
function rememberCurrency(code){recentCurrencies=[code,...recentCurrencies.filter(item=>item!==code)].slice(0,MAX_RECENT_CURRENCIES)}
function selectCurrency(code){
  if(!CURRENCIES[code])return;const other=state.pickerSide==='from'?'to':'from';if(state[other]===code)state[other]=state[state.pickerSide];state[state.pickerSide]=code;state.activeInput='from';rememberCurrency(code);renderCurrencies();save();closeSheet();animateSwap();loadRate();
}'''

app = replace_once(app, old_picker, new_picker, "currency picker functions")

app = replace_once(
    app,
    "  $('currencySearch').addEventListener('input',e=>renderCurrencyList(e.target.value));$('currencyList').addEventListener('click',e=>{const b=e.target.closest('.currency-option');if(b)selectCurrency(b.dataset.code)});",
    "  $('currencySearch').addEventListener('input',e=>renderCurrencyList(e.target.value));$('currencyList').addEventListener('click',e=>{const favorite=e.target.closest('.currency-favorite');if(favorite){toggleFavoriteCurrency(favorite.dataset.favoriteCode);return}const b=e.target.closest('.currency-option');if(b)selectCurrency(b.dataset.code)});",
    "picker events",
)

html = replace_once(
    html,
    '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover, user-scalable=no">',
    '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">',
    "viewport zoom",
)

html = replace_once(
    html,
    '<footer><span>Курсы от Frankfurter · данные центробанков</span><span>v2.3</span></footer>',
    '<footer><span>Курсы от Frankfurter · данные центробанков</span><span>v2.4</span></footer>',
    "footer version",
)

html = replace_once(
    html,
    '<div class="sheet-header"><div><span class="eyebrow">ВАЛЮТЫ</span><h2 id="sheetTitle">Выберите валюту</h2></div><button class="icon-button" id="closeSheet" aria-label="Закрыть">×</button></div>',
    '<div class="sheet-header"><div><span class="eyebrow" data-i18n="currencies">ВАЛЮТЫ</span><h2 id="sheetTitle" data-i18n="chooseCurrency">Выберите валюту</h2></div><button class="icon-button" id="closeSheet" aria-label="Закрыть">×</button></div>',
    "picker headings",
)

html = replace_once(
    html,
    '    <div class="recent-label">ПОПУЛЯРНЫЕ И ДОСТУПНЫЕ</div>\n    <div class="currency-list" id="currencyList"></div>',
    '    <div class="currency-list" id="currencyList"></div>',
    "remove old picker label",
)

css = replace_once(
    css,
    ".recent-label{font-size:10px;letter-spacing:.14em;color:var(--muted);font-weight:700;margin:5px 3px 8px}.currency-list{overflow:auto;overscroll-behavior:contain}.currency-option{width:100%;display:grid;grid-template-columns:44px 1fr auto;align-items:center;gap:12px;border:0;border-bottom:1px solid var(--line);background:none;color:var(--text);padding:11px 3px;text-align:left}.currency-option .flag{width:42px;height:42px;border-radius:14px;font-size:22px}.currency-option b{display:block}.currency-option small{display:block;color:var(--muted);margin-top:3px}.currency-option .check{color:var(--accent);font-size:20px}",
    ".currency-list{overflow:auto;overscroll-behavior:contain;padding-bottom:4px}.currency-group+.currency-group{margin-top:12px}.currency-group-label{font-size:10px;letter-spacing:.14em;color:var(--muted);font-weight:800;margin:7px 3px 5px}.currency-option-row{display:grid;grid-template-columns:minmax(0,1fr) 46px;align-items:center;border-bottom:1px solid var(--line)}.currency-option{width:100%;display:grid;grid-template-columns:44px 1fr auto;align-items:center;gap:12px;border:0;background:none;color:var(--text);padding:11px 3px;text-align:left;min-width:0}.currency-option .flag{width:42px;height:42px;border-radius:14px;font-size:22px}.currency-option b{display:block}.currency-option small{display:block;color:var(--muted);margin-top:3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.currency-option .check{color:var(--accent);font-size:20px}.currency-favorite{width:40px;height:40px;border:0;border-radius:13px;background:transparent;color:var(--muted);font-size:23px;display:grid;place-items:center}.currency-favorite.active{color:#fbbf24;background:rgba(251,191,36,.08)}.currency-option:focus-visible,.currency-favorite:focus-visible{outline:2px solid var(--accent);outline-offset:-2px}.search-box:focus-within{border-color:rgba(125,211,252,.55);box-shadow:0 0 0 3px rgba(125,211,252,.08)}.currency-empty{padding:9px 3px 18px}",
    "picker css",
)

sw = replace_once(
    sw,
    "const CACHE = 'glass-currency-v2.3.0';",
    "const CACHE = 'glass-currency-v2.4.0';",
    "cache version",
)

new_files = {"app.js": app, "index.html": html, "styles.css": css, "sw.js": sw}

for name, content in new_files.items():
    (repo / name).write_text(content, encoding="utf-8")

print("Applied Current-Exchange currency picker personalization patch.")
print("Changed: app.js, index.html, styles.css, sw.js")
print("Target baseline: c58d6c2450508998c329d91b19a03ff981c04b86")
