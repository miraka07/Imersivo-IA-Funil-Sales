import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../dist/index.html', import.meta.url), 'utf8');
const checkout = 'https://pay.cakto.com.br/32iz4ye_1128231';
const ctas = [...html.matchAll(/<a\b[^>]*class="[^"]*codeben-cta[^"]*"[\s\S]*?<\/a>/g)];
assert.equal(ctas.length, 9, 'unexpected number of CTA variants in the static build');

for (const match of ctas) {
  const anchor = match[0];
  const sectionStart = html.lastIndexOf('<section', match.index);
  const section = html.slice(sectionStart, html.indexOf('>', sectionStart) + 1);
  const expected = section.includes('codeben-mobile-hero') || section.includes('framer-p1ldqa')
    ? 'SUBIR O NÍVEL'
    : section.includes('framer-w6lvb9') ? 'QUERO ESSE MÉTODO' : 'ENTRAR AGORA';
  assert.ok(anchor.includes(`aria-label="${expected} — checkout CODEBEN"`), `wrong CTA label in ${section}`);
  assert.ok(anchor.includes(`href="${checkout}"`), 'CTA points to a different checkout');
  assert.ok(anchor.includes('target="_self"'), 'CTA must navigate in the same tab');
  if (anchor.includes('codeben-final-cta')) {
    assert.ok(anchor.includes('<span>ENTRAR AGORA</span>'), 'final CTA is missing its visible label');
    continue;
  }
  const rolling = anchor.match(/<p class="rolling-text-inner-[^"]+"[^>]*>([\s\S]*?)<\/p>/);
  assert.ok(rolling, 'rolling text is missing');
  const visibleText = [...rolling[1].matchAll(/<span[^>]*>([\s\S]*?)<\/span>/g)]
    .map((span) => span[1].replaceAll('&nbsp;', ' ')).join('');
  assert.equal(visibleText, expected, 'visible CTA text differs from its accessible label');
}

assert.ok(!html.includes('32iz4ye_1114873'), 'legacy checkout survived the build');
const videos = [...html.matchAll(/<video\b[^>]*>/g)].filter((match) => match[0].includes('/assets/media/'));
assert.equal(videos.length, 8, 'unexpected number of sales page videos');
for (const [tag] of videos) {
  assert.ok(tag.includes('preload="none"'), 'video must not compete for initial mobile bandwidth');
  assert.match(tag, /src="\/assets\/media\/[a-z0-9-]+\.mp4\?v=[a-f0-9]{12}"/, 'video URL needs a cache-busting content hash');
  assert.ok(tag.includes('poster="/assets/posters/'), 'video has no visual fallback');
  assert.ok(tag.includes(' controls>'), 'video needs native controls when JavaScript is unavailable');
  assert.ok(!/\sautoplay(?:\s|=|>)/.test(tag), 'video must start only near the viewport');
}
console.log('Static build smoke test passed: all CTA variants, labels and checkout links are consistent.');
