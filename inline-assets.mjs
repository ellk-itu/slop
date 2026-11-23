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

  // Collect all JS files and create a map
  const jsFileMap = new Map();
  function collectJsFiles(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      if (stat.isDirectory()) {
        collectJsFiles(filePath);
      } else if (file.endsWith('.js')) {
        const content = fs.readFileSync(filePath, 'utf-8');
        const relativePath = path.relative(buildDir, filePath).replace(/\\/g, '/');
        jsFileMap.set('/' + relativePath, content);
      }
    }
  }

  const appDir = path.join(buildDir, '_app');
  if (fs.existsSync(appDir)) {
    collectJsFiles(appDir);
  }

  // Create module map as JSON in the page
  let moduleMapScript = `<script>
window.__moduleMap = new Map([
`;
  
  for (const [key, value] of jsFileMap) {
    // Escape the content for JSON
    const escaped = JSON.stringify(value);
    moduleMapScript += `  ['${key}', ${escaped}],\n`;
  }
  
  moduleMapScript += `]);

// Override import() to load from module map
const originalImport = window.import || function() {};
window.import = async function(specifier) {
  const content = window.__moduleMap.get(specifier);
  if (content) {
    const module = { exports: {} };
    const func = new Function('module', 'exports', content);
    func(module, module.exports);
    return module.exports;
  }
  throw new Error('Module not found: ' + specifier);
};
</script>`;

  // Insert before the closing head tag
  html = html.replace('</head>', moduleMapScript + '\n</head>');

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
