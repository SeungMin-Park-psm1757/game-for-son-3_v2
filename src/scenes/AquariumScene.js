import { FISH_TYPES } from '../models/FishData.js';

const AQUARIUM_DECOR_ITEMS = [
    {
        id: 'aquarium_coral_garden',
        name: '산호 정원',
        icon: '🪸',
        cost: 1200,
        description: '중간 수심에 화사한 산호 군락을 세웁니다.',
        assetKey: 'decor_coral_garden',
        regionIndex: 1,
        xRatio: 0.26,
        yOffset: 8,
        scale: 0.72
    },
    {
        id: 'aquarium_shell_bed',
        name: '조개 쉼터',
        icon: '🐚',
        cost: 1700,
        description: '부드러운 조개 바닥이 물고기들의 쉼터가 됩니다.',
        assetKey: 'decor_shell_bed',
        regionIndex: 2,
        xRatio: 0.72,
        yOffset: 10,
        scale: 0.76
    },
    {
        id: 'aquarium_bubble_fountain',
        name: '버블 분수',
        icon: '🫧',
        cost: 2300,
        description: '보글보글 올라오는 거품으로 수족관이 더 살아납니다.',
        assetKey: 'decor_bubble_fountain',
        regionIndex: 1,
        xRatio: 0.76,
        yOffset: 10,
        scale: 0.74
    },
    {
        id: 'aquarium_treasure_castle',
        name: '보물 성채',
        icon: '🏰',
        cost: 3200,
        description: '깊은 바다 구석에 오래된 보물 성채를 세웁니다.',
        assetKey: 'decor_treasure_castle',
        regionIndex: 3,
        xRatio: 0.7,
        yOffset: 10,
        scale: 0.76
    },
    {
        id: 'aquarium_kelp_arch',
        name: '해초 아치',
        icon: '🌿',
        cost: 2100,
        description: '물결을 따라 흔들리는 해초 아치를 더합니다.',
        assetKey: 'decor_kelp_arch',
        regionIndex: 2,
        xRatio: 0.38,
        yOffset: 10,
        scale: 0.74
    },
    {
        id: 'aquarium_moon_rocks',
        name: '달빛 바위',
        icon: '🪨',
        cost: 2600,
        description: '깊은 곳을 은은하게 밝히는 바위와 진주를 놓습니다.',
        assetKey: 'decor_moon_rocks',
        regionIndex: 3,
        xRatio: 0.24,
        yOffset: 8,
        scale: 0.74
    }
];

const SPECIAL_SNACK_ITEMS = [
    {
        id: 'aquarium_swarm_snack',
        behavior: 'swarm',
        shortLabel: '우르르',
        name: '우르르 간식',
        icon: '🍤',
        cost: 700,
        description: '주면 물고기 떼가 우르르 몰려와 냠냠 먹어요.',
        cardColor: 0x374621,
        borderColor: 0xf7cb6d,
        buyColor: '#bd8a20',
        feedColor: '#5d9f4d',
        feedLabel: '우르르 주기',
        glowColor: 0xffd166,
        crumbColor: 0xf5d68c
    },
    {
        id: 'aquarium_follow_snack',
        behavior: 'follow',
        shortLabel: '따라와',
        name: '따라와 간식',
        icon: '🍡',
        cost: 900,
        description: '천천히 흘러가며 물고기들이 줄지어 따라와요.',
        cardColor: 0x4b3140,
        borderColor: 0xffd6a5,
        buyColor: '#c9834d',
        feedColor: '#8a63d2',
        feedLabel: '따라와 주기',
        glowColor: 0xffd3a1,
        crumbColor: 0xffebb8
    }
];

const SNACK_ITEMS_BY_ID = Object.fromEntries(SPECIAL_SNACK_ITEMS.map((item) => [item.id, item]));

const SHOP_ITEMS = [
    ...AQUARIUM_DECOR_ITEMS.map((item) => ({ ...item, type: 'decor' })),
    ...SPECIAL_SNACK_ITEMS.map((item) => ({ ...item, type: 'snack' }))
];

const SNACK_BEHAVIOR_RULES = {
    aquarium_swarm_snack: [
        { threshold: 1, behaviorId: 'swarm_first', mode: 'swarm', notice: '우르르 간식을 뿌리자 물고기 떼가 순식간에 몰려든다!' },
        { threshold: 3, behaviorId: 'bubble_ring', mode: 'swarm', notice: '냠냠! 먹이 주변에 동그란 버블 링이 피어오른다!' }
    ],
    aquarium_follow_snack: [
        { threshold: 1, behaviorId: 'follow_parade', mode: 'follow', notice: '따라와 간식이 천천히 흘러가자 물고기들이 줄지어 따라온다!' }
    ]
};

const RECOGNITION_THRESHOLD = 8;
const AQUARIUM_THEME_SETS = [
    {
        id: 'coral_family_theme',
        name: '산호 가족 테마',
        decorIds: ['aquarium_coral_garden', 'aquarium_bubble_fountain', 'aquarium_shell_bed'],
        color: '#ffcf93',
        storyKey: 'coralThemeStory'
    },
    {
        id: 'moonlight_theme',
        name: '달빛 쉼터 테마',
        decorIds: ['aquarium_moon_rocks', 'aquarium_kelp_arch', 'aquarium_shell_bed'],
        color: '#cfd8ff',
        storyKey: 'moonThemeStory'
    },
    {
        id: 'pirate_theme',
        name: '해적 보물 테마',
        decorIds: ['aquarium_treasure_castle', 'aquarium_bubble_fountain', 'aquarium_moon_rocks'],
        color: '#ffd27f',
        storyKey: 'pirateThemeStory'
    }
];

const AQUARIUM_MOOD_STATES = {
    happy: {
        id: 'happy',
        label: '반가움',
        icon: '💛',
        notice: '물고기들이 배도 부르고 기분도 좋아 보여!',
        color: '#ffe893'
    },
    calm: {
        id: 'calm',
        label: '평온',
        icon: '💧',
        notice: '수족관이 고요하게 숨 쉬고 있어.',
        color: '#d7f7ff'
    },
    hungry: {
        id: 'hungry',
        label: '배고픔',
        icon: '🍽️',
        notice: '물고기들이 간식 시간이 언제인지 기다리는 눈치야.',
        color: '#ffd3a3'
    },
    lonely: {
        id: 'lonely',
        label: '보고 싶었어',
        icon: '👀',
        notice: '정우를 오래 기다렸는지 유리 가까이 모여들고 있어.',
        color: '#d7e7ff'
    },
    sleepy: {
        id: 'sleepy',
        label: '졸림',
        icon: '🌙',
        notice: '깊은 물에서 천천히 쉬고 있는 분위기야.',
        color: '#cfd4ff'
    }
};

class AquariumScene extends Phaser.Scene {
    constructor() {
        super({ key: 'AquariumScene' });
    }

    create() {
        this.model = window.gameManagers.playerModel;
        this.soundManager = window.gameManagers.soundManager;

        this.fishes = [];
        this.decorObjects = {};
        this.shopUi = [];
        this.feedVisuals = [];
        this.isMagnifying = false;
        this.isFeeding = false;
        this.feedTarget = null;
        this.currentFeedConfig = null;
        this.pendingRecognitionStory = false;
        this.moodBubbleTimer = 0;
        this.currentMoodState = null;
        this.activeThemeSets = [];
        this.magRadius = 150;
        this.magZoom = 3.1;
        this.topUiSafeY = 226;

        const height = this.scale.height;
        this.regionCounts = [8, 10, 15, 14];
        const totalFishCount = this.regionCounts.reduce((sum, count) => sum + count, 0);
        this.regionHeights = this.regionCounts.map((count) => (count / totalFishCount) * height);
        this.regionYStarts = [0];
        for (let i = 0; i < this.regionHeights.length - 1; i += 1) {
            this.regionYStarts.push(this.regionYStarts[i] + this.regionHeights[i]);
        }

        this.drawBackground();
        this.createBaseDecorations();
        this.createTitleAndButtons();
        const entryMoodState = this.getAquariumMoodState();
        this.currentMoodState = entryMoodState;
        this.model.markAquariumVisit();
        this.createFishCollection();
        this.renderUnlockedDecor();
        this.activeThemeSets = this.getUnlockedThemeSets();
        this.setupMagnifier();
        this.refreshUiState();
        if (entryMoodState.id === 'lonely') {
            this.time.delayedCall(600, () => {
                this.showNotice(entryMoodState.notice, entryMoodState.color);
            });
        }
        this.checkAquariumStoryMoments('create');
    }

