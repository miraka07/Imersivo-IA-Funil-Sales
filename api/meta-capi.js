const META_GRAPH_VERSION = process.env.META_GRAPH_VERSION || 'v21.0';

function json(res, status, body) {
  res.status(status).setHeader('content-type', 'application/json; charset=utf-8').send(JSON.stringify(body));
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('allow', 'POST');
    return json(res, 405, { ok: false, error: 'method_not_allowed' });
  }

  const pixelId = process.env.META_PIXEL_ID;
  const accessToken = process.env.META_ACCESS_TOKEN;
  if (!pixelId || !accessToken) return json(res, 503, { ok: false, error: 'meta_capi_not_configured' });

  const body = req.body || {};
  const eventName = body.event_name;
  if (eventName !== 'InitiateCheckout') return json(res, 400, { ok: false, error: 'unsupported_event' });

  const eventSourceUrl = typeof body.event_source_url === 'string' ? body.event_source_url : '';
  try {
    const source = new URL(eventSourceUrl);
    const forwardedProto = String(req.headers['x-forwarded-proto'] || '').split(',')[0].trim();
    const expectedProto = forwardedProto || (/^(localhost|127\.0\.0\.1)(:|$)/i.test(String(req.headers.host || '')) ? 'http' : 'https');
    if (source.origin !== `${expectedProto}://${req.headers.host}`) {
      return json(res, 400, { ok: false, error: 'invalid_event_source_url' });
    }
  } catch (error) {
    return json(res, 400, { ok: false, error: 'invalid_event_source_url' });
  }

  const event = {
    event_name: eventName,
    event_time: Math.floor(Date.now() / 1000),
    event_id: String(body.event_id || '').slice(0, 120),
    event_source_url: eventSourceUrl,
    action_source: 'website',
    user_data: {
      client_ip_address: String(req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '').split(',')[0].trim(),
      client_user_agent: String(req.headers['user-agent'] || '').slice(0, 500)
    },
    custom_data: {
      value: Number(body.custom_data?.value || 89.90),
      currency: 'BRL',
      content_name: 'Método CODEBEN'
    }
  };

  if (!event.event_id) return json(res, 400, { ok: false, error: 'event_id_required' });

  try {
    const response = await fetch(`https://graph.facebook.com/${META_GRAPH_VERSION}/${encodeURIComponent(pixelId)}/events?access_token=${encodeURIComponent(accessToken)}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ data: [event] })
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) return json(res, 502, { ok: false, error: 'meta_api_error', code: result.error?.code || null });
    return json(res, 200, { ok: true, events_received: result.events_received || 0 });
  } catch (error) {
    return json(res, 502, { ok: false, error: 'meta_api_unavailable' });
  }
}
