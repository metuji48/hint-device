let startTime;
let hintCount = 0;
let remainingTime = 1200, maxTime = remainingTime; // 20分 (1200秒)
let wrongAnswerCount = 0;
let timer;
let hints = [];
let currentHintIndex = 0;
let answerDisabled = false;

const allContent = document.querySelector('.all-content');

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
const specialHintButton = document.querySelector(".special-hint-button");
let currentScreen = waitingScreen;

// スタートボタンの処理
startButton.addEventListener('click', () => {
    if(displayConfirmAlert("ヒントデバイスの使用を開始しますか?\n（スタートした時点でタイマーがスタートします。）", () => {
        startTime = new Date().getTime();
        localStorage.setItem('startTime', startTime);
        flipPage(mainScreen);
        startTimer();
    }));
});

// ノートめくるアニメーション
function flipPage(toScreen) {
    /*
    currentScreen.classList.add('flip');

    setTimeout(() => {
        currentScreen.classList.add('hidden');
        currentScreen.classList.remove('flip');
        toScreen.classList.remove('hidden');
        toScreen.classList.add('flip-final');

        currentScreen = toScreen;

        setTimeout(() => {
            toScreen.classList.remove('flip-final');
        }, 1000);
    }, 1000);
    */

    
    currentScreen.classList.add('hidden');
    toScreen.classList.remove('hidden');
    currentScreen = toScreen;
}

function updateTimer() {
    const now = new Date().getTime();
    const elapsed = Math.floor((now - startTime) / 1000) ;
    remainingTime = 1200 - elapsed;

    const minutes = remainingTime <= 0 ? 0 : Math.floor(remainingTime / 60);
    const seconds = remainingTime <= 0 ? 0 : remainingTime % 60;
    remainingTimeDisplay.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    remainingTimeAnswerDisplay.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;

    updateProgressBarColor();


    if (remainingTime <= 0) {
        clearInterval(timer);
        showResult(false);
    }

}

// タイマー開始
function startTimer() {
    updateTimer();
    timer = setInterval(() => {
        updateTimer();
    }, 1000);
}
//時間がたつにつれて緑色から赤色にだんだん変わっていくようにする(#00ff00から#ff0000に)

// 色をグラデーションさせる関数
function getColorGradient(remainingTime, maxTime) {
    // remainingTimeの割合を計算（0から1の範囲）
    let ratio = remainingTime / maxTime;
    let red = Math.floor(ratio * 120);

    // RGBカラーコードを作成
    return `hsl(${red}, 50%, 50%)`;
}

