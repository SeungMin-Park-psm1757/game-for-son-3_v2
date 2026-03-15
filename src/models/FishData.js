// 물고기 데이터 정의
// id, 이름, 등급(N, R, SR, SSR), 보상, 기본 등장 확률(Weight), 픽셀 파티클 색상, 지역(region)
// catchMax: 기존 대비 10% 상향, difficulty: Catch 수식에 사용되는 난이도 계수
// scale 7단계: XS(0.09), S(0.14), MS(0.20), M(0.30), ML(0.40), L(0.55), XL(0.70)
export const FISH_TYPES = [
    // --- Region 1: 민물 (8마리) ---
    // 챕터 1 초반(rodPower=1,reelSpeed=1): progress=1/diff, 후반(rP=3,rS=2): progress=6/diff
    // N등급 목표: 초반 10~15클릭, 업글 후 5~8클릭 / R: 12~25클릭 → 업글 후 8~15클릭
    { id: 'fish_pirami', name: '피라미', grade: 'N', baseReward: 30, baseWeight: 40, region: 1, color: 0xcccccc, scale: 0.2734, catchMax: 14, difficulty: 1.0 },    // ~10cm XS
    { id: 'fish_loach', name: '미꾸라지', grade: 'N', baseReward: 35, baseWeight: 40, region: 1, color: 0x8b7355, scale: 0.0684, catchMax: 16, difficulty: 1.1 },    // ~12cm XS
    { id: 'fish_smelt', name: '빙어', grade: 'R', baseReward: 70, baseWeight: 20, region: 1, color: 0xe0ffff, scale: 0.0684, catchMax: 35, difficulty: 1.3 },         // ~15cm XS
    { id: 'fish_boonguh', name: '붕어', grade: 'R', baseReward: 80, baseWeight: 20, region: 1, color: 0x8b6508, scale: 0.1025, catchMax: 40, difficulty: 1.5 },       // ~25cm S
    { id: 'fish_catfish', name: '메기', grade: 'R', baseReward: 100, baseWeight: 15, region: 1, color: 0x2f4f4f, scale: 0.1416, catchMax: 50, difficulty: 1.7 },      // ~40cm MS
    { id: 'fish_ssogari', name: '쏘가리', grade: 'SR', baseReward: 200, baseWeight: 5, region: 1, color: 0xcd853f, scale: 0.5664, catchMax: 80, difficulty: 2.2 },    // ~35cm MS
    { id: 'fish_carp', name: '잉어', grade: 'SR', baseReward: 220, baseWeight: 4, region: 1, color: 0xb8860b, scale: 0.7031, catchMax: 90, difficulty: 2.4 },         // ~60cm M
    { id: 'fish_gamulchi', name: '마왕 가물치', grade: 'SSR', baseReward: 800, baseWeight: 0.5, region: 1, color: 0x556b2f, scale: 0.1074, catchMax: 140, difficulty: 3.5 }, // ~100cm ML
    { id: 'fish_moon_carp', name: '월광 잉어', grade: 'SSR', baseReward: 1100, baseWeight: 0, region: 1, color: 0xcfe3ff, scale: 0.7031, catchMax: 160, difficulty: 3.4, eventOnly: true, textureKey: 'fish_carp', imageFilter: 'hue-rotate(18deg) saturate(1.4) brightness(1.08)' },

    // --- Region 2: 연안 (10마리) ---
    // 챕터 2 진입(rP=5,rS=3): progress=15/diff → N: 8~10클릭, R: 12~20클릭, SR/SSR: 25~50클릭
    // 보상: 챕터1 대비 약 2.5~3배 인상
    { id: 'fish_anchovy', name: '멸치', grade: 'N', baseReward: 90, baseWeight: 40, region: 2, color: 0xc0c0c0, scale: 0.0684, catchMax: 130, difficulty: 1.0 },     // ~10cm XS
    { id: 'fish_mangdoong', name: '망둥어', grade: 'N', baseReward: 110, baseWeight: 30, region: 2, color: 0x8b5a2b, scale: 0.1367, catchMax: 150, difficulty: 1.1 }, // ~15cm XS
    { id: 'fish_gizzard_shad', name: '전어', grade: 'N', baseReward: 130, baseWeight: 30, region: 2, color: 0xadd8e6, scale: 0.2051, catchMax: 170, difficulty: 1.2 }, // ~25cm S
    { id: 'fish_webfoot_octopus', name: '쭈꾸미', grade: 'R', baseReward: 250, baseWeight: 15, region: 2, color: 0xd2b48c, scale: 0.4102, catchMax: 280, difficulty: 1.8 }, // ~20cm S
    { id: 'fish_urock', name: '우럭', grade: 'R', baseReward: 280, baseWeight: 20, region: 2, color: 0x4f4f4f, scale: 0.1416, catchMax: 320, difficulty: 2.0 },      // ~35cm MS
    { id: 'fish_flounder', name: '도다리', grade: 'R', baseReward: 320, baseWeight: 15, region: 2, color: 0x8b4513, scale: 0.2832, catchMax: 350, difficulty: 2.2 },  // ~30cm MS
    { id: 'fish_black_porgy', name: '감성돔', grade: 'SR', baseReward: 700, baseWeight: 5, region: 2, color: 0x2f4f4f, scale: 0.5664, catchMax: 580, difficulty: 3.5 }, // ~40cm MS → grade change 반영(SR→SR 유지, 보상 조정)
    { id: 'fish_gwangeo', name: '광어', grade: 'SR', baseReward: 800, baseWeight: 4, region: 2, color: 0xd2b48c, scale: 0.8594, catchMax: 630, difficulty: 3.8 },    // ~70cm ML
    { id: 'fish_sea_bass', name: '농어', grade: 'SSR', baseReward: 2200, baseWeight: 0.5, region: 2, color: 0x708090, scale: 0.4297, catchMax: 1050, difficulty: 6.5 }, // ~80cm ML
    { id: 'fish_chamdom', name: '참돔', grade: 'SSR', baseReward: 2500, baseWeight: 0.5, region: 2, color: 0xff6347, scale: 0.1758, catchMax: 1200, difficulty: 7.5 }, // ~50cm M

    // --- Region 3: 먼 바다 (15마리) ---
    // 챕터 3 진입(rP=10,rS=6): progress=60/diff → N: 7~10클릭, R: 10~18클릭, SR: 18~30클릭, SSR: 35~55클릭
    // 보상: 챕터1 대비 5~10배 인상
    { id: 'fish_saury', name: '꽁치', grade: 'N', baseReward: 220, baseWeight: 25, region: 3, color: 0x87ceeb, scale: 0.2051, catchMax: 480, difficulty: 1.4 },      // ~30cm S
    { id: 'fish_godeungeo', name: '고등어', grade: 'N', baseReward: 250, baseWeight: 30, region: 3, color: 0x4682b4, scale: 0.0708, catchMax: 510, difficulty: 1.5 }, // ~35cm MS
    { id: 'fish_squid', name: '오징어', grade: 'N', baseReward: 280, baseWeight: 25, region: 3, color: 0xffe4b5, scale: 0.5664, catchMax: 550, difficulty: 1.6 },     // ~35cm MS (몸통)
    { id: 'fish_spanish_mackerel', name: '삼치', grade: 'N', baseReward: 300, baseWeight: 20, region: 3, color: 0x5f9ea0, scale: 0.7031, catchMax: 590, difficulty: 1.7 }, // ~60cm M
    { id: 'fish_pollack', name: '명태', grade: 'R', baseReward: 500, baseWeight: 15, region: 3, color: 0xdeb887, scale: 0.7031, catchMax: 910, difficulty: 2.3 },     // ~50cm M
    { id: 'fish_salmon', name: '연어', grade: 'R', baseReward: 550, baseWeight: 15, region: 3, color: 0xfa8072, scale: 0.7031, catchMax: 980, difficulty: 2.5 },      // ~70cm M
    { id: 'fish_galchi', name: '은빛 갈치', grade: 'R', baseReward: 600, baseWeight: 12, region: 3, color: 0xe6e6fa, scale: 0.0879, catchMax: 1050, difficulty: 2.7 }, // ~100cm 길지만 가늘어서 M
    { id: 'fish_cod', name: '대구', grade: 'R', baseReward: 650, baseWeight: 12, region: 3, color: 0xcd853f, scale: 0.0879, catchMax: 1120, difficulty: 2.9 },        // ~70cm M
    { id: 'fish_monkfish', name: '아귀', grade: 'R', baseReward: 700, baseWeight: 10, region: 3, color: 0x8b4513, scale: 0.3516, catchMax: 1190, difficulty: 3.1 },   // ~50cm M (넓적)
    { id: 'fish_bangeo', name: '대방어', grade: 'SR', baseReward: 1400, baseWeight: 5, region: 3, color: 0x778899, scale: 0.4297, catchMax: 1890, difficulty: 4.5 },  // ~100cm ML
    { id: 'fish_tuna', name: '참치', grade: 'SR', baseReward: 1800, baseWeight: 4, region: 3, color: 0x4169e1, scale: 1.0156, catchMax: 2240, difficulty: 5.5 },      // ~150cm L
    { id: 'fish_sunfish', name: '개복치', grade: 'SR', baseReward: 2200, baseWeight: 2, region: 3, color: 0xa9a9a9, scale: 1.0156, catchMax: 2450, difficulty: 6.5 },  // ~200cm L
    { id: 'fish_striped_jewfish', name: '돗돔', grade: 'SSR', baseReward: 4500, baseWeight: 0.5, region: 3, color: 0x2f4f4f, scale: 0.8594, catchMax: 3150, difficulty: 8.0 }, // ~120cm ML
    { id: 'fish_cheongsaechi', name: '청새치', grade: 'SSR', baseReward: 5500, baseWeight: 0.5, region: 3, color: 0x1e90ff, scale: 0.2539, catchMax: 3500, difficulty: 9.0 }, // ~300cm L
    { id: 'fish_whale_shark', name: '고래상어', grade: 'SSR', baseReward: 8000, baseWeight: 0.2, region: 3, color: 0x4682b4, scale: 0.1953, catchMax: 4200, difficulty: 10.0 }, // ~500cm+ XL
    { id: 'fish_storm_tuna', name: '폭풍 참치', grade: 'SSR', baseReward: 5200, baseWeight: 0, region: 3, color: 0x7fcfff, scale: 1.0156, catchMax: 3200, difficulty: 7.6, eventOnly: true, textureKey: 'fish_tuna', imageFilter: 'hue-rotate(178deg) saturate(1.25) brightness(0.95)' },

    // --- Region 4: 보물섬 (14마리) ---
    // 챕터 4 진입(rP=15,rS=8): progress=120/diff → N: 8~12클릭, R: 15~25클릭, SR: 25~40클릭, SSR: 50~80클릭
    // 보상: 챕터3 대비 2~4배 인상, 열대/심해/전설 생물
    { id: 'fish_flying_fish', name: '날치', grade: 'N', baseReward: 500, baseWeight: 30, region: 4, color: 0x87ceeb, scale: 0.0513, catchMax: 1200, difficulty: 2.0 },  // ~25cm S
    { id: 'fish_lionfish', name: '쏠배감펭', grade: 'N', baseReward: 550, baseWeight: 25, region: 4, color: 0xff4500, scale: 0.0513, catchMax: 1350, difficulty: 2.2 },  // ~30cm S
    { id: 'fish_parrotfish', name: '앵무고기', grade: 'N', baseReward: 600, baseWeight: 25, region: 4, color: 0x00fa9a, scale: 0.0708, catchMax: 1500, difficulty: 2.4 }, // ~40cm MS
    { id: 'fish_moray_eel', name: '곰치', grade: 'N', baseReward: 650, baseWeight: 20, region: 4, color: 0x556b2f, scale: 0.1074, catchMax: 1650, difficulty: 2.6 },    // ~100cm ML (길다)
    { id: 'fish_barracuda', name: '바라쿠다', grade: 'R', baseReward: 1200, baseWeight: 15, region: 4, color: 0xc0c0c0, scale: 0.1074, catchMax: 2500, difficulty: 3.5 }, // ~120cm ML
    { id: 'fish_mahi_mahi', name: '만새기', grade: 'R', baseReward: 1300, baseWeight: 12, region: 4, color: 0x32cd32, scale: 0.1074, catchMax: 2800, difficulty: 3.8 },   // ~100cm ML
    { id: 'fish_giant_trevally', name: '자이언트 트레발리', grade: 'R', baseReward: 1500, baseWeight: 12, region: 4, color: 0x708090, scale: 0.1074, catchMax: 3100, difficulty: 4.2 }, // ~100cm ML
    { id: 'fish_sailfish', name: '돛새치', grade: 'R', baseReward: 1800, baseWeight: 10, region: 4, color: 0x4169e1, scale: 0.127, catchMax: 3500, difficulty: 4.8 },    // ~250cm L
    { id: 'fish_hammerhead', name: '귀상어', grade: 'SR', baseReward: 3500, baseWeight: 5, region: 4, color: 0x778899, scale: 0.127, catchMax: 5000, difficulty: 7.0 },   // ~300cm L
    { id: 'fish_manta_ray', name: '쥐가오리', grade: 'SR', baseReward: 4000, baseWeight: 4, region: 4, color: 0x191970, scale: 0.1465, catchMax: 5500, difficulty: 7.5 },  // ~500cm XL
    { id: 'fish_giant_squid', name: '대왕오징어', grade: 'SR', baseReward: 5000, baseWeight: 3, region: 4, color: 0x8b0000, scale: 0.1465, catchMax: 6200, difficulty: 8.5 }, // ~600cm+ XL
    { id: 'fish_golden_fish', name: '황금 물고기', grade: 'SSR', baseReward: 10000, baseWeight: 0.5, region: 4, color: 0xffd700, scale: 0.0708, catchMax: 8000, difficulty: 11.0 },  // 전설 ~40cm MS (작지만 빛난다)
    { id: 'fish_coelacanth', name: '실러캔스', grade: 'SSR', baseReward: 15000, baseWeight: 0.3, region: 4, color: 0x2f4f4f, scale: 0.127, catchMax: 9000, difficulty: 12.0 },    // ~150cm L
    { id: 'fish_oarfish', name: '산갈치', grade: 'SSR', baseReward: 20000, baseWeight: 0.2, region: 4, color: 0xff6347, scale: 0.1465, catchMax: 10000, difficulty: 13.0 }         // ~500cm+ XL
];

