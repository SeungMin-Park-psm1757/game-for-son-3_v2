import { saveGameData, loadGameData } from '../utils/Storage.js';

// 옵저버 패턴 및 데이터 저장을 위한 간단한 모델 클래스 (MVC 중 Model 역할)
export default class PlayerModel {
    constructor() {
        // 초기화 시 로컬 스토리지에서 데이터 로드
        const savedData = loadGameData('fishingGameData', null);

        if (savedData) {
            this.gold = savedData.gold;
            this.stats = savedData.stats;
            this.fishCollection = savedData.fishCollection || {};
            this.currentChapter = savedData.currentChapter || 1;
            this.highestChapter = savedData.highestChapter || 1;
            this.hasSeenFirstStory = savedData.hasSeenFirstStory || false;
            this.hasSeenMidChapterEvent = savedData.hasSeenMidChapterEvent || {};
            this.fishMilestonesSeen = savedData.fishMilestonesSeen || {};
            // --- 신규 필드: 간식/집 꾸미기 ---
            this.snacksPurchased = savedData.snacksPurchased || {};
            this.decorPurchased = savedData.decorPurchased || {};
            // --- 신규 필드: 이벤트 카드 도감 ---
            this.eventCards = savedData.eventCards || {};
            // --- 신규 필드: 보스 기록 ---
            this.bossDefeated = savedData.bossDefeated || {};
            this.bossFailed = savedData.bossFailed || {};
            this.bossDefeatedCount = savedData.bossDefeatedCount || {};
            // --- 신규 필드: MAX 레벨 격려 본 여부 ---
            this.maxLevelCelebrated = savedData.maxLevelCelebrated || {};
            this.allMaxCelebrated = savedData.allMaxCelebrated || false;
            // --- 신규 필드: 세연이 51개 이벤트 관람 여부 ---
            this.seyeonMaxEventSeen = savedData.seyeonMaxEventSeen || {};
            // --- 신규 필드: 최초 10분 쉬운 물고기 보호 시간 ---
            const hasProgress = (savedData.gold || 0) > 0 || Object.keys(this.fishCollection).length > 0;
            this.tutorialBoostEndsAt = savedData.tutorialBoostEndsAt ?? (hasProgress ? 0 : Date.now() + (10 * 60 * 1000));

            // --- Existing player stat migration: ensure focusRing exists ---
            if (this.stats && this.stats.focusRing === undefined) {
                this.stats.focusRing = 1;
            }
        } else {
            this.gold = 0;
            this.stats = {
                rodPower: 1,      // 클릭 1회당 오르는 게이지
                catchChance: 1,   // 입질 확률 증가 (기본 대기시간 단축)
                reelSpeed: 1,     // 연타 효율 강화 혹은 자동 게이지 하락 방지
                rodLuck: 1,       // 희귀 보상 획득 확률
                focusRing: 1      // 찌 던질 때 과녁 크기 복구 (기본 1/3, 최대 3)
            };
            this.fishCollection = {};
            this.currentChapter = 1;
            this.highestChapter = 1;
            this.hasSeenFirstStory = false;
            this.hasSeenMidChapterEvent = {};
            this.fishMilestonesSeen = {};
            this.snacksPurchased = {};
            this.decorPurchased = {};
            this.eventCards = {};
            this.bossDefeated = {};
            this.bossFailed = {};
            this.bossDefeatedCount = {};
            this.maxLevelCelebrated = {};
            this.allMaxCelebrated = false;
            this.seyeonMaxEventSeen = {};
            this.tutorialBoostEndsAt = Date.now() + (10 * 60 * 1000);

        }
        this.listeners = [];

        // 세션 한정 상태 (저장하지 않음)
        this.comboCount = 0;

        // 챕터별 목표 금액
        this.chapterGoals = {
            1: 2000,
            2: 5500,
            3: 13000,
            4: 26000
        };
    }

