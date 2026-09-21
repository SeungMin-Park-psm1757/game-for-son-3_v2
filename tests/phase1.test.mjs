import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { getAquariumRegionHeights } from '../src/utils/AquariumLayout.js';

test('freshwater fish can swim below the toolbar inside their region', () => {
    const h = getAquariumRegionHeights(1280);
    assert.equal(h.length, 4);
    assert.ok(Math.abs(h.reduce((a, b) => a + b, 0) - 1280) < 1e-6);
    assert.ok(Math.max(h[0] * 0.18, 226) + 24 < h[0] * 0.82);
});

test('all swimming zones stay positive across supported canvas sizes', () => {
    for (const height of [720, 960, 1280, 1600]) {
        const zones = getAquariumRegionHeights(height);
        assert.ok(zones.every(z => z > 0));
        assert.ok(Math.abs(zones.reduce((a, b) => a + b, 0) - height) < 1e-6);
    }
});

test('event-only fish cannot be rolled through the ordinary fishing pool', async () => {
    globalThis.window = { gameManagers: { playerModel: { isTutorialBoostActive: () => false, fishMilestonesSeen: {} } } };
    const { getRandomFish } = await import('../src/models/FishData.js');
    for (let region = 1; region <= 4; region++) {
        for (let i = 0; i < 300; i++) {
            const sampled = getRandomFish(20, region, 3, 30, 3, { avoidSpecialItems: true });
            assert.equal(sampled.eventOnly, undefined);
            assert.equal(sampled.region, region);
        }
    }
});

test('background fish selection explicitly excludes special-item drops', () => {
    const source = readFileSync(new URL('../src/scenes/GameScene.js', import.meta.url), 'utf8');
    assert.ok(!source.includes('getRandomFish(0, this.region)'));
    assert.ok(source.includes('{ avoidSpecialItems: true }'));
});
