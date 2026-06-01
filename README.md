# sito-di-prova
prova
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Mappa Meteo Genova</title>
  <link rel="stylesheet" href="https://unpkg.com/leaflet/dist/leaflet.css" />
  <link href="https://fonts.googleapis.com/css2?family=Rubik:wght@500&display=swap" rel="stylesheet">
  <script src="https://cdnjs.cloudflare.com/ajax/libs/raphael/2.3.0/raphael.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/justgage/1.6.1/justgage.min.js"></script>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap" rel="stylesheet">
 


  <style>
    body {
      margin: 0;
      font-family: "Inter", sans-serif;
    }
    #menu {
      position: absolute;
      top: 10px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 1000;
      background: white;
      padding: 8px 12px;
      border-radius: 8px;
      box-shadow: 0 2px 6px rgba(0,0,0,0.2);
    }
    #map {
      height: 100vh;
      width: 100%;
    }
    .circle-label {
  color: white;
  border-radius: 50%;
  font-weight: 450;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: "Inter", sans-serif;
  width: 26px;
  height: 26px;
  line-height: 1;           /* assicurati che non ci siano spazi extra */
  text-align: center;
}

    .circle-label2 {
      color: white;
      border-radius: 50%;
      font-weight: 0;
      font-size: 0px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: "Inter", sans-serif;
      width: 0px;
      height: 0px;
    }
    #map {
  filter: brightness(1) contrast(1) saturate(0.9);
}
  </style>
</head>
<body>
  <div id="sourceMenu" style="position:absolute; top:10px; right:10px; z-index:1000; background:white; padding:8px 12px; border-radius:8px; box-shadow:0 2px 6px rgba(0,0,0,0.2); font-size:14px;">
    <b>Fonti:</b><br>
    <label><input type="checkbox" class="sourceFilter" value="omirl" > OMIRL</label><br>
    <label><input type="checkbox" class="sourceFilter" value="genova"> Liguria</label><br>
    <label><input type="checkbox" class="sourceFilter" value="alessandria"> Piemonte</label><br>
    <label><input type="checkbox" class="sourceFilter" value="cml"> Lombardia</label><br>
  </div>
  
  
  <div id="menu">
    <label for="tempSelect"><b>Dati:</b></label>
    <select id="tempSelect">
      <option value="current">Temperatura</option>
      <option value="max">T Max</option>
      <option value="min">T Min</option>
      <option value="dewpt">Dewpoint</option>
      <option value="dewpMax">Dp Max</option>
      <option value="dewpMin">Dp Min</option>
      <option value="Heat">Heat Index</option>
      <option value="HeatMax">Ht Max</option>
      <option value="HeatMin">Ht Min</option>
      <option value="hum">Umidità</option>
      <option value="humMax">UR Max</option>
      <option value="humMin">UR Min</option>
      <option value="rainDay">Pioggia 24h</option>
      <option value="rainRate">Rain Rate</option>
      <option value="wind">Vento</option>
      <option value="winddirection">Direzione</option>
      <option value="windGust">Raffica</option>
      <option value="windGustMax">Raffica Max</option>

    </select>
  </div>

  <div id="map"></div>

  <script src="https://unpkg.com/leaflet/dist/leaflet.js"></script>
  <script>
//----------------------------------------------------- CONFIGURAZIONE MAPPA
const key = "yoJV05O0V6lTp5gne3Fr";

const map = L.map("map").setView([44.4, 8.9], 10);

L.tileLayer(
  `https://api.maptiler.com/maps/landscape-v4/{z}/{x}/{y}.png?key=${key}`,
  {
    tileSize: 512,
    zoomOffset: -1,
    minZoom: 1,
    attribution:
      '&copy; <a href="https://www.maptiler.com/">MapTiler</a> &copy; OpenStreetMap contributors',
    crossOrigin: true
  }
).addTo(map);

//----------------------------------------------------- API
    const apiKey = 'e1f10a1e78da46f5b10a1e78da96f525';

