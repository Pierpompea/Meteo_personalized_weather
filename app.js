const DEFAULT_COORDS = {
  latitude: 41.9028,
  longitude: 12.4964,
  name: "Roma, Italia",
};

const WEATHER_CODES = {
  0: "Cielo sereno",
  1: "Prevalentemente sereno",
  2: "Parzialmente nuvoloso",
  3: "Coperto",
  45: "Nebbia",
  48: "Nebbia con brina",
  51: "Pioviggine leggera",
  53: "Pioviggine moderata",
  55: "Pioviggine intensa",
  61: "Pioggia leggera",
  63: "Pioggia moderata",
  65: "Pioggia intensa",
  71: "Neve leggera",
  73: "Neve moderata",
  75: "Neve intensa",
  80: "Rovesci leggeri",
  81: "Rovesci moderati",
  82: "Rovesci violenti",
  95: "Temporale",
};

const state = {
  weather: null,
  coords: DEFAULT_COORDS,
  profile: loadProfile(),
};

const els = {
  actualTemp: document.querySelector("#actualTemp"),
  personalTemp: document.querySelector("#personalTemp"),
  weatherSummary: document.querySelector("#weatherSummary"),
  personalSummary: document.querySelector("#personalSummary"),
  windValue: document.querySelector("#windValue"),
  humidityValue: document.querySelector("#humidityValue"),
  apparentValue: document.querySelector("#apparentValue"),
  outfitSummary: document.querySelector("#outfitSummary"),
  outfitList: document.querySelector("#outfitList"),
  locationName: document.querySelector("#locationName"),
  geoBtn: document.querySelector("#geoBtn"),
  refreshBtn: document.querySelector("#refreshBtn"),
  feedbackForm: document.querySelector("#feedbackForm"),
  learningNote: document.querySelector("#learningNote"),
  biasMeter: document.querySelector("#biasMeter"),
  profileText: document.querySelector("#profileText"),
  historyList: document.querySelector("#historyList"),
  historyTemplate: document.querySelector("#historyTemplate"),
  resetBtn: document.querySelector("#resetBtn"),
};

function loadProfile() {
  const fallback = { bias: 0, feedbackCount: 0, history: [] };
  try {
    const saved = JSON.parse(localStorage.getItem("personalWeatherProfile"));
    return {
      ...fallback,
      ...saved,
      history: Array.isArray(saved?.history) ? saved.history : [],
    };
  } catch {
    return fallback;
  }
}

function saveProfile() {
  localStorage.setItem("personalWeatherProfile", JSON.stringify(state.profile));
}

function rounded(value) {
  return Math.round(value * 10) / 10;
}

function getSelectedClothing() {
  return [...document.querySelectorAll("input[name='clothing']:checked")].map((input) => ({
    label: input.parentElement.textContent.trim(),
    weight: Number(input.dataset.weight),
  }));
}

function clothingAdjustment(items) {
  return items.reduce((sum, item) => sum + item.weight, 0) * 0.35;
}

function calculatePersonalTemp() {
  if (!state.weather) return null;
  const clothes = getSelectedClothing();
  const adjusted = state.weather.apparentTemperature + state.profile.bias + clothingAdjustment(clothes);
  return rounded(adjusted);
}

function calculateProfileTemp() {
  if (!state.weather) return null;
  return rounded(state.weather.apparentTemperature + state.profile.bias);
}

