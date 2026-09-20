/** Event species reuse the original fish PNG, with separate non-destructive Phaser effects. */
export const EVENT_FISH_THEMES = Object.freeze({
    fish_moon_carp: Object.freeze({ halo: 0xffe8a0, spark: 0xffffff, glint: 0xfff3cc, alpha: 0.17 }),
    fish_storm_tuna: Object.freeze({ halo: 0x77ceff, spark: 0xd4eaff, glint: 0x90bbff, alpha: 0.14 })
});
export function getEventFishTheme(fishOrId) {
    return EVENT_FISH_THEMES[typeof fishOrId === 'string' ? fishOrId : fishOrId?.id] || null;
}