//----------------------------------------------------- STAZIONI GENOVA
    const stationsGenova = {

  IGENOA2897: { api: "IGENOA2897", nome: "Genova S.Martino", sovrastima: "yes" },
  IGENOA3170: { api: "IGENOA3170", nome: "Genova Posalunga", sovrastima: "yes" },
  IGENOA3135: { api: "IGENOA3135", nome: "Genova S.Desiderio", sovrastima: "yes" },
  IGENOA3138: { api: "IGENOA3138", nome: "Genova Pino", sovrastima: "no" },
  IGENOA2783: { api: "IGENOA2783", nome: "Genova Terpi", sovrastima: "no" },
  ILIGURIA181: { api: "ILIGURIA181", nome: "Genova S.Martino", sovrastima: "yes" },
  IVALBR3: { api: "IVALBR3", nome: "Senarega", sovrastima: "no" },
  ITORRI20: { api: "ITORRI20", nome: "Pentema", sovrastima: "no" },
  ITORRI88: { api: "ITORRI88", nome: "Donetta", sovrastima: "no" },
  ITORRI54: { api: "ITORRI54", nome: "Casabianca", sovrastima: "no" },
  ITORRI4: { api: "ITORRI4", nome: "Laccio", sovrastima: "no" },
  INEIRO1: { api: "INEIRO1", nome: "Brugagli", sovrastima: "no" },
  IMOCON1: { api: "IMOCON1", nome: "Gattorna", sovrastima: "no" },
  IROVEG2: { api: "IROVEG2", nome: "Foppiano", sovrastima: "no" },
  IPIEVE47: { api: "IPIEVE47", nome: "Pieve Ligure", sovrastima: "no" },
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

const stationsAlessandria = {
  IPONZO9: { api: "IPONZO9", nome: "Bric Berton", sovrastima: "no" },
  IPONZO6: { api: "IPONZO6", nome: "Abasse", sovrastima: "no" },
  ICARRE14: { api: "ICARRE14", nome: "Carrega Ligure", sovrastima: "no" },
  IGROND1: { api: "IGROND1", nome: "Grondona", sovrastima: "no" },
};

const stationsAsti = {ISERRA50: { api: "ISERRA50", nome: "Serravalle Scrivia", sovrastima: "no" },
  ISTAZZ25: { api: "ISTAZZ25", nome: "Monte Spineto", sovrastima: "no" },
  ICASAL53: { api: "ICASAL53", nome: "Casaleggio Boiro", sovrastima: "no" },
  IVOLTA3: { api: "IVOLTA3", nome: "Molini di Voltaggio", sovrastima: "no" },
  IVOLTA7: { api: "IVOLTA7", nome: "Voltaggio", sovrastima: "no" },
  ICARRO37: { api: "ICARRO37", nome: "Carrosio", sovrastima: "no" },
  IGAVI7: { api: "IGAVI7", nome: "Alice", sovrastima: "no" },
  IGAVI5: { api: "IGAVI5", nome: "Gavi Malvicina", sovrastima: "no" },
  IGAVI6: { api: "IGAVI6", nome: "Gavi", sovrastima: "no" },
  ISANCR61: { api: "ISANCR61", nome: "San Cristoforo", sovrastima: "no" },
  ISILVA16: { api: "ISILVA16", nome: "Silvano d'Orba", sovrastima: "no" },
  IPREDO1: { api: "IPREDO1", nome: "Predosa", sovrastima: "no" },
  ICASAL106: { api: "ICASAL106", nome: "Casal Cermelli", sovrastima: "no" },
  IALESS19: { api: "IALESS19", nome: "Spinetta Marengo", sovrastima: "no" },
  IFELIZ2: { api: "IFELIZ2", nome: "Felizzano", sovrastima: "no" },
  ITORTO96: { api: "ITORTO96", nome: "Tortona", sovrastima: "no" },
  IPOZZO12: { api: "IPOZZO12", nome: "Pozzolo Formigaro", sovrastima: "no" },
  INOVILIG13: { api: "INOVILIG13", nome: "Novi Ligure", sovrastima: "no" },
  IOVADA9: { api: "IOVADA9", nome: "Ovada", sovrastima: "no" },
  IOVADA12: { api: "IOVADA12", nome: "Ovada FS", sovrastima: "no" },
  ICREMO15: { api: "ICREMO15", nome: "Cremolino", sovrastima: "no" },
  IMORSA15: { api: "IMORSA15", nome: "Morsasco", sovrastima: "no" },
  IMERAN2: { api: "IMERAN2", nome: "Merana", sovrastima: "no" },
  IVISON6: { api: "IVISON6", nome: "Visone", sovrastima: "no" },
  IORSAR1: { api: "IORSAR1", nome: "San Quirico", sovrastima: "no" },
  IACQUI20: { api: "IACQUI20", nome: "Barbato", sovrastima: "no" },
  IRICAL1: { api: "IRICAL1", nome: "Alice Bel Colle", sovrastima: "no" },
  IGAMAL1: { api: "IGAMAL1", nome: "Gamalero", sovrastima: "no" },
  INOVIL39: { api: "INOVIL39", nome: "Pasturana", sovrastima: "no" },
  ICASSA8: { api: "ICASSA8", nome: "Cassano Spinola", sovrastima: "no" },
  ICASSA19: { api: "ICASSA19", nome: "Sardigliano", sovrastima: "no" },
  IVILLA1686: { api: "IVILLA1686", nome: "Villalvernia", sovrastima: "no" },
  ISPINE11: { api: "ISPINE11", nome: "Spineto Scrivia", sovrastima: "no" },
  ICAREZ1: { api: "ICAREZ1", nome: "Carezzano", sovrastima: "no" },
  ISAREZ2: { api: "ISAREZ2", nome: "Sarezzano", sovrastima: "no" },
  IMONGI5: { api: "IMONGI5", nome: "Mongiardino Ligure", sovrastima: "no" },
  IFABBR5: { api: "IFABBR5", nome: "Selvapiana", sovrastima: "no" },
  IDERNI2: { api: "IDERNI2", nome: "Dernice", sovrastima: "no" },
  ICANTA74: { api: "ICANTA74", nome: "Cantalupo Ligure", sovrastima: "no" },
  IBORGH41: { api: "IBORGH41", nome: "Borghetto di Borbera", sovrastima: "no" },
  IPIETR9: { api: "IPIETR9", nome: "Pietra Marazzi", sovrastima: "no" },
  IVALEN231: { api: "IVALEN231", nome: "Valenza", sovrastima: "no" },
  IALESS22: { api: "IALESS22", nome: "Valmadonna", sovrastima: "no" },
  ICASALEM1135: { api: "ICASALEM1135", nome: "Casale Monferrato Aeroporto", sovrastima: "no" },
  ICASAL100: { api: "ICASAL100", nome: "Casale Monferrato", sovrastima: "no" },
  ISOLON8: { api: "ISOLON8", nome: "Solonghello", sovrastima: "no" },
  IMOMBE4: { api: "IMOMBE4", nome: "Mombello Monferrato", sovrastima: "no" },
  IVILLA493: { api: "IVILLA493", nome: "Mezzalfenga di Sopra", sovrastima: "no" },
  IFUBIN1: { api: "IFUBIN1", nome: "Fubine Monferrato", sovrastima: "no" },
  IALTAV9: { api: "IALTAV9", nome: "Altavilla Monferrato", sovrastima: "no" },
  IOTTIG17: { api: "IOTTIG17", nome: "Ottiglio", sovrastima: "no" },
  IPONZA11: { api: "IPONZA11", nome: "Ponzano Monferrato", sovrastima: "no" },
  ICAMAG1: { api: "ICAMAG1", nome: "Camagna Monferrato", sovrastima: "no" },
  ISESSA22: { api: "ISESSA22", nome: "Sessame", sovrastima: "no" },
  IBUBBI1: { api: "IBUBBI1", nome: "Bubbio", sovrastima: "no" },
  ICESSO17: { api: "ICESSO17", nome: "Cessole", sovrastima: "no" },
  ICASSI26: { api: "ICASSI26", nome: "Cassinasco", sovrastima: "no" },
  ISANPA4: { api: "ISANPA4", nome: "San Paolo Solbrito", sovrastima: "no" },
  IROATT2: { api: "IROATT2", nome: "Pangeri", sovrastima: "no" },
  IVILLA1877: { api: "IVILLA1877", nome: "Villanova Stazione", sovrastima: "no" },
  IPIEMONT238: { api: "IPIEMONT238", nome: "Cortadone", sovrastima: "no" },
  ISETTI19: { api: "ISETTI19", nome: "Settime", sovrastima: "no" },
  IVILLA1125: { api: "IVILLA1125", nome: "San Carlo", sovrastima: "no" },
  IASTI56: { api: "IASTI56", nome: "Asti", sovrastima: "no" },
  IASTI24: { api: "IASTI24", nome: "Silva", sovrastima: "no" },
  IGRANA142: { api: "IGRANA142", nome: "Grana Monferrato", sovrastima: "no" },
  ICALLI89: { api: "ICALLI89", nome: "Calliano Monferrato", sovrastima: "no" },
  ICALLI66: { api: "ICALLI66", nome: "Perrona", sovrastima: "no" },
  IGRAZZ2: { api: "IGRAZZ2", nome: "Grazzano Badoglio", sovrastima: "no" },
  INIZZA8: { api: "INIZZA8", nome: "Nizza Monferrato", sovrastima: "no" },
  ICASTE229: { api: "ICASTE229", nome: "Castelnuovo Belbo", sovrastima: "no" },
  IVINCH1: { api: "IVINCH1", nome: "Vinchio", sovrastima: "no" },
  IAGLIA8: { api: "IAGLIA8", nome: "Agliano", sovrastima: "no" },
  IMONTE1010: { api: "IMONTE1010", nome: "Montegrosso d'Asti", sovrastima: "no" },
  IISOLA28: { api: "IISOLA28", nome: "Isola d'Asti", sovrastima: "no" },
  IASTI59: { api: "IASTI59", nome: "Perella", sovrastima: "no" },
  ICANEL6: { api: "ICANEL6", nome: "Canelli", sovrastima: "no" },
  ICASTE241: { api: "ICASTE241", nome: "Castel Boglione", sovrastima: "no" },
  ICOSTI18: { api: "ICOSTI18", nome: "Costigliole d'Asti Aviosuperficie", sovrastima: "no" },
  ISANMA94: { api: "ISANMA94", nome: "San Martino Alfieri", sovrastima: "no" },
  ISANDA45: { api: "ISANDA45", nome: "Valdoisa", sovrastima: "no" },
  ISANDA36: { api: "ISANDA36", nome: "Remondini", sovrastima: "no" },
  IBUTTI12: { api: "IBUTTI12", nome: "Buttigliera D'Asti", sovrastima: "no" },
  IPIEA6: { api: "IPIEA6", nome: "Piea", sovrastima: "no" },
  IARAME1: { api: "IARAME1", nome: "Gonengo", sovrastima: "no" },
  ITONEN1: { api: "ITONEN1", nome: "Tonengo", sovrastima: "no" },
  IBROZO1: { api: "IBROZO1", nome: "Brozolo", sovrastima: "no" },};
const stationsComuneGE ={}
const stationsPwsGenova = {};
const stationsIgnorete = {};
const PwsProvinceMap = {
  genova: ["Genova S.Tecla"]
};
//----------------------------------------------------- PROVINCIE OMIRL
const omirlProvinceMap = {
  genova: ["CFUNZ", "SCIAR", "LERCA", "TRRIG", "TOGAR", "SEGIA", "BRUGN", "BRGEL", "LOCOC", "ROVEG", "AGORR", "PREMA", "GEQUE", "RIGHI", "GEBOL", "MGAZZ", "GEPEG", "MADGR", "MOPEN", "FIORI", "MELEE", "PTURC", "PRAIC", "CAMPL", "ROSGL", "ISOVE", "GEPTX", "VREGI", "MIGNA", "MTECA", "BUSAL", "TANOR", "CRCFI", "AVOBB", "VBGOR", "MONTG", "FALLA", "DAVAG", "SALBE", "VIGAN", "FFRES", "CRETO", "VICOM", "CRORE", "OGNIO", "STILA", "CAMOG", "MTPOR", "SMARG", "RAPAL", "PRTTI", "ORERO", "CCHER", "CHIRI", "CAVIP", "SLEVA", "TASNI", "BARGO", "STALE", "REPPI", "BRZON", "GIACO", "LGIAC", "PRMLO", "CABAN", "AMBOR", "SSTAV", "MTMEZ", "PDVRM", "PIGNO", "RICCO", "LFMTV", "SPZIA", "FABIA", "PVENE", "MROCC", "MARIN", "LUNIS", "CSMAM", "SRZAN", "CRNLO", "SPZIW", "CCORM", "CASON", "CUCCA", "TAGLT", "SCURT", "VALIG", "CEMBR", "TAVRN", "CARRO", "SZIGN", "SEGOD", "SMVAR", "MATRA", "FRAMU", "LVTSG", "LEVAN", "MROSS", "URVAS", "PIAMP", "SASSL", "SSGIU", "STBUR", "ALPIC", "MNINF", "DEGIR", "CAIRM", "VALZE", "MURIA", "OSIGL", "MLARE", "CCADB", "ELLRA", "SANDA", "BOLSN", "LAVAG", "INASV", "MONTA", "CALIZ", "MSETT", "CMELO", "CALGR", "MANIE", "VERZI", "CLARI", "CARPG", "CASRB", "CENES", "ISBLL", "MOBRA", "ALTOM", "ALASS", "ONZPO", "TESTI", "CONNA", "BOACM", "FERRA", "SANTU"],
  savona: [],
  imperia: [],
  la_spezia: [],
  massa_carrara: []
};
//----------------------------------------------------- CONTENITORE STAZIONI
const stationToProvince = {};
//----------------------------------------------------- 
Object.entries(omirlProvinceMap).forEach(([prov, list]) => {
  list.forEach(code => {
    stationToProvince[code] = prov;
  });
});

Object.entries(PwsProvinceMap).forEach(([prov, list]) => {
  list.forEach(code => {
    stationToProvince[code] = prov;
  });
});

    const stations = {
};
const stationsOMIRL = {}; // qui salviamo tutte le stazioni OMIRL
const stationsNetAtmo = {};
const stations3R = {};
const stationsLimet = {};

const stations1 = {
};
const stations3 = {
};
const stations2 = {
};
const stationsDMA =  {
};
const stationsSavona = {
};
const stationsCML = {};
const stationsMeteoTortona =  {
}
//---------------------------------------------------------------------------- CREA MARKER E LATEST DATA
const markers = {};
let latestData = {};
let autoShow = false;

//---------------------------------------------------------------------------- COLORI
// ----- Colori Umidità -----
function getColorHum(hum) {
  if (hum >= 90.0) return "#0114F0"; 
  if (hum >= 80.0) return "#0060F0"; 
  if (hum >= 70.0) return "#00BDEF"; 
  if (hum >= 60.0) return "#21C2C5"; 
  if (hum >= 50.0) return "#21C573"; 
  if (hum >= 40.0) return "#3AA300"; 
  if (hum >= 30.0) return "#F0B800"; 
  if (hum >= 20.0) return "#F0CB00";
  if (hum >= 10.0) return "#F07D00";
  return "#F01E00"; 
}

// ----- Colori Pioggia -----
function getColorRain(rain) {
  if (rain >= 150.0) return "#843BEB"; 
  if (rain >= 100.0) return "#FF69B4";
  if (rain >= 50.0) return "#0038F0";
  if (rain >= 30.0) return "#4682B4"; 
  if (rain >= 20.0) return "#87CEEB";
  if (rain >= 10.0) return "#3AA300";
  if (rain >= 5.0) return "#006400";
  if (rain >= 0.2) return "#F09F00";
  return "#808080"; 
}

// ----- Colori Temperatura -----
function getColorTemp(temp) {
  if (temp >= 38.0) return "#843BEB";
  if (temp >= 35.0) return "#FF69B4";
  if (temp >= 30.0) return "#8B0000";
  if (temp >= 25.0) return "#FF0000";
  if (temp >= 20.0) return "#E67D00";
  if (temp >= 15.0) return "#E6B800";
  if (temp >= 11.0) return "#3AA300";
  if (temp >= 5.0) return "#006400";
  if (temp >= 0.0) return "#87CEEB";
  if (temp >= -5.0) return "#4682B4";
  if (temp >= -10.0) return "#0000FF";
  return "#191970";
}
//---------------------------------------------------------------------------- FUNZIONE PER IL VENTO
function getColorWindDir(deg) {
  if (deg >= 0 && deg <= 360) return "#4682B4";
  return "#191970";
}

//---------------------------------------------------------------------------- CERCA IL META DELLA STAZIONE
function getStationMeta(id) {

  const maps = {
    stations,
    stationsOMIRL,
    stationsGenova,
    stationsAlessandria,
    stationsPwsGenova,
    stationsDMA,
    stationsCML,
    stationsLimet,
    stationsIgnorete,
    stationsComuneGE,
  };

//---------------------------------------------------------------------------- FONTE

  const defaultSource = {
    stationsAsti: 'Asti',
    stationsOMIRL: 'OMIRL',
    stationsGenova: 'Genova',
    stationsPwsGenova: 'PWS',
    stationsAlessandria: 'Alessandria',
    stationsCML: 'CML',
    stationsSavona: 'Savona',
    stationsLimet: 'Limet',
    stationsIgnorete: 'Ignorete',
    stationsDMA: 'DMA',
    stationsComuneGE: 'Comune'
  };

  for (const key of Object.keys(maps)) {

    const map = maps[key];
    if (!map) continue;

    const meta = map[id];

    if (meta) {

      const source = meta.source || defaultSource[key] || 'unknown';

      const name =
        meta.name ||
        meta.NOME ||
        meta.denominazione ||
        meta.DENOMINAZIONE ||
        meta.slug ||
        id;

      return { source, name, meta };
    }
  }

  // fallback
  return { source: 'unknown', name: id, meta: null };
}

//---------------------------------------------------------------------------- CREA MARKER

function createMarker(id, lat = 44.423, lon = 8.972) {

  const scale = Math.min(window.innerWidth / 1200, 1);
  const size = 20 * scale;

  const icon = L.divIcon({
    className: '',
    html: `<div class="circle-label2"
                 style="
                   width:${size}px;
                   height:${size}px;
                   border-radius:50%;
                   background-color:#808080;
                   border:1px solid #fff;
                 ">
           </div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2]
  });

  const marker = L.marker([lat, lon], { icon });

  markers[id] = marker;

  marker.bindPopup(`<b>Stazione:</b> ${id}<br>⚠️ Offline`);

  markers[id] = marker;
}

// Aggiorna dimensione marker su resize

window.addEventListener("resize", () => {

  Object.keys(markers).forEach(id => {

    const m = markers[id];
    const latlng = m.getLatLng();

    map.removeLayer(m);
    createMarker(id, latlng.lat, latlng.lng);
  });
});

//---------------------------------------------------------------------------- CONVERSIONE VENTO IN GRADI

function degToDir(deg) {

  if (deg == null) return "N/D";

  const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];

  return dirs[Math.floor(((deg + 22.5) % 360) / 45)];
}

//---------------------------------------------------------------------------- AGGIORNA MARKER

function updateMarker(id) {

  const type = document.getElementById("tempSelect").value;
  const data = latestData[id];

  if (!data) return;

  let value = null;
  let color = null;

  // Valore e colore in base al tipo

  if (type === "winddirection") {

    value = data.windDir;
    color = data.windGust != null ? getColorRain(data.windGust) : "#808080";

  } else {

    switch (type) {

      case "current": value = data.temp; color = getColorTemp(value); break;
      case "max": value = data.tempHigh; color = getColorTemp(value); break;
      case "min": value = data.tempLow; color = getColorTemp(value); break;

      case "dewpt": value = data.dewp; color = getColorTemp(value); break;
      case "dewpMax": value = data.dewpHigh; color = getColorTemp(value); break;
      case "dewpMin": value = data.dewpLow; color = getColorTemp(value); break;

      case "Heat": value = data.heat; color = getColorTemp(value); break;
      case "HeatMax": value = data.heatHigh; color = getColorTemp(value); break;
      case "HeatMin": value = data.heatLow; color = getColorTemp(value); break;

      case "hum": value = data.hum; color = getColorHum(value); break;
      case "humMax": value = data.humHigh; color = getColorHum(value); break;
      case "humMin": value = data.humLow; color = getColorHum(value); break;

      case "rainDay": value = data.rainDaily; color = getColorRain(value); break;
      case "rainRate": value = data.rainRate; color = getColorRain(value); break;

      case "wind": value = data.wind; color = getColorRain(value); break;
      case "windGust": value = data.windGust; color = getColorRain(value); break;
      case "windGustMax": value = data.windGustHigh; color = getColorRain(value); break;

      default: value = null; color = null;
    }
  }

  const icon = value != null
    ? L.divIcon({
        className: '',
        html: `<div class="circle-label"
          style="background-color:${color}; border:2px solid white;">
          ${(value != null && !isNaN(value)) ? value.toFixed(1) : ""}
        </div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      })
    : L.divIcon({
        className: '',
        html: `<div class="circle-label"
          style="background-color:#808080;
                 width:12px;
                 height:12px;
                 border-radius:50%;"></div>`,
        iconSize: [12, 12],
        iconAnchor: [6, 6]
      });

  if (!markers[id]) {
    markers[id] = L.marker([data.lat, data.lon], { icon });
  } else {
    markers[id].setIcon(icon);
  }

//---------------------------------------------------------------------------- POPUP AGGIORNATO

  const meta = getStationMeta(id) || {};

  const stationSource = data.source || meta.source || "unknown";

  const stationName =
    data.name ||
    meta.name ||
    meta.NOME ||
    meta.denominazione ||
    id;

  let popupContent = `<b>Stazione:</b> ${stationName}<br>`;
  popupContent += `<b>Fonte:</b> ${stationSource}<br>`;

  popupContent += `🌡️ Temp: ${data.temp != null ? data.temp.toFixed(1) + " °C" : "N/D"}<br>`;
  popupContent += `💧 UR: ${data.hum != null ? data.hum.toFixed(0) + " %" : "N/D"}<br>`;
  popupContent += `🌧️ Pioggia 24h: ${data.rainDaily != null ? data.rainDaily.toFixed(1) + " mm" : "0 mm"}<br>`;
  popupContent += `💨 Vento: ${data.wind != null ? data.wind.toFixed(1) + " km/h" : "N/D"}<br>`;
  popupContent += `🌬️ Raffica: ${data.windGust != null ? data.windGust.toFixed(1) + " km/h" : "N/D"}<br>`;
  popupContent += `🧭 Direzione: ${data.windDir != null ? degToDir(data.windDir) + " (" + data.windDir.toFixed(0) + "°)" : "N/D"}<br>`;
  popupContent += `💧 Dew Point: ${data.dewp != null ? data.dewp.toFixed(1) + " °C" : "N/D"}<br>`;
const gaugesUrl =
  `${window.location.origin}/gauges.html#station=${encodeURIComponent(id)}&source=${encodeURIComponent(stationSource)}&name=${encodeURIComponent(stationName)}`;
  popupContent += `<button type="button" onclick="window.open('${gaugesUrl}', 'gaugesWindow')">📊 Gauges</button>`;

  markers[id].bindPopup(popupContent);

  if (data.lat && data.lon) {
    markers[id].setLatLng([data.lat, data.lon]);
  }
}
function openGauges(stationId) {
  window.open(`gauges.html?station=${stationId}`, "_blank", "width=420,height=600");
}

// ----- Filtro Marker -----
function filterMarkersBySource() {
  const checked = Array.from(document.querySelectorAll('.sourceFilter:checked')).map(cb => cb.value);
  Object.keys(markers).forEach(id => {
    const meta = getStationMeta(id);
    if (!meta) return;
    const source = meta.source;
    if (checked.includes(source)) {
      markers[id].addTo(map);
    } else {
      map.removeLayer(markers[id]);
    }
  });
}

document.querySelectorAll('.sourceFilter').forEach(cb => {
  cb.addEventListener('change', filterMarkersBySource);
});

//---------------------------------------------------------------------------- FILTRO MARKER
const sourceGroups = {
  alessandria: ["alessandria", "dma", "wunderground"],
  genova: ["genova", "comune", "aeris_genova", "pws", "ignorete", "limet"],
  omirl: ["omirl"],
  cml: ["cml"],
  savona: ["savona"]
};
function filterMarkersBySource() {

  const checked = Array.from(
    document.querySelectorAll('.sourceFilter:checked')
  ).map(cb => cb.value.toLowerCase());

  Object.keys(markers).forEach(id => {

    const marker = markers[id];
    const data = latestData[id];

    if (!marker || !data) return;

    let source = (data.source || "").toLowerCase();

    // =========================
    // OMIRL → provincia
    // =========================
    if (source === "omirl") {
      const provincia = stationToProvince[id.trim()];
      if (provincia) source = provincia.toLowerCase();
    }

    // =========================
    // NORMALIZZAZIONE AREE SPECIALI
    // =========================
    if (source === "dma") {
      source = "alessandria";
    }

    if (source === "wunderground") {
      // se ancora presente in vecchi dati
      if (stationsAlessandria?.[id]) source = "alessandria";
      if (stationsGenova?.[id]) source = "genova";
    }

    // =========================
    // MATCH SU GRUPPI
    // =========================
    let shouldShow = false;

    for (const group of checked) {

      const allowedSources = sourceGroups[group] || [group];

      if (allowedSources.includes(source)) {
        shouldShow = true;
        break;
      }
    }

    if (shouldShow) {
      if (!map.hasLayer(marker)) marker.addTo(map);
    } else {
      if (map.hasLayer(marker)) map.removeLayer(marker);
    }
  });
}

//=========================
// EVENTI CHECKBOX
//=========================

document.querySelectorAll(".sourceFilter").forEach(cb => {
  cb.addEventListener("change", filterMarkersBySource);
});

document.querySelectorAll('.sourceFilter').forEach(cb => {
  cb.addEventListener('change', filterMarkersBySource);
});
//---------------------------------------------------------------------------- FETCH OMIRL
const fetchOMIRL = async () => {
  try {

    const res = await fetch(
      "https://api-stazioni-meteo.eggittof.workers.dev/omirl.json"
    );

    const data = await res.json();
    if (!data?.stations) return;

    data.stations.forEach((st) => {

      const id = st.id;

      const lat = st.lat;
      const lon = st.lon;

      latestData[id] = {
        source: "OMIRL",

        temp: st.temp,
        tempHigh: st.tempHigh,
        tempLow: st.tempLow,

        hum: st.hum,
        humHigh: st.humHigh,
        humLow: st.humLow,

        wind: st.wind,
        windGust: st.windGust,

        rainDaily: st.rainDaily,
        rainRate: st.rainRate,

        lat,
        lon
      };

      // marker
      if (!markers[id] && lat && lon) {
        createMarker(id, lat, lon);
      }

      updateMarker(id);
    });

  } catch (err) {
    console.error("Errore fetch OMIRL:", err);
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

      const lat = st.lat;
      const lon = st.lon;

      latestData[id] = {

        source: "Comune",

        temp: st.T,
        tempHigh: st.TH,
        tempLow: st.TL,

        hum: st.H,
        humHigh: st.HH,
        humLow: st.HL,

        wind: st.W,
        windDir: st.WD,
        windGust: st.WH,

        rainDaily: st.R,

        dewp: st.D,
        dewpHigh: st.DH,
        dewpLow: st.DL,

        lat,
        lon
      };

      // marker
      if (!markers[id] && lat && lon) {
        createMarker(id, lat, lon);
      }

      updateMarker(id);
    });

    filterMarkersBySource();

  } catch (err) {

    console.error("Errore fetch Comune di Genova:", err);
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

      const lat = st.lat;
      const lon = st.lon;

      latestData[id] = {

        source: "IGNORETE",

        temp: st.T,
        tempHigh: st.TH,
        tempLow: st.TL,

        hum: st.H,

        wind: st.V,
        windGust: st.VR,
        windDir: st.VD,

        rainDaily: st.R,
        rainRate: st.RR,

        dewp: st.D,

        lat,
        lon
      };

      // marker
      if (!markers[id] && lat && lon) {
        createMarker(id, lat, lon);
      }

      updateMarker(id);
    });

    filterMarkersBySource();

  } catch (err) {

    console.error("Errore fetch IGNORETE:", err);
  }
};
async function fetchCML() {
  try {
    console.log("🔥 fetchCML START");

    const url = "https://api-stazioni-meteo.eggittof.workers.dev/cml.json";
    console.log("🌐 fetching:", url);

    const res = await fetch(url);
    console.log("📡 status:", res.status);

    const data = await res.json();

    if (!Array.isArray(data)) {
      console.error("❌ CML non è array:", data);
      return;
    }

    console.log("📦 stations received:", data.length);

    const timestamp = data[0]?.timestamp || new Date().toISOString();

    // salta la prima riga (timestamp)
    const stations = data.slice(1);

    stations.forEach((st, i) => {
      try {
        const id = (st.N || "UNKNOWN").replace(/\s+/g, "_");

        const lat = Number(st.LAT);
        const lon = Number(st.LON);

        const temp = parseFloat(st.T);
        const tempHigh = parseFloat(st.TH);
        const tempLow = parseFloat(st.TL);
        const hum = parseFloat(st.H);

        const wind = parseFloat(st.V);
        const windGust = parseFloat(st.G);

        const rainDaily = parseFloat(st.R);
        const rainRate = parseFloat(st.RR);

        latestData[id] = {
          source: "CML",
          temp: isNaN(temp) ? null : temp,
          tempHigh: isNaN(tempHigh) ? null : tempHigh,
          tempLow: isNaN(tempLow) ? null : tempLow,
          hum: isNaN(hum) ? null : hum,
          wind: isNaN(wind) ? null : wind,
          windGust: isNaN(windGust) ? null : windGust,
          rainDaily: isNaN(rainDaily) ? null : rainDaily,
          rainRate: isNaN(rainRate) ? null : rainRate,
          lat,
          lon,
          time: timestamp
        };


        if (!markers[id] && lat && lon) {
          createMarker(id, lat, lon);
        }

        updateMarker(id);

      } catch (err) {
        console.error("❌ station parse error:", err, st);
      }
    });

  } catch (err) {
    console.error("❌ fetchCML FAILED:", err);
  }
}


