import { saveGameData, loadGameData } from '../utils/Storage.js';
import {
    COMBO_BOOK_ENTRIES,
    getComboEntryById,
    getRecommendedComboGoalIds,
    isComboCompleted
} from '../data/ComboBookData.js';
import {
    getCollectorTitle,
    getUnlockedCollectionStamps,
    processCollectionStampUnlocks
} from '../data/CollectionStampData.js';
import {
    AQUARIUM_TANK_UPGRADES,
    SPECIAL_BAIT_BY_ID
} from '../data/LateGameContentData.js';

const SAVE_KEY = 'fishingGameData';
const TUTORIAL_BOOST_DURATION_MS = 5 * 60 * 1000;

export default class PlayerModel {
    constructor() {
        const savedData = loadGameData(SAVE_KEY, null);
        const now = Date.now();

        if (savedData) {
            this.gold = savedData.gold ?? 0;
            this.stats = {
                rodPower: savedData.stats?.rodPower ?? 1,
                catchChance: savedData.stats?.catchChance ?? 1,
                reelSpeed: savedData.stats?.reelSpeed ?? 1,
                rodLuck: savedData.stats?.rodLuck ?? 1,
                focusRing: savedData.stats?.focusRing ?? 1
            };
            this.fishCollection = savedData.fishCollection || {};
            this.currentChapter = savedData.currentChapter || 1;
            this.highestChapter = savedData.highestChapter || 1;
            this.hasSeenFirstStory = savedData.hasSeenFirstStory || false;
            this.hasSeenMidChapterEvent = savedData.hasSeenMidChapterEvent || {};
            this.fishMilestonesSeen = savedData.fishMilestonesSeen || {};
            this.snacksPurchased = savedData.snacksPurchased || {};
            this.decorPurchased = savedData.decorPurchased || {};
            this.eventCards = savedData.eventCards || {};
            this.bossDefeated = savedData.bossDefeated || {};
            this.bossFailed = savedData.bossFailed || {};
            this.bossDefeatedCount = savedData.bossDefeatedCount || {};
            this.maxLevelCelebrated = savedData.maxLevelCelebrated || {};
            this.allMaxCelebrated = savedData.allMaxCelebrated || false;
            this.seyeonMaxEventSeen = savedData.seyeonMaxEventSeen || {};
            this.comboBook = savedData.comboBook || {};
            this.activeComboGoals = savedData.activeComboGoals || [];
            this.specialSnackFedCount = savedData.specialSnackFedCount || 0;
            this.snackUsageCounts = savedData.snackUsageCounts || {};
            this.specialSnackBehaviorsSeen = savedData.specialSnackBehaviorsSeen || {};
            this.aquariumMomentsSeen = savedData.aquariumMomentsSeen || {};
            this.collectionStamps = savedData.collectionStamps || {};
            this.baitInventory = savedData.baitInventory || {};
            this.selectedBaitId = savedData.selectedBaitId || null;
            this.baitUsageCounts = savedData.baitUsageCounts || {};
            this.aquariumTankLevel = savedData.aquariumTankLevel || 1;
            this.honorTrophies = savedData.honorTrophies || {};
            this.lastAquariumSnackAt = savedData.lastAquariumSnackAt || 0;
            this.lastAquariumVisitAt = savedData.lastAquariumVisitAt || 0;
            this.firstPlayStartedAt = savedData.firstPlayStartedAt || now;
            this.tutorialBoostEndsAt = savedData.tutorialBoostEndsAt ?? (this.firstPlayStartedAt + TUTORIAL_BOOST_DURATION_MS);
        } else {
            this.gold = 0;
            this.stats = {
                rodPower: 1,
                catchChance: 1,
                reelSpeed: 1,
                rodLuck: 1,
                focusRing: 1
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
            this.comboBook = {};
            this.activeComboGoals = [];
            this.specialSnackFedCount = 0;
            this.snackUsageCounts = {};
            this.specialSnackBehaviorsSeen = {};
            this.aquariumMomentsSeen = {};
            this.collectionStamps = {};
            this.baitInventory = {};
            this.selectedBaitId = null;
            this.baitUsageCounts = {};
            this.aquariumTankLevel = 1;
            this.honorTrophies = {};
            this.lastAquariumSnackAt = 0;
            this.lastAquariumVisitAt = 0;
            this.firstPlayStartedAt = now;
            this.tutorialBoostEndsAt = now + TUTORIAL_BOOST_DURATION_MS;
        }

        this.listeners = [];
        this.comboCount = 0;
        this.chapterGoals = {
            1: 2000,
            2: 5500,
            3: 13000,
            4: 26000
        };

        const lateGameStateChanged = this.normalizeLateGameState();
        const goalStateChanged = this.ensureActiveComboGoals();
        const needsMigrationSave = !savedData ||
            savedData.firstPlayStartedAt === undefined ||
            savedData.tutorialBoostEndsAt === undefined ||
            savedData.comboBook === undefined ||
            savedData.activeComboGoals === undefined ||
            savedData.specialSnackFedCount === undefined ||
            savedData.snackUsageCounts === undefined ||
            savedData.specialSnackBehaviorsSeen === undefined ||
            savedData.aquariumMomentsSeen === undefined ||
            savedData.collectionStamps === undefined ||
            savedData.baitInventory === undefined ||
            savedData.selectedBaitId === undefined ||
            savedData.baitUsageCounts === undefined ||
            savedData.aquariumTankLevel === undefined ||
            savedData.honorTrophies === undefined ||
            savedData.lastAquariumSnackAt === undefined ||
            savedData.lastAquariumVisitAt === undefined ||
            lateGameStateChanged ||
            goalStateChanged;

        if (needsMigrationSave) {
            this.persist();
        }
    }

    subscribe(callback) {
        this.listeners.push(callback);
    }

    persist() {
        saveGameData(SAVE_KEY, {
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
            comboBook: this.comboBook,
            activeComboGoals: this.activeComboGoals,
            specialSnackFedCount: this.specialSnackFedCount,
            snackUsageCounts: this.snackUsageCounts,
            specialSnackBehaviorsSeen: this.specialSnackBehaviorsSeen,
            aquariumMomentsSeen: this.aquariumMomentsSeen,
            collectionStamps: this.collectionStamps,
            baitInventory: this.baitInventory,
            selectedBaitId: this.selectedBaitId,
            baitUsageCounts: this.baitUsageCounts,
            aquariumTankLevel: this.aquariumTankLevel,
            honorTrophies: this.honorTrophies,
            lastAquariumSnackAt: this.lastAquariumSnackAt,
            lastAquariumVisitAt: this.lastAquariumVisitAt,
            firstPlayStartedAt: this.firstPlayStartedAt,
            tutorialBoostEndsAt: this.tutorialBoostEndsAt
        });
    }

    notify() {
        this.listeners.forEach((callback) => callback(this));
        this.persist();
    }

    normalizeLateGameState() {
        let changed = false;
        const ensurePlainObject = (value) => {
            if (!value || typeof value !== 'object' || Array.isArray(value)) {
                changed = true;
                return {};
            }
            return value;
        };

        this.baitInventory = ensurePlainObject(this.baitInventory);
        this.baitUsageCounts = ensurePlainObject(this.baitUsageCounts);
        this.honorTrophies = ensurePlainObject(this.honorTrophies);

        Object.keys(this.baitInventory).forEach((baitId) => {
            const count = Number(this.baitInventory[baitId]) || 0;
            if (!SPECIAL_BAIT_BY_ID[baitId] || count <= 0) {
                delete this.baitInventory[baitId];
                changed = true;
            } else if (this.baitInventory[baitId] !== count) {
                this.baitInventory[baitId] = count;
                changed = true;
            }
        });

        if (this.selectedBaitId && (!SPECIAL_BAIT_BY_ID[this.selectedBaitId] || (this.baitInventory[this.selectedBaitId] || 0) <= 0)) {
            this.selectedBaitId = null;
            changed = true;
        }

        const maxTankLevel = AQUARIUM_TANK_UPGRADES.length;
        const normalizedTankLevel = Math.max(1, Math.min(maxTankLevel, Number(this.aquariumTankLevel) || 1));
        if (this.aquariumTankLevel !== normalizedTankLevel) {
            this.aquariumTankLevel = normalizedTankLevel;
            changed = true;
        }

        return changed;
    }

    checkChapterGoal() {
        if (this.currentChapter > 4) return false;
        const goal = this.chapterGoals[this.currentChapter];
        return this.gold >= goal;
    }

    advanceChapter() {
        if (this.currentChapter <= 4) {
            this.currentChapter += 1;
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
        const maxLevels = {
            rodPower: 20,
            catchChance: 10,
            reelSpeed: 20,
            rodLuck: 5,
            focusRing: 3
        };

        const currentLevel = this.stats[statName];
        if (currentLevel >= maxLevels[statName]) {
            return false;
        }

        if (this.gold >= cost && currentLevel !== undefined) {
            this.gold -= cost;
            this.stats[statName] += 1;
            this.notify();
            return true;
        }
        return false;
    }

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

    purchaseBait(baitId, cost) {
        if (this.gold >= cost) {
            this.gold -= cost;
            this.baitInventory[baitId] = (this.baitInventory[baitId] || 0) + 1;
            this.selectedBaitId = baitId;
            this.notify();
            return true;
        }
        return false;
    }

    selectBait(baitId) {
        if (!baitId) {
            this.selectedBaitId = null;
            this.notify();
            return true;
        }

        if ((this.baitInventory?.[baitId] || 0) <= 0) {
            return false;
        }

        this.selectedBaitId = baitId;
        this.notify();
        return true;
    }

    consumeSelectedBait() {
        const baitId = this.selectedBaitId;
        if (!baitId) {
            return null;
        }

        if ((this.baitInventory?.[baitId] || 0) <= 0) {
            this.selectedBaitId = null;
            this.notify();
            return null;
        }

        this.baitInventory[baitId] -= 1;
        if (this.baitInventory[baitId] <= 0) {
            delete this.baitInventory[baitId];
            this.selectedBaitId = null;
        }
        this.baitUsageCounts[baitId] = (this.baitUsageCounts[baitId] || 0) + 1;
        this.notify();
        return baitId;
    }

    purchaseAquariumTank(level, cost) {
        if (level <= (this.aquariumTankLevel || 1)) {
            return false;
        }

        if (level !== (this.aquariumTankLevel || 1) + 1) {
            return false;
        }

        if (this.gold >= cost) {
            this.gold -= cost;
            this.aquariumTankLevel = level;
            this.notify();
            return true;
        }
        return false;
    }

    purchaseHonorTrophy(trophyId, cost) {
        if (this.honorTrophies?.[trophyId]) {
            return false;
        }

        if (this.gold >= cost) {
            this.gold -= cost;
            this.honorTrophies[trophyId] = {
                purchasedAt: new Date().toISOString()
            };
            this.notify();
            return true;
        }
        return false;
    }

    consumeSnack(snackId, amount = 1) {
        if (!this.snacksPurchased[snackId] || this.snacksPurchased[snackId] < amount) {
            return false;
        }

        this.snacksPurchased[snackId] -= amount;
        if (this.snacksPurchased[snackId] <= 0) {
            delete this.snacksPurchased[snackId];
        }
        this.notify();
        return true;
    }

    useSnack(snackId, amount = 1) {
        if (!this.snacksPurchased[snackId] || this.snacksPurchased[snackId] < amount) {
            return false;
        }

        this.snacksPurchased[snackId] -= amount;
        if (this.snacksPurchased[snackId] <= 0) {
            delete this.snacksPurchased[snackId];
        }
        this.specialSnackFedCount += amount;
        this.snackUsageCounts[snackId] = (this.snackUsageCounts[snackId] || 0) + amount;
        this.lastAquariumSnackAt = Date.now();
        this.notify();
        return true;
    }

    useSpecialSnack(snackId, amount = 1) {
        return this.useSnack(snackId, amount);
    }

    getSnackUsageCount(snackId) {
        return this.snackUsageCounts?.[snackId] || 0;
    }

    markSnackBehaviorSeen(behaviorId) {
        if (this.specialSnackBehaviorsSeen[behaviorId]) {
            return false;
        }
        this.specialSnackBehaviorsSeen[behaviorId] = true;
        this.notify();
        return true;
    }

    markAquariumMomentSeen(momentId) {
        if (this.aquariumMomentsSeen[momentId]) {
            return false;
        }
        this.aquariumMomentsSeen[momentId] = true;
        this.notify();
        return true;
    }

    markAquariumVisit() {
        this.lastAquariumVisitAt = Date.now();
        this.persist();
    }

    getUnlockedDecorCount() {
        return Object.values(this.decorPurchased || {}).filter((count) => count > 0).length;
    }

    getUnlockedCollectionStamps() {
        return getUnlockedCollectionStamps(this);
    }

    getCollectorTitle() {
        return getCollectorTitle(this);
    }

    ensureActiveComboGoals(count = 3) {
        const validGoalIds = (this.activeComboGoals || []).filter((comboId) => {
            const entry = getComboEntryById(comboId);
            if (!entry) return false;
            return !(this.comboBook[comboId]?.discovered);
        });

        let changed = validGoalIds.length !== (this.activeComboGoals || []).length;
        const recommended = getRecommendedComboGoalIds(this, count);

        for (const comboId of recommended) {
            if (validGoalIds.length >= count) break;
            if (!validGoalIds.includes(comboId)) {
                validGoalIds.push(comboId);
                changed = true;
            }
        }

        const nextGoals = validGoalIds.slice(0, count);
        if (!changed && nextGoals.length === (this.activeComboGoals || []).length) {
            const oldGoals = this.activeComboGoals || [];
            changed = nextGoals.some((comboId, index) => comboId !== oldGoals[index]);
        }

        this.activeComboGoals = nextGoals;
        return changed;
    }

    processComboUnlocks() {
        const unlocked = [];
        let rewardTotal = 0;

        COMBO_BOOK_ENTRIES.forEach((entry) => {
            const alreadyDiscovered = !!this.comboBook[entry.id]?.discovered;
            if (alreadyDiscovered || !isComboCompleted(entry, this)) {
                return;
            }

            this.comboBook[entry.id] = {
                discovered: true,
                discoveredAt: new Date().toISOString(),
                reward: entry.reward
            };
            this.gold += entry.reward;
            rewardTotal += entry.reward;
            unlocked.push(entry);
        });

        const goalStateChanged = this.ensureActiveComboGoals();
        if (unlocked.length > 0 || goalStateChanged) {
            this.notify();
        }

        return { unlocked, rewardTotal };
    }

    processCollectionStampUnlocks() {
        const result = processCollectionStampUnlocks(this);
        if (result.unlocked.length > 0) {
            this.notify();
        }
        return result;
    }

    cheatSetAllFish(fishIds, count = 8) {
        fishIds.forEach((fishId) => {
            this.fishCollection[fishId] = count;
        });
        this.notify();
    }
}
