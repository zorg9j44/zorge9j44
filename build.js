import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distDir = path.join(__dirname, 'dist');

// Remove existing dist directory if any
if (fs.existsSync(distDir)) {
  fs.rmSync(distDir, { recursive: true, force: true });
}

// Create fresh dist directory
fs.mkdirSync(distDir, { recursive: true });

function copyRecursive(src, dest) {
  const stats = fs.statSync(src);
  if (stats.isDirectory()) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    const entries = fs.readdirSync(src);
    for (const entry of entries) {
      copyRecursive(path.join(src, entry), path.join(dest, entry));
    }
  } else {
    fs.copyFileSync(src, dest);
  }
}

// Copy everything except system / git / dist / node_modules
const entries = fs.readdirSync(__dirname);
const ignoreList = ['.git', '.gitignore', 'node_modules', 'dist', 'dist-ssr', 'build.js', 'package-lock.json'];

for (const entry of entries) {
  if (!ignoreList.includes(entry)) {
    const srcPath = path.join(__dirname, entry);
    const destPath = path.join(distDir, entry);
    copyRecursive(srcPath, destPath);
    console.log(`[build] Copied ${entry} to dist/`);
  }
}

console.log('[build] Production bundle built successfully in dist/');
