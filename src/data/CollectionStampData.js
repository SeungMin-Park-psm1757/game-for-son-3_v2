import { FISH_TYPES } from '../models/FishData.js';
import { getFishSizeTier } from './ComboBookData.js';

export const COLLECTION_STAMP_ENTRIES = [
    {
        id: 'stamp_region_freshwater',
        name: '민물 지도 완성',
        emoji: '🏞️',
        reward: 400,
        title: '민물 탐험가',
        color: '#8fd38f',
        check: (model) => isRegionCleared(model, 1)
    },
    {
        id: 'stamp_region_coast',
        name: '연안 지도 완성',
        emoji: '🌊',
        reward: 600,
        title: '연안 탐사대',
        color: '#8cc7ff',
        check: (model) => isRegionCleared(model, 2)
    },
    {
        id: 'stamp_region_ocean',
        name: '먼 바다 지도 완성',
        emoji: '🚤',
        reward: 900,
        title: '먼바다 모험가',
        color: '#6fa7ff',
        check: (model) => isRegionCleared(model, 3)
    },
    {
        id: 'stamp_region_treasure',
        name: '보물섬 지도 완성',
        emoji: '🏴‍☠️',
        reward: 1400,
        title: '보물섬 헌터',
        color: '#ffd27a',
        check: (model) => isRegionCleared(model, 4)
    },
    {
        id: 'stamp_size_lineup',
        name: '크기 탐험대',
        emoji: '📏',
        reward: 700,
        title: '크기 연구가',
        color: '#c8b5ff',
        check: (model) => hasAllSizeTiers(model)
    },
    {
        id: 'stamp_combo_trail',
        name: '조합 수집가',
        emoji: '📚',
        reward: 850,
        title: '조합 탐험가',
        color: '#ffd6ea',
        check: (model) => Object.values(model.comboBook || {}).filter((entry) => entry?.discovered).length >= 5
    },
    {
        id: 'stamp_event_hunter',
        name: '주간 이벤트 사냥꾼',
        emoji: '🎣',
        reward: 1000,
        title: '주간 이벤트 사냥꾼',
        color: '#ffe48d',
        check: (model) => FISH_TYPES.some((fish) => fish.eventOnly && (model.fishCollection?.[fish.id] || 0) > 0)
    }
];

function getStandardRegionFish(region) {
    return FISH_TYPES.filter((fish) => fish.region === region && !fish.eventOnly);
}

function isRegionCleared(model, region) {
    return getStandardRegionFish(region).every((fish) => (model.fishCollection?.[fish.id] || 0) > 0);
}

function hasAllSizeTiers(model) {
    const discovered = FISH_TYPES.filter((fish) => (model.fishCollection?.[fish.id] || 0) > 0 && !fish.eventOnly);
    const tiers = new Set(discovered.map((fish) => getFishSizeTier(fish)));
    return ['small', 'medium', 'large', 'giant'].every((tier) => tiers.has(tier));
}

export function getUnlockedCollectionStamps(model) {
    return COLLECTION_STAMP_ENTRIES.filter((entry) => model.collectionStamps?.[entry.id]?.discovered);
}

export function processCollectionStampUnlocks(model) {
    const unlocked = [];
    let rewardTotal = 0;

    COLLECTION_STAMP_ENTRIES.forEach((entry) => {
        const discovered = !!model.collectionStamps?.[entry.id]?.discovered;
        if (discovered || !entry.check(model)) {
            return;
        }

        model.collectionStamps[entry.id] = {
            discovered: true,
            discoveredAt: new Date().toISOString(),
            reward: entry.reward
        };
        model.gold += entry.reward;
        rewardTotal += entry.reward;
        unlocked.push(entry);
    });

    return { unlocked, rewardTotal };
}

export function getCollectorTitle(model) {
    const unlockedIds = new Set(getUnlockedCollectionStamps(model).map((entry) => entry.id));
    if (
        unlockedIds.has('stamp_region_freshwater') &&
        unlockedIds.has('stamp_region_coast') &&
        unlockedIds.has('stamp_region_ocean') &&
        unlockedIds.has('stamp_region_treasure')
    ) {
        return '전설의 바다 도감왕';
    }

    const highest = [...getUnlockedCollectionStamps(model)].pop();
    return highest?.title || '초보 수집가';
}

