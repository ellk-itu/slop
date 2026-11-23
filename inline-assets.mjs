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

  // Collect all JS files
  const jsFiles = [];
  function collectJsFiles(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      if (stat.isDirectory()) {
        collectJsFiles(filePath);
      } else if (file.endsWith('.js')) {
        let content = fs.readFileSync(filePath, 'utf-8');
        
        // Replace import() calls within the module code
        content = content.replace(/import\("([^"]+)"\)/g, 'window.importModule("$1")');
        
        const relativePath = path.relative(buildDir, filePath).replace(/\\/g, '/');
        jsFiles.push({
          path: '/' + relativePath,
          content: content
        });
      }
    }
  }

  const appDir = path.join(buildDir, '_app');
  if (fs.existsSync(appDir)) {
    collectJsFiles(appDir);
  }

  // Create a module system using base64 encoding
  let moduleScript = `<script>
  const moduleCache = new Map();
  
  // Decode base64
  function base64Decode(str) {
    return decodeURIComponent(atob(str).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
  }
  
  // Module map (path -> base64-encoded code)
  const moduleMap = new Map([
`;

  for (const file of jsFiles) {
    const encoded = Buffer.from(file.content, 'utf-8').toString('base64');
    moduleScript += `    ['${file.path}', '${encoded}'],\n`;
  }

  moduleScript += `  ]);
  
  // Create a simple module loader
  async function loadModule(id) {
    if (moduleCache.has(id)) {
      return moduleCache.get(id);
    }
    
    const encoded = moduleMap.get(id);
    if (!encoded) {
      throw new Error('Module not found: ' + id);
    }
    
    const code = base64Decode(encoded);
    const moduleObj = { exports: {} };
    
    // Create a function that executes the module code
    const func = new Function('module', 'exports', 'require', '__dirname', '__filename', code);
    func(moduleObj, moduleObj.exports, loadModule, '', id);
    
    moduleCache.set(id, moduleObj.exports);
    return moduleObj.exports;
  }
  
  // Set up global import module function
  window.importModule = loadModule;
</script>`;

  // Replace remaining import() calls in the HTML script tags (not inside function strings)
  html = html.replace(/import\("([^"]+)"\)(?=\s*\.then)/g, 'window.importModule("$1")');

  // Insert module script before closing head tag
  html = html.replace('</head>', moduleScript + '\n</head>');

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
