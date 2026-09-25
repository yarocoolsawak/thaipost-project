// Bundles the Vite build into one self-contained HTML file (JS + CSS inlined)
// so the demo can be shared as a single file and opened by double-click — no server needed.
// Usage: npm run build:demo  ->  dist/thaipost-myorder-demo.html
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const distDir = 'dist';
const outFile = join(distDir, 'thaipost-myorder-demo.html');
let html = readFileSync(join(distDir, 'index.html'), 'utf8');

const scriptTag = html.match(/<script type="module"[^>]*src="([^"]+)"[^>]*><\/script>/);
const cssTag = html.match(/<link rel="stylesheet"[^>]*href="([^"]+)"[^>]*>/);
if (!scriptTag || !cssTag) {
  console.error('Could not find the bundled script/stylesheet in dist/index.html');
  process.exit(1);
}

const readAsset = href => readFileSync(join(distDir, href.replace(/^\.?\//, '')), 'utf8');
// A literal "</script" inside the bundle would end the inline tag early
const js = readAsset(scriptTag[1]).replace(/<\/script/gi, '<\\/script');
const css = readAsset(cssTag[1]);

// Use functions as replacements so "$" sequences inside the bundle are not treated as patterns
html = html.replace(cssTag[0], () => `<style>\n${css}\n</style>`);
html = html.replace(scriptTag[0], () => `<script type="module">\n${js}\n</script>`);

writeFileSync(outFile, html);
console.log(`Single-file demo written to ${outFile} (${(html.length / 1024).toFixed(0)} KB)`);
