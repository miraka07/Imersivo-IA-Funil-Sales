import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

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
cpSync(join(root, 'sitecloner-runtime.js'), join(output, 'js', 'sitecloner-runtime.js'));

let html = readFileSync(join(root, 'index.html'), 'utf8');
// The captured editor bootstrap and analytics are not part of the CODEBEN page;
// removing them keeps production mobile loads independent of Framer tooling.
html = html.replace(/<script>try\{if\(localStorage\.getItem\("__framer_force_showing_editorbar_since"\)[\s\S]*?<\/script>/, '');
html = html.replace(/<script async="" src="\/__sitecloner_resource__\/https\/events\.framer\.com\/[^>]+><\/script>/, '');
html = html.replace(/<link rel="modulepreload"[^>]+>/g, '');
const mainBundle = html.match(/<script type="module" async="" data-framer-bundle="main"[^>]+src="([^"]+)"[^>]*><\/script>/);
if (!mainBundle) throw new Error('Framer main bundle not found in captured HTML');
const mainLoader = `<script>(function(){var src=${JSON.stringify(mainBundle[1])},loaded=false;function load(){if(loaded)return;loaded=true;var s=document.createElement('script');s.type='module';s.async=true;s.dataset.framerBundle='main';s.src=src;document.head.appendChild(s)}if(window.matchMedia&&window.matchMedia('(max-width: 809px)').matches){['pointerdown','touchstart','scroll','keydown'].forEach(function(e){window.addEventListener(e,load,{once:true,passive:true})});setTimeout(load,15000)}else load()})();</script>`;
html = html.replace(mainBundle[0], mainLoader);
html = html.replaceAll('href="/codeben-copy.css"', 'href="/css/codeben-copy.css"');
html = html.replaceAll('src="/codeben-copy.js"', 'src="/js/codeben-copy.js"');
html = html.replaceAll('src="/sitecloner-runtime.js"', 'src="/js/sitecloner-runtime.js"');
html = html.replace('<script src="/js/sitecloner-runtime.js"></script>', '<script src="/js/sitecloner-runtime.js" defer></script>');
const copyScript = '<script src="/js/codeben-copy.js" defer></script>';
const copyLoader = `<script>(function(){var src='/js/codeben-copy.js',loaded=false;function load(){if(loaded)return;loaded=true;var s=document.createElement('script');s.defer=true;s.src=src;document.body.appendChild(s)}if(window.matchMedia&&window.matchMedia('(max-width: 809px)').matches){['pointerdown','touchstart','scroll','keydown'].forEach(function(e){window.addEventListener(e,load,{once:true,passive:true})});setTimeout(load,15000)}else load()})();</script>`;
if (!html.includes(copyScript)) throw new Error('CODEBEN copy script not found in captured HTML');
html = html.replace(copyScript, copyLoader);
for (const path of ['/css/codeben-copy.css', '/js/codeben-copy.js', '/js/sitecloner-runtime.js']) {
  if (!html.includes(path)) throw new Error(`Built HTML does not reference ${path}`);
}
writeFileSync(join(output, 'index.html'), html);
console.log(`Built ${output} with ${manifest.resources.length} captured assets.`);