// =========================
// FETCH LIMET
// =========================

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

      const lat = st.LAT;
      const lon = st.LON;

      latestData[id] = {

        source: "LIMET",

        temp: st.T,
        tempHigh: st.TH,
        tempLow: st.TL,

        hum: st.H,
        humHigh: st.HH,
        humLow: st.HL,

        wind: st.V,
        windGust: st.VR,

        rainDaily: st.R,
        rainRate: st.RR,

        dewp: st.D,
        dewpHigh: st.DH,
        dewpLow: st.DL,

        heatIndex: st.HI,

        pressure: st.P,

        lat,
        lon,

        time: st.TIME
      };

      // marker
      if (!markers[id] && lat && lon) {
        createMarker(id, lat, lon);
      }

      updateMarker(id);
    });

    filterMarkersBySource();

  } catch (err) {

    console.error("Errore fetch LIMET:", err);
  }
};
const sleep = (ms) => new Promise(res => setTimeout(res, ms));

const fetchDMA = async () => {

  try {

    const urls = [
      "https://api-stazioni-meteo.eggittof.workers.dev/asti-test.json",
      "https://api-stazioni-meteo.eggittof.workers.dev/dma2.json",
      "https://api-stazioni-meteo.eggittof.workers.dev/dma3.json",
      "https://api-stazioni-meteo.eggittof.workers.dev/dma4.json"
    ];

    const allStations = [];

    for (const url of urls) {

      try {

        const res = await fetch(url);
        const data = await res.json();

        if (data?.stations?.length) {
          allStations.push(...data.stations);
        }

      } catch (err) {
        console.warn("DMA fetch error:", url, err);
      }

      // 🔥 pausa 500ms tra i fetch
      await sleep(50);
    }

    allStations.forEach((st) => {

      const id = st.id;

      const lat = st.lat;
      const lon = st.lon;

      if (!id) return;

      latestData[id] = {
        source: "DMA",

        temp: st.T,
        tempHigh: null,
        tempLow: null,

        hum: st.H,

        wind: st.V,
        windGust: st.G,

        rainDaily: st.R,
        rainRate: st.RR,

        dewp: st.D,

        heatIndex: st.HI,

        pressure: st.P,

        lat,
        lon,

        time: st.timestamp
      };

      // marker creation
      if (!markers[id] && lat != null && lon != null) {
        createMarker(id, lat, lon);
      }

      updateMarker(id);
    });

    filterMarkersBySource();

  } catch (err) {
    console.error("Errore fetch DMA:", err);
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

      latestData[id] = {
        source: "AERIS_GENOVA",

        // temperatura
        temp: st.T,
        tempHigh: st.TH,
        tempLow: st.TL,

        // dewpoint
        dewp: st.D,
        dewHigh: st.DH,
        dewLow: st.DL,

        // heat index
        heatIndex: st.HI,
        heatIndexHigh: st.HIH,
        heatIndexLow: st.HIL,

        // umidità
        hum: st.H,
        humHigh: st.HH,
        humLow: st.HL,

        // pressione
        pressure: st.P,
        pressureHigh: st.PH,
        pressureLow: st.PL,

        // vento
        wind: st.V,
        windHigh: st.VH,
        windLow: st.VL,

        // raffica
        windGust: st.G,
        windGustHigh: st.GH,

        // direzione
        windDir: st.WD,

        // precipitazioni
        rainDaily: st.R,
        rainRate: st.RR,

        // radiazione
        rad: st.RAD,
        radHigh: st.RADH,
        radLow: st.RADL,

        lat: st.lat,
        lon: st.lon,

        time: st.timestamp
      };

      if (!markers[id] && st.lat && st.lon) {
        console.log("➕ create marker:", id);
        createMarker(id, st.lat, st.lon);
      }

      updateMarker(id);

    });

    console.log("✅ AERIS DONE");

  } catch (err) {

    console.error("❌ fetchAeris error:", err);

  }
}
//---------------------------------------------------------------------------- FETCH PWS
    async function fetchPws(id) {
  try {
    // 🔥 prendi la stazione da QUALSIASI sorgente
    const meta = getStationMeta(id);

    if (!meta || !meta.meta || !meta.meta.api) {
      console.warn("Stazione non valida o senza API:", id);
      return;
    }

    const stationApi = meta.meta.api;

    // ----- CURRENT -----
    const urlCurrent =
      `https://api.weather.com/v2/pws/observations/current` +
      `?apiKey=${apiKey}&stationId=${stationApi}` +
      `&numericPrecision=decimal&format=json&units=m`;

    const resCurrent = await fetch(urlCurrent);
    const dataCurrent = await resCurrent.json();

    const obs = dataCurrent?.observations?.[0];

    if (!obs) {
      console.warn("Nessuna osservazione per:", id);
      return;
    }

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
    const altitude = obs.metric?.elev ?? null;
    const windDir = obs?.winddir ?? null;

    // ----- DAILY -----
    const urlDaily =
      `https://api.weather.com/v2/pws/dailysummary/1day` +
      `?apiKey=${apiKey}&stationId=${stationApi}` +
      `&numericPrecision=decimal&format=json&units=m`;

    const resDaily = await fetch(urlDaily);
    const dataDaily = await resDaily.json();

    const summary = dataDaily?.summaries?.[0]?.metric ?? null;

    const tempHigh = summary?.tempHigh ?? null;
    const tempLow = summary?.tempLow ?? null;

    const dewpHigh = summary?.dewptHigh ?? null;
    const dewpLow = summary?.dewptLow ?? null;

    const heatHigh = summary?.heatindexHigh ?? null;
    const heatLow = summary?.heatindexLow ?? null;

    const humHigh = dataDaily?.summaries?.[0]?.humidityHigh ?? null;
    const humLow = dataDaily?.summaries?.[0]?.humidityLow ?? null;

    const windGustHigh = summary?.windgustHigh ?? null;

    const source = meta.source || "Wunderground";

    // ----- salva dati globali -----
    latestData[id] = {
      source,
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
      lon,
      altitude
    };

    updateMarker(id);
filterMarkersBySource();

  } catch (err) {
    console.error(`Errore fetch dati ${id}:`, err);
  }
}



