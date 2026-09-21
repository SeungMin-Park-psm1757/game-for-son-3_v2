import test from 'node:test';
import assert from 'node:assert/strict';
import { FISH_SIZE_CLASS, getFishDisplayWidth, getFishSizeTier } from '../src/utils/FishPresentation.js';
import { getFishBehavior, makeAmbientMotion, advanceAmbientFish } from '../src/utils/FishBehavior.js';
test('all regular and event species have intentional physical sizes', async () => {
  globalThis.window = { gameManagers: { playerModel: { isTutorialBoostActive: () => false, fishMilestonesSeen: {} } } };
  const { FISH_TYPES } = await import('../src/models/FishData.js');
  assert.equal(FISH_TYPES.length, 49);
  for (const fish of FISH_TYPES) {
    assert.ok(FISH_SIZE_CLASS[fish.id], fish.id);
    for (const place of ['water', 'approach', 'aquarium', 'catch']) {
      const width = getFishDisplayWidth(fish, place);
      assert.ok(width >= 70 && width <= 380, fish.id + ':' + place);
    }
  }
  assert.equal(getFishSizeTier({ id: 'fish_whale_shark', scale: .1953 }), 'giant');
  assert.equal(getFishSizeTier({ id: 'fish_anchovy', scale: .0684 }), 'tiny');
});
test('swim profiles stay in bounds and use delta time', () => {
  for (const id of ['fish_anchovy', 'fish_flounder', 'fish_tuna', 'fish_sunfish', 'fish_squid', 'fish_carp']) {
    const fish = { x: 100, y: 300, direction: 1, angle: 0, flipX: false };
    fish.motion = makeAmbientMotion({ id }, 1);
    fish.motion.baseY = 300;
    const initialX = fish.x;
    for (let i=0;i<120;i++) advanceAmbientFish(fish, 16, i*16, { minY: 260, maxY: 340 });
    assert.ok(fish.x > initialX, id);
    assert.ok(fish.y >= 260 && fish.y <= 340, id);
    assert.ok(Number.isFinite(fish.angle), id);
    assert.equal(fish.flipX, true);
  }
  assert.notEqual(getFishBehavior({id:'fish_tuna'}), getFishBehavior({id:'fish_manta_ray'}));
});
