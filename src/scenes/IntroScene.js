import { fitBackgroundCover } from '../utils/ImagePresentation.js';
import { getLateGameGoal } from '../data/LateGameContentData.js';

export default class IntroScene extends Phaser.Scene {
    // Helper to brighten a hex color (compatible with all Phaser 3 versions)
    brightenColor(color, amount) {
        const c = Phaser.Display.Color.ValueToColor(color);
        const r = Math.min(255, c.red + amount);
        const g = Math.min(255, c.green + amount);
        const b = Math.min(255, c.blue + amount);
        return (r << 16) | (g << 8) | b;
    }

    constructor() {
        super('IntroScene');
    }

    isModalOpen() {
        return typeof document !== 'undefined' && document.body.classList.contains('modal-open');
    }

    getIntroLayout(width, height) {
        const canvas = this.game.canvas.getBoundingClientRect();
        const header = document.getElementById('persistent-ui')?.getBoundingClientRect();
        const unit = canvas.width > 0 ? canvas.width / width : 1;
        const top = Math.max(0, header ? (header.bottom - canvas.top) / unit : 0) + 20 / unit;
        const bottom = height - 58 / unit;
        const titleSize = Math.min(54, Math.max(40, width * 0.072));
        const subSize = Math.min(30, Math.max(24, 14 / unit));
        const chapterHeight = Math.min(88, Math.max(70, 44 / unit));
        const chapterGap = 10 / unit;
        const menuHeight = chapterHeight;
        const menuGap = 10 / unit;
        return { unit, top, bottom, titleSize, subSize, chapterHeight, chapterGap, menuHeight, menuGap };
    }

