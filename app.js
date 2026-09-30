const CURRENCIES = {
  EUR:{name:'Евро',flag:'🇪🇺',symbol:'€'}, PLN:{name:'Польский злотый',flag:'🇵🇱',symbol:'zł'},
  CZK:{name:'Чешская крона',flag:'🇨🇿',symbol:'Kč'}, USD:{name:'Доллар США',flag:'🇺🇸',symbol:'$'},
  GBP:{name:'Фунт стерлингов',flag:'🇬🇧',symbol:'£'}, CHF:{name:'Швейцарский франк',flag:'🇨🇭',symbol:'Fr'},
  SEK:{name:'Шведская крона',flag:'🇸🇪',symbol:'kr'}, NOK:{name:'Норвежская крона',flag:'🇳🇴',symbol:'kr'},
  DKK:{name:'Датская крона',flag:'🇩🇰',symbol:'kr'}, UAH:{name:'Украинская гривна',flag:'🇺🇦',symbol:'₴'},
  HUF:{name:'Венгерский форинт',flag:'🇭🇺',symbol:'Ft'}, RON:{name:'Румынский лей',flag:'🇷🇴',symbol:'lei'},
  BGN:{name:'Болгарский лев',flag:'🇧🇬',symbol:'лв'}, TRY:{name:'Турецкая лира',flag:'🇹🇷',symbol:'₺'},
  JPY:{name:'Японская иена',flag:'🇯🇵',symbol:'¥'}, CAD:{name:'Канадский доллар',flag:'🇨🇦',symbol:'C$'},
  AUD:{name:'Австралийский доллар',flag:'🇦🇺',symbol:'A$'}, CNY:{name:'Китайский юань',flag:'🇨🇳',symbol:'¥'},
  ISK:{name:'Исландская крона',flag:'🇮🇸',symbol:'kr'}, BRL:{name:'Бразильский реал',flag:'🇧🇷',symbol:'R$'}
};
const QUICK_PAIRS = [['EUR','PLN'],['EUR','CZK'],['PLN','CZK'],['EUR','USD'],['USD','PLN']];
const DEFAULT_FAVORITE_CURRENCIES = ['EUR','CZK','PLN','USD'];
const MAX_RECENT_CURRENCIES = 6;
const MIN_ACTIVE_CURRENCIES = 2;
const DEFAULT_ACTIVE_CURRENCIES = Object.keys(CURRENCIES);
const CATALOG_KEY = 'glassCurrencyCatalog';
const CATALOG_TTL = 7*24*3600*1000;
const FLAG_OVERRIDES = {EUR:'🇪🇺',XAF:'🌍',XOF:'🌍',XCD:'🌎',XPF:'🌏',XDR:'🏦',ANG:'🇨🇼'};
const isCode = code => typeof code==='string' && /^[A-Z]{3}$/.test(code);
function flagFor(code){if(FLAG_OVERRIDES[code])return FLAG_OVERRIDES[code];if(code.startsWith('X'))return '💱';return String.fromCodePoint(...[...code.slice(0,2)].map(c=>0x1F1E6+c.charCodeAt(0)-65))}
function symbolFor(code){try{const part=new Intl.NumberFormat('en',{style:'currency',currency:code,currencyDisplay:'narrowSymbol'}).formatToParts(1).find(p=>p.type==='currency');return part?.value||code}catch{return code}}
function meta(code){if(!CURRENCIES[code]&&isCode(code))CURRENCIES[code]={name:code,flag:flagFor(code),symbol:symbolFor(code)};return CURRENCIES[code]||{name:code,flag:'💱',symbol:code}}
function readCatalog(){try{const v=JSON.parse(localStorage.getItem(CATALOG_KEY));return v&&Array.isArray(v.codes)?v:null}catch{return null}}
let catalogCodes=(()=>{const c=readCatalog();return [...new Set([...DEFAULT_ACTIVE_CURRENCIES,...(c?c.codes.filter(isCode):[])])].sort()})();
function parseCatalog(data){let codes=[];if(Array.isArray(data))codes=data.map(i=>typeof i==='string'?i:(i?.iso_code||i?.code||i?.currency));else if(data&&typeof data==='object')codes=Object.keys(data);return [...new Set(codes.filter(isCode).map(c=>c.toUpperCase()))]}
async function loadCatalog(force=false){const c=readCatalog();if(!force&&c&&Date.now()-c.fetchedAt<CATALOG_TTL)return;for(const url of ['https://api.frankfurter.dev/v2/currencies','https://api.frankfurter.dev/v1/currencies']){try{const r=await fetch(url,{cache:'no-store'});if(!r.ok)continue;const codes=parseCatalog(await r.json());if(codes.length<5)continue;localStorage.setItem(CATALOG_KEY,JSON.stringify({codes,fetchedAt:Date.now()}));catalogCodes=[...new Set([...DEFAULT_ACTIVE_CURRENCIES,...codes])].sort();if($('currencySheet').classList.contains('open'))renderCurrencyList($('currencySearch').value);return}catch{}}}
const I18N={
 ru:{title:'Конвертер',updating:'Обновляем курс…',fresh:'Курс актуален',offline:'Офлайн · сохранённый курс',updated:'обновлено',cashEyebrow:'НАЛИЧНЫЙ ОБМЕН',cashTitle:'Ориентир по стране',otherCountry:'🌍 Другая страна',onlineRate:'Онлайн-курс',cashRate:'Покупка / продажа',manualHint:'Введите курс, указанный в обменном пункте, чтобы увидеть разницу.',officeRate:'Курс обменника',marketNote:'Это официальный ориентир покупки/продажи, а не гарантированное предложение конкретного обменника.',travelSubtitle:'Цены без лишнего набора',difference:'Разница',unavailable:'Для этой пары нет официального наличного ориентира',buy:'покупка',sell:'продажа',calculatorEyebrow:'БЫСТРЫЙ РАСЧЁТ',calculator:'Калькулятор',history:'История',clear:'Очистить',applyResult:'Использовать результат',emptyHistory:'Пока пусто'},
 uk:{title:'Конвертер',updating:'Оновлюємо курс…',fresh:'Курс актуальний',offline:'Офлайн · збережений курс',updated:'оновлено',cashEyebrow:'ГОТІВКОВИЙ ОБМІН',cashTitle:'Орієнтир за країною',otherCountry:'🌍 Інша країна',onlineRate:'Онлайн-курс',cashRate:'Купівля / продаж',manualHint:'Введіть курс, указаний в обмінному пункті, щоб побачити різницю.',officeRate:'Курс обмінника',marketNote:'Це офіційний орієнтир купівлі/продажу, а не гарантована пропозиція конкретного обмінника.',travelSubtitle:'Ціни без зайвого набору',difference:'Різниця',unavailable:'Для цієї пари немає офіційного готівкового орієнтира',buy:'купівля',sell:'продаж',calculatorEyebrow:'ШВИДКИЙ РОЗРАХУНОК',calculator:'Калькулятор',history:'Історія',clear:'Очистити',applyResult:'Використати результат',emptyHistory:'Поки порожньо'},
 de:{title:'Währungsrechner',updating:'Kurs wird aktualisiert…',fresh:'Kurs ist aktuell',offline:'Offline · gespeicherter Kurs',updated:'aktualisiert',cashEyebrow:'BARGELDWECHSEL',cashTitle:'Länder-Richtwert',otherCountry:'🌍 Anderes Land',onlineRate:'Onlinekurs',cashRate:'Ankauf / Verkauf',manualHint:'Geben Sie den Kurs der Wechselstube ein, um die Differenz zu sehen.',officeRate:'Wechselstubenkurs',marketNote:'Dies ist ein offizieller An-/Verkaufsrichtwert, kein garantiertes Angebot einer bestimmten Wechselstube.',travelSubtitle:'Preise ohne Tippen',difference:'Differenz',unavailable:'Für dieses Paar ist kein offizieller Bargeld-Richtwert verfügbar',buy:'Ankauf',sell:'Verkauf',calculatorEyebrow:'SCHNELLRECHNUNG',calculator:'Rechner',history:'Verlauf',clear:'Löschen',applyResult:'Ergebnis übernehmen',emptyHistory:'Noch leer'},
 en:{title:'Converter',updating:'Updating rate…',fresh:'Rate is current',offline:'Offline · saved rate',updated:'updated',cashEyebrow:'CASH EXCHANGE',cashTitle:'Country benchmark',otherCountry:'🌍 Other country',onlineRate:'Online rate',cashRate:'Buy / sell',manualHint:'Enter the exchange-office quote to see the difference.',officeRate:'Exchange-office rate',marketNote:'This is an official buy/sell benchmark, not a guaranteed quote from a specific exchange office.',travelSubtitle:'Prices without typing',difference:'Difference',unavailable:'No official cash benchmark is available for this pair',buy:'buy',sell:'sell',calculatorEyebrow:'QUICK CALCULATION',calculator:'Calculator',history:'History',clear:'Clear',applyResult:'Use result',emptyHistory:'Nothing yet'}
};
Object.assign(I18N.ru,{rateComparison:'Сравнение курса',compareSubtitle:'Онлайн и обменный пункт',comparisonCountry:'Источник сравнения',cashEyebrow:'СРАВНЕНИЕ КУРСА',cashTitle:'Онлайн и обменный пункт'});
Object.assign(I18N.uk,{rateComparison:'Порівняння курсу',compareSubtitle:'Онлайн та обмінний пункт',comparisonCountry:'Джерело порівняння',cashEyebrow:'ПОРІВНЯННЯ КУРСУ',cashTitle:'Онлайн та обмінний пункт'});
Object.assign(I18N.de,{rateComparison:'Kursvergleich',compareSubtitle:'Online und Wechselstube',comparisonCountry:'Vergleichsquelle',cashEyebrow:'KURSVERGLEICH',cashTitle:'Online und Wechselstube'});
Object.assign(I18N.en,{rateComparison:'Rate comparison',compareSubtitle:'Online and exchange office',comparisonCountry:'Comparison source',cashEyebrow:'RATE COMPARISON',cashTitle:'Online and exchange office'});
Object.assign(I18N.ru,{currencies:'ВАЛЮТЫ',chooseCurrency:'Выберите валюту',currencySearch:'Название или код',favoriteCurrencies:'ИЗБРАННЫЕ',recentCurrencies:'НЕДАВНИЕ',allCurrencies:'ВСЕ ВАЛЮТЫ',currencyNotFound:'Валюта не найдена',favoriteHint:'Добавить в избранное',unfavoriteHint:'Убрать из избранного'});
Object.assign(I18N.uk,{currencies:'ВАЛЮТИ',chooseCurrency:'Виберіть валюту',currencySearch:'Назва або код',favoriteCurrencies:'ОБРАНІ',recentCurrencies:'НЕДАВНІ',allCurrencies:'УСІ ВАЛЮТИ',currencyNotFound:'Валюту не знайдено',favoriteHint:'Додати до обраного',unfavoriteHint:'Прибрати з обраного'});
Object.assign(I18N.de,{currencies:'WÄHRUNGEN',chooseCurrency:'Währung wählen',currencySearch:'Name oder Code',favoriteCurrencies:'FAVORITEN',recentCurrencies:'ZULETZT VERWENDET',allCurrencies:'ALLE WÄHRUNGEN',currencyNotFound:'Keine Währung gefunden',favoriteHint:'Zu Favoriten hinzufügen',unfavoriteHint:'Aus Favoriten entfernen'});
Object.assign(I18N.en,{currencies:'CURRENCIES',chooseCurrency:'Choose currency',currencySearch:'Name or code',favoriteCurrencies:'FAVORITES',recentCurrencies:'RECENT',allCurrencies:'ALL CURRENCIES',currencyNotFound:'Currency not found',favoriteHint:'Add to favorites',unfavoriteHint:'Remove from favorites'});
Object.assign(I18N.ru,{savedRate:'Сохранённый курс',rateUnavailable:'Курс недоступен',dataDate:'данные за',received:'получен',noRate:'Нет сохранённого курса'});
Object.assign(I18N.uk,{savedRate:'Збережений курс',rateUnavailable:'Курс недоступний',dataDate:'дані за',received:'отримано',noRate:'Немає збереженого курсу'});
Object.assign(I18N.de,{savedRate:'Gespeicherter Kurs',rateUnavailable:'Kurs nicht verfügbar',dataDate:'Daten vom',received:'abgerufen',noRate:'Kein gespeicherter Kurs'});
Object.assign(I18N.en,{savedRate:'Saved rate',rateUnavailable:'Rate unavailable',dataDate:'data for',received:'received',noRate:'No saved rate'});
Object.assign(I18N.ru,{myCurrencies:'МОИ ВАЛЮТЫ',addCurrency:'＋ Добавить валюту',editList:'Изменить',doneEdit:'Готово',addCurrencyTitle:'Добавить валюту',removeHint:'Удалить',cannotRemoveActive:'Эта валюта сейчас выбрана',minCurrencies:'Нужно минимум 2 валюты',added:'добавлена',removed:'удалена',allAdded:'Все валюты уже добавлены',back:'← Назад'});
Object.assign(I18N.uk,{myCurrencies:'МОЇ ВАЛЮТИ',addCurrency:'＋ Додати валюту',editList:'Змінити',doneEdit:'Готово',addCurrencyTitle:'Додати валюту',removeHint:'Видалити',cannotRemoveActive:'Ця валюта зараз вибрана',minCurrencies:'Потрібно щонайменше 2 валюти',added:'додано',removed:'видалено',allAdded:'Усі валюти вже додано',back:'← Назад'});
Object.assign(I18N.de,{myCurrencies:'MEINE WÄHRUNGEN',addCurrency:'＋ Währung hinzufügen',editList:'Bearbeiten',doneEdit:'Fertig',addCurrencyTitle:'Währung hinzufügen',removeHint:'Entfernen',cannotRemoveActive:'Diese Währung ist gerade ausgewählt',minCurrencies:'Mindestens 2 Währungen nötig',added:'hinzugefügt',removed:'entfernt',allAdded:'Alle Währungen sind bereits hinzugefügt',back:'← Zurück'});
Object.assign(I18N.en,{myCurrencies:'MY CURRENCIES',addCurrency:'＋ Add currency',editList:'Edit',doneEdit:'Done',addCurrencyTitle:'Add currency',removeHint:'Remove',cannotRemoveActive:'This currency is currently selected',minCurrencies:'At least 2 currencies required',added:'added',removed:'removed',allAdded:'All currencies are already added',back:'← Back'});
Object.assign(I18N.ru,{resetAmounts:'Сбросить суммы (долгое нажатие — сбросить всё)',resetDone:'Всё сброшено'});
Object.assign(I18N.uk,{resetAmounts:'Скинути суми (довге натискання — скинути все)',resetDone:'Усе скинуто'});
Object.assign(I18N.de,{resetAmounts:'Beträge zurücksetzen (lange drücken — alles zurücksetzen)',resetDone:'Alles zurückgesetzt'});
Object.assign(I18N.en,{resetAmounts:'Reset amounts (long press — reset everything)',resetDone:'Everything reset'});
Object.assign(I18N.ru,{sameCurrency:'Одинаковая валюта',comparisonNeedsFresh:'Обновите онлайн-курс для сравнения',manualSource:'Вручную'});
Object.assign(I18N.uk,{sameCurrency:'Однакова валюта',comparisonNeedsFresh:'Оновіть онлайн-курс для порівняння',manualSource:'Вручну'});
Object.assign(I18N.de,{sameCurrency:'Gleiche Währung',comparisonNeedsFresh:'Onlinekurs für den Vergleich aktualisieren',manualSource:'Manuell'});
Object.assign(I18N.en,{sameCurrency:'Same currency',comparisonNeedsFresh:'Refresh the online rate to compare',manualSource:'Manual'});
const $ = id => document.getElementById(id);
const saved = JSON.parse(localStorage.getItem('glassCurrencyState') || '{}');
const params = new URLSearchParams(location.search);
const state = {from:params.get('from') || saved.from || 'EUR',to:params.get('to') || saved.to || 'PLN',rate:null,rateSource:'unavailable',rateDate:null,receivedAt:null,activeInput:'from',pickerSide:'from',lang:saved.lang||((navigator.language||'ru').slice(0,2))};
function normalizeCurrencyCodes(list){return [...new Set((Array.isArray(list)?list:[]).filter(isCode))]}
let activeCurrencies=Array.isArray(saved.activeCurrencies)?normalizeCurrencyCodes(saved.activeCurrencies):[...DEFAULT_ACTIVE_CURRENCIES];
if(activeCurrencies.length<MIN_ACTIVE_CURRENCIES)activeCurrencies=[...DEFAULT_ACTIVE_CURRENCIES];
let pickerMode='select',pickerEdit=false;
let favoriteCurrencies=Array.isArray(saved.favoriteCurrencies)?normalizeCurrencyCodes(saved.favoriteCurrencies):[...DEFAULT_FAVORITE_CURRENCIES];
let recentCurrencies=normalizeCurrencyCodes(saved.recentCurrencies).slice(0,MAX_RECENT_CURRENCIES);
let currencySheetReturnFocus=null, calculatorReturnFocus=null;
let installPrompt, inputTimer, rateRequestId=0, rateController=null;
let calcSide='from',calcExpression='0',calcHistory=JSON.parse(localStorage.getItem('glassCurrencyCalcHistory')||'[]');

