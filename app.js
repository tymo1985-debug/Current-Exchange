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
const FALLBACK = {EUR_PLN:4.28,EUR_CZK:24.5,EUR_USD:1.08,EUR_GBP:.84,PLN_CZK:5.72,USD_PLN:3.96};
const FAVORITES = [['EUR','PLN'],['EUR','CZK'],['PLN','CZK'],['EUR','USD'],['USD','PLN']];
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
const $ = id => document.getElementById(id);
const saved = JSON.parse(localStorage.getItem('glassCurrencyState') || '{}');
const params = new URLSearchParams(location.search);
const state = {from:params.get('from') || saved.from || 'EUR',to:params.get('to') || saved.to || 'PLN',rate:1,cashRate:null,cashKind:null,activeInput:'from',updated:null,pickerSide:'from',lang:saved.lang||((navigator.language||'ru').slice(0,2))};
let installPrompt, inputTimer;
let calcSide='from',calcExpression='0',calcHistory=JSON.parse(localStorage.getItem('glassCurrencyCalcHistory')||'[]');

function save(){localStorage.setItem('glassCurrencyState',JSON.stringify({from:state.from,to:state.to,travel:$('travelToggle').checked,theme:document.body.classList.contains('light')?'light':'dark',lang:state.lang}))}
function t(key){return (I18N[state.lang]||I18N.ru)[key]||I18N.ru[key]||key}
function applyLanguage(){if(!I18N[state.lang])state.lang='en';document.documentElement.lang=state.lang;$('languageSelect').value=state.lang;document.querySelector('.topbar h1').textContent=t('title');document.querySelectorAll('[data-i18n]').forEach(el=>el.textContent=t(el.dataset.i18n));renderMarket()}
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
function ageLabel(date){if(!date)return 'нет сохранённых данных';const mins=Math.max(0,Math.round((Date.now()-date.getTime())/60000));if(mins<1)return 'только что';if(mins<60)return `${mins} мин назад`;const hours=Math.round(mins/60);return `${hours} ч назад`}
function cacheKey(){return `rate_${state.from}_${state.to}`}
function getCached(){try{return JSON.parse(localStorage.getItem(cacheKey()))}catch{return null}}

