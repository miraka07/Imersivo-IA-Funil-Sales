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
html = html.replaceAll('href="/codeben-copy.css"', 'href="/css/codeben-copy.css"');
html = html.replaceAll('src="/codeben-copy.js"', 'src="/js/codeben-copy.js"');
html = html.replaceAll('src="/sitecloner-runtime.js"', 'src="/js/sitecloner-runtime.js"');
for (const path of ['/css/codeben-copy.css', '/js/codeben-copy.js', '/js/sitecloner-runtime.js']) {
  if (!html.includes(path)) throw new Error(`Built HTML does not reference ${path}`);
}
writeFileSync(join(output, 'index.html'), html);
console.log(`Built ${output} with ${manifest.resources.length} captured assets.`);
