import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { FISH_ASSET_MANIFEST } from '../src/utils/FishAssetPolicy.js';
const destination = resolve(process.argv[2] || 'reports/fish_asset_policy.json');
mkdirSync(resolve(destination, '..'), { recursive: true });
writeFileSync(destination, JSON.stringify(FISH_ASSET_MANIFEST, null, 2) + '\n', 'utf8');
console.log('Exported fish asset policy to ' + destination);
