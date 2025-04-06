const fs = require('fs-extra');
const path = require('path');
const { execSync } = require('child_process');

const root = process.cwd();
const buildDir = path.join(root, 'electron-build');
const angularDist = path.join(root, 'dist/client');

// 1. Clean previous electron-build
fs.removeSync(buildDir);
fs.mkdirSync(buildDir);

// 2. Copy necessary files
fs.copySync('main.js', path.join(buildDir, 'main.js'));
if (fs.existsSync('preload.js')) {
    fs.copySync('preload.js', path.join(buildDir, 'preload.js'));
}

// 3. Create a clean package.json
const minimalPkg = {
    name: 'polyhoot',
    version: '1.0.0',
    main: 'main.js',
    dependencies: {
        express: '^5.1.0',
    },
};

fs.writeJSONSync(path.join(buildDir, 'package.json'), minimalPkg, { spaces: 2 });

fs.copySync(angularDist, path.join(buildDir, 'dist/client'));

// 4. Install only production dependencies
console.log('Installing production dependencies...');
execSync('npm install --production', { cwd: buildDir, stdio: 'inherit' });

// 5. Package the app
console.log('Packaging Electron app...');
execSync('npx electron-packager ./electron-build PolyHoot --asar --overwrite --out=./build', {
    stdio: 'inherit',
});

console.log('✅ Electron app built successfully.');
