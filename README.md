# 🎣 정우의 낚시 대모험 — v3 개발 브랜치

[![GitHub Pages Deployment](https://img.shields.io/badge/Live-Play_Now-brightgreen?style=for-the-badge&logo=github)](https://seungmin-park-psm1757.github.io/game-for-son-3_v2/)

> ⚠️ 아래 GitHub Pages 라이브 링크는 여전히 **main의 기존 게임**입니다. 이 브랜치의 변경사항은 검증 중이며 자동 배포·병합하지 않았습니다.\n\n> **"아빠가 데려다줄게! 정우는 우리 가족을 위해 바다로!"**  
> 정우가 배고픈 여동생 세연이를 위해 낚시로 돈을 벌어다주는 따뜻하고 코믹한 가족 이야기 중심의 도트 낚시 게임입니다.

---

## 🎮 지금 바로 플레이하기
아래 링크를 클릭하여 별도의 설치 없이 브라우저에서 바로 플레이하세요:  
🚀 **[정우의 낚시 대모험 플레이하기 (https://seungmin-park-psm1757.github.io/game-for-son-3_v2/)](https://seungmin-park-psm1757.github.io/game-for-son-3_v2/)**

---

## ✨ 핵심 특징

### 🏠 따뜻하고 재밌는 가족 스토리
- **4인의 가족 캐릭터**: 아빠, 엄마, 세연, 정우의 개성 넘치는 초상화와 이벤트 장면.
- **챕터별 진행**: 민물(Chapter 1) -> 연안(Chapter 2) -> 먼바다(Chapter 3) -> 보물섬(Chapter 4)으로 이어지는 성장 스토리.
- **감동(?)의 엔딩**: 원양어선에 타게 되는 정우와 이를 말리는 가족들의 코믹한 결말.

### 🎣 생동감 넘치는 낚시 시스템
- **연타 낚시**: 등급과 장비 레벨에 맞춘 게이지·연타 조절 및 희귀 어종 포획 확대 연출.
- **피버 타임 (Fever Time)**: 연속 실패 시 발생하는 무적의 피버 모드.
- **수학 퀴즈 엔터테인먼트**: 물고기를 잡을 때마다 나오는 간단한 퀴즈로 추가 골드 획득!
- **로또 행운**: 낚싯대 행운(Luck) 스탯에 따라 보너스 코인 주머니 드랍.

### 💎 고품질 도트 비주얼 & 아쿠아리움
- **AI 기반 프리미엄 도트 아트**: 아빠(군복), 엄마, 정우, 세연의 개성 넘치는 초상화와 수십 종의 물고기 에셋.
- **아쿠아리움 씬**: 내가 잡은 물고기들을 구경할 수 있는 전용 수족관 공간 추가.
- **6단계 장비 진화**: 목재 -> 철 -> 황금 -> 아쿠아마린 -> 크리스탈 -> 궁극으로 이어지는 낚싯대 업그레이드.

### 📱 모바일 최적화 (Mobile Optimized)
- **세로형 720×1280 기준**: 모바일에서 상단 정보는 두 줄로 배치하고 주요 버튼의 터치 영역을 확보합니다.
- **터치 스크롤 지원**: 모바일에서도 상점과 도감 리스트를 부드럽게 확인 가능.

---

## 🛠 기술 스택
- **Engine**: Phaser 3 (JavaScript Game Framework)
- **Language**: JavaScript (ES6+), Python (Asset Automation)
- **Design**: AI-assisted Pixel Art Generation
- **Deployment**: GitHub Pages

---

## 🚀 로컬에서 실행하기

1. 저장소를 클론합니다:
   ```bash
   git clone https://github.com/SeungMin-Park-psm1757/game-for-son-3_v2.git
   ```
2. 로컬 서버를 실행합니다:
   ```bash
   npx serve .
   ```
3. `http://localhost:3000` (또는 지정된 포트)에서 확인하세요.

---

## 📜 라이선스
개인 학습 및 가족 선물용 프로젝트입니다. 아들에게 주는 소중한 선물을 함께 즐겨주세요! ❤️

---

## 🧪 v3 브랜치 검증

```bash
npm test
# 390×844 터치형 Chromium 브라우저 테스트:
# python3 -m http.server 4187 & npm run test:browser
python3 -m pip install Pillow
npm run audit:fish-assets
python3 tools/audit_scene_assets.py
```

이미지 정책은 `src/utils/FishAssetPolicy.js`, 결과물은 `reports/fish_asset_audit.*`와 `reports/scene_asset_audit.*`에 생성됩니다. 기본 이미지는 읽기 전용 검사입니다. `npm run normalize:fish-assets`는 디테일 유지 조건을 충족하는 대형 원본만 **축소**하며, 저해상도를 강제 확대하거나 디자인을 바꾸지 않습니다.

[단계별 커밋 및 복구 안내](docs/v3-phased-plan.md) · [이미지 검수 및 잔여 작업](docs/image-qa.md)

**알려진 원본 제약:** 참치·개복치는 256px 원본의 실효 선명도가 부족하며, 4개 지역 배경의 원본도 720×1280 목표보다 작습니다. 원본 그림의 새 고해상도 버전이 없는 한 단순 업스케일로 해결한 것으로 취급하지 않습니다.
