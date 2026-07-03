"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const propagation = require("../static/js/hf-propagation.js");

const sample = {
  updated: "2026-08-13T06:06:08+00:00",
  bands: {
    "80m": { index: 22.8, rating: "Poor", forecast: 30.9, forecast_rating: "Poor" },
    "10m": { index: 74.3, rating: "Excellent", forecast: 59, forecast_rating: "Good" },
    "20m": { index: 45.2, rating: "Fair", forecast: 51.1, forecast_rating: "Good" }
  },
  regions: {
    AS: {
      corridors: {
        "AS↔EU": { best_band: "15m", spots_per_tx: 12 },
        "AS↔OC": { best_band: "20m", spots_per_tx: 55 },
        "AS↔NA": { best_band: "40m", spots_per_tx: 27 }
      }
    }
  },
  solar: { sfi: 101, kp: 2 }
};

test("sorts known bands from highest to lowest frequency", function () {
  assert.deepEqual(propagation.getAvailableBands(sample), ["10m", "20m", "80m"]);
});

test("uses dx.py regional activity thresholds", function () {
  assert.equal(propagation.activityToRating(50), "Excellent");
  assert.equal(propagation.activityToRating(49.9), "Good");
  assert.equal(propagation.activityToRating(25), "Good");
  assert.equal(propagation.activityToRating(10), "Fair");
  assert.equal(propagation.activityToRating(9.9), "Poor");
});

test("builds global rows without changing numeric precision", function () {
  const rows = propagation.globalRows(sample);
  assert.equal(rows[0].band, "10m");
  assert.equal(rows[0].index, 74.3);
  assert.equal(rows[0].forecastRating, "Good");
});

test("sorts regional corridors by strongest activity", function () {
  const rows = propagation.regionalRows(sample, "AS");
  assert.deepEqual(rows.map((row) => row.corridor), ["AS↔OC", "AS↔NA", "AS↔EU"]);
  assert.equal(rows[0].rating, "Excellent");
  assert.equal(rows[2].rating, "Fair");
});

test("returns an empty regional view when there are no active corridors", function () {
  assert.deepEqual(propagation.regionalRows(sample, "AF"), []);
});

test("rejects incomplete API responses", function () {
  assert.throws(() => propagation.validateData(null), /invalid response/);
  assert.throws(() => propagation.validateData({ regions: {} }), /band data/);
  assert.throws(() => propagation.validateData({ bands: {} }), /regional data/);
  assert.equal(propagation.validateData(sample), sample);
});

test("formats valid timestamps in UTC and tolerates invalid values", function () {
  assert.match(propagation.formatTimestamp("2026-08-13T06:06:08Z"), /2026/);
  assert.match(propagation.formatTimestamp("2026-08-13T06:06:08Z"), /UTC|GMT/);
  assert.equal(propagation.formatTimestamp("not-a-date"), "Unknown");
});
