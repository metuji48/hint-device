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

const finalTimeScore = document.getElementById('finalTimeScore');
const finalHintCountScore = document.getElementById('finalHintCountScore');
const wrongAnswerCountDisplayScore = document.getElementById('wrongAnswerCountScore');

const finalScore = document.getElementById('finalScore');
const finalRank = document.getElementById('finalRank');

const crimeHour = document.getElementById('crimeHour');
const hourDisplay = document.getElementById('hourDisplay');
const crimeMinute = document.getElementById('crimeMinute');
const minuteDisplay = document.getElementById('minuteDisplay');
const endButton = document.getElementById('endButton');

let currentScreen = waitingScreen;

// スタートボタンの処理
startButton.addEventListener('click', () => {
    startTime = new Date().getTime();
    localStorage.setItem('startTime', startTime); // 開始時間をLocalStorageに保存
    flipPage(mainScreen);
    startTimer();
});

// ノートめくるアニメーション
function flipPage(toScreen) {
    currentScreen.classList.add('flip');
    setTimeout(() => {
        currentScreen.classList.add('hidden');
        currentScreen.classList.remove('flip');
        toScreen.classList.remove('hidden');
        toScreen.classList.add('flip-final');

        currentScreen = toScreen;

        setTimeout(() => {
            toScreen.classList.remove('flip-final');
        }, 300);
    }, 300); // 半回転の時間に合わせる
}

// タイマー開始
function startTimer() {
    timer = setInterval(() => {
        const now = new Date().getTime();
        const elapsed = Math.floor((now - startTime) / 1000);
        remainingTime = 1200 - elapsed;

        const minutes = remainingTime <= 0 ? 0 : Math.floor(remainingTime / 60);
        const seconds = remainingTime <= 0 ? 0 : remainingTime % 60;
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

            hints.push(`${hintValue}: ${hintMessage}`); // 個別ヒントを配列に追加
            currentHintIndex = hints.length - 1;
            updateHintDisplay();
            hintCount++;
            hintCountDisplay.textContent = hintCount;
            hintCountAnswerDisplay.textContent = hintCount;
            selectedHint.options[selectedHint.selectedIndex].disabled = true; // 一度選んだヒントを無効化
            selectedHint.value = '';
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

// 表示するヒントの選択ボタン
document.getElementById('prevHint').addEventListener('click', () => {
    if (currentHintIndex > 0) {
        currentHintIndex--;
        updateHintDisplay();
    }
});

document.getElementById('nextHint').addEventListener('click', () => {
    if (currentHintIndex < hints.length - 1) {
        currentHintIndex++;
        updateHintDisplay();
    }
});

// 解答の送信
document.getElementById('submitAnswer').addEventListener('click', () => {
    if (answerDisabled) return; // 1分間解答不可

    const selectedCulprit = document.getElementById('culpritSelect').value;
    const selectedHour = crimeHour.value;
    const selectedMinute = crimeMinute.value;

    if (confirm(`本当にこの解答でよろしいですか？\n犯人: ${selectedCulprit}\n時刻: ${selectedHour}時${selectedMinute}分`)) {
        if (selectedCulprit === '宮路 凛人' && selectedHour === '0' && selectedMinute === '30') {
            showResult(true); // 正解時
        } else {
            wrongAnswerCount++;
            answerDisabled = true;
            alert("不正解･･･");
            flipPage(mainScreen);
            errorMessage.classList.remove('hidden');
            lockoutAnswer();
        }
    }
});

// 解答ロック
function lockoutAnswer() {
    answerDisabled = true;
    let remainingLockout = 10;
    document.getElementById('goToAnswer').classList.add('disabled');
    errorMessage.classList.remove('hidden');
    lockoutTimer = setInterval(() => {
        remainingLockout--;
        errorMessage.textContent = `10秒解答できません（残り ${remainingLockout} 秒）`;
        if (remainingLockout <= 0) {
            clearInterval(lockoutTimer);
            answerDisabled = false;
            document.getElementById('goToAnswer').classList.remove('disabled');
            errorMessage.classList.add('hidden');
        }
    }, 1000);
}

// 結果表示
function showResult(isCorrect) {
    clearInterval(timer);
    flipPage(resultScreen);

    
    finalTime.textContent = remainingTime > 0 ? `${Math.floor(remainingTime / 60)}:${(remainingTime % 60).toString().padStart(2, '0')}` : "時間切れ";
    finalTimeScore.textContent = Math.max(0, remainingTime);

    finalHintCount.textContent = hintCount;
    finalHintCountScore.textContent = hintCount * -100;

    wrongAnswerCountDisplay.textContent = wrongAnswerCount;
    wrongAnswerCountDisplayScore.textContent = wrongAnswerCount * -50;

    const score = Math.max(0, remainingTime + (hintCount * -100) + (wrongAnswerCount) * -50); // スコア計算
    finalScore.textContent = score;

    if (score >= 800) {
        rank = "シャーロックホームズ級"
    } else if(score=777){
        rank = "ラマヌジャン級"
    }
    else if (score >= 600) {
        rank = "レジェンド級"
    }  else if (score >= 500) {
        rank = "ウルトラ級"
    } else if (score >= 400) {
        rank = "ハイパー級"
    } else if (score >= 300) {
        rank = "スーパー級"
    } else if (score >= 200) {
        rank = "ノーマル級"
    }else {
        rank = "ミジンコ級"
    }

    finalRank.textContent = rank;
}
document.getElementById('endButton').addEventListener('click', () => {
    const password = prompt("スタッフ専用パスワードを入力してください:");
    if (password === "1234") {
        resultScreen.classList.add('hidden');
        waitingScreen.classList.remove('hidden');
        location.reload();
    } else {
        alert("パスワードが間違っています。");
    }
});

// 「ヒントを求める」ボタン
document.getElementById('goToHint').addEventListener('click', () => {
    flipPage(mainScreen);
});

// 「解答する」ボタン
document.getElementById('goToAnswer').addEventListener('click', () => {
    if (!answerDisabled) {
        flipPage(answerScreen);
    }
});
