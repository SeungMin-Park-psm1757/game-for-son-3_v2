const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const baseUrl = 'http://127.0.0.1:4187/index.html';
const outputDir = path.join(process.cwd(), 'test-output');
const saveData = {
  gold:18000,
  stats:{rodPower:6,catchChance:4,reelSpeed:5,rodLuck:2,focusRing:2},
  fishCollection:{fish_pirami:5,fish_carp:15,fish_tuna:30,fish_moon_carp:5,fish_storm_tuna:5,fish_flying_fish:5,fish_lionfish:5,fish_parrotfish:5,fish_anchovy:5,fish_mangdoong:5,fish_gizzard_shad:5},
  currentChapter:4,highestChapter:4,hasSeenFirstStory:true,
  hasSeenMidChapterEvent:{},fishMilestonesSeen:{fish_pirami:{5:true},fish_carp:{5:true,15:true},fish_tuna:{5:true,15:true,30:true}},
  snacksPurchased:{aquarium_swarm_snack:3,aquarium_follow_snack:1},
  decorPurchased:{aquarium_coral_garden:1,aquarium_shell_bed:1,aquarium_bubble_fountain:1,aquarium_treasure_castle:1,aquarium_kelp_arch:1},
  eventCards:{},bossDefeated:{},bossFailed:{2:1},bossDefeatedCount:{},maxLevelCelebrated:{},allMaxCelebrated:false,
  seyeonMaxEventSeen:{},comboBook:{},activeComboGoals:[],specialSnackFedCount:7,specialSnackBehaviorsSeen:{swarm_first:true,bubble_ring:true},
  aquariumMomentsSeen:{homeSeaStory:true,coralThemeStory:true},firstPlayStartedAt:Date.now()-600000,tutorialBoostEndsAt:Date.now()-300000
};
function assert(ok, message) {if(!ok) throw new Error(message);}

/** SceneManager.start does NOT stop another concurrently active scene. The
 * previous smoke test rendered the aquarium on top of all four fishing regions.
 * Stop every active scene first and ensure at least two actual render frames. */