    drawBackground() {
        const width = this.scale.width;
        const height = this.scale.height;
        const regionColors = [0x9ed4ef, 0x688ec0, 0x0d3587, 0x23236e];

        regionColors.forEach((color, index) => {
            this.add.rectangle(0, this.regionYStarts[index], width, this.regionHeights[index], color).setOrigin(0).setDepth(0);
        });

        const waveGraphics = this.add.graphics().setDepth(0.15);
        const waveColors = [0x5f89bd, 0x103f97, 0x1d1d7d];
        for (let i = 1; i < this.regionYStarts.length; i += 1) {
            const y = this.regionYStarts[i];
            waveGraphics.fillStyle(waveColors[i - 1], 1);
            waveGraphics.beginPath();
            waveGraphics.moveTo(0, y);
            for (let x = 0; x <= width; x += 10) {
                waveGraphics.lineTo(x, y - 8 * Math.sin(x * 0.045));
            }
            waveGraphics.lineTo(width, height);
            waveGraphics.lineTo(0, height);
            waveGraphics.closePath();
            waveGraphics.fillPath();
        }
    }

    createBaseDecorations() {
        const width = this.scale.width;
        const seaweedGraphics = this.add.graphics().setDepth(0.8);
        const seaweedColors = [0x7bb18d, 0x4b8f75, 0x305c4d, 0x24413f];

        for (let i = 0; i < 4; i += 1) {
            const yBase = this.regionYStarts[i] + this.regionHeights[i];
            for (let j = 0; j < 5; j += 1) {
                const x = Phaser.Math.Between(50, width - 50);
                const stemHeight = Phaser.Math.Between(18, 44);
                seaweedGraphics.lineStyle(4, seaweedColors[i], 0.42);
                seaweedGraphics.beginPath();
                seaweedGraphics.moveTo(x, yBase);
                for (let step = 1; step <= 5; step += 1) {
                    const ty = yBase - (stemHeight / 5) * step;
                    const tx = x + Math.sin(step * 1.4) * 5;
                    seaweedGraphics.lineTo(tx, ty);
                }
                seaweedGraphics.strokePath();
            }
        }
    }

    createTitleAndButtons() {
        const width = this.scale.width;

        this.add.text(width / 2, 38, '내 수족관', {
            fontSize: '32px',
            fontFamily: 'Arial',
            fontStyle: 'bold',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 5
        }).setOrigin(0.5).setDepth(30);

        this.statusText = this.add.text(width / 2, 82, '', {
            fontSize: '16px',
            fontFamily: 'Arial',
            color: '#fff3c9',
            stroke: '#000000',
            strokeThickness: 4,
            align: 'center',
            lineSpacing: 6,
            wordWrap: { width: width * 0.8 }
        }).setOrigin(0.5).setDepth(30);

        this.backBtn = this.createButton(24, 118, '⬅ 돌아가기', 0);
        this.backBtn.on('pointerdown', () => {
            this.soundManager.playCoin();
            this.scene.start('IntroScene');
        });

        this.magBtn = this.createButton(width - 24, 118, '🔍 돋보기 켜기', 1);
        this.magBtn.on('pointerdown', () => {
            this.soundManager.playCoin();
            this.toggleMagnifier();
        });

        this.shopBtn = this.createButton(width - 24, 168, '🛍 꾸미기 & 간식', 1);
        this.shopBtn.on('pointerdown', () => {
            this.soundManager.playCoin();
            this.openAquariumShop();
        });

        this.noticeText = this.add.text(width / 2, this.scale.height - 72, '', {
            fontSize: '22px',
            fontFamily: 'Arial',
            fontStyle: 'bold',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 5,
            align: 'center',
            wordWrap: { width: width * 0.88 }
        }).setOrigin(0.5).setDepth(240).setVisible(false);
    }

    createButton(x, y, label, originX = 0) {
        const button = this.add.text(x, y, label, {
            fontSize: '20px',
            fontFamily: 'Arial',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4,
            backgroundColor: '#223042',
            padding: { x: 10, y: 6 }
        }).setOrigin(originX, 0).setDepth(30).setInteractive({ useHandCursor: true });

        button.on('pointerover', () => button.setBackgroundColor('#49617c'));
        button.on('pointerout', () => button.setBackgroundColor('#223042'));
        return button;
    }

    getFishTextureKey(fishData) {
        return fishData?.textureKey || fishData?.id || 'fish_pirami';
    }

    applyFishVisual(sprite, fishData) {
        if (!sprite || !fishData) return;

        sprite.setTexture(this.getFishTextureKey(fishData));
        sprite.clearTint();

        if (fishData.id === 'fish_moon_carp') {
            sprite.setTint(0xe9f3ff, 0xd9e8ff, 0xb8d8ff, 0x9fc5ff);
        } else if (fishData.id === 'fish_storm_tuna') {
            sprite.setTint(0x8fd8ff, 0x5ab8ff, 0x2e6ca1, 0x4b93cf);
        }
    }

    getUnlockedThemeSets() {
        return AQUARIUM_THEME_SETS.filter((theme) =>
            theme.decorIds.every((decorId) => (this.model.decorPurchased?.[decorId] || 0) > 0)
        );
    }

    getAquariumMoodState(now = Date.now()) {
        const lastSnackAt = this.model.lastAquariumSnackAt || 0;
        const lastVisitAt = this.model.lastAquariumVisitAt || 0;
        const hoursSinceSnack = lastSnackAt > 0 ? (now - lastSnackAt) / (1000 * 60 * 60) : Infinity;
        const hoursSinceVisit = lastVisitAt > 0 ? (now - lastVisitAt) / (1000 * 60 * 60) : Infinity;
        const hour = new Date(now).getHours();

        if (hoursSinceSnack <= 0.5) return AQUARIUM_MOOD_STATES.happy;
        if (hoursSinceVisit >= 12) return AQUARIUM_MOOD_STATES.lonely;
        if (hour >= 21 || hour < 6) return AQUARIUM_MOOD_STATES.sleepy;
        if (hoursSinceSnack >= 8) return AQUARIUM_MOOD_STATES.hungry;
        return AQUARIUM_MOOD_STATES.calm;
    }

    emitMoodBubble(fish, moodState = this.currentMoodState) {
        if (!fish || !moodState) return;

        const bubbleY = Math.max(this.topUiSafeY + 14, fish.y - fish.displayHeight * 0.7);
        const bubble = this.add.text(fish.x, bubbleY, `${moodState.icon} ${moodState.label}`, {
            fontSize: '16px',
            fontFamily: 'Arial',
            color: '#10263d',
            backgroundColor: '#fffdf6',
            padding: { x: 8, y: 4 },
            stroke: '#ffffff',
            strokeThickness: 1
        }).setOrigin(0.5).setDepth(5);

        this.tweens.add({
            targets: bubble,
            y: bubble.y - 26,
            alpha: 0,
            duration: 1500,
            ease: 'Sine.easeOut',
            onComplete: () => bubble.destroy()
        });
    }

    createFishCollection() {
        const collection = this.model.fishCollection;

        Object.keys(collection).forEach((fishId) => {
            const count = collection[fishId] || 0;
            if (count < 5) return;

            const fishData = FISH_TYPES.find((fish) => fish.id === fishId);
            if (fishData && !fishData.isSpecialItem) {
                this.createFish(fishData, count);
            }
        });

        if (this.fishes.length === 0) {
            this.noFishText = this.add.text(this.scale.width / 2, this.scale.height / 2, '아직 수족관에 들어온 물고기가 없어요.\n같은 물고기를 5마리 이상 잡으면 수족관에 나타나요!', {
                fontSize: '24px',
                fontFamily: 'Arial',
                color: '#ffffff',
                stroke: '#000000',
                strokeThickness: 4,
                align: 'center',
                wordWrap: { width: this.scale.width * 0.82 }
            }).setOrigin(0.5).setDepth(5);
        }
    }