// 특별 아이템 데이터 (1% 확률용)
// Cap chapter 3/4 hard-fish catch time so maxed shop gear still wins within about 5 seconds.
const CHAPTER_34_HARD_FISH_CATCH_TUNING = {
    fish_striped_jewfish: { catchMax: 1900 },
    fish_cheongsaechi: { catchMax: 1750 },
    fish_whale_shark: { catchMax: 1550 },
    fish_storm_tuna: { catchMax: 2100 },
    fish_hammerhead: { catchMax: 2100 },
    fish_manta_ray: { catchMax: 2150 },
    fish_giant_squid: { catchMax: 1950 },
    fish_golden_fish: { catchMax: 1050 },
    fish_coelacanth: { catchMax: 950 },
    fish_oarfish: { catchMax: 830 }
};

FISH_TYPES.forEach((fish) => {
    const tuning = CHAPTER_34_HARD_FISH_CATCH_TUNING[fish.id];
    if (tuning) {
        Object.assign(fish, tuning);
    }
});

export const SPECIAL_ITEMS = [
    { id: 'item_shoe', name: '낡은 신발', grade: 'N', baseReward: 0, isSpecialItem: true, color: 0x654321, scale: 0.4102, catchMax: 50, difficulty: 1.0 },
    { id: 'item_trash', name: '빈 깡통', grade: 'N', baseReward: 0, isSpecialItem: true, color: 0x999999, scale: 0.5469, catchMax: 50, difficulty: 1.0 },
    { id: 'item_treasure', name: '황금 보물상자', grade: 'SSR', baseReward: 500, isSpecialItem: true, color: 0xffd700, scale: 0.3516, catchMax: 300, difficulty: 4.0 },
    // 보물섬 전용 특수 아이템
    { id: 'item_treasure_map', name: '보물 지도 조각', grade: 'R', baseReward: 1000, isSpecialItem: true, color: 0xdeb887, scale: 0.0879, catchMax: 200, difficulty: 2.0, region: 4 },
    { id: 'item_pirates_sword', name: '해적의 녹슨 칼', grade: 'N', baseReward: 200, isSpecialItem: true, color: 0x808080, scale: 0.0879, catchMax: 100, difficulty: 1.5, region: 4 },
    { id: 'item_pearl', name: '거대 진주', grade: 'SR', baseReward: 3000, isSpecialItem: true, color: 0xfffaf0, scale: 0.0513, catchMax: 400, difficulty: 3.0, region: 4 },
    { id: 'item_crown', name: '해적왕의 왕관', grade: 'SSR', baseReward: 8000, isSpecialItem: true, color: 0xffd700, scale: 0.0879, catchMax: 600, difficulty: 5.0, region: 4 }
];

