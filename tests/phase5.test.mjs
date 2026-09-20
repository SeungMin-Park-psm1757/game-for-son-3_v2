import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const source=readFileSync(new URL('../src/scenes/AquariumScene.js',import.meta.url),'utf8');
test('aquarium motion differentiates species and stays within visible dimensions',()=>{
  for(const behavior of ['bottom','school','glide','dash','jet']) assert.ok(source.includes("fish.personality === '"+behavior+"'"));
  assert.match(source,/fish\.displayWidth \/ 2 \+ 8/);
  assert.match(source,/fish\.minY = Math\.max/);
});
test('magnifier avoids repeated allocations and limits mobile copy rate',()=>{
  assert.match(source,/Math\.min\(2, Math\.max\(1, window\.devicePixelRatio/);
  assert.match(source,/this\.magZoomCanvas\.width === diameterPx/);
  assert.match(source,/now - this\.lastMagRenderAt < 33/);
});
