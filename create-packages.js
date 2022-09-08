const fs = require('fs');
const path = require('path');

/**
 * This script creates per-distribution package.json files for the MJS and CJS bundles
 * These package.json files defines the default package type for the .dist/* sub-directories.
 * The main package.json does not have a "type" property. Rather, we push that down to the package.json files under the ./dist/* sub-directories.
 */

/**
 * CommonJS package.json content
 */
const cjsPackageJsonContent = {
  type: 'commonjs',
  types: './src/index.d.ts',
};

/**
 * MJS package.json content
 */
const mjsPackageJsonContent = {
  type: 'module',
  types: './src/index.d.ts',
};

/**
 * Create files
 */
fs.writeFileSync(path.resolve('./dist/cjs/package.json'), JSON.stringify(cjsPackageJsonContent, undefined, 2));
fs.writeFileSync(path.resolve('./dist/mjs/package.json'), JSON.stringify(mjsPackageJsonContent, undefined, 2));
