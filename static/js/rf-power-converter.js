(function (root, factory) {
  "use strict";

  const converter = factory();

  if (typeof module === "object" && module.exports) {
    module.exports = converter;
  } else {
    root.RfPowerConverter = converter;
  }

  if (typeof document !== "undefined") {
    document.addEventListener("DOMContentLoaded", function () {
      document.querySelectorAll("[data-rf-calculator]").forEach(converter.attach);
    });
  }
}(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  const SQRT_TWO = Math.sqrt(2);
  const FIELD_NAMES = [
    "milliwatts",
    "watts",
    "dbm",
    "dbw",
    "vrms",
    "vpeak",
    "vpp",
    "dbmv"
  ];

  function calculate(watts, impedance) {
    if (!Number.isFinite(watts) || watts < 0) {
      throw new RangeError("Power must be a non-negative, finite number.");
    }
    if (!Number.isFinite(impedance) || impedance <= 0) {
      throw new RangeError("Impedance must be greater than zero.");
    }

    const vrms = Math.sqrt(watts * impedance);

    return {
      milliwatts: watts * 1000,
      watts: watts,
      dbm: watts === 0 ? -Infinity : 10 * Math.log10(watts * 1000),
      dbw: watts === 0 ? -Infinity : 10 * Math.log10(watts),
      vrms: vrms,
      vpeak: vrms * SQRT_TWO,
      vpp: vrms * 2 * SQRT_TWO,
      dbmv: vrms === 0 ? -Infinity : 20 * Math.log10(vrms / 0.001)
    };
  }

  function toWatts(field, value, impedance) {
    if (!FIELD_NAMES.includes(field)) {
      throw new RangeError("Unknown conversion field.");
    }
    if (!Number.isFinite(value)) {
      throw new RangeError("Enter a finite number.");
    }
    if (!Number.isFinite(impedance) || impedance <= 0) {
      throw new RangeError("Impedance must be greater than zero.");
    }

    let watts;
    switch (field) {
      case "milliwatts":
        watts = value / 1000;
        break;
      case "watts":
        watts = value;
        break;
      case "dbm":
        watts = Math.pow(10, value / 10) / 1000;
        break;
      case "dbw":
        watts = Math.pow(10, value / 10);
        break;
      case "vrms":
        watts = value * value / impedance;
        break;
      case "vpeak":
        watts = value * value / (2 * impedance);
        break;
      case "vpp":
        watts = value * value / (8 * impedance);
        break;
      case "dbmv": {
        const vrms = 0.001 * Math.pow(10, value / 20);
        watts = vrms * vrms / impedance;
        break;
      }
    }

    if ((field === "milliwatts" || field === "watts" || field === "vrms" ||
        field === "vpeak" || field === "vpp") && value < 0) {
      throw new RangeError("Power and voltage magnitudes cannot be negative.");
    }
    if (!Number.isFinite(watts)) {
      throw new RangeError("That value is outside the supported numeric range.");
    }

    return watts;
  }

  function formatNumber(value) {
    if (value === -Infinity) {
      return "−∞";
    }
    if (Object.is(value, -0) || value === 0) {
      return "0";
    }

    const absolute = Math.abs(value);
    if (absolute >= 1e9 || absolute < 1e-6) {
      return value.toExponential(8).replace(/\.0+(?=e)/, "");
    }

    return Number(value.toPrecision(10)).toString();
  }

  function attach(container) {
    const fields = Object.fromEntries(FIELD_NAMES.map(function (name) {
      return [name, container.querySelector('[data-rf-field="' + name + '"]')];
    }));
    const impedanceSelect = container.querySelector("[data-rf-impedance]");
    const customWrap = container.querySelector("[data-rf-custom-wrap]");
    const customInput = container.querySelector("[data-rf-custom-impedance]");
    const message = container.querySelector("[data-rf-message]");
    const clearButton = container.querySelector("[data-rf-clear]");
    let sourceField = null;

    function impedance() {
      const raw = impedanceSelect.value === "custom"
        ? customInput.value.trim()
        : impedanceSelect.value;
      const value = Number(raw);

      if (raw === "" || !Number.isFinite(value) || value <= 0) {
        throw new RangeError("Enter an impedance greater than zero.");
      }
      return value;
    }

    function setMessage(text, isError) {
      message.textContent = text;
      message.classList.toggle("rf-calculator__message--error", Boolean(isError));
    }

    function clearDerived(except) {
      FIELD_NAMES.forEach(function (name) {
        if (name !== except) {
          fields[name].value = "";
          fields[name].removeAttribute("aria-invalid");
        }
      });
    }

    function update(name) {
      const input = fields[name];
      const raw = input.value.trim();
      sourceField = name;
      input.removeAttribute("aria-invalid");
      customInput.removeAttribute("aria-invalid");

      if (raw === "") {
        clearDerived(name);
        setMessage("Enter a value in any field to begin.", false);
        return;
      }

      const value = Number(raw);
      try {
        const load = impedance();
        const watts = toWatts(name, value, load);
        const result = calculate(watts, load);

        FIELD_NAMES.forEach(function (fieldName) {
          if (fieldName !== name) {
            fields[fieldName].value = formatNumber(result[fieldName]);
          }
          fields[fieldName].removeAttribute("aria-invalid");
        });
        setMessage("Calculated for a " + formatNumber(load) + " Ω load.", false);
      } catch (error) {
        clearDerived(name);
        input.setAttribute("aria-invalid", "true");
        if (impedanceSelect.value === "custom") {
          const customValue = Number(customInput.value.trim());
          if (customInput.value.trim() === "" || !Number.isFinite(customValue) || customValue <= 0) {
            customInput.setAttribute("aria-invalid", "true");
          }
        }
        setMessage(error.message, true);
      }
    }

    FIELD_NAMES.forEach(function (name) {
      fields[name].addEventListener("input", function () {
        update(name);
      });
      fields[name].addEventListener("focus", function () {
        if (fields[name].value === "−∞") {
          fields[name].select();
        }
      });
    });

    impedanceSelect.addEventListener("change", function () {
      customWrap.hidden = impedanceSelect.value !== "custom";
      if (impedanceSelect.value === "custom") {
        customInput.focus();
      }
      if (sourceField && fields[sourceField].value.trim() !== "") {
        update(sourceField);
      }
    });

    customInput.addEventListener("input", function () {
      if (sourceField && fields[sourceField].value.trim() !== "") {
        update(sourceField);
      }
    });

    clearButton.addEventListener("click", function () {
      FIELD_NAMES.forEach(function (name) {
        fields[name].value = "";
        fields[name].removeAttribute("aria-invalid");
      });
      customInput.removeAttribute("aria-invalid");
      sourceField = null;
      setMessage("Enter a value in any field to begin.", false);
      fields.milliwatts.focus();
    });
  }

  return {
    attach: attach,
    calculate: calculate,
    formatNumber: formatNumber,
    toWatts: toWatts
  };
}));
