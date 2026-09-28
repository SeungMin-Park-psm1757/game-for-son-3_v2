import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const read = p => readFileSync(new URL('../' + p, import.meta.url), 'utf8');
test('mobile header stays on one compact row with visible gold and goal', () => {
    const css = read('styles/main.css');
    assert.match(css, /grid-template-areas:\s*"gold goal book mute shop"/);
    assert.match(css, /#gold-display\s*\{\s*grid-area:\s*gold/);
    assert.match(css, /#late-goal-display\s*\{\s*grid-area:\s*goal/);
    assert.match(css, /#book-open-btn, #shop-open-btn, #mute-btn\s*\{[\s\S]*?min-height:\s*42px/);
    assert.match(css, /#late-goal-display\s*\{[\s\S]*?text-overflow:\s*ellipsis/);
});
test('mobile popups scroll within the screen', () => {
    const css = read('styles/main.css');
    assert.match(css, /max-height: calc\(100dvh - 24px\)/);
    assert.match(css, /overscroll-behavior:\s*contain/);
});
test('Phaser menu buttons have handset-friendly logical hit areas', () => {
    assert.match(read('src/scenes/IntroScene.js'), /Math\.min\(88, Math\.max\(70, 44 \/ unit\)\)/);
    assert.match(read('src/scenes/IntroScene.js'), /const buttonHeight = requestedHeight;/);
});
