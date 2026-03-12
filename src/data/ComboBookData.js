import { FISH_TYPES } from '../models/FishData.js';

const FISH_BY_ID = Object.fromEntries(FISH_TYPES.map((fish) => [fish.id, fish]));

export const DECOR_SET_IDS = {
    coralDream: ['aquarium_coral_garden', 'aquarium_bubble_fountain', 'aquarium_kelp_arch'],
    treasureHideout: ['aquarium_treasure_castle', 'aquarium_shell_bed', 'aquarium_moon_rocks']
};

export function getFishSizeTier(fishOrScale) {
    const scale = typeof fishOrScale === 'number' ? fishOrScale : (fishOrScale?.scale || 0);
    if (scale < 0.09) return 'tiny';
    if (scale < 0.24) return 'small';
    if (scale < 0.75) return 'medium';
    if (scale < 1.05) return 'large';
    return 'giant';
}

export function getFishSizeTierLabel(sizeTier) {
    const labels = {
        tiny: '꼬마',
        small: '날렵',
        medium: '든든',
        large: '거물',
        giant: '괴수'
    };
    return labels[sizeTier] || '알 수 없음';
}

function getFishDiscoveryCount(model, fishIds) {
    return fishIds.filter((id) => (model.fishCollection[id] || 0) > 0).length;
}

function getUniqueFishCountBySize(model, sizeTier) {
    return FISH_TYPES.filter((fish) =>
        getFishSizeTier(fish) === sizeTier && (model.fishCollection[fish.id] || 0) > 0
    ).length;
}

function getDecorUnlockCount(model, decorIds) {
    return decorIds.filter((id) => (model.decorPurchased[id] || 0) > 0).length;
}

function getTotalDecorUnlockCount(model) {
    return Object.values(model.decorPurchased || {}).filter((count) => count > 0).length;
}