function buildOutfitRecommendation() {
  if (!state.weather) {
    return {
      title: "Appena arriva il meteo ti preparo un consiglio sensato.",
      items: [],
    };
  }

  const profileTemp = calculateProfileTemp();
  const hasRain = [51, 53, 55, 61, 63, 65, 80, 81, 82, 95].includes(state.weather.weatherCode);
  const isWindy = state.weather.windSpeed >= 22;
  const isHumid = state.weather.humidity >= 75;
  const feelsColder = state.profile.bias > 0.6;
  const feelsWarmer = state.profile.bias < -0.6;

  let title;
  let items;

  if (profileTemp <= 4) {
    title = "Copriti bene, oggi non fa sconti.";
    items = ["cappotto caldo", "maglione o pile", "sciarpa", "scarpe chiuse"];
  } else if (profileTemp <= 10) {
    title = "Vai di strati: caldo quando serve, libertà quando entri.";
    items = ["giacca pesante", "maglione", "pantaloni lunghi", "calze calde"];
  } else if (profileTemp <= 16) {
    title = "Serve una via di mezzo furba.";
    items = ["giacca leggera", "felpa o cardigan", "pantaloni lunghi", "strato facile da togliere"];
  } else if (profileTemp <= 22) {
    title = "Si sta abbastanza bene: vestiti leggero, ma non troppo.";
    items = ["t-shirt o camicia", "giacca leggera a portata", "pantaloni comodi"];
  } else if (profileTemp <= 28) {
    title = "Oggi punta sul fresco.";
    items = ["t-shirt", "tessuti leggeri", "pantaloni leggeri o gonna", "occhiali da sole se esci a lungo"];
  } else {
    title = "Fa caldo sul serio: meno strati, più respiro.";
    items = ["tessuti traspiranti", "pantaloncini o abiti leggeri", "cappello se stai al sole", "acqua con te"];
  }

  if (hasRain) items.push("ombrello o impermeabile");
  if (isWindy) items.push("strato antivento");
  if (isHumid && profileTemp >= 20) items.push("qualcosa che asciughi in fretta");
  if (feelsColder && profileTemp <= 18) items.push("uno strato extra, per sicurezza");
  if (feelsWarmer && profileTemp >= 14) items.push("strati facili da togliere");

  return { title, items: [...new Set(items)] };
}

function renderOutfitRecommendation() {
  const recommendation = buildOutfitRecommendation();
  els.outfitSummary.textContent = recommendation.title;
  els.outfitList.innerHTML = "";

  recommendation.items.forEach((item) => {
    const li = document.createElement("li");
    li.textContent = item;
    els.outfitList.append(li);
  });
}

function renderWeather() {
  if (!state.weather) return;

  const personalTemp = calculatePersonalTemp();
  const profileTemp = calculateProfileTemp();
  els.actualTemp.textContent = rounded(state.weather.temperature);
  els.personalTemp.textContent = personalTemp;
  els.windValue.textContent = `${rounded(state.weather.windSpeed)} km/h`;
  els.humidityValue.textContent = `${state.weather.humidity}%`;
  els.apparentValue.textContent = `${rounded(state.weather.apparentTemperature)} °C`;
  els.locationName.textContent = state.coords.name;
  els.weatherSummary.textContent = `${WEATHER_CODES[state.weather.weatherCode] || "Meteo variabile"} adesso, aggiornato alle ${new Date(
    state.weather.time,
  ).toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" })}.`;

  const difference = rounded(profileTemp - state.weather.temperature);
  const phrase =
    difference > 1
      ? `Per te oggi potrebbe sembrare circa ${difference} °C più caldo. Ne tengo conto nel consiglio.`
      : difference < -1
        ? `Per te oggi potrebbe sembrare circa ${Math.abs(difference)} °C più freddo. Meglio non fidarsi solo del numero.`
        : "Per te oggi il numero e la sensazione dovrebbero andare abbastanza d'accordo.";
  els.personalSummary.textContent = phrase;

  renderOutfitRecommendation();
  renderProfile();
}

function renderProfile() {
  const bias = rounded(state.profile.bias);
  const meterPosition = Math.max(5, Math.min(95, 50 + bias * 8));
  els.biasMeter.style.left = `${meterPosition}%`;

  if (state.profile.feedbackCount === 0) {
    els.profileText.textContent = "Ti conosco ancora poco: ogni feedback mi aiuta a consigliarti meglio.";
    els.learningNote.textContent = "Non ti conosco ancora: parto neutro.";
  } else {
    const tendency = bias > 0.4 ? "di solito senti più freddo degli altri" : bias < -0.4 ? "di solito senti più caldo degli altri" : "sei abbastanza allineato al meteo";
    els.profileText.textContent = `Dopo ${state.profile.feedbackCount} feedback, ${tendency}. Io aggiusto il consiglio di ${bias > 0 ? "+" : ""}${bias} °C.`;
    els.learningNote.textContent = `Perfetto, me lo segno: correzione personale ${bias > 0 ? "+" : ""}${bias} °C.`;
  }

  els.historyList.innerHTML = "";
  const recent = state.profile.history.slice(0, 5);
  if (recent.length === 0) {
    const empty = document.createElement("li");
    empty.innerHTML = '<span class="history-temp">--</span><span class="history-detail">Raccontami la prima uscita</span>';
    els.historyList.append(empty);
    return;
  }

  recent.forEach((item) => {
    const row = els.historyTemplate.content.firstElementChild.cloneNode(true);
    row.querySelector(".history-temp").textContent = `${item.actual} °C`;
    row.querySelector(".history-detail").textContent = `${item.comfortLabel}, ${item.clothes || "senza dettagli"}`;
    els.historyList.append(row);
  });
}