const stationsTorinoMeteo = {};


//---------------------------------------------------------------------------- INIZIALIZZA MARKER

Object.keys(stations).forEach(id => createMarker(id));
Object.keys(stationsGenova).forEach(id => createMarker(id));
Object.keys(stationsAlessandria).forEach(id => createMarker(id));
Object.keys(stationsCML).forEach(id => createMarker(id));
Object.keys(stationsPwsGenova).forEach(id => createMarker(id));
Object.keys(stationsIgnorete).forEach(id => createMarker(id));
Object.keys(stationsDMA).forEach(id => createMarker(id));
Object.keys(stationsComuneGE).forEach(id => createMarker(id));


//---------------------------------------------------------------------------- FETCH INIZIALE MINIMO



//---------------------------------------------------------------------------- UTIL

function getActiveGroups() {
  return Array.from(
    document.querySelectorAll(".sourceFilter:checked")
  ).map(cb => cb.value.toLowerCase());
}
const groupLastFetch = {};
const FETCH_COOLDOWN = 10 * 60 * 1000; // 10 minuti
function canFetch(group) {

  const now = Date.now();

  const last = groupLastFetch[group] || 0;

  return (now - last) > FETCH_COOLDOWN;
}

//---------------------------------------------------------------------------- MAPPA GRUPPI → FETCH