    create() {
        const width = this.scale.width;
        const height = this.scale.height;

        // 배경음악 재생 (글로벌하게 한 번만)
        if (!this.sound.get('bgm')) {
            const bgm = this.sound.add('bgm', { loop: true, volume: 0.45 });
            bgm.play();
        } else if (!this.sound.get('bgm').isPlaying) {
            this.sound.get('bgm').play();
        }

        // 배경 적용 (타이틀용으로 bg_coast 사용하고 어둡게 처리)
        this.bg = this.add.image(width / 2, (height / 2) - 48, 'bg_coast');
        fitBackgroundCover(this.bg, width, height + 96);
        this.bg.setTint(0x777777); // 인트로 화면은 조금 어둡게

        const layout = this.getIntroLayout(width, height);
        const titleText = this.add.text(width / 2, 0, '정우의 낚시 대모험', {
            fontSize: `${layout.titleSize}px`,
            fontFamily: 'Arial',
            fontStyle: 'bold',
            color: '#FFFFFF',
            stroke: '#0055FF',
            strokeThickness: 12,
            shadow: { offsetX: 6, offsetY: 6, color: '#002277', blur: 0, stroke: true, fill: true },
            wordWrap: { width: width * 0.92 }
        }).setOrigin(0.5);
        const subtitle = this.add.text(width / 2, 0, '낚시할 지역을 선택하세요', {
            fontSize: `${layout.subSize}px`,
            fontFamily: 'Arial',
            color: '#FFFFFF',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);

        const titleHeight = titleText.getBounds().height;
        const subtitleHeight = subtitle.getBounds().height;

        // PlayerModel에서 현재 언락된 최고 챕터 가져오기
        const highestChapter = window.gameManagers.playerModel.highestChapter;
        const pm = window.gameManagers.playerModel;

        // 챕터 선택 버튼들 생성 (언락되지 않은 챕터는 비활성화/회색 처리)
        const chapters = [];
        const chapterNames = ['🌊 챕터 1: 민물', '⛱️ 챕터 2: 연안', '🐋 챕터 3: 바다', '🏴‍☠️ 챕터 4: 보물섬'];
        const chapterColors = [0x4CAF50, 0x2196F3, 0x3F51B5, 0x8B0000];

        // 진행 상태 안내 텍스트
        const noticeFontSize = `${Math.min(28, Math.max(22, 12 / layout.unit))}px`;
        const notices = [];
        if (pm.currentChapter <= 4) {
            const goal = pm.chapterGoals[pm.currentChapter];
            const nextNames = { 1: '연안', 2: '먼 바다', 3: '보물섬', 4: '엔딩' };
            const nextName = nextNames[pm.currentChapter] || '';
            const percent = Math.min(100, Math.floor((pm.gold / goal) * 100));
            notices.push(this.add.text(width / 2, 0, `🎯 ${nextName} 해금: ${pm.gold} / ${goal} G (${percent}%)`, {
                fontSize: noticeFontSize, fontFamily: 'Arial', color: '#FFD700',
                stroke: '#000', strokeThickness: 3, align: 'center',
                wordWrap: { width: width * 0.9 }
            }).setOrigin(0.5));
        } else {
            notices.push(this.add.text(width / 2, 0, '🎉 모든 챕터 클리어! 상점에서 엔딩 아이템을 확인하세요!', {
                fontSize: noticeFontSize, fontFamily: 'Arial', color: '#FFD700',
                stroke: '#000', strokeThickness: 3, align: 'center',
                wordWrap: { width: width * 0.9 }
            }).setOrigin(0.5));
        }

        const lateGoal = getLateGameGoal(pm);
        if (lateGoal) {
            notices.push(this.add.text(width / 2, 0, `다음 추천: ${lateGoal.title} · ${lateGoal.detail}`, {
                fontSize: `${Math.min(26, Math.max(20, 11 / layout.unit))}px`,
                fontFamily: 'Arial',
                color: '#fff4b1',
                stroke: '#000000',
                strokeThickness: 3,
                align: 'center',
                wordWrap: { width: width * 0.9 }
            }).setOrigin(0.5));
        }

        const noticeHeight = notices.reduce((sum, text) => sum + text.getBounds().height, 0)
            + Math.max(0, notices.length - 1) * 6;
        const chaptersHeight = chapterNames.length * layout.chapterHeight + (chapterNames.length - 1) * layout.chapterGap;
        const actionsHeight = 3 * layout.menuHeight + 2 * layout.menuGap;
        const contentHeight = titleHeight + subtitleHeight + chaptersHeight + noticeHeight + actionsHeight;
        const gap = Math.max(16 / layout.unit, (layout.bottom - layout.top - contentHeight) / 4);
        let cursor = layout.top;
        titleText.y = cursor + titleHeight / 2;
        this.tweens.add({
            targets: titleText,
            y: titleText.y - 4,
            duration: 1500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
        cursor += titleHeight + gap;
        subtitle.y = cursor + subtitleHeight / 2;
        cursor += subtitleHeight + gap;
        chapterNames.forEach((name, index) => {
            const unlocked = highestChapter >= index + 1;
            const y = cursor + layout.chapterHeight / 2;
            chapters.push(this.createChapterButton(width / 2, y, name, index + 1,
                unlocked ? chapterColors[index] : 0x555555, unlocked, layout.chapterHeight));
            cursor += layout.chapterHeight + layout.chapterGap;
        });
        cursor = cursor - layout.chapterGap + gap;
        notices.forEach((notice) => {
            const noticeHeight = notice.getBounds().height;
            notice.y = cursor + noticeHeight / 2;
            cursor += noticeHeight + 6;
        });
        const noticePanel = this.add.rectangle(width / 2,
            cursor - (notices.length ? noticeHeight + 6 : 0) + noticeHeight / 2,
            width * 0.94, noticeHeight + 12, 0x001522, 0.58).setDepth(1);
        notices.forEach((notice) => notice.setDepth(2));
        cursor = cursor - (notices.length ? 6 : 0) + gap;
        const actionStartY = cursor + layout.menuHeight / 2;
        // --- 기능 통합 버튼 리스트 (하단 배치) ---
        const actionConfigs = [
            {
                x: width * 0.28,
                y: actionStartY,
                label: '🌟 오늘 미션',
                color: 0x2aa7a7,
                delay: 0,
                onClick: () => window.gameManagers.uiManager.openDailyMissionPanel()
            },
            {
                x: width * 0.72,
                y: actionStartY,
                label: '🐟 포획 기록',
                color: 0xff8c00,
                delay: 140,
                onClick: () => window.gameManagers.uiManager.openFishMilestonePopup(this)
            },
            {
                x: width * 0.28,
                y: actionStartY + layout.menuHeight + layout.menuGap,
                label: '🧩 조합 도감',
                color: 0xff5a7a,
                delay: 280,
                onClick: () => window.gameManagers.uiManager.openComboBook()
            },
            {
                x: width * 0.72,
                y: actionStartY + layout.menuHeight + layout.menuGap,
                label: '🐠 내 수족관',
                color: 0x00bcd4,
                delay: 420,
                onClick: () => {
                    window.gameManagers.soundManager.playCoin();
                    this.cameras.main.fadeOut(300, 0, 0, 0);
                    this.cameras.main.once('camerafadeoutcomplete', () => {
                        this.scene.start('AquariumScene');
                    });
                }
            },
            {
                x: width * 0.72,
                y: actionStartY + 2 * (layout.menuHeight + layout.menuGap),
                label: '🃏 이벤트 도감',
                color: 0x7b4dd8,
                delay: 700,
                onClick: () => {
                    window.gameManagers.soundManager.playCoin();
                    window.gameManagers.uiManager.openEventCardBook();
                }
            },
            {
                x: width * 0.28,
                y: actionStartY + 2 * (layout.menuHeight + layout.menuGap),
                label: '💌 칭찬 앨범',
                color: 0xd26a8c,
                delay: 560,
                onClick: () => window.gameManagers.uiManager.openPraiseAlbum()
            }
        ];

        const actionButtons = [];
        actionConfigs.forEach((config) => {
            actionButtons.push(this.createMenuActionButton(config.x, config.y, config.label, config.color, config.onClick, config.delay, layout.menuHeight));
        });
        this.introElements = { title: titleText, subtitle, chapters, notices, actions: actionButtons };


        // --- 초기화 버튼 (좌측 하단) ---
        const resetBtnSize = width < 360 ? '14px' : '18px';
        const resetBtn = this.add.text(20, height - 30, '⚠️ 데이터 초기화', {
            fontSize: resetBtnSize,
            fontFamily: 'Arial',
            color: '#FFCCCC',
            backgroundColor: 'rgba(0,0,0,0.5)',
            padding: { x: 8, y: 5 }
        }).setOrigin(0, 0.5).setInteractive({ useHandCursor: true });

        resetBtn.on('pointerdown', () => {
            if (this.isModalOpen()) return;
            const firstConfirm = confirm("⚠️ 경고: 모든 게임 데이터(골드, 강화 능력치, 물고기 도감)가 영구적으로 삭제됩니다.\n정말로 초기화하시겠습니까?");
            if (firstConfirm) {
                const secondConfirm = confirm("다시 한번 확인합니다. 정말 모든 데이터를 지울까요? 이 작업은 취소할 수 없습니다.");
                if (secondConfirm) {
                    localStorage.removeItem('fishingGameData');
                    alert("데이터가 초기화되었습니다. 게임을 다시 시작합니다.");
                    window.location.reload();
                }
            }
        });

        resetBtn.on('pointerover', () => resetBtn.setTint(0xff0000));
        resetBtn.on('pointerout', () => resetBtn.clearTint());


    }

    createChapterButton(x, y, text, regionCode, color, isUnlocked, requestedHeight) {
        // Button size responsive to screen width (mobile optimized)
        const maxBtnWidth = 320; // Reduced from 400
        const minBtnWidth = 240;
        const btnWidth = Phaser.Math.Clamp(Math.round(this.scale.width * 0.8), minBtnWidth, maxBtnWidth);
        const btnHeight = requestedHeight;
        const pxPerWorld = this.game.canvas.getBoundingClientRect().width / this.scale.width || 1;
        const btnFontSize = `${Math.min(30, Math.max(26, 15 / pxPerWorld))}px`;


        // 버튼 컨테이너
        const button = this.add.container(x, y);

        // 버튼 배경 (둥근 사각형 느낌을 위해 Graphics 사용 또는 잘라낸 이미지 사용 가능, 여기선 단순 Rectangle)
        const bg = this.add.rectangle(0, 0, btnWidth, btnHeight, color)
            .setInteractive({
                useHandCursor: true,
                hitArea: new Phaser.Geom.Rectangle(-10, -10, btnWidth + 20, btnHeight + 20),
                hitAreaCallback: Phaser.Geom.Rectangle.Contains
            })
            .setStrokeStyle(4, 0xffffff);

        // 버튼 텍스트
        const btnText = this.add.text(0, 0, text, {
            fontSize: btnFontSize,
            fontFamily: 'Arial',
            color: '#FFFFFF',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        button.add([bg, btnText]);

        // 펄스 애니메이션 추가 ( Phraser Tween 사용)
        this.tweens.add({
            targets: button,
            scale: 1.02,
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        if (!isUnlocked) {
            // 잠긴 챕터: 상호작용 완전 비활성화
            bg.disableInteractive();

            // 어두운 반투명 오버레이
            const overlay = this.add.rectangle(0, 0, btnWidth, btnHeight, 0x000000, 0.5);
            button.add(overlay);

            // 큰 자물쇠 아이콘 (중앙 배치)
            const lockIcon = this.add.text(0, 0, '🔒', {
                fontSize: '40px'
            }).setOrigin(0.5);
            button.add(lockIcon);

            // 텍스트 흐리게
            btnText.setAlpha(0.4);
            return button; // 클릭 및 호버 이벤트 추가 안 함
        }

        // 호버 효과
        bg.on('pointerover', () => {
            const bright = this.brightenColor(color, 30);
            bg.setFillStyle(bright);
            this.tweens.add({ targets: button, scale: 1.05, duration: 100 });
        });

        bg.on('pointerout', () => {
            bg.setFillStyle(color);
            this.tweens.add({ targets: button, scale: 1.0, duration: 100 });
        });

        // 클릭 이벤트: 지역 코드를 들고 GameScene으로 진입
        bg.on('pointerdown', () => {
            if (this.isModalOpen()) return;
            window.gameManagers.soundManager.playCoin(); // 임시 효과음

            // 카메라 페이드 아웃 후 씬 전환
            this.cameras.main.fadeOut(500, 0, 0, 0);
            this.cameras.main.once('camerafadeoutcomplete', () => {
                // 게임 첫 진입 시 (highestChapter가 1이고 돈이 0일 때) 첫 스토리 재생
                if (regionCode === 1 && window.gameManagers.playerModel.gold === 0 && !window.gameManagers.playerModel.hasSeenFirstStory) {
                    window.gameManagers.playerModel.hasSeenFirstStory = true; // 중복 재생 방지
                    window.gameManagers.playerModel.notify(); // 저장

                    this.scene.start('StoryScene', {
                        storyData: [
                            { speaker: '아빠', portrait: 'char_dad', text: '정우야, 아빠는 나라를 지키러 부대로 간단다. 엄마랑 세연이 잘 부탁해!' },
                            { speaker: '엄마', portrait: 'char_mom', text: '여보, 조심히 다녀와요. 정우야, 엄마는 집안일을 해야 하니까 세연이랑 잘 놀아 주렴.' },
                            { speaker: '세연', portrait: 'char_seyeon', text: '오빠... 나 배고파... 맛있는 까까 사 먹고 싶어!!' },
                            { speaker: '정우', portrait: 'char_jeongwoo', text: '걱정 마, 세연아! 오빠가 낚시해서 물고기도 잡고 돈도 벌어 올게!!' }
                        ],
                        nextScene: 'GameScene',
                        nextSceneData: { region: regionCode }
                    });
                } else {
                    this.scene.start('GameScene', { region: regionCode });
                }
            });
        });
        return button;
    }

    createMenuActionButton(x, y, label, color, onClick, delay = 0, requestedHeight) {
        const buttonWidth = Phaser.Math.Clamp(Math.round(this.scale.width * 0.4), 260, 300);
        const buttonHeight = requestedHeight;
        const pxPerWorld = this.game.canvas.getBoundingClientRect().width / this.scale.width || 1;
        const fontSize = `${Math.min(32, Math.max(28, 16 / pxPerWorld))}px`;

        const container = this.add.container(x, y);
        const bg = this.add.rectangle(0, 0, buttonWidth, buttonHeight, color)
            .setStrokeStyle(4, 0xffffff)
            .setInteractive({ useHandCursor: true });
        const text = this.add.text(0, 0, label, {
            fontSize,
            fontFamily: 'Arial',
            fontStyle: 'bold',
            color: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);

        container.add([bg, text]);

        bg.on('pointerover', () => {
            bg.setFillStyle(this.brightenColor(color, 25));
            this.tweens.add({ targets: container, scale: 1.04, duration: 100 });
        });

        bg.on('pointerout', () => {
            bg.setFillStyle(color);
            this.tweens.add({ targets: container, scale: 1, duration: 100 });
        });

        bg.on('pointerdown', () => {
            if (this.isModalOpen()) return;
            onClick();
        });

        this.tweens.add({
            targets: container,
            scale: { from: 1, to: 1.05 },
            duration: 850,
            delay,
            yoyo: true,
            repeat: -1
        });

        return container;
    }
}
