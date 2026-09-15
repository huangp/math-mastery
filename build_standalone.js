// 生成自包含单文件版：把所有 CSS/JS 内联进一个 HTML，便于直接放进手机点开即用（file:// 也行）。
// 用法：node build_standalone.js   产出 math-mastery-standalone.html
const fs = require('fs');
const path = require('path');
const root = __dirname;

let html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');

// 1) 内联 styles.css
const css = fs.readFileSync(path.join(root, 'styles.css'), 'utf8');
html = html.replace('<link rel="stylesheet" href="styles.css" />',
  '<style>\n' + css + '\n</style>');

// 2) 按 index.html 顺序内联各 js
// 直接从 index.html 解析脚本清单，而不是在这里硬编码：
// 漏掉任何一个都会让单文件版直接报错（比如 i18n 缺席时 app.js 找不到 window.G），
// 而硬编码的清单每次新增 js 都得记得同步——这里让它自己保持一致。
const scripts = [...html.matchAll(/<script src="([^"]+)"><\/script>/g)].map(m => m[1]);
if (!scripts.length) { console.error('index.html 里没找到任何 <script src>，已中止'); process.exit(1); }
console.log('待内联脚本:', scripts.length, '个');
for (const rel of scripts) {
  const code = fs.readFileSync(path.join(root, rel), 'utf8');
  const tag = '<script src="' + rel + '"></script>';
  if (!html.includes(tag)) {
    console.warn('未找到标签:', tag, ' — 跳过（可能 index.html 结构已变）');
    continue;
  }
  html = html.replace(tag, '<script>\n' + code + '\n</script>');
}

const out = path.join(root, 'math-mastery-standalone.html');
fs.writeFileSync(out, html, 'utf8');
console.log('已生成:', out);
console.log('字节数:', html.length);
console.log('残留 <link rel=stylesheet>:', html.includes('<link rel="stylesheet"'));
console.log('残留 <script src=>:', /<script src=/.test(html));
console.log('内联 <style> 数:', (html.match(/<style>/g) || []).length);
console.log('内联 <script> 数:', (html.match(/<script>/g) || []).length);
