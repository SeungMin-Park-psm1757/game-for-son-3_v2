import { FISH_TYPES } from '../models/FishData.js';

const AQUARIUM_DECOR_ITEMS = [
    {
        id: 'aquarium_coral_garden',
        name: '산호 정원',
        emoji: '🪸',
        cost: 1200,
        description: '수족관 한쪽에 색색의 산호를 채워 줍니다.'
    },
    {
        id: 'aquarium_shell_bed',
        name: '조개 쉼터',
        emoji: '🐚',
        cost: 1800,
        description: '반짝이는 조개와 돌로 바닥을 꾸며 줍니다.'
    },
    {
        id: 'aquarium_bubble_fountain',
        name: '버블 분수',
        emoji: '🫧',
        cost: 2400,
        description: '거품이 보글보글 올라와 수족관이 더 살아납니다.'
    },
    {
        id: 'aquarium_treasure_castle',
        name: '보물 성채',
        emoji: '🏰',
        cost: 3200,
        description: '깊은 바다 쪽에 작은 성채와 보물 상자가 생깁니다.'
    }
];

const SPECIAL_SNACK_ITEM = {
    id: 'aquarium_special_snack',
    name: '특별간식',
    emoji: '🦐',
    cost: 700,
    description: '주면 물고기들이 우르르 몰려와 냠냠 먹습니다.'
};

class AquariumScene extends Phaser.Scene {
    constructor() {
        super({ key: 'AquariumScene' });
    }

    create() {
        this.model = window.gameManagers.playerModel;
        this.soundManager = window.gameManagers.soundManager;

        const width = this.scale.width;
        const height = this.scale.height;

        this.fishes = [];
        this.decorObjects = {};
        this.shopUi = [];
        this.feedVisuals = [];
        this.isMagnifying = false;
        this.isFeeding = false;
        this.feedTarget = null;

        this.regionCounts = [8, 10, 15, 14];
        const totalFishCount = this.regionCounts.reduce((sum, count) => sum + count, 0);
        this.regionHeights = this.regionCounts.map((count) => (count / totalFishCount) * height);
        this.regionYStarts = [0];
        for (let i = 0; i < this.regionHeights.length - 1; i++) {
            this.regionYStarts.push(this.regionYStarts[i] + this.regionHeights[i]);
        }

        this.drawBackground();
        this.createBaseDecorations();
        this.createTitleAndButtons();
        this.createFishCollection();
        this.renderUnlockedDecor();
        this.setupMagnifier();
        this.refreshUiState();
    }

    drawBackground() {
        const width = this.scale.width;
        const height = this.scale.height;
        const regionColors = [0x87ceeb, 0x5e88bb, 0x0d3b93, 0x23237d];

        regionColors.forEach((color, index) => {
            this.add.rectangle(0, this.regionYStarts[index], width, this.regionHeights[index], color).setOrigin(0).setDepth(0);
        });

        const waveGraphics = this.add.graphics().setDepth(0.2);
        const waveColors = [0x5e88bb, 0x0d3b93, 0x23237d];
        for (let i = 1; i < this.regionYStarts.length; i++) {
            const y = this.regionYStarts[i];
            waveGraphics.fillStyle(waveColors[i - 1], 1);
            waveGraphics.beginPath();
            waveGraphics.moveTo(0, y);
            for (let x = 0; x <= width; x += 10) {
                waveGraphics.lineTo(x, y - 10 * Math.sin(x * 0.045));
            }
            waveGraphics.lineTo(width, height);
            waveGraphics.lineTo(0, height);
            waveGraphics.closePath();
            waveGraphics.fillPath();
        }
    }

    createBaseDecorations() {
        const width = this.scale.width;
        const seaweedGraphics = this.add.graphics().setDepth(0.9);
        const seaweedColors = [0x4f8f5d, 0x3f8558, 0x295945, 0x24413f];

        for (let i = 0; i < 4; i++) {
            const yBase = this.regionYStarts[i] + this.regionHeights[i];
            for (let j = 0; j < 6; j++) {
                const x = Phaser.Math.Between(50, width - 50);
                const height = Phaser.Math.Between(20, 48);
                seaweedGraphics.lineStyle(4, seaweedColors[i], 0.55);
                seaweedGraphics.beginPath();
                seaweedGraphics.moveTo(x, yBase);
                for (let step = 1; step <= 5; step++) {
                    const ty = yBase - (height / 5) * step;
                    const tx = x + Math.sin(step * 1.35) * 6;
                    seaweedGraphics.lineTo(tx, ty);
                }
                seaweedGraphics.strokePath();
            }
        }
    }

