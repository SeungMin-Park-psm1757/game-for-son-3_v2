export const DAILY_MISSION_VERSION = 1;

export function getLocalDateKey(date = new Date()) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function hashString(value) {
    let hash = 2166136261;
    for (let i = 0; i < value.length; i += 1) {
        hash ^= value.charCodeAt(i);
        hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
}

function seededShuffle(items, seedText) {
    return [...items]
        .map((item, index) => ({
            item,
            weight: hashString(`${seedText}:${item.id}:${index}`)
        }))
        .sort((a, b) => a.weight - b.weight)
        .map((entry) => entry.item);
}

function hasAquariumFish(model) {
    return Object.values(model?.fishCollection || {}).some((count) => count >= 5);
}

function hasAnySnackPath(model) {
    const ownedSnackCount = Object.values(model?.snacksPurchased || {}).reduce((sum, count) => sum + (Number(count) || 0), 0);
    return ownedSnackCount > 0 || (model?.highestChapter || 1) >= 2 || (model?.gold || 0) >= 700;
}

export function isMissionComplete(mission) {
    return (mission?.progress || 0) >= (mission?.target || 1);
}

export function getDailyMissionCatalog(model) {
    const highestChapter = Math.max(1, Math.min(4, model?.highestChapter || 1));
    const uniqueFishCount = Object.values(model?.fishCollection || {}).filter((count) => count > 0).length;
    const candidates = [
        {
            id: 'catch_any_3',
            title: '물고기 3마리 잡기',
            desc: '아무 지역에서 물고기를 3마리 만나 보자!',
            type: 'catch_any',
            target: 3,
            rewardGold: 70
        },
        {
            id: 'region_1_catch_3',
            title: '민물 친구 3마리',
            desc: '민물에서 차근차근 3마리를 잡아 보자!',
            type: 'catch_region',
            region: 1,
            target: 3,
            rewardGold: 70
        },
        {
            id: 'quiz_correct_1',
            title: '퀴즈 한 번 맞히기',
            desc: '천천히 생각해서 퀴즈 1번을 맞혀 보자!',
            type: 'quiz_correct',
            target: 1,
            rewardGold: 90
        }
    ];

    if (highestChapter >= 2) {
        candidates.push({
            id: 'region_2_catch_2',
            title: '연안에서 2마리',
            desc: '연안 물결 속 친구들을 2마리 만나 보자!',
            type: 'catch_region',
            region: 2,
            target: 2,
            rewardGold: 90
        });
    }

    if (highestChapter >= 3) {
        candidates.push(
            {
                id: 'region_3_catch_2',
                title: '바다에서 2마리',
                desc: '먼 바다에서 멋진 친구 2마리를 잡아 보자!',
                type: 'catch_region',
                region: 3,
                target: 2,
                rewardGold: 120
            },
            {
                id: 'rare_catch_1',
                title: '희귀 친구 만나기',
                desc: 'R등급 이상 물고기 1마리를 만나면 성공!',
                type: 'catch_rare',
                target: 1,
                rewardGold: 130
            }
        );
    }

    if (highestChapter >= 4) {
        candidates.push(
            {
                id: 'region_4_catch_1',
                title: '보물섬 한 번 도전',
                desc: '보물섬에서 물고기 1마리를 잡아 보자!',
                type: 'catch_region',
                region: 4,
                target: 1,
                rewardGold: 150
            },
            {
                id: 'event_card_1',
                title: '이벤트 카드 찾기',
                desc: '특별한 이벤트 카드 1장을 발견해 보자!',
                type: 'event_card',
                target: 1,
                rewardGold: 160
            }
        );
    }

    if (uniqueFishCount >= 2) {
        candidates.push({
            id: 'combo_reward_1',
            title: '조합 하나 발견하기',
            desc: '조합 도감 보상 1개를 찾아 보자!',
            type: 'combo_reward',
            target: 1,
            rewardGold: 120
        });
    }

    if (hasAquariumFish(model) && hasAnySnackPath(model)) {
        candidates.push({
            id: 'aquarium_feed_1',
            title: '수족관 간식 1번',
            desc: '수족관 친구들에게 간식을 한 번 챙겨 주자!',
            type: 'aquarium_feed',
            target: 1,
            rewardGold: 80
        });
    }

    return candidates;
}

export function createDailyMissions(model, dateKey = getLocalDateKey()) {
    const catalog = getDailyMissionCatalog(model);
    const starter = catalog.find((mission) => mission.id === 'catch_any_3') || catalog[0];
    const pool = catalog.filter((mission) => mission.id !== starter.id);
    const selected = [starter, ...seededShuffle(pool, `${dateKey}:${model?.highestChapter || 1}:${hasAquariumFish(model) ? 'aq' : 'noaq'}`)]
        .slice(0, 3);

    return selected.map((mission) => ({
        ...mission,
        progress: 0,
        claimed: false
    }));
}

export function doesDailyMissionMatch(mission, eventType, meta = {}) {
    if (!mission || mission.type !== eventType) return false;

    if (mission.type === 'catch_region') {
        return Number(meta.region) === Number(mission.region);
    }

    if (mission.type === 'catch_rare') {
        return ['R', 'SR', 'SSR'].includes(meta.grade);
    }

    return true;
}
