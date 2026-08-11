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
    fs.mkdirSync(dest, { recursive: true });
    const entries = fs.readdirSync(src);
    for (const entry of entries) {
      copyRecursive(path.join(src, entry), path.join(dest, entry));
    }
  } else {
    fs.copyFileSync(src, dest);
  }
}

// Files and folders to include in deployment bundle
const itemsToCopy = ['index.html', 'tilda-export.html', 'css', 'js', 'assets'];

for (const item of itemsToCopy) {
  const srcPath = path.join(__dirname, item);
  const destPath = path.join(distDir, item);
  if (fs.existsSync(srcPath)) {
    copyRecursive(srcPath, destPath);
    console.log(`[build] Copied ${item} to dist/`);
  }
}

console.log('[build] Production bundle built successfully in dist/');
