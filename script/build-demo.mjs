import { execSync } from 'child_process';
import fs from 'fs';
import glob from 'glob';
import { rimrafSync } from 'rimraf';
import path from 'path';

try {
  console.log('🔹 Building wheel...');
  rimrafSync(path.join('dist'));
  execSync('python -m build --no-isolation -w', { stdio: 'inherit' });

  console.log('🔹 Renaming wheel...');
  const files = glob.sync('dist/ptjnb-*.whl');
  if (files.length === 0) throw new Error('No wheel file found in dist/');
  if (files.length > 1)
    throw new Error('Multiple wheel files found: ' + files.join(', '));

  const srcWheel = files[0];
  const destWheel = path.join('dist', 'ptjnb-0.0.0-py3-none-any.whl');
  fs.renameSync(srcWheel, destWheel);
  console.log(`Renamed ${srcWheel} → ${destWheel}`);

  console.log('🔹 Cleaning demo folder...');
  const demoDir = 'demo';
  rimrafSync(path.join(demoDir, '.jupyterlite.doit.db'));
  rimrafSync(path.join(demoDir, '_output'));
  console.log('Cleaned demo folder');

  console.log('🔹 Building Jupyter Lite...');
  execSync('jupyter lite build .', { cwd: demoDir, stdio: 'inherit' });
  console.log('✅ Demo build complete');
} catch (err) {
  console.error('Build failed:', err);
  process.exit(1);
}
