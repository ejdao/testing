const { existsSync, readdirSync } = require('fs');
const { resolve } = require('path');

console.log('CWD:', process.cwd());
console.log('__dirname:', __dirname);

const projectRoot = resolve(__dirname, '..');
console.log('Project root:', projectRoot);
console.log('Exists?', existsSync(projectRoot));

const entries = readdirSync(projectRoot);
console.log('Root entries:', entries.join(', '));

const componentsPath = resolve(projectRoot, 'components');
console.log('Components path:', componentsPath);
console.log('Components exists?', existsSync(componentsPath));
