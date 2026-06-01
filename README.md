function updateMarker(id) {

  const d = latestData[id];
  const m = markers[id];

  if (!d || !m) return;

  const el = m.getElement();

  const variable = currentVariable;
  const mode = modes[variable];

  // =========================
  // GET VALUE (current/max/min)
  // =========================
  const get = (base) => {
    if (mode === "current") return d[base] ?? null;
    if (mode === "max") return d[base + "High"] ?? null;
    if (mode === "min") return d[base + "Low"] ?? null;
    return null;
  };

  let value = null;
  let temp = null;

  if (variable === "temp") {
    value = get("temp");
    temp = value;
  }

  if (variable === "hum") {
    value = get("hum");
    temp = value;
  }

  if (variable === "dewp") {
    value = get("dewp");
    temp = value;
  }

  if (variable === "heat") {
    value = get("heat");
    temp = value;
  }
if (variable === "rainDaily") {
  value = d.rainDaily ?? null;
  temp = value;
}

if (variable === "rainRate") {
  value = d.rainRate ?? null;
  temp = value;
}
  // =========================
  // COLOR SCALE
  // =========================
  let color = "#808080";

  if (temp != null) {

    if (variable === "hum") {

      if (temp < 20) color = "#b44141";
      else if (temp < 30) color = "#ff6262";
      else if (temp < 40) color = "#ff9d56";
      else if (temp < 50) color = "#f1d800";
      else if (temp < 60) color = "#65d050";
      else if (temp < 70) color = "#6ca561";
      else if (temp < 80) color = "#4dc8ff";
      else if (temp < 90) color = "#4da9ff";
      else color = "#4d54ff";

    } else if (variable === "rainDaily" || variable === "rainRate") {

  if (temp === 0) color = "#808080";
  else if (temp < 1) color = "#7edee6";
  else if (temp < 2) color = "#61b6ea";
  else if (temp < 5) color = "#4a7be4";
  else if (temp < 10) color = "#6ca561";
  else if (temp < 20) color = "#65d050";
  else if (temp < 30) color = "#4dc8ff";
  else if (temp < 50) color = "#4da9ff";
  else if (temp < 75) color = "#4d54ff";
  else if (temp < 100) color = "#2c278e";
  else if (temp < 150) color = "#f54dff";
  else if (temp < 200) color = "#c65bff";
  else if (temp < 300) color = "#9d8cac";
  else if (temp < 400) color = "#8f8e91";
  else if (temp < 500) color = "#606060";
  else color = "#2c2c2c";

} else {

      if (temp < -20) color = "#9d8cac";
      else if (temp < -15) color = "#f54dff";
      else if (temp < -10) color = "#c65bff";
      else if (temp < -5) color = "#4d54ff";
      else if (temp < 0) color = "#4da9ff";
      else if (temp < 5) color = "#4dc8ff";
      else if (temp < 10) color = "#6ca561";
      else if (temp < 15) color = "#65d050";
      else if (temp < 20) color = "#ffd800";
      else if (temp < 25) color = "#ff9d56";
      else if (temp < 30) color = "#ff6262";
      else if (temp < 35) color = "#b44141";
      else if (temp < 38) color = "#d963c3";
      else if (temp < 40) color = "#f54dff";
      else color = "#ff5c5c";
    }
  }

  renderCircle(el, value, color, getMarkerSize());
}