    createFish(fishData, count) {
        const width = this.scale.width;
        const regionIndex = fishData.region - 1;
        const growthStage = count >= 30 ? 2 : (count >= 15 ? 1 : 0);
        const regionMinY = this.regionYStarts[regionIndex] + this.regionHeights[regionIndex] * 0.18;
        const minY = regionIndex === 0 ? Math.max(regionMinY, this.topUiSafeY) : regionMinY;
        const maxY = this.regionYStarts[regionIndex] + this.regionHeights[regionIndex] * 0.82;

        const fish = this.add.image(
            Phaser.Math.Between(60, width - 60),
            Phaser.Math.Between(minY, maxY),
            this.getFishTextureKey(fishData)
        ).setDepth(2);
        this.applyFishVisual(fish, fishData);

        const growthScales = [1, 1.16, 1.34];
        const aquariumScaleAdjustments = {
            fish_carp: 0.82,
            fish_moon_carp: 0.78
        };
        const sizeAdjust = aquariumScaleAdjustments[fishData.id] || 1;
        const baseScale = (fishData.scale || 1) * Phaser.Math.FloatBetween(0.6, 0.82) * growthScales[growthStage] * sizeAdjust;
        fish.setScale(baseScale);
        fish.baseScaleX = fish.scaleX;
        fish.baseScaleY = fish.scaleY;
        fish.fishData = fishData;
        fish.growthStage = growthStage;
        fish.homeRegion = regionIndex;
        fish.minY = minY;
        fish.maxY = maxY;
        fish.motionSeed = Phaser.Math.FloatBetween(0, Math.PI * 2);
        fish.feedState = null;
        fish.growthTrailTimer = Phaser.Math.Between(growthStage === 2 ? 320 : 680, growthStage === 2 ? 680 : 1400);

        if (growthStage > 0) {
            const auraColor = growthStage === 2 ? 0xffdc7f : 0x8be3ff;
            fish.growthAura = this.add.ellipse(
                fish.x,
                fish.y,
                fish.displayWidth * (growthStage === 2 ? 1.22 : 1.12),
                fish.displayHeight * (growthStage === 2 ? 0.92 : 0.82),
                auraColor,
                growthStage === 2 ? 0.22 : 0.18
            ).setDepth(1.6);
            this.tweens.add({
                targets: fish.growthAura,
                alpha: { from: 0.1, to: growthStage === 2 ? 0.3 : 0.2 },
                scaleX: { from: 0.88, to: growthStage === 2 ? 1.14 : 1.08 },
                scaleY: { from: 0.88, to: growthStage === 2 ? 1.16 : 1.08 },
                yoyo: true,
                repeat: -1,
                duration: growthStage === 2 ? 880 : 1100,
                ease: 'Sine.easeInOut'
            });
        }

        if (growthStage === 2) {
            fish.growthCompanion = this.add.image(
                fish.x - 24,
                fish.y + 10,
                fishData.id
            ).setScale(baseScale * 0.42).setDepth(1.9).setAlpha(0.72);
            fish.growthCompanion.flipX = fish.flipX;
        }

        if (fishData.id === 'fish_moray_eel') {
            fish.setPosition(100, this.regionYStarts[3] + this.regionHeights[3] - 40);
            fish.isFixed = true;
            fish.direction = 1;
            fish.flipX = true;
            fish.speed = 0;
        } else {
            let baseSpeed = 42;
            if (fishData.grade === 'SSR') baseSpeed = 24;
            else if (fishData.grade === 'SR') baseSpeed = 32;
            else if (fishData.grade === 'R') baseSpeed = 50;
            else baseSpeed = 68;

            fish.speed = baseSpeed * Phaser.Math.FloatBetween(0.8, 1.2) * (growthStage === 2 ? 1.15 : (growthStage === 1 ? 1.05 : 1));
            fish.direction = Math.random() > 0.5 ? 1 : -1;
            fish.flipX = fish.direction === 1;
            this.initializeFishBehavior(fish);
        }

        fish.startY = fish.y;
        fish.sinCount = Phaser.Math.FloatBetween(0, Math.PI * 2);
        fish.sinSpeed = Phaser.Math.FloatBetween(0.5, 1.7) * (growthStage === 2 ? 1.12 : 1);
        fish.sinRadius = Phaser.Math.FloatBetween(4, 14) * (growthStage === 2 ? 1.08 : 1);
        fish.changeDirTimer = 0;
        fish.changeDirDelay = Phaser.Math.Between(3000, 8000);

        this.fishes.push(fish);
    }

    initializeFishBehavior(fish) {
        fish.behaviorState = 'cruise';
        fish.pauseTimer = 0;
        fish.targetX = fish.x;
        fish.targetY = fish.y;
        fish.speedMultiplier = 1;
        fish.bobOffset = Phaser.Math.FloatBetween(0, Math.PI * 2);
        this.pickIdleTarget(fish, true);
    }

    getRegionDecorAnchors(regionIndex) {
        return AQUARIUM_DECOR_ITEMS
            .filter((item) => item.regionIndex === regionIndex && (this.model.decorPurchased[item.id] || 0) > 0)
            .map((item) => ({
                x: this.scale.width * item.xRatio,
                y: this.regionYStarts[item.regionIndex] + this.regionHeights[item.regionIndex] - item.yOffset - 26
            }));
    }

    pickIdleTarget(fish, immediate = false) {
        const width = this.scale.width;
        const mood = this.currentMoodState || this.getAquariumMoodState();
        const nearbyFishes = this.fishes.filter((other) =>
            other !== fish &&
            !other.isFixed &&
            other.homeRegion === fish.homeRegion
        );
        const decorAnchors = this.getRegionDecorAnchors(fish.homeRegion);
        const roll = Math.random();
        let targetX = Phaser.Math.Between(56, width - 56);
        let targetY = Phaser.Math.Between(fish.minY + 8, fish.maxY - 8);

        if (mood.id === 'lonely' && roll < 0.26) {
            targetX = Phaser.Math.Between(Math.round(width * 0.38), Math.round(width * 0.62));
            targetY = Phaser.Math.Clamp(fish.minY + Phaser.Math.Between(12, 34), fish.minY + 8, fish.maxY - 8);
            fish.behaviorState = 'welcome';
            fish.speedMultiplier = 1.06;
            fish.pauseTimer = immediate ? 0 : Phaser.Math.Between(500, 1000);
        } else if (decorAnchors.length > 0 && roll < (mood.id === 'hungry' ? 0.46 : 0.38)) {
            const anchor = Phaser.Utils.Array.GetRandom(decorAnchors);
            targetX = anchor.x + Phaser.Math.Between(-48, 48);
            targetY = Phaser.Math.Clamp(anchor.y + Phaser.Math.Between(-24, 16), fish.minY + 8, fish.maxY - 8);
            fish.behaviorState = 'inspect';
            fish.speedMultiplier = mood.id === 'hungry' ? 0.92 : 0.78;
            fish.pauseTimer = immediate ? 0 : Phaser.Math.Between(1000, 1900);
        } else if (nearbyFishes.length > 0 && roll < (mood.id === 'happy' ? 0.84 : 0.72)) {
            const leader = Phaser.Utils.Array.GetRandom(nearbyFishes);
            targetX = leader.x + Phaser.Math.Between(-72, 72);
            targetY = Phaser.Math.Clamp(leader.y + Phaser.Math.Between(-28, 28), fish.minY + 8, fish.maxY - 8);
            fish.behaviorState = 'school';
            fish.speedMultiplier = mood.id === 'happy' ? 1.02 : 0.92;
            fish.pauseTimer = immediate ? 0 : Phaser.Math.Between(600, 1200);
        } else {
            fish.behaviorState = 'cruise';
            fish.speedMultiplier = mood.id === 'sleepy'
                ? Phaser.Math.FloatBetween(0.72, 0.86)
                : Phaser.Math.FloatBetween(0.98, 1.12);
            fish.pauseTimer = immediate ? 0 : Phaser.Math.Between(500, 1100);
        }

        fish.targetX = Phaser.Math.Clamp(targetX, 48, width - 48);
        fish.targetY = Phaser.Math.Clamp(targetY, fish.minY + 8, fish.maxY - 8);
    }

    emitGrowthTrail(fish) {
        if (fish.growthStage <= 0) return;

        const bubble = this.add.circle(
            fish.x - (fish.direction * fish.displayWidth * 0.2),
            fish.y + Phaser.Math.Between(-6, 8),
            fish.growthStage === 2 ? Phaser.Math.Between(3, 5) : Phaser.Math.Between(2, 4),
            fish.growthStage === 2 ? 0xfff1a8 : 0xc7f3ff,
            0.9
        ).setDepth(1.95);

        this.tweens.add({
            targets: bubble,
            x: bubble.x - (fish.direction * Phaser.Math.Between(10, 20)),
            y: bubble.y - Phaser.Math.Between(12, 28),
            alpha: 0,
            scale: { from: 1, to: 0.45 },
            duration: fish.growthStage === 2 ? 560 : 460,
            onComplete: () => bubble.destroy()
        });
    }

    syncFishAttachments(fish, time) {
        if (fish.growthAura) {
            fish.growthAura.setPosition(fish.x, fish.y);
        }

        if (fish.growthCompanion) {
            const targetX = fish.x - (fish.direction * (fish.displayWidth * 0.48));
            const targetY = fish.y + fish.displayHeight * 0.18 + Math.sin((time * 0.0042) + fish.motionSeed) * 5;
            fish.growthCompanion.x += (targetX - fish.growthCompanion.x) * 0.16;
            fish.growthCompanion.y += (targetY - fish.growthCompanion.y) * 0.16;
            fish.growthCompanion.flipX = fish.flipX;
            fish.growthCompanion.angle = fish.angle * 0.65;
        }
    }

