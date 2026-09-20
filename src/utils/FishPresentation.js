/** Logical fish sizes are independent of PNG source resolution and scene scale. */
export const FISH_SIZE_CLASS = Object.freeze({
    fish_pirami: 'XS',
    fish_loach: 'XS',
    fish_smelt: 'XS',
    fish_boonguh: 'S',
    fish_catfish: 'MS',
    fish_ssogari: 'MS',
    fish_carp: 'M',
    fish_gamulchi: 'ML',
    fish_anchovy: 'XS',
    fish_mangdoong: 'XS',
    fish_gizzard_shad: 'S',
    fish_webfoot_octopus: 'S',
    fish_urock: 'MS',
    fish_flounder: 'MS',
    fish_black_porgy: 'MS',
    fish_gwangeo: 'ML',
    fish_sea_bass: 'ML',
    fish_chamdom: 'M',
    fish_saury: 'S',
    fish_godeungeo: 'MS',
    fish_squid: 'MS',
    fish_spanish_mackerel: 'M',
    fish_pollack: 'M',
    fish_salmon: 'M',
    fish_galchi: 'M',
    fish_cod: 'M',
    fish_monkfish: 'M',
    fish_bangeo: 'ML',
    fish_tuna: 'L',
    fish_sunfish: 'L',
    fish_striped_jewfish: 'ML',
    fish_cheongsaechi: 'L',
    fish_whale_shark: 'SPECIAL',
    fish_flying_fish: 'S',
    fish_lionfish: 'S',
    fish_parrotfish: 'MS',
    fish_moray_eel: 'ML',
    fish_barracuda: 'ML',
    fish_mahi_mahi: 'ML',
    fish_giant_trevally: 'ML',
    fish_sailfish: 'L',
    fish_hammerhead: 'L',
    fish_manta_ray: 'XL',
    fish_giant_squid: 'XL',
    fish_golden_fish: 'MS',
    fish_coelacanth: 'L',
    fish_oarfish: 'XL',
    item_shoe: 'S',
    item_trash: 'XS',
    item_treasure: 'M',
    item_treasure_map: 'M',
    item_pirates_sword: 'M',
    item_pearl: 'S',
    item_crown: 'M',
    fish_moon_carp: 'M',
    fish_storm_tuna: 'L'
});

const LOGICAL_WIDTH = { XS: 70, S: 105, MS: 145, M: 180, ML: 220, L: 260, XL: 300, SPECIAL: 380 };
const CATEGORY_TIER = { XS: 'tiny', S: 'small', MS: 'medium', M: 'medium', ML: 'large', L: 'large', XL: 'giant', SPECIAL: 'giant' };
export function getFishSizeCategory(fish) {
    return FISH_SIZE_CLASS[fish?.id] || 'M';
}
export function getFishSizeTier(fishOrScale) {
    if (typeof fishOrScale === 'object' && fishOrScale?.id && FISH_SIZE_CLASS[fishOrScale.id]) {
        return CATEGORY_TIER[FISH_SIZE_CLASS[fishOrScale.id]];
    }
    const scale = typeof fishOrScale === 'number' ? fishOrScale : (fishOrScale?.scale || 0);
    if (scale < 0.09) return 'tiny';
    if (scale < 0.24) return 'small';
    if (scale < 0.75) return 'medium';
    if (scale < 1.05) return 'large';
    return 'giant';
}
export function getFishDisplayWidth(fish, context = 'water', growth = 1, variance = 1) {
    const base = LOGICAL_WIDTH[getFishSizeCategory(fish)];
    if (context === 'aquarium') return Math.min(268, Math.max(76, base * 0.76 * growth * variance));
    if (context === 'approach') return Math.min(340, Math.max(84, base * growth));
    if (context === 'catch') return Math.min(380, Math.max(95, base * growth));
    return Math.min(300, Math.max(70, base * 0.82 * growth));
}
