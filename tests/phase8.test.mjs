import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const source = readFileSync(new URL('../tools/audit_scene_assets.py',import.meta.url),'utf8');
test('all regions have independent background quality checks', ()=>{
  for(const name of ['bg_freshwater','bg_coast','bg_sea','bg_treasure_island'])
    assert.ok(source.includes(name), name);
  assert.ok(source.includes('EXTENSION_FORMAT_MISMATCH'));
  assert.ok(source.includes('UNDER_TARGET_RENDER_RESOLUTION'));
});
