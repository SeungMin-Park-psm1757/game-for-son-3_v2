export const SPECIAL_BAIT_ITEMS = [
    {
        id: 'sparkle_bait',
        name: '반짝 미끼',
        emoji: '✨',
        cost: 1500,
        shortEffect: 'SR 이상 확률 UP',
        description: '다음 낚시에서 희귀 물고기가 더 잘 다가와요.',
        rareMultiplier: 1.8,
        notice: '반짝 미끼를 달았어! 희귀한 그림자가 더 가까워져.'
    },
    {
        id: 'deep_ssr_bait',
        name: '전설 미끼',
        emoji: '🌟',
        cost: 8000,
        shortEffect: 'SSR 확률 크게 UP',
        description: '다음 낚시에서 SSR 물고기 쪽으로 운이 크게 기울어요.',
        rareMultiplier: 3.2,
        ssrBonusWeight: 12,
        notice: '전설 미끼가 반짝인다! 엄청난 녀석을 노려 보자.'
    },
    {
        id: 'clean_bait',
        name: '정화 미끼',
        emoji: '🧼',
        cost: 5000,
        shortEffect: '잡동사니 방지',
        description: '다음 낚시에서 낡은 잡동사니가 걸리지 않고 게이지가 잠깐 안정돼요.',
        avoidSpecialItems: true,
        gaugeImmunityMs: 3500,
        notice: '정화 미끼를 썼어! 물결이 깨끗하고 차분해졌어.'
    },
    {
        id: 'treasure_detector',
        name: '보물섬 탐지기',
        emoji: '🧭',
        cost: 18000,
        shortEffect: '보물섬 이벤트 호출',
        description: '다음 낚시에서 보물섬의 비밀 신호를 한 번 불러요.',
        treasureSignal: true,
        notice: '탐지기가 반짝인다! 보물섬의 신호가 가까워졌어.'
    },
    {
        id: 'boss_call_ticket',
        name: '보스 호출권',
        emoji: '🎫',
        cost: 50000,
        shortEffect: '지역 보스 도전',
        description: '다음 낚시에서 그 지역의 보스를 직접 불러내요.',
        forceBoss: true,
        notice: '보스 호출권을 썼어! 큰 파도가 몰려온다!'
    }
];

export const SPECIAL_BAIT_BY_ID = Object.fromEntries(SPECIAL_BAIT_ITEMS.map((item) => [item.id, item]));

export const AQUARIUM_TANK_UPGRADES = [
    {
        level: 1,
        id: 'starter_tank',
        name: '기본 수조',
        emoji: '🐟',
        cost: 0,
        maxFish: 14,
        description: '처음부터 열려 있는 아늑한 수조예요.',
        regionColors: [0x9ed4ef, 0x688ec0, 0x0d3587, 0x23236e],
        accentColor: '#d7f7ff'
    },
    {
        level: 2,
        id: 'wide_tank',
        name: '큰 수조',
        emoji: '🐠',
        cost: 10000,
        maxFish: 22,
        description: '물고기가 더 많이 헤엄칠 넓은 공간을 만들어요.',
        regionColors: [0xaee7f5, 0x74a9d6, 0x1653a5, 0x2d2f85],
        accentColor: '#aee7f5'
    },
    {
        level: 3,
        id: 'deep_tank',
        name: '심해 수조',
        emoji: '🌊',
        cost: 25000,
        maxFish: 34,
        description: '깊은 바다 조명과 넓은 헤엄 공간이 생겨요.',
        regionColors: [0x8fd3e8, 0x4f86bd, 0x0b3b8b, 0x11175f],
        accentColor: '#8fd3ff'
    },
    {
        level: 4,
        id: 'treasure_tank',
        name: '보물섬 수조',
        emoji: '🏝️',
        cost: 60000,
        maxFish: 48,
        description: '보물섬 빛이 깔리는 최고급 전시 수조예요.',
        regionColors: [0xb8f0f0, 0x5ab7d2, 0x105b9f, 0x2f246b],
        accentColor: '#ffd27f'
    },
    {
        level: 5,
        id: 'legend_tank',
        name: '전설 수조',
        emoji: '👑',
        cost: 120000,
        maxFish: 72,
        description: '잡은 물고기를 거의 모두 전시하는 전설급 수족관이에요.',
        regionColors: [0xc7f7e9, 0x65c3d2, 0x1e68b3, 0x41297f],
        accentColor: '#ffe08a'
    }
];

export const AQUARIUM_TANK_BY_LEVEL = Object.fromEntries(AQUARIUM_TANK_UPGRADES.map((item) => [item.level, item]));

export const HONOR_TROPHY_ITEMS = [
    {
        id: 'honor_bronze',
        name: '용감한 낚시꾼 트로피',
        emoji: '🏅',
        cost: 25000,
        description: '수족관 아래에 첫 명예 트로피를 세워요.',
        color: 0xcd7f32
    },
    {
        id: 'honor_silver',
        name: '바다 탐험가 트로피',
        emoji: '🏆',
        cost: 75000,
        description: '오래 플레이한 기록을 반짝이는 트로피로 남겨요.',
        color: 0xcfd8dc
    },
    {
        id: 'honor_gold',
        name: '전설의 손맛 왕관',
        emoji: '👑',
        cost: 150000,
        description: '남는 골드를 최고의 명예 장식으로 바꿔요.',
        color: 0xffd54f
    }
];

