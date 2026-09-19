(function () {
  'use strict';

  if (window.__codebenTrackingInitialized) return;
  window.__codebenTrackingInitialized = true;

  var config = window.CODEBEN_TRACKING_CONFIG || {};
  var dataLayer = window.dataLayer = window.dataLayer || [];
  var checkoutHost = 'pay.cakto.com.br';
  var campaignKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'gclid', 'fbclid'];

  function clean(value) {
    return String(value || '').replace(/\s+/g, ' ').trim();
  }

  function snake(value) {
    return clean(value).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
  }

  function campaignContext() {
    var params = new URLSearchParams(window.location.search);
    var context = {};
    campaignKeys.forEach(function (key) {
      var value = params.get(key);
      if (value) context[key] = value.slice(0, 200);
    });
    return context;
  }

  function eventId() {
    if (window.crypto && window.crypto.randomUUID) return window.crypto.randomUUID();
    return 'cb_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2);
  }

  function push(eventName, properties) {
    dataLayer.push(Object.assign({ event: eventName }, properties || {}));
  }

  function loadGtm() {
    var gtmId = clean(config.gtmId);
    if (!gtmId || document.querySelector('script[data-codeben-gtm]')) return;
    var script = document.createElement('script');
    script.async = true;
    script.dataset.codebenGtm = 'true';
    script.src = 'https://www.googletagmanager.com/gtm.js?id=' + encodeURIComponent(gtmId);
    document.head.appendChild(script);
  }

  function loadMetaPixel() {
    var pixelId = clean(config.metaPixelId);
    if (config.metaPixelDirect !== true || !pixelId || window.fbq) return;
    !function (f, b, e, v, n, t, s) {
      if (f.fbq) return;
      n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); };
      if (!f._fbq) f._fbq = n;
      n.push = n; n.loaded = true; n.version = '2.0'; n.queue = [];
      t = b.createElement(e); t.async = true; t.src = v;
      s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s);
    }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
    window.fbq('init', pixelId);
    window.fbq('track', 'PageView');
  }

  function scheduleGtm() {
    if (!clean(config.gtmId)) return;
    var load = function () {
      if (window.requestIdleCallback) window.requestIdleCallback(loadGtm, { timeout: 1500 });
      else window.setTimeout(loadGtm, 1);
    };
    if (document.readyState === 'complete') load();
    else window.addEventListener('load', load, { once: true, passive: true });
  }

  function sendCapi(payload) {
    if (config.capiEnabled !== true || !config.capiEndpoint) return;
    try {
      fetch(config.capiEndpoint, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        credentials: 'same-origin',
        keepalive: true,
        body: JSON.stringify(payload)
      }).catch(function () {});
    } catch (error) {}
  }

  function trackCta(anchor) {
    var href = anchor.getAttribute('href') || '';
    var isCheckout = false;
    try { isCheckout = new URL(href, window.location.href).hostname === checkoutHost; } catch (error) {}
    if (!isCheckout && !anchor.classList.contains('codeben-cta')) return;

    var anchors = Array.prototype.slice.call(document.querySelectorAll('a.codeben-cta, a[href*="pay.cakto.com.br"]'));
    var index = Math.max(0, anchors.indexOf(anchor));
    var label = clean(anchor.textContent || anchor.getAttribute('aria-label')).replace(/\s+—\s+checkout CODEBEN$/i, '');
    var ctaName = snake(label || 'cta');
    var eventIdValue = eventId();
    var legacyLabels = { acessar_workflow: 'quero_esse_metodo', comecar: 'subir_o_nivel', entrar_na_codeben: 'entrar_agora', primeiro_resultado: 'subir_o_nivel' };
    if (legacyLabels[ctaName]) ctaName = legacyLabels[ctaName];
    var ctaDefinitions = {
      subir_o_nivel: { index: 1, location: 'hero' },
      quero_esse_metodo: { index: 2, location: 'projects' },
      entrar_agora: { index: 3, location: 'offer' }
    };
    var definition = ctaDefinitions[ctaName] || { index: index + 1, location: 'other' };
    var properties = Object.assign({
      event_id: eventIdValue,
      button_text: label,
      cta_name: ctaName,
      cta_index: definition.index,
      cta_location: definition.location,
      destination: 'cakto',
      link_url: href,
      page: window.location.pathname || '/',
      page_title: document.title,
      page_location: window.location.href
    }, campaignContext());
    push('cta_clicked', properties);
    push('checkout_started', Object.assign({}, properties, { value: 89.90, currency: 'BRL', content_name: 'Método CODEBEN' }));
    if (config.metaPixelDirect === true && window.fbq) {
      window.fbq('track', 'InitiateCheckout', { value: 89.90, currency: 'BRL', content_name: 'Método CODEBEN' }, { eventID: eventIdValue });
    }
    sendCapi({
      event_name: 'InitiateCheckout',
      event_id: eventIdValue,
      event_source_url: window.location.href,
      custom_data: { value: 89.90, currency: 'BRL', content_name: 'Método CODEBEN' }
    });
  }

  function init() {
    push('page_view', Object.assign({
      page_title: document.title,
      page_location: window.location.href,
      page: window.location.pathname || '/',
      content_group: 'codeben_landing_page'
    }, campaignContext()));
    loadMetaPixel();
    document.addEventListener('click', function (event) {
      var anchor = event.target && event.target.closest ? event.target.closest('a') : null;
      if (anchor) trackCta(anchor);
    }, true);
    scheduleGtm();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
}());
