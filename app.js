
const API = "https://api.frankfurter.dev/v2";
const CACHE_KEY = "glassCurrency.rateCache.v1";
const PREF_KEY = "glassCurrency.prefs.v1";
const FAVORITE_KEY = "glassCurrency.favorites.v1";

const CURRENCIES = {
  EUR:{name:"Евро", flag:"🇪🇺", country:"Европа"},
  PLN:{name:"Польский злотый", flag:"🇵🇱", country:"Польша"},
  CZK:{name:"Чешская крона", flag:"🇨🇿", country:"Чехия"},
  USD:{name:"Доллар США", flag:"🇺🇸", country:"США"},
  GBP:{name:"Фунт стерлингов", flag:"🇬🇧", country:"Великобритания"},
  CHF:{name:"Швейцарский франк", flag:"🇨🇭", country:"Швейцария"},
  SEK:{name:"Шведская крона", flag:"🇸🇪", country:"Швеция"},
  NOK:{name:"Норвежская крона", flag:"🇳🇴", country:"Норвегия"},
  DKK:{name:"Датская крона", flag:"🇩🇰", country:"Дания"},
  UAH:{name:"Украинская гривна", flag:"🇺🇦", country:"Украина"},
  HUF:{name:"Венгерский форинт", flag:"🇭🇺", country:"Венгрия"},
  RON:{name:"Румынский лей", flag:"🇷🇴", country:"Румыния"},
  BGN:{name:"Болгарский лев", flag:"🇧🇬", country:"Болгария"},
  CAD:{name:"Канадский доллар", flag:"🇨🇦", country:"Канада"},
  AUD:{name:"Австралийский доллар", flag:"🇦🇺", country:"Австралия"},
  JPY:{name:"Японская иена", flag:"🇯🇵", country:"Япония"},
  CNY:{name:"Китайский юань", flag:"🇨🇳", country:"Китай"},
  TRY:{name:"Турецкая лира", flag:"🇹🇷", country:"Турция"}
};

const $ = id => document.getElementById(id);
const prefs = Object.assign({from:"EUR", to:"CZK", travel:false, theme:"dark"}, JSON.parse(localStorage.getItem(PREF_KEY) || "{}"));
let state = { ...prefs, rate:null, rateDate:null, source:"", editing:"from", selectTarget:"from" };