    updateIdleFish(fish, time, delta) {
        const width = this.scale.width;
        const dt = delta / 1000;
        const dx = fish.targetX - fish.x;
        const dy = fish.targetY - fish.y;
        const distance = Math.hypot(dx, dy);

        if (distance > 10) {
            const moveStep = fish.speed * fish.speedMultiplier * dt;
            fish.x += Phaser.Math.Clamp(dx, -moveStep, moveStep);
            fish.y += Phaser.Math.Clamp(dy, -moveStep * 0.8, moveStep * 0.8);
            fish.y += Math.sin((time * 0.0032) + fish.bobOffset) * 0.18;
            fish.direction = dx >= 0 ? 1 : -1;
            fish.flipX = fish.direction === 1;
            fish.angle = Phaser.Math.Clamp((dy / 6), -10, 10) + Math.sin((time * 0.004) + fish.motionSeed) * 2;
        } else {
            fish.pauseTimer -= delta;
            fish.angle = Math.sin((time * 0.004) + fish.motionSeed) * 3;
            fish.y += Math.sin((time * 0.0035) + fish.bobOffset) * 0.16;
            if (fish.pauseTimer <= 0) {
                this.pickIdleTarget(fish);
            }
        }

        fish.x = Phaser.Math.Clamp(fish.x, 40, width - 40);
        fish.y = Phaser.Math.Clamp(fish.y, fish.minY, fish.maxY);
        fish.growthTrailTimer -= delta;
        if (fish.growthStage > 0 && fish.growthTrailTimer <= 0) {
            this.emitGrowthTrail(fish);
            fish.growthTrailTimer = Phaser.Math.Between(fish.growthStage === 2 ? 320 : 720, fish.growthStage === 2 ? 760 : 1500);
        }
    }

