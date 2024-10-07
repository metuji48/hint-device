let startTime;
let hintCount = 0;
let remainingTime = 1200; // 20分 (1200秒)
let wrongAnswerCount = 0;
let timer;
let hints = [
    { text: "足跡", seen: false },
    { text: "カーテン", seen: false },
    { text: "棚", seen: false },
    { text: "ナイフ", seen: false },
    { text: "時計", seen: false },
    { text: "血痕", seen: false },
];
let currentHintIndex = 0;
let answerDisabled = false;
let lockoutTimer;

const startButton = document.getElementById('startButton');
const waitingScreen = document.getElementById('waitingScreen');
const mainScreen = document.getElementById('mainScreen');
const answerScreen = document.getElementById('answerScreen');
const resultScreen = document.getElementById('resultScreen');
const remainingTimeDisplay = document.getElementById('remainingTime');
const remainingTimeAnswerDisplay = document.getElementById('remainingTimeAnswer');
const hintCountDisplay = document.getElementById('hintCount');
const hintCountAnswerDisplay = document.getElementById('hintCountAnswer');
const chatWindow = document.getElementById('chatWindow');
const hintSelect = document.getElementById('hintSelect');
const errorMessage = document.getElementById('errorMessage');
const lockoutTimeDisplay = document.getElementById('lockoutTime');
const finalTime = document.getElementById('finalTime');
const finalHintCount = document.getElementById('finalHintCount');
const wrongAnswerCountDisplay = document.getElementById('wrongAnswerCount');
const finalScore = document.getElementById('finalScore');

// スタートボタンの処理
startButton.addEventListener('click', () => {
    startTime = new Date().getTime();
    localStorage.setItem('startTime', startTime); // 開始時間をLocalStorageに保存
    waitingScreen.classList.add('hidden');
    mainScreen.classList.remove('hidden');
    startTimer();
    updateHintOptions();
});

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

// ヒントオプションを更新
function updateHintOptions() {
    hintSelect.innerHTML = ''; // 既存のオプションをクリア
    hintSelect.innerHTML = `<option value="" disabled selected>ヒントを選択</option>`;
    
    hints.forEach((hint, index) => {
        if (!hint.seen) {
            const option = document.createElement('option');
            option.value = index;
            option.textContent = hint.text;
            hintSelect.appendChild(option);
        }
    });
}

// ヒント確認
document.getElementById('confirmHint').addEventListener('click', () => {
    const hintIndex = hintSelect.value;
    
    if (hintIndex !== "" && hints[hintIndex] && !hints[hintIndex].seen) {
        const userMessage = document.createElement('div');
        userMessage.classList.add('message', 'user-message');
        userMessage.textContent = `${hints[hintIndex].text}について教えて`;
        chatWindow.appendChild(userMessage);

        const responseMessage = document.createElement('div');
        responseMessage.classList.add('message', 'response-message');
        responseMessage.textContent = `ヒント: ${hints[hintIndex].text}に関する情報です。`;
        chatWindow.appendChild(responseMessage);

        chatWindow.scrollTop = chatWindow.scrollHeight; // 最新メッセージへ自動スクロール

        hints[hintIndex].seen = true; // 見たヒントを管理
        currentHintIndex = parseInt(hintIndex);
        hintCount++;
        hintCountDisplay.textContent = hintCount;
        hintCountAnswerDisplay.textContent = hintCount;
        updateHintOptions(); // ヒントオプションを更新
    } else {
        alert('ヒントを選択してください。');
    }
});

// 解答シーンへ移動
document.getElementById('goToAnswer').addEventListener('click', () => {
    if (!answerDisabled) {
        mainScreen.classList.add('hidden');
        answerScreen.classList.remove('hidden');
    } else {
        errorMessage.classList.remove('hidden');
    }
});

// 解答シーンからヒントに戻る
document.getElementById('goToHint').addEventListener('click', () => {
    answerScreen.classList.add('hidden');
    mainScreen.classList.remove('hidden');
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
            lockoutAnswer();
            alert("不正解です。1分後にまた解答してください");
            answerScreen.classList.add('hidden');
            mainScreen.classList.remove('hidden');
        }
    }
});

// 解答ロック
function lockoutAnswer() {
    answerDisabled = true;
    let remainingLockout = 60;
    document.getElementById('goToAnswer').style.backgroundColor = "#888";
    errorMessage.classList.remove('hidden');
    lockoutTimer = setInterval(() => {
        remainingLockout--;
        lockoutTimeDisplay.textContent = remainingLockout;
        if (remainingLockout <= 0) {
            clearInterval(lockoutTimer);
            answerDisabled = false;
            document.getElementById('goToAnswer').style.backgroundColor = "#333";
            errorMessage.classList.add('hidden');
        }
    }, 1000);
}

// 結果表示
function showResult(isCorrect) {
    clearInterval(timer);
    answerScreen.classList.add('hidden');
    resultScreen.classList.remove('hidden');

    finalHintCount.textContent = hintCount;
    wrongAnswerCountDisplay.textContent = wrongAnswerCount;
    finalTime.textContent = remainingTime > 0 ? `${Math.floor(remainingTime / 60)}:${(remainingTime % 60).toString().padStart(2, '0')}` : "時間切れ";
    const score = Math.max(0, remainingTime - (hintCount * 100));
    finalScore.textContent = score;
}

// 終了ボタンの処理
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