    // 상태 변화를 UI에 알리기 위한 옵저버 메서드
    subscribe(callback) {
        this.listeners.push(callback);
    }

    notify() {
        // 상태가 변할 때마다 옵저버에게 알리고, 로컬 스토리지에 자동 저장
        this.listeners.forEach(cb => cb(this));

        saveGameData('fishingGameData', {
            gold: this.gold,
            stats: this.stats,
            fishCollection: this.fishCollection,
            currentChapter: this.currentChapter,
            highestChapter: this.highestChapter,
            hasSeenFirstStory: this.hasSeenFirstStory,
            hasSeenMidChapterEvent: this.hasSeenMidChapterEvent,
            fishMilestonesSeen: this.fishMilestonesSeen,
            snacksPurchased: this.snacksPurchased,
            decorPurchased: this.decorPurchased,
            eventCards: this.eventCards,
            bossDefeated: this.bossDefeated,
            bossFailed: this.bossFailed,
            bossDefeatedCount: this.bossDefeatedCount,
            maxLevelCelebrated: this.maxLevelCelebrated,
            allMaxCelebrated: this.allMaxCelebrated,
            seyeonMaxEventSeen: this.seyeonMaxEventSeen,
            tutorialBoostEndsAt: this.tutorialBoostEndsAt

        });
    }

    // 챕터 진행 목표 달성 여부 확인
    checkChapterGoal() {
        if (this.currentChapter > 4) return false; // 이미 엔딩 봄
        const goal = this.chapterGoals[this.currentChapter];
        return this.gold >= goal;
    }

    advanceChapter() {
        if (this.currentChapter <= 4) {
            this.currentChapter++;
            if (this.currentChapter > this.highestChapter) {
                this.highestChapter = this.currentChapter;
            }
            this.notify();
        }
    }

    addGold(amount) {
        this.gold += amount;
        this.notify();
    }

    addFish(fishId) {
        if (!this.fishCollection[fishId]) {
            this.fishCollection[fishId] = 0;
        }
        this.fishCollection[fishId] += 1;
        this.notify();
    }

    isTutorialBoostActive() {
        return !!this.tutorialBoostEndsAt && Date.now() < this.tutorialBoostEndsAt;
    }

    upgradeStat(statName, cost) {
        const MAX_LEVELS = {
            rodPower: 20,
            catchChance: 10,
            reelSpeed: 20,
            rodLuck: 5,
            focusRing: 3
        };

        const currentLevel = this.stats[statName];

        if (currentLevel >= MAX_LEVELS[statName]) {
            return false; // 이미 최대 레벨
        }

        if (this.gold >= cost && currentLevel !== undefined) {
            this.gold -= cost;
            this.stats[statName] += 1;
            this.notify();
            return true;
        }
        return false;
    }

    // 이벤트 카드 등록
    registerEventCard(cardId) {
        if (!this.eventCards[cardId]) {
            this.eventCards[cardId] = {
                discovered: true,
                firstSeenDate: new Date().toISOString(),
                count: 1
            };
        } else {
            this.eventCards[cardId].count = (this.eventCards[cardId].count || 0) + 1;
        }
        this.notify();
    }

    // 간식/집 꾸미기 구매
    purchaseSnack(snackId, cost) {
        if (this.gold >= cost) {
            this.gold -= cost;
            this.snacksPurchased[snackId] = (this.snacksPurchased[snackId] || 0) + 1;
            this.notify();
            return true;
        }
        return false;
    }

    purchaseDecor(decorId, cost) {
        if (this.gold >= cost) {
            this.gold -= cost;
            this.decorPurchased[decorId] = (this.decorPurchased[decorId] || 0) + 1;
            this.notify();
            return true;
        }
        return false;
    }

    // --- 치트 기능: 모든 물고기 잡은 횟수 설정 ---
    cheatSetAllFish(fishIds, count = 8) {
        fishIds.forEach(id => {
            this.fishCollection[id] = count;
        });
        this.notify();
    }

}