async function fetchWeather(coords = state.coords) {
  els.weatherSummary.textContent = "Sto guardando fuori per te...";
  const params = new URLSearchParams({
    latitude: coords.latitude,
    longitude: coords.longitude,
    current: "temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m",
    timezone: "auto",
  });
  const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`);
  if (!response.ok) throw new Error("Meteo non disponibile");

  const data = await response.json();
  state.weather = {
    temperature: data.current.temperature_2m,
    humidity: data.current.relative_humidity_2m,
    apparentTemperature: data.current.apparent_temperature,
    weatherCode: data.current.weather_code,
    windSpeed: data.current.wind_speed_10m,
    time: data.current.time,
  };
  renderWeather();
}

function updateCoordsFromPosition(position) {
  state.coords = {
    latitude: position.coords.latitude,
    longitude: position.coords.longitude,
    name: "La tua posizione",
  };
  fetchWeather().catch(showWeatherError);
}

function showWeatherError(error) {
  els.weatherSummary.textContent = `${error.message}. Intanto uso Roma come punto di partenza.`;
  state.coords = DEFAULT_COORDS;
  fetchWeather(DEFAULT_COORDS).catch(() => {
    els.weatherSummary.textContent = "Non riesco a parlare col servizio meteo. Riprova tra poco.";
  });
}

function handleFeedback(event) {
  event.preventDefault();
  if (!state.weather) return;

  const formData = new FormData(els.feedbackForm);
  const comfort = formData.get("comfort");
  const clothes = getSelectedClothing();
  const learningStep = comfort === "cold" ? 0.6 : comfort === "hot" ? -0.6 : state.profile.bias * -0.12;

  state.profile.bias = rounded(Math.max(-4, Math.min(4, state.profile.bias + learningStep)));
  state.profile.feedbackCount += 1;
  state.profile.history.unshift({
    actual: rounded(state.weather.temperature),
    personal: calculatePersonalTemp(),
    comfortLabel: comfort === "cold" ? "freddo" : comfort === "hot" ? "caldo" : "bene",
    clothes: clothes.map((item) => item.label).join(", "),
    date: new Date().toISOString(),
  });
  state.profile.history = state.profile.history.slice(0, 12);
  saveProfile();
  renderWeather();
}

function requestGeolocation() {
  if (!navigator.geolocation) {
    els.locationName.textContent = DEFAULT_COORDS.name;
    fetchWeather(DEFAULT_COORDS).catch(showWeatherError);
    return;
  }

  els.locationName.textContent = "Cerco dove sei...";
  navigator.geolocation.getCurrentPosition(updateCoordsFromPosition, () => {
    state.coords = DEFAULT_COORDS;
    els.locationName.textContent = DEFAULT_COORDS.name;
    fetchWeather(DEFAULT_COORDS).catch(showWeatherError);
  });
}

els.geoBtn.addEventListener("click", requestGeolocation);
els.refreshBtn.addEventListener("click", () => fetchWeather().catch(showWeatherError));
els.feedbackForm.addEventListener("change", renderWeather);
els.feedbackForm.addEventListener("submit", handleFeedback);
els.resetBtn.addEventListener("click", () => {
  state.profile = { bias: 0, feedbackCount: 0, history: [] };
  saveProfile();
  renderProfile();
  renderWeather();
});

renderProfile();
fetchWeather(DEFAULT_COORDS).catch(showWeatherError);

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./service-worker.js").catch(() => {
      // The app still works normally if the browser blocks service workers on file://.
    });
  });
}
