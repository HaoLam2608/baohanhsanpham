const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Config
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/bh_cau_long';
const backupDir = path.join(__dirname, '..', 'backup');

function findLatestArchive() {
  if (!fs.existsSync(backupDir)) return null;
  const files = fs.readdirSync(backupDir)
    .filter(f => f.endsWith('.archive.gz'))
    .map(f => ({ name: f, mtime: fs.statSync(path.join(backupDir, f)).mtime }))
    .sort((a, b) => b.mtime - a.mtime);
  return files.length ? path.join(backupDir, files[0].name) : null;
}

const argPath = process.argv[2];
let archivePath = argPath;

if (!archivePath) {
  archivePath = findLatestArchive();
  if (!archivePath) {
    console.error('No archive specified and no archives found in', backupDir);
    console.error('Usage: node restore.js <path-to-archive> (or put archive in backup/ and run without args)');
    process.exit(1);
  }
}

if (!fs.existsSync(archivePath)) {
  console.error('Archive not found:', archivePath);
  process.exit(1);
}

console.log('Starting mongorestore from', archivePath);

const args = ['--uri', MONGO_URI, `--archive=${archivePath}`, '--gzip', '--drop'];

const res = spawnSync('mongorestore', args, { stdio: 'inherit' });

if (res.error) {
  console.error('Failed to run mongorestore:', res.error.message || res.error);
  process.exit(1);
}

if (res.status !== 0) {
  console.error('mongorestore exited with code', res.status);
  process.exit(res.status || 1);
}

console.log('Restore completed from', archivePath);
process.exit(0);