function savePrefs() {
  localStorage.setItem(PREF_KEY, JSON.stringify({from:state.from, to:state.to, travel:state.travel, theme:state.theme}));
}
function parseAmount(v) {
  const clean = String(v).replace(/\s/g,"").replace(",",".").replace(/[^\d.-]/g,"");
  const n = Number(clean);
  return Number.isFinite(n) ? n : 0;
}
function pretty(n, code) {
  if (!Number.isFinite(n)) return "";
  const abs = Math.abs(n);
  const max = abs >= 1000 ? 2 : abs >= 1 ? 2 : 4;
  return new Intl.NumberFormat("ru-RU",{maximumFractionDigits:max}).format(n);
}
function updateCurrencyUI() {
  for (const side of ["from","to"]) {
    const c = CURRENCIES[state[side]] || {name:state[side],flag:"💱"};
    $(`${side}Code`).textContent = state[side];
    $(`${side}Name`).textContent = c.name;
    $(`${side}Flag`).textContent = c.flag;
  }
}
function cacheId(a,b){ return `${a}/${b}`; }
function getRateCache(a,b) {
  const all = JSON.parse(localStorage.getItem(CACHE_KEY) || "{}");
  return all[cacheId(a,b)] || null;
}
function setRateCache(a,b,data) {
  const all = JSON.parse(localStorage.getItem(CACHE_KEY) || "{}");
  all[cacheId(a,b)] = data;
  localStorage.setItem(CACHE_KEY, JSON.stringify(all));
}
function ageText(ts) {
  const min = Math.floor((Date.now()-ts)/60000);
  if (min < 1) return "только что";
  if (min < 60) return `${min} мин назад`;
  const h = Math.floor(min/60);
  if (h < 24) return `${h} ч назад`;
  return `${Math.floor(h/24)} дн назад`;
}
function setStatus(mode, text) {
  $("statusText").textContent = text;
  $("statusDot").classList.toggle("ok", mode==="ok");
}
async function fetchRate(force=false) {
  updateCurrencyUI();
  if (state.from === state.to) {
    state.rate = 1; state.rateDate = new Date().toISOString().slice(0,10); state.source = "локально";
    renderRate(); recalc(); return;
  }
  const cached = getRateCache(state.from,state.to);
  if (!navigator.onLine && cached) {
    state.rate = cached.rate; state.rateDate = cached.date; state.source = "офлайн";
    setStatus("ok", `Офлайн · сохранено ${ageText(cached.savedAt)}`);
    renderRate(); recalc(); return;
  }
  setStatus("loading","Обновляем курс…");
  try {
    const res = await fetch(`${API}/rate/${state.from}/${state.to}`, {cache: force ? "reload" : "default"});
    if (!res.ok) throw new Error("rate");
    const data = await res.json();
    state.rate = Number(data.rate);
    state.rateDate = data.date || new Date().toISOString().slice(0,10);
    state.source = "Frankfurter";
    const entry = {rate:state.rate,date:state.rateDate,savedAt:Date.now()};
    setRateCache(state.from,state.to,entry);
    if (state.rate) setRateCache(state.to,state.from,{rate:1/state.rate,date:state.rateDate,savedAt:Date.now()});
    setStatus("ok", navigator.onLine ? "Курс актуален" : "Офлайн");
  } catch (e) {
    if (cached) {
      state.rate = cached.rate; state.rateDate = cached.date; state.source = "кеш";
      setStatus("ok", `Нет связи · сохранено ${ageText(cached.savedAt)}`);
    } else {
      state.rate = null;
      setStatus("error","Не удалось получить курс");
    }
  }
  renderRate(); recalc();
}
function renderRate() {
  $("rateText").textContent = state.rate ? `1 ${state.from} = ${pretty(state.rate,state.to)} ${state.to}` : "—";
  $("rateMeta").textContent = state.rate ? `${state.source} · ${state.rateDate || ""}` : "Нет данных";
  renderTravel();
}
function recalc() {
  if (!state.rate) return;
  if (state.editing === "from") {
    $("toAmount").value = pretty(parseAmount($("fromAmount").value) * state.rate, state.to);
  } else {
    $("fromAmount").value = pretty(parseAmount($("toAmount").value) / state.rate, state.from);
  }
  renderTravel();
}
async function swap() {
  [state.from,state.to] = [state.to,state.from];
  const a = $("fromAmount").value, b = $("toAmount").value;
  $("fromAmount").value = b; $("toAmount").value = a;
  state.editing = "from";
  savePrefs(); await fetchRate();
}
function renderTravel() {
  $("travelPanel").classList.toggle("hidden", !state.travel);
  $("travelBtn").setAttribute("aria-pressed", String(state.travel));
  if (!state.travel || !state.rate) return;
  const amounts = [1,5,10,20,50,100];
  $("quickGrid").innerHTML = amounts.map(x=>`<button data-quick="${x}">${x} ${state.from}</button>`).join("");
  $("travelTable").innerHTML = amounts.map(x=>`
    <div class="travel-row"><span>${pretty(x,state.from)} ${state.from}</span><span>${pretty(x*state.rate,state.to)} ${state.to}</span></div>
  `).join("");
  document.querySelectorAll("[data-quick]").forEach(btn=>btn.onclick=()=>{
    $("fromAmount").value = btn.dataset.quick; state.editing="from"; recalc(); window.scrollTo({top:0,behavior:"smooth"});
  });
}
function favorites() {
  return JSON.parse(localStorage.getItem(FAVORITE_KEY) || '["EUR/PLN","EUR/CZK","PLN/CZK"]');
}
function renderFavorites() {
  const list = favorites();
  $("favoriteList").innerHTML = list.map(pair=>`<button class="favorite-chip" data-pair="${pair}">${pair.replace("/"," → ")}</button>`).join("");
  document.querySelectorAll("[data-pair]").forEach(btn=>btn.onclick=async()=>{
    [state.from,state.to]=btn.dataset.pair.split("/"); state.editing="from"; savePrefs(); await fetchRate();
  });
}
function addFavorite() {
  const list=favorites(), pair=`${state.from}/${state.to}`;
  if (!list.includes(pair)) list.unshift(pair);
  localStorage.setItem(FAVORITE_KEY, JSON.stringify(list.slice(0,8))); renderFavorites();
}
function openCurrencyDialog(target) {
  state.selectTarget=target; $("currencySearch").value=""; renderCurrencyList(); $("currencyDialog").showModal(); setTimeout(()=>$("currencySearch").focus(),50);
}
function renderCurrencyList() {
  const q=$("currencySearch").value.trim().toLowerCase();
  const rows=Object.entries(CURRENCIES).filter(([code,c])=>`${code} ${c.name} ${c.country}`.toLowerCase().includes(q));
  $("currencyList").innerHTML=rows.map(([code,c])=>`
    <button class="currency-item" data-code="${code}">
      <span>${c.flag}</span><span><strong>${code}</strong><br><small>${c.name}</small></span><small>${c.country}</small>
    </button>`).join("");
  document.querySelectorAll("[data-code]").forEach(btn=>btn.onclick=async()=>{
    state[state.selectTarget]=btn.dataset.code;
    if(state.from===state.to) {
      const fallback = state.selectTarget==="from" ? "USD" : "EUR";
      state[state.selectTarget==="from"?"to":"from"]=fallback===state[state.selectTarget] ? "CZK" : fallback;
    }
    $("currencyDialog").close(); state.editing="from"; savePrefs(); await fetchRate();
  });
}
function applyTheme() {
  document.documentElement.classList.toggle("light", state.theme==="light");
}
function bind() {
  $("fromAmount").addEventListener("input",()=>{state.editing="from";recalc();});
  $("toAmount").addEventListener("input",()=>{state.editing="to";recalc();});
  $("swapBtn").onclick=swap;
  $("refreshBtn").onclick=()=>fetchRate(true);
  $("travelBtn").onclick=()=>{state.travel=!state.travel;savePrefs();renderTravel();};
  $("themeBtn").onclick=()=>{state.theme=state.theme==="dark"?"light":"dark";savePrefs();applyTheme();};
  $("fromCurrencyBtn").onclick=()=>openCurrencyDialog("from");
  $("toCurrencyBtn").onclick=()=>openCurrencyDialog("to");
  $("closeDialog").onclick=()=>$("currencyDialog").close();
  $("currencySearch").addEventListener("input",renderCurrencyList);
  $("addFavoriteBtn").onclick=addFavorite;
  window.addEventListener("online",()=>fetchRate(true));
  window.addEventListener("offline",()=>fetchRate());
}
async function init() {
  applyTheme(); updateCurrencyUI(); bind(); renderFavorites(); renderTravel();
  if ("serviceWorker" in navigator) navigator.serviceWorker.register("./sw.js");
  await fetchRate();
}
init();
