const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Config
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/bh_cau_long';
const backupDir = path.join(__dirname, '..', 'backup');

if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const archiveName = `db-${timestamp}.archive.gz`;
const archivePath = path.join(backupDir, archiveName);

console.log('Starting mongodump ->', archivePath);

const args = ['--uri', MONGO_URI, `--archive=${archivePath}`, '--gzip'];

const res = spawnSync('mongodump', args, { stdio: 'inherit' });

if (res.error) {
  console.error('Failed to run mongodump:', res.error.message || res.error);
  process.exit(1);
}

if (res.status !== 0) {
  console.error('mongodump exited with code', res.status);
  process.exit(res.status || 1);
}

console.log('Backup completed:', archivePath);
process.exit(0);