export const COMBO_BOOK_ENTRIES = [
    {
        id: 'combo_freshwater_starters',
        category: '물고기 조합',
        name: '민물 첫 손맛',
        description: '피라미, 미꾸라지, 빙어를 모두 만나 보세요.',
        hint: '민물에서 차분히 낚시하면 금방 모을 수 있어요.',
        reward: 220,
        type: 'fishSet',
        fishIds: ['fish_pirami', 'fish_loach', 'fish_smelt']
    },
    {
        id: 'combo_coast_snack_friends',
        category: '물고기 조합',
        name: '연안 간식 친구들',
        description: '멸치, 망둥어, 전어를 모두 모아 보세요.',
        hint: '연안 초반 물고기 셋을 모으면 완성돼요.',
        reward: 260,
        type: 'fishSet',
        fishIds: ['fish_anchovy', 'fish_mangdoong', 'fish_gizzard_shad']
    },
    {
        id: 'combo_silver_ribbon',
        category: '물고기 조합',
        name: '은빛 줄무늬',
        description: '꽁치, 고등어, 은빛 갈치를 모두 만나 보세요.',
        hint: '먼 바다에서 반짝이는 은빛 물고기들을 노려 보세요.',
        reward: 420,
        type: 'fishSet',
        fishIds: ['fish_saury', 'fish_godeungeo', 'fish_galchi']
    },
    {
        id: 'combo_treasure_scouts',
        category: '물고기 조합',
        name: '보물섬 정찰대',
        description: '날치, 쏠배감펭, 앵무고기를 모두 모아 보세요.',
        hint: '보물섬 초반 지역의 다채로운 친구들이에요.',
        reward: 620,
        type: 'fishSet',
        fishIds: ['fish_flying_fish', 'fish_lionfish', 'fish_parrotfish']
    },
    {
        id: 'combo_river_guardians',
        category: '물고기 조합',
        name: '민물 지킴이들',
        description: '붕어, 메기, 잉어를 모두 모아 보세요.',
        hint: '민물 지역에서 조금 더 묵직한 친구들을 만나면 돼요.',
        reward: 360,
        type: 'fishSet',
        fishIds: ['fish_boonguh', 'fish_catfish', 'fish_carp']
    },
    {
        id: 'combo_flat_swimmers',
        category: '물고기 조합',
        name: '납작 헤엄단',
        description: '도다리, 광어, 쥐가오리를 모두 만나 보세요.',
        hint: '연안과 보물섬을 오가며 납작한 친구들을 찾아보세요.',
        reward: 780,
        type: 'fishSet',
        fishIds: ['fish_flounder', 'fish_gwangeo', 'fish_manta_ray']
    },
    {
        id: 'combo_ocean_giants',
        category: '물고기 조합',
        name: '푸른 거물 삼총사',
        description: '참치, 개복치, 고래상어를 모두 만나 보세요.',
        hint: '먼 바다의 거대한 친구들을 한 번씩 만나면 돼요.',
        reward: 980,
        type: 'fishSet',
        fishIds: ['fish_tuna', 'fish_sunfish', 'fish_whale_shark']
    },
    {
        id: 'combo_treasure_legends',
        category: '물고기 조합',
        name: '보물섬 전설',
        description: '황금 물고기, 실러캔스, 산갈치를 모두 모아 보세요.',
        hint: '보물섬 깊은 곳에서 전설이 모습을 드러냅니다.',
        reward: 1500,
        type: 'fishSet',
        fishIds: ['fish_golden_fish', 'fish_coelacanth', 'fish_oarfish']
    },
    {
        id: 'combo_tiny_spark',
        category: '크기 조합',
        name: '꼬마 물보라',
        description: '꼬마 크기 물고기 4종을 만나 보세요.',
        hint: '작고 빠른 물고기들을 여러 종 잡으면 완성돼요.',
        reward: 280,
        type: 'sizeTierUnique',
        sizeTier: 'tiny',
        targetCount: 4
    },
    {
        id: 'combo_mid_wave',
        category: '크기 조합',
        name: '든든한 물결',
        description: '든든 크기 물고기 5종을 만나 보세요.',
        hint: '중간 크기의 물고기가 의외로 정말 많아요.',
        reward: 520,
        type: 'sizeTierUnique',
        sizeTier: 'medium',
        targetCount: 5
    },
    {
        id: 'combo_giant_shadow',
        category: '크기 조합',
        name: '거대한 그림자',
        description: '괴수 크기 물고기 3종을 만나 보세요.',
        hint: '큰 그림자가 지나가면 전설급 손맛이 찾아옵니다.',
        reward: 980,
        type: 'sizeTierUnique',
        sizeTier: 'giant',
        targetCount: 3
    },
    {
        id: 'combo_snack_swarm',
        category: '특별간식',
        name: '우르르 간식 파티',
        description: '특별간식을 주고 물고기 떼가 몰려드는 장면을 보세요.',
        hint: '수족관 상점에서 특별간식을 사서 써 보세요.',
        reward: 220,
        type: 'snackBehavior',
        behaviorId: 'swarm_first'
    },
    {
        id: 'combo_snack_bubble_ring',
        category: '특별간식',
        name: '냠냠 버블 링',
        description: '특별간식으로 버블 링 먹방 장면을 확인하세요.',
        hint: '특별간식을 여러 번 주면 더 신나는 반응이 나와요.',
        reward: 360,
        type: 'snackBehavior',
        behaviorId: 'bubble_ring'
    },
    {
        id: 'combo_snack_recognition',
        category: '특별간식',
        name: '정우를 알아본다',
        description: '물고기들이 정우를 먼저 알아보는 특별한 반응을 보세요.',
        hint: '특별간식을 꾸준히 주면 친밀도가 올라갑니다.',
        reward: 640,
        type: 'snackBehavior',
        behaviorId: 'recognition'
    },
    {
        id: 'combo_decor_coral_dream',
        category: '수족관 세트',
        name: '산호 꿈바다 세트',
        description: '산호 정원, 버블 분수, 해초 아치를 설치하세요.',
        hint: '중간 수심대를 아늑하게 꾸며 보세요.',
        reward: 540,
        type: 'decorSet',
        decorIds: DECOR_SET_IDS.coralDream
    },
    {
        id: 'combo_decor_treasure_hideout',
        category: '수족관 세트',
        name: '보물 아지트 세트',
        description: '보물 성채, 조개 쉼터, 달빛 바위를 설치하세요.',
        hint: '깊은 바다에 보물 분위기를 더해 주세요.',
        reward: 760,
        type: 'decorSet',
        decorIds: DECOR_SET_IDS.treasureHideout
    },
    {
        id: 'combo_home_sea',
        category: '수족관 세트',
        name: '우리 집 바다',
        description: '꾸미기 소품 5개를 설치해서 우리 집 바다를 완성하세요.',
        hint: '소품을 천천히 모으면 수족관이 훨씬 풍성해져요.',
        reward: 980,
        type: 'decorCount',
        targetCount: 5
    }
];