async function openOnlyScene(page, key, config) {
  await page.evaluate(({key,config})=>{
    const manager=window.gameManagers._phaserGame.scene;
    for(const scene of manager.getScenes(true)) manager.stop(scene.scene.key);
    manager.start(key,config);
  },{key,config});
  await page.waitForFunction(key=>{
    const manager=window.gameManagers?._phaserGame?.scene;
    return manager?.isActive(key)&&manager.getScenes(true).length===1;
  },key,{timeout:12000});
  await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
  await page.waitForTimeout(100);
}
(async () => {
  fs.mkdirSync(outputDir,{recursive:true});
  const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
  const page=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:2,hasTouch:true,isMobile:true});
  const pageErrors=[];const consoleErrors=[];
  page.on('pageerror',e=>pageErrors.push(e.message));
  page.on('console',m=>{if(m.type()==='error')consoleErrors.push(m.text());});
  try {
    await page.goto(baseUrl,{waitUntil:'load',timeout:30000});
    await page.waitForFunction(()=>window.gameManagers?._phaserGame?.scene?.isActive('IntroScene'),{timeout:30000});
    await page.evaluate(d=>localStorage.setItem('fishingGameData',JSON.stringify(d)),saveData);
    await page.reload({waitUntil:'load'});
    await page.waitForFunction(()=>window.gameManagers?._phaserGame?.scene?.isActive('IntroScene'),{timeout:30000});
    const header=await page.evaluate(()=>{
      const bar=document.getElementById('persistent-ui');
      const gold=document.getElementById('gold-display').getBoundingClientRect();
      const goal=document.getElementById('late-goal-display').getBoundingClientRect();
      const buttons=['book-open-btn','mute-btn','shop-open-btn'].map(id=>document.getElementById(id).getBoundingClientRect());
      return {childIds:[...bar.children].map(n=>n.id),display:getComputedStyle(bar).display,
        gold:{left:gold.left,right:gold.right},goal:{left:goal.left,right:goal.right},
        buttons:buttons.map(r=>({left:r.left,right:r.right,height:r.height})),viewport:innerWidth};
    });
    assert(header.childIds.join(',')==='gold-display,late-goal-display,book-open-btn,mute-btn,shop-open-btn','Unexpected mobile header structure');
    assert(header.display==='grid','Expected two-row mobile grid');
    assert(header.gold.left>=0&&header.gold.right<=header.viewport,'Gold clipped on handset');
    assert(header.goal.left>=0&&header.goal.right<=header.viewport,'Goal clipped on handset');
    assert(header.buttons.every(x=>x.left>=0&&x.right<=header.viewport&&x.height>=43),'Tap target clipped/too short');
    const introFit=await page.evaluate(()=>{
      const s=window.gameManagers._phaserGame.scene.getScene('IntroScene');
      return {sx:s.bg.scaleX,sy:s.bg.scaleY,width:s.bg.displayWidth,height:s.bg.displayHeight};
    });
    assert(Math.abs(introFit.sx-introFit.sy)<0.001 && introFit.width>=720 && introFit.height>=1280,
      'Intro background must cover the viewport without distortion');
    await page.screenshot({path:path.join(outputDir,'mobile-intro.png'),fullPage:true});
    const textureFilters=await page.evaluate(()=>{
      const textures=window.gameManagers._phaserGame.textures;
      return Object.fromEntries(['fish_carp','fish_whale_shark','bg_coast','char_lv1']
        .map(key=>[key,textures.get(key).source[0].scaleMode]));
    });
    assert(textureFilters.fish_carp!==textureFilters.fish_whale_shark &&
      textureFilters.fish_whale_shark===textureFilters.bg_coast,
      'Texture interpolation policy missing');
    const combos=await page.evaluate(()=>{
      window.gameManagers.uiManager.openComboBook();
      const popup=document.getElementById('combo-book-popup');
      const ret={goals:popup?.querySelectorAll('.combo-goal-card').length,cards:popup?.querySelectorAll('.combo-card').length};
      document.getElementById('combo-book-close-btn').click();return ret;
    });
    assert(combos.goals>=1&&combos.cards>=10,'Combo book fails to render');
    await openOnlyScene(page,'AquariumScene');
    await page.evaluate(()=>window.gameManagers.uiManager.clearComboStickerCelebration());
    await page.screenshot({path:path.join(outputDir,'mobile-aquarium.png'),fullPage:true});
    const aquarium=await page.evaluate(()=>{
      const scene=window.gameManagers._phaserGame.scene.getScene('AquariumScene');
      scene.toggleMagnifier(true);
      scene.updateMagnifier(360,40);
      const top=scene.magPointerY;
      const width=scene.magZoomCanvas.width;
      scene.updateMagnifier(360,1240);
      const bottom=scene.magPointerY;
      const lens=scene.magLensEl.getBoundingClientRect();
      const stages=scene.fishes.filter(f=>['fish_pirami','fish_carp','fish_tuna'].includes(f.fishData.id)).map(f=>({id:f.fishData.id,stage:f.growthStage}));
      scene.openAquariumShop();const shopCount=scene.shopUi.length;scene.closeAquariumShop();
      scene.feedSpecialSnack('aquarium_swarm_snack');
      return {top,bottom,width,lens:{left:lens.left,right:lens.right,top:lens.top,bottom:lens.bottom},stages,
        decor:Object.keys(scene.decorObjects).length,shopCount,isFeeding:scene.isFeeding,
        reacted:scene.fishes.filter(f=>!!f.feedState).length,recognition:!!scene.model.specialSnackBehaviorsSeen.recognition,
        validY:scene.fishes.filter(f=>!f.isFixed).every(f=>f.minY<=f.maxY&&f.y>=f.minY&&f.y<=f.maxY),
        eventDecor:scene.fishes.filter(f=>['fish_moon_carp','fish_storm_tuna'].includes(f.fishData.id)).map(f=>({id:f.fishData.id,halo:!!f.eventAura,spark:!!f.eventSpark}))};
    });
    assert(aquarium.bottom>aquarium.top,'Magnifier did not reach lower tank');
    assert(aquarium.width>0&&aquarium.lens.left>=0&&aquarium.lens.right<=390,'Magnifier out of phone bounds');
    assert(aquarium.validY,'Fish outside their swimming band');
    assert(aquarium.eventDecor.length===2&&aquarium.eventDecor.every(x=>x.halo&&x.spark),'Special event fish visuals missing');
    const stages=Object.fromEntries(aquarium.stages.map(f=>[f.id,f.stage]));
    assert(stages.fish_pirami===0&&stages.fish_carp===1&&stages.fish_tuna===2,'Fish growth stages wrong');
    assert(aquarium.decor>=5&&aquarium.shopCount>0,'Aquarium decoration/shop not rendered');
    assert(aquarium.isFeeding&&aquarium.reacted>0&&aquarium.recognition,'Aquarium snack reaction failed');
    // Deterministic three-card award: regression coverage cannot depend on random unlock timing.
    await page.evaluate(()=>window.gameManagers.uiManager.showComboStickerCelebration([
      {id:'combo_coast_snack_friends',name:'연안 간식 친구들'},
      {id:'combo_treasure_scouts',name:'보물섬 정찰대'},
      {id:'combo_snack_swarm',name:'우르르 간식 파티'}
    ]));
    const stickerLayout=await page.evaluate(()=>{
      const burst=document.querySelector('.combo-sticker-burst');
      const cards=[...(burst?.querySelectorAll('.combo-sticker-burst-card')||[])].map(el=>{
        const r=el.getBoundingClientRect();
        return {left:r.left,right:r.right,width:r.width};
      });
      return {viewport:innerWidth,documentWidth:document.documentElement.scrollWidth,
        burst:!!burst,cards};
    });
    assert(stickerLayout.burst&&stickerLayout.cards.length===3,'Three-card award not visible');
    assert(stickerLayout.documentWidth<=stickerLayout.viewport+1,'Combo stickers cause horizontal scrolling');
    assert(stickerLayout.cards.every(r=>r.left>=-1&&r.right<=stickerLayout.viewport+1),
      'Combo sticker card rendered outside the phone viewport');
    await page.screenshot({path:path.join(outputDir,'mobile-awards.png'),fullPage:true});
    const alternateWidths=[];
    for(const width of [360,412]) {
      await page.setViewportSize({width,height:844});
      await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
      const layout=await page.evaluate(()=>{
        const header=document.getElementById('persistent-ui').getBoundingClientRect();
        const cards=[...document.querySelectorAll('.combo-sticker-burst-card')]
          .map(el=>el.getBoundingClientRect()).map(r=>({left:r.left,right:r.right}));
        return {viewport:innerWidth,documentWidth:document.documentElement.scrollWidth,
          header:{left:header.left,right:header.right},cards};
      });
      assert(layout.documentWidth<=width+1,'Horizontal overflow at '+width+'px');
      assert(layout.header.left>=-1&&layout.header.right<=width+1,'Header clipped at '+width+'px');
      assert(layout.cards.length===3&&layout.cards.every(c=>c.left>=-1&&c.right<=width+1),
        'Sticker clipped at '+width+'px');
      alternateWidths.push({width,layout});
      await page.screenshot({path:path.join(outputDir,'mobile-awards-'+width+'.png'),fullPage:true});
    }
    await page.setViewportSize({width:390,height:844});
    await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
    await page.evaluate(()=>window.gameManagers.uiManager.clearComboStickerCelebration());
    await openOnlyScene(page,'GameScene',{region:1});
    const fishing=await page.evaluate(()=>{
      const scene=window.gameManagers._phaserGame.scene.getScene('GameScene');
      const fishCount=scene.wanderingFishes.length;
      const widths=scene.wanderingFishes.map(f=>f.displayWidth);
      scene.startApproach(scene.scale.width/2,scene.scale.height*.55);
      return {fishCount,widths,gameState:scene.gameState,
        background:{key:scene.bg.texture.key,sx:scene.bg.scaleX,sy:scene.bg.scaleY,
          width:scene.bg.displayWidth,height:scene.bg.displayHeight}};
    });
    assert(fishing.fishCount>=4&&fishing.fishCount<=7,'No ambient fish');
    assert(fishing.widths.every(w=>w>=70&&w<=300),'Fish display size invalid');
    assert(fishing.gameState==='APPROACH','Fishing did not start');
    assert(Math.abs(fishing.background.sx-fishing.background.sy)<0.001 &&
      fishing.background.width>=720&&fishing.background.height>=1280,'Freshwater backdrop distorted');
    await page.screenshot({path:path.join(outputDir,'mobile-fishing.png'),fullPage:true});
    const rare=await page.evaluate(()=>{
      const scene=window.gameManagers._phaserGame.scene.getScene('GameScene');
      const reveal=scene.showCatchReveal({id:'fish_whale_shark',grade:'SSR'});
      return {active:!!reveal?.image?.active,width:reveal?.image?.displayWidth||0};
    });
    assert(rare.active&&rare.width>200&&rare.width<=446,'Rare fish art reveal failed');
    await page.screenshot({path:path.join(outputDir,'mobile-rare-reveal.png'),fullPage:true});
    // Check all original background assets in-game; do not infer visual quality from MIME type alone.
    for (const [region,key] of [[2,'bg_coast'],[3,'bg_sea'],[4,'bg_treasure_island']]) {
      await openOnlyScene(page,'GameScene',{region});
      await page.waitForFunction(({region,key})=>{
        const s=window.gameManagers?._phaserGame?.scene?.getScene('GameScene');
        return s?.scene?.isActive() && s.region===region && s.bg?.texture?.key===key;
      },{region,key},{timeout:12000});
      const background=await page.evaluate(()=>{
        const bg=window.gameManagers._phaserGame.scene.getScene('GameScene').bg;
        return {sx:bg.scaleX,sy:bg.scaleY,width:bg.displayWidth,height:bg.displayHeight};
      });
      assert(Math.abs(background.sx-background.sy)<0.001 &&
        background.width>=720 && background.height>=1280,'Backdrop distorted in region '+region);
      await page.screenshot({path:path.join(outputDir,'mobile-region-'+region+'.png'),fullPage:true});
    }
    assert(pageErrors.length===0,'Page errors: '+pageErrors.join(' | '));
    assert(consoleErrors.length===0,'Console errors: '+consoleErrors.join(' | '));
    console.log(JSON.stringify({header,combos,aquarium,stickerLayout,alternateWidths,fishing,pageErrors,consoleErrors},null,2));
  } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
