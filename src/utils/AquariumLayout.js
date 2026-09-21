/** Allocate enough visible swimming room below the fixed aquarium toolbar.
 * The first (freshwater) zone formerly ended before the toolbar's safe area.
 * Keep the other three zones proportional to their species counts.
 */
export function getAquariumRegionHeights(height, counts = [9, 10, 16, 14]) {
    if (!Number.isFinite(height) || height <= 0 || counts.length !== 4 || counts.some(n => !Number.isFinite(n) || n <= 0)) {
        throw new Error('Invalid aquarium layout dimensions');
    }
    const firstZone = Math.min(height * 0.42, Math.max(height * 0.31, Math.min(390, height * 0.36)));
    const remaining = height - firstZone;
    const lowerTotal = counts.slice(1).reduce((sum, n) => sum + n, 0);
    return [firstZone, ...counts.slice(1).map(n => remaining * n / lowerTotal)];
}
