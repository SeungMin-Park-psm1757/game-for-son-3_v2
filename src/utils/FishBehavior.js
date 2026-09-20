/** Distinct ambient swimming profiles; animations use existing PNGs, no new assets. */
const BEHAVIOR_BY_FISH = Object.freeze({
    fish_anchovy:'school', fish_smelt:'school', fish_gizzard_shad:'school', fish_pirami:'school',
    fish_loach:'bottom', fish_flounder:'bottom', fish_gwangeo:'bottom', fish_mangdoong:'bottom',
    fish_catfish:'bottom', fish_monkfish:'bottom', fish_moray_eel:'bottom',
    fish_tuna:'dash', fish_storm_tuna:'dash', fish_spanish_mackerel:'dash', fish_barracuda:'dash',
    fish_sailfish:'dash', fish_cheongsaechi:'dash', fish_flying_fish:'dash', fish_bangeo:'dash',
    fish_sunfish:'glide', fish_manta_ray:'glide', fish_whale_shark:'glide', fish_carp:'glide',
    fish_moon_carp:'glide', fish_gamulchi:'glide', fish_oarfish:'glide',
    fish_squid:'jet', fish_giant_squid:'jet', fish_webfoot_octopus:'jet'
});
const PROFILE = Object.freeze({
    school: { speed: 52, bob: 5, turn: 3 },
    bottom: { speed: 22, bob: 2, turn: 2 },
    dash: { speed: 48, bob: 6, turn: 6 },
    glide: { speed: 22, bob: 4, turn: 3 },
    jet: { speed: 26, bob: 7, turn: 8 },
    cruise: { speed: 38, bob: 5, turn: 4 }
});
export function getFishBehavior(fish) { return BEHAVIOR_BY_FISH[fish?.id] || 'cruise'; }
export function makeAmbientMotion(fish, seed = Math.random() * Math.PI * 2) {
    const kind = getFishBehavior(fish);
    return { kind, seed, speed: PROFILE[kind].speed * (0.85 + Math.random() * 0.3),
        baseY: 0, phaseMs: 0, turnCooldown: 0 };
}
/** Advance one sprite's ambient motion without allocating graphics each frame. */
export function advanceAmbientFish(sprite, delta, time, bounds) {
    const state = sprite.motion;
    if (!state) return;
    const dt = Math.max(0, Math.min(50, delta)) / 1000;
    state.phaseMs += Math.max(0, Math.min(50, delta));
    const cycle = state.phaseMs / 1000;
    let multiplier = 1;
    if (state.kind === 'dash') multiplier = (cycle % 4 < 0.65) ? 2.35 : 0.78;
    else if (state.kind === 'jet') multiplier = (cycle % 3 < 0.45) ? 2.1 : 0.18;
    else if (state.kind === 'bottom') multiplier = (cycle % 5 < 0.9) ? 0.1 : 0.8;
    else if (state.kind === 'glide') multiplier = 0.7 + 0.15 * Math.sin(cycle);
    else if (state.kind === 'school') multiplier = 1 + 0.12 * Math.sin(cycle * 2 + state.seed);
    sprite.x += state.speed * multiplier * sprite.direction * dt;
    const config = PROFILE[state.kind];
    const center = state.baseY || sprite.y;
    sprite.y = Math.max(bounds.minY, Math.min(bounds.maxY, center + Math.sin(time * 0.0018 + state.seed) * config.bob));
    sprite.angle = Math.sin(time * 0.0012 + state.seed) * config.turn;
    sprite.flipX = sprite.direction === 1;
}
