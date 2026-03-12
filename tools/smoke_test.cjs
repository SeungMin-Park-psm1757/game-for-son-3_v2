const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const baseUrl = 'http://127.0.0.1:4187/index.html';
const outputDir = path.join(process.cwd(), 'test-output');

const saveData = {
    gold: 18000,
    stats: { rodPower: 6, catchChance: 4, reelSpeed: 5, rodLuck: 2, focusRing: 2 },
    fishCollection: {
        fish_pirami: 5,
        fish_carp: 15,
        fish_tuna: 30,
        fish_flying_fish: 5,
        fish_lionfish: 5,
        fish_parrotfish: 5,
        fish_anchovy: 5,
        fish_mangdoong: 5,
        fish_gizzard_shad: 5
    },
    currentChapter: 4,
    highestChapter: 4,
    hasSeenFirstStory: true,
    hasSeenMidChapterEvent: {},
    fishMilestonesSeen: {
        fish_pirami: { 5: true },
        fish_carp: { 5: true, 15: true },
        fish_tuna: { 5: true, 15: true, 30: true }
    },
    snacksPurchased: { aquarium_special_snack: 3 },
    decorPurchased: {
        aquarium_coral_garden: 1,
        aquarium_shell_bed: 1,
        aquarium_bubble_fountain: 1,
        aquarium_treasure_castle: 1,
        aquarium_kelp_arch: 1
    },
    eventCards: {},
    bossDefeated: {},
    bossFailed: { 2: 1 },
    bossDefeatedCount: {},
    maxLevelCelebrated: {},
    allMaxCelebrated: false,
    seyeonMaxEventSeen: {},
    comboBook: {},
    activeComboGoals: [],
    specialSnackFedCount: 7,
    specialSnackBehaviorsSeen: { swarm_first: true, bubble_ring: true },
    aquariumMomentsSeen: { homeSeaStory: true },
    firstPlayStartedAt: Date.now() - (10 * 60 * 1000),
    tutorialBoostEndsAt: Date.now() - (5 * 60 * 1000)
};

function assert(condition, message) {
    if (!condition) {
        throw new Error(message);
    }
}