export const HONOR_TROPHY_BY_ID = Object.fromEntries(HONOR_TROPHY_ITEMS.map((item) => [item.id, item]));

export function getAquariumTankUpgrade(level = 1) {
    const normalizedLevel = Math.max(1, Math.min(AQUARIUM_TANK_UPGRADES.length, level || 1));
    return AQUARIUM_TANK_BY_LEVEL[normalizedLevel] || AQUARIUM_TANK_UPGRADES[0];
}

export function getNextAquariumTankUpgrade(level = 1) {
    const currentLevel = getAquariumTankUpgrade(level).level;
    return AQUARIUM_TANK_UPGRADES.find((item) => item.level === currentLevel + 1) || null;
}

export function getSelectedBait(playerModel) {
    const baitId = playerModel?.selectedBaitId;
    const count = playerModel?.baitInventory?.[baitId] || 0;
    return baitId && count > 0 ? SPECIAL_BAIT_BY_ID[baitId] || null : null;
}

export function getNextHonorTrophy(playerModel) {
    const owned = playerModel?.honorTrophies || {};
    return HONOR_TROPHY_ITEMS.find((item) => !owned[item.id]) || null;
}

export function getLateGameGoal(playerModel) {
    if (!playerModel) {
        return null;
    }

    const selectedBait = getSelectedBait(playerModel);
    if (selectedBait) {
        return {
            type: 'bait-ready',
            title: `${selectedBait.emoji} ${selectedBait.name} 장착 중`,
            detail: '다음 낚시 1번에 바로 써져요.',
            shortLabel: `${selectedBait.emoji} 미끼 준비`,
            action: 'bait'
        };
    }

    const stockedBait = SPECIAL_BAIT_ITEMS.find((item) => (playerModel.baitInventory?.[item.id] || 0) > 0);
    if (stockedBait) {
        return {
            type: 'bait-select',
            title: `${stockedBait.emoji} ${stockedBait.name} 장착하기`,
            detail: '보유 미끼를 골라 다음 낚시에 써 봐요.',
            shortLabel: `${stockedBait.emoji} 미끼 장착`,
            action: 'bait'
        };
    }

    const hasLateProgress = (playerModel.highestChapter || 1) >= 3 ||
        (playerModel.gold || 0) >= 8000 ||
        (playerModel.aquariumTankLevel || 1) > 1 ||
        Object.keys(playerModel.honorTrophies || {}).length > 0;
    if (!hasLateProgress) {
        const starterBait = SPECIAL_BAIT_BY_ID.sparkle_bait;
        const remaining = Math.max(0, starterBait.cost - (playerModel.gold || 0));
        return {
            type: 'bait-buy',
            title: `${starterBait.emoji} ${starterBait.name} 도전`,
            detail: remaining > 0 ? `${remaining}G 더 모으면 희귀 물고기 찬스!` : '지금 희귀 물고기에 도전할 수 있어요!',
            shortLabel: remaining > 0 ? `${starterBait.name} ${remaining}G 남음` : `${starterBait.name} 가능`,
            action: 'bait',
            cost: starterBait.cost,
            remaining
        };
    }

    const nextTank = getNextAquariumTankUpgrade(playerModel.aquariumTankLevel || 1);
    if (nextTank) {
        const remaining = Math.max(0, nextTank.cost - (playerModel.gold || 0));
        return {
            type: 'tank',
            title: `${nextTank.emoji} ${nextTank.name} 확장`,
            detail: remaining > 0 ? `${remaining}G 더 모으면 살 수 있어요.` : '지금 바로 수족관을 넓힐 수 있어요!',
            shortLabel: remaining > 0 ? `${nextTank.name} ${remaining}G 남음` : `${nextTank.name} 가능`,
            action: 'aquarium',
            cost: nextTank.cost,
            remaining
        };
    }

    const nextTrophy = getNextHonorTrophy(playerModel);
    if (nextTrophy) {
        const remaining = Math.max(0, nextTrophy.cost - (playerModel.gold || 0));
        return {
            type: 'trophy',
            title: `${nextTrophy.emoji} ${nextTrophy.name}`,
            detail: remaining > 0 ? `${remaining}G 더 모으면 명예 장식 완성!` : '지금 명예의 전당에 세울 수 있어요!',
            shortLabel: remaining > 0 ? `명예 ${remaining}G 남음` : '명예 장식 가능',
            action: 'aquarium',
            cost: nextTrophy.cost,
            remaining
        };
    }

    const suggestedBait = (playerModel.gold || 0) >= 50000
        ? SPECIAL_BAIT_BY_ID.boss_call_ticket
        : SPECIAL_BAIT_BY_ID.deep_ssr_bait;

    return {
        type: 'bait-buy',
        title: `${suggestedBait.emoji} ${suggestedBait.name} 도전`,
        detail: '골드는 다음 도전과 수집 확률에 쓰면 좋아요.',
        shortLabel: `${suggestedBait.name} 추천`,
        action: 'bait',
        cost: suggestedBait.cost,
        remaining: Math.max(0, suggestedBait.cost - (playerModel.gold || 0))
    };
}