// 進行状況の値に基づいて色を更新する関数
function updateProgressBarColor() {
    // 色を計算して設定
    let color = getColorGradient(remainingTime, maxTime);
    document.getElementById('timeBar').style.setProperty('--progress-color', color);
    document.getElementById('timeBarAnswer').style.setProperty('--progress-color', color);
 
    // 進行状況を更新
    document.querySelector("#timeBar").value = remainingTime;
    document.querySelector("#timeBarAnswer").value = remainingTime;
    
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
        displayConfirmAlert(`${hintText} についてのヒントでよろしいですか？`, () => {
            let hintMessage = '';
            
            switch (hintValue) {
                case '懐中電灯(手袋)':
                    hintMessage = '奈賀岡の指紋が検出された懐中電灯についた血を拭き取ったものだろう。しかし千田の体に打撲傷はない。<br>だとすると、奈賀岡が事件の犯人に抵抗するのに使ったにちがいない。懐中電灯（手袋）には犯人の血がついているはずだ。';
                    break;
                case '包丁':
                    hintMessage = '千田の指紋が検出された包丁だ。この物品から指紋は検出されていない。<br>とっさに起こった喧嘩ならば、手袋の用意は無いだろう。他殺説を高める証拠だ。';
                    break;
                case 'ロープ':
                    hintMessage = '奈賀岡が吊られていたロープ。<br>体の強い人間ならば、打撲等で被害者を気絶させた後にロープで吊るというのも可能だろう。';
                    break;
                case 'タバコ':
                    hintMessage = '窓際に落ちていたタバコ。燃え後を見るに、タバコを吸っている最中に突然殺されたのだろう。<br>被害者が開けた窓から犯人が侵入した可能性は否定できない。';
                    break;
                case '布団':
                    hintMessage = '飛び血を被った安物の布団。ここに血が被っているということは、犯人がドアから侵入した可能性は低そうだ。<br>このあたりを少し捜査するといいかもしれない。';
                    break;
                case '座布団':
                    hintMessage = 'よくある感じの座布団だ。<br>3つあるということは、奈賀岡宅を訪れていたのは千田だけではなかったのかもしれない。';
                    break;
                case 'いちごパック':
                    hintMessage = '福岡産のいちごのパック。お土産だろうか？資料によると宮路が福岡に出張していたようだから彼はこの部屋を訪れていたのかもしれない。<br>何かでこれを立証できればいいが……。';
                    break;
                case 'ティーカップ':
                    hintMessage = '酒ばかりのちゃぶ台に、ポツリとおかれたティーカップ。飲んだくれの被害者二人が使ったとは考えにくい。<br>千田の他にも来客がいたのだろう。唾液がついているはずだ。鑑定に掛けて確かめよう。';
                    break;
                case '雑誌':
                    hintMessage = 'よくある感じの雑誌だ。特に事件に関係は無いだろう。';
                    break;
                case '窓ガラス':
                    hintMessage = 'プランターに窓ガラスが飛び散っている。ガラスが外側に飛び散っているということは、窓は内側から割れたということだ。やはり喧嘩によるただの自殺事件なのか？....いや、犯人が事件の後に窓から脱出したという可能性は捨てきれない。';
                    break;
                case '卒アル':
                    hintMessage = '駒波高校の卒アル 2012 年度。奈賀岡、千田、宮路の名前が見て取れる。宮路の写真は後に合成された物のようだ。<br>不登校だったのか...?';
                    break;
                default:
                    hintMessage = 'ヒントが見つかりません。';
            }

            hints.push(`${hintValue}: <br>${hintMessage}`); // 個別ヒントを配列に追加
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
        });
    } else {
        displayAlert('ヒントを選択してください。');
    }
});

