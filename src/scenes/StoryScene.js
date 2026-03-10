export default class StoryScene extends Phaser.Scene {
    constructor() {
        super('StoryScene');
    }

    init(data) {
        // data.storyData: 배열 오브젝트 [{speaker: '...', portrait: '...', text: '...'}, ...]
        // data.nextScene: 이동할 씬 ('GameScene' or 'IntroScene' 등)
        // data.nextSceneData: 이동할 씬에 전달할 데이터 (region, 챕터 진행상황 등)
        this.storyData = data.storyData || [];
        this.nextScene = data.nextScene || 'IntroScene';
        this.nextSceneData = data.nextSceneData || {};

        this.currentDialogIndex = 0;
    }

    create() {
        const width = this.scale.width;
        const height = this.scale.height;

        // 배경 이미지 (가족이 있는 집 분위기 — 게임 배경을 어둡고 따뜻하게 처리)
        this.bg = this.add.image(width / 2, height / 2, 'bg_freshwater');
        this.bg.setDisplaySize(width, height);
        this.bg.setTint(0x665544); // 따뜻한 갈색 톤으로 어둡게

        // 반투명 오버레이 (대화에 집중할 수 있도록)
        this.add.rectangle(0, 0, width, height, 0x000000, 0.4).setOrigin(0, 0);

        // 초상화 이미지 객체 (512x512 표준 크기 기반)
        this.portraitImage = this.add.image(width * 0.22, height * 0.48, 'char_jeongwoo');
        this.portraitImage.setScale(0.45);
        this.portraitImage.setVisible(false);

        // 대화상자 UI 디자인
        const dialogBoxWidth = width * 0.8;
        const dialogBoxHeight = height * 0.3;
        const dialogBoxX = width / 2;
        const dialogBoxY = height * 0.8;

        this.dialogBg = this.add.rectangle(dialogBoxX, dialogBoxY, dialogBoxWidth, dialogBoxHeight, 0x000000, 0.8)
            .setStrokeStyle(4, 0xffffff);

        // 발화자 이름 표시 (대화상자 왼쪽 위)
        this.speakerText = this.add.text(dialogBoxX - dialogBoxWidth / 2 + 20, dialogBoxY - dialogBoxHeight / 2 - 40, '', {
            fontSize: '32px',
            fontFamily: 'Arial',
            color: '#FFD700',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0, 0);

        // 대화 내용
        this.dialogText = this.add.text(dialogBoxX - dialogBoxWidth / 2 + 40, dialogBoxY - dialogBoxHeight / 2 + 30, '', {
            fontSize: '28px',
            fontFamily: 'Arial',
            color: '#FFFFFF',
            wordWrap: { width: dialogBoxWidth - 80 },
            lineSpacing: 10
        }).setOrigin(0, 0);

        // 건너뛰기 버튼 (위치 하향 조정: 24, 80 - 모바일 노치 회피)
        const skipBtn = this.add.text(24, 80, '⏭️ 건너뛰기', {
            fontSize: '20px',
            fontFamily: 'Arial',
            color: '#FFFFFF',
            backgroundColor: 'rgba(0,0,0,0.5)',
            padding: { x: 10, y: 5 },
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0, 0).setInteractive({ useHandCursor: true });

        skipBtn.on('pointerdown', () => {
            // 건너뛰기는 딜레이 없이 즉시 종료
            window.gameManagers.soundManager.playCoin(); // 효과음
            this.endStory();
        });
        skipBtn.on('pointerover', () => skipBtn.setTint(0xaaaaaa));
        skipBtn.on('pointerout', () => skipBtn.clearTint());

        // 클릭 안내 텍스트
        this.nextIndicator = this.add.text(dialogBoxX + dialogBoxWidth / 2 - 20, dialogBoxY + dialogBoxHeight / 2 - 20, '▼ 클릭해서 다음으로', {
            fontSize: '20px',
            fontFamily: 'Arial',
            color: '#AAAAAA'
        }).setOrigin(1, 1);

        // 애니메이션 통통 튀는 효과
        this.tweens.add({
            targets: this.nextIndicator,
            y: dialogBoxY + dialogBoxHeight / 2 - 10,
            yoyo: true,
            repeat: -1,
            duration: 500
        });

        // 이벤트 시작 시간 기록 (무의식적 클릭 방지용)
        this.sceneStartTime = this.time.now;

        // 씬 클릭 시 다음 대사로 넘어가기
        this.input.on('pointerdown', () => {
            // 씬 시작 후 1초(1000ms) 이내의 클릭은 무시 (무의식적 터치 방지)
            if (this.time.now - this.sceneStartTime < 1000) return;

            // 짧은 연타 방지 디바운싱
            if (this.time.now - (this.lastClick || 0) < 200) return;
            this.lastClick = this.time.now;

            this.advanceDialog();
        });

        // 첫 대사 표시
        this.showCurrentDialog();
    }

    showCurrentDialog() {
        if (this.currentDialogIndex >= this.storyData.length) {
            // 스토리 종료
            this.endStory();
            return;
        }

        const data = this.storyData[this.currentDialogIndex];

        // 텍스트와 초상화 업데이트
        this.speakerText.setText(data.speaker);
        this.dialogText.setText(data.text);

        if (data.portrait && this.textures.exists(data.portrait)) {
            this.portraitImage.setTexture(data.portrait);
            this.portraitImage.setVisible(true);

            // 초상화 시각적 크기 고정 (512 기준 0.45배 = 약 230px)
            const targetPortraitSize = 230;
            const targetScale = targetPortraitSize / this.portraitImage.width;

            // 등장 애니메이션
            this.portraitImage.setScale(targetScale * 0.88);
            this.tweens.add({
                targets: this.portraitImage,
                scale: targetScale,
                duration: 250,
                ease: 'Back.easeOut'
            });
        } else {
            this.portraitImage.setVisible(false);
        }

        // 재밌는 연출: 화자에 따라 간단한 효과음 재생 가능
        window.gameManagers.soundManager.playTapping();
    }

    advanceDialog() {
        this.currentDialogIndex++;
        this.showCurrentDialog();
    }

    endStory() {
        // 스토리 종료 후 다음 씬으로 전환
        this.input.off('pointerdown'); // 클릭 이벤트 해제

        // 페이드 아웃 후 전환
        this.cameras.main.fadeOut(500, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => {
            if (this.nextSceneData && this.nextSceneData.isOverlay) {
                this.scene.stop();
                if (window.gameManagers._phaserGame) {
                    window.gameManagers._phaserGame.scene.resume(this.nextScene);
                    if (this.nextSceneData.onClose) {
                        this.nextSceneData.onClose();
                    }
                }
            } else {
                this.scene.start(this.nextScene, this.nextSceneData);
            }
        });
    }
}
