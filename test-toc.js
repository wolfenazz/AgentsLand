const fs = require('fs');
const c = fs.readFileSync('app/dist/assets/index-CpBT6LA0.js', 'utf8');

// Find S3 assignment
const idx = c.indexOf('const S3=');
if (idx === -1) { console.log('NOT FOUND'); process.exit(1); }

// Extract content between backticks
let start = idx + 'const S3='.length;
if (c[start] !== '`') { console.log('Not a template literal'); process.exit(1); }
start++; // skip opening backtick

// Find closing backtick
let end = start;
while (end < c.length) {
  if (c[end] === '\\') { end += 2; continue; }
  if (c[end] === '`') break;
  end++;
}

const content = c.slice(start, end);
console.log('Content length:', content.length);
console.log('First 200:', JSON.stringify(content.slice(0, 200)));
console.log('---');

// Test the same logic as the component
const lines = content.split('\n');
console.log('Line count:', lines.length);

const items = [];
lines.forEach((line, i) => {
  const h2 = line.match(/^## (.+)$/);
  const h3 = line.match(/^### (.+)$/);
  if (h2) items.push({ line: i + 1, level: 2, text: h2[1] });
  if (h3) items.push({ line: i + 1, level: 3, text: h3[1] });
});

console.log('TOC items found:', items.length);
items.forEach(it => console.log('  H' + it.level + ' line ' + it.line + ': ' + it.text));