    setupMagnifier() {
        this.magPointerX = 0;
        this.magPointerY = 0;
        this.magLensDiameter = Math.max(120, this.magRadius * 2);
        this.magZoomCanvas = document.createElement('canvas');
        this.magZoomCanvas.style.display = 'block';
        this.magZoomCanvas.style.imageRendering = 'pixelated';

        this.magZoomContext = this.magZoomCanvas.getContext('2d', { alpha: true, desynchronized: true });
        this.magZoomContext.imageSmoothingEnabled = false;

        this.magLensEl = document.createElement('div');
        this.magLensEl.className = 'aquarium-magnifier-lens';
        this.magLensEl.style.display = 'none';
        this.magLensEl.style.position = 'fixed';
        this.magLensEl.style.left = '0px';
        this.magLensEl.style.top = '0px';
        this.magLensEl.style.borderRadius = '50%';
        this.magLensEl.style.overflow = 'hidden';
        this.magLensEl.style.pointerEvents = 'none';
        this.magLensEl.style.border = '5px solid rgba(255,255,255,0.96)';
        this.magLensEl.style.boxShadow = 'inset 0 0 0 1px rgba(184,220,255,0.6), 0 12px 28px rgba(4,14,28,0.3)';
        this.magLensEl.style.background = 'transparent';
        this.magLensEl.style.zIndex = '25';
        this.magLensEl.appendChild(this.magZoomCanvas);
        document.body.appendChild(this.magLensEl);

        this.syncMagnifierCanvasSize();

        this.magPointerMoveHandler = (pointer) => {
            if (this.isMagnifying) {
                this.updateMagnifier(pointer.x, pointer.y);
            }
        };
        this.magResizeHandler = () => {
            this.syncMagnifierCanvasSize();
            if (this.isMagnifying) {
                const pointer = this.input.activePointer;
                this.updateMagnifier(pointer.x, pointer.y);
            }
        };

        this.input.on('pointermove', this.magPointerMoveHandler);
        this.scale.on(Phaser.Scale.Events.RESIZE, this.magResizeHandler);

        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            if (this.magPointerMoveHandler) {
                this.input.off('pointermove', this.magPointerMoveHandler);
                this.magPointerMoveHandler = null;
            }
            if (this.magResizeHandler) {
                this.scale.off(Phaser.Scale.Events.RESIZE, this.magResizeHandler);
                this.magResizeHandler = null;
            }
            if (this.magLensEl) {
                this.magLensEl.remove();
                this.magLensEl = null;
            }
        });
    }

    getMagnifierDpr() {
        return Math.max(1, window.devicePixelRatio || 1);
    }

    syncMagnifierCanvasSize() {
        if (!this.magZoomCanvas || !this.magLensEl || !this.magZoomContext) return;

        const sourceCanvas = this.sys.game.canvas;
        const canvasRect = sourceCanvas.getBoundingClientRect();
        const renderScaleX = canvasRect.width > 0
            ? canvasRect.width / this.scale.width
            : (sourceCanvas.clientWidth || this.scale.width) / this.scale.width;
        const diameterCss = Math.max(120, Math.round(this.magRadius * 2 * renderScaleX));
        const dpr = this.getMagnifierDpr();
        const diameterPx = Math.max(1, Math.round(diameterCss * dpr));

        this.magLensDiameter = diameterCss;
        this.magZoomCanvas.width = diameterPx;
        this.magZoomCanvas.height = diameterPx;
        this.magZoomCanvas.style.width = `${diameterCss}px`;
        this.magZoomCanvas.style.height = `${diameterCss}px`;
        this.magLensEl.style.width = `${diameterCss}px`;
        this.magLensEl.style.height = `${diameterCss}px`;
        this.magZoomContext.setTransform(dpr, 0, 0, dpr, 0, 0);
        this.magZoomContext.imageSmoothingEnabled = false;
    }

    toggleMagnifier(forceState = null) {
        this.isMagnifying = forceState === null ? !this.isMagnifying : forceState;
        if (this.magLensEl) {
            this.magLensEl.style.display = this.isMagnifying ? 'block' : 'none';
        }
        this.magBtn.setText(this.isMagnifying ? '🔍 돋보기 끄기' : '🔍 돋보기 켜기');

        if (this.isMagnifying) {
            const pointer = this.input.activePointer;
            this.updateMagnifier(pointer.x, pointer.y);
        }
    }

    updateMagnifier(x, y) {
        this.syncMagnifierCanvasSize();

        const radius = this.magRadius;
        const zoom = this.magZoom;
        const visibleWidth = (radius * 2) / zoom;
        const visibleHeight = (radius * 2) / zoom;
        const maxScrollX = Math.max(0, this.scale.width - visibleWidth);
        const maxScrollY = Math.max(0, this.scale.height - visibleHeight);
        const lensX = Phaser.Math.Clamp(x, 0, this.scale.width);
        const lensY = Phaser.Math.Clamp(y, 0, this.scale.height);
        const sourceCanvas = this.sys.game.canvas;
        const canvasRect = sourceCanvas.getBoundingClientRect();
        const scaleX = canvasRect.width / this.scale.width;
        const scaleY = canvasRect.height / this.scale.height;
        const diameterCss = this.magLensDiameter;
        const pointerCssX = canvasRect.left + (lensX * scaleX);
        const pointerCssY = canvasRect.top + (lensY * scaleY);
        const pointerOffset = Math.max(18, Math.round(diameterCss * 0.16));
        const lensLeft = Phaser.Math.Clamp(
            pointerCssX - (diameterCss / 2),
            canvasRect.left,
            canvasRect.right - diameterCss
        );
        let desiredTop = pointerCssY - diameterCss - pointerOffset;
        if (desiredTop < canvasRect.top) {
            desiredTop = pointerCssY + pointerOffset;
        }
        if (desiredTop > canvasRect.bottom - diameterCss) {
            desiredTop = pointerCssY - diameterCss - pointerOffset;
        }
        const lensTop = Phaser.Math.Clamp(desiredTop, canvasRect.top, canvasRect.bottom - diameterCss);

        this.magPointerX = Phaser.Math.Clamp(x - (visibleWidth / 2), 0, maxScrollX);
        this.magPointerY = Phaser.Math.Clamp(y - (visibleHeight / 2), 0, maxScrollY);

        if (this.magLensEl) {
            this.magLensEl.style.left = `${lensLeft}px`;
            this.magLensEl.style.top = `${lensTop}px`;
        }

        this.refreshMagnifierTexture();
    }

    refreshMagnifierTexture() {
        if (!this.isMagnifying || !this.magZoomContext || !this.magZoomCanvas) return;

        const sourceCanvas = this.sys.game.canvas;
        const diameter = this.magLensDiameter;
        const sourceScaleX = sourceCanvas.width / this.scale.width;
        const sourceScaleY = sourceCanvas.height / this.scale.height;
        const sourceWidth = ((this.magRadius * 2) / this.magZoom) * sourceScaleX;
        const sourceHeight = ((this.magRadius * 2) / this.magZoom) * sourceScaleY;
        const sourceX = this.magPointerX * sourceScaleX;
        const sourceY = this.magPointerY * sourceScaleY;

        this.magZoomContext.clearRect(0, 0, diameter, diameter);
        this.magZoomContext.save();
        this.magZoomContext.beginPath();
        this.magZoomContext.arc(diameter / 2, diameter / 2, (diameter / 2) - 4, 0, Math.PI * 2);
        this.magZoomContext.closePath();
        this.magZoomContext.clip();
        this.magZoomContext.drawImage(
            sourceCanvas,
            sourceX,
            sourceY,
            sourceWidth,
            sourceHeight,
            0,
            0,
            diameter,
            diameter
        );
        this.magZoomContext.restore();

        this.magZoomContext.save();
        this.magZoomContext.beginPath();
        this.magZoomContext.arc(diameter / 2, diameter / 2, (diameter / 2) - 4, 0, Math.PI * 2);
        this.magZoomContext.strokeStyle = 'rgba(255,255,255,0.42)';
        this.magZoomContext.lineWidth = 2;
        this.magZoomContext.stroke();
        this.magZoomContext.restore();
    }

    refreshUiState() {
        this.currentMoodState = this.getAquariumMoodState();
        this.activeThemeSets = this.getUnlockedThemeSets();
        const snackSummary = SPECIAL_SNACK_ITEMS.map((item) => {
            const count = this.model.snacksPurchased[item.id] || 0;
            return `${item.shortLabel} ${count}개`;
        }).join(' · ');
        const decorCount = this.model.getUnlockedDecorCount();
        const themeSummary = this.activeThemeSets.length > 0
            ? `테마 ${this.activeThemeSets.length}개 완성`
            : '테마 준비 중';
        this.statusText.setText(`${snackSummary} · 장식 ${decorCount}개 · 기분 ${this.currentMoodState.icon} ${this.currentMoodState.label}\n${themeSummary}`);
    }

    renderUnlockedDecor() {
        Object.values(this.decorObjects).forEach((entry) => {
            entry.forEach((item) => {
                if (!item) return;
                this.tweens.killTweensOf(item);
                item.destroy();
            });
        });
        this.decorObjects = {};

        AQUARIUM_DECOR_ITEMS.forEach((item) => {
            if ((this.model.decorPurchased[item.id] || 0) <= 0) return;
            this.decorObjects[item.id] = this.createDecorSprite(item);
        });
    }

    createDecorSprite(item) {
        const regionBaseY = this.regionYStarts[item.regionIndex] + this.regionHeights[item.regionIndex];
        const x = this.scale.width * item.xRatio;
        const y = regionBaseY - item.yOffset;
        const objects = [];

        const sprite = this.add.image(x, y, item.assetKey).setOrigin(0.5, 1).setScale(item.scale).setDepth(1.32);
        const shadow = this.add.ellipse(
            x,
            y - 6,
            Math.max(52, sprite.displayWidth * 0.6),
            Math.max(14, sprite.displayHeight * 0.12),
            0x081322,
            0.18
        ).setDepth(1.05);
        const glow = this.add.ellipse(
            x,
            y - (sprite.displayHeight * 0.16),
            Math.max(58, sprite.displayWidth * 0.78),
            Math.max(18, sprite.displayHeight * 0.18),
            0xd9f6ff,
            item.regionIndex >= 3 ? 0.08 : 0.05
        ).setDepth(1.08);
        objects.push(shadow, glow, sprite);

        if (item.id === 'aquarium_bubble_fountain') {
            for (let i = 0; i < 5; i += 1) {
                const bubble = this.add.circle(
                    x + Phaser.Math.Between(-12, 12),
                    y - (sprite.displayHeight * 0.18),
                    Phaser.Math.Between(4, 7),
                    0xe1f8ff,
                    0.75
                ).setDepth(1.55);
                this.tweens.add({
                    targets: bubble,
                    y: y - sprite.displayHeight - Phaser.Math.Between(24, 54),
                    x: bubble.x + Phaser.Math.Between(-12, 12),
                    alpha: { from: 0.75, to: 0.08 },
                    scale: { from: 0.7, to: 1.2 },
                    duration: Phaser.Math.Between(1900, 2600),
                    repeat: -1,
                    delay: i * 280,
                    onRepeat: () => {
                        bubble.setPosition(x + Phaser.Math.Between(-12, 12), y - (sprite.displayHeight * 0.18));
                    }
                });
                objects.push(bubble);
            }
        } else if (item.id === 'aquarium_treasure_castle') {
            const sparkle = this.add.circle(x - 18, y - 10, 4, 0xffe38a, 0.88).setDepth(1.58);
            objects.push(sparkle);
        } else if (item.id === 'aquarium_moon_rocks') {
            const pearl = this.add.circle(x + 18, y - 6, 5, 0xf9f4cf, 0.84).setDepth(1.5);
            objects.push(pearl);
        } else if (item.id === 'aquarium_shell_bed') {
            const shimmer = this.add.circle(x - 16, y - 12, 4, 0xfff3cf, 0.72).setDepth(1.46);
            objects.push(shimmer);
        }

        return objects;
    }

    openAquariumShop() {
        if (this.shopUi.length > 0) return false;
        if (this.isMagnifying) this.toggleMagnifier(false);

        const width = this.scale.width;
        const height = this.scale.height;
        const panelWidth = width * 0.88;
        const panelHeight = height * 0.79;
        const panelX = width / 2;
        const panelY = height / 2 + 18;
        const cardWidth = panelWidth * 0.42;
        const cardHeight = 132;
        const columns = 2;

        const dim = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.58)
            .setDepth(200)
            .setInteractive();
        const panel = this.add.rectangle(panelX, panelY, panelWidth, panelHeight, 0x102742, 0.98)
            .setStrokeStyle(4, 0x8bd7ff)
            .setDepth(201);
        const title = this.add.text(panelX, panelY - panelHeight / 2 + 28, '수족관 꾸미기 & 간식 상점', {
            fontSize: '26px',
            fontFamily: 'Arial',
            fontStyle: 'bold',
            color: '#ffffff'
        }).setOrigin(0.5).setDepth(202);
        const subtitle = this.add.text(panelX, panelY - panelHeight / 2 + 58, '소품을 설치하고 누르면 간식을 바로 줄 수 있어요.', {
            fontSize: '14px',
            fontFamily: 'Arial',
            color: '#d8f0ff'
        }).setOrigin(0.5).setDepth(202);
        const feedback = this.add.text(panelX, panelY + panelHeight / 2 - 24, '', {
            fontSize: '17px',
            fontFamily: 'Arial',
            color: '#fff4b1',
            stroke: '#000000',
            strokeThickness: 4,
            align: 'center',
            wordWrap: { width: panelWidth * 0.86 }
        }).setOrigin(0.5).setDepth(202);
        const closeBtn = this.add.text(panelX + panelWidth / 2 - 22, panelY - panelHeight / 2 + 16, '✕', {
            fontSize: '24px',
            fontFamily: 'Arial',
            color: '#ffffff',
            backgroundColor: '#2f4158',
            padding: { x: 8, y: 4 }
        }).setOrigin(1, 0).setDepth(202).setInteractive({ useHandCursor: true });

        closeBtn.on('pointerdown', () => {
            this.soundManager.playCoin();
            this.closeAquariumShop();
        });

        SHOP_ITEMS.forEach((item, index) => {
            const row = Math.floor(index / columns);
            const col = index % columns;
            const x = panelX - panelWidth * 0.23 + (col * panelWidth * 0.46);
            const y = panelY - panelHeight / 2 + 146 + (row * 138);
            const isSnack = item.type === 'snack';
            const ownedCount = isSnack
                ? (this.model.snacksPurchased[item.id] || 0)
                : (this.model.decorPurchased[item.id] || 0);
            const isOwnedDecor = !isSnack && ownedCount > 0;

            const card = this.add.rectangle(x, y, cardWidth, cardHeight, isSnack ? item.cardColor : 0x163a59, 0.95)
                .setStrokeStyle(2, isSnack ? item.borderColor : 0x8bd7ff)
                .setDepth(201.5);
            const icon = this.add.text(x - cardWidth * 0.36, y - 20, item.icon, {
                fontSize: '24px',
                fontFamily: 'Arial'
            }).setOrigin(0.5).setDepth(202);
            const name = this.add.text(x - cardWidth * 0.21, y - 28, item.name, {
                fontSize: '15px',
                fontFamily: 'Arial',
                fontStyle: 'bold',
                color: '#ffffff',
                wordWrap: { width: cardWidth * 0.4 }
            }).setOrigin(0, 0.5).setDepth(202);
            const desc = this.add.text(x - cardWidth * 0.21, y + 4, item.description, {
                fontSize: '10px',
                fontFamily: 'Arial',
                color: '#d9e8f5',
                wordWrap: { width: cardWidth * 0.4 }
            }).setOrigin(0, 0.5).setDepth(202);
            const ownedText = this.add.text(x - cardWidth * 0.21, y + 42,
                isSnack ? `보유 ${ownedCount}개` : (isOwnedDecor ? '설치 완료' : '미설치'),
                {
                    fontSize: '11px',
                    fontFamily: 'Arial',
                    color: isSnack ? '#fff0b5' : '#d7f5ff'
                }).setOrigin(0, 0.5).setDepth(202);

            this.shopUi.push(card, icon, name, desc, ownedText);

            if (isSnack) {
                const buyBtn = this.createShopButton(x + cardWidth * 0.23, y - 20, `${item.cost}G 구매`, item.buyColor, this.model.gold >= item.cost, () => {
                    const success = this.model.purchaseSnack(item.id, item.cost);
                    if (!success) {
                        this.soundManager.playError();
                        feedback.setText('골드가 부족해. 조금 더 낚시하고 오자!');
                        return;
                    }

                    this.soundManager.playSuccess();
                    feedback.setText(`${item.name} 1개를 담았어! 이제 바로 줄 수 있어.`);
                    this.refreshUiState();
                    this.closeAquariumShop();
                    this.openAquariumShop();
                });
                this.shopUi.push(buyBtn);

                const feedBtn = this.createShopButton(x + cardWidth * 0.23, y + 22, ownedCount > 0 ? item.feedLabel : '간식 없음', item.feedColor, ownedCount > 0, () => {
                    this.closeAquariumShop();
                    this.feedSpecialSnack(item.id);
                });
                this.shopUi.push(feedBtn);
            } else {
                const canBuy = !isOwnedDecor && this.model.gold >= item.cost;
                const buttonLabel = isOwnedDecor ? '설치 완료' : `${item.cost}G 구매`;
                const button = this.createShopButton(x + cardWidth * 0.23, y + 12, buttonLabel, isOwnedDecor ? '#6c7f94' : '#2a79b8', canBuy, () => {
                    const success = this.model.purchaseDecor(item.id, item.cost);
                    if (!success) {
                        this.soundManager.playError();
                        feedback.setText('골드가 부족해. 조금 더 낚시하고 오자!');
                        return;
                    }

                    this.soundManager.playSuccess();
                    this.renderUnlockedDecor();
                    this.refreshUiState();
                    const comboUnlocks = this.model.processComboUnlocks();
                    feedback.setText(`${item.name} 설치 완료! 수족관이 한층 더 살아났어.`);
                    this.showComboUnlockNotice(comboUnlocks);
                    const storyStarted = this.checkAquariumStoryMoments('decor');
                    this.closeAquariumShop();
                    if (!storyStarted) {
                        this.openAquariumShop();
                    }
                });
                this.shopUi.push(button);
            }
        });

        this.shopUi.push(dim, panel, title, subtitle, feedback, closeBtn);
    }

    createShopButton(x, y, label, backgroundColor, enabled, onClick) {
        const button = this.add.text(x, y, label, {
            fontSize: '13px',
            fontFamily: 'Arial',
            color: '#ffffff',
            backgroundColor: enabled ? backgroundColor : '#666666',
            padding: { x: 8, y: 5 }
        }).setOrigin(0.5).setDepth(202);

        if (enabled) {
            button.setInteractive({ useHandCursor: true });
            button.on('pointerdown', onClick);
        } else {
            button.setAlpha(0.78);
        }

        return button;
    }

    closeAquariumShop() {
        this.shopUi.forEach((item) => item.destroy());
        this.shopUi = [];
    }

    getSnackBehavior(snackItem, useCount) {
        const rules = SNACK_BEHAVIOR_RULES[snackItem.id] || [];
        return rules.reduce((activeRule, rule) => {
            if (useCount >= rule.threshold) return rule;
            return activeRule;
        }, rules[0] || {
            behaviorId: null,
            mode: snackItem.behavior,
            notice: `${snackItem.name}을 줬어!`
        });
    }

    createFeedTarget(snackItem) {
        if (snackItem.behavior === 'follow') {
            const startOnLeft = Math.random() > 0.5;
            return {
                mode: 'follow',
                x: startOnLeft ? this.scale.width * 0.22 : this.scale.width * 0.78,
                y: this.scale.height * Phaser.Math.FloatBetween(0.38, 0.58),
                baseY: this.scale.height * Phaser.Math.FloatBetween(0.38, 0.58),
                startX: startOnLeft ? this.scale.width * 0.22 : this.scale.width * 0.78,
                endX: startOnLeft ? this.scale.width * 0.78 : this.scale.width * 0.22,
                direction: startOnLeft ? 1 : -1,
                swaySeed: Phaser.Math.FloatBetween(0, Math.PI * 2),
                elapsed: 0,
                trailTimer: 0
            };
        }

        return {
            mode: 'swarm',
            x: this.scale.width * Phaser.Math.FloatBetween(0.38, 0.62),
            y: this.scale.height * Phaser.Math.FloatBetween(0.42, 0.66)
        };
    }

    createSnackVisuals(snackItem, behavior) {
        const { x, y } = this.feedTarget;
        const glow = this.add.circle(x, y, behavior.mode === 'follow' ? 28 : 24, snackItem.glowColor, 0.32).setDepth(3.4);
        this.tweens.add({
            targets: glow,
            radius: { from: behavior.mode === 'follow' ? 20 : 18, to: behavior.mode === 'follow' ? 38 : 34 },
            alpha: { from: 0.36, to: 0.12 },
            yoyo: true,
            repeat: -1,
            duration: 520
        });
        this.feedVisuals.push(glow);

        if (behavior.mode === 'follow') {
            const treat = this.add.circle(x, y, 10, snackItem.glowColor, 0.96).setDepth(3.58);
            treat.setStrokeStyle(3, 0xfff7de, 0.95);
            this.feedVisuals.push(treat);
            this.feedTarget.mainTreat = treat;
            this.feedTarget.glow = glow;
            return;
        }

        for (let i = 0; i < 7; i += 1) {
            const pellet = this.add.circle(
                x + Phaser.Math.Between(-24, 24),
                y - Phaser.Math.Between(70, 120),
                Phaser.Math.Between(5, 8),
                snackItem.glowColor,
                1
            ).setDepth(3.5);

            this.tweens.add({
                targets: pellet,
                y: y + Phaser.Math.Between(-12, 12),
                x: pellet.x + Phaser.Math.Between(-20, 20),
                ease: 'Quad.easeIn',
                duration: Phaser.Math.Between(720, 1080),
                onComplete: () => {
                    this.tweens.add({
                        targets: pellet,
                        scale: { from: 1, to: 0.82 },
                        alpha: { from: 1, to: 0.56 },
                        yoyo: true,
                        repeat: -1,
                        duration: 260
                    });
                }
            });
            this.feedVisuals.push(pellet);
        }
    }

    feedSpecialSnack(snackId = SPECIAL_SNACK_ITEMS[0].id) {
        if (this.isFeeding) {
            this.showNotice('물고기들이 아직 특별간식을 먹는 중이야!', '#ffe082');
            return;
        }

        if (this.fishes.length === 0) {
            this.showNotice('수족관에 물고기가 있어야 특별간식을 줄 수 있어!', '#ffd0d0');
            return;
        }

        const snackItem = SNACK_ITEMS_BY_ID[snackId] || SPECIAL_SNACK_ITEMS[0];
        if (!this.model.useSnack(snackItem.id, 1)) {
            this.showNotice(`${snackItem.name}이 없어. 상점에서 먼저 사 오자!`, '#ffe082');
            this.openAquariumShop();
            return;
        }

        const snackUseCount = this.model.getSnackUsageCount(snackItem.id);
        const activeBehavior = this.getSnackBehavior(snackItem, snackUseCount);
        const recognitionActive = this.model.specialSnackFedCount >= RECOGNITION_THRESHOLD;
        if (activeBehavior.behaviorId) {
            this.model.markSnackBehaviorSeen(activeBehavior.behaviorId);
        }
        if (recognitionActive) {
            this.model.markSnackBehaviorSeen('recognition');
        }
        const comboUnlocks = this.model.processComboUnlocks();

        this.currentFeedConfig = { snackItem, activeBehavior, recognitionActive };
        this.feedTarget = this.createFeedTarget(snackItem);
        this.isFeeding = true;
        this.refreshUiState();
        this.showNotice(activeBehavior.notice, '#fff2a8');
        this.createSnackVisuals(snackItem, activeBehavior);

        if (activeBehavior.behaviorId === 'bubble_ring') {
            this.emitBubbleRing(this.feedTarget.x, this.feedTarget.y);
        }

        const greetingPoint = recognitionActive
            ? { x: this.scale.width * 0.5, y: this.scale.height * 0.24 }
            : null;

        this.fishes.forEach((fish, index) => {
            if (fish.isFixed) return;

            fish.feedState = {
                mode: activeBehavior.mode,
                phase: greetingPoint ? 'greeting' : activeBehavior.mode,
                greetingPoint,
                targetX: this.feedTarget.x + Phaser.Math.Between(-70, 70),
                targetY: this.feedTarget.y + Phaser.Math.Between(-50, 50),
                orbitRadius: Phaser.Math.Between(8, 22),
                orbitOffset: (Math.PI * 2 * index) / Math.max(1, this.fishes.length),
                nibbleTimer: 0,
                crumbTimer: Phaser.Math.Between(140, 260),
                followLag: 18 + (index * 10),
                followYOffset: (index % 2 === 0 ? -1 : 1) * Phaser.Math.Between(4, 24),
                previousSpeed: fish.speed
            };
            fish.speed *= greetingPoint ? 1.85 : (activeBehavior.mode === 'follow' ? 1.22 : 1.55);
        });

        if (greetingPoint) {
            this.time.delayedCall(1200, () => {
                this.showNotice('정우를 본 물고기들이 먼저 유리 가까이 몰려왔다가 간식 쪽으로 다시 내려간다!', '#d6f6ff');
                this.fishes.forEach((fish) => {
                    if (fish.feedState) fish.feedState.phase = fish.feedState.mode;
                });
            });
        } else {
            this.time.delayedCall(1500, () => {
                if (this.isFeeding) {
                    const snackNotice = activeBehavior.mode === 'follow'
                        ? '천천히 따라오며 줄지어 냠냠 먹고 있어!'
                        : '냠냠! 서로 먼저 먹으려고 바짝 붙어서 먹고 있어!';
                    this.showNotice(snackNotice, '#fff7b2');
                }
            });
        }

        this.pendingRecognitionStory = recognitionActive && !this.model.aquariumMomentsSeen.recognitionStory;
        this.showComboUnlockNotice(comboUnlocks);

        this.time.delayedCall(4300, () => {
            this.endSpecialFeed();
        });
    }

    updateFeedTarget(delta) {
        if (!this.feedTarget || this.feedTarget.mode !== 'follow') return;

        this.feedTarget.elapsed += delta;
        const progress = Phaser.Math.Clamp(this.feedTarget.elapsed / 3300, 0, 1);
        this.feedTarget.x = Phaser.Math.Linear(this.feedTarget.startX, this.feedTarget.endX, progress);
        this.feedTarget.y = this.feedTarget.baseY + Math.sin((this.feedTarget.elapsed * 0.0034) + this.feedTarget.swaySeed) * 18;
        this.feedTarget.direction = this.feedTarget.endX >= this.feedTarget.startX ? 1 : -1;
        this.feedTarget.trailTimer -= delta;

        if (this.feedTarget.glow) {
            this.feedTarget.glow.setPosition(this.feedTarget.x, this.feedTarget.y);
        }
        if (this.feedTarget.mainTreat) {
            this.feedTarget.mainTreat.setPosition(this.feedTarget.x, this.feedTarget.y);
        }

        if (this.feedTarget.trailTimer <= 0) {
            this.feedTarget.trailTimer = 190;
            this.emitFollowTrail(this.feedTarget.x, this.feedTarget.y);
        }
    }

    emitBubbleRing(targetX, targetY) {
        for (let i = 0; i < 10; i += 1) {
            const angle = (Math.PI * 2 * i) / 10;
            const bubble = this.add.circle(
                targetX + Math.cos(angle) * 24,
                targetY + Math.sin(angle) * 18,
                Phaser.Math.Between(4, 7),
                0xdff8ff,
                0.85
            ).setDepth(3.55);

            this.feedVisuals.push(bubble);
            this.tweens.add({
                targets: bubble,
                x: targetX + Math.cos(angle) * 70,
                y: targetY + Math.sin(angle) * 54,
                alpha: 0,
                duration: 900,
                ease: 'Sine.easeOut',
                onComplete: () => {
                    const index = this.feedVisuals.indexOf(bubble);
                    if (index >= 0) this.feedVisuals.splice(index, 1);
                    bubble.destroy();
                }
            });
        }
    }

    emitFollowTrail(targetX, targetY) {
        const sparkle = this.add.circle(
            targetX - (this.feedTarget?.direction || 1) * Phaser.Math.Between(10, 18),
            targetY + Phaser.Math.Between(-6, 6),
            Phaser.Math.Between(3, 5),
            0xfff3d9,
            0.9
        ).setDepth(3.52);
        this.feedVisuals.push(sparkle);
        this.tweens.add({
            targets: sparkle,
            alpha: 0,
            x: sparkle.x - (this.feedTarget?.direction || 1) * Phaser.Math.Between(10, 18),
            y: sparkle.y - Phaser.Math.Between(8, 14),
            scale: { from: 1, to: 0.4 },
            duration: 420,
            onComplete: () => {
                const index = this.feedVisuals.indexOf(sparkle);
                if (index >= 0) this.feedVisuals.splice(index, 1);
                sparkle.destroy();
            }
        });
    }

    endSpecialFeed() {
        this.isFeeding = false;
        this.feedTarget = null;
        this.currentFeedConfig = null;

        this.fishes.forEach((fish) => {
            if (!fish.feedState) return;
            fish.speed = fish.feedState.previousSpeed;
            fish.feedState = null;
            fish.startY = fish.y;
            fish.setScale(fish.baseScaleX, fish.baseScaleY);
            fish.angle = 0;
            if (!fish.isFixed) {
                this.pickIdleTarget(fish, true);
            }
        });

        this.feedVisuals.forEach((item) => {
            this.tweens.killTweensOf(item);
            item.destroy();
        });
        this.feedVisuals = [];
        this.refreshUiState();
        this.showNotice('배부르게 먹고 다시 유유히 헤엄치기 시작했어.', '#d7f7ff');

        if (this.pendingRecognitionStory) {
            this.pendingRecognitionStory = false;
            this.time.delayedCall(1200, () => {
                this.checkAquariumStoryMoments('feed');
            });
        }
    }

    emitNibbleBubble(fish, crumbColor = 0xf5f2cf) {
        const mouthX = fish.x + (fish.direction === 1 ? fish.displayWidth * 0.2 : -fish.displayWidth * 0.2);
        const mouthY = fish.y - fish.displayHeight * 0.04;
        const crumb = this.add.circle(mouthX, mouthY, Phaser.Math.Between(2, 4), crumbColor, 0.9).setDepth(3.6);
        this.feedVisuals.push(crumb);
        this.tweens.add({
            targets: crumb,
            x: crumb.x + Phaser.Math.Between(-10, 10),
            y: crumb.y - Phaser.Math.Between(10, 24),
            alpha: 0,
            scale: { from: 1, to: 0.4 },
            duration: 420,
            onComplete: () => {
                const index = this.feedVisuals.indexOf(crumb);
                if (index >= 0) this.feedVisuals.splice(index, 1);
                crumb.destroy();
            }
        });
    }

    showComboUnlockNotice(comboUnlocks) {
        if (!comboUnlocks || comboUnlocks.unlocked.length === 0) return;

        window.gameManagers.uiManager?.showComboStickerCelebration(comboUnlocks.unlocked);
        const comboNames = comboUnlocks.unlocked.slice(0, 2).map((entry) => entry.name).join(', ');
        const moreText = comboUnlocks.unlocked.length > 2 ? ` 외 ${comboUnlocks.unlocked.length - 2}개` : '';
        this.showNotice(`조합 도감 완성! ${comboNames}${moreText} · +${comboUnlocks.rewardTotal}G`, '#ffe88f');
    }

    checkAquariumStoryMoments(source) {
        if (this.shopUi.length > 0) return;

        const completedTheme = this.getUnlockedThemeSets().find((theme) => !this.model.aquariumMomentsSeen?.[theme.storyKey]);
        if ((source === 'decor' || source === 'create') && completedTheme) {
            this.model.markAquariumMomentSeen(completedTheme.storyKey);

            const themeStories = {
                coralThemeStory: [
                    { speaker: '세연', portrait: 'char_seyeon', text: '우와! 산호랑 조개가 반짝이니까 물고기 집이 훨씬 예뻐졌어!' },
                    { speaker: '엄마', portrait: 'char_mom', text: '색이 포근해서 보는 사람도 편안해지네. 정우가 수족관을 아주 다정하게 꾸몄구나.' },
                    { speaker: '정우', portrait: 'char_jeongwoo', text: '산호 가족 테마 완성! 물고기들이 쉬기 좋은 공간이 된 것 같아요!' }
                ],
                moonThemeStory: [
                    { speaker: '엄마', portrait: 'char_mom', text: '달빛 바위와 해초가 어우러지니 밤바다를 작은 방 안에 담아 놓은 것 같네.' },
                    { speaker: '세연', portrait: 'char_seyeon', text: '오빠, 여기 완전 반짝반짝 밤바다 동굴 같아! 나도 매일 보러 올래!' },
                    { speaker: '정우', portrait: 'char_jeongwoo', text: '달빛 쉼터 테마 완성! 조용히 쉬는 물고기들한테 딱 어울려요.' }
                ],
                pirateThemeStory: [
                    { speaker: '세연', portrait: 'char_seyeon', text: '해적 성채까지 생기니까 진짜 보물 바다 같아! 물고기들이 모험하는 느낌이야!' },
                    { speaker: '아빠', portrait: 'char_dad', text: '테마를 하나로 맞추니 수족관이 더 살아 보이는구나. 정우 눈썰미가 좋다!' },
                    { speaker: '정우', portrait: 'char_jeongwoo', text: '해적 보물 테마도 완성! 다음엔 어떤 물고기가 이곳을 지켜 줄지 궁금해요!' }
                ]
            };

            this.scene.start('StoryScene', {
                storyData: themeStories[completedTheme.storyKey] || themeStories.coralThemeStory,
                nextScene: 'AquariumScene'
            });
            return true;
        }

        if (this.model.getUnlockedDecorCount() >= 5 && !this.model.aquariumMomentsSeen.homeSeaStory) {
            this.model.markAquariumMomentSeen('homeSeaStory');
            this.scene.start('StoryScene', {
                storyData: [
                    { speaker: '세연', portrait: 'char_seyeon', text: '우와, 오빠! 수족관이 진짜 우리 집 바다 같아!\n맨날 와서 보고 싶어!' },
                    { speaker: '엄마', portrait: 'char_mom', text: '정우가 하나씩 꾸민 덕분에 물고기들도 훨씬 편안해 보이네. 정말 따뜻한 바다야.' },
                    { speaker: '정우', portrait: 'char_jeongwoo', text: '헤헤, 우리 가족 바다처럼 보였다니 좋다! 더 멋지게 키워 볼게요!' }
                ],
                nextScene: 'AquariumScene'
            });
            return true;
        }

        if (source === 'feed' && this.model.specialSnackFedCount >= 8 && !this.model.aquariumMomentsSeen.recognitionStory) {
            this.model.markAquariumMomentSeen('recognitionStory');
            this.scene.start('StoryScene', {
                storyData: [
                    { speaker: '세연', portrait: 'char_seyeon', text: '오빠, 방금 봤어? 물고기들이 오빠를 알아보고 먼저 몰려왔어!' },
                    { speaker: '엄마', portrait: 'char_mom', text: '정우가 정성껏 돌보니까 물고기들도 마음을 열었나 보다. 참 다정한 모습이네.' },
                    { speaker: '정우', portrait: 'char_jeongwoo', text: '이제 나랑 진짜 친해졌나 봐요! 다음엔 더 맛있게 챙겨 줄게!' }
                ],
                nextScene: 'AquariumScene'
            });
            return true;
        }

        return false;
    }

    showNotice(message, color = '#ffffff') {
        this.noticeText.setText(message);
        this.noticeText.setColor(color);
        this.noticeText.setAlpha(1);
        this.noticeText.setVisible(true);

        this.tweens.killTweensOf(this.noticeText);
        this.tweens.add({
            targets: this.noticeText,
            alpha: 0,
            duration: 1200,
            delay: 1900,
            onComplete: () => {
                this.noticeText.setVisible(false);
            }
        });
    }

    update(time, delta) {
        const dt = delta / 1000;
        const crumbColor = this.currentFeedConfig?.snackItem?.crumbColor || 0xf5f2cf;
        const nextMoodState = this.getAquariumMoodState();

        if (nextMoodState.id !== this.currentMoodState?.id) {
            this.currentMoodState = nextMoodState;
            this.refreshUiState();
        }

        this.updateFeedTarget(delta);

        if (!this.isFeeding && this.fishes.length > 0) {
            this.moodBubbleTimer -= delta;
            if (this.moodBubbleTimer <= 0) {
                const candidates = this.fishes.filter((fish) => !fish.isFixed);
                const speakerFish = Phaser.Utils.Array.GetRandom(candidates);
                if (speakerFish) {
                    this.emitMoodBubble(speakerFish, this.currentMoodState);
                }
                this.moodBubbleTimer = Phaser.Math.Between(3400, 5200);
            }
        }

        this.fishes.forEach((fish) => {
            if (fish.isFixed) {
                this.syncFishAttachments(fish, time);
                return;
            }

            if (fish.feedState && this.feedTarget) {
                if (fish.feedState.phase === 'greeting' && fish.feedState.greetingPoint) {
                    const dx = fish.feedState.greetingPoint.x - fish.x;
                    const dy = fish.feedState.greetingPoint.y - fish.y;
                    fish.x += dx * Math.min(0.1, dt * 2.5);
                    fish.y += dy * Math.min(0.1, dt * 2.5);
                    fish.direction = dx >= 0 ? 1 : -1;
                    fish.flipX = fish.direction === 1;
                    fish.angle = Math.sin(time * 0.01 + fish.feedState.orbitOffset) * 5;
                } else if (fish.feedState.phase === 'follow') {
                    const targetX = this.feedTarget.x - (this.feedTarget.direction * fish.feedState.followLag);
                    const targetY = this.feedTarget.y + fish.feedState.followYOffset;
                    const dx = targetX - fish.x;
                    const dy = targetY - fish.y;

                    fish.feedState.nibbleTimer += delta;
                    fish.feedState.crumbTimer -= delta;
                    fish.x += dx * Math.min(0.08, dt * 2.1);
                    fish.y += dy * Math.min(0.08, dt * 2.1);
                    fish.direction = dx >= 0 ? 1 : -1;
                    fish.flipX = fish.direction === 1;
                    fish.setScale(
                        fish.baseScaleX * (1 + Math.sin(fish.feedState.nibbleTimer * 0.016) * 0.03),
                        fish.baseScaleY * (1 - Math.sin(fish.feedState.nibbleTimer * 0.016) * 0.04)
                    );
                    fish.angle = Math.sin((time * 0.0035) + fish.feedState.orbitOffset) * 5;

                    if (Math.hypot(dx, dy) < 22 && fish.feedState.crumbTimer <= 0) {
                        fish.feedState.crumbTimer = Phaser.Math.Between(180, 320);
                        this.emitNibbleBubble(fish, crumbColor);
                    }
                } else {
                    const dx = fish.feedState.targetX - fish.x;
                    const dy = fish.feedState.targetY - fish.y;
                    const distance = Math.hypot(dx, dy);

                    if (distance > fish.feedState.orbitRadius + 4) {
                        fish.x += dx * Math.min(0.12, dt * 3);
                        fish.y += dy * Math.min(0.12, dt * 3);
                        fish.direction = dx >= 0 ? 1 : -1;
                        fish.flipX = fish.direction === 1;
                        fish.angle = Math.sin(time * 0.01 + fish.feedState.orbitOffset) * 2;
                    } else {
                        fish.feedState.nibbleTimer += delta;
                        fish.feedState.crumbTimer -= delta;
                        fish.x = fish.feedState.targetX + Math.cos((time * 0.004) + fish.feedState.orbitOffset) * fish.feedState.orbitRadius;
                        fish.y = fish.feedState.targetY + Math.sin((time * 0.004) + fish.feedState.orbitOffset) * (fish.feedState.orbitRadius * 0.45);
                        fish.setScale(
                            fish.baseScaleX * (1 + Math.sin(fish.feedState.nibbleTimer * 0.03) * 0.04),
                            fish.baseScaleY * (1 - Math.sin(fish.feedState.nibbleTimer * 0.03) * 0.06)
                        );
                        fish.angle = Math.sin(fish.feedState.nibbleTimer * 0.02) * 7;

                        if (fish.feedState.crumbTimer <= 0) {
                            fish.feedState.crumbTimer = Phaser.Math.Between(140, 260);
                            this.emitNibbleBubble(fish, crumbColor);
                        }
                    }
                }

                this.syncFishAttachments(fish, time);
                return;
            }

            this.updateIdleFish(fish, time, delta);
            fish.setScale(fish.baseScaleX, fish.baseScaleY);
            this.syncFishAttachments(fish, time);
        });

        if (this.isMagnifying) {
            this.refreshMagnifierTexture();
        }
    }
}

window.gameManagers = window.gameManagers || {};
window.gameManagers.AquariumScene = AquariumScene;

export default AquariumScene;
