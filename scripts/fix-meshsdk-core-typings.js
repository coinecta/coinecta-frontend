const fs = require('fs');
const path = require('path');

const filePath = path.resolve(__dirname, '../node_modules/@meshsdk/core/package.json');
const packageJson = require(filePath);

packageJson.exports['.']['types'] = './dist/index.d.ts';

fs.writeFileSync(filePath, JSON.stringify(packageJson, null, 2) + '\n');
