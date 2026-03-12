import { FISH_TYPES } from '../models/FishData.js';

const AQUARIUM_DECOR_ITEMS = [
    {
        id: 'aquarium_coral_garden',
        name: '산호 정원',
        icon: '🪸',
        cost: 1200,
        description: '중간 수심에 화사한 산호 군락을 세웁니다.',
        assetKey: 'decor_coral_garden',
        regionIndex: 2,
        xRatio: 0.2,
        yOffset: 30,
        scale: 0.95
    },
    {
        id: 'aquarium_shell_bed',
        name: '조개 쉼터',
        icon: '🐚',
        cost: 1700,
        description: '부드러운 조개 바닥이 물고기들의 쉼터가 됩니다.',
        assetKey: 'decor_shell_bed',
        regionIndex: 1,
        xRatio: 0.72,
        yOffset: 22,
        scale: 0.92
    },
    {
        id: 'aquarium_bubble_fountain',
        name: '버블 분수',
        icon: '🫧',
        cost: 2300,
        description: '보글보글 올라오는 거품으로 수족관이 더 살아납니다.',
        assetKey: 'decor_bubble_fountain',
        regionIndex: 2,
        xRatio: 0.82,
        yOffset: 18,
        scale: 0.95
    },
    {
        id: 'aquarium_treasure_castle',
        name: '보물 성채',
        icon: '🏰',
        cost: 3200,
        description: '깊은 바다 구석에 오래된 보물 성채를 세웁니다.',
        assetKey: 'decor_treasure_castle',
        regionIndex: 3,
        xRatio: 0.78,
        yOffset: 32,
        scale: 1
    },
    {
        id: 'aquarium_kelp_arch',
        name: '해초 아치',
        icon: '🌿',
        cost: 2100,
        description: '물결을 따라 흔들리는 해초 아치를 더합니다.',
        assetKey: 'decor_kelp_arch',
        regionIndex: 2,
        xRatio: 0.48,
        yOffset: 26,
        scale: 0.98
    },
    {
        id: 'aquarium_moon_rocks',
        name: '달빛 바위',
        icon: '🪨',
        cost: 2600,
        description: '깊은 곳을 은은하게 밝히는 바위와 진주를 놓습니다.',
        assetKey: 'decor_moon_rocks',
        regionIndex: 3,
        xRatio: 0.2,
        yOffset: 24,
        scale: 0.95
    }
];

const SPECIAL_SNACK_ITEM = {
    id: 'aquarium_special_snack',
    name: '특별간식',
    icon: '🍤',
    cost: 700,
    description: '주면 물고기들이 우르르 몰려와 냠냠 먹습니다.'
};

const SHOP_ITEMS = [
    ...AQUARIUM_DECOR_ITEMS.map((item) => ({ ...item, type: 'decor' })),
    { ...SPECIAL_SNACK_ITEM, type: 'snack' }
];

