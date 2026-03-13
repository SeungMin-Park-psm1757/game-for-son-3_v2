export const WEEKLY_EVENT_ROTATION = [
    {
        id: 'event_weekly_moon',
        name: '월광 물고기 주간',
        shortName: '월광 주간',
        banner: '🌙 월광 물고기 출현',
        description: '달빛이 번지는 날에는 월광 잉어가 조용히 모습을 드러낸다.',
        regions: [1, 2],
        eventFishId: 'fish_moon_carp',
        weekendBossLabel: '월광 보스',
        warning: '달빛 비늘이 반짝인다! 월광 물고기가 다가온다!',
        overlayTone: 0xc7d8ff,
        accentColor: '#dbe7ff',
        cardEmoji: '🌙'
    },
    {
        id: 'event_weekly_storm',
        name: '폭풍우 사냥 주간',
        shortName: '폭풍 주간',
        banner: '⛈️ 폭풍우 사냥 시작',
        description: '파도가 거칠어질수록 폭풍 참치와 주말 보스가 바다를 뒤흔든다.',
        regions: [3, 4],
        eventFishId: 'fish_storm_tuna',
        weekendBossLabel: '폭풍 보스',
        warning: '번개 같은 그림자가 스친다! 폭풍 물고기다!',
        overlayTone: 0x87c8ff,
        accentColor: '#b7ecff',
        cardEmoji: '⛈️'
    }
];

function getWeekNumber(date) {
    const utc = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const day = utc.getUTCDay() || 7;
    utc.setUTCDate(utc.getUTCDate() + 4 - day);
    const yearStart = new Date(Date.UTC(utc.getUTCFullYear(), 0, 1));
    return Math.ceil((((utc - yearStart) / 86400000) + 1) / 7);
}

export function getCurrentWeeklyEvent(date = new Date()) {
    const weekNumber = getWeekNumber(date);
    return WEEKLY_EVENT_ROTATION[(weekNumber - 1) % WEEKLY_EVENT_ROTATION.length];
}

export function isWeekendEventDay(date = new Date()) {
    const day = date.getDay();
    return day === 0 || day === 6;
}

export function isWeeklyEventRegion(eventInfo, region) {
    return !!eventInfo && eventInfo.regions.includes(region);
}