export function getComboEntryById(comboId) {
    return COMBO_BOOK_ENTRIES.find((entry) => entry.id === comboId) || null;
}

export function getComboProgress(entry, model) {
    if (!entry) {
        return { current: 0, target: 1, ratio: 0, completed: false, label: '' };
    }

    if (entry.type === 'fishSet') {
        const current = getFishDiscoveryCount(model, entry.fishIds);
        const target = entry.fishIds.length;
        return {
            current,
            target,
            ratio: target > 0 ? current / target : 0,
            completed: current >= target,
            label: `${current}/${target}종 발견`
        };
    }

    if (entry.type === 'sizeTierUnique') {
        const current = getUniqueFishCountBySize(model, entry.sizeTier);
        const target = entry.targetCount;
        return {
            current,
            target,
            ratio: target > 0 ? current / target : 0,
            completed: current >= target,
            label: `${getFishSizeTierLabel(entry.sizeTier)} 크기 ${current}/${target}종`
        };
    }

    if (entry.type === 'snackBehavior') {
        const current = model.specialSnackBehaviorsSeen?.[entry.behaviorId] ? 1 : 0;
        return {
            current,
            target: 1,
            ratio: current,
            completed: current >= 1,
            label: current ? '장면 확인 완료' : '아직 못 봤어요'
        };
    }

    if (entry.type === 'decorSet') {
        const current = getDecorUnlockCount(model, entry.decorIds);
        const target = entry.decorIds.length;
        return {
            current,
            target,
            ratio: target > 0 ? current / target : 0,
            completed: current >= target,
            label: `${current}/${target}개 설치`
        };
    }

    if (entry.type === 'decorCount') {
        const current = getTotalDecorUnlockCount(model);
        const target = entry.targetCount;
        return {
            current,
            target,
            ratio: target > 0 ? current / target : 0,
            completed: current >= target,
            label: `${current}/${target}개 설치`
        };
    }

    return { current: 0, target: 1, ratio: 0, completed: false, label: '' };
}

export function isComboCompleted(entry, model) {
    return getComboProgress(entry, model).completed;
}

export function getRecommendedComboGoalIds(model, count = 3) {
    const isReadyGoal = (entry) => {
        if (entry.type === 'fishSet') {
            const maxRegion = Math.max(...entry.fishIds.map((fishId) => FISH_BY_ID[fishId]?.region || 1));
            return (model.highestChapter || 1) >= maxRegion;
        }

        if (entry.type === 'sizeTierUnique') {
            return entry.sizeTier === 'giant' ? (model.highestChapter || 1) >= 3 : true;
        }

        if (entry.type === 'snackBehavior') {
            return (model.highestChapter || 1) >= 2 || (model.specialSnackFedCount || 0) > 0;
        }

        if (entry.type === 'decorSet' || entry.type === 'decorCount') {
            const decorCount = Object.values(model.decorPurchased || {}).filter((value) => value > 0).length;
            return (model.highestChapter || 1) >= 2 || decorCount > 0;
        }

        return true;
    };

    const undiscovered = COMBO_BOOK_ENTRIES.filter((entry) => !(model.comboBook?.[entry.id]?.discovered));
    const candidateEntries = undiscovered.filter((entry) => isReadyGoal(entry));
    const goalPool = candidateEntries.length >= count ? candidateEntries : undiscovered;
    const selected = [];
    const usedCategories = new Set();

    for (const entry of goalPool) {
        if (selected.length >= count) break;
        if (usedCategories.has(entry.category)) continue;
        selected.push(entry.id);
        usedCategories.add(entry.category);
    }

    for (const entry of goalPool) {
        if (selected.length >= count) break;
        if (!selected.includes(entry.id)) {
            selected.push(entry.id);
        }
    }

    return selected.slice(0, count);
}

export function getComboDiscoveryDate(model, comboId) {
    const iso = model.comboBook?.[comboId]?.discoveredAt;
    if (!iso) return '';
    const date = new Date(iso);
    return `${date.getFullYear()}.${date.getMonth() + 1}.${date.getDate()}`;
}

export function getFishNames(fishIds) {
    return fishIds.map((fishId) => FISH_BY_ID[fishId]?.name || fishId).join(', ');
}
