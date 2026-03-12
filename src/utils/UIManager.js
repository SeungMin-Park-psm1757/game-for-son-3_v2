// DOM 오버레이를 담당하는 UI 모듈
// 상점, 퀴즈 팝업 등 Canvas 외부의 HTML 요소를 제어합니다.
import { FISH_TYPES } from '../models/FishData.js';
import { SPELLING_QUIZZES } from '../data/SpellingQuizData.js';
import {
    COMBO_BOOK_ENTRIES,
    getComboDiscoveryDate,
    getComboEntryById,
    getComboProgress
} from '../data/ComboBookData.js';

export default class UIManager {
    constructor(playerModel) {
        this.playerModel = playerModel;
        this.container = document.getElementById('ui-layer');
        this.isQuizActive = false;
        this.currentPopup = null;
        this.activeSpeechUtterance = null;
    }

    shuffleArray(items) {
        const shuffled = [...items];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    pickRandom(items) {
        return items[Math.floor(Math.random() * items.length)];
    }

    getRandomSpellingQuestion() {
        return this.pickRandom(SPELLING_QUIZZES);
    }

    stopSpeech() {
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
            window.speechSynthesis.cancel();
        }
        this.activeSpeechUtterance = null;
    }

    speakKoreanText(text) {
        if (typeof window === 'undefined' || !('speechSynthesis' in window)) return false;

        this.stopSpeech();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'ko-KR';
        utterance.rate = 0.92;
        utterance.pitch = 1;

        const voices = window.speechSynthesis.getVoices();
        const koreanVoice = voices.find((voice) => (voice.lang || '').toLowerCase().startsWith('ko'));
        if (koreanVoice) utterance.voice = koreanVoice;

        this.activeSpeechUtterance = utterance;
        window.speechSynthesis.speak(utterance);
        return true;
    }

    resetPopupState(restorePersistentUI = true) {
        this.stopSpeech();
        if (this.currentPopup) {
            this.currentPopup.remove();
            this.currentPopup = null;
        }
        this.container.innerHTML = '';
        this.container.style.pointerEvents = restorePersistentUI ? 'none' : 'auto';
        this.isQuizActive = false;
        if (restorePersistentUI) {
            this.renderPersistentUI();
        }
    }

