import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { createHash } from 'node:crypto';

const root = resolve(import.meta.dirname, '..');
const output = join(root, 'dist');
const manifest = JSON.parse(readFileSync(join(root, 'sitecloner-resource-manifest.json'), 'utf8'));

for (const resource of manifest.resources ?? []) {
  if (!resource.localPath?.startsWith('resources/https/') || !resource.replayUrl?.startsWith('/__sitecloner_resource__/https/')) {
    throw new Error(`Invalid captured asset path: ${resource.localPath ?? 'missing'}`);
  }
  if (!existsSync(join(root, resource.localPath))) throw new Error(`Missing captured asset: ${resource.localPath}`);
}

rmSync(output, { recursive: true, force: true });
mkdirSync(join(output, 'css'), { recursive: true });
mkdirSync(join(output, 'js'), { recursive: true });
cpSync(join(root, 'assets'), join(output, 'assets'), { recursive: true });
cpSync(join(root, 'resources', 'https'), join(output, '__sitecloner_resource__', 'https'), { recursive: true });
cpSync(join(root, 'codeben-copy.css'), join(output, 'css', 'codeben-copy.css'));
cpSync(join(root, 'codeben-copy.js'), join(output, 'js', 'codeben-copy.js'));
const trackingSource = readFileSync(join(root, 'codeben-tracking.js'));
const trackingHash = createHash('sha256').update(trackingSource).digest('hex').slice(0, 12);
const trackingFile = `codeben-tracking.${trackingHash}.js`;
writeFileSync(join(output, 'js', trackingFile), trackingSource);
cpSync(join(root, 'sitecloner-runtime.js'), join(output, 'js', 'sitecloner-runtime.js'));

let html = readFileSync(join(root, 'index.html'), 'utf8');
html = html.replaceAll('https://pay.cakto.com.br/32iz4ye_1114873', 'https://pay.cakto.com.br/32iz4ye_1128231');
html = html.replace(/(<a\b[^>]*href="https:\/\/pay\.cakto\.com\.br\/32iz4ye_1128231"[^>]*?)target="_blank"/g, '$1target="_self"');
// These are content sections, not 16:9 media frames. The captured markup
// accidentally shared the frame class with them, which forced a fixed mobile
// aspect ratio and clipped/overlaid their copy.
html = html.replace(
  'class="codeben-process-block codeben-project-video-frame"',
  'class="codeben-process-block"',
);
html = html.replace(
  'class="codeben-results-section codeben-project-video-card codeben-project-video-frame"',
  'class="codeben-results-section"',
);
html = html.replace(
  'class="codeben-extension-section codeben-project-video-frame"',
  'class="codeben-extension-section"',
);
html = html.replace(
  'class="framer-1qh7qe0 codeben-project-video-card codeben-project-video-wrap"',
  'class="framer-1qh7qe0 codeben-system-section"',
);
// The captured editor bootstrap and analytics are not part of the CODEBEN page;
// removing them keeps production mobile loads independent of Framer tooling.
html = html.replace(/<script>try\{if\(localStorage\.getItem\("__framer_force_showing_editorbar_since"\)[\s\S]*?<\/script>/, '');
html = html.replace(/<script async="" src="\/__sitecloner_resource__\/https\/events\.framer\.com\/[^>]+><\/script>/, '');
html = html.replace(/<link rel="modulepreload"[^>]+>/g, '');
const mainBundle = html.match(/<script type="module" async="" data-framer-bundle="main"[^>]+src="([^"]+)"[^>]*><\/script>/);
if (!mainBundle) throw new Error('Framer main bundle not found in captured HTML');
// The captured Framer runtime rehydrates the static page and causes visible
// second renders and CTA races. Production serves the already composed HTML.
const mainLoader = '';
html = html.replace(mainBundle[0], mainLoader);
html = html.replaceAll('href="/codeben-copy.css"', 'href="/css/codeben-copy.css"');
html = html.replaceAll('src="/codeben-copy.js"', 'src="/js/codeben-copy.js"');
html = html.replace(/src="\/codeben-tracking\.js(?:\?[^\"]*)?"/g, `src="/js/${trackingFile}"`);
html = html.replaceAll('src="/sitecloner-runtime.js"', 'src="/js/sitecloner-runtime.js"');
html = html.replace('<script src="/js/sitecloner-runtime.js"></script>', '<script src="/js/sitecloner-runtime.js" defer></script>');
const copyScript = '<script src="/js/codeben-copy.js" defer></script>';
// CTA links are conversion-critical. Load their enhancer immediately on every
// viewport so a first mobile touch cannot race the checkout URL assignment.
const copyLoader = '';
if (!html.includes(copyScript)) throw new Error('CODEBEN copy script not found in captured HTML');
html = html.replace(copyScript, copyLoader);
// Run the small tracking bootstrap synchronously at the end of <body>. This
// installs the capture-phase CTA handler before the deferred Framer runtime
// hydrates and replaces links, so attribution is never dependent on UI timing.
const deferredTrackingScript = `<script src="/js/${trackingFile}" defer></script>`;
const trackingScript = `<script src="/js/${trackingFile}"></script>`;
if (!html.includes(deferredTrackingScript)) throw new Error('CODEBEN tracking script not found in captured HTML');
html = html.replace(deferredTrackingScript, trackingScript);
const videoBootstrap = `<script>(function(){function play(){document.querySelectorAll('video').forEach(function(v){v.muted=true;v.defaultMuted=true;v.autoplay=true;v.setAttribute('muted','');v.setAttribute('playsinline','');var p=v.play();if(p&&p.catch)p.catch(function(){})})}if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',play,{once:true});else play()})();</script>`;
html = html.replace('</body>', videoBootstrap + '</body>');
for (const path of ['/css/codeben-copy.css', `/js/${trackingFile}`, '/js/sitecloner-runtime.js']) {
  if (!html.includes(path)) throw new Error(`Built HTML does not reference ${path}`);
}
if (/data-codeben-(?:process-block|results-section|extension-section)="true"[^>]*codeben-project-video-frame/.test(html)) {
  throw new Error('Content section still inherits the fixed-ratio video frame class');
}
if (/framer-1qh7qe0[^\"]*codeben-project-video-(?:card|wrap)/.test(html)) {
  throw new Error('System section still inherits a constrained project video layout');
}
writeFileSync(join(output, 'index.html'), html);
console.log(`Built ${output} with ${manifest.resources.length} captured assets.`);