function save(){localStorage.setItem('glassCurrencyState',JSON.stringify({from:state.from,to:state.to,travel:$('travelToggle').checked,theme:document.body.classList.contains('light')?'light':'dark',lang:state.lang,favoriteCurrencies,recentCurrencies,activeCurrencies}))}
function t(key){return (I18N[state.lang]||I18N.ru)[key]||I18N.ru[key]||key}
function currencyName(code){try{return new Intl.DisplayNames([state.lang],{type:'currency'}).of(code)||meta(code).name}catch{return meta(code).name}}
function applyLanguage(){updateResetButton?.();if(!I18N[state.lang])state.lang='en';document.documentElement.lang=state.lang;$('languageSelect').value=state.lang;document.querySelector('.topbar h1').textContent=t('title');document.querySelectorAll('[data-i18n]').forEach(el=>el.textContent=t(el.dataset.i18n));const pickerEyebrow=document.querySelector('#currencySheet .eyebrow');if(pickerEyebrow)pickerEyebrow.textContent=t('currencies');$('sheetTitle').textContent=t('chooseCurrency');$('currencySearch').placeholder=t('currencySearch');renderCurrencies();if($('currencySheet').classList.contains('open'))renderCurrencyList($('currencySearch').value)}
function parseValue(value){return Number(String(value).replace(/\s/g,'').replace(',','.')) || 0}
function evaluateExpression(expression){
  const clean=String(expression).replace(/[\s\u00a0]/g,'').replace(/,/g,'.').replace(/×/g,'*').replace(/÷/g,'/').replace(/−/g,'-');
  const tokens=clean.match(/(?:\d+\.?\d*|\.\d+|[()+\-*/%])/g);if(!tokens||tokens.join('')!==clean)return null;let i=0;
  const factor=()=>{let sign=1;if(tokens[i]==='-'){sign=-1;i++}let value;if(tokens[i]==='('){i++;const inner=expressionLevel();if(tokens[i]!==')')throw 0;i++;value=inner.value}else{value=Number(tokens[i++]);if(!Number.isFinite(value))throw 0}const percent=tokens[i]==='%';if(percent)i++;return{value:sign*value,percent}};
  const term=()=>{let left=factor();while(tokens[i]==='*'||tokens[i]==='/'){const op=tokens[i++],right=factor();const rv=right.percent?right.value/100:right.value;left={value:op==='*'?left.value*rv:left.value/rv,percent:false}}return left};
  const expressionLevel=()=>{let left=term();while(tokens[i]==='+'||tokens[i]==='-'){const op=tokens[i++],right=term();const rv=right.percent?left.value*right.value/100:right.value;left={value:op==='+'?left.value+rv:left.value-rv,percent:false}}return left};
  try{const result=expressionLevel();if(i!==tokens.length||!Number.isFinite(result.value))return null;return result.percent?result.value/100:result.value}catch{return null}
}
function amountValue(value){const evaluated=evaluateExpression(value);return evaluated===null?parseValue(value):evaluated}
function format(value,code,compact=false){return new Intl.NumberFormat('ru-RU',{minimumFractionDigits:compact?0:2,maximumFractionDigits:compact?2:2}).format(Number.isFinite(value)?value:0)}
function formatInput(value){return format(value,'',false)}
function ageLabel(date){if(!date)return '—';const mins=Math.max(0,Math.floor((Date.now()-date.getTime())/60000));if(mins<1)return {ru:'только что',uk:'щойно',de:'gerade eben',en:'just now'}[state.lang]||'just now';if(mins<60)return `${mins} min`;if(mins<1440)return `${Math.floor(mins/60)} h`;return `${Math.floor(mins/1440)} d`}
function cacheKey(){return `rate_${state.from}_${state.to}`}
function getCached(){try{const value=JSON.parse(localStorage.getItem(cacheKey()));if(!value||!Number.isFinite(value.rate)||value.rate<=0)return null;const receivedAt=value.receivedAt?new Date(value.receivedAt):null;if(receivedAt&&!Number.isFinite(receivedAt.getTime()))return null;const legacyDate=value.updated?new Date(value.updated):null;const rateDate=value.rateDate||(!receivedAt&&legacyDate&&Number.isFinite(legacyDate.getTime())?legacyDate.toISOString().slice(0,10):null);return {rate:value.rate,rateDate,receivedAt}}catch{return null}}
function rateDateLabel(value){if(!value)return '';const date=new Date(`${value}T12:00:00`);const label=Number.isNaN(date.getTime())?value:new Intl.DateTimeFormat(state.lang,{dateStyle:'medium'}).format(date);return `${t('dataDate')} ${label}`}