// 낚시 성공 시 잡을 확률 계산 로직 (Rod Luck 스탯, Region, 캐스팅 보너스, 콤보 적용)
// castingBonus: 0=빗나감, 1=보통, 2=좋음, 3=완벽
// comboCount: 연속 성공 횟수 (SSR 가중치 보너스)
// castingMultiplier: 보라색 더블 과녁 성공 시 2
export const getRandomFish = (rodLuckLevel, currentRegion, castingBonus = 1, comboCount = 0, castingMultiplier = 1) => {
    const pm = window.gameManagers && window.gameManagers.playerModel;
    const isTutorialBoostActive = pm && typeof pm.isTutorialBoostActive === 'function' && pm.isTutorialBoostActive();

    // 1% 확률로 특별 아이템 등장 (보물섬에서는 전용 아이템)
    if (Math.random() < 0.01) {
        let availableItems;
        if (currentRegion === 4) {
            availableItems = SPECIAL_ITEMS.filter(item => item.region === 4);
        } else {
            availableItems = SPECIAL_ITEMS.filter(item => !item.region);
        }
        if (isTutorialBoostActive) {
            availableItems = availableItems.filter(item => item.grade === 'N' || item.grade === 'R');
        }
        if (availableItems.length > 0) {
            return availableItems[Math.floor(Math.random() * availableItems.length)];
        }
    }

    // 1. 현재 지역에 맞는 물고기만 필터링
    const regionFishes = FISH_TYPES.filter(fish => fish.region === currentRegion);

    // 2. Rod Luck, 캐스팅 보너스, 콤보에 따른 가중치(Weight) 조정
    let totalWeight = 0;
    const adjustedWeights = regionFishes.map(fish => {
        let weight = fish.baseWeight;

        // Rod Luck 효과
        if (fish.grade === 'N') {
            weight = Math.max(20, weight - (rodLuckLevel * 2));
        } else if (fish.grade === 'R') {
            weight += (rodLuckLevel * 0.5);
        } else if (fish.grade === 'SR') {
            weight += (rodLuckLevel * 0.5);
        } else if (fish.grade === 'SSR') {
            weight += (rodLuckLevel * 0.2);
        }

        // --- 캐스팅 스킬샷 보너스 ---
        if (castingBonus === 3) {
            // 완벽: 희귀어 ×2
            if (fish.grade === 'R') weight *= 1.5;
            else if (fish.grade === 'SR') weight *= 2.0;
            else if (fish.grade === 'SSR') weight *= 2.0;
            else if (fish.grade === 'N') weight *= 0.5;
        } else if (castingBonus === 2) {
            // 좋음: 희귀어 ×1.3
            if (fish.grade === 'SR') weight *= 1.3;
            else if (fish.grade === 'SSR') weight *= 1.3;
        } else if (castingBonus === 0) {
            // 빗나감: 잡어 ×2
            if (fish.grade === 'N') weight *= 2.0;
            else if (fish.grade === 'SR') weight *= 0.5;
            else if (fish.grade === 'SSR') weight *= 0.3;
        }

        // 더블 타겟 보너스 (희귀어 가중치 2배 증폭)
        if (castingMultiplier > 1 && (fish.grade === 'SR' || fish.grade === 'SSR')) {
            weight *= castingMultiplier;
        }

        // --- 연속 성공 콤보: SSR 가중치 보너스 (최대 +15) ---
        if (fish.grade === 'SSR' && comboCount > 0) {
            weight += Math.min(15, comboCount * 0.4);
        }

        // --- 마일스톤 달성 시 N, R 등급 확률 대폭 감소 (1/2, 1/4, 1/8) ---
        if (pm && pm.fishMilestonesSeen && pm.fishMilestonesSeen[fish.id] && (fish.grade === 'N' || fish.grade === 'R')) {
            const milestones = pm.fishMilestonesSeen[fish.id];
            if (milestones[30]) {
                weight = weight * 0.125; // 1/8
            } else if (milestones[15]) {
                weight = weight * 0.25;  // 1/4
            } else if (milestones[5]) {
                weight = weight * 0.5;   // 1/2
            }
        }

        // --- 최초 5분 보호: 쉬운 등급은 더 자주, 어려운 등급은 등장하지 않음 ---
        if (isTutorialBoostActive) {
            if (fish.grade === 'N' || fish.grade === 'R') {
                weight *= 2;
            } else if (fish.grade === 'SR' || fish.grade === 'SSR') {
                weight = 0;
            }
        }

        totalWeight += weight;
        return { ...fish, weight };
    });

    let randomVal = Math.random() * totalWeight;
    for (const fish of adjustedWeights) {
        if (randomVal < fish.weight) {
            return fish;
        }
        randomVal -= fish.weight;
    }

    // Fallback
    return adjustedWeights[0];
};
