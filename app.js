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
const $ = id => document.getElementById(id);
const saved = JSON.parse(localStorage.getItem('glassCurrencyState') || '{}');
const params = new URLSearchParams(location.search);
const state = {from:params.get('from') || saved.from || 'EUR',to:params.get('to') || saved.to || 'PLN',rate:1,activeInput:'from',updated:null,pickerSide:'from'};
let installPrompt, inputTimer;

function save(){localStorage.setItem('glassCurrencyState',JSON.stringify({from:state.from,to:state.to,travel:$('travelToggle').checked,theme:document.body.classList.contains('light')?'light':'dark'}))}
function parseValue(value){return Number(String(value).replace(/\s/g,'').replace(',','.')) || 0}
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
  if(source==='from'){$('toAmount').value=formatInput(parseValue($('fromAmount').value)*state.rate)}
  else {$('fromAmount').value=formatInput(parseValue($('toAmount').value)/state.rate)}
  $('rateText').textContent=`1 ${state.from} = ${format(state.rate,'',false)} ${state.to}`;
  if(animate){const el=source==='from'?$('toAmount'):$('fromAmount');el.classList.remove('value-pop');void el.offsetWidth;el.classList.add('value-pop')}
  renderTravel();
}
async function loadRate(showToast=false){
  $('refreshButton').classList.add('loading');$('networkStatus').textContent='Обновляем курс…';$('statusDot').className='';
  if(state.from===state.to){state.rate=1;state.updated=new Date();finishRate(true);return}
  try{
    const response=await fetch(`https://api.frankfurter.app/latest?from=${state.from}&to=${state.to}`,{cache:'no-store'});
    if(!response.ok)throw new Error('Rate unavailable'); const data=await response.json(); state.rate=data.rates[state.to];state.updated=new Date();
    localStorage.setItem(cacheKey(),JSON.stringify({rate:state.rate,updated:state.updated.toISOString()}));finishRate(true);if(showToast)toast('Курс обновлён');
  }catch(error){
    const cached=getCached(); const fallback=FALLBACK[`${state.from}_${state.to}`] || (FALLBACK[`${state.to}_${state.from}`]?1/FALLBACK[`${state.to}_${state.from}`]:null);
    if(cached){state.rate=cached.rate;state.updated=new Date(cached.updated)}else if(fallback){state.rate=fallback;state.updated=null}else{state.rate=1;state.updated=null}
    finishRate(false);if(showToast)toast(cached?'Используется сохранённый курс':'Сеть недоступна');
  }
}
function finishRate(online){$('refreshButton').classList.remove('loading');$('statusDot').className=online?'online':'offline';$('networkStatus').textContent=online?'Курс актуален':'Офлайн · сохранённый курс';$('updatedAt').textContent=state.updated?`обновлено ${ageLabel(state.updated)}`:'резервный курс';calculate(state.activeInput,false)}

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
function swap(){const oldFrom=parseValue($('fromAmount').value);[state.from,state.to]=[state.to,state.from];state.rate=1/state.rate;state.activeInput='from';$('fromAmount').value=formatInput(parseValue($('toAmount').value));$('toAmount').value=formatInput(oldFrom);$('swapButton').classList.toggle('spinning');animateSwap();renderCurrencies();calculate('from');save();loadRate()}
function toast(message){$('toast').textContent=message;$('toast').classList.add('show');clearTimeout(toast.timer);toast.timer=setTimeout(()=>$('toast').classList.remove('show'),2200)}
function bind(){
  document.querySelectorAll('.currency-button').forEach(b=>b.addEventListener('click',()=>openSheet(b.dataset.side)));$('closeSheet').onclick=closeSheet;$('sheetBackdrop').onclick=closeSheet;
  $('currencySearch').addEventListener('input',e=>renderCurrencyList(e.target.value));$('currencyList').addEventListener('click',e=>{const b=e.target.closest('.currency-option');if(b)selectCurrency(b.dataset.code)});
  ['from','to'].forEach(side=>{$(`${side}Amount`).addEventListener('focus',e=>{state.activeInput=side;e.target.select()});$(`${side}Amount`).addEventListener('input',()=>{state.activeInput=side;clearTimeout(inputTimer);inputTimer=setTimeout(()=>calculate(side),45)})});
  $('swapButton').onclick=swap;$('refreshButton').onclick=()=>loadRate(true);
  $('travelToggle').addEventListener('change',e=>{const open=e.target.checked;$('travelContent').classList.toggle('open',open);$('travelContent').setAttribute('aria-hidden',String(!open));save();if(open)toast('Travel Mode включён')});
  $('quickValues').addEventListener('click',e=>{const b=e.target.closest('.quick-button');if(!b)return;$('fromAmount').value=b.dataset.value;state.activeInput='from';calculate('from');navigator.vibrate?.(12)});
  $('themeButton').onclick=()=>{document.body.classList.toggle('light');$('themeIcon').textContent=document.body.classList.contains('light')?'☀':'☾';document.querySelector('meta[name="theme-color"]').content=document.body.classList.contains('light')?'#e8eef9':'#111c39';save()};
  document.addEventListener('keydown',e=>{if(e.key==='Escape')closeSheet()});
  window.addEventListener('online',()=>loadRate());window.addEventListener('offline',()=>loadRate());
  window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();installPrompt=e;$('installButton').classList.remove('hidden')});$('installButton').onclick=async()=>{if(!installPrompt)return;installPrompt.prompt();await installPrompt.userChoice;installPrompt=null;$('installButton').classList.add('hidden')};
}
function init(){
  if(!CURRENCIES[state.from])state.from='EUR';if(!CURRENCIES[state.to])state.to='PLN';
  if(saved.theme==='light'){document.body.classList.add('light');$('themeIcon').textContent='☀'}
  const travel=params.get('travel')==='1'||saved.travel===true;$('travelToggle').checked=travel;$('travelContent').classList.toggle('open',travel);$('travelContent').setAttribute('aria-hidden',String(!travel));
  createFavorites();bind();renderCurrencies();renderTravel();loadRate();save();
  if('serviceWorker' in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js'));
}
init();
