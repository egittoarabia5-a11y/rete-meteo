/* =====================================================================
   PLAYBACK (macchina del tempo) per Weather 3D Map
   Da includere DOPO lo script principale:  <script src="playback.js"></script>
   - Il pulsante Archivio (in basso a dx) apre un menu: "Archivio" / "Playback"
   - Playback: barra sopra il pulsante Regione, giornaliera, dati da
     https://archivio-eventi.eggittof.workers.dev/export?src=...
   ===================================================================== */
(function () {
  "use strict";

  const EXPORT_BASE =
    "https://archivio-eventi.eggittof.workers.dev/export?src=";

  // ---------- Configurazione ----------
  // sigla export -> "source" usato in allStations
  const SRC_TO_SOURCE = {
    omirl: "OMIRL",
    ignorete: "IGNORETE",
    limet1: "LIMET",
    limet2: "LIMET",
    gepo: "ACRONET",
    comuneGenova: "Comune di Genova",
    dma: "DMA",
    portofino: "Parco di Portofino",
    soluzionimeteo: "WeatherLink",
    "3r": "3R"
  };

  const SOURCE_TO_SRCS = {};
  Object.entries(SRC_TO_SOURCE).forEach(([src, source]) => {
    (SOURCE_TO_SRCS[source] = SOURCE_TO_SRCS[source] || []).push(src);
  });

  // fonti da scaricare per regione
  const REGION_SRCS = {
    liguria: ["omirl", "ignorete", "limet1", "limet2", "gepo", "comuneGenova", "dma", "portofino"],
    piemonte: ["dma", "ignorete", "3r", "soluzionimeteo"],
    lombardia: [],
    trentino: []
  };

  // tipo di meteo: suffisso export, variabile colore, unità
  const TYPES = {
    temp: { label: "Temperatura", suffix: "_T", colorVar: "temp", unit: "°" },
    hum:  { label: "Umidità",     suffix: "_H", colorVar: "hum",  unit: "%" },
    rain: { label: "Pioggia",     suffix: "",   colorVar: "rainDaily", unit: " mm" }
  };

  const STEP_PLAY_MIN = 5;      // minuti di dati avanzati a ogni tick del play
  const PLAY_TICK_MS = 350;
  const MAX_GAP_MS = 20 * 60000; // oltre 20 min dall'ultima riga = nessun dato
  const MONTHS = ["Gennaio","Febbraio","Marzo","Aprile","Maggio","Giugno",
                  "Luglio","Agosto","Settembre","Ottobre","Novembre","Dicembre"];

  // ---------- Stato ----------
  const pb = {
    active: false,
    type: "temp",
    t: Date.now(),
    playing: false,
    timer: null,
    data: {},        // src -> dati parsati
    expected: 0,     // quante fonti si aspettano
    loaded: 0,
    failed: 0,
    loading: false,
    token: 0
  };
  const cache = {};  // chiave export -> { t, parsed }

  // ---------- Utilità tempo (fuso Europe/Rome) ----------
  const romeFmt = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Rome",
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", hourCycle: "h23"
  });

  function romeParts(ms) {
    const o = {};
    romeFmt.formatToParts(new Date(ms)).forEach(p => { o[p.type] = p.value; });
    return { y: +o.year, m: +o.month, d: +o.day, hh: (+o.hour) % 24, mi: +o.minute };
  }

  function romeToMs(y, m, d, hh, mi) {
    const target = Date.UTC(y, m - 1, d, hh, mi);
    let guess = target;
    for (let i = 0; i < 3; i++) {
      const p = romeParts(guess);
      const diff = Date.UTC(p.y, p.m - 1, p.d, p.hh, p.mi) - guess;
      guess = target - diff;
    }
    return guess;
  }

  const pad2 = n => String(n).padStart(2, "0");

  function fmtTime(ms) {
    const p = romeParts(ms);
    return pad2(p.hh) + ":" + pad2(p.mi);
  }
  function fmtDateTime(ms) {
    const p = romeParts(ms);
    return pad2(p.d) + "/" + pad2(p.m) + "/" + p.y + " " + pad2(p.hh) + ":" + pad2(p.mi);
  }

  // ---------- CSS + HTML ----------
  const css = document.createElement("style");
  css.textContent = `
    #playbackBar{
      position:absolute; bottom:72px; left:50%; transform:translateX(-50%);
      z-index:1000; display:none; flex-direction:column; gap:6px;
      background:#fff; border-radius:12px; box-shadow:0 2px 10px rgba(0,0,0,.3);
      padding:8px 10px; font-family:"Inter",sans-serif; font-size:13px;
      max-width:96vw; box-sizing:border-box;
    }
    #playbackBar .pbRow{
      display:flex; flex-wrap:wrap; align-items:center; justify-content:center; gap:4px;
    }
    #playbackBar select{
      font-family:"Inter",sans-serif; font-size:13px; padding:6px 6px;
      border:1px solid #cfcfcf; border-radius:8px; background:#f5f5f5; cursor:pointer;
    }
    #playbackBar button{
      border:none; border-radius:8px; background:#eee; padding:7px 9px;
      cursor:pointer; font-family:"Inter",sans-serif; font-weight:600; font-size:12px;
      white-space:nowrap;
    }
    #playbackBar button:hover{ background:#e0e0e0; }
    #playbackBar #pbPlay{ background:#4da9ff; color:#fff; min-width:64px; }
    #playbackBar #pbPlay:hover{ background:#3394ee; }
    #playbackBar #pbClose{ padding:5px 9px; }
    #playbackBar .pbSep{ width:2px; height:24px; background:#bbb; border-radius:1px; margin:0 4px; }
    #playbackBar #pbTime{ font-weight:800; font-size:18px; min-width:56px; text-align:center; }
    #playbackBar #pbStatus{ font-size:11px; opacity:.65; }
    @media (max-width:767px){
      #playbackBar{ bottom:68px; padding:6px 8px; }
      #playbackBar button{ padding:6px 7px; }
    }
  `;
  document.head.appendChild(css);

  const bar = document.createElement("div");
  bar.id = "playbackBar";
  bar.innerHTML = `
    <div class="pbRow">
      <select id="pbType">
        <option value="temp">Temperatura</option>
        <option value="hum">Umidità</option>
        <option value="rain">Pioggia</option>
      </select>
      <span id="pbTime">--:--</span>
      <span id="pbStatus"></span>
      <button type="button" id="pbClose" title="Chiudi playback">✕</button>
    </div>
    <div class="pbRow">
      <select id="pbDay"></select>
      <select id="pbMonth"></select>
      <select id="pbYear"></select>
      <button type="button" id="pbPlay">▶ Play</button>
      <button type="button" data-step="-5">-5 min</button>
      <button type="button" data-step="-15">-15 min</button>
      <button type="button" data-step="-30">-30 min</button>
      <button type="button" data-step="-60">-1 h</button>
      <span class="pbSep"></span>
      <button type="button" data-step="5">+5 min</button>
      <button type="button" data-step="15">+15 min</button>
      <button type="button" data-step="30">+30 min</button>
      <button type="button" data-step="60">+1 h</button>
    </div>
  `;
  document.body.appendChild(bar);

  const selType = bar.querySelector("#pbType");
  const selD = bar.querySelector("#pbDay");
  const selM = bar.querySelector("#pbMonth");
  const selY = bar.querySelector("#pbYear");
  const btnPlay = bar.querySelector("#pbPlay");
  const lblTime = bar.querySelector("#pbTime");
  const lblStatus = bar.querySelector("#pbStatus");

  MONTHS.forEach((m, i) => {
    const o = document.createElement("option");
    o.value = String(i + 1);
    o.textContent = m;
    selM.appendChild(o);
  });
  const nowYear = romeParts(Date.now()).y;
  for (let y = nowYear; y >= Math.min(2026, nowYear); y--) {
    const o = document.createElement("option");
    o.value = String(y);
    o.textContent = String(y);
    selY.appendChild(o);
  }

  function fillDays(keep) {
    const days = new Date(Number(selY.value), Number(selM.value), 0).getDate();
    const k = Math.min(keep || Number(selD.value) || 1, days);
    selD.innerHTML = "";
    for (let d = 1; d <= days; d++) {
      const o = document.createElement("option");
      o.value = String(d);
      o.textContent = String(d);
      selD.appendChild(o);
    }
    selD.value = String(k);
  }

  // ---------- Limiti del giorno scelto ----------
  function bounds() {
    const y = +selY.value, m = +selM.value, d = +selD.value;
    const start = romeToMs(y, m, d, 0, 0);
    const nx = new Date(Date.UTC(y, m - 1, d + 1));
    const end = romeToMs(nx.getUTCFullYear(), nx.getUTCMonth() + 1, nx.getUTCDate(), 0, 0) - 60000;
    return { start, end, max: Math.max(start, Math.min(end, Date.now())) };
  }

  // ---------- Parsing dati export ----------
  const nk = s => String(s == null ? "" : s)
    .trim().toLowerCase().replace(/[’`]/g, "'").replace(/\s*-\s*limet$/, "");

  function parsePayload(j) {
    const stations = Array.isArray(j.stations) ? j.stations : [];
    const rows = Array.isArray(j.rows) ? j.rows : [];

    const pairs = [];
    for (const r of rows) {
      if (!r) continue;
      const t = Date.parse(r[0]);
      if (!isFinite(t)) continue;
      pairs.push([t, r[1]]);
    }
    pairs.sort((a, b) => a[0] - b[0]);

    const idx = new Map();
    const idxN = new Map();
    stations.forEach((name, i) => {
      if (!idx.has(name)) idx.set(name, i);
      const k = nk(name);
      if (!idxN.has(k)) idxN.set(k, i);
    });

    return {
      times: Float64Array.from(pairs.map(p => p[0])),
      vals: pairs.map(p => p[1]),
      idx, idxN,
      cur: null
    };
  }

  function lastIdx(times, t) {
    let lo = 0, hi = times.length - 1, r = -1;
    while (lo <= hi) {
      const mid = (lo + hi) >> 1;
      if (times[mid] <= t) { r = mid; lo = mid + 1; } else { hi = mid - 1; }
    }
    return r;
  }

  function parseVal(s) {
    if (s === undefined || s === null) return null;
    let x = String(s).trim();
    if (x === "" || x.toUpperCase() === "ND") return null;
    if (x.endsWith("*")) x = x.slice(0, -1);
    const n = parseFloat(x);
    return Number.isFinite(n) ? n : null;
  }

  // ---------- Caricamento ----------
  async function fetchSrc(src) {
    const key = src + TYPES[pb.type].suffix;
    const c = cache[key];
    if (c && Date.now() - c.t < 120000) return c.parsed;

    const res = await fetch(EXPORT_BASE + encodeURIComponent(key));
    if (!res.ok) throw new Error("export " + key + " HTTP " + res.status);
    const parsed = parsePayload(await res.json());
    cache[key] = { t: Date.now(), parsed };
    return parsed;
  }

  function loadData() {
    const token = ++pb.token;
    let srcs = (REGION_SRCS[currentRegion] || []).slice();
    if (pb.type === "rain") srcs = srcs.filter(s => s !== "3r"); // 3r non ha la pioggia

    pb.data = {};
    pb.expected = srcs.length;
    pb.loaded = 0;
    pb.failed = 0;
    pb.loading = srcs.length > 0;
    renderStatus();
    updateLayer();

    srcs.forEach(src => {
      fetchSrc(src)
        .then(parsed => {
          if (token !== pb.token) return;
          pb.data[src] = parsed;
          pb.loaded++;
        })
        .catch(err => {
          if (token !== pb.token) return;
          console.error("Playback:", err);
          pb.failed++;
        })
        .finally(() => {
          if (token !== pb.token) return;
          if (pb.loaded + pb.failed >= pb.expected) pb.loading = false;
          applyTime();
        });
    });
  }

  // ---------- Applicazione dell'orario ----------
  function computeCur() {
    Object.values(pb.data).forEach(d => {
      const i = lastIdx(d.times, pb.t);
      if (i < 0 || pb.t - d.times[i] > MAX_GAP_MS) { d.cur = null; return; }
      d.cur = String(d.vals[i] == null ? "" : d.vals[i]).split(",");
    });
  }

  function renderStatus() {
    lblTime.textContent = fmtTime(pb.t);
    if (pb.expected === 0) {
      lblStatus.textContent = "Nessuna fonte per questa regione";
      return;
    }
    if (pb.loading) {
      lblStatus.textContent = "Caricamento… " + (pb.loaded + pb.failed) + "/" + pb.expected;
      return;
    }
    const any = Object.values(pb.data).some(d => d.cur);
    if (pb.loaded === 0) {
      lblStatus.textContent = "Archivio non raggiungibile";
    } else if (!any) {
      lblStatus.textContent = "Nessun dato a quest'ora";
    } else {
      lblStatus.textContent = "Fonti " + pb.loaded + "/" + pb.expected;
    }
  }

  function applyTime() {
    if (!pb.active) return;
    computeCur();
    renderStatus();
    updateLayer();
  }

  function setTime(t) {
    const b = bounds();
    pb.t = Math.min(Math.max(t, b.start), b.max);
    applyTime();
  }

  function onDateChange() {
    const b = bounds();
    const now = Date.now();
    const isToday = now >= b.start && now <= b.end;
    if (pb.playing) stopPlay();
    setTime(isToday ? now : b.start);
  }

  // ---------- Play ----------
  function stopPlay() {
    pb.playing = false;
    if (pb.timer) clearInterval(pb.timer);
    pb.timer = null;
    btnPlay.textContent = "▶ Play";
  }

  function startPlay() {
    if (pb.playing) return;
    const b = bounds();
    // se siamo già a fine giornata riparti da mezzanotte
    if (pb.t >= b.max) pb.t = b.start;
    pb.playing = true;
    btnPlay.textContent = "⏸ Pausa";
    pb.timer = setInterval(() => {
      const bb = bounds();
      if (pb.t >= bb.max) { stopPlay(); return; }
      setTime(pb.t + STEP_PLAY_MIN * 60000);
    }, PLAY_TICK_MS);
  }

  // ---------- Valore di una stazione (usato dal marker) ----------
  function getPlaybackValue(st) {
    const srcs = SOURCE_TO_SRCS[st.source];
    if (!srcs) return null;

    for (const s of srcs) {
      const d = pb.data[s];
      if (!d || !d.cur) continue;

      let i = d.idx.get(st.id);
      if (i === undefined) i = d.idxN.get(nk(st.id));
      if (i === undefined && st.N) i = d.idxN.get(nk(st.N));
      if (i === undefined) continue;

      const v = parseVal(d.cur[i]);
      if (v !== null) return v;
    }
    return null;
  }

  // ---------- Aggancio a getValueAndColor ----------
  const origGetValueAndColor = window.getValueAndColor;

  window.getValueAndColor = function (st) {
    if (currentVariable !== "playback") return origGetValueAndColor(st);

    const T = TYPES[pb.type];
    const value = getPlaybackValue(st);
    return {
      value,
      color: getColor(T.colorVar, value),
      valueStr: value !== null ? value.toFixed(1) : ""
    };
  };

  // ---------- Popup dedicato ----------
  const origShowPopup = window.showPopup;

  window.showPopup = function (feature) {
    if (currentVariable !== "playback") return origShowPopup(feature);
    if (!feature || !feature.properties) return;

    const p = feature.properties;
    const T = TYPES[pb.type];

    if (activePopup) activePopup.remove();

    const color = getColor(T.colorVar, Number(p.value));
    const h = color.replace("#", "");
    const overlay = "rgba(" + parseInt(h.substring(0, 2), 16) + "," +
      parseInt(h.substring(2, 4), 16) + "," + parseInt(h.substring(4, 6), 16) + ",0.3)";

    const gaugesUrl = "gauges.html?station=" + encodeURIComponent(p.id) +
      "&source=" + encodeURIComponent(p.source) +
      "&name=" + encodeURIComponent(p.name);

    const html = `
      <div style="font-family:Inter,sans-serif;text-align:center;color:black;">
        <div style="font-weight:700;font-size:15px;line-height:1.1;">${p.name}</div>
        <div style="font-size:12px;opacity:0.8;line-height:1.1;margin-bottom:4px;">Fonte: ${p.source}</div>
        <div style="font-size:13px;opacity:0.75;">${T.label}</div>
        <div style="font-size:11px;opacity:0.6;margin-bottom:4px;">Playback · ${fmtDateTime(pb.t)}</div>
        <div style="font-size:32px;font-weight:800;margin-bottom:6px;">${p.valueStr}${T.unit}</div>
        <div style="margin-top:6px;">
          <button type="button" style="font-family:'Inter',sans-serif;padding:4px 14px;border:none;border-radius:6px;background:#bebebe;color:white;font-size:13px;font-weight:600;cursor:pointer;"
            onclick="window.open('${gaugesUrl}','gaugesWindow')">📊 Gauges</button>
        </div>
      </div>`;

    activePopup = new maplibregl.Popup({
      closeButton: true,
      closeOnClick: true,
      offset: 20,
      className: "clean-popup"
    })
      .setLngLat(feature.geometry.coordinates)
      .setHTML(html)
      .addTo(map);

    const el = activePopup._content;
    if (el) {
      el.style.backgroundColor = "#e6e6e6";
      el.style.backgroundImage = "linear-gradient(" + overlay + "," + overlay + ")";
    }
  };

  // ---------- Apertura / chiusura ----------
  function openPlayback() {
    pb.active = true;
    currentVariable = "playback";
    modes.playback = pb.type;

    const p = romeParts(Date.now());
    selY.value = String(p.y);
    selM.value = String(p.m);
    fillDays(p.d);
    selD.value = String(p.d);
    selType.value = pb.type;

    bar.style.display = "flex";
    if (activePopup) activePopup.remove();

    pb.t = Date.now();
    pb.t = Math.min(pb.t, bounds().max);
    loadData();
    applyTime();
  }

  // chiude solo l'interfaccia (senza toccare la variabile corrente)
  function hidePlaybackUI() {
    stopPlay();
    pb.active = false;
    pb.token++;
    bar.style.display = "none";
  }

  function closePlayback() {
    hidePlaybackUI();
    if (currentVariable === "playback") currentVariable = "temp";
    updateLayer();
  }

  // ---------- Menu del pulsante Archivio: Archivio (sopra) / Playback (sotto) ----------
  const arcCtl = document.getElementById("archiveControl");
  const arcMenu = document.getElementById("archiveMenu");
  const arcBtn = document.getElementById("archiveButton");

  const choice = document.createElement("div");
  choice.id = "archiveChoice";
  choice.className = "archiveMenu";
  choice.style.minWidth = "150px";
  choice.innerHTML = `
    <button type="button" id="chooseArchive" style="margin-bottom:6px;">Archivio</button>
    <button type="button" id="choosePlayback">Playback</button>
  `;
  arcCtl.insertBefore(choice, arcBtn);

  arcBtn.onclick = function () {
    const open = arcMenu.style.display === "block" || choice.style.display === "block";
    arcMenu.style.display = "none";
    choice.style.display = open ? "none" : "block";
  };

  document.addEventListener("click", function (e) {
    if (!arcCtl.contains(e.target)) choice.style.display = "none";
  });

  document.getElementById("chooseArchive").addEventListener("click", function () {
    choice.style.display = "none";
    const wasPlayback = pb.active;
    hidePlaybackUI();
    arcMenu.style.display = "block";
    if (wasPlayback && currentVariable === "playback") applyArchive();
  });

  document.getElementById("choosePlayback").addEventListener("click", function () {
    choice.style.display = "none";
    arcMenu.style.display = "none";
    openPlayback();
  });

  // ---------- Eventi della barra ----------
  btnPlay.addEventListener("click", () => (pb.playing ? stopPlay() : startPlay()));
  document.getElementById("pbClose").addEventListener("click", closePlayback);

  bar.querySelectorAll("button[data-step]").forEach(b => {
    b.addEventListener("click", () => {
      if (pb.playing) stopPlay();
      setTime(pb.t + Number(b.dataset.step) * 60000);
    });
  });

  selD.addEventListener("change", onDateChange);
  selM.addEventListener("change", () => { fillDays(); onDateChange(); });
  selY.addEventListener("change", () => { fillDays(); onDateChange(); });

  selType.addEventListener("change", () => {
    pb.type = selType.value;
    modes.playback = pb.type;
    if (activePopup) activePopup.remove();
    loadData();
  });

  // scegliendo un'altra variabile dai menu, il playback si chiude
  document.querySelectorAll(".dropdownMenu button").forEach(b => {
    b.addEventListener("click", () => { if (pb.active) hidePlaybackUI(); });
  });
  const arcShow = document.getElementById("arcShow");
  if (arcShow) arcShow.addEventListener("click", () => { if (pb.active) hidePlaybackUI(); });

  // cambio regione: ricarica le fonti giuste
  document.querySelectorAll("#regionMenu button").forEach(b => {
    b.addEventListener("click", () => {
      if (!pb.active) return;
      setTimeout(() => { if (pb.active) loadData(); }, 300);
    });
  });

  fillDays(1);
})();