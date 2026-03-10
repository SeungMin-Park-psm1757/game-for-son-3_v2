import { getRandomFish, FISH_TYPES } from '../models/FishData.js';
import { BOSS_STORIES, FIRST_CATCH_STORIES } from '../models/StoryData.js';

export default class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
        // 寃뚯엫 ?곹깭 愿由?
        this.gameState = 'IDLE'; // IDLE, APPROACH, BITE, CATCH, REWARD
        this.catchGauge = 0;
        this.catchMax = 100;
        this.fish = null;
        this.lure = null;
        this.character = null;
        this.fishingLine = null;
        this.uiElements = {};

        // ?붾컮?댁떛????꾩뒪?ы봽
        this.lastActionTime = 0;

        // 吏??梨뺥꽣) ?뺣낫 (湲곕낯媛? 1)
        this.region = 1;

        // --- 援ъ젣 ?쒖뒪??(Fever Time) ---
        this.consecutiveFails = 0;
        this.isFeverTime = false;
        this.feverTimeRemaining = 0;

        // --- ?ㅽ뵆?쇱씤 臾쇰━ + 以??먯뀡/?딄? ---
        this.lineTension = 0; // 0~1 踰붿쐞

        // --- 罹먯뒪???ㅽ궗??---
        this.castingBonus = 1; // 0=鍮쀫굹媛? 1=蹂댄넻, 2=醫뗭쓬, 3=?꾨꼍
        this.targetRingX = 0;
        this.targetRingY = 0;

        // --- 3醫?誘몃땲寃뚯엫 ---
        this.miniGameType = 'mash'; // 'mash', 'timing', 'draw'
        this.timingBarX = 0;
        this.timingBarDir = 1;
        this.timingGreenStart = 0;
        this.timingGreenEnd = 0;
        this.timingHits = 0;
        this.timingRequired = 4;
        this.drawPath = [];
        this.drawUserPath = [];
        this.isDrawing = false;

        // --- 肄ㅻ낫 ?쒖뒪??---
        this.comboCount = 0;
        this.bossVariant = 'normal';
        this.treasureIslandBuff = null;
        this.activeCatchBuff = null;

        // --- 蹂댁뒪 ?댁쥌 ---
        this.isBossFight = false;
        this.bossTimeLimit = 0;
        this.bossTimer = 0;
        this.regionFishCount = 0; // ?꾩옱 吏???싳떆 ?잛닔
    }

    init(data) {
        this.region = (data && data.region) ? data.region : 1;

        // ???ъ떆?????곹깭 ?꾩쟾 珥덇린??
        this.gameState = 'IDLE';
        this.catchGauge = 0;
        this.catchMax = 100;
        this.fish = null;
        this.lure = null;
        this.character = null;
        this.fishingLine = null;
        this.uiElements = {};
        this.lastActionTime = 0;
        this.consecutiveFails = 0;
        this.isFeverTime = false;
        this.feverTimeRemaining = 0;
        this.lineTension = 0;
        this.wanderingFishes = [];
        this.castingBonus = 1;
        this.miniGameType = 'mash';
        this.timingBarX = 0;
        this.timingHits = 0;
        this.drawPath = [];
        this.drawUserPath = [];
        this.isDrawing = false;
        this.bossVariant = 'normal';
        this.treasureIslandBuff = null;
        this.activeCatchBuff = null;

        this.isBossFight = false;
        this.bossTimeLimit = 0;
        this.bossTimer = 0;
        this.regionFishCount = 0;
    }

    create() {
        // --- 0. ?꾩뿭 ?곗씠??珥덇린??(?먮윭 諛⑹??? ---
        if (!window.gameManagers.fishData) {
            window.gameManagers.fishData = {
                region1: FISH_TYPES.filter(f => f.region === 1),
                region2: FISH_TYPES.filter(f => f.region === 2),
                region3: FISH_TYPES.filter(f => f.region === 3),
                region4: FISH_TYPES.filter(f => f.region === 4)
            };
        }

        // --- 1. 諛곌꼍 諛??붾㈃ ?뗭뾽 ---
        const width = this.scale.width;
        const height = this.scale.height;

        // 諛곌꼍 ?대?吏 (?붾㈃ 苑?李④쾶)
        let bgKey = 'bg_coast';
        if (this.region === 1) bgKey = 'bg_freshwater';
        else if (this.region === 3) bgKey = 'bg_sea';
        else if (this.region === 4) bgKey = 'bg_treasure_island';

        this.bg = this.add.image(width / 2, height / 2, bgKey);
        this.bg.setDisplaySize(width, height);
        this.bg.setInteractive(); // 諛곌꼍 ?대┃?쇰줈 ?싳떆 ?쒖옉
        this.water = this.bg; // 湲곗〈 肄붾뱶 ?명솚???꾪빐 water 蹂?섏뿉 ?좊떦

        // 臾쇨퀬湲??뚯븘?ㅻ땲???ㅻ（???앹꽦
        this.createWanderingFishes();

        // ?곹깭李?UI (?꾩떆)
        const regionNames = { 1: "민물", 2: "연안", 3: "먼 바다", 4: "보물섬" };
        const instrFontSize = Math.max(18, Math.round(width * 0.044)) + 'px';
        this.uiElements.instruction = this.add.text(width / 2, height * 0.08, `${regionNames[this.region]}에서 화면 아래를 눌러 낚시해 보자!`, {
            fontSize: instrFontSize, fontFamily: 'Arial', color: '#FFFFFF', stroke: '#000000', strokeThickness: 4,
            wordWrap: { width: width * 0.9 }
        }).setOrigin(0.5);
        // ?꾩옱 梨뺥꽣 紐⑺몴 ?쒖떆 UI
        this.updateGoalText();

        // 吏??퀎 UI 諛?罹먮┃???꾩튂 ?ㅼ젙 (罹먮┃?곌? ?꾩뿉 ?덉쑝硫?UI???꾨옒濡?
        const uiTop = this.region < 3;
        const feverY = height * (uiTop ? 0.25 : 0.78);
        const gaugeY = height * (uiTop ? 0.18 : 0.85);
        const tensionY = height * (uiTop ? 0.22 : 0.81);
        const tensionWarnY = height * (uiTop ? 0.26 : 0.77);

        // ?쇰쾭 ????띿뒪??
        this.uiElements.feverText = this.add.text(width / 2, feverY, '?뵦 FEVER TIME! ?뵦', {
            fontSize: '40px', fontFamily: 'Arial', color: '#FF4500',
            stroke: '#FFD700', strokeThickness: 6
        }).setOrigin(0.5).setDepth(20).setVisible(false);

        // 蹂댁뒪 ??대㉧ ?띿뒪??
        this.uiElements.bossTimerText = this.add.text(width / 2, gaugeY - 40, '보스 남은 시간: 15초', {
            fontSize: '24px', fontFamily: 'Arial', color: '#FF0000',
            stroke: '#FFFFFF', strokeThickness: 4, fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(20).setVisible(false);

        // ?고? 寃뚯씠吏諛?(諛곌꼍, 寃뚯씠吏)
        const gaugeWidth = Math.min(400, Math.round(width * 0.88));
        this.gaugeWidth = gaugeWidth;
        this.uiElements.gaugeBg = this.add.rectangle(width / 2, gaugeY, gaugeWidth, 40, 0x333333).setDepth(10).setVisible(false);
        this.uiElements.gaugeBar = this.add.rectangle(width / 2 - gaugeWidth / 2, gaugeY, 0, 40, 0x00FF00).setOrigin(0, 0.5).setDepth(11).setVisible(false);

        // --- 以??먯뀡 寃쎄퀬 諛?---
        this.uiElements.tensionBg = this.add.rectangle(width / 2, tensionY, gaugeWidth, 16, 0x333333).setDepth(10).setVisible(false);
        this.uiElements.tensionBar = this.add.rectangle(width / 2 - gaugeWidth / 2, tensionY, 0, 16, 0xff4444).setOrigin(0, 0.5).setDepth(11).setVisible(false);
        this.uiElements.tensionWarn = this.add.text(width / 2, tensionWarnY, '', {
            fontSize: '20px', fontFamily: 'Arial', color: '#FF0000', stroke: '#000', strokeThickness: 3
        }).setOrigin(0.5).setDepth(12).setVisible(false);

        // --- 肄ㅻ낫 移댁슫??---
        this.uiElements.comboText = this.add.text(width - 20, height * 0.12, '', {
            fontSize: '24px', fontFamily: 'Arial', color: '#FF4500', stroke: '#000', strokeThickness: 4, fontStyle: 'bold'
        }).setOrigin(1, 0.5).setDepth(20).setVisible(false);

        // 罹먮┃???뚮뜑留?
        let charY = height * 0.8;
        if (this.region === 1) charY = height * 0.85; // 誘쇰Ъ (?꾨옒 ?뺤? 臾쇨?)
        else if (this.region === 2) charY = height * 0.75; // ?곗븞 (以묓븯??媛?컮??
        else if (this.region === 3) charY = height * 0.20; // 癒?諛붾떎 (諛???
        else if (this.region === 4) charY = height * 0.23; // 蹂대Ъ??(????

        const charTexture = this.getCharacterTextureKey();
        this.character = this.add.image(width / 2, charY, charTexture).setDepth(3);

        // 罹먮┃???ш린 ?숈쟻 議곗젅 (?댁쟾 128px * 1.26 = 161px)
        const targetCharSize = 160;
        const charScale = targetCharSize / this.character.width;
        this.character.setScale(charScale);
        this.character.setData('baseScale', charScale);

        this.fishingLine = this.add.graphics();
        this.fishingLine.setDepth(1);

        // 李?(Lure) ?ㅽ봽?쇱씠??- 珥덇린 ?④?
        this.lure = this.add.image(0, 0, 'lure').setVisible(false).setDepth(2);
        const targetLureSize = 24;
        this.lure.setScale(targetLureSize / this.lure.width);

        // 臾쇨퀬湲?(Fish) ?ㅽ봽?쇱씠??- 珥덇린 ?④?
        this.fish = this.add.image(0, 0, 'fish_pirami').setVisible(false).setDepth(1);

        // ???먮굦???띿뒪??(?낆쭏??
        this.uiElements.exclamation = this.add.text(0, 0, '!', {
            fontSize: '120px', fontFamily: 'Arial', color: '#FFFF00', stroke: '#FF0000', strokeThickness: 10
        }).setOrigin(0.5).setVisible(false).setDepth(5);

        // --- 罹먯뒪???ㅽ궗?? 2~3媛쒖쓽 ?ㅼ븰??怨쇰뀅 ---
        this.targetRings = []; // 怨쇰뀅?ㅼ쓣 ??ν븷 諛곗뿴
        this.repositionTargetRing();

        // ?ㅻ줈 媛湲?踰꾪듉 (?꾩튂 ?섑뼢 議곗젙: 24, 80 - 紐⑤컮???몄튂 ?뚰뵾)
        const backBtnFontSize = width < 360 ? '16px' : '20px';
        const backBtn = this.add.text(24, 80, '← 집으로', {
            fontSize: backBtnFontSize,
            fontFamily: 'Arial', color: '#FFFFFF',
            stroke: '#000000', strokeThickness: 4,
            backgroundColor: '#222222',
            padding: { x: 10, y: 6 }
        }).setDepth(30).setInteractive({ useHandCursor: true });

        backBtn.on('pointerover', () => backBtn.setBackgroundColor('#666666'));
        backBtn.on('pointerout', () => backBtn.setBackgroundColor('#444444'));

        backBtn.on('pointerdown', () => {
            window.gameManagers.soundManager.playCoin();
            this.tweens.killAll();
            this.scene.start('IntroScene');
        });

        // --- 2. ?낅젰 ?대깽???몃뱾??(?고?, ?쒕옒洹? ????? ---
        this.input.on('pointerdown', (pointer) => {
            const now = this.time.now;
            if (this.gameState === 'CATCH') {
                if (now - this.lastActionTime < 50) return;
            } else {
                if (now - this.lastActionTime < 200) return;
            }
            this.lastActionTime = now;
            this.handlePointerDown(pointer);
        });

        this.input.on('pointermove', (pointer) => {
            this.handlePointerMove(pointer);
        });

        this.input.on('pointerup', (pointer) => {
            this.handlePointerUp(pointer);
        });

        console.log("GameScene Initialized with Core Loops");
    }

    getCharacterTextureKey() {
        const rodPower = window.gameManagers.playerModel.stats.rodPower;
        return `char_lv${rodPower}`;
    }

    updateCharacterTexture() {
        if (this.character) {
            const newTexture = this.getCharacterTextureKey();
            this.character.setTexture(newTexture);

            // ?쒓컖???쇰뱶諛?(諛섏쭩?? - ?ш린媛 ?숈쟻?대?濡?蹂???ъ슜
            const baseScale = this.character.getData('baseScale') || (160 / this.character.width);
            this.character.setData('baseScale', baseScale);

            this.tweens.add({
                targets: this.character,
                scale: { from: baseScale, to: baseScale * 0.86 },
                duration: 300,
                ease: 'Bounce.easeOut'
            });

            // 鍮쏅굹???④낵 ?뚰떚??
            const particles = this.add.particles(0, 0, 'dummy', {
                x: this.character.x,
                y: this.character.y - 20,
                speed: { min: -100, max: 100 },
                angle: { min: 0, max: 360 },
                scale: { start: 1, end: 0 },
                lifespan: 800,
                blendMode: 'ADD',
                tint: 0xFFD700
            });

            // ?뚰떚???띿뒪泥?(?섏? ??
            const g = this.make.graphics({ x: 0, y: 0, add: false });
            g.fillStyle(0xffffff);
            g.fillCircle(4, 4, 4);
            g.generateTexture('charUpgradeParticle', 8, 8);
            particles.setTexture('charUpgradeParticle');

            particles.explode(20);
            this.time.delayedCall(1000, () => particles.destroy());
        }
    }

    showFloatingNotice(message, color = '#FFD700', yRatio = 0.3, fontSize = '28px') {
        const notice = this.add.text(this.scale.width / 2, this.scale.height * yRatio, message, {
            fontSize,
            fontFamily: 'Arial',
            color,
            stroke: '#000000',
            strokeThickness: 5,
            align: 'center'
        }).setOrigin(0.5).setDepth(120);

        this.tweens.add({
            targets: notice,
            y: notice.y - 50,
            alpha: 0,
            duration: 1400,
            ease: 'Power2',
            onComplete: () => notice.destroy()
        });
    }

    getBossEncounterData(playerModel) {
        const clearedBefore = !!playerModel.bossDefeated[this.region];
        const defeatedCount = playerModel.bossDefeatedCount[this.region] || 0;

        let variant = null;
        if (!clearedBefore && this.regionFishCount >= 5 && Math.random() < 0.1) {
            variant = 'first';
        } else if (clearedBefore && this.regionFishCount >= 8 && Math.random() < 0.06) {
            variant = defeatedCount >= 3 && Math.random() < 0.35 ? 'empowered' : 'returning';
        }

        if (!variant) return null;

        const regionList = FISH_TYPES.filter(f => f.region === this.region);
        const ssrFishes = regionList.filter(f => f.grade === 'SSR');
        const bossIndex = ssrFishes.length > 0 ? (defeatedCount % ssrFishes.length) : Math.max(0, regionList.length - 1);
        const fish = ssrFishes.length > 0 ? ssrFishes[bossIndex] : regionList[regionList.length - 1];

        return { variant, fish };
    }

    getBossConfig() {
        const configs = {
            first: { catchMultiplier: 2.4, timeLimit: 18, rewardMultiplier: 1.8, startRatio: 0.18 },
            returning: { catchMultiplier: 2.0, timeLimit: 18, rewardMultiplier: 1.6, startRatio: 0.22 },
            empowered: { catchMultiplier: 2.6, timeLimit: 17, rewardMultiplier: 2.1, startRatio: 0.2 }
        };

        return configs[this.bossVariant] || configs.first;
    }

    consumeTreasureIslandBuff() {
        if (!this.treasureIslandBuff) return;

        this.treasureIslandBuff.remaining = Math.max(0, (this.treasureIslandBuff.remaining || 1) - 1);
        if (this.treasureIslandBuff.remaining <= 0) {
            this.treasureIslandBuff = null;
        }
    }


    createWanderingFishes() {
        this.wanderingFishes = [];
        const numFishes = Phaser.Math.Between(4, 7);
        for (let i = 0; i < numFishes; i++) {
            const fData = getRandomFish(0, this.region);

            const x = Phaser.Math.Between(-200, this.scale.width + 200);
            const y = Phaser.Math.Between(this.scale.height * 0.4, this.scale.height * 0.9);

            const fish = this.add.image(x, y, fData.id);
            fish.setTint(0x000000); // 寃???
            fish.setAlpha(0.15); // ?ㅻ（???щ챸??
            fish.setScale(fData.scale);
            fish.setDepth(0); // 諛곌꼍 諛붾줈 ?? 李뚮낫???꾨옒

            fish.speed = Phaser.Math.Between(20, 60);
            fish.direction = (Math.random() > 0.5) ? 1 : -1;
            fish.flipX = fish.direction === 1; // 1?대㈃ ?ㅻⅨ履? -1?대㈃ ?쇱そ ?대룞

            this.wanderingFishes.push(fish);
        }
    }

    handlePointerDown(pointer) {
        if (this.gameState === 'IDLE') {
            let clickableLimitY;
            if (this.region === 1) clickableLimitY = this.scale.height * 0.3;
            else if (this.region === 2) clickableLimitY = this.scale.height * 0.3;
            else clickableLimitY = this.scale.height * 0.25;

            if (pointer.y > clickableLimitY) {
                this.startApproach(pointer.x, pointer.y);
            } else {
                this.uiElements.instruction.setText('물가 쪽을 눌러 주세요!');
                this.time.delayedCall(1500, () => {
                    if (this.gameState === 'IDLE') {
                        const regionNames = { 1: "민물", 2: "연안", 3: "먼 바다", 4: "보물섬" };
                        this.uiElements.instruction.setText(`${regionNames[this.region]}을 탭(클릭)해서 찌를 던지세요!`);
                    }
                });
            }
        }
        else if (this.gameState === 'BITE') {
            this.startCatch();
        }
        else if (this.gameState === 'CATCH') {
            this.handleCatchInput(pointer);
        }
    }

    // --- 罹먯뒪???ㅽ궗?? 怨쇰뀅 ?꾩튂 ?쒕뜡 ?щ같移?---
    repositionTargetRing() {
        const w = this.scale ? this.scale.width : 720;
        const h = this.scale ? this.scale.height : 1280;
        const targetScale = (window.gameManagers.playerModel.stats.focusRing || 1) / 3;
        const outerRadius = 90 * targetScale;

        // 湲곗〈 怨쇰뀅????젣
        if (this.targetRings) {
            this.targetRings.forEach(ringObj => {
                ringObj.outer.destroy();
                ringObj.mid.destroy();
                ringObj.inner.destroy();
                if (ringObj.highlight) ringObj.highlight.destroy();
            });
            this.tweens.killTweensOf(this.targetRings.map(r => [r.outer, r.mid, r.inner, r.highlight]).flat().filter(Boolean));
        }
        this.targetRings = [];

        const numTargets = Phaser.Math.Between(2, 3);

        for (let i = 0; i < numTargets; i++) {
            let tx = Phaser.Math.Between(Math.round(w * 0.15), Math.round(w * 0.85));
            let ty = Phaser.Math.Between(Math.round(h * 0.35), Math.round(h * 0.65));

            tx = Phaser.Math.Clamp(tx, outerRadius, w - outerRadius);
            ty = Phaser.Math.Clamp(ty, outerRadius + 100, h - outerRadius);

            const outer = this.add.circle(tx, ty, outerRadius, 0xffffff, 0)
                .setStrokeStyle(2, 0xffffff, 0.4).setDepth(4);
            const mid = this.add.circle(tx, ty, 60 * targetScale, 0xffffff, 0)
                .setStrokeStyle(2, 0x87ceeb, 0.5).setDepth(4);
            const inner = this.add.circle(tx, ty, 30 * targetScale, 0xffffff, 0)
                .setStrokeStyle(3, 0xffd700, 0.7).setDepth(4);

            this.targetRings.push({
                x: tx, y: ty,
                outer: outer, mid: mid, inner: inner
            });

            this.tweens.add({
                targets: [outer, mid, inner],
                scaleX: { from: 0.85, to: 1.15 },
                scaleY: { from: 0.85, to: 1.15 },
                alpha: { from: 0.4, to: 1 },
                yoyo: true, repeat: -1, duration: 900, ease: 'Sine.easeInOut'
            });
        }
    }

    // --- Phase 1: 李??섏?湲?(Approach) + ?ㅽ궗???먯젙 ---
    startApproach(targetX, targetY) {
        this.gameState = 'APPROACH';
        this.regionFishCount++;

        // --- 罹먯뒪???ㅽ궗???먯젙 (媛??媛源뚯슫 怨쇰뀅 李얘린) ---
        const targetScale = (window.gameManagers.playerModel.stats.focusRing || 1) / 3;
        let closestRing = null;
        let minDist = Infinity;

        this.targetRings.forEach(ring => {
            const d = Phaser.Math.Distance.Between(targetX, targetY, ring.x, ring.y);
            if (d < minDist) {
                minDist = d;
                closestRing = ring;
            }
        });

        // 寃곌낵 諛곗쑉 ?쒓굅??
        this.castingMultiplier = 1;

        if (closestRing && minDist <= 30 * targetScale) {
            this.castingBonus = 3; // ?꾨꼍
            this.uiElements.instruction.setText('완벽한 캐스팅!');
            this.cameras.main.flash(200, 255, 215, 0);
        } else if (closestRing && minDist <= 60 * targetScale) {
            this.castingBonus = 2; // 醫뗭쓬
            this.uiElements.instruction.setText('좋은 캐스팅!');
        } else if (closestRing && minDist <= 90 * targetScale) {
            this.castingBonus = 1; // 蹂댄넻
            this.uiElements.instruction.setText('기다리는 중...');
        } else {
            this.castingBonus = 0; // 鍮쀫굹媛?
            this.castingMultiplier = 1; // 鍮쀫굹媛硫?諛곗쑉 ?놁쓬
            this.uiElements.instruction.setText('조금 빗나갔어... 작은 물고기가 올지도 몰라!');
        }

        // 怨쇰뀅 ?④린湲?
        this.targetRings.forEach(ring => {
            ring.outer.setVisible(false);
            ring.mid.setVisible(false);
            ring.inner.setVisible(false);
        });

        this.lure.setPosition(this.character.x, this.character.y - 10);
        this.lure.setVisible(true);

        window.gameManagers.soundManager.playDrop();

        this.tweens.add({
            targets: this.lure,
            x: targetX,
            y: targetY,
            duration: 800,
            ease: 'Quad.easeOut',
            onComplete: () => {
                this.waitForBite(targetX, targetY);
            }
        });
    }

    // Phase 1 -> 2 ?湲?
    waitForBite(lureX, lureY) {
        const chanceLevel = window.gameManagers.playerModel.stats.catchChance;
        const baseMaxWait = this.region === 4 ? 5000 : 4000;
        let maxWait = Math.max(1000, baseMaxWait - (chanceLevel * 200));

        // 罹먯뒪??蹂대꼫?? ?낆쭏 ?湲곗떆媛??⑥텞
        if (this.castingBonus === 3) maxWait = Math.max(800, maxWait * 0.5);
        else if (this.castingBonus === 2) maxWait = Math.max(900, maxWait * 0.75);

        const waitTime = Phaser.Math.Between(800, maxWait);

        const pm = window.gameManagers.playerModel;
        const bossEncounter = this.getBossEncounterData(pm);

        if (bossEncounter) {
            this.isBossFight = true;
            this.bossVariant = bossEncounter.variant;
            this.currentFish = bossEncounter.fish;
            this.regionFishCount = 0;

            const bossLabel = this.bossVariant === 'empowered'
                ? '강화 보스 출현! 조심!'
                : (this.bossVariant === 'returning' ? '재등장 보스다! 집중!' : '보스 출현! 조심!');

            this.uiElements.instruction.setText(`${bossLabel}\n더 빠르게 릴을 감아!`);

            this.cameras.main.shake(1500, 0.02);
            this.cameras.main.flash(500, 255, 0, 0);
            window.gameManagers.soundManager.playError();
        } else {
            this.isBossFight = false;
            this.bossVariant = 'normal';

            const rodLuckLevel = pm.stats.rodLuck;
            const comboCount = pm.comboCount || 0;
            let rareFishBoost = 1;

            if (this.treasureIslandBuff && this.treasureIslandBuff.type === 'ssrBoost' && this.treasureIslandBuff.remaining > 0) {
                rareFishBoost = 3;
                this.consumeTreasureIslandBuff();
                this.showFloatingNotice('보물섬 버프 발동! 희귀 물고기 확률이 크게 올랐어!', '#8be9fd');
            }

            this.currentFish = getRandomFish(rodLuckLevel, this.region, this.castingBonus, comboCount, rareFishBoost);
        }

        // --- 10% ?뺣쪧濡?蹂댁뒪(留덉솗) 異쒗쁽 (吏??떦 5???싳떆 ?댄썑 + ?꾩쭅 ???≪븯???? ---
        if (false) {
            this.isBossFight = true;
            const regionList = FISH_TYPES.filter(f => f.region === this.region);
            const ssrFishes = regionList.filter(f => f.grade === 'SSR');
            this.currentFish = ssrFishes.length > 0 ? ssrFishes[0] : regionList[regionList.length - 1];
            this.uiElements.instruction.setText('?슚 留덉솗 異쒗쁽 寃쎄퀬! ?슚\n?쒓컙 ?댁뿉 ?≪븘??!');
            this.cameras.main.shake(1500, 0.02);
            this.cameras.main.flash(500, 255, 0, 0);
            window.gameManagers.soundManager.playError(); // ??吏꾩엯 寃쎄퀬??
        } else if (!this.currentFish) {
            this.isBossFight = false;
            // 臾쇨퀬湲?醫낅쪟 寃곗젙 (罹먯뒪??蹂대꼫??+ 肄ㅻ낫 ?곸슜)
            const rodLuckLevel = pm.stats.rodLuck;
            const comboCount = pm.comboCount || 0;
            this.currentFish = getRandomFish(rodLuckLevel, this.region, this.castingBonus, comboCount);
        }

        // --- 3~5留덈━ 臾쇨퀬湲??묎렐 ?곗텧 ---
        this.approachFishes = [];
        const numFishes = Phaser.Math.Between(3, 5);
        const biterIndex = Phaser.Math.Between(0, numFishes - 1);

        for (let i = 0; i < numFishes; i++) {
            const isBiter = (i === biterIndex);

            // 臾쇨퀬湲?醫낅쪟: 臾대뒗 ?덉? currentFish, ?섎㉧吏???쒕뜡
            const fData = isBiter ? this.currentFish : getRandomFish(0, this.region);

            // ?щ갑?먯꽌 ?깆옣?섎룄濡??쒕뜡 ?쒖옉 ?꾩튂
            const side = Phaser.Math.Between(0, 3);
            let startX, startY;
            if (side === 0) { startX = lureX + Phaser.Math.Between(150, 300); startY = lureY + Phaser.Math.Between(-80, 80); }
            else if (side === 1) { startX = lureX - Phaser.Math.Between(150, 300); startY = lureY + Phaser.Math.Between(-80, 80); }
            else if (side === 2) { startX = lureX + Phaser.Math.Between(-100, 100); startY = lureY + Phaser.Math.Between(100, 200); }
            else { startX = lureX + Phaser.Math.Between(-100, 100); startY = lureY - Phaser.Math.Between(100, 200); }

            const fishSprite = this.add.image(startX, startY, fData.id);
            fishSprite.setScale(fData.scale * 1.2);
            fishSprite.setDepth(1);
            fishSprite.setAlpha(0.8);
            fishSprite.flipX = (startX > lureX); // 李뚮? 諛붾씪蹂대룄濡?

            if (isBiter) {
                // === 臾대뒗 臾쇨퀬湲? 李뚭퉴吏 吏곹뻾 ===
                this.tweens.add({
                    targets: fishSprite,
                    x: lureX,
                    y: lureY + 10,
                    duration: waitTime,
                    ease: 'Sine.easeInOut',
                    onComplete: () => {
                        this.startBite(lureX, lureY);
                    }
                });
                // 硫붿씤 fish ?ㅽ봽?쇱씠?몄뿉??諛섏쁺 (?낆쭏 ?곗텧??
                this.fish.setTexture(this.currentFish.id);
                this.fish.setScale(this.currentFish.scale * 1.5);
                console.log(`[DEBUG FISH] ${this.currentFish.id} | FishData scale: ${this.currentFish.scale} | applied: ${this.currentFish.scale * 1.5} | sprite displayW: ${this.fish.displayWidth}, displayH: ${this.fish.displayHeight}`);
                this.fish.clearTint();
                this.fish.setVisible(false); // ?묎렐 以묒뿉??approachFish媛 蹂댁씠誘濡??④?
            } else {
                // === ??臾대뒗 臾쇨퀬湲? ?ㅼ뼇???됰룞 ===
                const behavior = Phaser.Math.Between(0, 2);

                if (behavior === 0) {
                    // (A) 嫄곗쓽 臾?六뷀븯?????뚯븘媛?
                    const nearX = lureX + Phaser.Math.Between(-30, 30);
                    const nearY = lureY + Phaser.Math.Between(-20, 30);
                    const approachTime = Phaser.Math.Between(800, waitTime * 0.7);
                    this.tweens.add({
                        targets: fishSprite,
                        x: nearX, y: nearY,
                        duration: approachTime,
                        ease: 'Sine.easeInOut',
                        onComplete: () => {
                            // ???뚯븘媛?
                            fishSprite.flipX = !fishSprite.flipX;
                            this.tweens.add({
                                targets: fishSprite,
                                x: startX + Phaser.Math.Between(-100, 100),
                                y: startY,
                                alpha: 0,
                                duration: 1000,
                                ease: 'Quad.easeIn',
                                onComplete: () => fishSprite.destroy()
                            });
                        }
                    });
                } else if (behavior === 1) {
                    // (B) 愿???놁씠 ?먮┸?먮┸ 吏?섍컧
                    const passX = startX > lureX ? lureX - 200 : lureX + 200;
                    this.tweens.add({
                        targets: fishSprite,
                        x: passX,
                        y: startY + Phaser.Math.Between(-30, 30),
                        duration: Phaser.Math.Between(2000, 3500),
                        ease: 'Linear',
                        onComplete: () => fishSprite.destroy()
                    });
                } else {
                    // (C) 鍮숆?鍮숆? 二쇱쐞瑜?留대룎???좊궓
                    const orbitRadius = Phaser.Math.Between(60, 120);
                    const orbitDuration = Phaser.Math.Between(1500, 2500);
                    this.tweens.add({
                        targets: fishSprite,
                        x: lureX + orbitRadius * 0.7,
                        y: lureY - orbitRadius * 0.3,
                        duration: orbitDuration * 0.3,
                        ease: 'Sine.easeInOut',
                        onComplete: () => {
                            fishSprite.flipX = !fishSprite.flipX;
                            this.tweens.add({
                                targets: fishSprite,
                                x: lureX - orbitRadius,
                                y: lureY + orbitRadius * 0.5,
                                duration: orbitDuration * 0.4,
                                ease: 'Sine.easeInOut',
                                onComplete: () => {
                                    this.tweens.add({
                                        targets: fishSprite,
                                        x: startX, y: startY + 150,
                                        alpha: 0,
                                        duration: orbitDuration * 0.3,
                                        onComplete: () => fishSprite.destroy()
                                    });
                                }
                            });
                        }
                    });
                }
            }
            this.approachFishes.push(fishSprite);
        }
    }

    // ?묎렐 臾쇨퀬湲??꾨? ?쒓굅
    clearApproachFishes() {
        if (this.approachFishes) {
            this.approachFishes.forEach(f => {
                if (f && f.active) {
                    this.tweens.killTweensOf(f);
                    f.destroy();
                }
            });
            this.approachFishes = [];
        }
    }

    // --- Phase 2: ?낆쭏 (Bite) ---
    startBite(x, y) {
        this.gameState = 'BITE';
        this.uiElements.instruction.setText('지금 바로 눌러!!!');

        // ?먮굦?쒕? ?붾㈃ 以묒븰???ш쾶 ?쒖떆 (利됯컖???쇰뱶諛?
        this.uiElements.exclamation.setPosition(this.scale.width / 2, this.scale.height / 2 - 50);
        this.uiElements.exclamation.setVisible(true);
        this.uiElements.exclamation.setRotation(0);

        window.gameManagers.soundManager.playBite();

        // ?먮굦???좊땲硫붿씠?? ?ㅼ????꾩뒪 + 嫄곗튇 ?뚯쟾 吏꾨룞
        this.tweens.add({
            targets: this.uiElements.exclamation,
            scale: { from: 0.8, to: 2.0 },
            yoyo: true,
            repeat: -1,
            duration: 150
        });
        this.tweens.add({
            targets: this.uiElements.exclamation,
            rotation: { from: -0.15, to: 0.15 },
            yoyo: true,
            repeat: -1,
            duration: 60,
            ease: 'Sine.easeInOut'
        });

        // ?붾㈃ 踰덉찉 (鍮④컙鍮쏆쑝濡??꾧툒???꾨떖)
        this.cameras.main.flash(200, 255, 50, 50, true);

        // 李??붾룞移섍쾶
        this.tweens.add({
            targets: this.lure,
            x: x + 10,
            yoyo: true,
            repeat: -1,
            duration: 50
        });

        // ?쇱젙 ?쒓컙 ?댁뿉 ?대┃ ???섎㈃ ?ㅽ뙣 (蹂대Ъ?ъ? 1.2珥덈줈 ?⑥텞)
        const biteTimeout = this.region === 4 ? 1200 : 1500;
        this.time.delayedCall(biteTimeout, () => {
            if (this.gameState === 'BITE') {
                this.failFishing('물고기가 도망가 버렸어...');
            }
        });
    }

    activateFeverTime() {
        this.isFeverTime = true;
        this.catchMax = Math.max(10, this.catchMax * 0.5); // ?↔린 ???쎄쾶 (泥대젰 ?덈컲)
        this.cameras.main.setBackgroundColor('#4a0000'); // 諛곌꼍 ?쎄컙 遺됱? ?쇰쾭 ?곗텧

        // ?쇰쾭????뚮┝ ?띿뒪???④낵
        const feverText = this.add.text(this.scale.width / 2, this.scale.height * 0.3, 'FEVER TIME! 낚시가 훨씬 쉬워졌어!', {
            fontSize: '36px', fontFamily: 'Arial', color: '#FF4500', stroke: '#FFFFFF', strokeThickness: 4
        }).setOrigin(0.5).setDepth(100);

        this.tweens.add({
            targets: feverText,
            scale: { from: 1.5, to: 1 },
            duration: 500,
            yoyo: true,
            hold: 1500,
            onComplete: () => feverText.destroy()
        });
    }

    endFeverTime() {
        this.isFeverTime = false;
        this.consecutiveFails = 0;
        this.cameras.main.setBackgroundColor('#2c3e50'); // ?먮옒 諛곌꼍?쇰줈 蹂듦뎄
    }

    // --- Phase 3: ?↔린 (Catch) - 3醫?誘몃땲寃뚯엫 ?쒕뜡 ---
    startCatch() {
        this.gameState = 'CATCH';
        this.lineTension = 0;
        this.catchGraceTimer = 300; // 0.3珥?寃뚯씠吏 ?섎씫 臾댁쟻 ?쒓컙

        this.catchMax = this.currentFish.catchMax || 100;
        this.catchGauge = this.catchMax * 0.15;

        if (this.isBossFight) {
            this.catchMax *= 3; // 蹂댁뒪 catchMax 횞3
            this.bossTimeLimit = 15; // 15珥??쒗븳
            this.bossTimer = 0;
            const pm = window.gameManagers.playerModel;
            if (pm.bossFailed[this.region]) {
                // ?댁쟾 ?ㅽ뙣 蹂대꼫??(?뚰듃/?숈뒿 ?④낵)
                this.catchGauge = this.catchMax * 0.3; // 30%?먯꽌 ?쒖옉
            }
            // 蹂댁뒪 ??대㉧ UI 珥덇린??諛??④? (update?먯꽌 ?ㅼ떆 ?쒖떆)
            if (this.uiElements.bossTimerText) this.uiElements.bossTimerText.setVisible(false);
        }

        // --- Fever Time ?곸슜 泥댄겕 ---
        if (this.isBossFight) {
            const bossConfig = this.getBossConfig();
            this.catchMax = (this.currentFish.catchMax || 100) * bossConfig.catchMultiplier;
            this.bossTimeLimit = bossConfig.timeLimit;
            this.bossTimer = 0;
            this.catchGauge = this.catchMax * bossConfig.startRatio;

            const pm = window.gameManagers.playerModel;
            if (pm.bossFailed[this.region]) {
                this.catchGauge = Math.max(this.catchGauge, this.catchMax * 0.35);
            }
        }

        this.activeCatchBuff = null;
        if (this.treasureIslandBuff && this.treasureIslandBuff.type === 'gaugeImmunity' && this.treasureIslandBuff.remaining > 0) {
            this.activeCatchBuff = { ...this.treasureIslandBuff };
            this.consumeTreasureIslandBuff();
            this.showFloatingNotice('보물섬 버프 발동! 잠시 동안 게이지가 줄지 않아!', '#7fdcff');
        }

        if (this.consecutiveFails >= 3) {
            this.activateFeverTime();
        }

        // --- 誘몃땲寃뚯엫 ?꾩떆 以묐떒, ?고?濡??⑥씪??---
        this.miniGameType = 'mash';

        if (this.miniGameType === 'timing') {
            this.uiElements.instruction.setText('珥덈줉 援ш컙?먯꽌 ??븯?몄슂!');
            this.timingHits = 0;
            this.timingRequired = Phaser.Math.Between(3, 5);
            const gw = this.gaugeWidth || 400;
            // 珥덈줉 援ш컙 ?꾩튂 (30~70% ?ъ씠 ?쒕뜡, ??20%)
            this.timingGreenStart = Phaser.Math.FloatBetween(0.3, 0.6);
            this.timingGreenEnd = this.timingGreenStart + 0.15;
            this.timingBarX = 0;
            this.timingBarDir = 1;
        } else if (this.miniGameType === 'draw') {
            this.uiElements.instruction.setText('?섑??섎뒗 紐⑥뼇???곕씪 洹몃━?몄슂!');
            this.drawUserPath = [];
            this.isDrawing = false;
            this.generateDrawPath();

        } else {
            this.uiElements.instruction.setText('화면을 마구 눌러 주세요!!');
        }

        // 湲곗〈 ?댄럺???뺣━
        this.tweens.killTweensOf(this.uiElements.exclamation);
        this.tweens.killTweensOf(this.lure);
        this.uiElements.exclamation.setVisible(false);
        this.clearApproachFishes();
        // CATCH ?④퀎 珥덇린??
        this.clearApproachFishes();
        this.lure.setVisible(true);
        this.fish.setVisible(false);

        // 洹몃━湲?誘몃땲寃뚯엫 洹몃옒??以鍮?
        if (!this.drawGraphics) {
            this.drawGraphics = this.add.graphics().setDepth(15);
        }
        if (!this.drawUserGraphics) {
            this.drawUserGraphics = this.add.graphics().setDepth(16);
        }
        this.drawGraphics.clear();
        this.drawUserGraphics.clear();

        if (this.miniGameType === 'draw' && this.drawPath) {
            this.drawGraphics.lineStyle(6, 0xaaaaaa, 0.5);
            this.drawGraphics.beginPath();
            this.drawGraphics.moveTo(this.drawPath[0].x, this.drawPath[0].y);
            for (let i = 1; i < this.drawPath.length; i++) {
                this.drawGraphics.lineTo(this.drawPath[i].x, this.drawPath[i].y);
            }
            this.drawGraphics.strokePath();

            // ?먯꽑 ?뚰듃???뚰떚???먮뒗 留덉빱
            this.drawGraphics.fillStyle(0xffff00, 1);
            this.drawGraphics.fillCircle(this.drawPath[0].x, this.drawPath[0].y, 8);
        }

        // 寃뚯씠吏 UI ?쒖떆
        this.uiElements.gaugeBg.setVisible(true);
        this.uiElements.gaugeBar.setVisible(true);
        // ?먯뀡 UI ?곗꽑 以묐떒???곕Ⅸ ?④? 泥섎━
        if (false) { // 湲곗〈 ?먯뀡 ?쒖떆 ?곸뿭? 臾댁떆
            this.uiElements.tensionBg.setVisible(true);
            this.uiElements.tensionBar.setVisible(true);
            this.uiElements.tensionWarn.setVisible(true);
        }
        this.updateGaugeUI();

        this.cameras.main.zoomTo(1.1, 300);
    }

    // ?곕씪 洹몃━湲?寃쎈줈 ?앹꽦
    generateDrawPath() {
        this.drawPath = [];
        const cx = this.scale.width / 2;
        const cy = this.scale.height * 0.5;
        const type = Math.random() > 0.5 ? 'circle' : 'line';
        if (type === 'circle') {
            const r = 60;
            for (let i = 0; i <= 20; i++) {
                const angle = (i / 20) * Math.PI * 2;
                this.drawPath.push({ x: cx + Math.cos(angle) * r, y: cy + Math.sin(angle) * r });
            }
        } else {
            // 吏곸꽑 (醫?>???먮뒗 ?媛곸꽑)
            const startX = cx - 80;
            const endX = cx + 80;
            const startY = cy - 30;
            const endY = cy + 30;
            for (let i = 0; i <= 10; i++) {
                const t = i / 10;
                this.drawPath.push({ x: startX + (endX - startX) * t, y: startY + (endY - startY) * t, });
            }
        }
    }

    // --- CATCH ?곹깭 ?낅젰 ?몃뱾??(誘몃땲寃뚯엫蹂?遺꾧린) ---
    handleCatchInput(pointer) {
        if (this.miniGameType === 'timing') {
            this.handleTimingTap();
        } else if (this.miniGameType === 'draw') {
            this.isDrawing = true;
            this.drawUserPath = [{ x: pointer.x, y: pointer.y }];
            this.drawUserGraphics.clear();
            this.drawUserGraphics.lineStyle(8, 0x00ff00, 1);
            this.drawUserGraphics.beginPath();
            this.drawUserGraphics.moveTo(pointer.x, pointer.y);

        } else {
            this.mashButton();
        }
    }

    handlePointerMove(pointer) {
        if (this.gameState === 'CATCH' && this.miniGameType === 'draw' && this.isDrawing) {
            this.drawUserPath.push({ x: pointer.x, y: pointer.y });
            this.drawUserGraphics.lineTo(pointer.x, pointer.y);
            this.drawUserGraphics.strokePath();
        }
    }

    handlePointerUp(pointer) {
        if (this.gameState === 'CATCH') {

            this.isDrawing = false;
            this.evaluateDraw();
        }
    }

    evaluateDraw() {
        if (!this.drawPath || this.drawPath.length === 0 || !this.drawUserPath || this.drawUserPath.length < 5) {
            this.catchGauge -= this.catchMax * 0.1;
            window.gameManagers.soundManager.playError();
            this.cameras.main.shake(100, 0.01);
            this.generateDrawPath(); // ?ㅼ떆 洹몃━湲?
            this.startCatchGraphicsForDraw();
            return;
        }

        // ?⑥닚 留ㅼ묶 ?됯?: ?ъ슜?먯쓽 ??湲몄씠? ?쒖옉/?앹젏??媛?대뱶???쇰쭏???쇱튂?섎뒗吏
        let score = 0;
        const targetStart = this.drawPath[0];
        const targetEnd = this.drawPath[this.drawPath.length - 1];

        const userStart = this.drawUserPath[0];
        const userEnd = this.drawUserPath[this.drawUserPath.length - 1];

        const startDist = Phaser.Math.Distance.Between(targetStart.x, targetStart.y, userStart.x, userStart.y);
        const endDist1 = Phaser.Math.Distance.Between(targetEnd.x, targetEnd.y, userEnd.x, userEnd.y);
        const endDist2 = Phaser.Math.Distance.Between(targetStart.x, targetStart.y, userEnd.x, userEnd.y); // 諛섎?濡?洹몃졇??寃쎌슦

        // ?덉슜 諛섍꼍 ?댁뿉 ?덈굹
        if (startDist < 60 && Math.min(endDist1, endDist2) < 60) {
            score = 100;
        }

        if (score > 50) {
            // ?깃났
            const progress = this.catchMax / 3; // 3踰?洹몃━硫??깃났?섎룄濡?
            this.catchGauge += progress;
            window.gameManagers.soundManager.playSuccess();
            this.cameras.main.flash(100, 0, 255, 0);
        } else {
            // ?ㅽ뙣
            this.catchGauge -= this.catchMax * 0.08;
            window.gameManagers.soundManager.playError();
            this.cameras.main.shake(100, 0.01);
        }

        this.updateGaugeUI();
        if (this.catchGauge >= this.catchMax) {
            this.successFishing();
            if (this.drawGraphics) this.drawGraphics.clear();
            if (this.drawUserGraphics) this.drawUserGraphics.clear();
        } else if (this.catchGauge <= 0) {
            this.catchGauge = 0;
            this.failFishing('모양이 조금 달랐어...');
            if (this.drawGraphics) this.drawGraphics.clear();
            if (this.drawUserGraphics) this.drawUserGraphics.clear();
        } else {
            // ?ㅼ쓬 臾몄젣
            this.generateDrawPath();
            this.startCatchGraphicsForDraw();
        }
    }

    startCatchGraphicsForDraw() {
        this.drawGraphics.clear();
        this.drawUserGraphics.clear();
        if (this.drawPath) {
            this.drawGraphics.lineStyle(6, 0xaaaaaa, 0.5);
            this.drawGraphics.beginPath();
            this.drawGraphics.moveTo(this.drawPath[0].x, this.drawPath[0].y);
            for (let i = 1; i < this.drawPath.length; i++) {
                this.drawGraphics.lineTo(this.drawPath[i].x, this.drawPath[i].y);
            }
            this.drawGraphics.strokePath();
            this.drawGraphics.fillStyle(0xffff00, 1);
            this.drawGraphics.fillCircle(this.drawPath[0].x, this.drawPath[0].y, 8);
        }
    }

    // ??대컢 ??誘몃땲寃뚯엫 泥섎━
    handleTimingTap() {
        const pos = this.timingBarX; // 0~1 踰붿쐞
        const inGreen = pos >= this.timingGreenStart && pos <= this.timingGreenEnd;

        if (inGreen) {
            this.timingHits++;
            const progress = this.catchMax / this.timingRequired;
            this.catchGauge += progress;
            this.cameras.main.flash(100, 0, 255, 0);
            window.gameManagers.soundManager.playSuccess();

            // ??珥덈줉 援ш컙 ?쒕뜡 ?щ같移?
            this.timingGreenStart = Phaser.Math.FloatBetween(0.2, 0.65);
            this.timingGreenEnd = this.timingGreenStart + 0.15;
        } else {
            this.catchGauge -= this.catchMax * 0.08;
            this.cameras.main.shake(100, 0.01);
            window.gameManagers.soundManager.playError();
        }

        this.updateGaugeUI();
        if (this.catchGauge >= this.catchMax) this.successFishing();
        else if (this.catchGauge <= 0) { this.catchGauge = 0; this.failFishing('타이밍을 놓쳤어...'); }
    }

    mashButton() {
        const powerLevel = window.gameManagers.playerModel.stats.rodPower;
        const reelLevel = window.gameManagers.playerModel.stats.reelSpeed;
        const fishDifficulty = this.currentFish.difficulty || 1.0;

        const progress = Math.max(5, (powerLevel * reelLevel) / fishDifficulty);
        this.catchGauge += progress;

        // --- 以??먯뀡 利앷? ?꾩떆 以묐떒 ---
        // this.lineTension = Phaser.Math.Clamp(this.lineTension + 0.12, 0, 1);

        // --- 以??딄? ?먯젙 ?꾩떆 以묐떒 ---
        // const safeLimit = this.getTensionSafeLimit();
        // if (this.lineTension >= 0.95) {
        //     // 以??딄?!
        //     this.cameras.main.shake(300, 0.03);
        //     this.failFishing('?? 以꾩씠 ?딆뼱議뚯뼱?? ?덈Т ?멸쾶 ?밴꼈?섎킄??..');
        //     return;
        // } else if (this.lineTension >= safeLimit) {
        //     this.uiElements.tensionWarn.setText('?좑툘 ?덈Т ?멸쾶! 以꾩씠 ?딆뼱吏?寃?媛숈븘!');
        //     this.uiElements.tensionWarn.setVisible(true);
        // } else {
        //     this.uiElements.tensionWarn.setText('');
        // }

        this.cameras.main.shake(100, 0.005);
        window.gameManagers.soundManager.playTapping();

        this.updateGaugeUI();

        if (this.catchGauge >= this.catchMax) {
            this.successFishing();
        }
    }

    // ?댁쥌蹂??먯뀡 ?덉쟾 ?쒓퀎
    getTensionSafeLimit() {
        const grade = this.currentFish ? this.currentFish.grade : 'N';
        if (grade === 'SSR') return 0.75;
        if (grade === 'SR') return 0.80;
        if (grade === 'R') return 0.85;
        return 0.90; // N
    }

    updateGaugeUI() {
        const gaugeWidth = this.gaugeWidth || 400;
        const widthPercent = Phaser.Math.Clamp(this.catchGauge / this.catchMax, 0, 1);
        this.uiElements.gaugeBar.width = gaugeWidth * widthPercent;

        if (widthPercent < 0.5) this.uiElements.gaugeBar.fillColor = 0xFFA500;
        else this.uiElements.gaugeBar.fillColor = 0x00FF00;

        // ?먯뀡 諛??낅뜲?댄듃
        if (this.uiElements.tensionBar && this.uiElements.tensionBar.visible) {
            this.uiElements.tensionBar.width = gaugeWidth * this.lineTension;
            const safeLimit = this.getTensionSafeLimit();
            if (this.lineTension >= safeLimit) this.uiElements.tensionBar.fillColor = 0xff0000;
            else if (this.lineTension >= safeLimit * 0.7) this.uiElements.tensionBar.fillColor = 0xff8800;
            else this.uiElements.tensionBar.fillColor = 0xffcc00;
        }
    }

    successFishing() {
        this.gameState = 'REWARD';
        this.cameras.main.zoomTo(1, 300);
        this.uiElements.gaugeBg.setVisible(false);
        this.uiElements.gaugeBar.setVisible(false);
        this.uiElements.tensionBg.setVisible(false);
        this.uiElements.tensionBar.setVisible(false);
        this.uiElements.tensionWarn.setVisible(false);
        this.lure.setVisible(false);
        this.lineTension = 0;
        this.activeCatchBuff = null;


        // 蹂댁뒪 ??대㉧ ?④?
        if (this.uiElements.bossTimerText) this.uiElements.bossTimerText.setVisible(false);

        // ?쇰쾭 ????댁젣
        if (this.isFeverTime) this.endFeverTime();

        // ?곗냽 ?ㅽ뙣 珥덇린??+ 肄ㅻ낫 利앷?
        this.consecutiveFails = 0;
        window.gameManagers.playerModel.comboCount = (window.gameManagers.playerModel.comboCount || 0) + 1;
        const combo = window.gameManagers.playerModel.comboCount;

        // 蹂댁뒪???밸━ 泥섎━
        const pm = window.gameManagers.playerModel;
        let isBossCatch = false;
        let bossRewardMultiplier = 1;
        if (this.isBossFight) {
            pm.bossDefeated[this.region] = true;
            pm.bossDefeatedCount[this.region] = (pm.bossDefeatedCount[this.region] || 0) + 1;
            pm.notify();
            isBossCatch = true;
            bossRewardMultiplier = this.getBossConfig().rewardMultiplier;
            this.isBossFight = false;
            this.bossVariant = 'normal';
        }

        // 肄ㅻ낫 UI ?쒖떆
        if (combo >= 2) {
            this.uiElements.comboText.setText(`?뵦 肄ㅻ낫 x${combo}!`);
            this.uiElements.comboText.setVisible(true);
            this.tweens.add({
                targets: this.uiElements.comboText,
                scale: { from: 1.5, to: 1 },
                duration: 300,
                ease: 'Back.easeOut'
            });
        }

        // ?붾젮???쇰뱶諛?(?붾㈃ ?붾뱾由??ш쾶 + ?띿뒪??
        this.cameras.main.shake(300, 0.02);
        this.cameras.main.flash(500, 255, 255, 255);
        window.gameManagers.soundManager.playSuccess();

        // 留덉씪?ㅽ넠 吏꾨룞 (紐⑤컮??吏?먯떆)
        if (navigator.vibrate) {
            navigator.vibrate([200, 100, 200]);
        }

        this.uiElements.instruction.setText(`${this.currentFish.name}를 잡았어!`);

        // ?꾩떆 ?뚰떚????＝ (?ㅽ섏뼱 紐⑥뼇)
        const particles = this.add.particles(0, 0, 'dummy', {
            x: this.scale.width / 2,
            y: this.scale.height / 2,
            speed: { min: -400, max: 400 },
            angle: { min: 0, max: 360 },
            scale: { start: 2 * this.currentFish.scale, end: 0 },
            lifespan: 1000,
            blendMode: 'ADD',
            tint: [this.currentFish.color, 0xffffff]
        });

        // ??＝ ?뚰떚???띿뒪泥?(?섏? ??紐⑥뼇)
        const g = this.make.graphics({ x: 0, y: 0, add: false });
        g.fillStyle(0xffffff);
        g.fillCircle(8, 8, 8);
        g.generateTexture('particleTexture', 16, 16);
        particles.setTexture('particleTexture');

        particles.explode(50); // ??踰??곕쑉由?

        // 臾쇨퀬湲?醫낅쪟???곕Ⅸ 湲곕낯 蹂댁긽
        const baseGold = this.currentFish.baseReward;

        let milestoneStoryData = null; // 留덉씪?ㅽ넠 ?ъ꽦 ???ъ깮???ㅽ넗由??곗씠??

        // ?꾧컧(PlayerModel)??異붽? 諛?留덉씪?ㅽ넠(10, 20, 50留덈━) 泥댄겕 (?밸퀎 ?꾩씠?쒖? ?쒖쇅)
        if (!this.currentFish.isSpecialItem) {
            window.gameManagers.playerModel.addFish(this.currentFish.id);

            const count = window.gameManagers.playerModel.fishCollection[this.currentFish.id];
            const fishId = this.currentFish.id;
            const fishName = this.currentFish.name;
            const model = window.gameManagers.playerModel;

            if (!model.fishMilestonesSeen[fishId]) {
                model.fishMilestonesSeen[fishId] = {};
            }

            let title = '';
            if (count === 10 && !model.fishMilestonesSeen[fishId][10]) {
                const titles10 = ['새싹 낚시꾼', '물고기 친구', '강태공 입문', '첫 수집왕', '낚시 천재'];
                title = titles10[Math.floor(Math.random() * titles10.length)];
                model.fishMilestonesSeen[fishId][10] = true;
            } else if (count === 20 && !model.fishMilestonesSeen[fishId][20]) {
                const titles20 = ['베테랑 낚시꾼', '바다 탐험가', '수집 고수', '릴 감기 달인', '챔피언'];
                title = titles20[Math.floor(Math.random() * titles20.length)];
                model.fishMilestonesSeen[fishId][20] = true;
            } else if (count === 50 && !model.fishMilestonesSeen[fishId][50]) {
                const titles50 = ['전설의 낚시왕', '바다의 수호자', '수집 마스터', '황금 손', '진짜 강태공'];
                title = titles50[Math.floor(Math.random() * titles50.length)];
                model.fishMilestonesSeen[fishId][50] = true;
            }

            if (title !== '') {
                model.notify(); // ???
                if (count === 10) {
                    milestoneStoryData = [
                        { speaker: '상점 할아버지', portrait: 'char_shopkeeper', text: `허허! ${fishName}를 벌써 ${count}마리나 잡았구나!\n이제부터 넌 [ ${fishName} ${title} ] 이다!` },
                        { speaker: '정우', portrait: 'char_jeongwoo', text: `감사합니다! 저는 이제 ${fishName} ${title}예요!` }
                    ];
                } else if (count === 20) {
                    milestoneStoryData = [
                        { speaker: '아빠', portrait: 'char_dad', text: `정우가 잡은 ${fishName} 이야기가 동네에 퍼졌단다!\n이제 [ ${fishName} ${title} ] 라고 불러도 되겠어!` },
                        { speaker: '정우', portrait: 'char_jeongwoo', text: `우와! 진짜 유명해진 것 같아!` }
                    ];
                } else if (count === 50) {
                    milestoneStoryData = [
                        { speaker: '세연', portrait: 'char_seyeon', text: `오빠! 이제 모두가 오빠를 [ ${fishName} ${title} ] 라고 불러!` },
                        { speaker: '정우', portrait: 'char_jeongwoo', text: `좋아! 이제 바다의 ${fishName}는 내가 다 모을 거야!` }
                    ];
                }
            } else if (count === 1 && FIRST_CATCH_STORIES[fishId]) {
                // 泥??띾뱷 ???
                milestoneStoryData = FIRST_CATCH_STORIES[fishId];
            }

            // 蹂댁뒪 議곗슦 ??ш? 理쒖슦???곸슜 (留덉솗 1~3?뚯감)
            if (isBossCatch) {
                const bCount = pm.bossDefeatedCount[this.region];
                // 1?? 2?? 3?뚯감 ???以??뚮쭪? 寃??좏깮. 3???댄썑??3?뚯감 諛섎났 ?먮뒗 ?ㅽ궢
                if (BOSS_STORIES[this.region] && bCount <= 3) {
                    const storyIndex = Math.min(bCount - 1, 2);
                    milestoneStoryData = BOSS_STORIES[this.region][storyIndex];
                }
            }
        }

        // 2珥?????＝ ?뚰떚???쒓굅 諛??댁쫰 ?곕룞
        this.time.delayedCall(2000, async () => {
            particles.destroy();

            let finalGold = baseGold;
            if (isBossCatch) {
                finalGold = Math.floor(finalGold * bossRewardMultiplier);
                this.showFloatingNotice(`보스 보상 x${bossRewardMultiplier.toFixed(1)}!`, '#ffb74d');
            }

            if (this.currentFish.isSpecialItem) {
                // ?밸퀎 ?꾩씠?쒖? ?댁쫰瑜?吏꾪뻾?섏? ?딄퀬 利됱떆 蹂댁긽 ?뱀? ?띿뒪???먯젙
                if (this.currentFish.id === 'item_treasure') {
                    this.uiElements.instruction.setText('대박! 황금 보물상자를 낚아 올렸어!');
                    this.cameras.main.flash(500, 255, 215, 0);
                    window.gameManagers.soundManager.playSuccess();
                } else if (this.currentFish.id === 'item_treasure_map') {
                    this.uiElements.instruction.setText('오! 보물 지도의 한 조각이야! 어디에 보물이 숨겨져 있을까?');
                    this.cameras.main.flash(500, 222, 184, 135);
                    window.gameManagers.soundManager.playSuccess();
                } else if (this.currentFish.id === 'item_pirates_sword') {
                    this.uiElements.instruction.setText('낡은 해적의 검이야... 뭔가 멋진데?');
                } else if (this.currentFish.id === 'item_pearl') {
                    this.uiElements.instruction.setText('와!! 엄청 큰 진주다! 엄마께 보여드려야지!');
                    this.cameras.main.flash(500, 255, 250, 240);
                    window.gameManagers.soundManager.playSuccess();
                } else if (this.currentFish.id === 'item_crown') {
                    this.uiElements.instruction.setText('전설의 해적왕 왕관이야!! 정말 대단해!');
                    this.cameras.main.flash(800, 255, 215, 0);
                    window.gameManagers.soundManager.playSuccess();
                } else if (this.currentFish.id === 'item_shoe') {
                    const shoeMessages = [
                        '어라... 누가 버린 작은 신발이네?',
                        '물고기인 줄 알았는데 신발이었어!',
                        '구멍 난 신발이 파도에 둥둥 떠다녔나 봐.',
                        '낚시 중에도 바다 쓰레기를 줄여야겠어!',
                        '이 신발의 주인은 어디에 있을까?'
                    ];
                    const randomMsg = shoeMessages[Math.floor(Math.random() * shoeMessages.length)];
                    this.uiElements.instruction.setText(randomMsg);
                } else if (this.currentFish.id === 'item_trash') {
                    const trashMessages = [
                        '앗.. 빈 깡통이 낚였어. 바다를 깨끗하게 해야겠어!',
                        '반짝반짝한 게 보여서 기대했는데 쓰레기였네!',
                        '물고기 대신 쓰레기가 나오다니... 바다가 아플 것 같아.',
                        '이런! 바닷속에 쓰레기가 아직 많구나.',
                        '빈 병이 흘러왔네. 꼭 분리수거해야지!',
                        '누가 먹고 버린 포장지 같아. 바다가 슬퍼하겠어.',
                        '바다 요정이 보면 속상해할 것 같아.',
                        '바다거북이 잘못 먹을 수도 있겠어. 쓰레기는 정말 싫다!',
                        '낡은 부품이네. 어디에서 떠내려왔을까?',
                        '세연이랑 같이 바다 청소도 해보고 싶다!'
                    ];
                    const randomMsg = trashMessages[Math.floor(Math.random() * trashMessages.length)];
                    this.uiElements.instruction.setText(randomMsg);
                }
            } else {
                // 50% ?뺣쪧 ?섑븰 ?댁쫰 ?앹뾽 (UIManager ?곕룞)
                const quizResult = await window.gameManagers.uiManager.showMathQuizSecondChance(this.region);
                let showTypingQuiz = false;

                if (quizResult && quizResult.correct) {
                    // ?뺣떟 ??20% 異붽? 蹂댁긽
                    const mathBonusMultiplier = quizResult.attempt === 2 ? 1.1 : 1.2;
                    finalGold = Math.floor(finalGold * mathBonusMultiplier);
                    this.cameras.main.flash(300, 255, 215, 0); // ?⑷툑???뚮옒??蹂대꼫???쇰뱶諛?

                    // ?섑븰 ?댁쫰 留욎텣 ????댄븨 ?댁쫰 (N?깃툒 ?쒖쇅, 蹂대Ъ?ъ? 50%, 湲곕낯 35%)
                    const typingQuizChance = this.region === 4 ? 0.50 : 0.35;
                    if (this.currentFish.grade !== 'N' && Math.random() < typingQuizChance) {
                        showTypingQuiz = true;
                    }
                } else if (quizResult && !quizResult.correct) {
                    // ?ㅻ떟 ??50% ??컧
                    // No penalty on a missed quiz; just continue without the bonus.
                    this.cameras.main.shake(300, 0.02); // ?ㅻ떟 ?쇰뱶諛??붾뱾由?
                }

                // ??댄븨 ?댁쫰 ?ㅽ뻾 (?섑븰 ?댁쫰 ?뺣떟 ??35% ?뺣쪧)
                if (showTypingQuiz) {
                    const typingResult = await window.gameManagers.uiManager.showTypingQuiz();
                    if (typingResult) {
                        // ??댄븨 ?댁쫰 ?뺣떟 ??湲곗〈 蹂댁긽媛?finalGold)??20% 異붽? ?곸듅 (蹂듬━ 怨꾩궛)
                        finalGold = Math.floor(finalGold * 1.2);
                        this.cameras.main.flash(300, 255, 20, 147); // ?묓겕???뚮옒??蹂대꼫???쇰뱶諛?
                    }
                }
            }

            // --- Rod Luck 蹂대꼫??肄붿씤 二쇰㉧??---
            if (this.treasureIslandBuff && this.treasureIslandBuff.type === 'doubleReward' && this.treasureIslandBuff.remaining > 0) {
                finalGold *= 2;
                this.consumeTreasureIslandBuff();
                this.showFloatingNotice('보물섬 버프 발동! 이번 보상은 2배!', '#ffd54f');
                this.cameras.main.flash(300, 255, 235, 59);
            }

            const rodLuckLevel = window.gameManagers.playerModel.stats.rodLuck;
            const bonusChance = rodLuckLevel * 0.05; // ?덈꺼??5% ?뺣쪧
            if (Math.random() < bonusChance) {
                const bonusGold = Phaser.Math.Between(20, 50 + rodLuckLevel * 10);
                finalGold += bonusGold;
                this.cameras.main.flash(200, 255, 255, 0);

                // 蹂대꼫???뚮┝ ?띿뒪??
                const bonusText = this.add.text(this.scale.width / 2, this.scale.height * 0.4, `럭키 코인 보너스! +${bonusGold}G`, {
                    fontSize: '36px', fontFamily: 'Arial', color: '#FFD700',
                    stroke: '#000000', strokeThickness: 5
                }).setOrigin(0.5).setDepth(50);
                this.tweens.add({
                    targets: bonusText,
                    y: bonusText.y - 80,
                    alpha: 0,
                    duration: 1500,
                    onComplete: () => bonusText.destroy()
                });
            }

            // ?꾩뿭 PlayerModel??怨⑤뱶 異붽?
            window.gameManagers.playerModel.addGold(finalGold);
            console.log(`?띾뱷 怨⑤뱶: ${finalGold} (?꾩옱 珥앺빀: ${window.gameManagers.playerModel.gold})`);

            // --- ?띾뱷 湲덉븸 ?뚮줈???띿뒪???좊땲硫붿씠??異붽? ---
            const floatingText = this.add.text(this.scale.width / 2, this.scale.height * 0.5, `+${finalGold}G`, {
                fontSize: '48px',
                fontFamily: 'Arial',
                color: '#FFD700',
                stroke: '#000',
                strokeThickness: 6,
                fontStyle: 'bold'
            }).setOrigin(0.5).setDepth(100);

            this.tweens.add({
                targets: floatingText,
                y: floatingText.y - 120,
                alpha: 0,
                duration: 1500,
                ease: 'Power2',
                onComplete: () => floatingText.destroy()
            });
            // ------------------------------------------

            this.updateGoalText();

            // --- 梨뺥꽣 吏꾪뻾 諛?以묎컙 ?대깽??泥댄겕 ---
            const model = window.gameManagers.playerModel;
            if (model.currentChapter <= 4) {
                if (model.checkChapterGoal()) {
                    // 紐⑺몴 ?ъ꽦 ??梨뺥꽣 ?꾪솚
                    this.triggerStoryTransition();
                    return;
                } else {
                    // 紐⑺몴?≪쓽 50% ?ъ꽦 ??以묎컙 寃⑸젮 ?대깽??(媛?梨뺥꽣蹂?1??
                    const goal = model.chapterGoals[model.currentChapter];
                    if (model.gold >= goal / 2 && !model.hasSeenMidChapterEvent[model.currentChapter]) {
                        model.hasSeenMidChapterEvent[model.currentChapter] = true;
                        model.notify(); // ???

                        let midStoryData = [];
                        if (model.currentChapter === 1) {
                            midStoryData = [
                                { speaker: '엄마', portrait: 'char_mom', text: '정우야, 벌써 목표의 절반이나 모았네! 정말 잘하고 있어.' },
                                { speaker: '정우', portrait: 'char_jeongwoo', text: '좋아! 조금만 더 잡으면 다음 지역으로 갈 수 있어!' }
                            ];
                        } else if (model.currentChapter === 2) {
                            midStoryData = [
                                { speaker: '상점 할아버지', portrait: null, text: '허허, 벌써 절반 가까이 모았구나. 흐름이 아주 좋다!' },
                                { speaker: '정우', portrait: 'char_jeongwoo', text: '기다려 주세요! 이 바다의 멋진 물고기를 더 잡아 올릴게요!' }
                            ];
                        } else if (model.currentChapter === 3) {
                            midStoryData = [
                                { speaker: '세연', portrait: 'char_seyeon', text: '오빠!! 이제 정말 끝이 보이기 시작했어!' },
                                { speaker: '정우', portrait: 'char_jeongwoo', text: '응! 조금만 더 하면 보물섬으로 갈 수 있을 거야!' }
                            ];
                        } else if (model.currentChapter === 4) {
                            midStoryData = [
                                { speaker: '아빠', portrait: 'char_dad', text: '(전화) 정우야, 보물섬은 정말 위험할 수도 있어. 조심해야 한다!' },
                                { speaker: '정우', portrait: 'char_jeongwoo', text: '아빠 걱정 마세요! 저 거대한 오징어도 이겨냈는걸요!' },
                                { speaker: '세연', portrait: 'char_seyeon', text: '오빠!! 보물도 꼭 찾아 줘!!' }
                            ];
                        }

                        // ?대깽?몃? 蹂닿퀬 ?????ㅼ떆 GameScene?쇰줈 ?뚯븘?ㅻ룄濡??ㅼ젙
                        this.scene.start('StoryScene', {
                            storyData: midStoryData,
                            nextScene: 'GameScene',
                            nextSceneData: { region: this.region }
                        });
                        return;
                    }
                }
            }

            // --- 蹂대Ъ???꾩슜 ?쒕뜡 ?대깽??(5% ?뺣쪧) ---
            if (this.region === 4 && !this.currentFish.isSpecialItem && Math.random() < 0.05) {
                this.triggerTreasureIslandEvent();
            }

            // --- 肄ㅻ낫 ?ㅽ넗由?---
            let comboStoryData = null;
            const cCount = window.gameManagers.playerModel.comboCount; // Use the updated comboCount

            if (cCount === 10) {
                comboStoryData = [
                    { speaker: '세연', portrait: 'char_seyeon', text: '오빠!! 10번이나 연속으로 성공했어!\n오늘 감이 엄청 좋은데?' },
                    { speaker: '정우', portrait: 'char_jeongwoo', text: '좋았어! 오늘은 한 마리도 놓치지 않을 거야!' }
                ];
            } else if (cCount === 20) {
                comboStoryData = [
                    { speaker: '아빠', portrait: 'char_dad', text: '우리 정우 대단하구나!!\n20번 연속 성공이라니 멋지다!' },
                    { speaker: '정우', portrait: 'char_jeongwoo', text: '헤헤! 아빠한테 배운 기술 덕분이에요!' }
                ];
            } else if (cCount === 30) {
                comboStoryData = [
                    { speaker: '상점 할아버지', portrait: 'char_shopkeeper', text: '허허... 30연속 콤보라니...\n이제 바다가 널 인정한 것 같구나.' },
                    { speaker: '정우', portrait: 'char_jeongwoo', text: '정말요?! 그럼 이제 바다 챔피언으로 불러 주세요!' }
                ];
            } else if (cCount >= 50 && cCount % 50 === 0) {
                comboStoryData = [
                    { speaker: '정우', portrait: 'char_jeongwoo', text: `우와아!! 기적의 ${cCount}콤보!!\n오늘은 정말 바다의 주인공이 된 기분이야!!!` },
                    { speaker: '세연', portrait: 'char_seyeon', text: '오빠 너무 멋있어~ 물고기들이 다 따라오나 봐!' },
                    { speaker: '아빠', portrait: 'char_dad', text: '하하... 정우의 집중력이 정말 대단하구나.' },
                    { speaker: '상점 할아버지', portrait: 'char_shopkeeper', text: '허허... 이건 진짜 전설이 될 기록이야.' }
                ];
            }

            // 留덉씪?ㅽ넠, 肄ㅻ낫 ???ㅽ넗由??대깽?멸? ?덉쑝硫????꾪솚 (蹂댁뒪/泥ル룄媛?蹂대떎 ?꾩닚??
            if (milestoneStoryData || comboStoryData) {
                this.scene.start('StoryScene', {
                    storyData: milestoneStoryData || comboStoryData,
                    nextScene: 'GameScene',
                    nextSceneData: { region: this.region }
                });
                return;
            }

            this.resetFishing();
        });
    }

    failFishing(msg = '물고기가 도망가 버렸어...') {
        this.gameState = 'IDLE';
        this.tweens.killTweensOf(this.uiElements.exclamation);
        this.tweens.killTweensOf(this.lure);
        this.uiElements.exclamation.setVisible(false);
        this.lure.setVisible(false);
        this.fish.setVisible(false);
        this.lineTension = 0;
        this.activeCatchBuff = null;
        this.clearApproachFishes();

        // UI 珥덇린??
        this.uiElements.gaugeBg.setVisible(false);
        this.uiElements.gaugeBar.setVisible(false);
        this.uiElements.tensionBg.setVisible(false);
        this.uiElements.tensionBar.setVisible(false);
        this.uiElements.tensionWarn.setVisible(false);


        // 蹂댁뒪 ??대㉧ ?④?
        if (this.uiElements.bossTimerText) this.uiElements.bossTimerText.setVisible(false);

        // 肄ㅻ낫 由ъ뀑
        window.gameManagers.playerModel.comboCount = 0;
        if (this.uiElements.comboText) this.uiElements.comboText.setVisible(false);

        if (this.isFeverTime) this.endFeverTime();
        this.consecutiveFails++;

        // 蹂댁뒪???⑤같 泥섎━
        const pm = window.gameManagers.playerModel;
        if (this.isBossFight) {
            pm.bossFailed[this.region] = (pm.bossFailed[this.region] || 0) + 1;
            pm.notify();
            this.isBossFight = false;
            this.bossVariant = 'normal';
        }

        // 吏??퀎 ?쒕뜡 ?ㅽ뙣 硫붿떆吏 ?앹꽦
        let finalMsg = msg;
        const randomChance = Math.random();

        // ??40% ?뺣쪧濡??뱀닔 硫붿떆吏 異쒕젰 (湲곗〈 硫붿떆吏媛 ?덉쓣 寃쎌슦)
        if (randomChance < 0.4) {
            if (this.region === 1) {
                const freshMessages = [
                    '민물고기가 재빨리 도망가 버렸어!',
                    '앗, 이번엔 타이밍이 조금 늦었어!',
                    '조금만 더 집중하면 바로 잡을 수 있어!',
                    '괜찮아! 다음엔 더 큰 물고기가 올 거야!'
                ];
                finalMsg = freshMessages[Math.floor(Math.random() * freshMessages.length)];
            } else if (this.region === 4) {
                const treasureMessages = [
                    '해적의 그림자가 물고기를 놀라게 했나 봐!',
                    '보물섬 바람이 오늘은 조금 심하네!',
                    '바다 깊은 곳의 기운이 방해한 것 같아!',
                    '보물섬 수호자가 한번 시험한 걸지도 몰라!',
                    '괜찮아! 다음엔 더 멋진 보물이 나타날 거야!'
                ];
                finalMsg = treasureMessages[Math.floor(Math.random() * treasureMessages.length)];
            } else {
                const seaMessages = [
                    '아쉽지만 이번엔 놓쳤어!',
                    '괜찮아, 다음 물고기는 더 쉽게 잡을 수 있을 거야!'
                ];
                finalMsg = seaMessages[Math.floor(Math.random() * seaMessages.length)];
            }
        }

        // ?곗냽 ?ㅽ뙣 UI ?쇰뱶諛?
        if (this.consecutiveFails >= 2) {
            const warnText = this.consecutiveFails >= 3
                ? '다음 낚시에서는 FEVER 타임이 찾아올지도 몰라!'
                : `연속 실패 ${this.consecutiveFails}번...`;
            finalMsg += `\n${warnText}`;
        }

        if (window.gameManagers && window.gameManagers.uiManager) {
            window.gameManagers.uiManager.showFailModal(finalMsg);
        } else {
            this.uiElements.instruction.setText(finalMsg);
        }

        this.cameras.main.shake(300, 0.02);
        window.gameManagers.soundManager.playFail();

        this.time.delayedCall(1500, () => {
            this.resetFishing();
        });
    }


    updateGoalText() {
        if (!this.uiElements.goalText) {
            this.uiElements.goalText = this.add.text(this.scale.width / 2, this.scale.height * 0.15, '', {
                fontSize: '24px', fontFamily: 'Arial', color: '#FFD700', stroke: '#000000', strokeThickness: 3
            }).setOrigin(0.5);
        }

        const model = window.gameManagers.playerModel;
        const currentGold = model.gold;

        // 紐⑤뱺 梨뺥꽣 ?대━??
        if (model.highestChapter > 4) {
            this.uiElements.goalText.setText('모든 챕터 완료! 이제 원하는 곳에서 자유롭게 낚시하자!');
            return;
        }

        // ?꾩옱 ?뚮젅??以묒씤 吏??씠 ?꾩쭅 誘명빐湲??꾨줎?곗뼱 梨뺥꽣???뚮쭔 紐⑺몴 ?쒖떆
        if (this.region === model.currentChapter && model.currentChapter <= 4) {
            const goal = model.chapterGoals[model.currentChapter];
            const nextRegionNames = { 1: '연안 열기', 2: '먼 바다 열기', 3: '보물섬 열기', 4: '최종 목표' };
            const label = nextRegionNames[model.currentChapter] || '목표';
            const percent = Math.min(100, Math.floor((currentGold / goal) * 100));

            this.uiElements.goalText.setText(`목표 ${label}: ${currentGold} / ${goal} G (${percent}%)`);
        } else if (this.region < model.currentChapter) {
            this.uiElements.goalText.setText('이미 연 지역이야. 편하게 낚시를 즐겨!');
        } else {
            this.uiElements.goalText.setText('');
        }
    }

    triggerStoryTransition() {
        this.gameState = 'STORY';
        const currentCh = window.gameManagers.playerModel.currentChapter;

        window.gameManagers.playerModel.advanceChapter();

        let storyData = [];
        let nextScene = 'IntroScene';

        if (currentCh === 1) {
            storyData = [
                { speaker: '세연', portrait: 'char_seyeon', text: '오빠!! 오늘 저녁 반찬 기대해도 되는 거지?' },
                { speaker: '정우', portrait: 'char_jeongwoo', text: '그럼! 이제 연안으로 가서 더 멋진 물고기를 잡아 올게!' },
                { speaker: '엄마', portrait: 'char_mom', text: '연안은 민물보다 더 넓고 파도도 있어. 조심해야 해.' },
                { speaker: '정우', portrait: 'char_jeongwoo', text: '걱정 마세요, 엄마! 더 큰 물고기도 문제없어요!' }
            ];
        } else if (currentCh === 2) {
            storyData = [
                { speaker: '세연', portrait: 'char_seyeon', text: '오빠 이번에도 큰 물고기를 잡았네!! 최고야!' },
                { speaker: '엄마', portrait: 'char_mom', text: '우리 정우, 이제는 진짜 바다 탐험가 같구나.' },
                { speaker: '정우', portrait: 'char_jeongwoo', text: '이제 더 멀리 나가서 전설의 물고기도 만나 볼래!' }
            ];
        } else if (currentCh === 3) {
            storyData = [
                { speaker: '수수께끼 목소리', portrait: null, text: '보물섬으로 올 용기가 있는 자는 앞으로 나아오라...' },
                { speaker: '정우', portrait: 'char_jeongwoo', text: '누구지?! 저 멀리서 목소리가 들렸어!' },
                { speaker: '수수께끼 목소리', portrait: null, text: '깊은 바다를 이겨 낸 낚시꾼만이 보물섬에 닿을 수 있다...' },
                { speaker: '세연', portrait: 'char_seyeon', text: '오빠!! 보물섬이라니!! 진짜 가는 거야?' },
                { speaker: '정우', portrait: 'char_jeongwoo', text: '물론이지! 마지막 모험을 시작하자!' }
            ];
        } else if (currentCh === 4) {
            storyData = [
                { speaker: '정우', portrait: 'char_jeongwoo', text: '해냈다! 보물섬의 모든 시련을 이겨 냈어!!' },
                { speaker: '아빠', portrait: 'char_dad', text: '정우야, 여기까지 오다니 정말 대단하구나!' },
                { speaker: '정우', portrait: 'char_jeongwoo', text: '아빠! 황금 물고기까지 만났어요! 꿈만 같아요!' },
                { speaker: '엄마', portrait: 'char_mom', text: '우리 정우가 이렇게 씩씩하게 해낼 줄 알았어!' },
                { speaker: '세연', portrait: 'char_seyeon', text: '오빠 최고!! 이제 진짜 전설의 낚시왕이야!!' },
                { speaker: '아빠', portrait: 'char_dad', text: '하하, 이제 집으로 돌아가서 축하 파티를 하자!' }
            ];
        }

        // 異뺥븯 硫붿떆吏 ?꾩슦湲?
        const celebrateText = this.add.text(this.scale.width / 2, this.scale.height / 2, '챕터 목표 달성!!', {
            fontSize: '80px', fontFamily: 'Arial', color: '#FFD700', stroke: '#FF0000', strokeThickness: 10
        }).setOrigin(0.5).setDepth(100);

        this.tweens.add({
            targets: celebrateText,
            scale: { from: 0, to: 1.2 },
            yoyo: true,
            duration: 1000,
            onComplete: () => {
                this.cameras.main.fadeOut(500, 0, 0, 0);
                this.cameras.main.once('camerafadeoutcomplete', () => {
                    // EndingScene?쇰줈 吏곹뻾 (梨뺥꽣 4 ?대━?댁떆)
                    if (currentCh === 4) {
                        this.scene.start('EndingScene');
                    } else {
                        this.scene.start('StoryScene', {
                            storyData: storyData,
                            nextScene: 'IntroScene',
                            nextSceneData: {}
                        });
                    }
                });
            }
        });
    }


    triggerTreasureIslandEvent() {
        const events = [
            {
                key: 'event_pirate',
                name: '해적선 발견',
                emoji: '🏴‍☠️',
                message: '다음 한 번은 보상을 2배로 챙길 수 있어!',
                effect: () => {
                    this.treasureIslandBuff = { type: 'doubleReward', remaining: 1 };
                }
            },
            {
                key: 'event_octopus',
                name: '대왕 문어 습격',
                emoji: '🐙',
                message: '다음 포획에서는 3초 동안 게이지가 줄지 않아!',
                effect: () => {
                    this.treasureIslandBuff = { type: 'gaugeImmunity', remaining: 1, duration: 3000 };
                }
            },
            {
                key: 'event_mermaid',
                name: '인어의 노래',
                emoji: '🧜',
                message: '전설 물고기가 가까이 왔어! 다음 한 번 SSR 확률이 크게 올라가!',
                effect: () => {
                    this.treasureIslandBuff = { type: 'ssrBoost', remaining: 1 };
                }
            },
            {
                key: 'event_rainbow',
                name: '무지개 출현',
                emoji: '🌈',
                message: '행운이 반짝! 즉시 1000G를 얻었어!',
                effect: () => {
                    window.gameManagers.playerModel.addGold(1000);
                    this.updateGoalText();
                }
            },
            {
                key: 'event_ghost',
                name: '유령선 조우',
                emoji: '👻',
                message: '으스스한 바람이 지켜줘! 다음 포획에서 4초 동안 게이지를 보호해!',
                effect: () => {
                    this.treasureIslandBuff = { type: 'gaugeImmunity', remaining: 1, duration: 4000 };
                }
            }
        ];

        const event = events[Math.floor(Math.random() * events.length)];
        window.gameManagers.playerModel.registerEventCard(event.key);
        event.effect();

        const eventText = this.add.text(
            this.scale.width / 2,
            this.scale.height * 0.38,
            `${event.emoji} ${event.name}\n${event.message}`,
            {
                fontSize: '28px',
                fontFamily: 'Arial',
                color: '#FFD700',
                stroke: '#000000',
                strokeThickness: 6,
                fontStyle: 'bold',
                align: 'center',
                wordWrap: { width: this.scale.width * 0.82 }
            }
        ).setOrigin(0.5).setDepth(100);

        this.cameras.main.flash(400, 255, 215, 0);
        window.gameManagers.soundManager.playSuccess();

        this.tweens.add({
            targets: [eventText],
            alpha: 0,
            y: eventText.y - 50,
            duration: 1000,
            delay: 2000,
            onComplete: () => { eventText.destroy(); }
        });
    }

    resetFishing() {
        this.gameState = 'IDLE';
        this.catchGauge = 0;
        this.currentFish = null;
        this.lineTension = 0;
        this.activeCatchBuff = null;
        this.bossVariant = 'normal';
        this.isCharging = false;
        const regionNames = { 1: "민물", 2: "연안", 3: "먼 바다", 4: "보물섬" };
        this.uiElements.instruction.setText(`${regionNames[this.region]}에서 낚시를 시작해 보자!`);
        this.updateGoalText();
        this.uiElements.gaugeBg.setVisible(false);
        this.uiElements.gaugeBar.setVisible(false);
        this.uiElements.tensionBg.setVisible(false);
        this.uiElements.tensionBar.setVisible(false);
        this.uiElements.tensionWarn.setVisible(false);
        if (this.uiElements.bossTimerText) this.uiElements.bossTimerText.setVisible(false);


        // 怨쇰뀅 ?뚰듃 ?ㅼ떆 ?쒖떆 (?꾩튂 ?ъ꽕??
        // 怨쇰뀅 ?ъ꽕??(repositionTargetRing???뚯븘??諛곗뿴??媛깆떊?섍퀬 ?붾㈃???쒖떆??
        this.repositionTargetRing();
    }

    update(time, delta) {
        // 臾쇨퀬湲??ㅻ（???대룞
        if (this.wanderingFishes) {
            this.wanderingFishes.forEach(fish => {
                fish.x += fish.speed * fish.direction * (delta / 1000);
                if (fish.direction === 1 && fish.x > this.scale.width + 200) {
                    fish.x = -200;
                    fish.y = Phaser.Math.Between(this.scale.height * 0.4, this.scale.height * 0.9);
                    const fData = getRandomFish(0, this.region);
                    fish.setTexture(fData.id);
                    fish.setScale(fData.scale * 0.8);
                    fish.flipX = true;
                } else if (fish.direction === -1 && fish.x < -200) {
                    fish.x = this.scale.width + 200;
                    fish.y = Phaser.Math.Between(this.scale.height * 0.4, this.scale.height * 0.9);
                    const fData = getRandomFish(0, this.region);
                    fish.setTexture(fData.id);
                    fish.setScale(fData.scale * 0.8);
                    fish.flipX = false;
                }
            });
        }

        // CATCH ?곹깭?먯꽌??寃뚯씠吏 ?먯뿰 媛먯냼 濡쒖쭅 諛?誘몃땲寃뚯엫 猷⑦봽
        if (this.gameState === 'CATCH') {
            // 蹂댁뒪 ???由щ컠 泥섎━
            if (this.isBossFight) {
                this.bossTimer += delta;
                const timeLeft = Math.max(0, this.bossTimeLimit - (this.bossTimer / 1000));
                this.uiElements.bossTimerText.setText(`보스 남은 시간: ${timeLeft.toFixed(1)}초`);
                this.uiElements.bossTimerText.setVisible(true);

                if (timeLeft <= 0) {
                    this.failFishing('시간 초과! 보스가 도망가 버렸어...');
                    return;
                }
            }

            // --- Fever Time ??대㉧ ---
            if (this.isFeverTime) {
                this.feverTimeRemaining -= delta;
                if (this.feverTimeRemaining <= 0) {
                    this.endFeverTime();
                }
            }

            // ?쇰쾭 ??꾩씠 ?꾨땺 ?뚮쭔 寃뚯씠吏 ?섎씫
            const hasGaugeImmunity = !!(this.activeCatchBuff && this.activeCatchBuff.type === 'gaugeImmunity' && this.activeCatchBuff.duration > 0);
            if (hasGaugeImmunity) {
                this.activeCatchBuff.duration -= delta;
                if (this.activeCatchBuff.duration <= 0) {
                    this.activeCatchBuff = null;
                }
            }

            if (!this.isFeverTime && !hasGaugeImmunity) {
                const reelLevel = window.gameManagers.playerModel.stats.reelSpeed;

                // ?깃툒蹂꾨줈 諛⑺빐 ?붿냼(寃뚯씠吏 ?섎씫瑜? 李⑤벑 ?곸슜
                let baseDrop = 15;
                if (this.currentFish.grade === 'R') baseDrop = 30;
                else if (this.currentFish.grade === 'SR') baseDrop = 60;
                else if (this.currentFish.grade === 'SSR') baseDrop = 100;

                // 蹂대Ъ??Region 4) 寃뚯씠吏 ?섎씫 媛뺥솕
                if (this.region === 4) {
                    if (this.currentFish.grade === 'N') baseDrop = 25;
                    else if (this.currentFish.grade === 'R') baseDrop = 50;
                    else if (this.currentFish.grade === 'SR') baseDrop = 90;
                    else if (this.currentFish.grade === 'SSR') baseDrop = 150;
                }

                // ?ㅽ꺈 Reel Speed???섑빐 珥덈떦 媛먯냼???꾪솕 (?덈꺼??1.5 諛⑹뼱, Lv20 湲곗? 30 諛⑹뼱 = 湲곗〈 Lv10)
                const dropRate = Math.max(5, baseDrop - (reelLevel * 1.5));

                // 0.3珥??ъ쑀 ?쒓컙 (catchGraceTimer) ?곸슜
                if (this.catchGraceTimer > 0) {
                    this.catchGraceTimer -= delta;
                } else {
                    this.catchGauge -= (dropRate * (delta / 1000));
                }
            }

            // ?λ젰(Tension) ?먯뿰 媛먯냼 (?고? ???섎㈃ ?쒖꽌???대젮媛?
            this.lineTension = Math.max(0, this.lineTension - 0.3 * (delta / 1000));

            // --- charge 誘몃땲寃뚯엫: ?꾨Ⅴ怨??덉쑝硫?寃뚯씠吏/?먯뀡 ?곸듅 ---
            if (this.miniGameType === 'charge' && this.isCharging) {
                this.chargeTimer += delta;
                if (this.chargeTimer >= 100) { // 0.1珥덈쭏?ㅽ떛
                    this.chargeTimer = 0;
                    const powerLevel = window.gameManagers.playerModel.stats.rodPower;
                    const reelLevel = window.gameManagers.playerModel.stats.reelSpeed;
                    const fishDifficulty = this.currentFish.difficulty || 1.0;
                    // FishData.js??generateFish ?몄텧 (multiplier ?몄옄 異붽?)
                    const caughtFish = window.gameManagers.fishData.generateFish(
                        this.region,
                        window.gameManagers.playerModel.stats.rodLuck,
                        this.comboCount,
                        this.castingBonus,
                        this.castingMultiplier || 1
                    );    // ?고?(mash)??~30% ?섏? 吏꾪뻾??(珥??⑥쐞 ?섏궛??珥덈떦 ??3諛?鍮좊쫫 -> 諛몃윴??
                    const progress = Math.max(3, (powerLevel * reelLevel) / fishDifficulty) * 0.4;

                    this.catchGauge += progress;

                    // ?먯뀡 利앷????쒖꽌??(0.1珥덈떦 0.04 -> 珥덈떦 0.4)
                    this.lineTension = Phaser.Math.Clamp(this.lineTension + 0.04, 0, 1);

                    const safeLimit = this.getTensionSafeLimit();
                    if (this.lineTension >= 0.95) {
                        this.cameras.main.shake(300, 0.03);
                        this.failFishing('줄이 너무 팽팽해! 놓쳐 버렸어...');
                        return;
                    } else if (this.lineTension >= safeLimit) {
                        this.uiElements.tensionWarn.setText('?좑툘 ?덈Т ?멸쾶! 以꾩씠 ?딆뼱吏?寃?媛숈븘!');
                        this.uiElements.tensionWarn.setVisible(true);
                    } else {
                        this.uiElements.tensionWarn.setText('');
                    }
                    this.cameras.main.shake(50, 0.002);
                }
            }

            // --- ??대컢 寃뚯엫 諛??대룞 ---
            if (this.miniGameType === 'timing') {
                const speed = 0.5 * (delta / 1000); // 珥덈떦 0.5 ?대룞
                this.timingBarX += speed * this.timingBarDir;
                if (this.timingBarX > 1) { this.timingBarX = 1; this.timingBarDir = -1; }
                if (this.timingBarX < 0) { this.timingBarX = 0; this.timingBarDir = 1; }
            }

            if (this.catchGauge <= 0) {
                this.catchGauge = 0;
                // ?섎씫?댁꽌 0???섎㈃ ?볦묠
                this.cameras.main.zoomTo(1, 300);
                this.failFishing('아쉽게 놓치고 말았어...');
            } else if (this.catchGauge >= this.catchMax) {
                this.successFishing();
            } else {
                this.updateGaugeUI();
            }
        }

        // --- ?ㅽ뵆?쇱씤 ?싳떙以?洹몃━湲?(罹먮┃??~ 李? ---
        this.fishingLine.clear();
        if (this.lure && this.lure.visible && this.character) {
            const rodTipX = this.character.x + 20;
            const rodTipY = this.character.y - 15;
            const lureX = this.lure.x;
            const lureY = this.lure.y;

            // ?λ젰???곕씪 怨〓쪧 怨꾩궛 (0 = 吏곸꽑, 1 = ?ш쾶 ?섏뼱吏?
            const tension = this.lineTension;
            const midX = (rodTipX + lureX) / 2;
            const midY = (rodTipY + lureY) / 2;
            // ?λ젰???믪쑝硫??쒖쿂???꾨줈 ?섏뼱吏怨? 0?대㈃ 以묐젰???섑빐 ?꾨옒濡?泥섏쭚
            const sagAmount = tension > 0.1
                ? -60 * tension   // ?꾨줈 ?밴꺼吏?(??紐⑥뼇)
                : 30;              // 以묐젰 泥섏쭚
            const ctrlX = midX + (tension > 0.1 ? 20 * Math.sin(time * 0.01) : 0);
            const ctrlY = midY + sagAmount;

            // ???됱긽???λ젰???곕씪 蹂??(?곗깋 ??遺됱???
            const r = Math.floor(255);
            const g = Math.floor(255 * (1 - tension * 0.8));
            const b = Math.floor(255 * (1 - tension * 0.8));
            const lineColor = (r << 16) | (g << 8) | b;
            const lineWidth = 2 + tension * 3; // ?λ젰 ?믪쓣?섎줉 援듦쾶

            this.fishingLine.lineStyle(lineWidth, lineColor, 0.9);
            this.fishingLine.beginPath();
            this.fishingLine.moveTo(rodTipX, rodTipY);

            // Quadratic bezier curve濡??ㅽ뵆?쇱씤 ?쒕??덉씠??
            const steps = 20;
            for (let i = 1; i <= steps; i++) {
                const t = i / steps;
                // Quadratic bezier: B(t) = (1-t)^2*P0 + 2*(1-t)*t*P1 + t^2*P2
                const px = (1 - t) * (1 - t) * rodTipX + 2 * (1 - t) * t * ctrlX + t * t * lureX;
                const py = (1 - t) * (1 - t) * rodTipY + 2 * (1 - t) * t * ctrlY + t * t * lureY;
                this.fishingLine.lineTo(px, py);
            }
            this.fishingLine.strokePath();
        }
    }
}
