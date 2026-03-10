export default class BootScene extends Phaser.Scene {
    constructor() {
        super('BootScene');
    }

    preload() {
        console.log("BootScene: Preloading assets...");

        // 이미지 에셋 로드 (지역별 배경)
        this.load.image('bg_freshwater', 'assets/images/bg_freshwater.png');
        this.load.image('bg_coast', 'assets/images/bg_coast.png');
        this.load.image('bg_sea', 'assets/images/bg_sea.png');
        this.load.image('bg_treasure_island', 'assets/images/bg_treasure_island.png');
        this.load.image('lure', 'assets/images/lure.png');

        // 캐릭터 성장 스프라이트 변형 (Rod Power 1~20 레벨 전체 렌더링)
        for (let lv = 1; lv <= 20; lv++) {
            this.load.image(`char_lv${lv}`, `assets/images/char_lv${lv}.png`);
        }

        // 민물 (Region 1 - 8마리)
        this.load.image('fish_pirami', 'assets/images/fish_pirami.png');
        this.load.image('fish_loach', 'assets/images/fish_loach.png');
        this.load.image('fish_boonguh', 'assets/images/fish_boonguh.png');
        this.load.image('fish_smelt', 'assets/images/fish_smelt.png');
        this.load.image('fish_catfish', 'assets/images/fish_catfish.png');
        this.load.image('fish_ssogari', 'assets/images/fish_ssogari.png');
        this.load.image('fish_carp', 'assets/images/fish_carp.png');
        this.load.image('fish_gamulchi', 'assets/images/fish_gamulchi.png');

        // 연안 (Region 2 - 10마리)
        this.load.image('fish_mangdoong', 'assets/images/fish_mangdoong.png');
        this.load.image('fish_anchovy', 'assets/images/fish_anchovy.png');
        this.load.image('fish_gizzard_shad', 'assets/images/fish_gizzard_shad.png');
        this.load.image('fish_urock', 'assets/images/fish_urock.png');
        this.load.image('fish_webfoot_octopus', 'assets/images/fish_webfoot_octopus.png');
        this.load.image('fish_flounder', 'assets/images/fish_flounder.png');
        this.load.image('fish_gwangeo', 'assets/images/fish_gwangeo.png');
        this.load.image('fish_sea_bass', 'assets/images/fish_sea_bass.png');
        this.load.image('fish_black_porgy', 'assets/images/fish_black_porgy.png');
        this.load.image('fish_chamdom', 'assets/images/fish_chamdom.png');

        // 먼 바다 (Region 3 - 15마리)
        this.load.image('fish_godeungeo', 'assets/images/fish_godeungeo.png');
        this.load.image('fish_squid', 'assets/images/fish_squid.png');
        this.load.image('fish_saury', 'assets/images/fish_saury.png');
        this.load.image('fish_spanish_mackerel', 'assets/images/fish_spanish_mackerel.png');
        this.load.image('fish_salmon', 'assets/images/fish_salmon.png');
        this.load.image('fish_pollack', 'assets/images/fish_pollack.png');
        this.load.image('fish_galchi', 'assets/images/fish_galchi.png');
        this.load.image('fish_cod', 'assets/images/fish_cod.png');
        this.load.image('fish_monkfish', 'assets/images/fish_monkfish.png');
        this.load.image('fish_bangeo', 'assets/images/fish_bangeo.png');
        this.load.image('fish_tuna', 'assets/images/fish_tuna.png');
        this.load.image('fish_sunfish', 'assets/images/fish_sunfish.png');
        this.load.image('fish_striped_jewfish', 'assets/images/fish_striped_jewfish.png');
        this.load.image('fish_whale_shark', 'assets/images/fish_whale_shark.png');
        this.load.image('fish_cheongsaechi', 'assets/images/fish_cheongsaechi.png');

        // 스토리 캐릭터 초상화 로드
        this.load.image('char_dad', 'assets/images/char_dad.png');
        this.load.image('char_mom', 'assets/images/char_mom.png');
        this.load.image('char_seyeon', 'assets/images/char_seyeon.png');
        this.load.image('char_jeongwoo', 'assets/images/char_jeongwoo.png');
        this.load.image('char_shopkeeper', 'assets/images/char_shopkeeper.png');

        // 특별 아이템
        this.load.image('item_shoe', 'assets/images/item_shoe.png');
        this.load.image('item_trash', 'assets/images/item_trash.png');
        this.load.image('item_treasure', 'assets/images/item_treasure.png');

        // 보물섬 (Region 4 - 14마리)
        this.load.image('fish_flying_fish', 'assets/images/fish_flying_fish.png');
        this.load.image('fish_parrotfish', 'assets/images/fish_parrotfish.png');
        this.load.image('fish_lionfish', 'assets/images/fish_lionfish.png');
        this.load.image('fish_moray_eel', 'assets/images/fish_moray_eel.png');
        this.load.image('fish_barracuda', 'assets/images/fish_barracuda.png');
        this.load.image('fish_mahi_mahi', 'assets/images/fish_mahi_mahi.png');
        this.load.image('fish_giant_trevally', 'assets/images/fish_giant_trevally.png');
        this.load.image('fish_sailfish', 'assets/images/fish_sailfish.png');
        this.load.image('fish_hammerhead', 'assets/images/fish_hammerhead.png');
        this.load.image('fish_manta_ray', 'assets/images/fish_manta_ray.png');
        this.load.image('fish_giant_squid', 'assets/images/fish_giant_squid.png');
        this.load.image('fish_oarfish', 'assets/images/fish_oarfish.png');
        this.load.image('fish_coelacanth', 'assets/images/fish_coelacanth.png');
        this.load.image('fish_golden_fish', 'assets/images/fish_golden_fish.png');

        // 보물섬 전용 특수 아이템
        this.load.image('item_treasure_map', 'assets/images/item_treasure_map.png');
        this.load.image('item_pirates_sword', 'assets/images/item_pirates_sword.png');
        this.load.image('item_pearl', 'assets/images/item_pearl.png');
        this.load.image('item_crown', 'assets/images/item_crown.png');

        // 배경음악 로드
        this.load.audio('bgm', 'assets/audio/back.mp3');
    }

    create() {
        // 로드 완료 후 픽셀 아트 필터 적용 (NEAREST)
        const fishKeys = [
            'fish_pirami', 'fish_loach', 'fish_boonguh', 'fish_smelt', 'fish_catfish', 'fish_ssogari', 'fish_carp', 'fish_gamulchi',
            'fish_mangdoong', 'fish_anchovy', 'fish_gizzard_shad', 'fish_urock', 'fish_webfoot_octopus', 'fish_flounder', 'fish_gwangeo', 'fish_sea_bass', 'fish_black_porgy', 'fish_chamdom',
            'fish_godeungeo', 'fish_squid', 'fish_saury', 'fish_spanish_mackerel', 'fish_salmon', 'fish_pollack', 'fish_galchi', 'fish_cod', 'fish_monkfish', 'fish_bangeo', 'fish_tuna', 'fish_sunfish', 'fish_striped_jewfish', 'fish_whale_shark', 'fish_cheongsaechi',
            'fish_flying_fish', 'fish_parrotfish', 'fish_lionfish', 'fish_moray_eel', 'fish_barracuda', 'fish_mahi_mahi', 'fish_giant_trevally', 'fish_sailfish', 'fish_hammerhead', 'fish_manta_ray', 'fish_giant_squid', 'fish_oarfish', 'fish_coelacanth', 'fish_golden_fish',
            'item_shoe', 'item_trash', 'item_treasure', 'item_treasure_map', 'item_pirates_sword', 'item_pearl', 'item_crown'
        ];
        fishKeys.forEach(key => {
            const tex = this.textures.get(key);
            if (tex) tex.setFilter(Phaser.Textures.FilterMode.NEAREST);
        });

        // 에셋 로딩이 끝나면 IntroScene으로 전환
        this.scene.start('IntroScene');
    }
}
