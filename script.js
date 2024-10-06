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

// ヒント確認
document.getElementById('confirmHint').addEventListener('click', () => {
    const selectedHint = document.getElementById('hintSelect');
    const hintValue = selectedHint.value;
    const hintText = selectedHint.options[selectedHint.selectedIndex].text;
    
    if (hintValue && !selectedHint.disabled) {
        if (confirm(`ヒント: ${hintText}を確認しますか？`)) {
            hints.push(hintText);
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

// ヒント表示を更新
function updateHintDisplay() {
    hintDisplay.textContent = hints[currentHintIndex];
    document.getElementById('hintCounter').textContent = `${currentHintIndex + 1}/${hints.length}`;
}

// 左右の矢印でヒントを切り替え
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

// 解答シーンへ移動
document.getElementById('goToAnswer').addEventListener('click', () => {
    if (!answerDisabled) {
        flipPage(mainScreen, answerScreen);
    } else {
        errorMessage.classList.remove('hidden');
    }
});

// 解答ボタンの処理
document.getElementById('submitAnswer').addEventListener('click', () => {
    const selectedCulprit = document.getElementById('culpritSelect').value;
    const selectedHour = document.getElementById('crimeHour').value;
    const selectedMinute = document.getElementById('crimeMinute').value;

    const confirmation = confirm(`犯人: ${selectedCulprit}, 犯行時刻: ${selectedHour}:${selectedMinute.padStart(2, '0')} でよろしいですか？`);
    if (confirmation) {
        if (selectedCulprit === "犯人1" && selectedHour === "12" && selectedMinute === "00") {
            showResult(true);
        } else {
            wrongAnswerCount++;
            remainingTime -= 60; // 間違った場合、1分減らす
            answerDisabled = true;
            errorMessage.classList.remove('hidden');
            flipPage(answerScreen, mainScreen);
            document.getElementById('goToAnswer').classList.add('disabled');
            setTimeout(() => {
                answerDisabled = false;
                errorMessage.classList.add('hidden');
                document.getElementById('goToAnswer').classList.remove('disabled');
            }, 60000); // 1分間無効化
            alert("不正解です。1分減少しました。");
        }
    }
});

// 結果表示
function showResult(isCorrect) {
    clearInterval(timer);
    flipPage(answerScreen, resultScreen);

    finalHintCount.textContent = hintCount;
    wrongAnswerCountDisplay.textContent = wrongAnswerCount;
    finalTime.textContent = remainingTime > 0 ? `残り時間: ${Math.floor(remainingTime / 60)}:${remainingTime % 60}` : "時間切れ";
    const score = Math.max(0, remainingTime - (hintCount * 100));
    finalScore.textContent = score;
}

// 終了ボタンの処理
document.getElementById('endButton').addEventListener('click', () => {
    const password = prompt("スタッフ専用パスワードを入力してください:");
    if (password === "1234") {
        flipPage(resultScreen, waitingScreen);
        location.reload();
    } else {
        alert("パスワードが間違っています。");
    }
});