const groupFetchMap = {

  omirl: fetchOMIRL,

  genova: () => {
    fetchPWSGenova();
    fetchLimet();
    fetchIgnorete();
    fetchComuneGenova();
    fetchOMIRL();
    Object.keys(stationsGenova).forEach(id => fetchPws(id));
  },

  alessandria: () => {
    fetchDMA();

    Object.keys(stationsAlessandria).forEach(id => fetchPws(id));
    Object.keys(stationsAsti).forEach(id => fetchPws(id));
  },

  cml: () => {
    fetchCML();
  },
};


//---------------------------------------------------------------------------- RELOAD INTELLIGENTE

function reloadAllStations() {

  const activeGroups = getActiveGroups();

  if (activeGroups.length === 0) return;

  activeGroups.forEach(group => {

    const fn = groupFetchMap[group];

    if (!fn) return;

    if (canFetch(group)) {

      fn();

      groupLastFetch[group] = Date.now();
    }
  });
}
function forceReloadAllStations() {

  const activeGroups = getActiveGroups();

  if (activeGroups.length === 0) return;

  activeGroups.forEach(group => {

    const fn = groupFetchMap[group];

    if (fn) fn();
  });
}

//---------------------------------------------------------------------------- CHECKBOX EVENT

document.querySelectorAll(".sourceFilter").forEach(cb => {

  cb.addEventListener("change", (e) => {

    const group = e.target.value.toLowerCase();
    const fn = groupFetchMap[group];
    const isChecked = e.target.checked;

    if (isChecked && fn) {

      // 🔥 cooldown check
      if (canFetch(group)) {

        fn();

        groupLastFetch[group] = Date.now();

      } else {
        console.log(`⏳ ${group} aggiornato da poco, skip fetch`);
      }
    }

    filterMarkersBySource();
  });
});


