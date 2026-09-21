import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const read = p => readFileSync(new URL('../' + p, import.meta.url), 'utf8');
test('mobile header has separate goal row and always-visible gold', () => {
    const css = read('styles/main.css');
    assert.match(css, /grid-template-areas:\s*"gold book mute shop" "goal goal goal goal"/);
    assert.match(css, /#gold-display\s*\{\s*grid-area:\s*gold/);
    assert.match(css, /#late-goal-display\s*\{\s*grid-area:\s*goal/);
    assert.match(css, /#book-open-btn, #shop-open-btn, #mute-btn\s*\{[\s\S]*?min-height:\s*44px/);
});
test('mobile popups scroll within the screen', () => {
    const css = read('styles/main.css');
    assert.match(css, /max-height: calc\(100dvh - 24px\)/);
    assert.match(css, /overscroll-behavior:\s*contain/);
});
test('Phaser menu buttons have handset-friendly logical hit areas', () => {
    assert.match(read('src/scenes/IntroScene.js'), /const btnHeight = 84;/);
    assert.match(read('src/scenes/IntroScene.js'), /\? 76 : 82;/);
});
