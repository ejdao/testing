const { existsSync, readdirSync } = require('fs');
const { resolve } = require('path');

// Check various possible paths
const candidates = [
  '/vercel/share/v0-project',
  '/home/user',
  process.cwd(),
  resolve(process.cwd(), '..'),
  resolve(process.cwd(), '../..'),
];

for (const p of candidates) {
  console.log(`\n--- ${p} ---`);
  console.log('Exists:', existsSync(p));
  if (existsSync(p)) {
    try {
      const entries = readdirSync(p);
      console.log('Entries:', entries.join(', '));
    } catch (e) {
      console.log('Error reading:', e.message);
    }
  }
}

// Also check if CWD itself has components
const cwdEntries = readdirSync(process.cwd());
console.log('\n--- CWD contents ---');
console.log(cwdEntries.join(', '));
