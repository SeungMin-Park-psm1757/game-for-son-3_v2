import test from 'node:test';
import assert from 'node:assert/strict';
globalThis.Phaser = { Scene: class {}, Math: { Clamp: (value, min, max) => Math.max(min, Math.min(max, value)) } };
globalThis.window = { gameManagers: { playerModel: { stats: {rodPower:1,reelSpeed:1,focusRing:1}, isTutorialBoostActive: () => false, fishMilestonesSeen: {} } } };
const { default: GameScene } = await import('../src/scenes/GameScene.js');
const { FISH_TYPES } = await import('../src/models/FishData.js');
const scene = Object.create(GameScene.prototype);
scene.region = 1;
scene.isBossFight = false;
scene.bossVariant = 'normal';
scene.castingBonus = 1;
scene.consecutiveFails = 0;
function config(id, stats, isBoss = false) {
  const fish = FISH_TYPES.find(f => f.id === id);
  const max = fish.catchMax * (isBoss ? 2.4 : 1);
  const start = max * (isBoss ? 0.18 : 0.15);
  const cfg = scene.getCatchConfig(fish, null, {stats, region:fish.region, isBossFight:isBoss, bossVariant:'first', catchMax:max, startGauge:start, timeLimit:isBoss ? 18 : 0});
  return {cfg, remaining:max-start};
}
test('early fish takes several taps instead of one', () => {
  const {cfg, remaining} = config('fish_pirami', {rodPower:1,reelSpeed:1,focusRing:1});
  assert.ok(cfg.tapGain <= remaining / 4 + 0.01);
  assert.ok(cfg.tapGain * 4 > cfg.drainPerSecond);
});
test('fully upgraded late fish has achievable but non-instant catch', () => {
  const {cfg, remaining} = config('fish_oarfish', {rodPower:20,reelSpeed:20,focusRing:3});
  const rate = 5;
  const net = rate * cfg.tapGain - cfg.drainPerSecond;
  assert.ok(net > 0);
  assert.ok(remaining / net <= 15, String(remaining/net));
  assert.ok(cfg.tapGain <= remaining / 14 + 0.01);
});
test('boss pressure fits within the current time limit at steady taps', () => {
  const {cfg, remaining} = config('fish_gamulchi', {rodPower:6,reelSpeed:5,focusRing:2}, true);
  const net = 5 * cfg.tapGain - cfg.drainPerSecond;
  assert.ok(net > 0);
  assert.ok(remaining / net < 18, String(remaining/net));
});
