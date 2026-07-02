"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const converter = require("../static/js/rf-power-converter.js");

function approximately(actual, expected, tolerance = 1e-10) {
  assert.ok(
    Math.abs(actual - expected) <= tolerance,
    `${actual} was not within ${tolerance} of ${expected}`
  );
}

test("0 dBm produces 1 mW and the correct voltages at 50 ohms", function () {
  const result = converter.calculate(converter.toWatts("dbm", 0, 50), 50);

  approximately(result.milliwatts, 1);
  approximately(result.watts, 0.001);
  approximately(result.dbw, -30);
  approximately(result.vrms, Math.sqrt(0.05));
  approximately(result.vpeak, Math.sqrt(0.1));
  approximately(result.vpp, Math.sqrt(0.4));
  approximately(result.dbmv, 46.98970004336019);
});

test("30 dBm is exactly 1 watt", function () {
  approximately(converter.toWatts("dbm", 30, 50), 1);
});

test("10.8 Vpp into 50 ohms is 291.6 mW", function () {
  const watts = converter.toWatts("vpp", 10.8, 50);
  const result = converter.calculate(watts, 50);

  approximately(watts, 0.2916);
  approximately(result.dbm, 24.647875196459374);
});

test("dBmV round-trips at 75 ohms", function () {
  const original = converter.calculate(0.001, 75);
  const watts = converter.toWatts("dbmv", original.dbmv, 75);

  approximately(watts, 0.001);
});

test("every displayed quantity converts back to the original power", function () {
  const impedance = 50;
  const originalWatts = 0.125;
  const result = converter.calculate(originalWatts, impedance);

  for (const field of ["milliwatts", "watts", "dbm", "dbw", "vrms", "vpeak", "vpp", "dbmv"]) {
    approximately(converter.toWatts(field, result[field], impedance), originalWatts);
  }
});

test("rejects invalid physical values", function () {
  assert.throws(() => converter.toWatts("watts", -1, 50), /cannot be negative/);
  assert.throws(() => converter.toWatts("vrms", -1, 50), /cannot be negative/);
  assert.throws(() => converter.toWatts("dbm", 0, 0), /greater than zero/);
  assert.throws(() => converter.calculate(1, -50), /greater than zero/);
});

test("formats ordinary, tiny, and zero-power values", function () {
  assert.equal(converter.formatNumber(0.001), "0.001");
  assert.equal(converter.formatNumber(1e-9), "1e-9");
  assert.equal(converter.formatNumber(-Infinity), "−∞");
});
