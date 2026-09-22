import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const campaign = {
  utm_source: 'meta_test',
  utm_medium: 'qa',
  utm_campaign: 'tracking_smoke',
  utm_content: 'ctv1',
  utm_term: 'direct_response',
  fbclid: 'test_fbclid',
  gclid: 'test_gclid'
};
const search = new URLSearchParams(campaign).toString();
const listeners = {};

function createAnchor(label) {
  const attributes = {
    href: 'https://pay.cakto.com.br/32iz4ye_1128231',
    'aria-label': `${label} — checkout CODEBEN`
  };
  return {
    textContent: label,
    classList: { contains: () => false },
    getAttribute: (name) => attributes[name] || null,
    setAttribute: (name, value) => { attributes[name] = value; }
  };
}

const anchors = [createAnchor('SUBIR O NÍVEL'), createAnchor('QUERO ESSE MÉTODO'), createAnchor('ENTRAR AGORA')];
const document = {
  title: 'CODEBEN — Sites imersivos com IA',
  readyState: 'complete',
  documentElement: { scrollHeight: 2000 },
  head: { appendChild() {} },
  createElement: () => ({ dataset: {} }),
  getElementsByTagName: () => [{ parentNode: { insertBefore() {} } }],
  querySelector: () => null,
  querySelectorAll: (selector) => selector.includes('pay.cakto.com.br') || selector.includes('a.codeben-cta') ? anchors : [],
  addEventListener: (name, handler) => { listeners[name] = handler; }
};
const window = {
  CODEBEN_TRACKING_CONFIG: { gtmId: '', metaPixelDirect: false, capiEnabled: false },
  dataLayer: [],
  document,
  location: {
    href: `https://www.codebn.com.br/?${search}`,
    search: `?${search}`,
    pathname: '/',
    assign(value) { this.lastAssigned = value; }
  },
  crypto: { randomUUID: () => 'event-test-1' },
  innerHeight: 1000,
  scrollY: 0,
  addEventListener: (name, handler) => { listeners[`window:${name}`] = handler; },
  removeEventListener() {},
  requestAnimationFrame: (callback) => callback(),
  setTimeout
};
const context = vm.createContext({
  window,
  document,
  URL,
  URLSearchParams,
  Object,
  Math,
  Date,
  String,
  Array,
  IntersectionObserver: class { observe() {} unobserve() {} },
  MutationObserver: class { observe() {} }
});

vm.runInContext(readFileSync(new URL('../codeben-tracking.js', import.meta.url), 'utf8'), context);

for (const anchor of anchors) {
  const checkout = new URL(anchor.getAttribute('href'));
  for (const [key, value] of Object.entries(campaign)) assert.equal(checkout.searchParams.get(key), value);
}

listeners.click({ target: { closest: () => anchors[0] } });
const cta = window.dataLayer.find((item) => item.event === 'cta_click');
const checkout = window.dataLayer.find((item) => item.event === 'initiate_checkout');

assert.ok(cta, 'cta_click was not pushed');
assert.ok(checkout, 'initiate_checkout was not pushed');
assert.equal(cta.cta_name, 'subir_o_nivel');
assert.equal(cta.cta_location, 'hero');
assert.equal(cta.utm_campaign, campaign.utm_campaign);
assert.equal(cta.destination_url, anchors[0].getAttribute('href'));
assert.equal(checkout.event_id, cta.event_id);
assert.equal(checkout.value, 89.90);
assert.equal(checkout.currency, 'BRL');
assert.equal(typeof window.gtag, 'function');

listeners['window:click']({
  target: { closest: () => anchors[0] },
  preventDefault() {},
  stopImmediatePropagation() {}
});
const navigatedCheckout = new URL(window.location.lastAssigned);
for (const [key, value] of Object.entries(campaign)) {
  assert.equal(navigatedCheckout.searchParams.get(key), value, `lost ${key} during checkout navigation`);
}
assert.equal(anchors[0].getAttribute('href'), window.location.lastAssigned);

console.log('Tracking smoke test passed: attribution, CTA and checkout events are consistent.');