// ヒントの表示を更新
function updateHintDisplay() {
    if (hints.length > 0) {
        hintDisplay.innerHTML = hints[currentHintIndex];
        document.getElementById('hintCounter').innerText = `${currentHintIndex + 1}/${hints.length}`;
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

let answerStage = 0;

// 解答の送信
document.getElementById('submitAnswer').addEventListener('click', () => {
    if (answerDisabled) return; // 10秒間解答不可

    const selectedCulprit = document.getElementById('culpritSelect').value;
    const selectedHour = crimeHour.value;
    const selectedMinute = crimeMinute.value;

    if(answerStage === 0) {
        if (selectedCulprit) { // 無効化チェック
        
            displayConfirmAlert(`本当にこの解答でよろしいですか？<br>犯人: ${selectedCulprit}`, () => {
                if (selectedCulprit === '宮路 凛人') {
                    answerStage = 1;
                    displayAlert("正解!!<br>次に、犯行時刻を選択してください。");
                    document.querySelector(".answer-first").classList.add("hidden");
                    document.querySelector(".answer-second").classList.remove("hidden");

                    confetti({
                        particleCount: 50,
                        spread: 80,
                        origin: { x: 0.6, y: 0.6 }
                    });
                } else {
                    wrongAnswerCount++;
                    answerDisabled = true;
                    displayAlert("不正解･･･");
                    flipPage(mainScreen);
                    errorMessage.classList.remove('hidden');
                    lockoutAnswer();
                }
            });
        } else {
            displayAlert('犯人を選択してください。');
        }
    }else {
        displayConfirmAlert(`本当にこの解答でよろしいですか？<br>時刻: ${selectedHour}時${selectedMinute}分`, () => {
            if (selectedHour === '23' && selectedMinute === '0') {
                confetti({
                    particleCount: 200,
                    spread: 200,
                    origin: { y: 0.6 }
                });
                confetti({
                    particleCount: 300,
                    spread: 80,
                    origin: { y: 0.6 }
                });
                showResult(true); // 正解時
            } else {
                wrongAnswerCount++;
                answerDisabled = true;
                displayAlert("不正解･･･");
                flipPage(mainScreen);
                errorMessage.classList.remove('hidden');
                lockoutAnswer();
            }
        });
    }
    
});

// 犯人正解者用の特別ヒント
specialHintButton.addEventListener("click", () => {
    specialHintButton.classList.add("hidden");
    document.querySelector(".special-hint").classList.remove("hidden");
})

// 解答ロック
function lockoutAnswer() {
    answerDisabled = true;
    let remainingLockout = 10;
    document.getElementById('submitAnswer').classList.add('disabled');
    errorMessage.classList.remove('hidden');

    errorMessage.textContent = `10秒解答できません（残り 10 秒）`;

    lockoutTimer = setInterval(() => {
        remainingLockout--;
        errorMessage.textContent = `10秒解答できません（残り ${remainingLockout} 秒）`;
        if (remainingLockout <= 0) {
            clearInterval(lockoutTimer);
            answerDisabled = false;
            document.getElementById('submitAnswer').classList.remove('disabled');
            errorMessage.classList.add('hidden');
        }
    }, 1000);
}

// 結果表示
function showResult(isCorrect) {
    if(!isCorrect) {
        document.querySelector(".correct-label").textContent = "時間切れ…";
    }

    clearInterval(timer);
    flipPage(resultScreen);


    finalTime.textContent = remainingTime > 0 ? `${Math.floor(remainingTime / 60)}:${(remainingTime % 60).toString().padStart(2, '0')}` : "時間切れ";
    finalTimeScore.textContent = Math.max(0, remainingTime);

    finalHintCount.textContent = hintCount;
    finalHintCountScore.textContent = hintCount * -100;

    wrongAnswerCountDisplay.textContent = wrongAnswerCount;
    wrongAnswerCountDisplayScore.textContent = wrongAnswerCount * -50;

    const score = Math.max(0, remainingTime + (hintCount * -100) + (wrongAnswerCount) * -50); // スコア計算
    finalScore.textContent = "スコア: " + score;

    if (score >= 800) {
        rank = "シャーロック・ホームズ級";
    } else if (score === 777) {
        rank = "ラマヌジャン級";
    } else if (score >= 600) {
        rank = "レジェンド";
    } else if (score >= 500) {
        rank = "ウルトラ";
    } else if (score >= 400) {
        rank = "ハイパー";
    } else if (score >= 300) {
        rank = "スーパー";
    } else if (score >= 200) {
        rank = "ノーマル";
    } else if (score === 77) {
        rank = "ラマヌジャン級";
    } else if (score >= 100) {
        rank = "ミジンコ級";
    } else {
        rank = "似非"
    }
    ;

    finalRank.textContent = rank + "探偵";
}
document.getElementById('endButton').addEventListener('click', () => {
    const password = prompt("リロード用:");
    if (password === "1234") {
        resultScreen.classList.add('hidden');
        waitingScreen.classList.remove('hidden');
        location.reload();
    } else {
        displayAlert("ちゃんとスタッフに返してね");
    }
});

// 「ヒントを求める」ボタン
document.getElementById('goToHint').addEventListener('click', () => {
    flipPage(mainScreen);
});

// 「解答する」ボタン
document.getElementById('goToAnswer').addEventListener('click', () => {
    flipPage(answerScreen);
});

// ウィンドウを離れるときに警告をだす
window.addEventListener('beforeunload', (e) => {
    e.preventDefault();
    return message;
});


/* アラート */

document.querySelectorAll(".alert-box").forEach((alertBox) => {
    alertBox.querySelectorAll(".alert-btn").forEach((e) => {
        e.addEventListener('click', () => {
            alertBox.style.display = 'none';
            allContent.style.filter = 'brightness(100%)';
        });
    });
});

const confirmAlert = document.querySelector('#confirmAlert');
function displayConfirmAlert(content, yesFunction) {
    allContent.style.filter = 'brightness(50%)';
    confirmAlert.style.display = 'block';
    confirmAlert.querySelector("p").innerHTML = content;
    confirmAlert.querySelector(".yes-btn").onclick = yesFunction;
}


const alertAlert = document.querySelector('#alertAlert');
function displayAlert(content) {
    allContent.style.filter = 'brightness(50%)';
    alertAlert.style.display = 'block';
    alertAlert.style.transform = 'translateY(100px)';
    alertAlert.querySelector("p").innerHTML = content;
}
