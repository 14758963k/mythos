// bundle.js — create a portable zip of the project.
// Copies the project to a temp staging folder, skipping node_modules / research
// / auth_info, then zips the staged copy.

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const os = require('os');

const projectRoot = path.resolve(__dirname, '..');
const out = path.join(projectRoot, '..', 'mythos-bundle.zip');
const stage = path.join(os.tmpdir(), 'mythos-' + Date.now());

const SKIP_DIRS = new Set(['node_modules', 'auth_info', 'research', '.git']);
const SKIP_FILES = new Set(['.env']);

function copyDir(src, dst) {
  fs.mkdirSync(dst, { recursive: true });
  for (const item of fs.readdirSync(src)) {
    if (SKIP_DIRS.has(item)) continue;
    const sp = path.join(src, item);
    const dp = path.join(dst, item);
    const stat = fs.statSync(sp);
    if (SKIP_FILES.has(item)) continue;
    if (item.endsWith('.log')) continue;
    if (stat.isDirectory()) copyDir(sp, dp);
    else fs.copyFileSync(sp, dp);
  }
}

function rmDir(p) {
  if (!fs.existsSync(p)) return;
  for (const item of fs.readdirSync(p)) {
    const full = path.join(p, item);
    if (fs.statSync(full).isDirectory()) rmDir(full);
    else fs.unlinkSync(full);
  }
  fs.rmdirSync(p);
}

console.log('Staging files in', stage);
copyDir(projectRoot, stage);
// rename to 'mythos' inside the zip
const finalStage = path.join(path.dirname(stage), 'mythos');
fs.renameSync(stage, finalStage);

if (fs.existsSync(out)) fs.unlinkSync(out);

console.log('Creating zip...');
const stagePosix = finalStage.replace(/\\/g, '/');
const ps = `
$ErrorActionPreference = "Stop"
Add-Type -AssemblyName "System.IO.Compression.FileSystem"
$src = "${stagePosix}"
$dst = "${out.replace(/\\/g, '\\\\')}"
[System.IO.Compression.ZipFile]::CreateFromDirectory($src, $dst, [System.IO.Compression.CompressionLevel]::Optimal, $true)
Write-Output ("DONE " + (Get-Item $dst).Length)
`;
const tmpPs = path.join(os.tmpdir(), 'bundle-' + Date.now() + '.ps1');
fs.writeFileSync(tmpPs, ps, 'utf8');
try {
  const out2 = execFileSync('powershell', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', tmpPs], { encoding: 'utf8' });
  console.log(out2.trim());
} finally {
  try { fs.unlinkSync(tmpPs); } catch {}
  rmDir(finalStage);
}

const sz = fs.statSync(out).size;
console.log('Bundle:', out);
console.log('Size  :', (sz / 1024).toFixed(1) + ' KB (' + (sz / 1024 / 1024).toFixed(2) + ' MB)');
