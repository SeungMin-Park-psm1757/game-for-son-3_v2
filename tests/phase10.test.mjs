import test from 'node:test';
import assert from 'node:assert/strict';
import { getAspectCoverSize, fitBackgroundCover, chooseImageFilter } from '../src/utils/ImagePresentation.js';

test('square source fills portrait frame without nonuniform distortion', () => {
    const result = getAspectCoverSize(640, 640, 720, 1280);
    assert.equal(result.width, 1280);
    assert.equal(result.height, 1280);
    assert.equal(result.width / result.height, 1);
    assert.ok(result.width >= 720 && result.height >= 1280);
});

test('portrait source fits a portrait frame without distortion', () => {
    const result = getAspectCoverSize(360, 640, 720, 1280);
    assert.equal(result.width, 720);
    assert.equal(result.height, 1280);
});

test('invalid source dimensions fail before game render', () => {
    assert.throws(() => getAspectCoverSize(0, 640, 720, 1280), RangeError);
    assert.throws(() => getAspectCoverSize(640, NaN, 720, 1280), RangeError);
});

test('cover fitter modifies only displayed size', () => {
    const image = { width: 640, height: 640, setDisplaySize(w, h) { this.displayWidth=w; this.displayHeight=h; } };
    const result = fitBackgroundCover(image, 720, 1280);
    assert.equal(image.width, 640);
    assert.equal(image.displayWidth, 1280);
    assert.equal(image.displayHeight, 1280);
    assert.equal(result.scale, 2);
});

test('large fish and scenery use linear minification, original small fish remain nearest', () => {
    assert.equal(chooseImageFilter('bg_freshwater',640,640),'linear');
    assert.equal(chooseImageFilter('fish_whale_shark',1536,1536),'linear');
    assert.equal(chooseImageFilter('fish_carp',256,256),'nearest');
    assert.equal(chooseImageFilter('char_lv1',128,128),'nearest');
    assert.equal(chooseImageFilter('platform_dock',256,128),'nearest');
});
