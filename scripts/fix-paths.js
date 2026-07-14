// fix-paths.js — repair the relative imports in src/commands
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..', 'src', 'commands');

function walk(dir) {
  const out = [];
  for (const item of fs.readdirSync(dir)) {
    const full = path.join(dir, item);
    if (fs.statSync(full).isDirectory()) out.push(...walk(full));
    else if (item.endsWith('.js')) out.push(full);
  }
  return out;
}

let fixed = 0;
for (const file of walk(root)) {
  let src = fs.readFileSync(file, 'utf8');
  const before = src;
  // from src/commands/<cat>/X.js  ->  src/helpers/, src/core/, src/middleware/
  src = src
    .replace(/require\('\.\.\/helpers\//g, "require('../../helpers/")
    .replace(/require\("\.\.\/helpers\//g, 'require("../../helpers/')
    .replace(/require\('\.\.\/core\//g, "require('../../core/")
    .replace(/require\("\.\.\/core\//g, 'require("../../core/')
    .replace(/require\('\.\.\/middleware\//g, "require('../../middleware/")
    .replace(/require\("\.\.\/middleware\//g, 'require("../../middleware/')
    .replace(/require\('\.\.\/config/g, "require('../../config")
    .replace(/require\("\.\.\/config/g, 'require("../../config');
  if (src !== before) {
    fs.writeFileSync(file, src);
    fixed++;
  }
}
console.log('Fixed', fixed, 'files.');
