(function (root, factory) {
  "use strict";

  const propagation = factory();

  if (typeof module === "object" && module.exports) {
    module.exports = propagation;
  } else {
    root.HfPropagation = propagation;
  }

  if (typeof document !== "undefined") {
    document.addEventListener("DOMContentLoaded", function () {
      document.querySelectorAll("[data-dx-propagation]").forEach(propagation.attach);
    });
  }
}(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  const BAND_ORDER = ["10m", "12m", "15m", "17m", "20m", "30m", "40m", "60m", "80m", "160m"];
  const REGION_NAMES = {
    EU: "Europe",
    NA: "North America",
    SA: "South America",
    AS: "Asia",
    OC: "Oceania",
    AF: "Africa"
  };
  const REFRESH_INTERVAL_MS = 5 * 60 * 1000;

  function asFiniteNumber(value, fallback) {
    const number = Number(value);
    return Number.isFinite(number) ? number : fallback;
  }

  function bandSortKey(band) {
    const index = BAND_ORDER.indexOf(band);
    return index === -1 ? BAND_ORDER.length : index;
  }

  function getAvailableBands(data) {
    return Object.keys(data.bands || {}).sort(function (left, right) {
      const order = bandSortKey(left) - bandSortKey(right);
      return order === 0 ? left.localeCompare(right) : order;
    });
  }

  function activityToRating(spotsPerTransmitter) {
    const activity = asFiniteNumber(spotsPerTransmitter, 0);
    if (activity >= 50) return "Excellent";
    if (activity >= 25) return "Good";
    if (activity >= 10) return "Fair";
    return "Poor";
  }

  function validateData(data) {
    if (!data || typeof data !== "object" || Array.isArray(data)) {
      throw new TypeError("The propagation service returned an invalid response.");
    }
    if (!data.bands || typeof data.bands !== "object" || Array.isArray(data.bands)) {
      throw new TypeError("The propagation response does not contain band data.");
    }
    if (!data.regions || typeof data.regions !== "object" || Array.isArray(data.regions)) {
      throw new TypeError("The propagation response does not contain regional data.");
    }
    return data;
  }

  function globalRows(data) {
    return getAvailableBands(data).map(function (band) {
      const item = data.bands[band] || {};
      return {
        band: band,
        index: asFiniteNumber(item.index, 0),
        rating: String(item.rating || "Unknown"),
        forecast: asFiniteNumber(item.forecast, 0),
        forecastRating: String(item.forecast_rating || "Unknown"),
        vsTypical: Number.isFinite(Number(item.vs_typical)) ? Number(item.vs_typical) : null
      };
    });
  }

  function regionalRows(data, region) {
    const regionData = data.regions && data.regions[region];
    const corridors = regionData && regionData.corridors ? regionData.corridors : {};

    return Object.keys(corridors).map(function (corridor) {
      const item = corridors[corridor] || {};
      const activity = asFiniteNumber(item.spots_per_tx, 0);
      return {
        corridor: corridor,
        bestBand: String(item.best_band || "—"),
        activity: activity,
        rating: activityToRating(activity)
      };
    }).sort(function (left, right) {
      return right.activity - left.activity || left.corridor.localeCompare(right.corridor);
    });
  }

  function formatIndex(value) {
    return asFiniteNumber(value, 0).toFixed(1);
  }

  function formatTimestamp(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Unknown";
    return new Intl.DateTimeFormat(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "UTC",
      timeZoneName: "short"
    }).format(date);
  }

  function ratingClass(rating) {
    const normalized = String(rating).toLowerCase().replace(/[^a-z]/g, "");
    return "dx-rating dx-rating--" + normalized;
  }

  function cell(text, className) {
    const element = document.createElement("td");
    element.textContent = text;
    if (className) element.className = className;
    return element;
  }

  function replaceRows(body, rows) {
    body.replaceChildren.apply(body, rows);
  }

  function renderGlobal(body, data) {
    const rows = globalRows(data).map(function (item) {
      const row = document.createElement("tr");
      let currentRating = item.rating;
      if (item.vsTypical !== null && item.vsTypical > 20) {
        currentRating += " · +" + Math.round(item.vsTypical) + "% vs typical";
      }
      row.appendChild(cell(item.band, "dx-tool__band"));
      row.appendChild(cell(formatIndex(item.index), "dx-tool__number"));
      row.appendChild(cell(currentRating, ratingClass(item.rating)));
      row.appendChild(cell(formatIndex(item.forecast) + " · " + item.forecastRating));
      return row;
    });
    replaceRows(body, rows);
  }

  function renderRegional(body, empty, data, region) {
    const items = regionalRows(data, region);
    const rows = items.map(function (item) {
      const row = document.createElement("tr");
      row.appendChild(cell(item.corridor, "dx-tool__corridor"));
      row.appendChild(cell(item.bestBand, "dx-tool__band"));
      row.appendChild(cell(item.rating, ratingClass(item.rating)));
      row.appendChild(cell(formatIndex(item.activity), "dx-tool__number"));
      return row;
    });
    replaceRows(body, rows);
    empty.hidden = items.length !== 0;
  }

  function attach(container) {
    const apiURL = container.dataset.apiUrl;
    const view = container.querySelector("[data-dx-view]");
    const refresh = container.querySelector("[data-dx-refresh]");
    const status = container.querySelector("[data-dx-status]");
    const summary = container.querySelector("[data-dx-summary]");
    const results = container.querySelector("[data-dx-results]");
    const globalPanel = container.querySelector("[data-dx-global]");
    const regionalPanel = container.querySelector("[data-dx-regional]");
    const globalBody = container.querySelector("[data-dx-global-body]");
    const regionalBody = container.querySelector("[data-dx-regional-body]");
    const regionTitle = container.querySelector("[data-dx-region-title]");
    const empty = container.querySelector("[data-dx-empty]");
    const error = container.querySelector("[data-dx-error]");
    const updated = container.querySelector("[data-dx-updated]");
    const sfi = container.querySelector("[data-dx-sfi]");
    const kp = container.querySelector("[data-dx-kp]");
    const stormWrap = container.querySelector("[data-dx-storm-wrap]");
    const storm = container.querySelector("[data-dx-storm]");
    let currentData = null;
    let controller = null;
    let timer = null;

    function setStatus(message, state) {
      status.textContent = message;
      container.dataset.state = state;
    }

    function render() {
      if (!currentData) return;
      const selected = view.value;
      const isGlobal = selected === "global";
      globalPanel.hidden = !isGlobal;
      regionalPanel.hidden = isGlobal;

      if (isGlobal) {
        renderGlobal(globalBody, currentData);
      } else {
        regionTitle.textContent = (REGION_NAMES[selected] || selected) + " to DX";
        renderRegional(regionalBody, empty, currentData, selected);
      }
    }

    function renderSummary(data) {
      const solar = data.solar || {};
      updated.textContent = formatTimestamp(data.updated);
      sfi.textContent = Number.isFinite(Number(solar.sfi)) ? Math.round(Number(solar.sfi)).toString() : "—";
      kp.textContent = Number.isFinite(Number(solar.kp)) ? Number(solar.kp).toFixed(1) : "—";

      const probability = data.storm && Number(data.storm.probability);
      if (Number.isFinite(probability)) {
        storm.textContent = Math.round(probability) + "%";
        stormWrap.hidden = false;
      } else {
        stormWrap.hidden = true;
      }
    }

    async function load(force) {
      if (!apiURL) {
        error.textContent = "The live propagation endpoint has not been configured yet.";
        error.hidden = false;
        setStatus("Configuration required", "error");
        refresh.disabled = true;
        return;
      }

      if (controller) controller.abort();
      controller = new AbortController();
      refresh.disabled = true;
      error.hidden = true;
      setStatus("Loading current conditions…", "loading");

      try {
        const response = await fetch(apiURL, {
          headers: { Accept: "application/json" },
          cache: force ? "no-store" : "default",
          signal: controller.signal
        });
        if (!response.ok) {
          throw new Error("Propagation service returned HTTP " + response.status + ".");
        }
        currentData = validateData(await response.json());
        renderSummary(currentData);
        render();
        summary.hidden = false;
        results.hidden = false;
        setStatus("Current conditions loaded", "ready");
      } catch (loadError) {
        if (loadError.name === "AbortError") return;
        error.textContent = loadError.message || "Unable to load current propagation data.";
        error.hidden = false;
        setStatus(currentData ? "Refresh failed; showing previous data" : "Unable to load conditions", "error");
      } finally {
        refresh.disabled = false;
      }
    }

    view.addEventListener("change", render);
    refresh.addEventListener("click", function () { load(true); });
    timer = setInterval(function () { load(true); }, REFRESH_INTERVAL_MS);
    container.addEventListener("dx:destroy", function () {
      clearInterval(timer);
      if (controller) controller.abort();
    }, { once: true });
    load(false);
  }

  return {
    REFRESH_INTERVAL_MS: REFRESH_INTERVAL_MS,
    activityToRating: activityToRating,
    attach: attach,
    formatTimestamp: formatTimestamp,
    getAvailableBands: getAvailableBands,
    globalRows: globalRows,
    regionalRows: regionalRows,
    validateData: validateData
  };
}));