const SNACK_BEHAVIOR_RULES = [
    { threshold: 1, behaviorId: 'swarm_first', notice: '특별간식을 뿌렸어! 지나가던 물고기들이 우르르 몰려든다!' },
    { threshold: 4, behaviorId: 'bubble_ring', notice: '냠냠! 먹이 주위에 동그란 버블 링이 피어오른다!' },
    { threshold: 8, behaviorId: 'recognition', notice: '어? 물고기들이 정우를 먼저 알아보고 반갑게 모여든다!' }
];

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
        this.pendingRecognitionStory = false;
        this.magRadius = 150;
        this.magZoom = 2.6;

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
        this.createFishCollection();
        this.renderUnlockedDecor();
        this.setupMagnifier();
        this.refreshUiState();
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
            fontSize: '18px',
            fontFamily: 'Arial',
            color: '#fff3c9',
            stroke: '#000000',
            strokeThickness: 4
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
        const minY = this.regionYStarts[regionIndex] + this.regionHeights[regionIndex] * 0.18;
        const maxY = this.regionYStarts[regionIndex] + this.regionHeights[regionIndex] * 0.82;

        const fish = this.add.image(
            Phaser.Math.Between(60, width - 60),
            Phaser.Math.Between(minY, maxY),
            fishData.id
        ).setDepth(2);

        const growthScales = [1, 1.16, 1.34];
        const baseScale = (fishData.scale || 1) * Phaser.Math.FloatBetween(0.6, 0.82) * growthScales[growthStage];
        fish.setScale(baseScale);
        fish.baseScaleX = fish.scaleX;
        fish.baseScaleY = fish.scaleY;
        fish.growthStage = growthStage;

        if (growthStage > 0) {
            const auraColor = growthStage === 2 ? 0xffdc7f : 0x8be3ff;
            fish.growthAura = this.add.ellipse(fish.x, fish.y, fish.displayWidth * 1.06, fish.displayHeight * 0.76, auraColor, 0.16).setDepth(1.6);
            this.tweens.add({
                targets: fish.growthAura,
                alpha: { from: 0.08, to: growthStage === 2 ? 0.24 : 0.18 },
                scaleX: { from: 0.9, to: 1.08 },
                scaleY: { from: 0.9, to: 1.08 },
                yoyo: true,
                repeat: -1,
                duration: growthStage === 2 ? 880 : 1100,
                ease: 'Sine.easeInOut'
            });
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
        }

        fish.startY = fish.y;
        fish.sinCount = Phaser.Math.FloatBetween(0, Math.PI * 2);
        fish.sinSpeed = Phaser.Math.FloatBetween(0.5, 1.7) * (growthStage === 2 ? 1.12 : 1);
        fish.sinRadius = Phaser.Math.FloatBetween(4, 14) * (growthStage === 2 ? 1.08 : 1);
        fish.changeDirTimer = 0;
        fish.changeDirDelay = Phaser.Math.Between(3000, 8000);
        fish.feedState = null;

        this.fishes.push(fish);
    }

    setupMagnifier() {
        const width = this.scale.width;
        const height = this.scale.height;
        const radius = this.magRadius;

        this.magCamera = this.cameras.add(0, 0, radius * 2, radius * 2).setZoom(this.magZoom).setName('magCamera');
        this.magCamera.setBounds(0, 0, width, height);
        this.magCamera.setRoundPixels(true);
        this.magCamera.setVisible(false);
        this.magCamera.ignore(this.children.list.filter((child) => child.depth >= 20));

        const maskGraphics = this.make.graphics({ x: 0, y: 0, add: false });
        maskGraphics.fillStyle(0xffffff);
        maskGraphics.fillCircle(radius, radius, radius);
        this.magMask = maskGraphics.createGeometryMask();
        this.magCamera.setMask(this.magMask);

        this.magBorder = this.add.graphics().setDepth(120).setVisible(false);

        this.input.on('pointermove', (pointer) => {
            if (this.isMagnifying) {
                this.updateMagnifier(pointer.x, pointer.y);
            }
        });
    }

    toggleMagnifier(forceState = null) {
        this.isMagnifying = forceState === null ? !this.isMagnifying : forceState;
        this.magCamera.setVisible(this.isMagnifying);
        this.magBorder.setVisible(this.isMagnifying);
        this.magBtn.setText(this.isMagnifying ? '🔍 돋보기 끄기' : '🔍 돋보기 켜기');

        if (this.isMagnifying) {
            const pointer = this.input.activePointer;
            this.updateMagnifier(pointer.x, pointer.y);
        }
    }

    updateMagnifier(x, y) {
        const radius = this.magRadius;
        const zoom = this.magCamera.zoom;
        const visibleWidth = (radius * 2) / zoom;
        const visibleHeight = (radius * 2) / zoom;
        const maxScrollX = Math.max(0, this.scale.width - visibleWidth);
        const maxScrollY = Math.max(0, this.scale.height - visibleHeight);

        this.magCamera.setViewport(x - radius, y - radius, radius * 2, radius * 2);
        this.magCamera.scrollX = Phaser.Math.Clamp(x - visibleWidth / 2, 0, maxScrollX);
        this.magCamera.scrollY = Phaser.Math.Clamp(y - visibleHeight / 2, 0, maxScrollY);

        this.magBorder.clear();
        this.magBorder.lineStyle(6, 0xffffff, 1);
        this.magBorder.strokeCircle(x, y, radius);
        this.magMask.geometryMask.setPosition(x - radius, y - radius);
    }

    refreshUiState() {
        const snackCount = this.model.snacksPurchased[SPECIAL_SNACK_ITEM.id] || 0;
        const decorCount = this.model.getUnlockedDecorCount();
        this.statusText.setText(`특별간식 ${snackCount}개 · 꾸민 소품 ${decorCount}개 · 물고기 ${this.fishes.length}종`);
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

        const shadow = this.add.ellipse(x, regionBaseY - 10, 120, 20, 0x081322, 0.22).setDepth(1.05);
        const glow = this.add.ellipse(x, y + 8, 110, 36, 0xbceeff, 0.08).setDepth(1.08);
        const sprite = this.add.image(x, y, item.assetKey).setScale(item.scale).setDepth(1.3);
        objects.push(shadow, glow, sprite);

        if (item.id === 'aquarium_bubble_fountain') {
            for (let i = 0; i < 4; i += 1) {
                const bubble = this.add.circle(x + Phaser.Math.Between(-8, 8), y - 18, Phaser.Math.Between(4, 7), 0xe1f8ff, 0.75).setDepth(1.55);
                this.tweens.add({
                    targets: bubble,
                    y: y - 110 - Phaser.Math.Between(0, 40),
                    x: bubble.x + Phaser.Math.Between(-12, 12),
                    alpha: { from: 0.75, to: 0.08 },
                    scale: { from: 0.7, to: 1.2 },
                    duration: Phaser.Math.Between(1900, 2600),
                    repeat: -1,
                    delay: i * 280,
                    onRepeat: () => {
                        bubble.setPosition(x + Phaser.Math.Between(-8, 8), y - 18);
                    }
                });
                objects.push(bubble);
            }
        } else if (item.id === 'aquarium_treasure_castle') {
            const sparkle = this.add.circle(x - 22, y - 12, 4, 0xffe38a, 1).setDepth(1.58);
            this.tweens.add({
                targets: sparkle,
                alpha: { from: 0.45, to: 1 },
                scale: { from: 0.8, to: 1.25 },
                yoyo: true,
                repeat: -1,
                duration: 760
            });
            objects.push(sparkle);
        } else if (item.id === 'aquarium_moon_rocks') {
            this.tweens.add({
                targets: glow,
                alpha: { from: 0.05, to: 0.16 },
                scaleX: { from: 0.95, to: 1.08 },
                scaleY: { from: 0.95, to: 1.05 },
                yoyo: true,
                repeat: -1,
                duration: 1200
            });
        } else if (item.id === 'aquarium_coral_garden') {
            this.tweens.add({
                targets: sprite,
                angle: { from: -1.4, to: 1.4 },
                yoyo: true,
                repeat: -1,
                duration: 1500,
                ease: 'Sine.easeInOut'
            });
        }

        return objects;
    }

    openAquariumShop() {
        if (this.shopUi.length > 0) return false;
        if (this.isMagnifying) this.toggleMagnifier(false);

        const width = this.scale.width;
        const height = this.scale.height;
        const panelWidth = width * 0.88;
        const panelHeight = height * 0.72;
        const panelX = width / 2;
        const panelY = height / 2 + 18;
        const cardWidth = panelWidth * 0.42;
        const cardHeight = 98;
        const columns = 2;

        const dim = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.58)
            .setDepth(200)
            .setInteractive();
        const panel = this.add.rectangle(panelX, panelY, panelWidth, panelHeight, 0x102742, 0.98)
            .setStrokeStyle(4, 0x8bd7ff)
            .setDepth(201);
        const title = this.add.text(panelX, panelY - panelHeight / 2 + 28, '수족관 꾸미기 & 간식 상점', {
            fontSize: '28px',
            fontFamily: 'Arial',
            fontStyle: 'bold',
            color: '#ffffff'
        }).setOrigin(0.5).setDepth(202);
        const subtitle = this.add.text(panelX, panelY - panelHeight / 2 + 58, '소품을 설치하고 특별간식은 여기서 바로 줄 수 있어요.', {
            fontSize: '16px',
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
            const y = panelY - panelHeight / 2 + 132 + (row * 108);
            const isSnack = item.type === 'snack';
            const ownedCount = isSnack
                ? (this.model.snacksPurchased[item.id] || 0)
                : (this.model.decorPurchased[item.id] || 0);
            const isOwnedDecor = !isSnack && ownedCount > 0;

            const card = this.add.rectangle(x, y, cardWidth, cardHeight, isSnack ? 0x374621 : 0x163a59, 0.95)
                .setStrokeStyle(2, isSnack ? 0xf7cb6d : 0x8bd7ff)
                .setDepth(201.5);
            const icon = this.add.text(x - cardWidth * 0.37, y - 16, item.icon, {
                fontSize: '30px',
                fontFamily: 'Arial'
            }).setOrigin(0.5).setDepth(202);
            const name = this.add.text(x - cardWidth * 0.22, y - 22, item.name, {
                fontSize: '19px',
                fontFamily: 'Arial',
                fontStyle: 'bold',
                color: '#ffffff'
            }).setOrigin(0, 0.5).setDepth(202);
            const desc = this.add.text(x - cardWidth * 0.22, y + 4, item.description, {
                fontSize: '12px',
                fontFamily: 'Arial',
                color: '#d9e8f5',
                wordWrap: { width: cardWidth * 0.52 }
            }).setOrigin(0, 0.5).setDepth(202);
            const ownedText = this.add.text(x - cardWidth * 0.22, y + 34,
                isSnack ? `보유 ${ownedCount}개` : (isOwnedDecor ? '설치 완료' : '미설치'),
                {
                    fontSize: '14px',
                    fontFamily: 'Arial',
                    color: isSnack ? '#fff0b5' : '#d7f5ff'
                }).setOrigin(0, 0.5).setDepth(202);

            this.shopUi.push(card, icon, name, desc, ownedText);

            if (isSnack) {
                const buyBtn = this.createShopButton(x + cardWidth * 0.2, y - 18, `${item.cost}G 구매`, '#bd8a20', this.model.gold >= item.cost, () => {
                    const success = this.model.purchaseSnack(item.id, item.cost);
                    if (!success) {
                        this.soundManager.playError();
                        feedback.setText('골드가 부족해. 조금 더 낚시하고 오자!');
                        return;
                    }

                    this.soundManager.playSuccess();
                    feedback.setText('특별간식 1개를 담았어! 이제 바로 줄 수 있어.');
                    this.refreshUiState();
                    this.closeAquariumShop();
                    this.openAquariumShop();
                });
                this.shopUi.push(buyBtn);

                const feedBtn = this.createShopButton(x + cardWidth * 0.2, y + 20, ownedCount > 0 ? '바로 주기' : '간식 없음', '#5d9f4d', ownedCount > 0, () => {
                    this.closeAquariumShop();
                    this.feedSpecialSnack();
                });
                this.shopUi.push(feedBtn);
            } else {
                const canBuy = !isOwnedDecor && this.model.gold >= item.cost;
                const buttonLabel = isOwnedDecor ? '설치 완료' : `${item.cost}G 구매`;
                const button = this.createShopButton(x + cardWidth * 0.22, y, buttonLabel, isOwnedDecor ? '#6c7f94' : '#2a79b8', canBuy, () => {
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
        this.magCamera.ignore(this.shopUi);
    }

    createShopButton(x, y, label, backgroundColor, enabled, onClick) {
        const button = this.add.text(x, y, label, {
            fontSize: '16px',
            fontFamily: 'Arial',
            color: '#ffffff',
            backgroundColor: enabled ? backgroundColor : '#666666',
            padding: { x: 10, y: 6 }
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

    feedSpecialSnack() {
        if (this.isFeeding) {
            this.showNotice('물고기들이 아직 특별간식을 먹는 중이야!', '#ffe082');
            return;
        }

        if (this.fishes.length === 0) {
            this.showNotice('수족관에 물고기가 있어야 특별간식을 줄 수 있어!', '#ffd0d0');
            return;
        }

        if (!this.model.useSpecialSnack(SPECIAL_SNACK_ITEM.id, 1)) {
            this.showNotice('특별간식이 없어. 상점에서 먼저 사 오자!', '#ffe082');
            this.openAquariumShop();
            return;
        }

        const feedCount = this.model.specialSnackFedCount;
        const activeBehavior = SNACK_BEHAVIOR_RULES.reduce((latest, rule) => {
            if (feedCount >= rule.threshold) return rule;
            return latest;
        }, SNACK_BEHAVIOR_RULES[0]);

        this.model.markSnackBehaviorSeen(activeBehavior.behaviorId);
        const comboUnlocks = this.model.processComboUnlocks();

        const targetX = this.scale.width * Phaser.Math.FloatBetween(0.38, 0.62);
        const targetY = this.scale.height * Phaser.Math.FloatBetween(0.42, 0.66);
        this.feedTarget = { x: targetX, y: targetY };
        this.isFeeding = true;
        this.refreshUiState();
        this.showNotice(activeBehavior.notice, '#fff2a8');

        const glow = this.add.circle(targetX, targetY, 24, 0xffd166, 0.32).setDepth(3.4);
        this.tweens.add({
            targets: glow,
            radius: { from: 18, to: 34 },
            alpha: { from: 0.36, to: 0.12 },
            yoyo: true,
            repeat: -1,
            duration: 520
        });
        this.feedVisuals.push(glow);

        if (activeBehavior.behaviorId === 'bubble_ring') {
            this.emitBubbleRing(targetX, targetY);
        }

        const greetingPoint = activeBehavior.behaviorId === 'recognition'
            ? { x: this.scale.width * 0.5, y: this.scale.height * 0.24 }
            : null;

        for (let i = 0; i < 7; i += 1) {
            const pellet = this.add.circle(
                targetX + Phaser.Math.Between(-24, 24),
                targetY - Phaser.Math.Between(70, 120),
                Phaser.Math.Between(5, 8),
                0xffc857,
                1
            ).setDepth(3.5);

            this.tweens.add({
                targets: pellet,
                y: targetY + Phaser.Math.Between(-12, 12),
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

        this.fishes.forEach((fish, index) => {
            if (fish.isFixed) return;

            fish.feedState = {
                phase: greetingPoint ? 'greeting' : 'snack',
                greetingPoint,
                targetX: targetX + Phaser.Math.Between(-70, 70),
                targetY: targetY + Phaser.Math.Between(-50, 50),
                orbitRadius: Phaser.Math.Between(8, 22),
                orbitOffset: (Math.PI * 2 * index) / Math.max(1, this.fishes.length),
                nibbleTimer: 0,
                crumbTimer: Phaser.Math.Between(140, 260),
                previousSpeed: fish.speed
            };
            fish.speed *= greetingPoint ? 1.9 : 1.55;
        });

        if (greetingPoint) {
            this.time.delayedCall(1200, () => {
                this.showNotice('정우를 본 물고기들이 먼저 유리 가까이 몰려왔다가 간식 쪽으로 다시 내려간다!', '#d6f6ff');
                this.fishes.forEach((fish) => {
                    if (fish.feedState) fish.feedState.phase = 'snack';
                });
            });
        } else {
            this.time.delayedCall(1500, () => {
                if (this.isFeeding) {
                    this.showNotice('냠냠! 서로 먼저 먹으려고 바짝 붙어서 먹고 있어!', '#fff7b2');
                }
            });
        }

        this.pendingRecognitionStory = this.model.specialSnackFedCount >= 8 && !this.model.aquariumMomentsSeen.recognitionStory;
        this.showComboUnlockNotice(comboUnlocks);

        this.time.delayedCall(4300, () => {
            this.endSpecialFeed();
        });
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

    endSpecialFeed() {
        this.isFeeding = false;
        this.feedTarget = null;

        this.fishes.forEach((fish) => {
            if (!fish.feedState) return;
            fish.speed = fish.feedState.previousSpeed;
            fish.feedState = null;
            fish.startY = fish.y;
            fish.setScale(fish.baseScaleX, fish.baseScaleY);
            fish.angle = 0;
        });

        this.feedVisuals.forEach((item) => {
            this.tweens.killTweensOf(item);
            item.destroy();
        });
        this.feedVisuals = [];
        this.showNotice('배부르게 먹고 다시 유유히 헤엄치기 시작했어.', '#d7f7ff');

        if (this.pendingRecognitionStory) {
            this.pendingRecognitionStory = false;
            this.time.delayedCall(1200, () => {
                this.checkAquariumStoryMoments('feed');
            });
        }
    }

    emitNibbleBubble(fish) {
        const mouthX = fish.x + (fish.direction === 1 ? fish.displayWidth * 0.2 : -fish.displayWidth * 0.2);
        const mouthY = fish.y - fish.displayHeight * 0.04;
        const crumb = this.add.circle(mouthX, mouthY, Phaser.Math.Between(2, 4), 0xf5f2cf, 0.9).setDepth(3.6);
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

        const comboNames = comboUnlocks.unlocked.slice(0, 2).map((entry) => entry.name).join(', ');
        const moreText = comboUnlocks.unlocked.length > 2 ? ` 외 ${comboUnlocks.unlocked.length - 2}개` : '';
        this.showNotice(`조합 도감 완성! ${comboNames}${moreText} · +${comboUnlocks.rewardTotal}G`, '#ffe88f');
    }

    checkAquariumStoryMoments(source) {
        if (this.shopUi.length > 0) return;

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
        const width = this.scale.width;
        const dt = delta / 1000;

        this.fishes.forEach((fish) => {
            if (fish.isFixed) return;

            if (fish.feedState && this.feedTarget) {
                if (fish.feedState.phase === 'greeting' && fish.feedState.greetingPoint) {
                    const dx = fish.feedState.greetingPoint.x - fish.x;
                    const dy = fish.feedState.greetingPoint.y - fish.y;
                    fish.x += dx * Math.min(0.1, dt * 2.5);
                    fish.y += dy * Math.min(0.1, dt * 2.5);
                    fish.direction = dx >= 0 ? 1 : -1;
                    fish.flipX = fish.direction === 1;
                    fish.angle = Math.sin(time * 0.01 + fish.feedState.orbitOffset) * 5;
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
                            this.emitNibbleBubble(fish);
                        }
                    }
                }

                if (fish.growthAura) {
                    fish.growthAura.setPosition(fish.x, fish.y);
                }
                return;
            }

            fish.x += fish.speed * fish.direction * dt;
            fish.sinCount += fish.sinSpeed * dt;
            fish.y = fish.startY + Math.sin(fish.sinCount) * fish.sinRadius;
            fish.angle = 0;
            fish.setScale(fish.baseScaleX, fish.baseScaleY);

            if (fish.growthAura) {
                fish.growthAura.setPosition(fish.x, fish.y);
            }

            if (fish.x > width + 50) {
                fish.x = width + 50;
                fish.direction = -1;
                fish.flipX = false;
            } else if (fish.x < -50) {
                fish.x = -50;
                fish.direction = 1;
                fish.flipX = true;
            }

            fish.changeDirTimer += delta;
            if (fish.changeDirTimer > fish.changeDirDelay) {
                fish.changeDirTimer = 0;
                fish.changeDirDelay = Phaser.Math.Between(3000, 8000);
                if (Math.random() < 0.2 && fish.x > 100 && fish.x < width - 100) {
                    fish.direction *= -1;
                    fish.flipX = fish.direction === 1;
                }
            }
        });
    }
}

window.gameManagers = window.gameManagers || {};
window.gameManagers.AquariumScene = AquariumScene;

export default AquariumScene;