function renderCurrencies(){
  ['from','to'].forEach(side=>{const code=state[side],item=meta(code);$(`${side}Code`).textContent=code;$(`${side}Name`).textContent=currencyName(code);$(`${side}Flag`).textContent=item.flag;$(`${side}Symbol`).textContent=item.symbol});
  document.querySelectorAll('.pair-chip').forEach(b=>b.classList.toggle('active',b.dataset.pair===`${state.from}_${state.to}`));
}
function calculate(source=state.activeInput,animate=true){
  if(state.rate===null){$(source==='from'?'toAmount':'fromAmount').value='—';$('rateText').textContent='—';renderTravel();return}
  if(!$(source==='from'?'fromAmount':'toAmount').value.trim()){$(source==='from'?'toAmount':'fromAmount').value='';$('rateText').textContent=`1 ${state.from} = ${format(state.rate,'',false)} ${state.to}`;renderTravel();updateResetButton();return}
  if(source==='from'){$('toAmount').value=formatInput(amountValue($('fromAmount').value)*state.rate)}
  else {$('fromAmount').value=formatInput(amountValue($('toAmount').value)/state.rate)}
  $('rateText').textContent=`1 ${state.from} = ${format(state.rate,'',false)} ${state.to}`;
  if(animate){const el=source==='from'?$('toAmount'):$('fromAmount');el.classList.remove('value-pop');void el.offsetWidth;el.classList.add('value-pop')}
  renderTravel();
  updateResetButton();
}
async function loadRate(showToast=false){
  const requestId=++rateRequestId;rateController?.abort();rateController=new AbortController();
  const {from,to}=state;const current=()=>requestId===rateRequestId&&state.from===from&&state.to===to;
  state.rate=null;state.rateSource='unavailable';state.rateDate=null;state.receivedAt=null;calculate(state.activeInput,false);
  $('refreshButton').classList.add('loading');$('networkStatus').textContent=t('updating');$('statusDot').className='';
  if(from===to){state.rate=1;state.rateSource='same';finishRate();return}
  try{
    const response=await fetch(`https://api.frankfurter.dev/v2/rate/${from}/${to}`,{cache:'no-store',signal:rateController.signal});
    if(!response.ok)throw new Error('Rate unavailable');const data=await response.json();if(!current())return;
    if(!Number.isFinite(data.rate)||data.rate<=0)throw new Error('Invalid rate');
    state.rate=data.rate;state.rateDate=/^\d{4}-\d{2}-\d{2}$/.test(data.date)?data.date:null;state.receivedAt=new Date();state.rateSource='live';
    localStorage.setItem(cacheKey(),JSON.stringify({rate:state.rate,rateDate:state.rateDate,receivedAt:state.receivedAt.toISOString()}));finishRate();if(showToast)toast(t('fresh'));
  }catch(error){
    if(!current())return;const cached=getCached();
    if(cached){state.rate=cached.rate;state.rateDate=cached.rateDate;state.receivedAt=cached.receivedAt;state.rateSource='saved'}
    finishRate();if(showToast)toast(cached?t('savedRate'):t('rateUnavailable'));
  }
}
function finishRate(){const source=state.rateSource;$('refreshButton').classList.remove('loading');$('statusDot').className=source==='live'||source==='same'?'online':'offline';$('networkStatus').textContent=source==='live'?t('fresh'):source==='saved'?t('savedRate'):source==='same'?t('sameCurrency'):t('rateUnavailable');$('updatedAt').textContent=source==='unavailable'?t('noRate'):source==='same'?'1:1':[rateDateLabel(state.rateDate),state.receivedAt?`${t('received')} ${ageLabel(state.receivedAt)}`:''].filter(Boolean).join(' · ');calculate(state.activeInput,false)}

