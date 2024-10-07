let startTime;
let hintCount = 0;
let remainingTime = 1200; // 20分 (1200秒)
let wrongAnswerCount = 0;
let timer;
let hints = [];
let currentHintIndex = 0;
let answerDisabled = false;

const startButton = document.getElementById('startButton');
const waitingScreen = document.getElementById('waitingScreen');
const mainScreen = document.getElementById('mainScreen');
const answerScreen = document.getElementById('answerScreen');
const resultScreen = document.getElementById('resultScreen');
const remainingTimeDisplay = document.getElementById('remainingTime');
const remainingTimeAnswerDisplay = document.getElementById('remainingTimeAnswer');
const hintCountDisplay = document.getElementById('hintCount');
const hintCountAnswerDisplay = document.getElementById('hintCountAnswer');
const hintDisplay = document.getElementById('hintDisplay');
const hintNavigation = document.getElementById('hintNavigation');
const errorMessage = document.getElementById('errorMessage');
const finalTime = document.getElementById('finalTime');
const finalHintCount = document.getElementById('finalHintCount');
const wrongAnswerCountDisplay = document.getElementById('wrongAnswerCount');
const finalScore = document.getElementById('finalScore');
const crimeHour = document.getElementById('crimeHour');
const hourDisplay = document.getElementById('hourDisplay');
const crimeMinute = document.getElementById('crimeMinute');
const minuteDisplay = document.getElementById('minuteDisplay');

// スタートボタンの処理
startButton.addEventListener('click', () => {
    startTime = new Date().getTime();
    localStorage.setItem('startTime', startTime); // 開始時間をLocalStorageに保存
    flipPage(waitingScreen, mainScreen);
    startTimer();
});

// ノートめくるアニメーション
function flipPage(fromScreen, toScreen) {
    fromScreen.classList.add('flip');
    setTimeout(() => {
        fromScreen.classList.add('hidden');
        fromScreen.classList.remove('flip');
        toScreen.classList.remove('hidden');
        toScreen.classList.add('flip-final');
        setTimeout(() => {
            toScreen.classList.remove('flip-final');
        }, 400);
    }, 400); // 半回転の時間に合わせる
}

// タイマー開始
function startTimer() {
    timer = setInterval(() => {
        const now = new Date().getTime();
        const elapsed = Math.floor((now - startTime) / 1000);
        remainingTime = 1200 - elapsed;

        const minutes = Math.floor(remainingTime / 60);
        const seconds = remainingTime % 60;
        remainingTimeDisplay.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        remainingTimeAnswerDisplay.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;

        if (remainingTime <= 0) {
            clearInterval(timer);
            showResult(false);
        }
    }, 1000);
}

// シークバーの値が変わるたびに表示を更新
crimeHour.addEventListener('input', () => {
    hourDisplay.textContent = crimeHour.value;
});

crimeMinute.addEventListener('input', () => {
    minuteDisplay.textContent = crimeMinute.value.padStart(2, '0');
});

// ヒント確認
document.getElementById('confirmHint').addEventListener('click', () => {
    const selectedHint = document.getElementById('hintSelect');
    const hintValue = selectedHint.value;
    const hintText = selectedHint.options[selectedHint.selectedIndex].text;

    if (hintValue && !selectedHint.options[selectedHint.selectedIndex].disabled) { // 無効化チェック
        if (confirm(`ヒント: ${hintText}を確認しますか？`)) {
            // ヒント内容を設定
            let hintMessage = '';
            switch (hintValue) {
                case '足跡':
                    hintMessage = '足跡は事件現場の近くにあります。';
                    break;
                case 'カーテン':
                    hintMessage = 'カーテンの裏に何か隠されているかもしれません。';
                    break;
                case '棚':
                    hintMessage = '棚の上には何かが置かれているようです。';
                    break;
                case 'ナイフ':
                    hintMessage = 'ナイフは重要な証拠です。';
                    break;
                case '時計':
                    hintMessage = '時計が止まっています。';
                    break;
                case '血痕':
                    hintMessage = '血痕が見つかりました。';
                    break;
                default:
                    hintMessage = 'ヒントが見つかりません。';
            }

            hints.push(hintMessage); // 個別ヒントを配列に追加
            currentHintIndex = hints.length - 1;
            updateHintDisplay();
            hintCount++;
            hintCountDisplay.textContent = hintCount;
            hintCountAnswerDisplay.textContent = hintCount;
            selectedHint.options[selectedHint.selectedIndex].disabled = true; // 一度選んだヒントを無効化
            if (hints.length > 1) {
                hintNavigation.classList.remove('hidden');
            }
        }
    } else {
        alert('ヒントを選択してください。');
    }
});

// ヒントの表示を更新
function updateHintDisplay() {
    if (hints.length > 0) {
        hintDisplay.textContent = hints[currentHintIndex];
        document.getElementById('hintCounter').textContent = `${currentHintIndex + 1}/${hints.length}`;
    }
}

// 解答の送信
document.getElementById('submitAnswer').addEventListener('click', () => {
    const selectedCulprit = document.getElementById('culpritSelect').value;
    const selectedHour = crimeHour.value;
    const selectedMinute = crimeMinute.value;

    if (checkAnswer(selectedCulprit, selectedHour, selectedMinute)) {
        showResult(true); // 正解時
    } else {
        wrongAnswerCount++;
        answerDisabled = true;
        errorMessage.classList.remove('hidden');
        setTimeout(() => {
            errorMessage.classList.add('hidden');
            answerDisabled = false;
        }, 60000); // 1分間解答不可
    }
});

// 解答のチェック
function checkAnswer(culprit, hour, minute) {
    // 仮の正解: 犯人2, 14時30分
    return culprit === '犯人2' && hour === '14' && minute === '30';
}

// 結果表示
function showResult(isCorrect) {
    clearInterval(timer);
    flipPage(answerScreen, resultScreen);

    finalHintCount.textContent = hintCount;
    wrongAnswerCountDisplay.textContent = wrongAnswerCount;
    finalTime.textContent = remainingTime > 0 ? `残り時間: ${Math.floor(remainingTime / 60)}:${(remainingTime % 60).toString().padStart(2, '0')}` : "時間切れ";
    const score = Math.max(0, remainingTime - (hintCount * 100)); // スコア計算
    finalScore.textContent = score;
}

// ヒントを求めるボタンの処理
document.getElementById('goToHint').addEventListener('click', () => {
    flipPage(mainScreen, answerScreen);
});
