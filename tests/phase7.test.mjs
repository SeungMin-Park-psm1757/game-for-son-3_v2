import test from 'node:test';
import assert from 'node:assert/strict';
import { getEventFishTheme } from '../src/utils/EventFishVisual.js';
test('event species have distinct, non-destructive visual themes', () => {
    const moon = getEventFishTheme('fish_moon_carp');
    const storm = getEventFishTheme('fish_storm_tuna');
    assert.ok(moon && storm);
    assert.notEqual(moon.halo, storm.halo);
    assert.equal(getEventFishTheme('fish_carp'), null);
});
