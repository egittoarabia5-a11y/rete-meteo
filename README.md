<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<title>Weather 3D Map - Ottimizzata</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap" rel="stylesheet">
<script src="https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.js"></script>
<link href="https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.css" rel="stylesheet"/>

<style>
  body { margin:0; overflow:hidden; font-family: 'Inter', sans-serif; }

  #map { width:100vw; height:100vh; }

  #variableControl {
    position:absolute;
    top:10px;
    left:50%;
    transform:translateX(-50%);
    z-index:1000;
    display:flex;
    gap:8px;
  }

  .varButton {
    width: 50px;
    height: 50px;
    border: none;
    border-radius: 12px;
    background: white;
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(0,0,0,.3);
    padding: 0;
  }
  .varButton img { width:100%; height:100%; object-fit:contain; }

  .dropdownMenu {
    display: none;
    position: absolute;
    top: 60px;
    background: white;
    border-radius: 10px;
    box-shadow: 0 2px 10px rgba(0,0,0,.3);
    overflow: hidden;
    min-width: 120px;
    z-index: 1000;
  }
  .dropdownMenu button {
    width: 100%;
    border: none;
    background: white;
    padding: 8px 12px;
    cursor: pointer;
    text-align: left;
  }
  .dropdownMenu button:hover { background: #f0f0f0; }

  .clean-popup .maplibregl-popup-content {
    background: #eeeeee;
    border-radius: 18px;
    padding: 12px;
    box-shadow: 0 6px 18px rgba(0,0,0,0.25);
  }
</style>
</head>

<body>
<div id="variableControl">
  <!-- Temp -->
  <div class="dropdown">
    <button class="varButton" id="tempButton"><img src="https://i.ibb.co/GfMNyGcY/dew.png"></button>
    <div class="dropdownMenu" id="tempMenu">
      <button data-var="temp" data-mode="current">Attuale</button>
      <button data-var="temp" data-mode="max">Massimo</button>
      <button data-var="temp" data-mode="min">Minimo</button>
    </div>
  </div>

  <!-- Dewpoint -->
  <div class="dropdown">
    <button class="varButton" id="dewButton"><img src="https://i.ibb.co/GfMNyGcY/dew.png"></button>
    <div class="dropdownMenu" id="dewMenu">
      <button data-var="dewp" data-mode="current">Attuale</button>
      <button data-var="dewp" data-mode="max">Massimo</button>
      <button data-var="dewp" data-mode="min">Minimo</button>
    </div>
  </div>

  <!-- Heat -->
  <div class="dropdown">
    <button class="varButton" id="heatButton"><img src="https://i.ibb.co/YFJfQ5Tt/HEAT.png"></button>
    <div class="dropdownMenu" id="heatMenu">
      <button data-var="heat" data-mode="current">Attuale</button>
      <button data-var="heat" data-mode="max">Massimo</button>
      <button data-var="heat" data-mode="min">Minimo</button>
    </div>
  </div>

  <!-- Humidity -->
  <div class="dropdown">
    <button class="varButton" id="humButton"><img src="https://i.ibb.co/bjhPCZhk/UR.png"></button>
    <div class="dropdownMenu" id="humMenu">
      <button data-var="hum" data-mode="current">Attuale</button>
      <button data-var="hum" data-mode="max">Massimo</button>
      <button data-var="hum" data-mode="min">Minimo</button>
    </div>
  </div>

  <!-- Rain -->
  <div class="dropdown">
    <button class="varButton" id="rainButton"><img src="https://i.ibb.co/G4Dn7ZS4/DAILY.png"></button>
    <div class="dropdownMenu" id="rainMenu">
      <button data-var="rainDaily" data-mode="current">Giornaliera</button>
      <button data-var="rainRate" data-mode="current">Rate</button>
    </div>
  </div>
</div>

<div id="map"></div>

<script>
const map = new maplibregl.Map({
  container: "map",
  style: "https://api.maptiler.com/maps/019e7938-6b2c-72a8-a6d2-a1adc1577dbc/style.json?key=yoJV05O0V6lTp5gne3Fr",
  center: [8.98, 44.41],
  zoom: 12,
  pitch: 80,
  bearing: 0,
  antialias: true
});

let currentVariable = "temp";
let modes = { temp: "current", dewp: "current", heat: "current", hum: "current", rainDaily: "current", rainRate: "current" };
const stations = {
  IGENOA2897: { api: "IGENOA2897", nome: "Genova S.Martino", sovrastima: "yes" },
  IGENOA3170: { api: "IGENOA3170", nome: "Genova Posalunga", sovrastima: "yes" },
  IGENOA3135: { api: "IGENOA3135", nome: "Genova S.Desiderio", sovrastima: "yes" },
  IGENOA3138: { api: "IGENOA3138", nome: "Genova Pino", sovrastima: "no" },
  IGENOA2783: { api: "IGENOA2783", nome: "Genova Terpi", sovrastima: "no" },
  IGENOA3085: { api: "IGENOA3085", nome: "Genova Sturla", sovrastima: "no" },
  IGENOVAG3: { api: "IGENOVAG3", nome: "Genova San Fruttuoso", sovrastima: "no" },
  IVARAZ2: { api: "IVARAZ2", nome: "Monte Beigua", sovrastima: "no" },
  IURBE3: { api: "URBE3", nome: "Passo del Faiallo", sovrastima: "no" },
  ILIGURIA181: { api: "ILIGURIA181", nome: "Genova S.Martino", sovrastima: "yes" },
  IVALBR3: { api: "IVALBR3", nome: "Senarega", sovrastima: "no" },
  ITORRI20: { api: "ITORRI20", nome: "Pentema", sovrastima: "no" },
  ITORRI88: { api: "ITORRI88", nome: "Donetta", sovrastima: "no" },
  ITORRI54: { api: "ITORRI54", nome: "Casabianca", sovrastima: "no" },
  ITORRI4: { api: "ITORRI4", nome: "Laccio", sovrastima: "no" },
  INEIRO1: { api: "INEIRO1", nome: "Brugagli", sovrastima: "no" },
  IMOCON1: { api: "IMOCON1", nome: "Gattorna", sovrastima: "no" },
  IROVEG2: { api: "IROVEG2", nome: "Foppiano", sovrastima: "no" },
  ISORI13: { api: "ISORI13", nome: "Sori La Contra", sovrastima: "no" },
  IRECCO16: { api: "IRECCO16", nome: "Recco", sovrastima: "no" },
  IAVEGN2: { api: "IAVEGN2", nome: "Avegno Testana", sovrastima: "no" },
  IMELE16: { api: "IMELE16", nome: "Genova Acquasanta", sovrastima: "no" },
  IMELE15: { api: "IMELE15", nome: "Mele", sovrastima: "no" },
  IGENOA2839: { api: "IGENOA2839", nome: "Genova Lavatrici", sovrastima: "no" },
  ICOGOL39: { api: "ICOGOL39", nome: "Sciarborasca Molino", sovrastima: "no" },
  ICOGOL7: { api: "ICOGOL7", nome: "Cogoleto Madonnina", sovrastima: "no" },
  ICOGOL10: { api: "ICOGOL10", nome: "Cogoleto Beuca", sovrastima: "no" },
  ICAMPO219: { api: "ICAMPO219", nome: "Campo Ligure", sovrastima: "no" },
  IMASON4: { api: "IMASON4", nome: "Masone", sovrastima: "no" },
  ISERRA22: { api: "ISERRA22", nome: "Mignanego", sovrastima: "no" },
  ICAMPO445: { api: "ICAMPO445", nome: "Pietralavezzara", sovrastima: "no" },
  ICAMPO312: { api: "ICAMPO312", nome: "Campomorone", sovrastima: "no" },
  ICOGOL39: { api: "IMIGNA23", nome: "Passo dei Giovi", sovrastima: "no" },
  IBUSAL3: { api: "IBUSAL3", nome: "Busalla", sovrastima: "no" },
  IBUSAL1: { api: "IBUSAL1", nome: "Busalla Giò Alto", sovrastima: "no" },
  ICROCE7: { api: "ICROCE7", nome: "Crocefieschi", sovrastima: "no" },
  ISAVIG97: { api: "ISAVIG97", nome: "Ponte di Savignone", sovrastima: "no" },
  ICASEL6: { api: "ICASEL6", nome: "Casella", sovrastima: "no" },
  IVALBR4: { api: "IVALBR4", nome: "Valbrevenna", sovrastima: "no" },
  IMONTO93: { api: "IMONTO93", nome: "Casà", sovrastima: "no" },
  IRONCO16: { api: "IRONCO16", nome: "Banchetta", sovrastima: "no" },
  IRONCO23: { api: "IRONCO23", nome: "Ronco Scrivia", sovrastima: "no" },
  ISANTO411: { api: "ISANTO411", nome: "Busalletta", sovrastima: "no" },
  IRAPAL35: { api: "IRAPAL35", nome: "Sant'Andrea di Foggia", sovrastima: "no" },
  IRAPAL28: { api: "IRAPAL28", nome: "Rapallo Golf", sovrastima: "no" },
  ISANTA1774: { api: "ISANTA1774", nome: "Santa Margherita Ligure", sovrastima: "no" },
  ICHIAV22: { api: "ICHIAV22", nome: "Sant'Andrea di Rovereto", sovrastima: "no" },
  ILIGURIA123: { api: "ILIGURIA123", nome: "Villa Oneto", sovrastima: "no" },
  ICOGOR3: { api: "ICOGOR3", nome: "Cogorno", sovrastima: "no" },
  ISESTR36: { api: "ISESTR36", nome: "Sestri Levante", sovrastima: "no" },
  ISESTR23: { api: "ISESTR23", nome: "Riva Trigoso", sovrastima: "no" },
  ICASAR91: { api: "ICASAR91", nome: "Casarza Ligure", sovrastima: "no" },
  IMONEG33: { api: "IMONEG33", nome: "Moneglia", sovrastima: "no" },
  ILIGURIA20: { api: "ILIGURIA20", nome: "Moneglia Casale", sovrastima: "no" },
  ILIGURIA175: { api: "ILIGURIA175", nome: "Lavagna", sovrastima: "no" },
  INE1805: { api: "INE1805", nome: "Trei", sovrastima: "no" },
  IBONAS9: { api: "IBONAS9", nome: "Bonassola", sovrastima: "no" },
  IRICCD2: { api: "IRICCD2", nome: "San Benedetto", sovrastima: "no" },
  ILASPE54: { api: "ILASPE54", nome: "Vignale", sovrastima: "no" },
  ILASPE76: { api: "ILASPE76", nome: "Coregna", sovrastima: "no" },
  ILASPE12: { api: "ILASPE12", nome: "La Spezia", sovrastima: "no" },
  ISPLASER2: { api: "ISPLASER2", nome: "Lerici", sovrastima: "no" },
  IVEZZA26: { api: "IVEZZA26", nome: "Fornola", sovrastima: "no" },
  IVEZZA19: { api: "IVEZZA19", nome: "San Venario", sovrastima: "no" },
  ILIGURIA131: { api: "ILIGURIA131", nome: "Ponzano Magra", sovrastima: "no" },
  ISARZA7: { api: "ISARZA7", nome: "Sarzana Turi", sovrastima: "no" },
  ISANTO374: { api: "ISANTO374", nome: "Santo Stefano di Magra", sovrastima: "no" },
  IBOLAN1: { api: "IBOLAN1", nome: "Bolano", sovrastima: "no" },
  ICALIC12: { api: "ICALIC12", nome: "Posticcio", sovrastima: "no" },
  IORTON8: { api: "IORTON8", nome: "Casano", sovrastima: "no" },
  ILUNI5: { api: "ILUNI5", nome: "Luni", sovrastima: "no" },
  IBARGAGL5: { api: "IBARGAGL5" },
  IBOGLI8: { api: "IBOGLI8" },
  IDAVAG2: { api: "IDAVAG2" },
  IMONTO47: { api: "IMONTO47" },
  IGENOA3078: { api: "IGENOA2728" },
  IGENOA2775: { api: "IGENOA2775" },
  IGENOA2819: { api: "IGENOA2819" },
  IGENOA2865: { api: "IGENOA2865" },
  IGENOA2881: { api: "IGENOA2881" },
  IGENOA2887: { api: "IGENOA2887" },
  IGENOA2933: { api: "IGENOA2933" },
  IGENOA2959: { api: "IGENOA2959" },
  IGENOA2962: { api: "IGENOA2962" },
  IGENOA2983: { api: "IGENOA2983" },
  IGENOA2997: { api: "IGENOA2997" },
  IGENOA3021: { api: "IGENOA3021" },
  IGENOA3032: { api: "IGENOA3032" },
  IGENOA3035: { api: "IGENOA3079" },
  IGENOA3052: { api: "IGENOA3080" },
  IGENOA3058: { api: "IGENOA3058" },
  IGENOA3069: { api: "IGENOA3069" },
  ILIGURIA67: { api: "ILIGURIA67" },
  IGENOVAA2: { api: "IGENOVAA2" },
  IBOGLI8: { api: "IBOGLI8" },
  IBOGLI12: { api: "IBOGLI12" },
  IPIEVE46: { api: "IPIEVE46" },
  IGENOA3082: { api: "IGENOA3082" },
  IURBE3: { api: "IURBE3", nome: "Passo del Faiallo", sovrastima: "no" },
  IVARAZ9: { api: "IVARAZ9", nome: "Piani D'Invrea", sovrastima: "no" },
  IVARAZ6: { api: "IVARAZ6", nome: "Varazze", sovrastima: "no" },
  IALBIS6: { api: "IALBIS6", nome: "Albisola", sovrastima: "no" },
  IQUILI21: { api: "IQUILI21", nome: "Valleggia", sovrastima: "no" },
  IFINAL23: { api: "IFINAL23", nome: "Finale Ligure", sovrastima: "no" },
  IFINAL12: { api: "IFINAL12", nome: "Finalborgo", sovrastima: "no" },
  IPIETR18: { api: "IPIETR18", nome: "Pietra Ligure", sovrastima: "no" },
  ILOANO19: { api: "ILOANO19", nome: "Loano", sovrastima: "no" },
  ILOANO18: { api: "ILOANO18", nome: "Borghetto Santo Spirito", sovrastima: "no" },
  ITOIRA11: { api: "ITOIRA11", nome: "Toirano", sovrastima: "no" },
  ICERIALE2: { api: "ICERIALE2", nome: "Ceriale", sovrastima: "no" },
  IVILLA764: { api: "IVILLA764", nome: "Villanova d'Albenga", sovrastima: "no" },
  ILAIGU24: { api: "ILAIGU24", nome: "Laigueglia", sovrastima: "no" },
  IANDOR45: { api: "IANDOR45", nome: "Marina di Andora", sovrastima: "no" },
  IMIOGL2: { api: "IMIOGL2", nome: "Mioglia", sovrastima: "no" },
};
const geojson = { type: "FeatureCollection", features: [] };
let activePopup = null;

// ================= COLOR SCALE =================
function getColor(variable, value) {
  if (value === null) return "#808080";

  if (variable === "hum") {
    if (value < 20) return "#b44141";
    if (value < 30) return "#ff6262";
    if (value < 40) return "#ff9d56";
    if (value < 50) return "#f1d800";
    if (value < 60) return "#65d050";
    if (value < 70) return "#6ca561";
    if (value < 80) return "#4dc8ff";
    if (value < 90) return "#4da9ff";
    return "#4d54ff";
  }

  if (variable === "rainDaily" || variable === "rainRate") {
    if (value === 0) return "#808080";
    if (value < 1) return "#7edee6";
    if (value < 2) return "#61b6ea";
    if (value < 5) return "#4a7be4";
    if (value < 10) return "#6ca561";
    if (value < 20) return "#65d050";
    if (value < 30) return "#4dc8ff";
    if (value < 50) return "#4da9ff";
    if (value < 75) return "#4d54ff";
    if (value < 100) return "#2c278e";
    return "#2c2c2c";
  }

  // Temperature & Heat & Dewpoint
  if (value < -20) return "#9d8cac";
  if (value < -15) return "#f54dff";
  if (value < -10) return "#c65bff";
  if (value < -5) return "#4d54ff";
  if (value < 0) return "#4da9ff";
  if (value < 5) return "#4dc8ff";
  if (value < 10) return "#6ca561";
  if (value < 15) return "#65d050";
  if (value < 20) return "#ffd800";
  if (value < 25) return "#ff9d56";
  if (value < 30) return "#ff6262";
  if (value < 35) return "#b44141";
  if (value < 38) return "#d963c3";
  return "#ff5c5c";
}

// ================= GET VALUE =================
function getValueAndColor(st) {
  const mode = modes[currentVariable];
  let value = null;

  const get = (base) => mode === "current" ? st[base] : 
                        mode === "max" ? st[base + "High"] : 
                        st[base + "Low"];

  if (currentVariable === "temp") value = get("temp");
  else if (currentVariable === "dewp") value = get("dewp");
  else if (currentVariable === "heat") value = get("heat");
  else if (currentVariable === "hum") value = get("hum");
  else if (currentVariable === "rainDaily") value = st.rainDaily;
  else if (currentVariable === "rainRate") value = st.rainRate;

  const color = getColor(currentVariable, value);
  const valueStr = value !== null ? value.toFixed(1) : "";

  return { value, color, valueStr };
}

// ================= UPDATE LAYER =================
function updateStationsLayer() {
  geojson.features = Object.values(allStations).map(st => {
    const { value, color, valueStr } = getValueAndColor(st);
    return {
      type: "Feature",
      geometry: { type: "Point", coordinates: [st.lon, st.lat] },
      properties: {
        id: st.id,
        valueStr: valueStr,
        color: color,
        name: st.N || st.nome || st.id
      }
    };
  });

  const source = map.getSource('weather-stations');
  if (source) source.setData(geojson);
}

// ================= POPUP =================
function showPopup(feature) {
  const st = allStations[feature.properties.id];
  if (!st) return;

  if (activePopup) activePopup.remove();

  const isRain = currentVariable === "rainDaily" || currentVariable === "rainRate";
  const fmt = v => v == null ? "-" : Number(v).toFixed(1);

  const el = document.createElement("div");
  el.innerHTML = `
    <div style="text-align:center; font-family:Inter,sans-serif;">
      <div style="font-size:14px;font-weight:700;margin-bottom:4px;">${st.N || st.nome || st.id}</div>
      <div style="font-size:12px;opacity:0.7;margin-bottom:2px;">
        ${currentVariable === "temp" ? "Temperatura" : 
          currentVariable === "dewp" ? "Dew Point" :
          currentVariable === "heat" ? "Heat Index" :
          currentVariable === "hum" ? "Umidità" :
          currentVariable === "rainDaily" ? "Pioggia Giornaliera" : "Pioggia Rate"}
      </div>
      <div style="font-size:28px;font-weight:800;margin-bottom:6px;">
        ${fmt(st[currentVariable] || st[currentVariable === "rainDaily" ? "rainDaily" : "rainRate"])}${isRain ? (currentVariable === "rainDaily" ? " mm" : " mm/h") : "°"}
      </div>
    </div>
  `;

  activePopup = new maplibregl.Popup({
    closeButton: false,
    closeOnClick: true,
    offset: 18,
    className: "clean-popup"
  })
    .setLngLat([st.lon, st.lat])
    .setDOMContent(el)
    .addTo(map);
}

// ================= MAP LOAD =================
map.on("load", () => {
  // Terrain + 3D
  map.addSource("terrain", {
    type: "raster-dem",
    url: "https://api.maptiler.com/tiles/terrain-rgb/tiles.json?key=yoJV05O0V6lTp5gne3Fr",
    tileSize: 512
  });
  map.setTerrain({ source: "terrain", exaggeration: 1.3 });

  map.addLayer({ id: "sky", type: "sky", paint: { "sky-type": "atmosphere" }});

  map.setLight({ anchor: "map", intensity: 1.5, position: [2.5, 35, 170] });

  // ================= GEOJSON LAYERS =================
  map.addSource('weather-stations', { type: 'geojson', data: geojson });

  map.addLayer({
    id: 'stations-circle',
    type: 'circle',
    source: 'weather-stations',
    paint: {
      'circle-radius': ['interpolate', ['linear'], ['zoom'], 8, 8, 14, 13],
      'circle-color': ['get', 'color'],
      'circle-stroke-color': '#ffffff',
      'circle-stroke-width': 2.5,
      'circle-opacity': 0.95
    }
  });

  map.addLayer({
    id: 'stations-text',
    type: 'symbol',
    source: 'weather-stations',
    layout: {
      'text-field': ['get', 'valueStr'],
      'text-font': ['Inter Bold', 'Arial Bold'],
      'text-size': ['interpolate', ['linear'], ['zoom'], 8, 9, 14, 12],
      'text-anchor': 'center',
      'text-allow-overlap': true
    },
    paint: {
      'text-color': '#ffffff',
      'text-halo-color': '#222222',
      'text-halo-width': 1.8
    }
  });

  // Events
  map.on('click', 'stations-circle', e => showPopup(e.features[0]));
  map.on('click', 'stations-text', e => showPopup(e.features[0]));

  map.on('mouseenter', 'stations-circle', () => map.getCanvas().style.cursor = 'pointer');
  map.on('mouseleave', 'stations-circle', () => map.getCanvas().style.cursor = '');

  // ================= BUTTONS =================
  const toggleMenu = id => {
    const el = document.getElementById(id);
    el.style.display = el.style.display === "block" ? "none" : "block";
  };

  document.getElementById("tempButton").onclick = () => toggleMenu("tempMenu");
  document.getElementById("dewButton").onclick = () => toggleMenu("dewMenu");
  document.getElementById("heatButton").onclick = () => toggleMenu("heatMenu");
  document.getElementById("humButton").onclick = () => toggleMenu("humMenu");
  document.getElementById("rainButton").onclick = () => toggleMenu("rainMenu");

  document.querySelectorAll(".dropdownMenu button").forEach(btn => {
    btn.onclick = () => {
      currentVariable = btn.dataset.var;
      modes[btn.dataset.var] = btn.dataset.mode || "current";
      document.querySelectorAll(".dropdownMenu").forEach(m => m.style.display = "none");
      updateStationsLayer();
    };
  });

  // ================= FETCH FUNCTIONS =================
  const apiKey = "e1f10a1e78da46f5b10a1e78da96f525";

async function fetchPws(id) {

  const meta = stations[id];
  if (!meta) return;

  const stationApi = meta.api;
  const stationName = meta.nome || id;
  try {

    // ================= CURRENT =================
    const urlCurrent =
      `https://api.weather.com/v2/pws/observations/current` +
      `?apiKey=${apiKey}&stationId=${stationApi}` +
      `&numericPrecision=decimal&format=json&units=m`;

    const resCurrent = await fetch(urlCurrent);
    const dataCurrent = await resCurrent.json();

    const obs = dataCurrent?.observations?.[0];
    if (!obs) return;

    const temp = obs.metric?.temp ?? null;
    const dewp = obs.metric?.dewpt ?? null;
    const heat = obs.metric?.heatIndex ?? null;
    const hum = obs?.humidity ?? null;

    const rainDaily = obs.metric?.precipTotal ?? null;
    const rainRate = obs.metric?.precipRate ?? null;

    const lat = obs?.lat ?? null;
    const lon = obs?.lon ?? null;

    const wind = obs.metric?.windSpeed ?? null;
    const windGust = obs.metric?.windGust ?? null;
    const windDir = obs?.winddir ?? null;

    // ================= DAILY =================
    const urlDaily =
      `https://api.weather.com/v2/pws/dailysummary/1day` +
      `?apiKey=${apiKey}&stationId=${stationApi}` +
      `&numericPrecision=decimal&format=json&units=m`;

    const resDaily = await fetch(urlDaily);
    const dataDaily = await resDaily.json();

    const summary = dataDaily?.summaries?.[0]?.metric ?? {};

    const tempHigh = summary?.tempHigh ?? null;
    const tempLow = summary?.tempLow ?? null;

    const dewpHigh = summary?.dewptHigh ?? null;
    const dewpLow = summary?.dewptLow ?? null;

    const heatHigh = summary?.heatindexHigh ?? null;
    const heatLow = summary?.heatindexLow ?? null;

    const humHigh = dataDaily?.summaries?.[0]?.humidityHigh ?? null;
    const humLow = dataDaily?.summaries?.[0]?.humidityLow ?? null;

    const windGustHigh = summary?.windgustHigh ?? null;

    // ================= SAVE =================
    latestData[id] = {
      N: stationName,
      temp,
      tempHigh,
      tempLow,
      dewp,
      dewpHigh,
      dewpLow,
      heat,
      heatHigh,
      heatLow,
      hum,
      humHigh,
      humLow,
      rainDaily,
      rainRate,
      wind,
      windGust,
      windGustHigh,
      windDir,
      lat,
      lon
    };

    if (!markers[id]) {
      createMarker(id, lat, lon);
    }

    updateMarker(id);

  } catch (e) {
    console.error(e);
  }
}
const fetchOMIRL = async () => {
  try {

    const res = await fetch(
      "https://api-stazioni-meteo.eggittof.workers.dev/omirl.json"
    );

    const data = await res.json();
    if (!data?.stations) return;

    data.stations.forEach((st) => {

      const id = st.id;

      const lat = Number(st.lat);
      const lon = Number(st.lon);

      if (!lat || !lon) return;

      latestData[id] = {
        source: "OMIRL",

        temp: st.temp ?? null,
        tempHigh: st.tempHigh ?? null,
        tempLow: st.tempLow ?? null,

        dewp: st.dew ?? null,
        dewpHigh: st.dewHigh ?? null,
        dewpLow: st.dewLow ?? null,

        heat: st.heat ?? null,

        hum: st.hum ?? null,
        humHigh: st.humHigh ?? null,
        humLow: st.humLow ?? null,

        wind: st.wind ?? null,
        windGust: st.windGust ?? null,
        windDir: st.windDir ?? null,

        rainDaily: st.rainDaily ?? null,
        rainRate: st.rainRate ?? null,

        lat,
        lon
      };

      if (!markers[id]) {
        createMarker(id, lat, lon);
      }

      updateMarker(id);
    });

  } catch (err) {
    console.error("Errore fetch OMIRL:", err);
  }
};
const fetchIgnorete = async () => {

  try {

    const res = await fetch(
      "https://api-stazioni-meteo.eggittof.workers.dev/ignorete.json"
    );

    const data = await res.json();

    if (!data?.stations) return;

    data.stations.forEach((st) => {

      const id = st.id;

      const lat = Number(st.lat);
      const lon = Number(st.lon);

      if (!lat || !lon) return;

      latestData[id] = {

        source: "IGNORETE",

        // ===== TEMPERATURE =====
        temp: st.T ?? null,
        tempHigh: st.TH ?? null,
        tempLow: st.TL ?? null,

        // ===== HUMIDITY =====
        hum: st.H ?? null,

        // ===== WIND =====
        wind: st.V ?? null,
        windGust: st.VR ?? null,
        windDir: st.VD ?? null,

        // ===== RAIN =====
        rainDaily: st.R ?? null,
        rainRate: st.RR ?? null,

        // ===== DEWPOINT =====
        dewp: st.D ?? null,

        lat,
        lon
      };

      // marker creation (compatibile con tuo sistema)
      if (!markers[id]) {
        createMarker(id, lat, lon);
      }

      updateMarker(id);
    });

    // opzionale: se lo usi per filtro UI
    if (typeof filterMarkersBySource === "function") {
      filterMarkersBySource();
    }

  } catch (err) {
    console.error("Errore fetch IGNORETE:", err);
  }
};
const fetchWF = async () => {
  try {
    const res = await fetch(
      "https://api-stazioni-meteo.eggittof.workers.dev/weatherflow.json"
    );

    const data = await res.json();

    if (!data?.stations) return;

    data.stations.forEach((st) => {

      // ✅ FIX: ID stabile
      const id = st.N;

      const lat = Number(st.LAT);
      const lon = Number(st.LON);

      if (!lat || !lon) return;

      latestData[id] = {
        source: "WEATHERFLOW",
        temp: st.T ?? null,
        hum: st.H ?? null,
        dewp: st.D ?? null,
        wind: st.V ?? null,
        windGust: st.VR ?? null,
        windDir: st.WD ?? null,
        rainDaily: st.R ?? null,
        rainRate: st.RR ?? null,
        lat,
        lon
      };

      // ⚠️ FIX: marker per ID unico
      if (!markers[id]) {
        createMarker(id, lat, lon);
      } else {
        // se esiste già, aggiorna posizione se serve
        markers[id].setLatLng([lat, lon]);
      }

      updateMarker(id);
    });

    if (typeof filterMarkersBySource === "function") {
      filterMarkersBySource();
    }

  } catch (err) {
    console.error("Errore fetch WF:", err);
  }
};
const fetchComuneGenova = async () => {

  try {

    const res = await fetch(
      "https://api-stazioni-meteo.eggittof.workers.dev/comuneGenova.json"
    );

    const data = await res.json();

    if (!data?.stations) return;

    data.stations.forEach((st) => {

      const id = st.id;

      const lat = Number(st.lat);
      const lon = Number(st.lon);

      if (!lat || !lon) return;

      latestData[id] = {

        source: "Comune",

        // ===== TEMPERATURE =====
        temp: st.T ?? null,
        tempHigh: st.TH ?? null,
        tempLow: st.TL ?? null,

        // ===== HUMIDITY =====
        hum: st.H ?? null,
        humHigh: st.HH ?? null,
        humLow: st.HL ?? null,

        // ===== WIND =====
        wind: st.W ?? null,
        windDir: st.WD ?? null,
        windGust: st.WH ?? null,

        // ===== RAIN =====
        rainDaily: st.R ?? null,

        // ===== DEWPOINT =====
        dewp: st.D ?? null,
        dewpHigh: st.DH ?? null,
        dewpLow: st.DL ?? null,

        lat,
        lon
      };

      // marker
      if (!markers[id]) {
        createMarker(id, lat, lon);
      }

      updateMarker(id);
    });

    if (typeof filterMarkersBySource === "function") {
      filterMarkersBySource();
    }

  } catch (err) {
    console.error("Errore fetch Comune di Genova:", err);
  }
};

const fetchLimet = async () => {

  try {

    const [res1, res2] = await Promise.all([
      fetch("https://api-stazioni-meteo.eggittof.workers.dev/limet.json"),
      fetch("https://api-stazioni-meteo.eggittof.workers.dev/limet2.json")
    ]);

    const data1 = await res1.json();
    const data2 = await res2.json();

    const stations = [
      ...(data1?.stations || []),
      ...(data2?.stations || [])
    ];

    if (!stations.length) return;

    stations.forEach((st) => {

      const id = st.N;

      const lat = Number(st.LAT);
      const lon = Number(st.LON);

      if (!lat || !lon) return;

      latestData[id] = {

        source: "LIMET",

        // ===== TEMPERATURE =====
        temp: st.T ?? null,
        tempHigh: st.TH ?? null,
        tempLow: st.TL ?? null,

        // ===== HUMIDITY =====
        hum: st.H ?? null,
        humHigh: st.HH ?? null,
        humLow: st.HL ?? null,

        // ===== WIND =====
        wind: st.V ?? null,
        windGust: st.VR ?? null,

        // ===== RAIN =====
        rainDaily: st.R ?? null,
        rainRate: st.RR ?? null,

        // ===== DEWPOINT =====
        dewp: st.D ?? null,
        dewpHigh: st.DH ?? null,
        dewpLow: st.DL ?? null,

        // ===== PRESSURE =====
        pressure: st.P ?? null,

        // ===== EXTRA =====
        heat: st.HI ?? null,
        time: st.TIME ?? null,

        lat,
        lon
      };

      // marker
      if (!markers[id]) {
        createMarker(id, lat, lon);
      }

      updateMarker(id);
    });

    if (typeof filterMarkersBySource === "function") {
      filterMarkersBySource();
    }

  } catch (err) {
    console.error("Errore fetch LIMET:", err);
  }
};
async function fetchPWSGenova() {
  try {

    console.log("🔥 fetchAeris START");

    const res = await fetch(
      "https://api-stazioni-meteo.eggittof.workers.dev/aeris.json"
    );

    const data = await res.json();

    console.log("📡 response:", data);

    if (!data?.stations) {
      console.warn("❌ nessuna stations");
      return;
    }

    data.stations.forEach(st => {

      const id = st.id;

      const lat = Number(st.lat);
      const lon = Number(st.lon);

      if (!lat || !lon) return;

      latestData[id] = {
        source: "AERIS_GENOVA",

        // ================= TEMPERATURE =================
        temp: st.T ?? null,
        tempHigh: st.TH ?? null,
        tempLow: st.TL ?? null,

        // ================= DEWPOINT =================
        dewp: st.D ?? null,
        dewpHigh: st.DH ?? null,
        dewpLow: st.DL ?? null,

        // ================= HEAT INDEX =================
        heat: st.HI ?? null,
        heatHigh: st.HIH ?? null,
        heatLow: st.HIL ?? null,

        // ================= HUMIDITY =================
        hum: st.H ?? null,
        humHigh: st.HH ?? null,
        humLow: st.HL ?? null,

        // ================= PRESSURE =================
        pressure: st.P ?? null,
        pressureHigh: st.PH ?? null,
        pressureLow: st.PL ?? null,

        // ================= WIND =================
        wind: st.V ?? null,
        windHigh: st.VH ?? null,
        windLow: st.VL ?? null,

        windGust: st.G ?? null,
        windGustHigh: st.GH ?? null,

        windDir: st.WD ?? null,

        // ================= PRECIPITATION =================
        rainDaily: st.R ?? null,
        rainRate: st.RR ?? null,

        // ================= RADIATION =================
        rad: st.RAD ?? null,
        radHigh: st.RADH ?? null,
        radLow: st.RADL ?? null,

        // ================= META =================
        lat,
        lon,
        time: st.timestamp ?? null
      };

      if (!markers[id]) {
        console.log("➕ create marker:", id);
        createMarker(id, lat, lon);
      }

      updateMarker(id);
    });

    console.log("✅ AERIS DONE");

  } catch (err) {
    console.error("❌ fetchAeris error:", err);
  }
}

  // Avvia
  fetchAllSources();
  setInterval(fetchAllSources, 300000);
});
Object.keys(stations).forEach(id => fetchPws(id));
  fetchOMIRL();
  fetchIgnorete();
  fetchComuneGenova();
  fetchLimet();
  fetchPWSGenova();
  fetchWF();

  // ======================
  // INTERVALS
  // ======================
  setInterval(() => {
    Object.keys(stations).forEach(id => fetchPws(id));
  }, 300000);

  setInterval(fetchPWSGenova, 300000);
  setInterval(fetchOMIRL, 300000);
  setInterval(fetchIgnorete, 300000);
  setInterval(fetchComuneGenova, 300000);
  setInterval(fetchLimet, 300000);
  setInterval(fetchWF, 300000);

});
</script>
</body>
</html>