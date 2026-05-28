const fs = require('fs');
const path = require('path');

const root = __dirname;
const outDir = path.join(root, 'dist');

fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(outDir, { recursive: true });

const entries = ['index.html', 'game.js', 'style.css', 'img'];
for (const entry of entries) {
  const src = path.join(root, entry);
  const dest = path.join(outDir, entry);
  if (!fs.existsSync(src)) continue;
  fs.cpSync(src, dest, { recursive: true });
}

console.log('Vercel static build complete: dist/');