    // --- 수학 퀴즈 시스템 (도상학 기반 물고기 아이콘 시각화) ---
    showMathQuiz(currentRegion = 1) {
        return new Promise((resolve) => {
            if (this.isQuizActive) { resolve(null); return; }
            // 보물섬은 60% 확률, 기본 50%
            const quizChance = currentRegion === 4 ? 0.60 : 0.50;
            if (Math.random() > quizChance) { resolve(null); return; }

            this.isQuizActive = true;
            this.container.style.pointerEvents = 'auto';

            const isChapter4 = currentRegion === 4;
            let n1, n2, operatorSymbol, correctAnswer;

            if (isChapter4) {
                // 챕터 4 하드모드: 곱셈 33%, 덧셈 33%, 뺄셈 33%
                const opType = Math.random();
                if (opType < 0.33) {
                    // 곱셈 (구구단 2~5단)
                    n1 = Math.floor(Math.random() * 4) + 2;  // 2~5
                    n2 = Math.floor(Math.random() * 9) + 1;  // 1~9
                    operatorSymbol = '×';
                    correctAnswer = n1 * n2;
                } else if (opType < 0.66) {
                    // 덧셈 (큰 숫자)
                    n1 = Math.floor(Math.random() * 21) + 10; // 10~30
                    n2 = Math.floor(Math.random() * 16) + 5;  // 5~20
                    operatorSymbol = '+';
                    correctAnswer = n1 + n2;
                } else {
                    // 뺄셈 (큰 숫자)
                    n1 = Math.floor(Math.random() * 21) + 15; // 15~35
                    n2 = Math.floor(Math.random() * 11) + 5;  // 5~15
                    if (n2 > n1) { const tmp = n1; n1 = n2; n2 = tmp; }
                    operatorSymbol = '−';
                    correctAnswer = n1 - n2;
                }
            } else {
                // 기존 챕터: 8세 난이도
                let rnd1 = Math.floor(Math.random() * 10) + 3;
                let rnd2 = Math.floor(Math.random() * 8) + 1;
                const isAddition = Math.random() > 0.5;
                n1 = Math.max(rnd1, rnd2);
                n2 = Math.min(rnd1, rnd2);
                if (isAddition) {
                    operatorSymbol = '+';
                    correctAnswer = n1 + n2;
                } else {
                    operatorSymbol = '−';
                    correctAnswer = n1 - n2;
                }
            }

            // 물고기 아이콘 렌더링 (챕터 4에서는 숨김)
            const renderFishIcons = (count) => {
                if (isChapter4) return '';
                let html = '';
                for (let i = 0; i < count; i++) {
                    html += '<span class="quiz-fish-icon">🐟</span>';
                }
                return html;
            };

            // 오답 보기 (챕터 4는 4개, 기본 3개)
            let wrong1 = correctAnswer + (Math.floor(Math.random() * 3) + 1);
            let wrong2 = correctAnswer - (Math.floor(Math.random() * 3) + 1);
            if (wrong2 < 0) wrong2 = correctAnswer + (Math.floor(Math.random() * 5) + 2);
            let choices;
            if (isChapter4) {
                let wrong3 = correctAnswer + (Math.floor(Math.random() * 5) + 4);
                if (wrong3 === wrong1 || wrong3 === wrong2) wrong3 = correctAnswer + (Math.floor(Math.random() * 8) + 5);
                choices = [correctAnswer, wrong1, wrong2, wrong3].sort(() => Math.random() - 0.5);
            } else {
                choices = [correctAnswer, wrong1, wrong2].sort(() => Math.random() - 0.5);
            }

            const quizTitle = isChapter4 ? '🏴‍☠️ 보물섬 난이도 UP! 퀴즈! 🏴‍☠️' : '🐟 보너스 퀴즈 타임! 🐟';
            const quizHint = isChapter4 ? '머리로 계산해보세요!' : '물고기를 세어보세요!';

            const fishIconArea = isChapter4 ? '' : `
                    <div class="quiz-icon-area">
                        <div class="quiz-fish-group">
                            ${renderFishIcons(n1)}
                        </div>
                        <div class="quiz-operator">${operatorSymbol}</div>
                        <div class="quiz-fish-group">
                            ${renderFishIcons(n2)}
                        </div>
                        <div class="quiz-operator">=</div>
                        <div class="quiz-answer-mark">?</div>
                    </div>`;

            const choiceButtonsHTML = choices.map(c =>
                `<button class="choice-btn" data-answer="${c}">${c}</button>`
            ).join('\n                        ');

            const popupHTML = `
                <div id="quiz-popup" class="popup-box quiz-shake">
                    <h2>${quizTitle}</h2>
                    <p style="font-size:18px; color:#666; margin-bottom:10px;">${quizHint}</p>
                    ${fishIconArea}
                    <p class="quiz-question" style="font-size:28px; margin-top:10px;">${n1} ${operatorSymbol} ${n2} = ?</p>
                    <div class="quiz-choices">
                        ${choiceButtonsHTML}
                    </div>
                </div>
            `;

            this.container.innerHTML = popupHTML;
            this.currentPopup = document.getElementById('quiz-popup');

            const buttons = this.container.querySelectorAll('.choice-btn');
            buttons.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const selected = parseInt(e.target.getAttribute('data-answer'));
                    const isCorrect = selected === correctAnswer;
                    if (isCorrect) window.gameManagers.soundManager.playSuccess();
                    else window.gameManagers.soundManager.playError();
                    this.handleQuizResult(isCorrect, btn);
                    setTimeout(() => { this.closePopup(); resolve(isCorrect); }, 1200);
                });
            });
        });
    }

    handleQuizResult(isCorrect, clickedBtn) {
        const buttons = this.container.querySelectorAll('.choice-btn');
        buttons.forEach(btn => btn.disabled = true);
        if (isCorrect) {
            clickedBtn.classList.add('correct');
            clickedBtn.innerHTML += ' ⭕';
            const praise = document.createElement('div');
            praise.className = 'praise-text';
            praise.innerText = '정답! 보너스 20% 추가!';
            this.currentPopup.appendChild(praise);
        } else {
            clickedBtn.classList.add('wrong');
            clickedBtn.innerHTML += ' ❌';
            const penalty = document.createElement('div');
            penalty.className = 'penalty-text';
            penalty.innerText = '오답! 금액 50% 삭감...';
            this.currentPopup.appendChild(penalty);
        }
    }

    // --- 주문 외우기 (타이핑 퀴즈 리디자인) ---
    showMathQuizSecondChance(currentRegion = 1) {
        return new Promise((resolve) => {
            if (this.isQuizActive) { resolve(null); return; }

            const quizChance = currentRegion === 4 ? 0.60 : 0.50;
            if (Math.random() > quizChance) { resolve(null); return; }

            this.isQuizActive = true;
            this.container.style.pointerEvents = 'auto';

            const isChapter4 = currentRegion === 4;
            let n1, n2, operatorSymbol, correctAnswer;

            if (isChapter4) {
                const opType = Math.random();
                if (opType < 0.33) {
                    n1 = Math.floor(Math.random() * 4) + 2;
                    n2 = Math.floor(Math.random() * 9) + 1;
                    operatorSymbol = '×';
                    correctAnswer = n1 * n2;
                } else if (opType < 0.66) {
                    n1 = Math.floor(Math.random() * 21) + 10;
                    n2 = Math.floor(Math.random() * 16) + 5;
                    operatorSymbol = '+';
                    correctAnswer = n1 + n2;
                } else {
                    n1 = Math.floor(Math.random() * 21) + 15;
                    n2 = Math.floor(Math.random() * 11) + 5;
                    if (n2 > n1) { const tmp = n1; n1 = n2; n2 = tmp; }
                    operatorSymbol = '-';
                    correctAnswer = n1 - n2;
                }
            } else {
                const rnd1 = Math.floor(Math.random() * 10) + 3;
                const rnd2 = Math.floor(Math.random() * 8) + 1;
                const isAddition = Math.random() > 0.5;
                n1 = Math.max(rnd1, rnd2);
                n2 = Math.min(rnd1, rnd2);
                if (isAddition) {
                    operatorSymbol = '+';
                    correctAnswer = n1 + n2;
                } else {
                    operatorSymbol = '-';
                    correctAnswer = n1 - n2;
                }
            }

            const renderFishIcons = (count) => {
                if (isChapter4) return '';
                let html = '';
                for (let i = 0; i < count; i++) {
                    html += '<span class="quiz-fish-icon">🐟</span>';
                }
                return html;
            };

            const choiceSet = new Set([correctAnswer]);
            while (choiceSet.size < 4) {
                const offset = Math.floor(Math.random() * (isChapter4 ? 8 : 5)) + 1;
                const direction = Math.random() > 0.5 ? 1 : -1;
                const candidate = Math.max(0, correctAnswer + (offset * direction));
                choiceSet.add(candidate);
            }
            const choices = [...choiceSet].sort(() => Math.random() - 0.5);

            const quizTitle = isChapter4 ? '🏴‍☠️ 보물섬 퀴즈! 🏴‍☠️' : '🐟 보너스 퀴즈 타임! 🐟';
            const quizHint = '틀려도 한 번 더 생각할 수 있어요!';

            const fishIconArea = isChapter4 ? '' : `
                    <div class="quiz-icon-area">
                        <div class="quiz-fish-group">
                            ${renderFishIcons(n1)}
                        </div>
                        <div class="quiz-operator">${operatorSymbol}</div>
                        <div class="quiz-fish-group">
                            ${renderFishIcons(n2)}
                        </div>
                        <div class="quiz-operator">=</div>
                        <div class="quiz-answer-mark">?</div>
                    </div>`;

            const choiceButtonsHTML = choices.map(c =>
                `<button class="choice-btn" data-answer="${c}">${c}</button>`
            ).join('\n                        ');

            const popupHTML = `
                <div id="quiz-popup" class="popup-box quiz-shake">
                    <h2>${quizTitle}</h2>
                    <p style="font-size:18px; color:#666; margin-bottom:10px;">${quizHint}</p>
                    ${fishIconArea}
                    <p class="quiz-question" style="font-size:28px; margin-top:10px;">${n1} ${operatorSymbol} ${n2} = ?</p>
                    <div class="quiz-choices">
                        ${choiceButtonsHTML}
                    </div>
                    <div id="quiz-feedback"></div>
                </div>
            `;

            this.container.innerHTML = popupHTML;
            this.currentPopup = document.getElementById('quiz-popup');

            const buttons = [...this.container.querySelectorAll('.choice-btn')];
            const feedback = document.getElementById('quiz-feedback');
            let usedSecondChance = false;
            let settled = false;

            const showFeedback = (message, className) => {
                feedback.className = className;
                feedback.textContent = message;
            };

            const disableAllButtons = () => {
                buttons.forEach(btn => { btn.disabled = true; });
            };

            const finishQuiz = (result) => {
                if (settled) return;
                settled = true;
                setTimeout(() => {
                    this.closePopup();
                    resolve(result);
                }, 1300);
            };

            const removeOneWrongChoice = (clickedBtn) => {
                const removableButtons = buttons.filter(btn => {
                    if (btn === clickedBtn || btn.disabled) return false;
                    return parseInt(btn.getAttribute('data-answer'), 10) !== correctAnswer;
                });

                if (removableButtons.length === 0) return;

                const removedBtn = removableButtons[Math.floor(Math.random() * removableButtons.length)];
                removedBtn.disabled = true;
                removedBtn.classList.add('eliminated');
                removedBtn.textContent = 'X';
            };

            buttons.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    if (settled) return;

                    const clickedBtn = e.currentTarget;
                    const selected = parseInt(clickedBtn.getAttribute('data-answer'), 10);

                    if (selected === correctAnswer) {
                        window.gameManagers.soundManager.playSuccess();
                        disableAllButtons();
                        clickedBtn.classList.add('correct');
                        if (usedSecondChance) {
                            showFeedback('정답! 다시 생각해서 맞췄어요! 보너스 +10%', 'praise-text');
                            finishQuiz({ correct: true, attempt: 2 });
                        } else {
                            showFeedback('정답! 보너스 +20% 획득!', 'praise-text');
                            finishQuiz({ correct: true, attempt: 1 });
                        }
                        return;
                    }

                    window.gameManagers.soundManager.playError();
                    clickedBtn.disabled = true;
                    clickedBtn.classList.add('wrong');

                    if (!usedSecondChance) {
                        usedSecondChance = true;
                        removeOneWrongChoice(clickedBtn);
                        showFeedback('괜찮아! 틀린 보기 하나를 지웠어요. 한 번 더!', 'hint-text');
                        return;
                    }

                    disableAllButtons();
                    showFeedback('아쉽지만 괜찮아! 이번엔 보너스 없이 진행해요.', 'penalty-text');
                    finishQuiz({ correct: false, attempt: 2 });
                });
            });
        });
    }

    showTypingQuiz() {
        return new Promise((resolve) => {
            if (this.isQuizActive) { resolve(false); return; }
            this.isQuizActive = true;
            this.container.style.pointerEvents = 'auto';

            // 마법 주문 콘셉트 단어 20개 (유아 수준의 쉬운 단어, 비속어 제외)
            const wordList = [
                '빛나라', '잡혀라', '신난다', '즐겁다', '행복해',
                '반짝반짝', '멋지다', '최고야', '힘내자', '영차영차',
                '물고기', '바다몽', '기쁘다', '사랑해', '웃자웃어',
                '함께해', '파이팅', '건강해', '씩씩하게', '고마워'
            ];
            const targetWord = wordList[Math.floor(Math.random() * wordList.length)];

            const popupHTML = `
                <div id="quiz-popup" class="popup-box" style="border: 4px solid #9370DB; background: #F8F8FF;">
                    <h2 style="color: #8A2BE2; text-shadow: 1px 1px 0 #DDA0DD;">✨ 낚시 주문 시전! ✨</h2>
                    <p style="font-size:20px; color:#4B0082; margin-bottom:15px;">아래 주문을 똑같이 외워주세요!</p>
                    <div class="typing-word-area" style="background: #E6E6FA; border: 2px dashed #9370DB;">
                        <span class="typing-target" style="color: #4B0082; font-family: serif; font-weight: bold;">"${targetWord}"</span>
                    </div>
                    <div class="quiz-input-area">
                        <input type="text" id="typing-input" class="quiz-input" autocomplete="off" autofocus placeholder="마법 주문 입력..." style="border: 2px solid #BA55D3;" />
                    </div>
                    <div id="typing-feedback" style="margin-top:15px; min-height:30px; font-weight:bold; font-size: 18px;"></div>
                    <button id="typing-submit-btn" class="choice-btn" style="margin-top:20px; font-size:24px; width:80%; background-color: #9370DB;">시전!</button>
                    <!-- 마법진 연출용 -->
                    <div id="magic-circle" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) scale(0); width: 200px; height: 200px; border-radius: 50%; border: 10px solid rgba(138,43,226,0.3); box-shadow: 0 0 30px #8A2BE2; pointer-events: none; transition: transform 0.5s ease-out, opacity 0.5s;"></div>
                </div>
            `;

            this.container.innerHTML = popupHTML;
            this.currentPopup = document.getElementById('quiz-popup');
            const inputField = document.getElementById('typing-input');
            const submitBtn = document.getElementById('typing-submit-btn');
            const feedbackArea = document.getElementById('typing-feedback');
            const magicCircle = document.getElementById('magic-circle');

            // 포커스 강제 (모바일 대응 고려)
            setTimeout(() => inputField.focus(), 100);

            const checkAnswer = () => {
                const userInput = inputField.value.trim();
                const isCorrect = userInput === targetWord;

                inputField.disabled = true;
                submitBtn.disabled = true;

                if (isCorrect) {
                    window.gameManagers.soundManager.playSuccess();
                    feedbackArea.style.color = '#8A2BE2';
                    feedbackArea.innerText = '✨ 주문 영창 성공! 마력이 깃듭니다! ✨ (보너스 20%)';
                    inputField.style.backgroundColor = '#E6E6FA';

                    // 마법진 효과
                    magicCircle.style.transform = 'translate(-50%, -50%) scale(1.5)';
                    magicCircle.style.opacity = '1';
                    setTimeout(() => magicCircle.style.opacity = '0', 800);
                } else {
                    window.gameManagers.soundManager.playError();
                    feedbackArea.style.color = '#DC143C';
                    feedbackArea.innerText = `주문 실패! 마력이 흩어졌습니다... ('${targetWord}')`;
                    inputField.classList.add('wrong-input');
                }

                setTimeout(() => {
                    this.closePopup();
                    resolve(isCorrect);
                }, 1800);
            };

            submitBtn.addEventListener('click', checkAnswer);
            inputField.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') checkAnswer();
            });
        });
    }

    openSpellingPracticeHub() {
        if (this.isQuizActive) return;

        this.hidePersistentUI();
        this.container.style.pointerEvents = 'auto';

        const popupHTML = `
            <div id="spelling-hub-popup" class="popup-box spelling-hub-popup">
                <h2>받침 맞춤법 연습</h2>
                <p class="spelling-hub-copy">총 ${SPELLING_QUIZZES.length}문제예요. 음성을 듣고 보기 4개 중에서 맞는 말을 골라 보세요.</p>
                <div class="spelling-hub-actions">
                    <button id="spelling-practice-random-btn" class="choice-btn spelling-action-btn">랜덤 1문제</button>
                    <button id="spelling-practice-list-btn" class="choice-btn spelling-action-btn secondary-choice-btn">50문제 보기</button>
                    <button id="spelling-practice-close-btn" class="choice-btn spelling-action-btn secondary-choice-btn">닫기</button>
                </div>
            </div>
        `;

        this.container.innerHTML = popupHTML;
        this.currentPopup = document.getElementById('spelling-hub-popup');

        document.getElementById('spelling-practice-random-btn').onclick = () => {
            this.showSpellingQuiz({ practiceMode: true });
        };
        document.getElementById('spelling-practice-list-btn').onclick = () => {
            this.showSpellingQuizList();
        };
        document.getElementById('spelling-practice-close-btn').onclick = () => {
            this.closePopup();
        };
    }

    showSpellingQuizList() {
        if (this.isQuizActive) return;

        this.hidePersistentUI();
        this.container.style.pointerEvents = 'auto';

        const listHTML = SPELLING_QUIZZES.map((question, index) => `
            <div class="spelling-list-card">
                <div class="spelling-list-header">
                    <strong>${index + 1}번</strong>
                    <button class="secondary-choice-btn spelling-list-test-btn" data-question-index="${index}">이 문제 풀기</button>
                </div>
                <p class="spelling-list-sentence">${question.spokenText}</p>
                <p class="spelling-list-prompt">${question.promptText}</p>
                <div class="spelling-list-choices">
                    ${question.choices.map((choice) => `
                        <span class="spelling-choice-chip ${choice === question.answer ? 'correct-choice-chip' : ''}">${choice}</span>
                    `).join('')}
                </div>
                <p class="spelling-list-answer">정답: ${question.answer}</p>
            </div>
        `).join('');

        const popupHTML = `
            <div id="spelling-list-popup" class="popup-box spelling-list-popup">
                <div class="spelling-list-toolbar">
                    <div>
                        <h2>맞춤법 50문제 목록</h2>
                        <p>카드에서 정답을 바로 확인하거나 원하는 문제를 바로 테스트할 수 있어요.</p>
                    </div>
                    <div class="spelling-list-toolbar-actions">
                        <button id="spelling-list-random-btn" class="secondary-choice-btn">랜덤 문제</button>
                        <button id="spelling-list-back-btn" class="secondary-choice-btn">연습 메뉴</button>
                        <button id="spelling-list-close-btn" class="secondary-choice-btn">닫기</button>
                    </div>
                </div>
                <div class="spelling-list-grid">
                    ${listHTML}
                </div>
            </div>
        `;

        this.container.innerHTML = popupHTML;
        this.currentPopup = document.getElementById('spelling-list-popup');

        document.getElementById('spelling-list-random-btn').onclick = () => {
            this.showSpellingQuiz({ practiceMode: true, returnToList: true });
        };
        document.getElementById('spelling-list-back-btn').onclick = () => {
            this.openSpellingPracticeHub();
        };
        document.getElementById('spelling-list-close-btn').onclick = () => {
            this.closePopup();
        };

        this.container.querySelectorAll('.spelling-list-test-btn').forEach((button) => {
            button.addEventListener('click', () => {
                const questionIndex = parseInt(button.getAttribute('data-question-index'), 10);
                this.showSpellingQuiz({
                    practiceMode: true,
                    questionIndex,
                    returnToList: true
                });
            });
        });
    }

    showSpellingQuiz({ practiceMode = false, questionIndex = null, returnToList = false } = {}) {
        return new Promise((resolve) => {
            if (this.isQuizActive) { resolve(false); return; }

            const baseQuestion = Number.isInteger(questionIndex)
                ? SPELLING_QUIZZES[questionIndex]
                : this.getRandomSpellingQuestion();

            if (!baseQuestion) { resolve(false); return; }

            this.isQuizActive = true;
            this.hidePersistentUI();
            this.container.style.pointerEvents = 'auto';

            const question = {
                ...baseQuestion,
                choices: this.shuffleArray(baseQuestion.choices)
            };
            const supportsTts = typeof window !== 'undefined' && 'speechSynthesis' in window;

            const popupHTML = `
                <div id="quiz-popup" class="popup-box spelling-quiz-popup quiz-shake">
                    <h2>받침 맞춤법 퀴즈</h2>
                    <p class="spelling-quiz-copy">
                        ${practiceMode ? '연습 모드예요. 음성을 듣고 빈칸에 들어갈 말을 골라 보세요.' : '보너스 퀴즈예요. 맞히면 추가 보너스 +20%!'}
                    </p>
                    <div class="spelling-quiz-audio-row">
                        <button id="spelling-replay-btn" class="secondary-choice-btn" ${supportsTts ? '' : 'disabled'}>
                            ${supportsTts ? '다시 듣기' : '이 브라우저는 음성 재생 없음'}
                        </button>
                        <span class="spelling-quiz-count">총 ${SPELLING_QUIZZES.length}문제</span>
                    </div>
                    <div class="typing-word-area spelling-prompt-card">
                        <span class="typing-target spelling-target">${question.promptText}</span>
                    </div>
                    <div class="quiz-choices spelling-choice-grid">
                        ${question.choices.map((choice) => `
                            <button class="choice-btn spelling-choice-btn" data-choice="${choice}">${choice}</button>
                        `).join('')}
                    </div>
                    <div id="spelling-feedback" class="spelling-feedback"></div>
                </div>
            `;

            this.container.innerHTML = popupHTML;
            this.currentPopup = document.getElementById('quiz-popup');

            const replayBtn = document.getElementById('spelling-replay-btn');
            const feedback = document.getElementById('spelling-feedback');
            const choiceButtons = [...this.container.querySelectorAll('.spelling-choice-btn')];

            const finishQuiz = (isCorrect) => {
                setTimeout(() => {
                    if (returnToList) {
                        this.resetPopupState(false);
                        this.showSpellingQuizList();
                    } else {
                        this.closePopup();
                    }
                    resolve(isCorrect);
                }, 1500);
            };

            const playPromptAudio = () => {
                if (!supportsTts) return;
                this.speakKoreanText(question.spokenText);
            };

            if (replayBtn) {
                replayBtn.onclick = () => {
                    playPromptAudio();
                };
            }

            setTimeout(() => {
                playPromptAudio();
            }, 150);

            choiceButtons.forEach((button) => {
                button.addEventListener('click', () => {
                    const selected = button.getAttribute('data-choice');
                    const isCorrect = selected === question.answer;

                    this.stopSpeech();
                    choiceButtons.forEach((choiceButton) => {
                        choiceButton.disabled = true;
                    });

                    if (isCorrect) {
                        window.gameManagers.soundManager.playSuccess();
                        button.classList.add('correct');
                        feedback.className = 'spelling-feedback praise-text';
                        feedback.textContent = practiceMode
                            ? `정답! "${question.answer}"가 맞아요.`
                            : `정답! 추가 보너스 +20%!`;
                    } else {
                        window.gameManagers.soundManager.playError();
                        button.classList.add('wrong');
                        const correctButton = choiceButtons.find((choiceButton) =>
                            choiceButton.getAttribute('data-choice') === question.answer
                        );
                        if (correctButton) {
                            correctButton.classList.add('correct');
                        }
                        feedback.className = 'spelling-feedback penalty-text';
                        feedback.textContent = `정답은 "${question.answer}"예요.`;
                    }

                    finishQuiz(isCorrect);
                });
            });
        });
    }

    closePopup() {
        this.resetPopupState(true);
    }

    // --- 낚시 실패 모달 (Phase 6 팝업) ---
    showFailModal(message) {
        if (this.isQuizActive || this.currentPopup) return;
        this.hidePersistentUI();
        this.container.style.pointerEvents = 'auto';

        const popupHTML = `
            <div id="fail-popup" class="popup-box quiz-shake" style="border-color: #DC143C; width: min(400px, 90vw);">
                <h2 style="color: #DC143C; font-size: 28px; margin-bottom: 20px;">💦 앗, 아깝다! 💦</h2>
                <div style="font-size: 80px; margin-bottom: 15px; animation: float 3s ease-in-out infinite;">🎣💨</div>
                <p style="font-size: 20px; font-weight: bold; color: #333; margin-bottom: 25px; word-break: keep-all;">${message}</p>
                <button id="fail-close-btn" class="choice-btn" style="background-color: #333; box-shadow: 0 5px 0 #000; font-size: 20px; padding: 10px 30px;">확인</button>
            </div>
        `;

        this.container.innerHTML = popupHTML;
        this.currentPopup = document.getElementById('fail-popup');

        const closeBtn = document.getElementById('fail-close-btn');
        if (closeBtn) {
            closeBtn.onclick = () => {
                window.gameManagers.soundManager.playCoin(); // click sound
                this.closePopup();
            };
        }

        // Auto close for fast gameplay flow
        setTimeout(() => {
            if (this.currentPopup && this.currentPopup.id === 'fail-popup') {
                this.closePopup();
            }
        }, 2500);
    }

    // --- 상시 UI ---
    initPersistentUI() {
        this.persistentContainer = document.createElement('div');
        this.persistentContainer.id = 'persistent-ui';
        this.persistentContainer.style.pointerEvents = 'auto';

        this.goldDisplay = document.createElement('div');
        this.goldDisplay.id = 'gold-display';
        this.goldDisplay.innerHTML = `💰 <span>${this.playerModel.gold}</span>`;

        this.shopBtn = document.createElement('button');
        this.shopBtn.id = 'shop-open-btn';
        this.shopBtn.innerText = '🛒 상점 (Shop)';
        this.shopBtn.onclick = () => this.openShop();

        this.bookBtn = document.createElement('button');
        this.bookBtn.id = 'book-open-btn';
        this.bookBtn.innerText = '📖 도감 (Book)';
        this.bookBtn.onclick = () => this.openEncyclopedia();
        this.bookBtn.className = 'persistent-btn';
        this.shopBtn.className = 'persistent-btn pulse-anim';

        this.muteBtn = document.createElement('button');
        this.muteBtn.id = 'mute-btn';
        this.muteBtn.innerText = '🔊';
        this.muteBtn.className = 'persistent-btn';
        this.muteBtn.onclick = () => {
            const sm = window.gameManagers.soundManager;
            const isMuted = sm.toggleMute();
            this.muteBtn.innerText = isMuted ? '🔇' : '🔊';

            // Phaser BGM도 같이 뮤트/언뮤트
            const phaserGame = window.gameManagers._phaserGame;
            if (phaserGame) {
                phaserGame.sound.mute = isMuted;
            }
        };

        this.persistentContainer.appendChild(this.goldDisplay);
        this.persistentContainer.appendChild(this.bookBtn);
        this.persistentContainer.appendChild(this.muteBtn);
        this.persistentContainer.appendChild(this.shopBtn);
        document.body.appendChild(this.persistentContainer);

        this.playerModel.subscribe(() => this.updatePersistentUI());
    }

    updatePersistentUI() {
        if (this.goldDisplay) {
            this.goldDisplay.querySelector('span').innerText = this.playerModel.gold;
        }
    }

    renderPersistentUI() {
        if (this.persistentContainer) this.persistentContainer.style.display = 'flex';
    }

    hidePersistentUI() {
        if (this.persistentContainer) this.persistentContainer.style.display = 'none';
    }

    // --- 상점 ---
    openShop(initialTab = 'upgrade') {
        if (this.isQuizActive) return;
        this.hidePersistentUI();
        this.container.style.pointerEvents = 'auto';

        const shopData = {
            rodPower: { max: 20, costBase: 100, costStep: 50 },
            catchChance: { max: 10, costBase: 100, costStep: 100 },
            reelSpeed: { max: 20, costBase: 200, costStep: 200 },
            rodLuck: { max: 5, costBase: 100, costStep: 300 },
            focusRing: { max: 3, costBase: 1000, costStep: 1500 } // 1000, 2500, 4000
        };
        const s = this.playerModel.stats;

        const getCost = (statName, currentLevel) => {
            const data = shopData[statName];
            return data.costBase + (currentLevel - 1) * data.costStep;
        };

        const renderBuyButton = (statName, currentLevel) => {
            const isMax = currentLevel >= shopData[statName].max;
            if (isMax) {
                return `<button class="buy-btn maxed" disabled style="background-color: #666; cursor: not-allowed;">MAX</button>`;
            } else {
                const cost = getCost(statName, currentLevel);
                return `<button class="buy-btn" data-stat="${statName}" data-cost="${cost}">💰 ${cost}</button>`;
            }
        };

        // 한국 어부 아저씨 NPC 대사 10가지
        const npcQuotes = [
            "오늘은 물결이 좋구나. 손맛 제대로 볼 것 같은데?",
            "왔구나 정우야. 장비 한 번 점검하고 힘차게 나가 보자꾸나.",
            "급할수록 큰 고기는 놓치는 법이지. 차분하게 골라 보게.",
            "허허, 자네 눈빛 보니 오늘도 빈손으로는 안 돌아오겠어.",
            "릴 소리만 들어도 컨디션이 보인다니까. 오늘은 아주 좋구먼.",
            "낚싯대는 주인 손을 닮는다더니, 자네 것도 점점 든든해지네.",
            "기다림도 실력이지만, 준비가 좋으면 기다림이 짧아지는 법이지.",
            "바다가 날마다 표정이 다르니 장비도 그때그때 맞춰 줘야 해.",
            "정우야, 오늘은 욕심보다 감각이 먼저다. 감이 오면 바로 채는 거야.",
            "허허, 실력이 붙을수록 장비 욕심도 나는 법이지. 잘 왔네."
        ];
        const randomQuote = this.pickRandom(npcQuotes);

        // 세연이를 위한 최고급 장난감 (30,000골드 이상 해금)
        const ENDING_ITEM_COST = 30000;
        // 낚싯대(Rod Power) 레벨에 따른 NPC 아바타 변화 로직
        const rodLevel = s.rodPower;
        let npcAvatar = '👴'; // Lv 1~4
        if (rodLevel >= 15) {
            npcAvatar = '👑'; // Lv 15~ (만렙 근처)
        } else if (rodLevel >= 10) {
            npcAvatar = '🤠'; // Lv 10~14
        } else if (rodLevel >= 5) {
            npcAvatar = '😎'; // Lv 5~9
        }
        const shopkeeperPortraitHTML = `
            <div class="npc-avatar npc-avatar-portrait shopkeeper-avatar-card" id="npc-avatar-display" aria-label="상점 할아버지">
                <div class="shopkeeper-avatar-emoji">${npcAvatar}</div>
                <span class="npc-avatar-badge">상점 할아버지</span>
            </div>
        `;

        const canBuyEnding = this.playerModel.gold >= ENDING_ITEM_COST;
        const showEndingItem = this.playerModel.highestChapter >= 4;

        let endingItemHTML = '';
        if (showEndingItem) {
            endingItemHTML = `
                <div class="upgrade-item" style="border-color: #FFD700; background: linear-gradient(135deg, #FFFACD, #FFF8DC);">
                    <div class="up-icon">🎁</div>
                    <div class="up-info">
                        <h3 style="color:#FF1493;">세연이를 위한 최고급 장난감</h3>
                        <p style="color:#FF69B4;">동생에게 사줄 특별한 선물! (엔딩 아이템)</p>
                    </div>
                    <button class="buy-btn ${canBuyEnding ? '' : 'maxed'}" id="ending-item-btn"
                        ${canBuyEnding ? '' : 'disabled'}
                        style="${canBuyEnding ? 'background: #FF1493; box-shadow: 0 5px 0 #C71585;' : 'background-color: #999; cursor: not-allowed;'}">
                        ${canBuyEnding ? '💰 ' + ENDING_ITEM_COST : '💰 ' + ENDING_ITEM_COST + ' (부족)'}
                    </button>
                </div>
            `;
        }

        // --- 신규 아이템: 타겟 렌즈 (focusRing) ---
        // 기본 1렙, 최대 3렙. 1000G, 2500G 성장.
        let focusRingHTML = `
            <div class="upgrade-item" style="border-color: #20B2AA;">
                <div class="up-icon">🎯</div>
                <div class="up-info">
                    <h3>타겟 렌즈 강화 (Lv ${s.focusRing || 1})</h3>
                    <p>미끼 과녁의 크기를 원래대로 넓혀줍니다.</p>
                </div>
                ${renderBuyButton('focusRing', s.focusRing || 1)}
            </div>
        `;

        // --- 세연이 선물(간식/장식) 데이터 ---
        const snacksData = [
            { id: 'snack1', name: '소금빵', emoji: '🥐', cost: 100 },
            { id: 'snack2', name: '아이스크림', emoji: '🍦', cost: 300 },
            { id: 'snack3', name: '케이크', emoji: '🍰', cost: 500 },
            { id: 'snack4', name: '딸기', emoji: '🍓', cost: 800 },
            { id: 'snack5', name: '바나나', emoji: '🍌', cost: 1000 }
        ];

        const decorData = [
            { id: 'decor1', name: '곰인형', emoji: '🧸', cost: 500 },
            { id: 'decor2', name: '동화책', emoji: '📖', cost: 800 },
            { id: 'decor3', name: '아쿠아리움 뷰', emoji: '🪸', cost: 2000 }
        ];

        let snackDecorHTML = '';
        const generateItemHTML = (item, type, purchasedObj) => {
            const count = purchasedObj[item.id] || 0;
            const isMax = type === 'snack' && count >= 51;
            const canBuy = this.playerModel.gold >= item.cost && !isMax;
            return `
                <div class="upgrade-item" style="border-color: ${type === 'snack' ? '#FFA500' : '#4682B4'};">
                    <div class="up-icon" style="font-size: 30px;">${item.emoji}</div>
                    <div class="up-info">
                        <h3>${item.name} <span style="font-size: 14px; font-weight: normal; color: #555;">(보유: ${isMax ? 'MAX' : count + '개'})</span></h3>
                        <p>${type === 'snack' ? '맛있는 간식! 기분이 좋아집니다.' : '멋진 방 꾸미기! 방이 화사해집니다.'}</p>
                    </div>
                    <button class="buy-sd-btn ${canBuy ? '' : 'maxed'}" data-type="${type}" data-id="${item.id}" data-cost="${item.cost}"
                        ${canBuy ? '' : 'disabled'}
                        style="${canBuy ? (type === 'snack' ? 'background:#FFA500;' : 'background:#4682B4;') : 'background-color: #999; cursor: not-allowed;'}">
                        ${isMax ? '최대 보유' : (canBuy ? '💰 ' + item.cost : '💰 ' + item.cost + ' (부족)')}
                    </button>
                </div>
            `;
        };

        snacksData.forEach(item => snackDecorHTML += generateItemHTML(item, 'snack', this.playerModel.snacksPurchased || {}));
        decorData.forEach(item => snackDecorHTML += generateItemHTML(item, 'decor', this.playerModel.decorPurchased || {}));


        const shopHTML = `
            <div id="shop-popup" class="popup-box" style="padding-top: 10px; max-height: 90vh;">
                <div class="shop-header" style="margin-bottom: 5px;">
                    <h2 style="margin:0;">🛒 상점가</h2>
                    <div class="shop-gold" style="margin-bottom:0;">현재 골드: <span>${this.playerModel.gold}</span></div>
                    <button id="shop-close-btn" style="position: absolute; right: 10px; top: 10px; font-size:24px;">❌</button>
                </div>
                
                <div class="shop-tabs" style="display:flex; justify-content:space-around; margin-bottom: 10px; border-bottom: 2px solid #ccc; padding-bottom:5px;">
                    <button id="tab-upgrade" class="shop-tab-btn active" style="flex:1; padding:10px; font-size:18px; font-weight:bold; background:#0055FF; color:white; border:none; border-radius:10px 0 0 0;">👨‍🔧 장비 강화</button>
                    <button id="tab-seyeon" class="shop-tab-btn" style="flex:1; padding:10px; font-size:18px; font-weight:bold; background:#ccc; color:#333; border:none; border-radius:0 10px 0 0;">👧 세연이 선물사기</button>
                </div>

                <div class="shop-content" style="overflow-y: auto; max-height: calc(90vh - 120px);">
                    <!-- 장비 탭 -->
                    <div id="content-upgrade" class="tab-content" style="display:block;">
                        <div class="shop-npc">
                            ${shopkeeperPortraitHTML}
                            <div class="npc-bubble">"${randomQuote}"</div>
                        </div>
                        <div class="upgrade-list">
                            <div class="upgrade-item">
                                <div class="up-icon">💪</div>
                                <div class="up-info">
                                    <h3>Rod Power (Lv.${s.rodPower}/${shopData.rodPower.max})</h3>
                                    <p>연타 1회당 오르는 게이지 양 증가</p>
                                </div>
                                ${renderBuyButton('rodPower', s.rodPower)}
                            </div>
                            <div class="upgrade-item">
                                <div class="up-icon">⏲️</div>
                                <div class="up-info">
                                    <h3>Catch Chance (Lv.${s.catchChance}/${shopData.catchChance.max})</h3>
                                    <p>입질 대기시간 단축 및 게이지 보너스</p>
                                </div>
                                ${renderBuyButton('catchChance', s.catchChance)}
                            </div>
                            <div class="upgrade-item">
                                <div class="up-icon">⚙️</div>
                                <div class="up-info">
                                    <h3>Reel Speed (Lv.${s.reelSpeed}/${shopData.reelSpeed.max})</h3>
                                    <p>게이지 하락 속도 방어 / 줄 텐션 안정화</p>
                                </div>
                                ${renderBuyButton('reelSpeed', s.reelSpeed)}
                            </div>
                            <div class="upgrade-item">
                                <div class="up-icon">🍀</div>
                                <div class="up-info">
                                    <h3>Rod Luck (Lv.${s.rodLuck}/${shopData.rodLuck.max})</h3>
                                    <p>희귀 물고기 획득 확률 증가</p>
                                </div>
                                ${renderBuyButton('rodLuck', s.rodLuck)}
                            </div>
                            ${focusRingHTML}
                        </div>
                    </div>

                    <!-- 세연이 선물사기 탭 -->
                    <div id="content-seyeon" class="tab-content" style="display:none;">
                        <div class="shop-npc" style="background:#FFF0F5; border-color:#FFB6C1;">
                            <div class="npc-avatar" id="seyeon-avatar-display">👧</div>
                            <div class="npc-bubble" style="border-color:#FF69B4; color:#C71585;" id="seyeon-bubble">"오빠 낚시 열심히 해! 까까 사줘!!"</div>
                        </div>
                        <div class="upgrade-list">
                            ${snackDecorHTML}
                            ${endingItemHTML}
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.container.innerHTML = shopHTML;
        this.currentPopup = document.getElementById('shop-popup');

        document.getElementById('shop-close-btn').onclick = () => { this.closePopup(); };

        // 탭 전환 로직
        const tabUpgrade = document.getElementById('tab-upgrade');
        const tabSeyeon = document.getElementById('tab-seyeon');
        const contentUpgrade = document.getElementById('content-upgrade');
        const contentSeyeon = document.getElementById('content-seyeon');

        const switchTab = (tabStr, playSound = false) => {
            if (playSound) window.gameManagers.soundManager.playCoin();
            if (tabStr === 'upgrade') {
                tabUpgrade.style.background = '#0055FF'; tabUpgrade.style.color = 'white';
                tabSeyeon.style.background = '#ccc'; tabSeyeon.style.color = '#333';
                contentUpgrade.style.display = 'block';
                contentSeyeon.style.display = 'none';
            } else {
                tabUpgrade.style.background = '#ccc'; tabUpgrade.style.color = '#333';
                tabSeyeon.style.background = '#FF69B4'; tabSeyeon.style.color = 'white';
                contentUpgrade.style.display = 'none';
                contentSeyeon.style.display = 'block';
            }
        };

        tabUpgrade.onclick = () => switchTab('upgrade', true);
        tabSeyeon.onclick = () => switchTab('seyeon', true);

        // 초기 탭 설정
        switchTab(initialTab, false);

        const buyBtns = this.container.querySelectorAll('.buy-btn');
        // 구매 버튼 이벤트 (장비)
        buyBtns.forEach(btn => {
            btn.onclick = (e) => {
                const statName = e.target.getAttribute('data-stat'); // 'rodPower', 'catchChance', 'reelSpeed', 'rodLuck', 'focusRing'
                if (!statName) return; // 세연이네 버튼 등 data-stat이 없는 경우는 무시
                const currentLevel = this.playerModel.stats[statName] || 1;
                const cost = parseInt(e.target.getAttribute('data-cost'));
                const success = this.playerModel.upgradeStat(statName, cost);

                const bubble = this.container.querySelector('#content-upgrade .npc-bubble');
                if (success) {
                    window.gameManagers.soundManager.playCoin();

                    const newLevel = this.playerModel.stats[statName];
                    const isNowMax = newLevel >= shopData[statName].max;

                    if (isNowMax && !this.playerModel.maxLevelCelebrated[statName]) {
                        // MAX 이벤트
                        this.playerModel.maxLevelCelebrated[statName] = true;

                        let maxMsg = '';
                        if (statName === 'rodPower') maxMsg = '이제 용궁도 홀릴 수 있겠구먼!';
                        if (statName === 'catchChance') maxMsg = '물고기가 알아서 줄을 서겠어!';
                        if (statName === 'reelSpeed') maxMsg = '바다의 번개라 불러도 되겠네!';
                        if (statName === 'rodLuck') maxMsg = '행운의 여신이 자네 편이야!';
                        if (statName === 'focusRing') maxMsg = '독수리의 눈을 가졌구만!';

                        alert(`✨ [${statName.toUpperCase()} MAX 달성] ✨\n할아버지: "${maxMsg}"`);

                        // 올맥스 체크
                        const allMax = Object.keys(shopData).every(k => this.playerModel.stats[k] >= shopData[k].max);
                        if (allMax && !this.playerModel.allMaxCelebrated) {
                            this.playerModel.allMaxCelebrated = true;
                            setTimeout(() => {
                                alert("🌟 전설의 낚시꾼 🌟\n상점 할아버지: '허허... 내 평생 자네 같은 낚시꾼은 처음일세. 모든 기술을 완벽하게 터득했군!'");
                            }, 500);
                        }
                    } else {
                        const successQuotes = [
                            '"허허, 아주 알뜰하게 잘 골랐구나!"',
                            '"좋아, 이런 업그레이드가 손맛을 확 바꿔 주지!"',
                            '"자네라면 이 장비를 제대로 써먹을 줄 알았네!"',
                            '"한 단계씩 단단해지는구먼. 이제 더 큰 놈도 버티겠어!"',
                            '"그래, 실력만큼 장비도 받쳐줘야지!"',
                            '"오늘 선택이 아주 야무지다. 마음에 드는구먼!"'
                        ];
                        bubble.innerText = this.pickRandom(successQuotes);
                        bubble.classList.add('quiz-shake');
                        setTimeout(() => bubble.classList.remove('quiz-shake'), 400);
                    }

                    // 낚싯대(Rod Power) 업그레이드 시 주인공 텍스처 갱신
                    if (statName === 'rodPower') {
                        const phaserGame = window.gameManagers._phaserGame;
                        if (phaserGame && phaserGame.scene.isActive('GameScene')) {
                            const gameScene = phaserGame.scene.getScene('GameScene');
                            if (gameScene && typeof gameScene.updateCharacterTexture === 'function') {
                                gameScene.updateCharacterTexture();
                            }
                        }
                    }
                    this.openShop('upgrade');
                } else {
                    window.gameManagers.soundManager.playError();
                    bubble.innerText = this.pickRandom([
                        '"아직 골드가 조금 모자라는구나. 한 번 더 다녀오게!"',
                        '"허허, 이 장비는 지금 사기엔 돈이 조금 부족하네!"',
                        '"조금만 더 낚아 오면 바로 장만할 수 있겠어!"'
                    ]);
                    bubble.style.color = '#FF0000';
                    btn.classList.add('quiz-shake');
                    setTimeout(() => { btn.classList.remove('quiz-shake'); bubble.style.color = '#333'; }, 400);
                }
            };
        });

        // 세연이네 물품 구매 이벤트
        const sdBtns = this.container.querySelectorAll('.buy-sd-btn');
        sdBtns.forEach(btn => {
            btn.onclick = (e) => {
                const type = e.target.getAttribute('data-type');
                const id = e.target.getAttribute('data-id');
                const cost = parseInt(e.target.getAttribute('data-cost'));
                let success = false;

                if (type === 'snack') {
                    if (this.playerModel.snacksPurchased && this.playerModel.snacksPurchased[id] >= 51) return; // 51개 제한 방어코드

                    if (this.playerModel.gold >= cost) {
                        this.playerModel.gold -= cost;
                        if (!this.playerModel.snacksPurchased) this.playerModel.snacksPurchased = {};
                        this.playerModel.snacksPurchased[id] = (this.playerModel.snacksPurchased[id] || 0) + 1;
                        success = true;
                    }
                } else {
                    if (this.playerModel.gold >= cost) {
                        this.playerModel.gold -= cost;
                        if (!this.playerModel.decorPurchased) this.playerModel.decorPurchased = {};
                        this.playerModel.decorPurchased[id] = (this.playerModel.decorPurchased[id] || 0) + 1;
                        success = true;
                    }
                }

                const sBubble = document.getElementById('seyeon-bubble');
                if (success) {
                    this.playerModel.notify();
                    window.gameManagers.soundManager.playCoin();

                    let currentItemCount = 0;
                    let itemName = '';
                    if (type === 'snack') {
                        currentItemCount = this.playerModel.snacksPurchased[id];
                        itemName = snacksData.find(s => s.id === id)?.name || '간식';
                    } else {
                        currentItemCount = this.playerModel.decorPurchased[id];
                        itemName = decorData.find(d => d.id === id)?.name || '장식';
                    }

                    let reactionMsg = '';
                    if (type === 'snack') {
                        if (currentItemCount === 51 && !this.playerModel.seyeonMaxEventSeen[id]) {
                            // 51개 구매 이벤트 진행
                            this.playerModel.seyeonMaxEventSeen[id] = true;
                            this.playerModel.notify();
                            this.closePopup();

                            const SEYEON_SNACK_EVENTS = {
                                'snack1': [
                                    { speaker: '세연', portrait: 'char_seyeon', text: '오빠, 소금빵이 무려 51개야?! 빵집을 통째로 털어 온 거야?' },
                                    { speaker: '정우', portrait: 'char_jeongwoo', text: '헤헤, 하나만 사 오기엔 아쉬워서 종류별로 잔뜩 담아 왔지!' },
                                    { speaker: '세연', portrait: 'char_seyeon', text: '고소한 냄새가 온 집안에 퍼졌어... 행복한데 조금 무섭다!' },
                                    { speaker: '정우', portrait: 'char_jeongwoo', text: '내일 아침도 소금빵, 간식도 소금빵! 완전 소금빵 축제야!' },
                                    { speaker: '세연', portrait: 'char_seyeon', text: '좋아, 그럼 우유도 같이 준비해 줘! 목 막히면 오빠 책임이야!' }
                                ],
                                'snack2': [
                                    { speaker: '세연', portrait: 'char_seyeon', text: '아이스크림이 51개나 된다고?! 냉동고 문이 안 닫히겠는데!' },
                                    { speaker: '정우', portrait: 'char_jeongwoo', text: '초코, 딸기, 바닐라, 민트까지 다 챙겼어. 골라 먹는 재미가 있어야지!' },
                                    { speaker: '세연', portrait: 'char_seyeon', text: '기분은 최고인데 엄마한테 들키면 둘 다 혼날 것 같은 느낌이야...' },
                                    { speaker: '정우', portrait: 'char_jeongwoo', text: '괜찮아! 윗칸부터 차근차근 먹으면 티 안 날지도 몰라!' },
                                    { speaker: '세연', portrait: 'char_seyeon', text: '티 엄청 나거든?! 그래도 하나는 지금 바로 먹을래! 🍦' }
                                ],
                                'snack3': [
                                    { speaker: '세연', portrait: 'char_seyeon', text: '헉... 케이크가 51개면 오늘이 내 생일 51번인 거야?!' },
                                    { speaker: '정우', portrait: 'char_jeongwoo', text: '딸기 케이크도 있고 초코 케이크도 있어! 보기만 해도 배부르지?' },
                                    { speaker: '세연', portrait: 'char_seyeon', text: '우리 집 거실이 진짜 디저트 가게처럼 변했어... 너무 달콤해!' },
                                    { speaker: '정우', portrait: 'char_jeongwoo', text: '하루에 한 조각씩 먹으면 오래오래 행복할 수 있잖아!' },
                                    { speaker: '세연', portrait: 'char_seyeon', text: '그건 좋은데, 촛불은 안 꽂을 거지? 괜히 또 이벤트 시작될까 봐!' }
                                ],
                                'snack4': [
                                    { speaker: '세연', portrait: 'char_seyeon', text: '딸기를 51박스나?! 방이 아니라 거의 과일 창고가 됐잖아!' },
                                    { speaker: '정우', portrait: 'char_jeongwoo', text: '향이 너무 좋아서 그냥 지나칠 수가 없었어. 봐, 빨갛고 반짝반짝하잖아!' },
                                    { speaker: '세연', portrait: 'char_seyeon', text: '진짜다... 방 안 가득 딸기 향이 퍼져서 기분이 몽글몽글해!' },
                                    { speaker: '정우', portrait: 'char_jeongwoo', text: '먹고 남으면 잼도 만들고, 우유에 갈아서 주스도 만들자!' },
                                    { speaker: '세연', portrait: 'char_seyeon', text: '좋아! 오늘은 딸기 파티다. 대신 꼭 깨끗이 씻어 먹자!' }
                                ],
                                'snack5': [
                                    { speaker: '세연', portrait: 'char_seyeon', text: '바나나가 51개면 이건 간식이 아니라 미션급이야, 오빠!' },
                                    { speaker: '정우', portrait: 'char_jeongwoo', text: '노랗고 튼튼해서 배 탈 때 챙겨 먹기 딱 좋잖아. 실속 최고지!' },
                                    { speaker: '세연', portrait: 'char_seyeon', text: '그럴듯하게 말해도 너무 많이 샀어! 그래도 보기만 해도 든든하긴 하다.' },
                                    { speaker: '정우', portrait: 'char_jeongwoo', text: '바나나 우유, 바나나 토스트, 그냥 바나나까지 완벽 코스야!' },
                                    { speaker: '세연', portrait: 'char_seyeon', text: '알겠어, 오늘은 내가 져준다. 대신 아재 개그는 금지! 🍌' }
                                ]
                            };

                            const eventLines = SEYEON_SNACK_EVENTS[id];
                            const phaserGame = window.gameManagers._phaserGame;
                            if (phaserGame && phaserGame.scene.isActive('GameScene')) {
                                const gameScene = phaserGame.scene.getScene('GameScene');
                                gameScene.scene.pause();
                                gameScene.scene.launch('StoryScene', {
                                    storyData: eventLines,
                                    nextScene: 'GameScene',
                                    nextSceneData: {
                                        isOverlay: true
                                    }
                                });
                            }
                            return; // 기존 버블 텍스트 스킵
                        }

                        if (currentItemCount >= 50) {
                            reactionMsg = this.pickRandom([
                                `"${itemName}가 산처럼 쌓였어! 이제 냉장고 자리부터 비워야겠다... 😅"`,
                                `"오빠, ${itemName}만 봐도 배부를 정도야! 그래도 든든해서 좋다!"`,
                                `"이쯤 되면 ${itemName} 박물관 열 수 있겠어. 진짜 많이 샀다! 😆"`
                            ]);
                        } else if (currentItemCount >= 10) {
                            reactionMsg = this.pickRandom([
                                `"우와, ${itemName}가 벌써 열 개야! 오빠 오늘 완전 큰손이네! 😲"`,
                                `"${itemName} 모으는 속도가 장난 아니야. 내일도 먹을 수 있겠다!"`,
                                `"열 개나 됐어! 기분 좋은데 오빠 지갑은 괜찮은 거지?"`
                            ]);
                        } else if (currentItemCount >= 5) {
                            reactionMsg = this.pickRandom([
                                `"${itemName}가 벌써 다섯 개야! 조금씩 아껴 먹으면 오래 행복하겠다~ 😋"`,
                                `"와아, ${itemName} 다섯 개나 모였어! 간식 창고가 생긴 기분이야!"`,
                                `"오빠 덕분에 ${itemName} 걱정은 한동안 없겠다. 너무 좋아! 🥰"`
                            ]);
                        } else {
                            reactionMsg = this.pickRandom([
                                `"앗, ${itemName} 사 왔구나! 오빠 고마워, 맛있게 먹을게! 🥰"`,
                                `"우와, ${itemName}다! 지금 딱 먹고 싶었는데 정말 고마워!"`,
                                `"헤헤, ${itemName} 선물 받았다! 오늘 기분 최고야! ✨"`
                            ]);
                        }
                    } else {
                        if (currentItemCount >= 10) {
                            reactionMsg = this.pickRandom([
                                `"${itemName}가 방을 가득 채웠어! 이제 거의 완벽한 방이야! ✨"`,
                                `"오빠 덕분에 ${itemName} 컬렉션 완성! 정말 근사해 보여!"`,
                                `"이 정도면 ${itemName}는 마스터 달성이지! 방이 반짝반짝해!"`
                            ]);
                        } else if (currentItemCount >= 5) {
                            reactionMsg = this.pickRandom([
                                `"${itemName}가 벌써 다섯 개야! 방 분위기가 훨씬 아늑해졌어! 💖"`,
                                `"헤헤, ${itemName} 덕분에 방이 점점 예뻐지고 있어!"`,
                                `"오빠 안목 좋은데? ${itemName}가 들어오니까 방이 살아난다!"`
                            ]);
                        } else {
                            reactionMsg = this.pickRandom([
                                `"우와, ${itemName} 너무 마음에 들어! 예쁜 자리에 바로 둘게! 😍"`,
                                `"${itemName} 사줘서 고마워! 방이 한층 더 포근해졌어!"`,
                                `"이 ${itemName} 진짜 귀엽다! 오빠 센스 최고야!"`
                            ]);
                        }
                    }

                    // 화면 재생성하며 세연이네 탭 유지
                    this.openShop('seyeon');

                    // 다시 생성된 DOM 요소를 가져와서 메시지와 말풍선 적용
                    const newSBubble = document.getElementById('seyeon-bubble');
                    const newSdAvatar = document.getElementById('seyeon-avatar-display');

                    if (newSBubble) {
                        newSBubble.innerText = reactionMsg;
                        newSBubble.classList.add('quiz-shake');
                        setTimeout(() => newSBubble.classList.remove('quiz-shake'), 400);
                    }

                    if (newSdAvatar) {
                        newSdAvatar.innerHTML = '😍';
                        setTimeout(() => {
                            const currentSdAvatar = document.getElementById('seyeon-avatar-display');
                            if (currentSdAvatar) currentSdAvatar.innerHTML = '👧';
                        }, 1500);
                    }
                } else {
                    window.gameManagers.soundManager.playError();
                    sBubble.innerText = this.pickRandom([
                        '"오빠, 골드가 조금 모자라네... 다음에 다시 사자!"',
                        '"조금만 더 낚시하면 살 수 있겠다! 우리 다시 모아 보자!"',
                        '"아쉽다... 이번엔 참았다가 다음에 크게 사자!"'
                    ]);
                    sBubble.style.color = '#FF0000';
                    btn.classList.add('quiz-shake');
                    setTimeout(() => { btn.classList.remove('quiz-shake'); sBubble.style.color = '#C71585'; }, 400);
                }
            }
        });

        // 엔딩 아이템 구매 버튼
        const endingBtn = document.getElementById('ending-item-btn');
        if (endingBtn && canBuyEnding) {
            endingBtn.onclick = () => {
                this.playerModel.gold -= ENDING_ITEM_COST;
                this.playerModel.notify();
                window.gameManagers.soundManager.playSuccess();

                this.closePopup();

                // Phaser 씬 매니저를 통해 EndingScene으로 전환
                const phaserGame = window.gameManagers._phaserGame;
                if (phaserGame) {
                    const sceneManager = phaserGame.scene;
                    if (sceneManager.isActive('GameScene')) {
                        sceneManager.stop('GameScene');
                    }
                    sceneManager.start('EndingScene');
                }
            };
        }
    }

    openEncyclopedia() {
        if (this.isQuizActive) return;
        this.hidePersistentUI();
        this.container.style.pointerEvents = 'auto';

        const collection = this.playerModel.fishCollection;

        let fishCardsHTML = '';
        FISH_TYPES.forEach(fish => {
            const count = collection[fish.id] || 0;
            const isDiscovered = count > 0;

            if (isDiscovered) {
                fishCardsHTML += `
                    <div class="fish-card discovered">
                        <div class="fish-img-container">
                            <img src="assets/images/${fish.id}.png" class="fish-img-sprite" />
                        </div>
                        <h3>${fish.name}</h3>
                        <p class="fish-grade grade-${fish.grade}">등급: ${fish.grade}</p>
                        <p class="fish-count">포획 수: ${count}마리</p>
                        <p class="fish-reward">기본 보상: 💰${fish.baseReward}</p>
                    </div>
                `;
            } else {
                fishCardsHTML += `
                    <div class="fish-card undiscovered">
                        <div class="fish-img-container">
                            <img src="assets/images/${fish.id}.png" class="fish-img-sprite silhouette-img" />
                        </div>
                        <h3>???</h3>
                        <p class="fish-grade">등급: ???</p>
                        <p class="fish-count">포획 수: 0마리</p>
                    </div>
                `;
            }
        });

        const encyclopediaHTML = `
            <div id="encyclopedia-popup" class="popup-box">
                <div class="shop-header">
                    <h2>내 물고기 도감 📖</h2>
                    <button id="book-close-btn">❌ 닫기</button>
                </div>
                <div class="encyclopedia-grid">
                    ${fishCardsHTML}
                </div>
            </div>
        `;

        this.container.innerHTML = encyclopediaHTML;
        this.currentPopup = document.getElementById('encyclopedia-popup');

        document.getElementById('book-close-btn').onclick = () => { this.closePopup(); };
    }

    openComboBook() {
        if (this.isQuizActive) return;
        this.hidePersistentUI();
        this.container.style.pointerEvents = 'auto';

        const goalCardsHTML = (this.playerModel.activeComboGoals || []).map((comboId) => {
            const entry = getComboEntryById(comboId);
            if (!entry) return '';

            const progress = getComboProgress(entry, this.playerModel);
            const percent = Math.round(Math.max(0, Math.min(1, progress.ratio)) * 100);

            return `
                <div class="combo-goal-card">
                    <div class="combo-card-header">
                        <span class="combo-category-chip">${entry.category}</span>
                        <span class="combo-reward-chip">+${entry.reward}G</span>
                    </div>
                    <h3>${entry.name}</h3>
                    <p>${entry.description}</p>
                    <div class="combo-progress-track">
                        <span class="combo-progress-fill" style="width:${percent}%"></span>
                    </div>
                    <p class="combo-progress-copy">${progress.label}</p>
                </div>
            `;
        }).join('');

        const comboCardsHTML = COMBO_BOOK_ENTRIES.map((entry) => {
            const progress = getComboProgress(entry, this.playerModel);
            const percent = Math.round(Math.max(0, Math.min(1, progress.ratio)) * 100);
            const isDiscovered = !!this.playerModel.comboBook?.[entry.id]?.discovered;

            if (isDiscovered) {
                return `
                    <div class="combo-card discovered">
                        <div class="combo-card-header">
                            <span class="combo-category-chip">${entry.category}</span>
                            <span class="combo-reward-chip">완성</span>
                        </div>
                        <h3>${entry.name}</h3>
                        <p>${entry.description}</p>
                        <div class="combo-progress-track">
                            <span class="combo-progress-fill" style="width:100%"></span>
                        </div>
                        <p class="combo-progress-copy">발견 완료 · ${getComboDiscoveryDate(this.playerModel, entry.id)}</p>
                    </div>
                `;
            }

            return `
                <div class="combo-card undiscovered">
                    <div class="combo-card-header">
                        <span class="combo-category-chip">${entry.category}</span>
                        <span class="combo-reward-chip">+${entry.reward}G</span>
                    </div>
                    <h3>${entry.name}</h3>
                    <p>${entry.hint}</p>
                    <div class="combo-progress-track">
                        <span class="combo-progress-fill pending" style="width:${percent}%"></span>
                    </div>
                    <p class="combo-progress-copy">${progress.label}</p>
                </div>
            `;
        }).join('');

        const popupHTML = `
            <div id="combo-book-popup" class="popup-box combo-book-popup">
                <div class="shop-header combo-book-header">
                    <div>
                        <h2>조합 도감 & 작은 목표 🧩</h2>
                        <p class="milestone-subcopy">짧은 목표를 따라가며 물고기 조합, 특별간식 연출, 꾸미기 세트를 모아 보세요.</p>
                    </div>
                    <button id="combo-book-close-btn">❌ 닫기</button>
                </div>
                <div class="combo-goal-section">
                    <h3>지금 해볼 작은 목표</h3>
                    <div class="combo-goal-grid">
                        ${goalCardsHTML || `
                            <div class="combo-goal-empty">
                                <strong>활성 작은 목표를 모두 달성했어요!</strong>
                                <p>새 조합을 찾으면 다음 목표가 자동으로 열립니다.</p>
                            </div>
                        `}
                    </div>
                </div>
                <div class="combo-book-grid">
                    ${comboCardsHTML}
                </div>
            </div>
        `;

        this.container.innerHTML = popupHTML;
        this.currentPopup = document.getElementById('combo-book-popup');
        document.getElementById('combo-book-close-btn').onclick = () => { this.closePopup(); };
    }

    openFishMilestonePopup(currentScene) {
        if (this.isQuizActive) return;
        this.hidePersistentUI();
        this.container.style.pointerEvents = 'auto';

        const collection = this.playerModel.fishCollection;
        const milestones = this.playerModel.fishMilestonesSeen || {};

        let fishCardsHTML = '';
        FISH_TYPES.forEach(fish => {
            const count = collection[fish.id] || 0;
            const isDiscovered = count > 0;

            // 칭호 결정
            let titleText = '없음';
            let titleClass = '';

            if (milestones[fish.id]) {
                if (milestones[fish.id][30]) {
                    titleText = '대마왕 👑';
                    titleClass = 'title-ssr';
                } else if (milestones[fish.id][15]) {
                    titleText = '왕 👑';
                    titleClass = 'title-sr';
                } else if (milestones[fish.id][5]) {
                    titleText = '왕자 👑';
                    titleClass = 'title-r';
                }
            }

            if (isDiscovered) {
                fishCardsHTML += `
                    <div class="fish-card discovered" style="border-color: ${titleText !== '없음' ? '#FFD700' : '#DEB887'};">
                        <div class="fish-img-container">
                            <img src="assets/images/${fish.id}.png" class="fish-img-sprite" />
                        </div>
                        <h3>${fish.name}</h3>
                        <p class="fish-count">총 <strong>${count}</strong>마리</p>
                        <p class="fish-title ${titleClass}">칭호: ${titleText}</p>
                        <p class="fish-growth-guide">등장 5마리 · 성장 15마리 · 반짝 성장 30마리</p>
                    </div>
                `;
            } else {
                fishCardsHTML += `
                    <div class="fish-card undiscovered">
                        <div class="fish-img-container">
                            <img src="assets/images/${fish.id}.png" class="fish-img-sprite silhouette-img" />
                        </div>
                        <h3>???</h3>
                        <p class="fish-count">0마리</p>
                        <p class="fish-title">칭호: 없음</p>
                        <p class="fish-growth-guide">등장 5마리 · 성장 15마리 · 반짝 성장 30마리</p>
                    </div>
                `;
            }
        });

        const popupHTML = `
            <div id="encyclopedia-popup" class="popup-box">
                <div class="shop-header" style="flex-direction: column; align-items: center;">
                    <h2>🏆 잡은 물고기 기록 🏆</h2>
                    <p class="milestone-subcopy">5마리: 왕자 / 15마리: 왕 / 30마리: 대마왕</p>
                    <button id="book-close-btn" style="align-self: flex-end; margin-top: -40px;">❌ 닫기</button>
                </div>
                <div class="encyclopedia-grid">
                    ${fishCardsHTML}
                </div>
            </div>
        `;

        this.container.innerHTML = popupHTML;
        this.currentPopup = document.getElementById('encyclopedia-popup');

        // 닫기 버튼 이벤트
        document.getElementById('book-close-btn').onclick = () => {
            this.closePopup();
            // 줌 아웃 등의 효과를 다시 주고 싶다면 IntroScene과 상호작용 가능
        };
    }

    // --- 보물섬 이벤트 도감 (Event Card Book) ---
    openEventCardBook() {
        if (this.isQuizActive) return;
        this.hidePersistentUI();
        this.container.style.pointerEvents = 'auto';

        const eventData = [
            { id: 'event_pirate', name: '해적선 발견', desc: '멀리 지나가는 해적선에서 반짝이는 보물 상자를 발견했다.', emoji: '🏴‍☠️' },
            { id: 'event_octopus', name: '대왕 문어 습격', desc: '거대한 촉수가 배 옆을 스치며 바다를 크게 흔들어 놓았다.', emoji: '🐙' },
            { id: 'event_mermaid', name: '인어의 노래', desc: '안개 너머에서 들려온 신비한 노랫소리가 바다를 잔잔하게 감쌌다.', emoji: '🧜‍♀️' },
            { id: 'event_rainbow', name: '무지개 출현', desc: '비가 그친 뒤 하늘 끝에 밝은 무지개가 떠올라 행운을 비춰 주었다.', emoji: '🌈' },
            { id: 'event_ghost', name: '유령선 조우', desc: '짙은 안개 속에서 낡은 배가 소리 없이 다가왔다가 다시 사라졌다.', emoji: '👻' }
        ];

        const cards = this.playerModel.eventCards || {};

        let cardsHTML = '';
        eventData.forEach(ev => {
            const cardInfo = cards[ev.id];
            if (cardInfo && cardInfo.discovered) {
                const d = new Date(cardInfo.firstSeenDate);
                const dateStr = `${d.getFullYear()}.${d.getMonth() + 1}.${d.getDate()}`;

                cardsHTML += `
                    <div class="event-card discovered" style="border: 2px solid #FFD700; background: #FFFDF0; padding: 10px; border-radius: 10px; text-align: center; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
                        <div style="font-size: 50px; margin-bottom: 5px;">${ev.emoji}</div>
                        <h3 style="margin: 0 0 5px 0; color: #B8860B;">${ev.name}</h3>
                        <p style="font-size: 12px; margin: 0 0 5px 0; color: #555;">${ev.desc}</p>
                        <hr style="border-top: 1px dashed #ccc; margin: 5px 0;">
                        <p style="font-size: 11px; margin: 0; color: #888;">최초 발견: ${dateStr}</p>
                        <p style="font-size: 11px; margin: 0; color: #e91e63;">발견 횟수: ${cardInfo.count}회</p>
                    </div>
                `;
            } else {
                cardsHTML += `
                    <div class="event-card undiscovered" style="border: 2px dashed #bbb; background: #eee; padding: 10px; border-radius: 10px; text-align: center; filter: grayscale(100%);">
                        <div style="font-size: 50px; margin-bottom: 5px; opacity: 0.3;">❓</div>
                        <h3 style="margin: 0 0 5px 0; color: #777;">알 수 없는 이벤트</h3>
                        <p style="font-size: 12px; margin: 0; color: #999;">보물섬에서 특별한 경험을 해보세요.</p>
                    </div>
                `;
            }
        });

        const popupHTML = `
            <div id="eventcard-popup" class="popup-box" style="width: 85%; max-width: 500px;">
                <div class="shop-header" style="flex-direction: column; align-items: center; border-bottom: 2px solid #ddd; padding-bottom: 10px;">
                    <h2 style="margin: 0; color: #4B0082;">🃏 보물섬 이벤트 도감</h2>
                    <p style="margin: 5px 0 0 0; color: #666; font-size: 14px;">신비의 바다에서 겪은 특별한 일들</p>
                    <button id="card-close-btn" style="position: absolute; right: 10px; top: 10px;">❌</button>
                </div>
                <div class="eventcard-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 10px; padding: 15px 0; overflow-y: auto; max-height: 60vh;">
                    ${cardsHTML}
                </div>
            </div>
        `;

        this.container.innerHTML = popupHTML;
        this.currentPopup = document.getElementById('eventcard-popup');

        document.getElementById('card-close-btn').onclick = () => {
            this.closePopup();
        };
    }
}
