(function () {
  'use strict';

  if (window.__codebenTrackingInitialized) return;
  window.__codebenTrackingInitialized = true;

  var config = window.CODEBEN_TRACKING_CONFIG || {};
  var dataLayer = window.dataLayer = window.dataLayer || [];
  var checkoutHost = 'pay.cakto.com.br';
  var checkoutUrl = 'https://pay.cakto.com.br/32iz4ye_1128231';
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

  function decorateCheckoutUrl(href) {
    var url;
    try {
      url = new URL(href, window.location.href);
    } catch (error) {
      return href;
    }
    if (url.hostname !== checkoutHost) return href;

    var campaign = campaignContext();
    campaignKeys.forEach(function (key) {
      if (campaign[key] && !url.searchParams.has(key)) url.searchParams.set(key, campaign[key]);
    });
    return url.href;
  }

  function decorateCheckoutLink(anchor) {
    var href = anchor.getAttribute('href') || '';
    var decoratedHref = decorateCheckoutUrl(href);
    if (decoratedHref && decoratedHref !== href) anchor.setAttribute('href', decoratedHref);
    return decoratedHref || href;
  }

  function decorateCheckoutLinks() {
    document.querySelectorAll('a[href*="pay.cakto.com.br"]').forEach(function (anchor) {
      decorateCheckoutLink(anchor);
    });
  }

  function keepCheckoutLinksDecorated() {
    if (!('MutationObserver' in window)) return;
    var pending = false;
    var observer = new MutationObserver(function () {
      if (pending) return;
      pending = true;
      window.requestAnimationFrame(function () {
        pending = false;
        decorateCheckoutLinks();
      });
    });
    observer.observe(document.documentElement, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ['href']
    });
  }

  function eventId() {
    if (window.crypto && window.crypto.randomUUID) return window.crypto.randomUUID();
    return 'cb_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2);
  }

  function push(eventName, properties) {
    dataLayer.push(Object.assign({
      event: eventName,
      event_timestamp: Math.round(Date.now() / 1000),
      page_title: document.title,
      page_url: window.location.href,
      page_type: 'sales_landing'
    }, properties || {}));
  }

  function ensureGa4Queue() {
    window.gtag = window.gtag || function () { dataLayer.push(arguments); };
  }

  function loadGtm() {
    var gtmId = clean(config.gtmId);
    if (!gtmId || document.querySelector('script[data-codeben-gtm], script[src*="googletagmanager.com/gtm.js"]')) return;
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
    var href = decorateCheckoutLink(anchor);
    var isCheckout = false;
    try { isCheckout = new URL(href, window.location.href).hostname === checkoutHost; } catch (error) {}
    if (!isCheckout && !anchor.classList.contains('codeben-cta')) return;

    var anchors = Array.prototype.slice.call(document.querySelectorAll('a.codeben-cta, a[href*="pay.cakto.com.br"]'));
    var index = Math.max(0, anchors.indexOf(anchor));
    // Framer CTA buttons contain rolling-text spans and serialized style text.
    // Prefer the accessible label so the data layer receives the human label,
    // rather than the button's internal markup.
    var rawLabel = anchor.getAttribute('aria-label') ||
      anchor.getAttribute('data-cta-label') ||
      anchor.getAttribute('data-cta-name') ||
      anchor.textContent || '';
    var label = clean(rawLabel).replace(/\s+—\s+checkout CODEBEN$/i, '');
    var fallbackNames = ['subir_o_nivel', 'quero_esse_metodo', 'entrar_agora'];
    var ctaName = snake(label || fallbackNames[index] || 'cta');
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
    ensureGa4Queue();
    push('cta_click', Object.assign({}, properties, {
      cta_text: label,
      destination_url: href
    }));
    push('initiate_checkout', Object.assign({}, properties, {
      cta_text: label,
      destination_url: href,
      value: 89.90,
      currency: 'BRL',
      content_name: 'Método CODEBEN'
    }));
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

  function setupSectionViews() {
    if (!('IntersectionObserver' in window)) return;
    var sections = [
      { selector: 'section.framer-p1ldqa, section.framer-18ndqqk', name: 'hero' },
      { selector: 'section.framer-w6lvb9', name: 'projects' },
      { selector: '.codeben-process-block', name: 'process' },
      { selector: '.codeben-offer-section', name: 'pricing' },
      { selector: 'section.framer-50ocvf', name: 'cta_final' }
    ];
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var sectionName = entry.target.dataset.codebenTrackingSection;
        if (!sectionName || entry.target.dataset.codebenTrackedView) return;
        entry.target.dataset.codebenTrackedView = 'true';
        push('section_view', { section_name: sectionName });
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.35 });
    sections.forEach(function (item) {
      document.querySelectorAll(item.selector).forEach(function (element) {
        element.dataset.codebenTrackingSection = item.name;
        observer.observe(element);
      });
    });
  }

  function setupScrollDepth() {
    var thresholds = [25, 50, 75, 90, 100];
    var sent = {};
    var update = function () {
      var height = document.documentElement.scrollHeight - window.innerHeight;
      var depth = height > 0 ? Math.round((window.scrollY / height) * 100) : 100;
      thresholds.forEach(function (threshold) {
        if (depth < threshold || sent[threshold]) return;
        sent[threshold] = true;
        push('scroll_depth', { scroll_percentage: threshold });
      });
      if (thresholds.every(function (threshold) { return sent[threshold]; })) window.removeEventListener('scroll', update);
    };
    window.addEventListener('scroll', update, { passive: true });
    update();
  }

  function init() {
    push('page_view', Object.assign({
      page_title: document.title,
      page_location: window.location.href,
      page: window.location.pathname || '/',
      content_group: 'codeben_landing_page'
    }, campaignContext()));
    loadMetaPixel();
    decorateCheckoutLinks();
    keepCheckoutLinksDecorated();
    setupSectionViews();
    setupScrollDepth();
    document.addEventListener('click', function (event) {
      var anchor = event.target && event.target.closest ? event.target.closest('a') : null;
      if (anchor) trackCta(anchor);
    }, true);
    window.addEventListener('click', function (event) {
      var anchor = event.target && event.target.closest ? event.target.closest('a,button,[role="button"]') : null;
      if (!anchor) return;
      var label = clean(anchor.textContent || anchor.getAttribute('aria-label') || '');
      var href = anchor.getAttribute('href') || '';
      if (!anchor.classList.contains('codeben-cta') && href.indexOf(checkoutHost) === -1 && !/SUBIR O NÍVEL|QUERO ESSE MÉTODO|ENTRAR AGORA|ACESSAR WORKFLOW/i.test(label)) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      if (anchor.tagName === 'A') anchor.setAttribute('href', checkoutUrl);
      window.location.assign(checkoutUrl);
    }, true);
    scheduleGtm();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
}());
