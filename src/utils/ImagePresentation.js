/**
 * Frame-fill for existing legacy square art. Scale uniformly and clip overflow
 * instead of distorting the original proportions. No texture pixels are changed.
 */
export function getAspectCoverSize(sourceWidth, sourceHeight, viewportWidth, viewportHeight) {
    const dimensions = [sourceWidth, sourceHeight, viewportWidth, viewportHeight];
    if (dimensions.some(v => !Number.isFinite(v) || v <= 0)) {
        throw new RangeError('Background dimensions must be positive and finite');
    }
    const scale = Math.max(viewportWidth / sourceWidth, viewportHeight / sourceHeight);
    return { width: sourceWidth * scale, height: sourceHeight * scale, scale };
}

export function fitBackgroundCover(image, viewportWidth, viewportHeight) {
    const result = getAspectCoverSize(image.width, image.height, viewportWidth, viewportHeight);
    image.setDisplaySize(result.width, result.height);
    return result;
}

/** Retain nearest-neighbor for small original sprites, smoothly minify large PNGs. */
export function chooseImageFilter(key, nativeWidth, nativeHeight) {
    if (key.startsWith('bg_')) return 'linear';
    if (key.startsWith('fish_') && Math.max(nativeWidth, nativeHeight) >= 512) return 'linear';
    return 'nearest';
}