//---------------------------------------------------------------------------- AUTO REFRESH

setInterval(() => {

  reloadAllStations();

}, 600000);


//---------------------------------------------------------------------------- CAMBIO TIPO VALORE

document.getElementById("tempSelect").addEventListener("change", () => {

  Object.keys(markers).forEach(id => updateMarker(id));
});


//---------------------------------------------------------------------------- FILTRO (già esistente)

filterMarkersBySource();


<!-- BUTTON RELOAD -->
</script>
<button id="reloadBtn">Aggiorna</button>

<style>
#reloadBtn {
  position: fixed;
  bottom: 15px;
  left: 15px;
  z-index: 9999;

  padding: 8px 14px;

  background: white;
  color: black;

  border: 1px solid #ccc;
  border-radius: 8px;

  cursor: pointer;
  font-weight: bold;

  box-shadow: 0 2px 6px rgba(0,0,0,0.2);

  transition: 0.2s;
}

#reloadBtn:hover {
  background: #f0f0f0;
}
</style>
<script>
//---------------------------------------------------------------------------- BUTTON RELOAD
let lastReloadBtn = 0;
const BTN_COOLDOWN = 5000;

document.getElementById("reloadBtn").addEventListener("click", () => {

  const now = Date.now();

  if (now - lastReloadBtn < BTN_COOLDOWN) {
    console.log("Aspetta 5 secondi");
    return;
  }

  lastReloadBtn = now;

  // 🔥 forza aggiornamento
  forceReloadAllStations();
});

// avvio iniziale
reloadAllStations();
</script>
</body>
</html>