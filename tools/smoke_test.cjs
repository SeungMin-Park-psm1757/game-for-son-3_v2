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
    await page.screenshot({path:path.join(outputDir,'mobile-intro.png'),fullPage:true});
    const combos=await page.evaluate(()=>{
      window.gameManagers.uiManager.openComboBook();
      const popup=document.getElementById('combo-book-popup');
      const ret={goals:popup?.querySelectorAll('.combo-goal-card').length,cards:popup?.querySelectorAll('.combo-card').length};
      document.getElementById('combo-book-close-btn').click();return ret;
    });
    assert(combos.goals>=1&&combos.cards>=10,'Combo book fails to render');
    await page.evaluate(()=>window.gameManagers._phaserGame.scene.start('AquariumScene'));
    await page.waitForFunction(()=>window.gameManagers?._phaserGame?.scene?.isActive('AquariumScene'),null,{timeout:8000}).catch(async (error) => {
      const states=await page.evaluate(()=>window.gameManagers?._phaserGame?.scene?.getScenes(true).map(s=>s.scene.key));
      throw new Error('Aquarium did not stay active; active scenes: '+JSON.stringify(states)+'; pageErrors='+JSON.stringify(pageErrors)+'; consoleErrors='+JSON.stringify(consoleErrors)+'; '+error.message);
    });
    const aquarium=await page.evaluate(()=>{
      const scene=window.gameManagers._phaserGame.scene.getScene('AquariumScene');
      scene.toggleMagnifier(true);
      scene.updateMagnifier(360,40);
      const top=scene.magPointerY;
      const width=scene.magZoomCanvas.width;
      scene.updateMagnifier(360,1240);
      const bottom=scene.magPointerY;
      const lens=scene.magLensEl.getBoundingClientRect();
      const stages=scene.fishes.filter(f=>['fish_pirami','fish_carp','fish_tuna'].includes(f.texture.key)).map(f=>({id:f.texture.key,stage:f.growthStage}));
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
    await page.screenshot({path:path.join(outputDir,'mobile-aquarium.png'),fullPage:true});
    await page.evaluate(()=>window.gameManagers._phaserGame.scene.start('GameScene',{region:1}));
    await page.waitForFunction(()=>window.gameManagers?._phaserGame?.scene?.isActive('GameScene'));
    const fishing=await page.evaluate(()=>{
      const scene=window.gameManagers._phaserGame.scene.getScene('GameScene');
      const fishCount=scene.wanderingFishes.length;
      const widths=scene.wanderingFishes.map(f=>f.displayWidth);
      scene.startApproach(scene.scale.width/2,scene.scale.height*.55);
      return {fishCount,widths,gameState:scene.gameState};
    });
    assert(fishing.fishCount>=4&&fishing.fishCount<=7,'No ambient fish');
    assert(fishing.widths.every(w=>w>=70&&w<=300),'Fish display size invalid');
    assert(fishing.gameState==='APPROACH','Fishing did not start');
    await page.screenshot({path:path.join(outputDir,'mobile-fishing.png'),fullPage:true});
    assert(pageErrors.length===0,'Page errors: '+pageErrors.join(' | '));
    assert(consoleErrors.length===0,'Console errors: '+consoleErrors.join(' | '));
    console.log(JSON.stringify({header,combos,aquarium,fishing,pageErrors,consoleErrors},null,2));
  } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