function renderCurrencies(){
  ['from','to'].forEach(side=>{const code=state[side],item=CURRENCIES[code];$(`${side}Code`).textContent=code;$(`${side}Name`).textContent=item.name;$(`${side}Flag`).textContent=item.flag;$(`${side}Symbol`).textContent=item.symbol});
  document.querySelectorAll('.pair-chip').forEach(b=>b.classList.toggle('active',b.dataset.pair===`${state.from}_${state.to}`));
}
function calculate(source=state.activeInput,animate=true){
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
function finishRate(online){$('refreshButton').classList.remove('loading');$('statusDot').className=online?'online':'offline';$('networkStatus').textContent=online?t('fresh'):t('offline');$('updatedAt').textContent=state.updated?`${t('updated')} ${ageLabel(state.updated)}`:'—';calculate(state.activeInput,false);loadCashBenchmark()}

async function loadCashBenchmark(){state.cashRate=null;state.cashKind=null;if($('marketCountry').value!=='PL'||(state.from!=='PLN'&&state.to!=='PLN')){renderMarket();return}const foreign=state.from==='PLN'?state.to:state.from;if(foreign==='PLN'){renderMarket();return}try{const response=await fetch(`https://api.nbp.pl/api/exchangerates/rates/c/${foreign}/?format=json`,{cache:'no-store'});if(!response.ok)throw new Error();const item=(await response.json()).rates[0];if(state.to==='PLN'){state.cashRate=item.bid;state.cashKind='buy'}else{state.cashRate=1/item.ask;state.cashKind='sell'}renderMarket()}catch{renderMarket()}}
function renderMarket(){if(!$('marketCountry'))return;const manual=$('marketCountry').value==='manual';$('manualMarket').classList.toggle('hidden',!manual);$('marketAvailable').classList.toggle('hidden',manual);if(manual){const rate=parseValue($('manualRate').value);state.cashRate=rate||null;renderDifference();return}$('onlineRateValue').textContent=`${format(state.rate)} ${state.to}`;if(!state.cashRate){$('cashRateValue').textContent='—';$('differenceText').textContent=t('unavailable');$('differenceText').className='';return}$('cashRateValue').textContent=`${format(state.cashRate)} ${state.to} · ${t(state.cashKind)}`;renderDifference()}
function renderDifference(){if(!state.cashRate){if($('marketCountry').value==='manual')$('differenceText').textContent='—';return}const amount=amountValue($('fromAmount').value);const cash=amount*state.cashRate,online=amount*state.rate,diff=cash-online,pct=online?diff/online*100:0;$('differenceText').textContent=`${t('difference')}: ${diff>=0?'+':''}${format(diff)} ${state.to} (${pct>=0?'+':''}${pct.toFixed(2)}%)`;$('differenceText').className=diff>=0?'positive':'negative'}

function createFavorites(){
  $('favorites').innerHTML=FAVORITES.map(([a,b])=>`<button class="pair-chip" data-pair="${a}_${b}">${CURRENCIES[a].flag} ${a} <span>→</span> ${b}</button>`).join('');
  $('favorites').addEventListener('click',e=>{const button=e.target.closest('.pair-chip');if(!button)return;[state.from,state.to]=button.dataset.pair.split('_');state.activeInput='from';animateSwap();renderCurrencies();save();loadRate()});
}
function renderTravel(){
  const values=[1,5,10,20,50,100];$('quickValues').innerHTML=values.map(v=>`<button class="quick-button" data-value="${v}">${CURRENCIES[state.from].symbol}${v}</button>`).join('');
  $('travelList').innerHTML=values.slice(1).map(v=>`<div class="travel-row"><span>${format(v,'',true)} ${state.from}</span><b>${format(v*state.rate,'',false)} ${state.to}</b></div>`).join('');
}
function openSheet(side){state.pickerSide=side;$('currencySearch').value='';renderCurrencyList();$('currencySheet').classList.add('open');$('sheetBackdrop').classList.add('open');document.body.style.overflow='hidden';setTimeout(()=>$('currencySearch').focus(),350)}
function closeSheet(){$('currencySheet').classList.remove('open');$('sheetBackdrop').classList.remove('open');document.body.style.overflow=''}
function renderCurrencyList(query=''){
  const q=query.trim().toLocaleLowerCase('ru');const entries=Object.entries(CURRENCIES).filter(([code,v])=>!q||code.toLowerCase().includes(q)||v.name.toLocaleLowerCase('ru').includes(q));
  $('currencyList').innerHTML=entries.map(([code,v])=>`<button class="currency-option" data-code="${code}"><span class="flag">${v.flag}</span><span><b>${code}</b><small>${v.name}</small></span><span class="check">${state[state.pickerSide]===code?'✓':''}</span></button>`).join('') || '<p class="offline-note">Валюта не найдена</p>';
}
function selectCurrency(code){const other=state.pickerSide==='from'?'to':'from';if(state[other]===code)state[other]=state[state.pickerSide];state[state.pickerSide]=code;state.activeInput='from';renderCurrencies();save();closeSheet();animateSwap();loadRate()}
function animateSwap(){[$('fromBlock'),$('toBlock')].forEach(el=>{el.classList.remove('block-swap');void el.offsetWidth;el.classList.add('block-swap')})}
function swap(){const oldFrom=amountValue($('fromAmount').value);[state.from,state.to]=[state.to,state.from];state.rate=1/state.rate;state.activeInput='from';$('fromAmount').value=formatInput(amountValue($('toAmount').value));$('toAmount').value=formatInput(oldFrom);$('swapButton').classList.toggle('spinning');animateSwap();renderCurrencies();calculate('from');save();loadRate()}
function openCalculator(side){calcSide=side;const raw=$(`${side}Amount`).value.replace(/[\s\u00a0]/g,'').replace(',','.');calcExpression=evaluateExpression(raw)===null?'0':raw;$('calcCurrency').textContent=state[side];renderCalculator();$('calculatorSheet').classList.add('open');$('calcBackdrop').classList.add('open');document.body.style.overflow='hidden'}
function closeCalculator(){$('calculatorSheet').classList.remove('open');$('calcBackdrop').classList.remove('open');if(!$('currencySheet').classList.contains('open'))document.body.style.overflow=''}
function openMarket(){$('marketSheet').classList.add('open');$('marketBackdrop').classList.add('open');document.body.style.overflow='hidden';loadCashBenchmark()}
function closeMarket(){$('marketSheet').classList.remove('open');$('marketBackdrop').classList.remove('open');document.body.style.overflow=''}
function calcDisplayExpression(value){return value.replace(/\*/g,' × ').replace(/\//g,' ÷ ').replace(/-/g,' − ').replace(/\+/g,' + ').replace(/\./g,',')}
function renderCalculator(){const result=evaluateExpression(calcExpression);$('calcExpression').textContent=calcDisplayExpression(calcExpression);$('calcResult').textContent=result===null?'—':new Intl.NumberFormat(state.lang,{maximumFractionDigits:6}).format(result);$('calcResult').parentElement.classList.toggle('invalid',result===null);$('calcCurrency').textContent=state[calcSide];$('calcHistory').innerHTML=calcHistory.length?calcHistory.map((item,i)=>`<button data-history="${i}">${calcDisplayExpression(item.expression)} = ${new Intl.NumberFormat(state.lang,{maximumFractionDigits:2}).format(item.result)}</button>`).join(''):`<span class="calc-empty">${t('emptyHistory')}</span>`}
function handleCalcKey(key){
  if(key==='clear')calcExpression='0';else if(key==='backspace')calcExpression=calcExpression.length>1?calcExpression.slice(0,-1):'0';else if(key==='apply'){applyCalculation();return}else if(/[0-9.]/.test(key)&&calcExpression==='0')calcExpression=key==='.'?'0.':key;else if(/[+\-*/]/.test(key)&&/[+\-*/.]$/.test(calcExpression))calcExpression=calcExpression.slice(0,-1)+key;else calcExpression+=key;renderCalculator();navigator.vibrate?.(8)
}
function applyCalculation(){const result=evaluateExpression(calcExpression);if(result===null)return;navigator.vibrate?.(14);calcHistory=[{expression:calcExpression,result},...calcHistory.filter(i=>i.expression!==calcExpression)].slice(0,5);localStorage.setItem('glassCurrencyCalcHistory',JSON.stringify(calcHistory));$(`${calcSide}Amount`).value=formatInput(result);state.activeInput=calcSide;calculate(calcSide);closeCalculator()}
function toast(message){$('toast').textContent=message;$('toast').classList.add('show');clearTimeout(toast.timer);toast.timer=setTimeout(()=>$('toast').classList.remove('show'),2200)}
function bind(){
  document.querySelectorAll('.currency-button').forEach(b=>b.addEventListener('click',()=>openSheet(b.dataset.side)));$('closeSheet').onclick=closeSheet;$('sheetBackdrop').onclick=closeSheet;
  $('currencySearch').addEventListener('input',e=>renderCurrencyList(e.target.value));$('currencyList').addEventListener('click',e=>{const b=e.target.closest('.currency-option');if(b)selectCurrency(b.dataset.code)});
  ['from','to'].forEach(side=>{$(`${side}Amount`).addEventListener('focus',e=>{state.activeInput=side;e.target.select()});$(`${side}Amount`).addEventListener('input',()=>{state.activeInput=side;clearTimeout(inputTimer);inputTimer=setTimeout(()=>calculate(side),45)});$(`${side}Amount`).addEventListener('blur',e=>{const result=evaluateExpression(e.target.value);if(result!==null&&/[+\-*/%()]/.test(e.target.value)){e.target.value=formatInput(result);calculate(side)}})});
  document.querySelectorAll('.calc-trigger').forEach(button=>button.addEventListener('click',()=>openCalculator(button.dataset.side)));$('closeCalculator').onclick=closeCalculator;$('calcBackdrop').onclick=closeCalculator;$('calcKeypad').addEventListener('click',e=>{const button=e.target.closest('[data-key]');if(button)handleCalcKey(button.dataset.key)});$('clearHistory').onclick=()=>{calcHistory=[];localStorage.removeItem('glassCurrencyCalcHistory');renderCalculator()};$('calcHistory').addEventListener('click',e=>{const button=e.target.closest('[data-history]');if(!button)return;calcExpression=calcHistory[Number(button.dataset.history)].expression;renderCalculator()});
  $('compareTrigger').onclick=openMarket;$('closeMarket').onclick=closeMarket;$('marketBackdrop').onclick=closeMarket;
  $('swapButton').onclick=swap;$('refreshButton').onclick=()=>loadRate(true);
  $('travelToggle').addEventListener('change',e=>{const open=e.target.checked;$('travelContent').classList.toggle('open',open);$('travelContent').setAttribute('aria-hidden',String(!open));save();if(open)toast('Travel Mode включён')});
  $('quickValues').addEventListener('click',e=>{const b=e.target.closest('.quick-button');if(!b)return;$('fromAmount').value=b.dataset.value;state.activeInput='from';calculate('from');navigator.vibrate?.(12)});
  $('themeButton').onclick=()=>{document.body.classList.toggle('light');$('themeIcon').textContent=document.body.classList.contains('light')?'☀':'☾';document.querySelector('meta[name="theme-color"]').content=document.body.classList.contains('light')?'#e8eef9':'#111c39';save()};
  $('languageSelect').addEventListener('change',e=>{state.lang=e.target.value;applyLanguage();save()});
  $('marketCountry').addEventListener('change',()=>{state.cashRate=null;renderMarket();loadCashBenchmark()});$('manualRate').addEventListener('input',renderMarket);
  document.addEventListener('keydown',e=>{if(!$('calculatorSheet').classList.contains('open')){if(e.key==='Escape'){$('marketSheet').classList.contains('open')?closeMarket():closeSheet()}return}if(e.key==='Escape'){closeCalculator();return}if(e.key==='Enter'||e.key==='='){e.preventDefault();applyCalculation();return}const map={Backspace:'backspace',Delete:'clear',',':'.'};const key=map[e.key]||e.key;if(/^[0-9.+\-*/%()]$/.test(key)){e.preventDefault();handleCalcKey(key)}});
  window.addEventListener('online',()=>loadRate());window.addEventListener('offline',()=>loadRate());
  window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();installPrompt=e;$('installButton').classList.remove('hidden')});$('installButton').onclick=async()=>{if(!installPrompt)return;installPrompt.prompt();await installPrompt.userChoice;installPrompt=null;$('installButton').classList.add('hidden')};
}
function init(){
  if(!CURRENCIES[state.from])state.from='EUR';if(!CURRENCIES[state.to])state.to='PLN';
  if(saved.theme==='light'){document.body.classList.add('light');$('themeIcon').textContent='☀'}
  const travel=params.get('travel')==='1'||saved.travel===true;$('travelToggle').checked=travel;$('travelContent').classList.toggle('open',travel);$('travelContent').setAttribute('aria-hidden',String(!travel));
  createFavorites();bind();applyLanguage();renderCurrencies();renderTravel();loadRate();save();
  if(params.get('calculator')==='1')setTimeout(()=>openCalculator('from'),250);if(params.get('compare')==='1')setTimeout(openMarket,250);
  if('serviceWorker' in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js'));
}
init();
