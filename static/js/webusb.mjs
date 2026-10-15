export function hexId(value) {
  return value.toString(16).toUpperCase().padStart(4, '0');
}

export function parseId(value) {
  const text = value.trim();
  if (!text) return undefined;
  if (!/^(?:0x)?[0-9a-f]{1,4}$/i.test(text)) {
    throw new Error('USB IDs must be hexadecimal values from 0000 to FFFF.');
  }
  return Number.parseInt(text.replace(/^0x/i, ''), 16);
}

export function matchesDevice(device, scope, vendorId, productId) {
  if (scope === 'all') return true;
  if (scope === 'custom') {
    return (vendorId === undefined || device.vendorId === vendorId)
      && (productId === undefined || device.productId === productId);
  }
  return [0x2E8A, 0xCAFE].includes(device.vendorId)
    || device.productId === 0x4011
    || /rp2350|rp2040|pico|ddx/i.test(device.productName || '');
}

export function errorMessage(error) {
  if (error.name === 'NotFoundError') return 'No device selected. You can choose a device when ready.';
  if (error.name === 'SecurityError') {
    return 'USB access is blocked. Use HTTPS or localhost, open this page in its own tab, and check site permissions.';
  }
  return `Could not read USB devices: ${error.message || error.name}`;
}

export function init(document, navigator, secureContext) {
  const byId = id => document.getElementById(id);
  const choose = byId('choose');
  const refresh = byId('refresh');
  const scope = byId('scope');
  const status = byId('status');
  const devices = byId('devices');
  let authorized = [];
  let busy = false;
  let revision = 0;

  function message(text, error = false) {
    status.textContent = text;
    status.dataset.error = String(error);
  }

  function render() {
    devices.replaceChildren();
    let selected;
    try {
      const vendorId = scope.value === 'custom' ? parseId(byId('vid').value) : undefined;
      const productId = scope.value === 'custom' ? parseId(byId('pid').value) : undefined;
      selected = authorized.filter(device => matchesDevice(device, scope.value, vendorId, productId));
    } catch (error) {
      message(error.message, true);
      return;
    }
    for (const device of selected) {
      const card = document.createElement('article');
      const title = document.createElement('h2');
      title.textContent = device.productName || 'USB device';
      card.append(title);
      const details = document.createElement('dl');
      const fields = [
        ['USB VID:PID', `${hexId(device.vendorId)}:${hexId(device.productId)}`],
        ['Manufacturer', device.manufacturerName || 'Not exposed'],
        ['Serial number', device.serialNumber || 'Not exposed by this device'],
      ];
      for (const [label, value] of fields) {
        const term = document.createElement('dt');
        const description = document.createElement('dd');
        term.textContent = label;
        description.textContent = value;
        if (label === 'Serial number' && device.serialNumber) description.className = 'serial';
        details.append(term, description);
      }
      card.append(details);
      if (device.serialNumber) {
        const copy = document.createElement('button');
        copy.type = 'button';
        copy.className = 'secondary';
        copy.textContent = 'Copy serial number';
        copy.addEventListener('click', async () => {
          try {
            await navigator.clipboard.writeText(device.serialNumber);
            message('Serial number copied.');
          } catch {
            message('Clipboard access is unavailable. Select the serial number above and copy it manually.', true);
          }
        });
        card.append(copy);
      }
      devices.append(card);
    }
    if (selected.length) {
      message(`${selected.length} matching device${selected.length === 1 ? '' : 's'} · ${authorized.length} authorized and connected.`);
    } else if (authorized.length) {
      message('No authorized devices match this filter. Try “All authorized devices” or change the USB IDs.');
    } else {
      message('No authorized devices connected. Choose a USB device to get started.');
    }
  }

  async function load() {
    const current = ++revision;
    try {
      const connected = await navigator.usb.getDevices();
      if (current !== revision) return;
      authorized = connected;
      render();
    } catch (error) {
      if (current !== revision) return;
      authorized = [];
      devices.replaceChildren();
      message(errorMessage(error), true);
    }
  }

  async function select() {
    if (busy) return;
    busy = true;
    choose.disabled = true;
    refresh.disabled = true;
    // Keep the chooser unrestricted: browser filters cannot express the Python
    // tool's product-name or product-ID-only rules. Apply those when rendering.
    try {
      await navigator.usb.requestDevice({ filters: [] });
      await load();
    } catch (error) {
      message(errorMessage(error), error.name !== 'NotFoundError');
    } finally {
      busy = false;
      choose.disabled = false;
      refresh.disabled = false;
    }
  }

  if (!secureContext) {
    message('WebUSB requires HTTPS or localhost. Open this site over HTTPS, or use http://localhost:1313/tools/usb-serial-number/ for local development.', true);
    return;
  }
  if (!navigator.usb) {
    message('WebUSB is unavailable in this browser. Use desktop Chrome or Edge. Safari and Firefox do not support WebUSB.', true);
    return;
  }
  scope.addEventListener('change', () => {
    byId('custom').hidden = scope.value !== 'custom';
    render();
  });
  for (const id of ['vid', 'pid']) byId(id).addEventListener('input', render);

  choose.disabled = false;
  refresh.disabled = false;
  choose.addEventListener('click', select);
  refresh.addEventListener('click', load);
  navigator.usb.addEventListener('connect', load);
  navigator.usb.addEventListener('disconnect', load);
  return load();
}

if (typeof document !== 'undefined') init(document, navigator, window.isSecureContext);
