export const PRAISE_ALBUM_ENTRIES = [
    {
        id: 'first_boss_clear',
        emoji: '🏆',
        title: '첫 보스 클리어',
        speaker: '아빠',
        text: '정우야, 큰 고기 앞에서도 침착했네. 정말 멋졌다!',
        lockedText: '첫 보스를 이기면 가족 칭찬이 열려요.'
    },
    {
        id: 'boss_rematch_win',
        emoji: '🔥',
        title: '보스 재도전 성공',
        speaker: '엄마',
        text: '다시 도전해서 해냈구나. 포기하지 않는 마음이 최고야!',
        lockedText: '다시 만난 보스를 이겨 보면 열려요.'
    },
    {
        id: 'first_combo_complete',
        emoji: '🧩',
        title: '첫 조합 발견',
        speaker: '세연',
        text: '우와, 이 조합을 찾아내다니 오빠 진짜 대단해!',
        lockedText: '조합 도감을 하나 완성하면 열려요.'
    },
    {
        id: 'aquarium_growth',
        emoji: '🐠',
        title: '수족관 성장',
        speaker: '상점 할아버지',
        text: '물고기들이 쑥쑥 자라는구나. 정성껏 돌본 보람이 있네!',
        lockedText: '수족관 물고기 성장 단계가 열리면 보여요.'
    },
    {
        id: 'aquarium_decor_theme',
        emoji: '🏝️',
        title: '우리 집 바다',
        speaker: '엄마',
        text: '정우가 꾸민 수족관이 따뜻한 우리 집 바다 같아.',
        lockedText: '수족관 장식 테마 반응을 보면 열려요.'
    },
    {
        id: 'aquarium_recognition',
        emoji: '💛',
        title: '물고기들이 알아봐요',
        speaker: '세연',
        text: '물고기들이 정우를 알아보고 먼저 다가오는 것 같아!',
        lockedText: '특별간식을 자주 챙겨 주면 열려요.'
    },
    {
        id: 'event_card_found',
        emoji: '🃏',
        title: '이벤트 카드 발견',
        speaker: '아빠',
        text: '오늘도 새로운 단서를 찾았구나. 관찰력이 정말 좋다!',
        lockedText: '이벤트 카드를 발견하면 열려요.'
    },
    {
        id: 'daily_missions_all_done',
        emoji: '🌟',
        title: '오늘 미션 완료',
        speaker: '엄마',
        text: '오늘의 미션을 다 해냈네. 꾸준히 해내는 힘이 최고야!',
        lockedText: '오늘의 작은 미션 3개를 모두 완료하면 열려요.'
    }
];

export const PRAISE_ALBUM_BY_ID = Object.fromEntries(PRAISE_ALBUM_ENTRIES.map((entry) => [entry.id, entry]));