function createFavorites(){
  $('favorites').innerHTML=QUICK_PAIRS.filter(([a,b])=>activeCurrencies.includes(a)&&activeCurrencies.includes(b)).map(([a,b])=>`<button class="pair-chip" data-pair="${a}_${b}">${meta(a).flag} ${a} <span>→</span> ${b}</button>`).join('');
  if(createFavorites.bound)return;createFavorites.bound=true;
  $('favorites').addEventListener('click',e=>{const button=e.target.closest('.pair-chip');if(!button)return;[state.from,state.to]=button.dataset.pair.split('_');state.activeInput='from';animateSwap();renderCurrencies();save();loadRate()});
}
function renderTravel(){
  const values=[1,5,10,20,50,100];$('quickValues').innerHTML=values.map(v=>`<button class="quick-button" data-value="${v}">${meta(state.from).symbol}${v}</button>`).join('');
  $('travelList').innerHTML=values.slice(1).map(v=>`<div class="travel-row"><span>${format(v,'',true)} ${state.from}</span><b>${state.rate===null?'—':format(v*state.rate,'',false)} ${state.to}</b></div>`).join('');
}
function installCurrencyPickerUX(){
  if(document.getElementById('currencyPickerUXStyles'))return;
  const style=document.createElement('style');style.id='currencyPickerUXStyles';style.textContent=`
    .recent-label{display:none!important}
    .currency-list{padding-bottom:4px}
    .currency-group+.currency-group{margin-top:12px}
    .currency-group-label{font-size:10px;letter-spacing:.14em;color:var(--muted);font-weight:800;margin:7px 3px 5px}
    .currency-option-row{display:grid;grid-template-columns:minmax(0,1fr) 46px;align-items:center;border-bottom:1px solid var(--line)}
    .currency-option-row .currency-option{border-bottom:0;min-width:0}
    .currency-option-row .currency-option small{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .currency-favorite{width:40px;height:40px;border:0;border-radius:13px;background:transparent;color:var(--muted);font-size:23px;display:grid;place-items:center}
    .currency-favorite.active{color:#fbbf24;background:rgba(251,191,36,.08)}
    .currency-option:focus-visible,.currency-favorite:focus-visible{outline:2px solid var(--accent);outline-offset:-2px}
    .search-box:focus-within{border-color:rgba(125,211,252,.55);box-shadow:0 0 0 3px rgba(125,211,252,.08)}
    .currency-empty{padding:9px 3px 18px}
    .currency-toolbar{display:flex;gap:8px;margin:0 0 8px}
    .currency-toolbar button{flex:1;border:1px solid var(--line);background:rgba(255,255,255,.065);color:var(--accent);border-radius:13px;padding:10px 12px;font-weight:700;font-size:13px}
    .currency-toolbar button:last-child:not(:first-child){flex:0 0 auto}
    .currency-remove{width:40px;height:40px;border:0;border-radius:13px;background:rgba(251,113,133,.1);color:#fb7185;font-size:17px;display:grid;place-items:center}
    .currency-remove.locked{opacity:.3}
    #resetButton{margin-left:auto;margin-right:6px;-webkit-user-select:none;user-select:none;-webkit-touch-callout:none;touch-action:manipulation}
  `;document.head.appendChild(style);
  const viewport=document.querySelector('meta[name="viewport"]');if(viewport)viewport.content='width=device-width, initial-scale=1, viewport-fit=cover';
  const version=document.querySelector('footer span:last-child');if(version)version.textContent='v2.8';
}
function openSheet(side){
  state.pickerSide=side;pickerMode='select';pickerEdit=false;currencySheetReturnFocus=document.activeElement instanceof HTMLElement?document.activeElement:null;$('currencySearch').value='';renderCurrencyList();$('currencySheet').classList.add('open');$('sheetBackdrop').classList.add('open');document.body.style.overflow='hidden';
  setTimeout(()=>$('closeSheet').focus({preventScroll:true}),60);
}
function closeSheet(){
  $('currencySheet').classList.remove('open');$('sheetBackdrop').classList.remove('open');document.body.style.overflow='';
  if(currencySheetReturnFocus?.isConnected)currencySheetReturnFocus.focus({preventScroll:true});currencySheetReturnFocus=null;
}
function currencyOptionMarkup(code){
  const v=meta(code);
  if(pickerMode==='catalog')return `<div class="currency-option-row"><button class="currency-option" data-add-code="${code}"><span class="flag">${v.flag}</span><span><b>${code}</b><small>${currencyName(code)}</small></span><span class="check">＋</span></button><span></span></div>`;
  const selected=state[state.pickerSide]===code;
  if(pickerEdit){const locked=state.from===code||state.to===code;return `<div class="currency-option-row"><div class="currency-option"><span class="flag">${v.flag}</span><span><b>${code}</b><small>${currencyName(code)}</small></span><span class="check">${selected?'✓':''}</span></div><button class="currency-remove${locked?' locked':''}" data-remove-code="${code}" aria-label="${t('removeHint')}: ${code}">✕</button></div>`}
  const favorite=favoriteCurrencies.includes(code),favoriteLabel=favorite?t('unfavoriteHint'):t('favoriteHint');
  return `<div class="currency-option-row"><button class="currency-option" data-code="${code}"><span class="flag">${v.flag}</span><span><b>${code}</b><small>${currencyName(code)}</small></span><span class="check">${selected?'✓':''}</span></button><button class="currency-favorite${favorite?' active':''}" data-favorite-code="${code}" aria-pressed="${favorite}" aria-label="${favoriteLabel}: ${code}">${favorite?'★':'☆'}</button></div>`;
}
function currencyGroupMarkup(label,codes){return codes.length?`<section class="currency-group"><div class="currency-group-label">${label}</div>${codes.map(currencyOptionMarkup).join('')}</section>`:''}
function matchesQuery(code,q){return code.toLowerCase().includes(q)||currencyName(code).toLocaleLowerCase(state.lang).includes(q)||meta(code).name.toLocaleLowerCase('ru').includes(q)}
function renderPickerHeader(){$('sheetTitle').textContent=pickerMode==='catalog'?t('addCurrencyTitle'):t('chooseCurrency');let bar=$('currencyToolbar');if(!bar){bar=document.createElement('div');bar.id='currencyToolbar';bar.className='currency-toolbar';$('currencyList').before(bar)}bar.innerHTML=pickerMode==='catalog'?`<button data-picker-action="back">${t('back')}</button>`:`<button data-picker-action="add">${t('addCurrency')}</button><button data-picker-action="edit">${pickerEdit?t('doneEdit'):t('editList')}</button>`}
function renderCurrencyList(query=''){
  renderPickerHeader();const q=query.trim().toLocaleLowerCase('ru');
  if(pickerMode==='catalog'){const pool=catalogCodes.filter(c=>!activeCurrencies.includes(c));const list=q?pool.filter(c=>matchesQuery(c,q)):pool;$('currencyList').innerHTML=list.length?currencyGroupMarkup(t('allCurrencies'),list):`<p class="offline-note currency-empty">${pool.length?t('currencyNotFound'):t('allAdded')}</p>`;return}
  const allCodes=activeCurrencies;
  if(q){const matches=allCodes.filter(c=>matchesQuery(c,q));$('currencyList').innerHTML=matches.length?currencyGroupMarkup(t('myCurrencies'),matches):`<p class="offline-note currency-empty">${t('currencyNotFound')}</p>`;return}
  if(pickerEdit){$('currencyList').innerHTML=currencyGroupMarkup(t('myCurrencies'),allCodes);return}
  const favorites=favoriteCurrencies.filter(c=>allCodes.includes(c)),recents=recentCurrencies.filter(c=>allCodes.includes(c)&&!favorites.includes(c)),remaining=allCodes.filter(c=>!favorites.includes(c)&&!recents.includes(c));
  $('currencyList').innerHTML=currencyGroupMarkup(t('favoriteCurrencies'),favorites)+currencyGroupMarkup(t('recentCurrencies'),recents)+currencyGroupMarkup(t('myCurrencies'),remaining);
}
function toggleFavoriteCurrency(code){if(!activeCurrencies.includes(code))return;favoriteCurrencies=favoriteCurrencies.includes(code)?favoriteCurrencies.filter(item=>item!==code):[...favoriteCurrencies,code];save();renderCurrencyList($('currencySearch').value)}
function addCurrency(code){if(!isCode(code)||activeCurrencies.includes(code))return;meta(code);activeCurrencies=[...activeCurrencies,code];save();createFavorites();toast(`${code} ${t('added')}`);pickerMode='select';$('currencySearch').value='';renderCurrencyList()}
function removeCurrency(code){if(state.from===code||state.to===code){toast(t('cannotRemoveActive'));return}if(activeCurrencies.length<=MIN_ACTIVE_CURRENCIES){toast(t('minCurrencies'));return}activeCurrencies=activeCurrencies.filter(c=>c!==code);favoriteCurrencies=favoriteCurrencies.filter(c=>c!==code);recentCurrencies=recentCurrencies.filter(c=>c!==code);save();createFavorites();toast(`${code} ${t('removed')}`);renderCurrencyList($('currencySearch').value)}
function handlePickerAction(action){if(action==='add'){pickerMode='catalog';pickerEdit=false;loadCatalog()}else if(action==='back')pickerMode='select';else if(action==='edit')pickerEdit=!pickerEdit;$('currencySearch').value='';renderCurrencyList();$('currencySearch').focus({preventScroll:true})}
function rememberCurrency(code){recentCurrencies=[code,...recentCurrencies.filter(item=>item!==code)].slice(0,MAX_RECENT_CURRENCIES)}
function selectCurrency(code){const other=state.pickerSide==='from'?'to':'from';if(state[other]===code)state[other]=state[state.pickerSide];state[state.pickerSide]=code;state.activeInput='from';rememberCurrency(code);renderCurrencies();save();closeSheet();animateSwap();loadRate()}
function animateSwap(){[$('fromBlock'),$('toBlock')].forEach(el=>{el.classList.remove('block-swap');void el.offsetWidth;el.classList.add('block-swap')})}
function swap(){const oldFrom=amountValue($('fromAmount').value);[state.from,state.to]=[state.to,state.from];state.activeInput='from';$('fromAmount').value=state.rate===null?formatInput(oldFrom):formatInput(amountValue($('toAmount').value));$('swapButton').classList.toggle('spinning');animateSwap();renderCurrencies();save();loadRate()}
function openCalculator(side){calculatorReturnFocus=document.activeElement instanceof HTMLElement?document.activeElement:null;calcSide=side;const raw=$(`${side}Amount`).value.replace(/[\s\u00a0]/g,'').replace(',','.');calcExpression=evaluateExpression(raw)===null?'0':raw;$('calcCurrency').textContent=state[side];renderCalculator();$('calculatorSheet').classList.add('open');$('calcBackdrop').classList.add('open');document.body.style.overflow='hidden';setTimeout(()=>$('closeCalculator').focus({preventScroll:true}),60)}
function closeCalculator(){$('calculatorSheet').classList.remove('open');$('calcBackdrop').classList.remove('open');if(!$('currencySheet').classList.contains('open'))document.body.style.overflow='';if(calculatorReturnFocus?.isConnected)calculatorReturnFocus.focus({preventScroll:true});calculatorReturnFocus=null}
function openDialogElement(){if($('calculatorSheet').classList.contains('open'))return $('calculatorSheet');if($('currencySheet').classList.contains('open'))return $('currencySheet');return null}
function trapDialogFocus(event){if(event.key!=='Tab')return false;const dialog=openDialogElement();if(!dialog)return false;const focusable=[...dialog.querySelectorAll('button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[href],[tabindex]:not([tabindex="-1"])')].filter(el=>el.getClientRects().length);if(!focusable.length)return false;const first=focusable[0],last=focusable[focusable.length-1];if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();return true}if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();return true}return false}
function calcDisplayExpression(value){return value.replace(/\*/g,' × ').replace(/\//g,' ÷ ').replace(/-/g,' − ').replace(/\+/g,' + ').replace(/\./g,',')}
function renderCalculator(){const result=evaluateExpression(calcExpression);$('calcExpression').textContent=calcDisplayExpression(calcExpression);$('calcResult').textContent=result===null?'—':new Intl.NumberFormat(state.lang,{maximumFractionDigits:6}).format(result);$('calcResult').parentElement.classList.toggle('invalid',result===null);$('calcCurrency').textContent=state[calcSide];$('calcHistory').innerHTML=calcHistory.length?calcHistory.map((item,i)=>`<button data-history="${i}">${calcDisplayExpression(item.expression)} = ${new Intl.NumberFormat(state.lang,{maximumFractionDigits:2}).format(item.result)}</button>`).join(''):`<span class="calc-empty">${t('emptyHistory')}</span>`}
function handleCalcKey(key){
  if(key==='clear')calcExpression='0';else if(key==='backspace')calcExpression=calcExpression.length>1?calcExpression.slice(0,-1):'0';else if(key==='apply'){applyCalculation();return}else if(/[0-9.]/.test(key)&&calcExpression==='0')calcExpression=key==='.'?'0.':key;else if(/[+\-*/]/.test(key)&&/[+\-*/.]$/.test(calcExpression))calcExpression=calcExpression.slice(0,-1)+key;else calcExpression+=key;renderCalculator();navigator.vibrate?.(8)
}
function applyCalculation(){const result=evaluateExpression(calcExpression);if(result===null)return;navigator.vibrate?.(14);calcHistory=[{expression:calcExpression,result},...calcHistory.filter(i=>i.expression!==calcExpression)].slice(0,5);localStorage.setItem('glassCurrencyCalcHistory',JSON.stringify(calcHistory));$(`${calcSide}Amount`).value=formatInput(result);state.activeInput=calcSide;calculate(calcSide);closeCalculator()}
function ensureResetButton(){if($('resetButton'))return;const b=document.createElement('button');b.id='resetButton';b.type='button';b.textContent='↺';$('refreshButton').before(b)}
function updateResetButton(){const b=$('resetButton');if(!b)return;const empty=!$('fromAmount').value.trim()&&!$('toAmount').value.trim();b.classList.toggle('hidden',empty);b.setAttribute('aria-label',t('resetAmounts'));b.title=t('resetAmounts')}
function resetAmounts(){$('fromAmount').value='';$('toAmount').value='';state.activeInput='from';calculate('from',false);updateResetButton();navigator.vibrate?.(12);$('fromAmount').focus({preventScroll:true})}
function resetAll(){$('fromAmount').value='';$('toAmount').value='';state.from='EUR';state.to='PLN';state.activeInput='from';calcHistory=[];localStorage.removeItem('glassCurrencyCalcHistory');if(!activeCurrencies.includes('EUR'))activeCurrencies.push('EUR');if(!activeCurrencies.includes('PLN'))activeCurrencies.push('PLN');renderCurrencies();save();animateSwap();loadRate();updateResetButton();navigator.vibrate?.([20,40,20]);toast(t('resetDone'))}
function bindReset(){const b=$('resetButton');let timer=null,long=false;const cancel=()=>{clearTimeout(timer);timer=null};
  b.addEventListener('pointerdown',()=>{long=false;cancel();timer=setTimeout(()=>{long=true;timer=null;resetAll()},650)});
  ['pointerup','pointerleave','pointercancel'].forEach(ev=>b.addEventListener(ev,cancel));
  b.addEventListener('contextmenu',e=>e.preventDefault());
  b.addEventListener('click',e=>{if(long){e.preventDefault();long=false;return}resetAmounts()})}
function toast(message){$('toast').textContent=message;$('toast').classList.add('show');clearTimeout(toast.timer);toast.timer=setTimeout(()=>$('toast').classList.remove('show'),2200)}
function bind(){
  document.querySelectorAll('.currency-button').forEach(b=>b.addEventListener('click',()=>openSheet(b.dataset.side)));$('closeSheet').onclick=closeSheet;$('sheetBackdrop').onclick=closeSheet;
  $('currencySearch').addEventListener('input',e=>renderCurrencyList(e.target.value));$('currencySheet').addEventListener('click',e=>{const action=e.target.closest('[data-picker-action]');if(action)handlePickerAction(action.dataset.pickerAction)});$('currencyList').addEventListener('click',e=>{const add=e.target.closest('[data-add-code]');if(add){addCurrency(add.dataset.addCode);return}const rm=e.target.closest('[data-remove-code]');if(rm){removeCurrency(rm.dataset.removeCode);return}const favorite=e.target.closest('.currency-favorite');if(favorite){toggleFavoriteCurrency(favorite.dataset.favoriteCode);return}const b=e.target.closest('.currency-option');if(b)selectCurrency(b.dataset.code)});
  ['from','to'].forEach(side=>{$(`${side}Amount`).addEventListener('focus',e=>{state.activeInput=side;e.target.select()});$(`${side}Amount`).addEventListener('input',()=>{state.activeInput=side;clearTimeout(inputTimer);inputTimer=setTimeout(()=>calculate(side),45)});$(`${side}Amount`).addEventListener('blur',e=>{const result=evaluateExpression(e.target.value);if(result!==null&&/[+\-*/%()]/.test(e.target.value)){e.target.value=formatInput(result);calculate(side)}})});
  document.querySelectorAll('.calc-trigger').forEach(button=>button.addEventListener('click',()=>openCalculator(button.dataset.side)));$('closeCalculator').onclick=closeCalculator;$('calcBackdrop').onclick=closeCalculator;$('calcKeypad').addEventListener('click',e=>{const button=e.target.closest('[data-key]');if(button)handleCalcKey(button.dataset.key)});$('clearHistory').onclick=()=>{calcHistory=[];localStorage.removeItem('glassCurrencyCalcHistory');renderCalculator()};$('calcHistory').addEventListener('click',e=>{const button=e.target.closest('[data-history]');if(!button)return;calcExpression=calcHistory[Number(button.dataset.history)].expression;renderCalculator()});
  $('swapButton').onclick=swap;$('refreshButton').onclick=()=>loadRate(true);
  $('travelToggle').addEventListener('change',e=>{const open=e.target.checked;$('travelContent').classList.toggle('open',open);$('travelContent').setAttribute('aria-hidden',String(!open));save();if(open)toast('Travel Mode включён')});
  $('quickValues').addEventListener('click',e=>{const b=e.target.closest('.quick-button');if(!b)return;$('fromAmount').value=b.dataset.value;state.activeInput='from';calculate('from');navigator.vibrate?.(12)});
  $('themeButton').onclick=()=>{document.body.classList.toggle('light');$('themeIcon').textContent=document.body.classList.contains('light')?'☀':'☾';document.querySelector('meta[name="theme-color"]').content=document.body.classList.contains('light')?'#e8eef9':'#111c39';save()};
  $('languageSelect').addEventListener('change',e=>{state.lang=e.target.value;applyLanguage();save()});
  document.addEventListener('keydown',e=>{if(trapDialogFocus(e))return;if(!$('calculatorSheet').classList.contains('open')){if(e.key==='Escape')closeSheet();return}if(e.key==='Escape'){closeCalculator();return}if(e.key==='Enter'||e.key==='='){e.preventDefault();applyCalculation();return}const map={Backspace:'backspace',Delete:'clear',',':'.'};const key=map[e.key]||e.key;if(/^[0-9.+\-*/%()]$/.test(key)){e.preventDefault();handleCalcKey(key)}});
  window.addEventListener('online',()=>loadRate());window.addEventListener('offline',()=>loadRate());
  window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();installPrompt=e;$('installButton').classList.remove('hidden')});$('installButton').onclick=async()=>{if(!installPrompt)return;installPrompt.prompt();await installPrompt.userChoice;installPrompt=null;$('installButton').classList.add('hidden')};
}
function init(){
  if(!isCode(state.from))state.from='EUR';if(!isCode(state.to))state.to='PLN';[state.from,state.to].forEach(c=>{if(!activeCurrencies.includes(c))activeCurrencies.push(c)});
  if(saved.theme==='light'){document.body.classList.add('light');$('themeIcon').textContent='☀'}
  const travel=params.get('travel')==='1'||saved.travel===true;$('travelToggle').checked=travel;$('travelContent').classList.toggle('open',travel);$('travelContent').setAttribute('aria-hidden',String(!travel));
  installCurrencyPickerUX();ensureResetButton();createFavorites();bind();bindReset();applyLanguage();renderCurrencies();renderTravel();loadRate();save();loadCatalog();
  if(params.get('calculator')==='1')setTimeout(()=>openCalculator('from'),250);
  if('serviceWorker' in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js'));
}
init();