    createTitleAndButtons() {
        const width = this.scale.width;

        this.add.text(width / 2, 40, '내 수족관', {
            fontSize: '32px',
            fontFamily: 'Arial',
            fontStyle: 'bold',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 5
        }).setOrigin(0.5).setDepth(30);

        this.statusText = this.add.text(width / 2, 84, '', {
            fontSize: '18px',
            fontFamily: 'Arial',
            color: '#fff7c2',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5).setDepth(30);

        this.backBtn = this.createButton(24, 120, '⬅ 돌아가기', 0);
        this.backBtn.on('pointerdown', () => {
            this.soundManager.playCoin();
            this.scene.start('IntroScene');
        });

        this.magBtn = this.createButton(width - 24, 120, '🔍 돋보기 켜기', 1);
        this.magBtn.on('pointerdown', () => {
            this.soundManager.playCoin();
            this.toggleMagnifier();
        });

        this.shopBtn = this.createButton(width - 24, 170, '🛍 꾸미기 상점', 1);
        this.shopBtn.on('pointerdown', () => {
            this.soundManager.playCoin();
            this.openAquariumShop();
        });

        this.feedBtn = this.createButton(width - 24, 220, '', 1);
        this.feedBtn.on('pointerdown', () => {
            this.soundManager.playCoin();
            this.feedSpecialSnack();
        });

        this.noticeText = this.add.text(width / 2, this.scale.height - 70, '', {
            fontSize: '22px',
            fontFamily: 'Arial',
            fontStyle: 'bold',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 5,
            align: 'center',
            wordWrap: { width: width * 0.88 }
        }).setOrigin(0.5).setDepth(220).setVisible(false);
    }

    createButton(x, y, label, originX = 0) {
        const button = this.add.text(x, y, label, {
            fontSize: '20px',
            fontFamily: 'Arial',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4,
            backgroundColor: '#222222',
            padding: { x: 10, y: 6 }
        }).setOrigin(originX, 0).setDepth(30).setInteractive({ useHandCursor: true });

        button.on('pointerover', () => button.setBackgroundColor('#666666'));
        button.on('pointerout', () => button.setBackgroundColor('#444444'));
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

        const minY = this.regionYStarts[regionIndex] + this.regionHeights[regionIndex] * 0.16;
        const maxY = this.regionYStarts[regionIndex] + this.regionHeights[regionIndex] * 0.84;
        const fish = this.add.image(
            Phaser.Math.Between(60, width - 60),
            Phaser.Math.Between(minY, maxY),
            fishData.id
        ).setDepth(2);

        const baseScale = (fishData.scale || 1) * Phaser.Math.FloatBetween(0.6, 0.8) * [1, 1.16, 1.34][growthStage];
        fish.setScale(baseScale);
        fish.baseScaleX = fish.scaleX;
        fish.baseScaleY = fish.scaleY;
        fish.growthStage = growthStage;

        if (growthStage > 0) {
            const auraColor = growthStage === 2 ? 0xffd54f : 0x7fdcff;
            fish.growthAura = this.add.ellipse(fish.x, fish.y, fish.displayWidth * 1.08, fish.displayHeight * 0.78, auraColor, 0.18).setDepth(1.6);
            this.tweens.add({
                targets: fish.growthAura,
                alpha: { from: 0.08, to: growthStage === 2 ? 0.24 : 0.18 },
                scaleX: { from: 0.92, to: 1.08 },
                scaleY: { from: 0.92, to: 1.08 },
                yoyo: true,
                repeat: -1,
                duration: growthStage === 2 ? 900 : 1200,
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
        fish.sinSpeed = Phaser.Math.FloatBetween(0.5, 2.0) * (growthStage === 2 ? 1.15 : 1);
        fish.sinRadius = Phaser.Math.FloatBetween(5, 15) * (growthStage === 2 ? 1.1 : 1);
        fish.changeDirTimer = 0;
        fish.changeDirDelay = Phaser.Math.Between(3000, 8000);
        fish.feedState = null;

        this.fishes.push(fish);
    }

    setupMagnifier() {
        const width = this.scale.width;
        const height = this.scale.height;
        const radius = 170;

        this.magCamera = this.cameras.add(0, 0, width, height).setZoom(2.5).setName('magCamera');
        this.magCamera.setBounds(0, 0, width, height);
        this.magCamera.setVisible(false);
        this.magCamera.ignore(this.children.list.filter((child) => child.depth >= 20));

        const maskGraphics = this.make.graphics({ x: 0, y: 0, add: false });
        maskGraphics.fillStyle(0xffffff);
        maskGraphics.fillCircle(0, 0, radius);
        this.magMask = maskGraphics.createGeometryMask();
        this.magCamera.setMask(this.magMask);

        this.magBorder = this.add.graphics().setDepth(100).setVisible(false);
        this.magBorder.lineStyle(6, 0xffffff, 1);
        this.magBorder.strokeCircle(0, 0, radius);

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
        const zoom = this.magCamera.zoom;
        const visibleWidth = this.magCamera.width / zoom;
        const visibleHeight = this.magCamera.height / zoom;
        const maxScrollX = Math.max(0, this.scale.width - visibleWidth);
        const maxScrollY = Math.max(0, this.scale.height - visibleHeight);

        this.magCamera.scrollX = Phaser.Math.Clamp(x - visibleWidth / 2, 0, maxScrollX);
        this.magCamera.scrollY = Phaser.Math.Clamp(y - visibleHeight / 2, 0, maxScrollY);
        this.magBorder.setPosition(x, y);
        this.magMask.geometryMask.setPosition(x, y);
    }

    refreshUiState() {
        const snackCount = this.model.snacksPurchased[SPECIAL_SNACK_ITEM.id] || 0;
        this.statusText.setText(`특별간식 보유: ${snackCount}개   ·   꾸민 소품: ${this.getUnlockedDecorCount()}개`);
        this.feedBtn.setText(`🍤 특별간식 주기 (${snackCount})`);
    }

    getUnlockedDecorCount() {
        return AQUARIUM_DECOR_ITEMS.filter((item) => (this.model.decorPurchased[item.id] || 0) > 0).length;
    }

    renderUnlockedDecor() {
        Object.values(this.decorObjects).forEach((entry) => {
            if (!entry) return;
            if (Array.isArray(entry)) {
                entry.forEach((child) => child.destroy());
            } else {
                entry.destroy();
            }
        });
        this.decorObjects = {};

        AQUARIUM_DECOR_ITEMS.forEach((item) => {
            if ((this.model.decorPurchased[item.id] || 0) <= 0) return;

            if (item.id === 'aquarium_coral_garden') {
                this.decorObjects[item.id] = this.createCoralGarden();
            } else if (item.id === 'aquarium_shell_bed') {
                this.decorObjects[item.id] = this.createShellBed();
            } else if (item.id === 'aquarium_bubble_fountain') {
                this.decorObjects[item.id] = this.createBubbleFountain();
            } else if (item.id === 'aquarium_treasure_castle') {
                this.decorObjects[item.id] = this.createTreasureCastle();
            }
        });
    }

    createCoralGarden() {
        const baseY = this.regionYStarts[2] + this.regionHeights[2] - 24;
        const x = 130;
        const objects = [];

        const glow = this.add.ellipse(x, baseY - 20, 120, 42, 0xff8ab7, 0.18).setDepth(1.1);
        objects.push(glow);

        const coralGraphics = this.add.graphics().setDepth(1.3);
        coralGraphics.fillStyle(0xff7f9b, 0.85);
        coralGraphics.fillEllipse(x - 20, baseY - 18, 22, 46);
        coralGraphics.fillEllipse(x, baseY - 26, 26, 62);
        coralGraphics.fillEllipse(x + 26, baseY - 14, 20, 40);
        coralGraphics.fillStyle(0xffc06a, 0.9);
        coralGraphics.fillCircle(x - 34, baseY - 10, 10);
        coralGraphics.fillCircle(x + 44, baseY - 18, 12);
        objects.push(coralGraphics);

        return objects;
    }

    createShellBed() {
        const baseY = this.regionYStarts[1] + this.regionHeights[1] - 18;
        const x = this.scale.width * 0.66;
        const objects = [];

        const shell1 = this.add.ellipse(x - 20, baseY, 44, 22, 0xffe4b5, 0.92).setDepth(1.25);
        const shell2 = this.add.ellipse(x + 18, baseY - 6, 34, 18, 0xffd39b, 0.92).setDepth(1.25);
        const pearl = this.add.circle(x - 6, baseY - 18, 8, 0xf5f5ff, 1).setDepth(1.4);
        const stone = this.add.ellipse(x + 48, baseY + 4, 36, 14, 0x8491a3, 0.95).setDepth(1.15);
        objects.push(shell1, shell2, pearl, stone);

        this.tweens.add({
            targets: pearl,
            alpha: { from: 0.5, to: 1 },
            yoyo: true,
            repeat: -1,
            duration: 900
        });

        return objects;
    }

    createBubbleFountain() {
        const baseX = this.scale.width - 120;
        const baseY = this.regionYStarts[2] + this.regionHeights[2] - 14;
        const objects = [];

        const base = this.add.rectangle(baseX, baseY, 56, 18, 0x46556c).setDepth(1.2);
        const nozzle = this.add.rectangle(baseX, baseY - 18, 14, 20, 0x8fc4ff).setDepth(1.25);
        objects.push(base, nozzle);

        for (let i = 0; i < 5; i++) {
            const bubble = this.add.circle(baseX + Phaser.Math.Between(-10, 10), baseY - 18, Phaser.Math.Between(4, 8), 0xdaf4ff, 0.75).setDepth(1.5);
            this.tweens.add({
                targets: bubble,
                y: baseY - 110 - Phaser.Math.Between(0, 80),
                x: bubble.x + Phaser.Math.Between(-20, 20),
                alpha: { from: 0.75, to: 0.1 },
                scale: { from: 0.6, to: 1.2 },
                ease: 'Sine.easeOut',
                duration: Phaser.Math.Between(1800, 2800),
                repeat: -1,
                delay: i * 260,
                onRepeat: () => {
                    bubble.setPosition(baseX + Phaser.Math.Between(-10, 10), baseY - 18);
                }
            });
            objects.push(bubble);
        }

        return objects;
    }

    createTreasureCastle() {
        const baseX = this.scale.width * 0.78;
        const baseY = this.regionYStarts[3] + this.regionHeights[3] - 28;
        const objects = [];

        const groundGlow = this.add.ellipse(baseX, baseY, 150, 40, 0xffd54f, 0.12).setDepth(1.05);
        const tower1 = this.add.rectangle(baseX - 24, baseY - 34, 30, 68, 0x86684d).setDepth(1.2);
        const tower2 = this.add.rectangle(baseX + 18, baseY - 40, 34, 80, 0x977759).setDepth(1.2);
        const roof1 = this.add.triangle(baseX - 24, baseY - 74, 0, 28, 15, 0, 30, 28, 0xc26a2f).setDepth(1.25);
        const roof2 = this.add.triangle(baseX + 18, baseY - 86, 0, 30, 17, 0, 34, 30, 0xb95d2a).setDepth(1.25);
        const chest = this.add.rectangle(baseX - 62, baseY - 12, 32, 22, 0x6e4622).setDepth(1.25);
        const lid = this.add.rectangle(baseX - 62, baseY - 24, 36, 10, 0x8f612e).setDepth(1.3);
        const coin = this.add.circle(baseX - 56, baseY - 18, 4, 0xffe066, 1).setDepth(1.4);
        objects.push(groundGlow, tower1, tower2, roof1, roof2, chest, lid, coin);

        this.tweens.add({
            targets: coin,
            alpha: { from: 0.45, to: 1 },
            yoyo: true,
            repeat: -1,
            duration: 800
        });

        return objects;
    }

    openAquariumShop() {
        if (this.shopUi.length > 0) return;
        if (this.isMagnifying) this.toggleMagnifier(false);

        const width = this.scale.width;
        const height = this.scale.height;
        const panelWidth = width * 0.84;
        const panelHeight = height * 0.64;
        const panelX = width / 2;
        const panelY = height / 2 + 12;

        const dim = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.55)
            .setDepth(200)
            .setInteractive();
        const panel = this.add.rectangle(panelX, panelY, panelWidth, panelHeight, 0x102742, 0.96)
            .setStrokeStyle(4, 0x89d3ff)
            .setDepth(201);
        const title = this.add.text(panelX, panelY - panelHeight / 2 + 28, '수족관 꾸미기 상점', {
            fontSize: '28px',
            fontFamily: 'Arial',
            fontStyle: 'bold',
            color: '#ffffff'
        }).setOrigin(0.5).setDepth(202);
        const subtitle = this.add.text(panelX, panelY - panelHeight / 2 + 62, '꾸미기 소품을 설치하고 특별간식도 챙겨 두자!', {
            fontSize: '16px',
            fontFamily: 'Arial',
            color: '#d8f0ff'
        }).setOrigin(0.5).setDepth(202);
        const closeBtn = this.add.text(panelX + panelWidth / 2 - 24, panelY - panelHeight / 2 + 18, '✕', {
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

        const feedback = this.add.text(panelX, panelY + panelHeight / 2 - 26, '', {
            fontSize: '18px',
            fontFamily: 'Arial',
            color: '#fff2a8',
            stroke: '#000000',
            strokeThickness: 4,
            wordWrap: { width: panelWidth * 0.85 },
            align: 'center'
        }).setOrigin(0.5).setDepth(202);

        const items = [
            ...AQUARIUM_DECOR_ITEMS.map((item) => ({ ...item, type: 'decor' })),
            { ...SPECIAL_SNACK_ITEM, type: 'snack' }
        ];

        const startY = panelY - panelHeight / 2 + 120;
        const gap = 88;

        items.forEach((item, index) => {
            const y = startY + index * gap;
            const card = this.add.rectangle(panelX, y, panelWidth * 0.9, 72, item.type === 'decor' ? 0x173858 : 0x33421c, 0.94)
                .setStrokeStyle(2, item.type === 'decor' ? 0x8fd3ff : 0xffd36b)
                .setDepth(201.5);
            const emoji = this.add.text(panelX - panelWidth * 0.37, y, item.emoji, {
                fontSize: '32px',
                fontFamily: 'Arial'
            }).setOrigin(0.5).setDepth(202);
            const name = this.add.text(panelX - panelWidth * 0.28, y - 16, item.name, {
                fontSize: '22px',
                fontFamily: 'Arial',
                fontStyle: 'bold',
                color: '#ffffff'
            }).setOrigin(0, 0.5).setDepth(202);
            const desc = this.add.text(panelX - panelWidth * 0.28, y + 12, item.description, {
                fontSize: '14px',
                fontFamily: 'Arial',
                color: '#d9e8f5',
                wordWrap: { width: panelWidth * 0.48 }
            }).setOrigin(0, 0.5).setDepth(202);

            const ownedCount = item.type === 'snack'
                ? (this.model.snacksPurchased[item.id] || 0)
                : (this.model.decorPurchased[item.id] || 0);
            const isOwnedDecor = item.type === 'decor' && ownedCount > 0;
            const canBuy = !isOwnedDecor && this.model.gold >= item.cost;
            const countText = this.add.text(panelX + panelWidth * 0.14, y - 14,
                item.type === 'snack' ? `보유 ${ownedCount}개` : (isOwnedDecor ? '설치 완료' : '미설치'),
                {
                    fontSize: '16px',
                    fontFamily: 'Arial',
                    color: item.type === 'snack' ? '#fff0b5' : '#d7f5ff'
                }).setOrigin(0, 0.5).setDepth(202);

            const buttonLabel = isOwnedDecor ? '설치됨' : `${item.cost}G 구매`;
            const buttonColor = isOwnedDecor ? '#6c7f94' : (canBuy ? (item.type === 'decor' ? '#2a79b8' : '#c58d22') : '#666666');
            const buyBtn = this.add.text(panelX + panelWidth * 0.33, y, buttonLabel, {
                fontSize: '18px',
                fontFamily: 'Arial',
                color: '#ffffff',
                backgroundColor: buttonColor,
                padding: { x: 12, y: 8 }
            }).setOrigin(0.5).setDepth(202);

            if (!isOwnedDecor) {
                buyBtn.setInteractive({ useHandCursor: canBuy });
                if (canBuy) {
                    buyBtn.on('pointerdown', () => {
                        const success = item.type === 'decor'
                            ? this.model.purchaseDecor(item.id, item.cost)
                            : this.model.purchaseSnack(item.id, item.cost);

                        if (!success) {
                            this.soundManager.playError();
                            feedback.setText('골드가 부족해. 조금 더 낚시하고 오자!');
                            return;
                        }

                        this.soundManager.playSuccess();
                        if (item.type === 'decor') {
                            this.renderUnlockedDecor();
                            feedback.setText(`${item.name} 설치 완료! 수족관이 더 멋져졌어.`);
                        } else {
                            feedback.setText('특별간식을 샀어! 이제 바로 물고기들에게 줄 수 있어.');
                        }
                        this.refreshUiState();
                        this.closeAquariumShop();
                        this.openAquariumShop();
                    });
                }
            }

            this.shopUi.push(card, emoji, name, desc, countText, buyBtn);
        });

        this.shopUi.push(dim, panel, title, subtitle, closeBtn, feedback);
        if (this.magCamera) {
            this.magCamera.ignore(this.shopUi);
        }
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

        if (!this.model.consumeSnack(SPECIAL_SNACK_ITEM.id, 1)) {
            this.showNotice('특별간식이 없어. 상점에서 먼저 사 오자!', '#ffe082');
            this.openAquariumShop();
            return;
        }

        if (this.shopUi.length > 0) {
            this.closeAquariumShop();
        }

        const targetX = this.scale.width * Phaser.Math.FloatBetween(0.36, 0.64);
        const targetY = this.scale.height * Phaser.Math.FloatBetween(0.42, 0.68);
        this.isFeeding = true;
        this.feedTarget = { x: targetX, y: targetY };
        this.refreshUiState();
        this.showNotice('특별간식을 뿌렸어! 물고기들이 우르르 몰려든다!', '#fff2a8');

        const glow = this.add.circle(targetX, targetY, 24, 0xffd166, 0.32).setDepth(3.4);
        this.tweens.add({
            targets: glow,
            radius: { from: 18, to: 32 },
            alpha: { from: 0.36, to: 0.12 },
            yoyo: true,
            repeat: -1,
            duration: 520
        });
        this.feedVisuals.push(glow);

        for (let i = 0; i < 7; i++) {
            const pellet = this.add.circle(
                targetX + Phaser.Math.Between(-24, 24),
                targetY - Phaser.Math.Between(70, 120),
                Phaser.Math.Between(5, 8),
                0xffc857,
                1
            ).setDepth(3.5);

            this.tweens.add({
                targets: pellet,
                y: targetY + Phaser.Math.Between(-12, 14),
                x: pellet.x + Phaser.Math.Between(-20, 20),
                ease: 'Quad.easeIn',
                duration: Phaser.Math.Between(700, 1100),
                onComplete: () => {
                    this.tweens.add({
                        targets: pellet,
                        scale: { from: 1, to: 0.82 },
                        alpha: { from: 1, to: 0.6 },
                        yoyo: true,
                        repeat: -1,
                        duration: 280
                    });
                }
            });
            this.feedVisuals.push(pellet);
        }

        this.fishes.forEach((fish, index) => {
            if (fish.isFixed) return;

            fish.feedState = {
                targetX: targetX + Phaser.Math.Between(-70, 70),
                targetY: targetY + Phaser.Math.Between(-55, 55),
                orbitRadius: Phaser.Math.Between(8, 24),
                orbitOffset: (Math.PI * 2 * index) / Math.max(1, this.fishes.length),
                nibbleTimer: 0,
                crumbTimer: Phaser.Math.Between(140, 260),
                previousSpeed: fish.speed
            };
            fish.speed *= 1.55;
        });

        this.time.delayedCall(1700, () => {
            if (this.isFeeding) {
                this.showNotice('냠냠! 서로 먼저 먹으려고 바짝 붙어서 먹고 있어!', '#fff7b2');
            }
        });

        this.time.delayedCall(4300, () => {
            this.endSpecialFeed();
        });
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
            delay: 1800,
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
                const dx = fish.feedState.targetX - fish.x;
                const dy = fish.feedState.targetY - fish.y;
                const distance = Math.hypot(dx, dy);

                if (distance > fish.feedState.orbitRadius + 4) {
                    fish.x += dx * Math.min(0.11, dt * 2.8);
                    fish.y += dy * Math.min(0.11, dt * 2.8);
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
