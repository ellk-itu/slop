import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const buildDir = path.join(__dirname, 'build');
const indexPath = path.join(buildDir, 'index.html');

function inlineAssets() {
  console.log('Inlining assets into single HTML file...');

  let html = fs.readFileSync(indexPath, 'utf-8');

  // Find and inline CSS files
  const cssRegex = /<link[^>]*href="([^"]*\.css)"[^>]*>/g;
  html = html.replace(cssRegex, (match, cssPath) => {
    const cleanPath = cssPath.startsWith('/') ? cssPath.slice(1) : cssPath;
    const fullPath = path.join(buildDir, cleanPath);
    if (fs.existsSync(fullPath)) {
      const css = fs.readFileSync(fullPath, 'utf-8');
      return `<style>${css}</style>`;
    }
    return match;
  });

  // Extract all import() calls and collect referenced files
  const importRegex = /import\("([^"]+)"\)/g;
  const referencedFiles = new Set();
  let match;
  while ((match = importRegex.exec(html)) !== null) {
    referencedFiles.add(match[1]);
  }

  // Create a module map for all referenced files
  let moduleMap = {};
  for (const filePath of referencedFiles) {
    const cleanPath = filePath.startsWith('/') ? filePath.slice(1) : filePath;
    const fullPath = path.join(buildDir, cleanPath);
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, 'utf-8');
      const encoded = Buffer.from(content).toString('base64');
      moduleMap[filePath] = `data:application/javascript;base64,${encoded}`;
    }
  }

  // Inject module loader and replace import() calls
  const moduleLoaderScript = `<script>
    // Global module map for dynamic imports
    window.__moduleMap = ${JSON.stringify(moduleMap)};
    
    // Module cache
    window.__moduleCache = {};
    
    // Custom import loader that returns module objects from data URLs
    async function __loadModule(specifier) {
      if (window.__moduleCache[specifier]) {
        return window.__moduleCache[specifier];
      }
      
      const dataUrl = window.__moduleMap[specifier];
      if (!dataUrl) {
        // Fallback to native import
        return import(specifier);
      }
      
      const module = await import(dataUrl);
      window.__moduleCache[specifier] = module;
      return module;
    }
  </script>`;

  // Replace import() calls with __loadModule()
  html = html.replace(/import\("([^"]+)"\)/g, '__loadModule("$1")');

  // Insert module loader at the beginning of the body
  html = html.replace('<div style="display: contents">', moduleLoaderScript + '<div style="display: contents">');

  // Remove modulepreload links
  html = html.replace(/<link[^>]*rel="modulepreload"[^>]*>/g, '');

  // Write the result
  fs.writeFileSync(indexPath, html, 'utf-8');

  // Remove _app directory since everything is inlined
  const appDir = path.join(buildDir, '_app');
  if (fs.existsSync(appDir)) {
    fs.rmSync(appDir, { recursive: true, force: true });
    console.log('✓ All _app files inlined into page (directory removed)');
  }

  const fileSize = fs.statSync(indexPath).size;
  console.log(`✓ Single HTML file created: ${indexPath}`);
  console.log(`✓ File size: ${(fileSize / 1024).toFixed(2)} KB`);
}

try {
  inlineAssets();
} catch (error) {
  console.error('Error:', error.message);
  process.exit(1);
}
