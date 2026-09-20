import test from 'node:test';
import assert from 'node:assert/strict';
import { FISH_ASSET_MANIFEST, getFishAssetPolicy } from '../src/utils/FishAssetPolicy.js';
test('every fish asset has a quality and size policy', () => {
    assert.equal(Object.keys(FISH_ASSET_MANIFEST).length, 49);
    for (const profile of Object.values(FISH_ASSET_MANIFEST)) {
        assert.ok(profile.minSourceEdge <= profile.preferredSourceEdge);
        assert.ok(profile.preferredSourceEdge <= profile.maxRecommendedEdge);
        assert.ok(profile.maxDisplayWidth >= 70 && profile.maxDisplayWidth <= 380);
        assert.equal(profile.minEffectiveDensity, 1.35);
    }
});
test('event aliases are marked as shared artwork pending dedicated PNGs', () => {
    const moon = getFishAssetPolicy('fish_moon_carp');
    const storm = getFishAssetPolicy('fish_storm_tuna');
    assert.equal(moon.sourceId, 'fish_carp');
    assert.equal(storm.sourceId, 'fish_tuna');
    assert.equal(moon.dedicatedArtMissing, true);
    assert.equal(storm.dedicatedArtMissing, true);
});