(async () => {
    fs.mkdirSync(outputDir, { recursive: true });

    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 720, height: 1280 } });
    const pageErrors = [];
    const consoleErrors = [];

    page.on('pageerror', (error) => pageErrors.push(error.message));
    page.on('console', (msg) => {
        if (msg.type() === 'error') {
            consoleErrors.push(msg.text());
        }
    });

    await page.goto(baseUrl, { waitUntil: 'networkidle' });
    await page.evaluate((data) => {
        localStorage.setItem('fishingGameData', JSON.stringify(data));
    }, saveData);
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForFunction(() => window.gameManagers && window.gameManagers._phaserGame && window.gameManagers.uiManager);
    await page.waitForTimeout(1200);

    const topBarState = await page.evaluate(() => {
        const persistent = document.getElementById('persistent-ui');
        return {
            childIds: Array.from(persistent.children).map((el) => el.id),
            flexWrap: getComputedStyle(persistent).flexWrap,
            hasSpellingButton: !!document.getElementById('spelling-open-btn')
        };
    });

    assert(topBarState.flexWrap === 'nowrap', `expected persistent UI to stay on one row, got ${topBarState.flexWrap}`);
    assert(topBarState.hasSpellingButton === false, 'spelling button should be removed from the top bar');
    assert(topBarState.childIds.join(',') === 'gold-display,book-open-btn,mute-btn,shop-open-btn', `unexpected top bar items: ${topBarState.childIds.join(',')}`);

    const comboPopupState = await page.evaluate(() => {
        window.gameManagers.uiManager.openComboBook();
        const popup = document.getElementById('combo-book-popup');
        const goalCount = popup.querySelectorAll('.combo-goal-card').length;
        const cardCount = popup.querySelectorAll('.combo-card').length;
        document.getElementById('combo-book-close-btn').click();
        return { exists: !!popup, goalCount, cardCount };
    });

    assert(comboPopupState.exists, 'combo book popup should open');
    assert(comboPopupState.goalCount >= 1, 'combo book should show active goals');
    assert(comboPopupState.cardCount >= 10, 'combo book should render combo cards');

    await page.evaluate(() => {
        window.gameManagers._phaserGame.scene.start('AquariumScene');
    });
    await page.waitForTimeout(1200);

    const aquariumState = await page.evaluate(() => {
        const scene = window.gameManagers._phaserGame.scene.getScene('AquariumScene');
        scene.toggleMagnifier(true);
        scene.updateMagnifier(360, 40);
        const topProbe = {
            scrollY: scene.magCamera.scrollY,
            viewportY: scene.magCamera.y
        };
        scene.updateMagnifier(360, 1240);
        const bottomProbe = {
            scrollY: scene.magCamera.scrollY,
            viewportY: scene.magCamera.y
        };

        const growthStages = scene.fishes
            .filter((fish) => ['fish_pirami', 'fish_carp', 'fish_tuna'].includes(fish.texture.key))
            .map((fish) => ({ id: fish.texture.key, growthStage: fish.growthStage }));

        scene.openAquariumShop();
        const hasFeedButton = !!scene.feedBtn;
        const shopUiCount = scene.shopUi.length;
        scene.closeAquariumShop();

        scene.feedSpecialSnack();

        return {
            topProbe,
            bottomProbe,
            growthStages,
            hasFeedButton,
            shopUiCount,
            decorCount: Object.keys(scene.decorObjects).length,
            isFeeding: scene.isFeeding,
            feedStateCount: scene.fishes.filter((fish) => !!fish.feedState).length,
            recognitionSeen: !!scene.model.specialSnackBehaviorsSeen.recognition
        };
    });

    assert(aquariumState.topProbe.scrollY === 0, `top magnifier should reach sky area, got scrollY=${aquariumState.topProbe.scrollY}`);
    assert(aquariumState.bottomProbe.scrollY > aquariumState.topProbe.scrollY, 'bottom magnifier should scroll lower than top magnifier');
    assert(aquariumState.decorCount >= 5, 'decor items should render in the aquarium');
    assert(aquariumState.hasFeedButton === false, 'separate feed button should not exist');
    assert(aquariumState.shopUiCount > 0, 'aquarium shop should open');
    assert(aquariumState.isFeeding, 'special snack should start feeding animation');
    assert(aquariumState.feedStateCount > 0, 'fish should react to special snack');
    assert(aquariumState.recognitionSeen, 'recognition behavior should unlock after repeated snacks');

    const growthMap = Object.fromEntries(aquariumState.growthStages.map((entry) => [entry.id, entry.growthStage]));
    assert(growthMap.fish_pirami === 0, `fish_pirami should be stage 0 at 5 fish, got ${growthMap.fish_pirami}`);
    assert(growthMap.fish_carp === 1, `fish_carp should be stage 1 at 15 fish, got ${growthMap.fish_carp}`);
    assert(growthMap.fish_tuna === 2, `fish_tuna should be stage 2 at 30 fish, got ${growthMap.fish_tuna}`);

    await page.screenshot({ path: path.join(outputDir, 'aquarium-scene.png'), fullPage: true });
    await page.waitForTimeout(5800);

    const postFeedState = await page.evaluate(() => ({
        storyActive: window.gameManagers._phaserGame.scene.isActive('StoryScene'),
        aquariumActive: window.gameManagers._phaserGame.scene.isActive('AquariumScene')
    }));

    assert(postFeedState.storyActive || postFeedState.aquariumActive, 'a valid scene should remain active after special snack flow');
    assert(pageErrors.length === 0, `page errors found: ${pageErrors.join(' | ')}`);
    assert(consoleErrors.length === 0, `console errors found: ${consoleErrors.join(' | ')}`);

    console.log(JSON.stringify({
        topBarState,
        comboPopupState,
        aquariumState,
        postFeedState,
        pageErrors,
        consoleErrors
    }, null, 2));

    await browser.close();
})().catch(async (error) => {
    console.error(error);
    process.exit(1);
});
