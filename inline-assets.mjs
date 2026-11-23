import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const buildDir = path.join(__dirname, 'build');
const indexPath = path.join(buildDir, 'index.html');

function resolveRelativePath(basePath, relPath) {
  const baseDir = path.dirname(basePath);
  const resolved = path.normalize(path.join(baseDir, relPath));
  return '/' + resolved.replace(/\\/g, '/').replace(/^\/+/, '');
}

function rewriteImportsToAbsolute(modulePath, moduleContent) {
  // Rewrite relative imports to absolute paths
  let rewritten = moduleContent;
  
  // Handle: from "./file" or from './file' or from `./file`
  rewritten = rewritten.replace(
    /from\s*(['"`])(\.[^'"`]+)\1/g,
    (match, quote, relPath) => {
      const absPath = resolveRelativePath(modulePath, relPath);
      return `from${quote}${absPath}${quote}`;
    }
  );
  
  // Comprehensive import() replacement - handles all quote types and trailing chars in one pass
  // This matches: import("path"), import(`path`), import('path'), etc.
  rewritten = rewritten.replace(
    /import\s*\(\s*([`"'])([^`"']*?)\1\s*\)/g,
    (match, quote, path) => {
      // Handle relative paths - convert to absolute
      if (path.startsWith('.')) {
        const absPath = resolveRelativePath(modulePath, path);
        return `__loadModule("${absPath}")`;
      }
      // Handle absolute paths - replace with __loadModule
      if (path.startsWith('/_app')) {
        return `__loadModule("${path}")`;
      }
      // Keep other imports as-is (e.g., external dependencies)
      return match;
    }
  );
  
  // Handle Vite's __vite__mapDeps array: ["../chunks/file.js", "./other.js", ...]
  // This array appears in strings like: d=(m.f||(m.f=["../chunks/A.js","./B.js"]))
  // Also handle the array inside: (m.f||(m.f=["../chunks/file.js","./file.js"]))
  rewritten = rewritten.replace(
    /m\.f=\[(.*?)\]/g,
    (match, arrayContent) => {
      // Parse individual paths from the array
      const paths = arrayContent.match(/["'`][^"'`]*["'`]/g) || [];
      const rewrittenPaths = paths.map(pathQuoted => {
        const quote = pathQuoted[0];
        const path = pathQuoted.slice(1, -1);
        
        if (path.startsWith('.') || path.startsWith('..')) {
          const absPath = resolveRelativePath(modulePath, path);
          return `${quote}${absPath}${quote}`;
        }
        return pathQuoted;
      });
      
      return `m.f=[${rewrittenPaths.join(',')}]`;
    }
  );
  
  return rewritten;
}

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

  // Collect all JS files from _app directory for complete module map
  const allModules = new Set(referencedFiles);
  const appDir = path.join(buildDir, '_app');
  if (fs.existsSync(appDir)) {
    function collectModules(dir) {
      const files = fs.readdirSync(dir);
      for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
          collectModules(filePath);
        } else if (file.endsWith('.js')) {
          const relativePath = path.relative(buildDir, filePath).replace(/\\/g, '/');
          allModules.add('/' + relativePath);
        }
      }
    }
    collectModules(appDir);
  }

  // Create a module map with rewritten imports
  let moduleMap = {};
  for (const modulePath of allModules) {
    const cleanPath = modulePath.startsWith('/') ? modulePath.slice(1) : modulePath;
    const fullPath = path.join(buildDir, cleanPath);
    if (fs.existsSync(fullPath)) {
      let content = fs.readFileSync(fullPath, 'utf-8');
      // Rewrite relative imports to absolute paths
      content = rewriteImportsToAbsolute(modulePath, content);
      const encoded = Buffer.from(content).toString('base64');
      moduleMap[modulePath] = `data:application/javascript;base64,${encoded}`;
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
    
    // Make __loadModule globally available to loaded modules
    globalThis.__loadModule = __loadModule;
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
