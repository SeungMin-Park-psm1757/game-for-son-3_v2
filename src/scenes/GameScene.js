import { getRandomFish, FISH_TYPES } from '../models/FishData.js';
import { BOSS_STORIES, FIRST_CATCH_STORIES } from '../models/StoryData.js';

export default class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
        // 게임 상태 관리
        this.gameState = 'IDLE'; // IDLE, APPROACH, BITE, CATCH, REWARD
        this.catchGauge = 0;
        this.catchMax = 100;
        this.fish = null;
        this.lure = null;
        this.character = null;
        this.fishingLine = null;
        this.uiElements = {};

        // 디바운싱용 타임스탬프
        this.lastActionTime = 0;

        // 지역(챕터) 정보 (기본값: 1)
        this.region = 1;

        // --- 구제 시스템 (Fever Time) ---
        this.consecutiveFails = 0;
        this.isFeverTime = false;
        this.feverTimeRemaining = 0;

        // --- 스플라인 물리 + 줄 텐션/끊김 ---
        this.lineTension = 0; // 0~1 범위

        // --- 캐스팅 스킬샷 ---
        this.castingBonus = 1; // 0=빗나감, 1=보통, 2=좋음, 3=완벽
        this.targetRingX = 0;
        this.targetRingY = 0;

        // --- 3종 미니게임 ---
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

        // --- 콤보 시스템 ---
        this.comboCount = 0;
        this.bossVariant = 'normal';
        this.treasureIslandBuff = null;
        this.activeCatchBuff = null;

        // --- 보스 어종 ---
        this.isBossFight = false;
        this.bossTimeLimit = 0;
        this.bossTimer = 0;
        this.regionFishCount = 0; // 현재 지역 낚시 횟수
    }

    init(data) {
        this.region = (data && data.region) ? data.region : 1;

        // 씬 재시작 시 상태 완전 초기화
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
        // --- 0. 전역 데이터 초기화 (에러 방지용) ---
        if (!window.gameManagers.fishData) {
            window.gameManagers.fishData = {
                region1: FISH_TYPES.filter(f => f.region === 1),
                region2: FISH_TYPES.filter(f => f.region === 2),
                region3: FISH_TYPES.filter(f => f.region === 3),
                region4: FISH_TYPES.filter(f => f.region === 4)
            };
        }

        // --- 1. 배경 및 화면 셋업 ---
        const width = this.scale.width;
        const height = this.scale.height;

        // 배경 이미지 (화면 꽉 차게)
        let bgKey = 'bg_coast';
        if (this.region === 1) bgKey = 'bg_freshwater';
        else if (this.region === 3) bgKey = 'bg_sea';
        else if (this.region === 4) bgKey = 'bg_treasure_island';

        this.bg = this.add.image(width / 2, height / 2, bgKey);
        this.bg.setDisplaySize(width, height);
        this.bg.setInteractive(); // 배경 클릭으로 낚시 시작
        this.water = this.bg; // 기존 코드 호환을 위해 water 변수에 할당

        // 물고기 돌아다니는 실루엣 생성
        this.createWanderingFishes();

        // 상태창 UI (임시)
        const regionNames = { 1: "민물", 2: "연안", 3: "먼 바다", 4: "보물섬" };
        const instrFontSize = Math.max(18, Math.round(width * 0.044)) + 'px';
        this.uiElements.instruction = this.add.text(width / 2, height * 0.08, `${regionNames[this.region]}을 탭(클릭)해서 찌를 던지세요!`, {
            fontSize: instrFontSize, fontFamily: 'Arial', color: '#FFFFFF', stroke: '#000000', strokeThickness: 4,
            wordWrap: { width: width * 0.9 }
        }).setOrigin(0.5);
        // 현재 챕터 목표 표시 UI
        this.updateGoalText();

        // 지역별 UI 및 캐릭터 위치 설정 (캐릭터가 위에 있으면 UI는 아래로)
        const uiTop = this.region < 3;
        const feverY = height * (uiTop ? 0.25 : 0.78);
        const gaugeY = height * (uiTop ? 0.18 : 0.85);
        const tensionY = height * (uiTop ? 0.22 : 0.81);
        const tensionWarnY = height * (uiTop ? 0.26 : 0.77);

        // 피버 타임 텍스트
        this.uiElements.feverText = this.add.text(width / 2, feverY, '🔥 FEVER TIME! 🔥', {
            fontSize: '40px', fontFamily: 'Arial', color: '#FF4500',
            stroke: '#FFD700', strokeThickness: 6
        }).setOrigin(0.5).setDepth(20).setVisible(false);

        // 보스 타이머 텍스트
        this.uiElements.bossTimerText = this.add.text(width / 2, gaugeY - 40, '마왕 제한시간: 15초', {
            fontSize: '24px', fontFamily: 'Arial', color: '#FF0000',
            stroke: '#FFFFFF', strokeThickness: 4, fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(20).setVisible(false);

        // 연타 게이지바 (배경, 게이지)
        const gaugeWidth = Math.min(400, Math.round(width * 0.88));
        this.gaugeWidth = gaugeWidth;
        this.uiElements.gaugeBg = this.add.rectangle(width / 2, gaugeY, gaugeWidth, 40, 0x333333).setDepth(10).setVisible(false);
        this.uiElements.gaugeBar = this.add.rectangle(width / 2 - gaugeWidth / 2, gaugeY, 0, 40, 0x00FF00).setOrigin(0, 0.5).setDepth(11).setVisible(false);

        // --- 줄 텐션 경고 바 ---
        this.uiElements.tensionBg = this.add.rectangle(width / 2, tensionY, gaugeWidth, 16, 0x333333).setDepth(10).setVisible(false);
        this.uiElements.tensionBar = this.add.rectangle(width / 2 - gaugeWidth / 2, tensionY, 0, 16, 0xff4444).setOrigin(0, 0.5).setDepth(11).setVisible(false);
        this.uiElements.tensionWarn = this.add.text(width / 2, tensionWarnY, '', {
            fontSize: '20px', fontFamily: 'Arial', color: '#FF0000', stroke: '#000', strokeThickness: 3
        }).setOrigin(0.5).setDepth(12).setVisible(false);

        // --- 콤보 카운터 ---
        this.uiElements.comboText = this.add.text(width - 20, height * 0.12, '', {
            fontSize: '24px', fontFamily: 'Arial', color: '#FF4500', stroke: '#000', strokeThickness: 4, fontStyle: 'bold'
        }).setOrigin(1, 0.5).setDepth(20).setVisible(false);

        // 캐릭터 렌더링
        let charY = height * 0.8;
        if (this.region === 1) charY = height * 0.85; // 민물 (아래 얕은 물가)
        else if (this.region === 2) charY = height * 0.75; // 연안 (중하단 갯바위)
        else if (this.region === 3) charY = height * 0.20; // 먼 바다 (배 위)
        else if (this.region === 4) charY = height * 0.23; // 보물섬 (섬 위)

        const charTexture = this.getCharacterTextureKey();
        this.character = this.add.image(width / 2, charY, charTexture).setDepth(3);

        // 캐릭터 크기 동적 조절 (이전 128px * 1.26 = 161px)
        const targetCharSize = 160;
        const charScale = targetCharSize / this.character.width;
        this.character.setScale(charScale);
        this.character.setData('baseScale', charScale);

        this.fishingLine = this.add.graphics();
        this.fishingLine.setDepth(1);

        // 찌 (Lure) 스프라이트 - 초기 숨김
        this.lure = this.add.image(0, 0, 'lure').setVisible(false).setDepth(2);
        const targetLureSize = 24;
        this.lure.setScale(targetLureSize / this.lure.width);

        // 물고기 (Fish) 스프라이트 - 초기 숨김
        this.fish = this.add.image(0, 0, 'fish_pirami').setVisible(false).setDepth(1);

        // 큰 느낌표 텍스트 (입질용)
        this.uiElements.exclamation = this.add.text(0, 0, '!', {
            fontSize: '120px', fontFamily: 'Arial', color: '#FFFF00', stroke: '#FF0000', strokeThickness: 10
        }).setOrigin(0.5).setVisible(false).setDepth(5);

        // --- 캐스팅 스킬샷: 2~3개의 다앙햔 과녁 ---
        this.targetRings = []; // 과녁들을 저장할 배열
        this.repositionTargetRing();

        // 뒤로 가기 버튼 (위치 하향 조정: 24, 80 - 모바일 노치 회피)
        const backBtnFontSize = width < 360 ? '16px' : '20px';
        const backBtn = this.add.text(24, 80, '⬅️ 뒤로 가기', {
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

        // --- 2. 입력 이벤트 핸들러 (연타, 드래그, 홀드 등) ---
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

            // 시각적 피드백 (반짝임) - 크기가 동적이므로 변수 사용
            const baseScale = this.character.getData('baseScale') || (160 / this.character.width);
            this.character.setData('baseScale', baseScale);

            this.tweens.add({
                targets: this.character,
                scale: { from: baseScale, to: baseScale * 0.86 },
                duration: 300,
                ease: 'Bounce.easeOut'
            });

            // 빛나는 효과 파티클
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

            // 파티클 텍스처 (하얀 원)
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
            fish.setTint(0x000000); // 검은색
            fish.setAlpha(0.15); // 실루엣 투명도
            fish.setScale(fData.scale);
            fish.setDepth(0); // 배경 바로 위, 찌보다 아래

            fish.speed = Phaser.Math.Between(20, 60);
            fish.direction = (Math.random() > 0.5) ? 1 : -1;
            fish.flipX = fish.direction === 1; // 1이면 오른쪽, -1이면 왼쪽 이동

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
                this.uiElements.instruction.setText('물 쪽을 클릭하세요!');
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

    // --- 캐스팅 스킬샷: 과녁 위치 랜덤 재배치 ---
    repositionTargetRing() {
        const w = this.scale ? this.scale.width : 720;
        const h = this.scale ? this.scale.height : 1280;
        const targetScale = (window.gameManagers.playerModel.stats.focusRing || 1) / 3;
        const outerRadius = 90 * targetScale;

        // 기존 과녁들 삭제
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

    // --- Phase 1: 찌 던지기 (Approach) + 스킬샷 판정 ---
    startApproach(targetX, targetY) {
        this.gameState = 'APPROACH';
        this.regionFishCount++;

        // --- 캐스팅 스킬샷 판정 (가장 가까운 과녁 찾기) ---
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

        // 결과 배율 제거됨
        this.castingMultiplier = 1;

        if (closestRing && minDist <= 30 * targetScale) {
            this.castingBonus = 3; // 완벽
            this.uiElements.instruction.setText(`✨ 완벽한 캐스팅! ✨`);
            this.cameras.main.flash(200, 255, 215, 0);
        } else if (closestRing && minDist <= 60 * targetScale) {
            this.castingBonus = 2; // 좋음
            this.uiElements.instruction.setText(`🎯 좋은 캐스팅!`);
        } else if (closestRing && minDist <= 90 * targetScale) {
            this.castingBonus = 1; // 보통
            this.uiElements.instruction.setText('기다리는 중...');
        } else {
            this.castingBonus = 0; // 빗나감
            this.castingMultiplier = 1; // 빗나가면 배율 없음
            this.uiElements.instruction.setText('빗나갔어... 작은 물고기가 많을지도?');
        }

        // 과녁 숨기기
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

    // Phase 1 -> 2 대기
    waitForBite(lureX, lureY) {
        const chanceLevel = window.gameManagers.playerModel.stats.catchChance;
        const baseMaxWait = this.region === 4 ? 5000 : 4000;
        let maxWait = Math.max(1000, baseMaxWait - (chanceLevel * 200));

        // 캐스팅 보너스: 입질 대기시간 단축
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
                ? '?슚 媛뺥솕 蹂댁뒪 異쒗쁽! ?슚'
                : (this.bossVariant === 'returning' ? '?슚 蹂댁뒪 ?ъ벑?? ?슚' : '?슚 留덉솗 異쒗쁽 寃쎄퀬! ?슚');

            this.uiElements.instruction.setText(`${bossLabel}\n?쒓컙 ?댁뿉 ?≪븘??!`);
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
                this.showFloatingNotice('蹂대Ъ???됰줉! ?ш? 臾쇨퀬湲??좏솗 ?낅줈!', '#8be9fd');
            }

            this.currentFish = getRandomFish(rodLuckLevel, this.region, this.castingBonus, comboCount, rareFishBoost);
        }

        // --- 10% 확률로 보스(마왕) 출현 (지역당 5회 낚시 이후 + 아직 안 잡았을 때) ---
        if (false) {
            this.isBossFight = true;
            const regionList = FISH_TYPES.filter(f => f.region === this.region);
            const ssrFishes = regionList.filter(f => f.grade === 'SSR');
            this.currentFish = ssrFishes.length > 0 ? ssrFishes[0] : regionList[regionList.length - 1];
            this.uiElements.instruction.setText('🚨 마왕 출현 경고! 🚨\n시간 내에 잡아라!!');
            this.cameras.main.shake(1500, 0.02);
            this.cameras.main.flash(500, 255, 0, 0);
            window.gameManagers.soundManager.playError(); // 씬 진입 경고음
        } else if (!this.currentFish) {
            this.isBossFight = false;
            // 물고기 종류 결정 (캐스팅 보너스 + 콤보 적용)
            const rodLuckLevel = pm.stats.rodLuck;
            const comboCount = pm.comboCount || 0;
            this.currentFish = getRandomFish(rodLuckLevel, this.region, this.castingBonus, comboCount);
        }

        // --- 3~5마리 물고기 접근 연출 ---
        this.approachFishes = [];
        const numFishes = Phaser.Math.Between(3, 5);
        const biterIndex = Phaser.Math.Between(0, numFishes - 1);

        for (let i = 0; i < numFishes; i++) {
            const isBiter = (i === biterIndex);

            // 물고기 종류: 무는 놈은 currentFish, 나머지는 랜덤
            const fData = isBiter ? this.currentFish : getRandomFish(0, this.region);

            // 사방에서 등장하도록 랜덤 시작 위치
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
            fishSprite.flipX = (startX > lureX); // 찌를 바라보도록

            if (isBiter) {
                // === 무는 물고기: 찌까지 직행 ===
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
                // 메인 fish 스프라이트에도 반영 (입질 연출용)
                this.fish.setTexture(this.currentFish.id);
                this.fish.setScale(this.currentFish.scale * 1.5);
                console.log(`[DEBUG FISH] ${this.currentFish.id} | FishData scale: ${this.currentFish.scale} | applied: ${this.currentFish.scale * 1.5} | sprite displayW: ${this.fish.displayWidth}, displayH: ${this.fish.displayHeight}`);
                this.fish.clearTint();
                this.fish.setVisible(false); // 접근 중에는 approachFish가 보이므로 숨김
            } else {
                // === 안 무는 물고기: 다양한 행동 ===
                const behavior = Phaser.Math.Between(0, 2);

                if (behavior === 0) {
                    // (A) 거의 물 뻔하다 턱 돌아감
                    const nearX = lureX + Phaser.Math.Between(-30, 30);
                    const nearY = lureY + Phaser.Math.Between(-20, 30);
                    const approachTime = Phaser.Math.Between(800, waitTime * 0.7);
                    this.tweens.add({
                        targets: fishSprite,
                        x: nearX, y: nearY,
                        duration: approachTime,
                        ease: 'Sine.easeInOut',
                        onComplete: () => {
                            // 턱 돌아감
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
                    // (B) 관심 없이 느릿느릿 지나감
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
                    // (C) 빙글빙글 주위를 맴돌다 떠남
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

    // 접근 물고기 전부 제거
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

    // --- Phase 2: 입질 (Bite) ---
    startBite(x, y) {
        this.gameState = 'BITE';
        this.uiElements.instruction.setText('지금 탭하세요!!!');

        // 느낌표를 화면 중앙에 크게 표시 (즉각적 피드백)
        this.uiElements.exclamation.setPosition(this.scale.width / 2, this.scale.height / 2 - 50);
        this.uiElements.exclamation.setVisible(true);
        this.uiElements.exclamation.setRotation(0);

        window.gameManagers.soundManager.playBite();

        // 느낌표 애니메이션: 스케일 펄스 + 거친 회전 진동
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

        // 화면 번쩍 (빨간빛으로 위급함 전달)
        this.cameras.main.flash(200, 255, 50, 50, true);

        // 찌 요동치게
        this.tweens.add({
            targets: this.lure,
            x: x + 10,
            yoyo: true,
            repeat: -1,
            duration: 50
        });

        // 일정 시간 내에 클릭 안 하면 실패 (보물섬은 1.2초로 단축)
        const biteTimeout = this.region === 4 ? 1200 : 1500;
        this.time.delayedCall(biteTimeout, () => {
            if (this.gameState === 'BITE') {
                this.failFishing('물고기가 도망갔어요...');
            }
        });
    }

    activateFeverTime() {
        this.isFeverTime = true;
        this.catchMax = Math.max(10, this.catchMax * 0.5); // 잡기 더 쉽게 (체력 절반)
        this.cameras.main.setBackgroundColor('#4a0000'); // 배경 약간 붉은 피버 연출

        // 피버타임 알림 텍스트 효과
        const feverText = this.add.text(this.scale.width / 2, this.scale.height * 0.3, '🔥 피버 타임! 낚시가 쉬워집니다! 🔥', {
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
        this.cameras.main.setBackgroundColor('#2c3e50'); // 원래 배경으로 복구
    }

    // --- Phase 3: 잡기 (Catch) - 3종 미니게임 랜덤 ---
    startCatch() {
        this.gameState = 'CATCH';
        this.lineTension = 0;
        this.catchGraceTimer = 300; // 0.3초 게이지 하락 무적 시간

        this.catchMax = this.currentFish.catchMax || 100;
        this.catchGauge = this.catchMax * 0.15;

        if (this.isBossFight) {
            this.catchMax *= 3; // 보스 catchMax ×3
            this.bossTimeLimit = 15; // 15초 제한
            this.bossTimer = 0;
            const pm = window.gameManagers.playerModel;
            if (pm.bossFailed[this.region]) {
                // 이전 실패 보너스 (힌트/학습 효과)
                this.catchGauge = this.catchMax * 0.3; // 30%에서 시작
            }
            // 보스 타이머 UI 초기화 및 숨김 (update에서 다시 표시)
            if (this.uiElements.bossTimerText) this.uiElements.bossTimerText.setVisible(false);
        }

        // --- Fever Time 적용 체크 ---
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
            this.showFloatingNotice('蹂대Ъ???됰줉! ?좎떆 寃뚯씠吏媛 以꾩? ?딆븘??', '#7fdcff');
        }

        if (this.consecutiveFails >= 3) {
            this.activateFeverTime();
        }

        // --- 미니게임 임시 중단, 연타로 단일화 ---
        this.miniGameType = 'mash';

        if (this.miniGameType === 'timing') {
            this.uiElements.instruction.setText('초록 구간에서 탭하세요!');
            this.timingHits = 0;
            this.timingRequired = Phaser.Math.Between(3, 5);
            const gw = this.gaugeWidth || 400;
            // 초록 구간 위치 (30~70% 사이 랜덤, 폭 20%)
            this.timingGreenStart = Phaser.Math.FloatBetween(0.3, 0.6);
            this.timingGreenEnd = this.timingGreenStart + 0.15;
            this.timingBarX = 0;
            this.timingBarDir = 1;
        } else if (this.miniGameType === 'draw') {
            this.uiElements.instruction.setText('나타나는 모양을 따라 그리세요!');
            this.drawUserPath = [];
            this.isDrawing = false;
            this.generateDrawPath();

        } else {
            this.uiElements.instruction.setText('화면을 마구 클릭하세요!!!');
        }

        // 기존 이펙트 정리
        this.tweens.killTweensOf(this.uiElements.exclamation);
        this.tweens.killTweensOf(this.lure);
        this.uiElements.exclamation.setVisible(false);
        this.clearApproachFishes();
        // CATCH 단계 초기화
        this.clearApproachFishes();
        this.lure.setVisible(true);
        this.fish.setVisible(false);

        // 그리기 미니게임 그래픽 준비
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

            // 점선 힌트용 파티클 또는 마커
            this.drawGraphics.fillStyle(0xffff00, 1);
            this.drawGraphics.fillCircle(this.drawPath[0].x, this.drawPath[0].y, 8);
        }

        // 게이지 UI 표시
        this.uiElements.gaugeBg.setVisible(true);
        this.uiElements.gaugeBar.setVisible(true);
        // 텐션 UI 우선 중단에 따른 숨김 처리
        if (false) { // 기존 텐션 표시 영역은 무시
            this.uiElements.tensionBg.setVisible(true);
            this.uiElements.tensionBar.setVisible(true);
            this.uiElements.tensionWarn.setVisible(true);
        }
        this.updateGaugeUI();

        this.cameras.main.zoomTo(1.1, 300);
    }

    // 따라 그리기 경로 생성
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
            // 직선 (좌->우 또는 대각선)
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

    // --- CATCH 상태 입력 핸들러 (미니게임별 분기) ---
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
            this.generateDrawPath(); // 다시 그리기
            this.startCatchGraphicsForDraw();
            return;
        }

        // 단순 매칭 평가: 사용자의 선 길이와 시작/끝점이 가이드에 얼마나 일치하는지
        let score = 0;
        const targetStart = this.drawPath[0];
        const targetEnd = this.drawPath[this.drawPath.length - 1];

        const userStart = this.drawUserPath[0];
        const userEnd = this.drawUserPath[this.drawUserPath.length - 1];

        const startDist = Phaser.Math.Distance.Between(targetStart.x, targetStart.y, userStart.x, userStart.y);
        const endDist1 = Phaser.Math.Distance.Between(targetEnd.x, targetEnd.y, userEnd.x, userEnd.y);
        const endDist2 = Phaser.Math.Distance.Between(targetStart.x, targetStart.y, userEnd.x, userEnd.y); // 반대로 그렸을 경우

        // 허용 반경 내에 있나
        if (startDist < 60 && Math.min(endDist1, endDist2) < 60) {
            score = 100;
        }

        if (score > 50) {
            // 성공
            const progress = this.catchMax / 3; // 3번 그리면 성공하도록
            this.catchGauge += progress;
            window.gameManagers.soundManager.playSuccess();
            this.cameras.main.flash(100, 0, 255, 0);
        } else {
            // 실패
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
            this.failFishing('모양이 너무 달라요...');
            if (this.drawGraphics) this.drawGraphics.clear();
            if (this.drawUserGraphics) this.drawUserGraphics.clear();
        } else {
            // 다음 문제
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

    // 타이밍 탭 미니게임 처리
    handleTimingTap() {
        const pos = this.timingBarX; // 0~1 범위
        const inGreen = pos >= this.timingGreenStart && pos <= this.timingGreenEnd;

        if (inGreen) {
            this.timingHits++;
            const progress = this.catchMax / this.timingRequired;
            this.catchGauge += progress;
            this.cameras.main.flash(100, 0, 255, 0);
            window.gameManagers.soundManager.playSuccess();

            // 새 초록 구간 랜덤 재배치
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

        // --- 줄 텐션 증가 임시 중단 ---
        // this.lineTension = Phaser.Math.Clamp(this.lineTension + 0.12, 0, 1);

        // --- 줄 끊김 판정 임시 중단 ---
        // const safeLimit = this.getTensionSafeLimit();
        // if (this.lineTension >= 0.95) {
        //     // 줄 끊김!
        //     this.cameras.main.shake(300, 0.03);
        //     this.failFishing('앗! 줄이 끊어졌어요! 너무 세게 당겼나봐요...');
        //     return;
        // } else if (this.lineTension >= safeLimit) {
        //     this.uiElements.tensionWarn.setText('⚠️ 너무 세게! 줄이 끊어질 것 같아!');
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

    // 어종별 텐션 안전 한계
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

        // 텐션 바 업데이트
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


        // 보스 타이머 숨김
        if (this.uiElements.bossTimerText) this.uiElements.bossTimerText.setVisible(false);

        // 피버 타임 해제
        if (this.isFeverTime) this.endFeverTime();

        // 연속 실패 초기화 + 콤보 증가
        this.consecutiveFails = 0;
        window.gameManagers.playerModel.comboCount = (window.gameManagers.playerModel.comboCount || 0) + 1;
        const combo = window.gameManagers.playerModel.comboCount;

        // 보스전 승리 처리
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

        // 콤보 UI 표시
        if (combo >= 2) {
            this.uiElements.comboText.setText(`🔥 콤보 x${combo}!`);
            this.uiElements.comboText.setVisible(true);
            this.tweens.add({
                targets: this.uiElements.comboText,
                scale: { from: 1.5, to: 1 },
                duration: 300,
                ease: 'Back.easeOut'
            });
        }

        // 화려한 피드백 (화면 흔들림 크게 + 텍스트)
        this.cameras.main.shake(300, 0.02);
        this.cameras.main.flash(500, 255, 255, 255);
        window.gameManagers.soundManager.playSuccess();

        // 마일스톤 진동 (모바일 지원시)
        if (navigator.vibrate) {
            navigator.vibrate([200, 100, 200]);
        }

        this.uiElements.instruction.setText(`${this.currentFish.name}을(를) 잡았습니다!`);

        // 임시 파티클 폭죽 (스퀘어 모양)
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

        // 폭죽 파티클 텍스처 (하얀 원 모양)
        const g = this.make.graphics({ x: 0, y: 0, add: false });
        g.fillStyle(0xffffff);
        g.fillCircle(8, 8, 8);
        g.generateTexture('particleTexture', 16, 16);
        particles.setTexture('particleTexture');

        particles.explode(50); // 한 번 터뜨림

        // 물고기 종류에 따른 기본 보상
        const baseGold = this.currentFish.baseReward;

        let milestoneStoryData = null; // 마일스톤 달성 시 재생할 스토리 데이터

        // 도감(PlayerModel)에 추가 및 마일스톤(10, 20, 50마리) 체크 (특별 아이템은 제외)
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
                const titles10 = ['사냥꾼', '초보 학살자', '스토커', '단골손님', '원수'];
                title = titles10[Math.floor(Math.random() * titles10.length)];
                model.fishMilestonesSeen[fishId][10] = true;
            } else if (count === 20 && !model.fishMilestonesSeen[fishId][20]) {
                const titles20 = ['파멸의 인도자', '재앙', '포식자', '전문 사냥꾼', '공포의 대왕'];
                title = titles20[Math.floor(Math.random() * titles20.length)];
                model.fishMilestonesSeen[fishId][20] = true;
            } else if (count === 50 && !model.fishMilestonesSeen[fishId][50]) {
                const titles50 = ['씨를 말린 자', '멸종 위기 주범', '절대신', '마왕', '전설의 학살자'];
                title = titles50[Math.floor(Math.random() * titles50.length)];
                model.fishMilestonesSeen[fishId][50] = true;
            }

            if (title !== '') {
                model.notify(); // 저장
                if (count === 10) {
                    milestoneStoryData = [
                        { speaker: '상점 할아버지', portrait: 'char_shopkeeper', text: `허허! ${fishName}만 ${count}마리를 낚다니!\n너에게 [ ${fishName} ${title} ] 칭호를 주마!` },
                        { speaker: '정우', portrait: 'char_jeongwoo', text: `감사합니다! 제가 바로 ${fishName} ${title}입니다!!` }
                    ];
                } else if (count === 20) {
                    milestoneStoryData = [
                        { speaker: '아빠', portrait: 'char_dad', text: `정우야! 낚시 뉴스에 네 이름이 나왔단다!\n[ ${fishName} ${title} ] 이라고 부르더구나!` },
                        { speaker: '정우', portrait: 'char_jeongwoo', text: `헉! 텔레비전에 내가 나왔다고?! 대박!` }
                    ];
                } else if (count === 50) {
                    milestoneStoryData = [
                        { speaker: '세연', portrait: 'char_seyeon', text: `오빠! 동네 할아버지가 오빠보고\n[ ${fishName} ${title} ] 래! 무서워~` },
                        { speaker: '정우', portrait: 'char_jeongwoo', text: `크하하! 바다의 모든 ${fishName}은 내가 접수한다!` }
                    ];
                }
            } else if (count === 1 && FIRST_CATCH_STORIES[fishId]) {
                // 첫 획득 대사
                milestoneStoryData = FIRST_CATCH_STORIES[fishId];
            }

            // 보스 조우 대사가 최우선 적용 (마왕 1~3회차)
            if (isBossCatch) {
                const bCount = pm.bossDefeatedCount[this.region];
                // 1회, 2회, 3회차 대사 중 알맞은 것 선택. 3회 이후는 3회차 반복 또는 스킵
                if (BOSS_STORIES[this.region] && bCount <= 3) {
                    const storyIndex = Math.min(bCount - 1, 2);
                    milestoneStoryData = BOSS_STORIES[this.region][storyIndex];
                }
            }
        }

        // 2초 후 폭죽 파티클 제거 및 퀴즈 연동
        this.time.delayedCall(2000, async () => {
            particles.destroy();

            let finalGold = baseGold;
            if (isBossCatch) {
                finalGold = Math.floor(finalGold * bossRewardMultiplier);
                this.showFloatingNotice(`蹂댁뒪 蹂댁긽 x${bossRewardMultiplier.toFixed(1)}!`, '#ffb74d');
            }

            if (this.currentFish.isSpecialItem) {
                // 특별 아이템은 퀴즈를 진행하지 않고 즉시 보상 혹은 텍스트 판정
                if (this.currentFish.id === 'item_treasure') {
                    this.uiElements.instruction.setText('대박! 황금 보물상자를 낚았습니다!');
                    this.cameras.main.flash(500, 255, 215, 0);
                    window.gameManagers.soundManager.playSuccess();
                } else if (this.currentFish.id === 'item_treasure_map') {
                    this.uiElements.instruction.setText('오! 보물 지도의 한 조각이다! 어딘가에 보물이 숨겨져 있나봐!');
                    this.cameras.main.flash(500, 222, 184, 135);
                    window.gameManagers.soundManager.playSuccess();
                } else if (this.currentFish.id === 'item_pirates_sword') {
                    this.uiElements.instruction.setText('옛날 해적이 쓰던 녹슨 칼이네... 멋있다!');
                } else if (this.currentFish.id === 'item_pearl') {
                    this.uiElements.instruction.setText('와!! 엄청 큰 진주다!! 엄마한테 선물해야지!');
                    this.cameras.main.flash(500, 255, 250, 240);
                    window.gameManagers.soundManager.playSuccess();
                } else if (this.currentFish.id === 'item_crown') {
                    this.uiElements.instruction.setText('전설의 해적왕이 남긴 왕관!! 대박이다!!');
                    this.cameras.main.flash(800, 255, 215, 0);
                    window.gameManagers.soundManager.playSuccess();
                } else if (this.currentFish.id === 'item_shoe') {
                    const shoeMessages = [
                        '에구... 누군가 버린 낡은 신발이네요.',
                        '아이고~ 물고기인 줄 알았는데 낡은 장화였네요!',
                        '구멍 난 신발이 올라왔어요. 발 냄새가 나는 것 같아요!',
                        '낚싯줄에 웬 신발이? 바다에 쓰레기를 버리면 안 돼요!',
                        '앗! 짝 잃은 신발이네요. 나머지 한 짝은 어디 있을까요?'
                    ];
                    const randomMsg = shoeMessages[Math.floor(Math.random() * shoeMessages.length)];
                    this.uiElements.instruction.setText(randomMsg);
                } else if (this.currentFish.id === 'item_trash') {
                    const trashMessages = [
                        '앗... 빈 깡통을 낚았습니다. 바다를 깨끗하게!',
                        '찌글찌글한 고철 덩어리가 올라왔어요. 지구가 아파해요!',
                        '물고기 대신 쓰레기가... 바다를 더 아껴줘야겠어요.',
                        '이런! 바닷속에 쓰레기가 너무 많나 봐요.',
                        '어머나, 빈 병이 올라왔네요. 분리수거를 잘해야겠어요!',
                        '누가 먹다 버린 아이스크림 막대기네요. 개미들이 좋아하려나?',
                        '낡은 고무장갑 한 짝? 바다 요정이 설거지하다 놓쳤나 봐요!',
                        '바다거북인 줄 알았는데... 커다란 비닐봉지였어요!! 쓰레기 미워!',
                        '녹슨 바퀴 휠! 아빠 자동차 바퀴가 하나 없어졌는지 확인해봐야겠어요.',
                        '어라? 편지가 든 유리병 고물... "세연아 까까 사줘"라고 적혀있네요?'
                    ];
                    const randomMsg = trashMessages[Math.floor(Math.random() * trashMessages.length)];
                    this.uiElements.instruction.setText(randomMsg);
                }
            } else {
                // 50% 확률 수학 퀴즈 팝업 (UIManager 연동)
                const quizResult = await window.gameManagers.uiManager.showMathQuizSecondChance(this.region);
                let showTypingQuiz = false;

                if (quizResult && quizResult.correct) {
                    // 정답 시 20% 추가 보상
                    const mathBonusMultiplier = quizResult.attempt === 2 ? 1.1 : 1.2;
                    finalGold = Math.floor(finalGold * mathBonusMultiplier);
                    this.cameras.main.flash(300, 255, 215, 0); // 황금색 플래시 보너스 피드백

                    // 수학 퀴즈 맞춘 후 타이핑 퀴즈 (N등급 제외, 보물섬은 50%, 기본 35%)
                    const typingQuizChance = this.region === 4 ? 0.50 : 0.35;
                    if (this.currentFish.grade !== 'N' && Math.random() < typingQuizChance) {
                        showTypingQuiz = true;
                    }
                } else if (quizResult && !quizResult.correct) {
                    // 오답 시 50% 삭감
                    // No penalty on a missed quiz; just continue without the bonus.
                    this.cameras.main.shake(300, 0.02); // 오답 피드백 흔들림
                }

                // 타이핑 퀴즈 실행 (수학 퀴즈 정답 시 35% 확률)
                if (showTypingQuiz) {
                    const typingResult = await window.gameManagers.uiManager.showTypingQuiz();
                    if (typingResult) {
                        // 타이핑 퀴즈 정답 시 기존 보상값(finalGold)의 20% 추가 상승 (복리 계산)
                        finalGold = Math.floor(finalGold * 1.2);
                        this.cameras.main.flash(300, 255, 20, 147); // 핑크색 플래시 보너스 피드백
                    }
                }
            }

            // --- Rod Luck 보너스 코인 주머니 ---
            if (this.treasureIslandBuff && this.treasureIslandBuff.type === 'doubleReward' && this.treasureIslandBuff.remaining > 0) {
                finalGold *= 2;
                this.consumeTreasureIslandBuff();
                this.showFloatingNotice('蹂대Ъ???됰줉! 蹂댁긽 2諛?!', '#ffd54f');
                this.cameras.main.flash(300, 255, 235, 59);
            }

            const rodLuckLevel = window.gameManagers.playerModel.stats.rodLuck;
            const bonusChance = rodLuckLevel * 0.05; // 레벨당 5% 확률
            if (Math.random() < bonusChance) {
                const bonusGold = Phaser.Math.Between(20, 50 + rodLuckLevel * 10);
                finalGold += bonusGold;
                this.cameras.main.flash(200, 255, 255, 0);

                // 보너스 알림 텍스트
                const bonusText = this.add.text(this.scale.width / 2, this.scale.height * 0.4, `💰 보너스 코인 주머니! +${bonusGold}G`, {
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

            // 전역 PlayerModel에 골드 추가
            window.gameManagers.playerModel.addGold(finalGold);
            console.log(`획득 골드: ${finalGold} (현재 총합: ${window.gameManagers.playerModel.gold})`);

            // --- 획득 금액 플로팅 텍스트 애니메이션 추가 ---
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

            // --- 챕터 진행 및 중간 이벤트 체크 ---
            const model = window.gameManagers.playerModel;
            if (model.currentChapter <= 4) {
                if (model.checkChapterGoal()) {
                    // 목표 달성 시 챕터 전환
                    this.triggerStoryTransition();
                    return;
                } else {
                    // 목표액의 50% 달성 시 중간 격려 이벤트 (각 챕터별 1회)
                    const goal = model.chapterGoals[model.currentChapter];
                    if (model.gold >= goal / 2 && !model.hasSeenMidChapterEvent[model.currentChapter]) {
                        model.hasSeenMidChapterEvent[model.currentChapter] = true;
                        model.notify(); // 저장

                        let midStoryData = [];
                        if (model.currentChapter === 1) {
                            midStoryData = [
                                { speaker: '엄마', portrait: 'char_mom', text: '정우야~ 벌써 목표 금액의 반이나 모았네! 근데 밥은 언제 먹으러 올거니?' },
                                { speaker: '정우', portrait: 'char_jeongwoo', text: '물고기가 밥인데 무슨 소리세요 엄마! 좀만 더 잡을게요!' }
                            ];
                        } else if (model.currentChapter === 2) {
                            midStoryData = [
                                { speaker: '상점 할아버지', portrait: null, text: '허허, 꼬마야. 벌써 배 살 돈을 반이나 모았군. 대단혀~' },
                                { speaker: '정우', portrait: 'char_jeongwoo', text: '할아버지 조금만 기다리세요. 제가 여기 바다 씨를 말려버릴테니까요!' }
                            ];
                        } else if (model.currentChapter === 3) {
                            midStoryData = [
                                { speaker: '세연', portrait: 'char_seyeon', text: '오빠!! 까까 살 돈 반이나 모아써?!' },
                                { speaker: '정우', portrait: 'char_jeongwoo', text: '세연아, 원양어선에는 과자 공장이 통째로 실려있단다. 기다려라!!' }
                            ];
                        } else if (model.currentChapter === 4) {
                            midStoryData = [
                                { speaker: '아빠', portrait: 'char_dad', text: '(전화) 정우야! 보물섬에 갔다며?! 거기 위험하진 않고?' },
                                { speaker: '정우', portrait: 'char_jeongwoo', text: '아빠 괜찮아요! 저 여기서 대왕오징어도 봤어요!!' },
                                { speaker: '세연', portrait: 'char_seyeon', text: '오빠!! 보물 찾으면 나도 줘!!!' }
                            ];
                        }

                        // 이벤트를 보고 난 후 다시 GameScene으로 돌아오도록 설정
                        this.scene.start('StoryScene', {
                            storyData: midStoryData,
                            nextScene: 'GameScene',
                            nextSceneData: { region: this.region }
                        });
                        return;
                    }
                }
            }

            // --- 보물섬 전용 랜덤 이벤트 (5% 확률) ---
            if (this.region === 4 && !this.currentFish.isSpecialItem && Math.random() < 0.05) {
                this.triggerTreasureIslandEvent();
            }

            // --- 콤보 스토리 ---
            let comboStoryData = null;
            const cCount = window.gameManagers.playerModel.comboCount; // Use the updated comboCount

            if (cCount === 10) {
                comboStoryData = [
                    { speaker: '세연', portrait: 'char_seyeon', text: '오빠!! 10번이나 연속으로 올렸어!\n이따 편의점 데려가 줄 거지?!' },
                    { speaker: '정우', portrait: 'char_jeongwoo', text: '하하핫! 오늘 골든벨은 내가 울린다!' }
                ];
            } else if (cCount === 20) {
                comboStoryData = [
                    { speaker: '아빠', portrait: 'char_dad', text: '우리 정우 대단하구나!!\n20번 한 번도 안 놓치고 완벽해!' },
                    { speaker: '정우', portrait: 'char_jeongwoo', text: '히힛! 아빠한테 배운 기술 덕분이에요!' }
                ];
            } else if (cCount === 30) {
                comboStoryData = [
                    { speaker: '상점 할아버지', portrait: 'char_shopkeeper', text: '허허... 30연속 콤보라니...\n내 낡은 낚싯대가 명검이 되었구먼.' },
                    { speaker: '정우', portrait: 'char_jeongwoo', text: '할아버지! 저 이제 바다의 왕자라고 불러주세요!' }
                ];
            } else if (cCount >= 50 && cCount % 50 === 0) {
                comboStoryData = [
                    { speaker: '정우', portrait: 'char_jeongwoo', text: `우하하하!! 기적의 ${cCount}콤보!!\n바다에 있는 모든 고기들아 다 내게로 오라!!!` },
                    { speaker: '세연', portrait: 'char_seyeon', text: '오빠 너무 시끄러워~ 물고기 도망가겠다 쉿!' },
                    { speaker: '아빠', portrait: 'char_dad', text: '하하... 정우야 진정하렴. 동네 사람들 다 깨겠다.' },
                    { speaker: '상점 할아버지', portrait: 'char_shopkeeper', text: '허허... 젊다는 건 참 좋은 것이여.' }
                ];
            }

            // 마일스톤, 콤보 등 스토리 이벤트가 있으면 씬 전환 (보스/첫도감 보다 후순위)
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

    failFishing(msg = '물고기가 도망갔어요...') {
        this.gameState = 'IDLE';
        this.tweens.killTweensOf(this.uiElements.exclamation);
        this.tweens.killTweensOf(this.lure);
        this.uiElements.exclamation.setVisible(false);
        this.lure.setVisible(false);
        this.fish.setVisible(false);
        this.lineTension = 0;
        this.activeCatchBuff = null;
        this.clearApproachFishes();

        // UI 초기화
        this.uiElements.gaugeBg.setVisible(false);
        this.uiElements.gaugeBar.setVisible(false);
        this.uiElements.tensionBg.setVisible(false);
        this.uiElements.tensionBar.setVisible(false);
        this.uiElements.tensionWarn.setVisible(false);


        // 보스 타이머 숨김
        if (this.uiElements.bossTimerText) this.uiElements.bossTimerText.setVisible(false);

        // 콤보 리셋
        window.gameManagers.playerModel.comboCount = 0;
        if (this.uiElements.comboText) this.uiElements.comboText.setVisible(false);

        if (this.isFeverTime) this.endFeverTime();
        this.consecutiveFails++;

        // 보스전 패배 처리
        const pm = window.gameManagers.playerModel;
        if (this.isBossFight) {
            pm.bossFailed[this.region] = (pm.bossFailed[this.region] || 0) + 1;
            pm.notify();
            this.isBossFight = false;
            this.bossVariant = 'normal';
        }

        // 지역별 랜덤 실패 메시지 생성
        let finalMsg = msg;
        const randomChance = Math.random();

        // 약 40% 확률로 특수 메시지 출력 (기존 메시지가 있을 경우)
        if (randomChance < 0.4) {
            if (this.region === 1) {
                const freshMessages = [
                    '어라 오리가 잡아간건가?',
                    '똥새가 내걸 낚아챘어!',
                    '놓치고 주변을 둘러보니 새매가 옆에 있었다.',
                    '아 빵먹고싶다'
                ];
                finalMsg = freshMessages[Math.floor(Math.random() * freshMessages.length)];
            } else if (this.region === 4) {
                const treasureMessages = [
                    '해적 유령이 물고기를 가져갔어!',
                    '앗! 대왕문어 다리에 감겨서 놓쳤어!',
                    '바다 귀신이 방해한 거야! 분명히!',
                    '보물 지키는 수호신이 장난치나봐...',
                    '크라켄이 우리 물고기를 빼앗아갔어!!'
                ];
                finalMsg = treasureMessages[Math.floor(Math.random() * treasureMessages.length)];
            } else {
                const seaMessages = [
                    '아! 놓치고 보니 범고래였어!!',
                    '뭐지? 놓친 물고기가 아빠처럼 생긴 고기였어!!'
                ];
                finalMsg = seaMessages[Math.floor(Math.random() * seaMessages.length)];
            }
        }

        // 연속 실패 UI 피드백
        if (this.consecutiveFails >= 2) {
            const warnText = this.consecutiveFails >= 3
                ? '🔥 다음 낚시는 피버타임!'
                : `연속 실패 ${this.consecutiveFails}회...`;
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

    triggerTreasureIslandEvent() {
        const events = ['event_pirate', 'event_octopus', 'event_mermaid', 'event_rainbow', 'event_ghost'];
        const evId = events[Math.floor(Math.random() * events.length)];

        const pm = window.gameManagers.playerModel;
        pm.registerEventCard(evId);

        let evName = '';
        if (evId === 'event_pirate') evName = '멀리서 해적선 목격!';
        else if (evId === 'event_octopus') evName = '대왕문어의 이스터에그 파동!';
        else if (evId === 'event_mermaid') evName = '어디선가 인어의 노래가...';
        else if (evId === 'event_rainbow') evName = '밤하늘에 쌍무지개가 떴다!';
        else if (evId === 'event_ghost') evName = '유령선이 배회하고 있다...';

        this.uiElements.instruction.setText(`🃏 [이벤트 도감 달성] ${evName}`);
        this.cameras.main.flash(600, 138, 43, 226); // 보라색 플래시
        window.gameManagers.soundManager.playSuccess();
    }

    updateGoalText() {
        if (!this.uiElements.goalText) {
            this.uiElements.goalText = this.add.text(this.scale.width / 2, this.scale.height * 0.15, '', {
                fontSize: '24px', fontFamily: 'Arial', color: '#FFD700', stroke: '#000000', strokeThickness: 3
            }).setOrigin(0.5);
        }

        const model = window.gameManagers.playerModel;
        const currentGold = model.gold;

        // 모든 챕터 클리어
        if (model.highestChapter > 4) {
            this.uiElements.goalText.setText('🎉 모든 챕터 클리어! 상점에서 엔딩 아이템을 확인하세요!');
            return;
        }

        // 현재 플레이 중인 지역이 아직 미해금 프론티어 챕터일 때만 목표 표시
        if (this.region === model.currentChapter && model.currentChapter <= 4) {
            const goal = model.chapterGoals[model.currentChapter];
            const nextRegionNames = { 1: '연안 해금', 2: '먼 바다 해금', 3: '보물섬 해금', 4: '엔딩 해금' };
            const label = nextRegionNames[model.currentChapter] || '목표';
            const percent = Math.min(100, Math.floor((currentGold / goal) * 100));

            this.uiElements.goalText.setText(`🎯 ${label}: ${currentGold} / ${goal} G (${percent}%)`);
        } else if (this.region < model.currentChapter) {
            // 이미 클리어한 지역에서 자유 낚시 중
            this.uiElements.goalText.setText('✅ 이 지역은 클리어! 자유낚시 중~');
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
                { speaker: '세연', portrait: 'char_seyeon', text: '오빠!! 맛있는 까까 사왔어?! 진짜 맛있겠다 우와앙!' },
                { speaker: '정우', portrait: 'char_jeongwoo', text: '응! 오빠가 낚시에 소질이 있나봐. 더 멀리 나가서 큰 물고기를 잡아올게!' },
                { speaker: '엄마', portrait: 'char_mom', text: '정우야, 연안으로 가는 건 위험할 수도 있어. 조심해야 한단다.' },
                { speaker: '정우', portrait: 'char_jeongwoo', text: '헤헤, 걱정마세요 엄마! 더 멋진 낚싯대도 살 거예요!' }
            ];
        } else if (currentCh === 2) {
            storyData = [
                { speaker: '세연', portrait: 'char_seyeon', text: '오빠 이번엔 왕 큰 물고기 잡아왔네!! 최고야!' },
                { speaker: '엄마', portrait: 'char_mom', text: '어머, 우리 정우 정말 낚시 신동인가 보네. 오늘 저녁은 회 파티다!' },
                { speaker: '정우', portrait: 'char_jeongwoo', text: '이정도 쯤이야! 이제 진짜 먼 바다로 나가서 전설의 물고기를 낚아볼게!' }
            ];
        } else if (currentCh === 3) {
            storyData = [
                { speaker: '상점 할아버지', portrait: null, text: '정우야, 너 혹시 보물섬이라고 들어봤냐?' },
                { speaker: '정우', portrait: 'char_jeongwoo', text: '보물섬이요?! 그런 게 진짜 있어요?!' },
                { speaker: '상점 할아버지', portrait: null, text: '먼 바다 너머에 전설의 섬이 있다더라. 황금 물고기가 산다는...' },
                { speaker: '세연', portrait: 'char_seyeon', text: '오빠!! 황금 물고기 잡아와!! 반짝반짝!! ✨' },
                { speaker: '정우', portrait: 'char_jeongwoo', text: '좋아! 반드시 찾아내고 말겠어! 보물섬으로 출발!!' }
            ];
        } else if (currentCh === 4) {
            storyData = [
                { speaker: '정우', portrait: 'char_jeongwoo', text: '다 낚았다! 보물섬의 모든 물고기를 정복했어!!' },
                { speaker: '아빠', portrait: 'char_dad', text: '정우야, 아빠 휴가나왔다... 응? 보물섬까지 갔다고??' },
                { speaker: '정우', portrait: 'char_jeongwoo', text: '아빠! 저 황금 물고기도 잡았어요!! 전설이 진짜였어요!' },
                { speaker: '엄마', portrait: 'char_mom', text: '어머머... 우리 정우 정말 대단하구나!!' },
                { speaker: '세연', portrait: 'char_seyeon', text: '오빠 최고!! 이제 까까 잔뜩 사줘야돼!!' },
                { speaker: '아빠', portrait: 'char_dad', text: '하하, 우리 정우 이제 집으로 돌아오자! 축하한다 아들!!' }
            ];
        }

        // 축하 메시지 띄우기
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
                    // EndingScene으로 직행 (챕터 4 클리어시)
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

    // --- 보물섬 전용 랜덤 이벤트 시스템 ---
    triggerTreasureIslandEvent() {
        const events = [
            {
                name: '해적선 목격',
                emoji: '🏴‍☠️',
                message: '저기... 해적선이 보인다?! 보물이 떨어졌을지도!',
                effect: () => {
                    // 다음 1회 보상 2배 버프 (플래그 설정)
                    this.treasureIslandBuff = { type: 'doubleReward', remaining: 1 };
                }
            },
            {
                name: '대왕문어 습격',
                emoji: '🐙',
                message: '으악! 대왕문어가 배를 흔든다! 물고기가 놀라서 가까이 왔나봐!',
                effect: () => {
                    // 다음 1회 게이지 하락 면제 (3초)
                    this.treasureIslandBuff = { type: 'gaugeImmunity', remaining: 1, duration: 3000 };
                }
            },
            {
                name: '인어의 노래',
                emoji: '🧜‍♀️',
                message: '저 아름다운 노래는 뭐지...? 전설의 물고기가 가까이 온 것 같아!',
                effect: () => {
                    // 다음 1회 SSR 확률 3배 (플래그 설정)
                    this.treasureIslandBuff = { type: 'ssrBoost', remaining: 1 };
                }
            },
            {
                name: '무지개 출현',
                emoji: '🌈',
                message: '와! 바다 위에 무지개가 떴어!! 행운의 징조야!',
                effect: () => {
                    // 즉시 보너스 1000G
                    window.gameManagers.playerModel.addGold(1000);
                    this.updateGoalText();
                }
            }
            ,
            {
                name: '?좊졊??議곗슦',
                emoji: '?뫛',
                message: '?덇컻 ?띿뿉?쒕룄 ?좊졊?좎씠 吏?섍컯?듬땲?? ?ㅼ쓬 ???낆쭏媛 鍮좊Ⅴ寃? ?ㅼ뼱?ㅼ삱?ㅺ굔???숈븘??',
                effect: () => {
                    this.treasureIslandBuff = { type: 'gaugeImmunity', remaining: 1, duration: 4000 };
                }
            }
        ];

        const event = events[Math.floor(Math.random() * events.length)];
        const eventCardIds = {
            '?댁쟻??紐⑷꺽': 'event_pirate',
            '??뺣Ц???듦꺽': 'event_octopus',
            '?몄뼱???몃옒': 'event_mermaid',
            '臾댁?媛?異쒗쁽': 'event_rainbow',
            '?좊졊??議곗슦': 'event_ghost'
        };
        const eventCardId = eventCardIds[event.name];
        if (eventCardId) {
            window.gameManagers.playerModel.registerEventCard(eventCardId);
        }
        event.effect();

        // 이벤트 알림 텍스트 (화면 중심에 크게)
        const eventText = this.add.text(this.scale.width / 2, this.scale.height * 0.35,
            `${event.emoji} ${event.name}! ${event.emoji}`, {
            fontSize: '36px', fontFamily: 'Arial', color: '#FFD700',
            stroke: '#000000', strokeThickness: 6, fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(100);

        this.showFloatingNotice(event.message, '#FFFFFF', 0.42, '20px');

        this.cameras.main.flash(400, 255, 215, 0);
        window.gameManagers.soundManager.playSuccess();

        // 2.5초 후 자동 페이드아웃
        this.tweens.add({
            targets: [eventText],
            alpha: 0,
            y: eventText.y - 50,
            duration: 1000,
            delay: 2000,
            onComplete: () => { eventText.destroy(); }
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
        this.uiElements.instruction.setText(`${regionNames[this.region]}을 탭(클릭)해서 찌를 던지세요!`);
        this.updateGoalText();
        this.uiElements.gaugeBg.setVisible(false);
        this.uiElements.gaugeBar.setVisible(false);
        this.uiElements.tensionBg.setVisible(false);
        this.uiElements.tensionBar.setVisible(false);
        this.uiElements.tensionWarn.setVisible(false);
        if (this.uiElements.bossTimerText) this.uiElements.bossTimerText.setVisible(false);


        // 과녁 힌트 다시 표시 (위치 재설정)
        // 과녁 재설정 (repositionTargetRing이 알아서 배열을 갱신하고 화면에 표시함)
        this.repositionTargetRing();
    }

    update(time, delta) {
        // 물고기 실루엣 이동
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

        // CATCH 상태에서의 게이지 자연 감소 로직 및 미니게임 루프
        if (this.gameState === 'CATCH') {
            // 보스 타임 리밋 처리
            if (this.isBossFight) {
                this.bossTimer += delta;
                const timeLeft = Math.max(0, this.bossTimeLimit - (this.bossTimer / 1000));
                this.uiElements.bossTimerText.setText(`마왕 제한시간: ${timeLeft.toFixed(1)}초`);
                this.uiElements.bossTimerText.setVisible(true);

                if (timeLeft <= 0) {
                    this.failFishing('시간 초과! 마왕이 도망갔다...');
                    return;
                }
            }

            // --- Fever Time 타이머 ---
            if (this.isFeverTime) {
                this.feverTimeRemaining -= delta;
                if (this.feverTimeRemaining <= 0) {
                    this.endFeverTime();
                }
            }

            // 피버 타임이 아닐 때만 게이지 하락
            const hasGaugeImmunity = !!(this.activeCatchBuff && this.activeCatchBuff.type === 'gaugeImmunity' && this.activeCatchBuff.duration > 0);
            if (hasGaugeImmunity) {
                this.activeCatchBuff.duration -= delta;
                if (this.activeCatchBuff.duration <= 0) {
                    this.activeCatchBuff = null;
                }
            }

            if (!this.isFeverTime && !hasGaugeImmunity) {
                const reelLevel = window.gameManagers.playerModel.stats.reelSpeed;

                // 등급별로 방해 요소(게이지 하락률) 차등 적용
                let baseDrop = 15;
                if (this.currentFish.grade === 'R') baseDrop = 30;
                else if (this.currentFish.grade === 'SR') baseDrop = 60;
                else if (this.currentFish.grade === 'SSR') baseDrop = 100;

                // 보물섬(Region 4) 게이지 하락 강화
                if (this.region === 4) {
                    if (this.currentFish.grade === 'N') baseDrop = 25;
                    else if (this.currentFish.grade === 'R') baseDrop = 50;
                    else if (this.currentFish.grade === 'SR') baseDrop = 90;
                    else if (this.currentFish.grade === 'SSR') baseDrop = 150;
                }

                // 스탯 Reel Speed에 의해 초당 감소폭 완화 (레벨당 1.5 방어, Lv20 기준 30 방어 = 기존 Lv10)
                const dropRate = Math.max(5, baseDrop - (reelLevel * 1.5));

                // 0.3초 여유 시간 (catchGraceTimer) 적용
                if (this.catchGraceTimer > 0) {
                    this.catchGraceTimer -= delta;
                } else {
                    this.catchGauge -= (dropRate * (delta / 1000));
                }
            }

            // 장력(Tension) 자연 감소 (연타 안 하면 서서히 내려감)
            this.lineTension = Math.max(0, this.lineTension - 0.3 * (delta / 1000));

            // --- charge 미니게임: 누르고 있으면 게이지/텐션 상승 ---
            if (this.miniGameType === 'charge' && this.isCharging) {
                this.chargeTimer += delta;
                if (this.chargeTimer >= 100) { // 0.1초마다틱
                    this.chargeTimer = 0;
                    const powerLevel = window.gameManagers.playerModel.stats.rodPower;
                    const reelLevel = window.gameManagers.playerModel.stats.reelSpeed;
                    const fishDifficulty = this.currentFish.difficulty || 1.0;
                    // FishData.js의 generateFish 호출 (multiplier 인자 추가)
                    const caughtFish = window.gameManagers.fishData.generateFish(
                        this.region,
                        window.gameManagers.playerModel.stats.rodLuck,
                        this.comboCount,
                        this.castingBonus,
                        this.castingMultiplier || 1
                    );    // 연타(mash)의 ~30% 수준 진행도 (초 단위 환산시 초당 약 3배 빠름 -> 밸런스)
                    const progress = Math.max(3, (powerLevel * reelLevel) / fishDifficulty) * 0.4;

                    this.catchGauge += progress;

                    // 텐션 증가도 서서히 (0.1초당 0.04 -> 초당 0.4)
                    this.lineTension = Phaser.Math.Clamp(this.lineTension + 0.04, 0, 1);

                    const safeLimit = this.getTensionSafeLimit();
                    if (this.lineTension >= 0.95) {
                        this.cameras.main.shake(300, 0.03);
                        this.failFishing('앗! 줄이 끊어졌어요! 너무 세게 당겼나봐요...');
                        return;
                    } else if (this.lineTension >= safeLimit) {
                        this.uiElements.tensionWarn.setText('⚠️ 너무 세게! 줄이 끊어질 것 같아!');
                        this.uiElements.tensionWarn.setVisible(true);
                    } else {
                        this.uiElements.tensionWarn.setText('');
                    }
                    this.cameras.main.shake(50, 0.002);
                }
            }

            // --- 타이밍 게임 바 이동 ---
            if (this.miniGameType === 'timing') {
                const speed = 0.5 * (delta / 1000); // 초당 0.5 이동
                this.timingBarX += speed * this.timingBarDir;
                if (this.timingBarX > 1) { this.timingBarX = 1; this.timingBarDir = -1; }
                if (this.timingBarX < 0) { this.timingBarX = 0; this.timingBarDir = 1; }
            }

            if (this.catchGauge <= 0) {
                this.catchGauge = 0;
                // 하락해서 0이 되면 놓침
                this.cameras.main.zoomTo(1, 300);
                this.failFishing('놓쳤습니다...');
            } else if (this.catchGauge >= this.catchMax) {
                this.successFishing();
            } else {
                this.updateGaugeUI();
            }
        }

        // --- 스플라인 낚싯줄 그리기 (캐릭터 ~ 찌) ---
        this.fishingLine.clear();
        if (this.lure && this.lure.visible && this.character) {
            const rodTipX = this.character.x + 20;
            const rodTipY = this.character.y - 15;
            const lureX = this.lure.x;
            const lureY = this.lure.y;

            // 장력에 따라 곡률 계산 (0 = 직선, 1 = 크게 휘어짐)
            const tension = this.lineTension;
            const midX = (rodTipX + lureX) / 2;
            const midY = (rodTipY + lureY) / 2;
            // 장력이 높으면 활처럼 위로 휘어지고, 0이면 중력에 의해 아래로 처짐
            const sagAmount = tension > 0.1
                ? -60 * tension   // 위로 당겨짐 (활 모양)
                : 30;              // 중력 처짐
            const ctrlX = midX + (tension > 0.1 ? 20 * Math.sin(time * 0.01) : 0);
            const ctrlY = midY + sagAmount;

            // 선 색상도 장력에 따라 변화 (흰색 → 붉은색)
            const r = Math.floor(255);
            const g = Math.floor(255 * (1 - tension * 0.8));
            const b = Math.floor(255 * (1 - tension * 0.8));
            const lineColor = (r << 16) | (g << 8) | b;
            const lineWidth = 2 + tension * 3; // 장력 높을수록 굵게

            this.fishingLine.lineStyle(lineWidth, lineColor, 0.9);
            this.fishingLine.beginPath();
            this.fishingLine.moveTo(rodTipX, rodTipY);

            // Quadratic bezier curve로 스플라인 시뮬레이션
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
