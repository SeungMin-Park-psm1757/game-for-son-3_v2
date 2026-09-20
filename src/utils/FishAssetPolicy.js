import { FISH_SIZE_CLASS, getFishDisplayWidth } from './FishPresentation.js';

/**
 * Asset quality targets, not a requirement to upscale pixels.
 * Original PNGs stay untouched unless a downsample preserves the source-to-display detail ratio.
 */
export const FISH_ASSET_CATEGORY_POLICY = Object.freeze({
    XS: { minSourceEdge: 384, preferredSourceEdge: 512, maxRecommendedEdge: 768, minEffectiveDensity: 1.35 },
    S: { minSourceEdge: 384, preferredSourceEdge: 512, maxRecommendedEdge: 768, minEffectiveDensity: 1.35 },
    MS: { minSourceEdge: 512, preferredSourceEdge: 768, maxRecommendedEdge: 1024, minEffectiveDensity: 1.35 },
    M: { minSourceEdge: 512, preferredSourceEdge: 768, maxRecommendedEdge: 1024, minEffectiveDensity: 1.35 },
    ML: { minSourceEdge: 768, preferredSourceEdge: 1024, maxRecommendedEdge: 1536, minEffectiveDensity: 1.35 },
    L: { minSourceEdge: 768, preferredSourceEdge: 1024, maxRecommendedEdge: 1536, minEffectiveDensity: 1.35 },
    XL: { minSourceEdge: 1024, preferredSourceEdge: 1024, maxRecommendedEdge: 1536, minEffectiveDensity: 1.35 },
    SPECIAL: { minSourceEdge: 1024, preferredSourceEdge: 1024, maxRecommendedEdge: 1536, minEffectiveDensity: 1.35 }
});

export const FISH_ASSET_OVERRIDES = Object.freeze({
    fish_whale_shark: { priority: 'high', preferredSourceEdge: 1536 },
    fish_manta_ray: { priority: 'high', preferredSourceEdge: 1536 },
    fish_oarfish: { priority: 'high', preferredSourceEdge: 1536 },
    fish_giant_squid: { priority: 'high', preferredSourceEdge: 1536 },
    fish_sunfish: { priority: 'high' },
    fish_moon_carp: { priority: 'critical', sourceId: 'fish_carp', dedicatedArtMissing: true },
    fish_storm_tuna: { priority: 'critical', sourceId: 'fish_tuna', dedicatedArtMissing: true }
});

export function getFishAssetPolicy(fishOrId) {
    const id = typeof fishOrId === 'string' ? fishOrId : fishOrId?.id;
    const sizeClass = FISH_SIZE_CLASS[id] || 'M';
    const base = FISH_ASSET_CATEGORY_POLICY[sizeClass];
    const overrides = FISH_ASSET_OVERRIDES[id] || {};
    const sourceId = overrides.sourceId || id;
    const fish = { id };
    return { fishId: id, sourceId, sizeClass, priority: 'normal',
        maxDisplayWidth: Math.max(getFishDisplayWidth(fish, 'catch'), getFishDisplayWidth(fish, 'approach')),
        ...base, ...overrides };
}

export const FISH_ASSET_MANIFEST = Object.freeze(
    Object.fromEntries(Object.keys(FISH_SIZE_CLASS)
        .filter(id => id.startsWith('fish_'))
        .map(id => [id, getFishAssetPolicy(id)]))
);
