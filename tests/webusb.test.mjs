import test from 'node:test';
import assert from 'node:assert/strict';
import { hexId, parseId, matchesDevice, init } from '../static/js/webusb.mjs';

class Element {
  constructor() {
    this.children = [];
    this.listeners = {};
    this.dataset = {};
    this.value = '';
    this.disabled = true;
    this.textContent = '';
  }
  append(...items) { this.children.push(...items); }
  replaceChildren(...items) { this.children = items; }
  addEventListener(name, handler) { this.listeners[name] = handler; }
  async fire(name) { return this.listeners[name]?.(); }
}

function fixture(usb, secure = true) {
  const nodes = Object.fromEntries(['choose', 'refresh', 'scope', 'status', 'devices', 'vid', 'pid', 'custom'].map(id => [id, new Element()]));
  nodes.scope.value = 'target';
  const document = {
    getElementById: id => nodes[id],
    createElement: () => new Element(),
  };
  const copied = [];
  const navigator = { usb, clipboard: { writeText: async value => copied.push(value) } };
  return { nodes, navigator, copied, ready: init(document, navigator, secure) };
}

function mockUSB(devices = []) {
  return {
    devices,
    calls: [],
    listeners: {},
    async getDevices() { return this.devices; },
    async requestDevice(options) { this.calls.push(options); },
    addEventListener(name, handler) { this.listeners[name] = handler; },
  };
}

const board = { vendorId: 0x2e8a, productId: 15, productName: 'RP2350 Boot', serialNumber: 'ABC123' };

test('hexadecimal filters handle zero, optional IDs, prefixes and invalid input', () => {
  assert.equal(hexId(15), '000F');
  assert.equal(parseId(' 0x2e8a '), 0x2e8a);
  assert.equal(parseId('0000'), 0);
  assert.equal(parseId(' '), undefined);
  for (const invalid of ['10000', '-1', 'xyz', '0x', '2e8a trailing']) {
    assert.throws(() => parseId(invalid));
  }
  assert.ok(matchesDevice(board, 'target'));
  assert.ok(matchesDevice({ vendorId: 1, productId: 0x4011 }, 'target'));
  assert.ok(matchesDevice({ vendorId: 1, productId: 2, productName: 'DDX radio' }, 'target'));
  assert.ok(matchesDevice({ vendorId: 0xcafe, productId: 2 }, 'target'));
  assert.ok(!matchesDevice({ vendorId: 1, productId: 2 }, 'target'));
  assert.ok(matchesDevice(board, 'custom', undefined, 15));
  assert.ok(!matchesDevice(board, 'custom', 0, 15));
  assert.ok(matchesDevice(board, 'all'));
});

test('unsupported and insecure contexts disable USB actions', () => {
  const unsupported = fixture(undefined);
  assert.equal(unsupported.nodes.choose.disabled, true);
  assert.match(unsupported.nodes.status.textContent, /unavailable/);
  const insecure = fixture(mockUSB(), false);
  assert.equal(insecure.nodes.choose.disabled, true);
  assert.match(insecure.nodes.status.textContent, /HTTPS or localhost/);
});

test('separate identical boards, literal descriptor text, missing serial and copy', async () => {
  const usb = mockUSB([board, { ...board, productName: '<img src=x onerror=alert(1)>', serialNumber: '' }]);
  const ui = fixture(usb);
  await ui.ready;
  const cards = ui.nodes.devices.children;
  assert.equal(cards.length, 2);
  assert.equal(cards[1].children[0].textContent, '<img src=x onerror=alert(1)>');
  assert.equal(cards[1].children.length, 2); // No copy button for an absent descriptor.
  assert.equal(cards[1].children[1].children[5].textContent, 'Not exposed by this device');
  await cards[0].children[2].fire('click');
  assert.deepEqual(ui.copied, ['ABC123']);
  ui.navigator.clipboard.writeText = async () => { throw new Error('Denied'); };
  await cards[0].children[2].fire('click');
  assert.match(ui.nodes.status.textContent, /copy it manually/);
});

test('chooser cancellation, access errors and recovery preserve existing devices', async () => {
  const usb = mockUSB([board]);
  const ui = fixture(usb);
  await ui.ready;
  usb.requestDevice = async () => { throw Object.assign(new Error(), { name: 'NotFoundError' }); };
  await ui.nodes.choose.fire('click');
  assert.match(ui.nodes.status.textContent, /No device selected/);
  assert.equal(ui.nodes.status.dataset.error, 'false');
  assert.equal(ui.nodes.devices.children.length, 1);
  assert.equal(ui.nodes.choose.disabled, false);
  usb.requestDevice = async () => { throw Object.assign(new Error(), { name: 'SecurityError' }); };
  await ui.nodes.choose.fire('click');
  assert.match(ui.nodes.status.textContent, /blocked/);
  usb.requestDevice = async options => usb.calls.push(options);
  await ui.nodes.choose.fire('click');
  assert.deepEqual(usb.calls, [{ filters: [] }]);
  assert.equal(ui.nodes.devices.children.length, 1);
});

test('display filters and disconnect events update cards without opening devices', async () => {
  const usb = mockUSB([board]);
  const ui = fixture(usb);
  await ui.ready;
  ui.nodes.scope.value = 'custom';
  ui.nodes.pid.value = 'FFFF';
  await ui.nodes.scope.fire('change');
  assert.equal(ui.nodes.custom.hidden, false);
  assert.equal(ui.nodes.devices.children.length, 0);
  ui.nodes.pid.value = 'invalid';
  await ui.nodes.pid.fire('input');
  assert.equal(ui.nodes.status.dataset.error, 'true');
  ui.nodes.scope.value = 'all';
  await ui.nodes.scope.fire('change');
  assert.equal(ui.nodes.devices.children.length, 1);
  usb.devices = [];
  await usb.listeners.disconnect();
  assert.equal(ui.nodes.devices.children.length, 0);
  assert.match(ui.nodes.status.textContent, /No authorized devices/);
  usb.devices = [board];
  await usb.listeners.connect();
  assert.equal(ui.nodes.devices.children.length, 1);
  usb.getDevices = async () => { throw new Error('Access denied'); };
  await ui.nodes.refresh.fire('click');
  assert.equal(ui.nodes.devices.children.length, 0);
  assert.match(ui.nodes.status.textContent, /Access denied/);
});
