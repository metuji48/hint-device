let startTime;
let hintCount = 0;
let remainingTime = 1200, maxTime = remainingTime; // 20分 (1200秒)
let wrongAnswerCount = 0;
let timer;
let hints = [], hintTitles = [];
let currentHintIndex = 0;
let answerDisabled = false;


const allContent = document.querySelector('.all-content');

const startButton = document.getElementById('startButton');
const waitingScreen = document.getElementById('waitingScreen');
const mainScreen = document.getElementById('mainScreen');
const fixedTimeScreen = document.getElementById('fixedTimeScreen');
const answerScreen = document.getElementById('answerScreen');
const resultScreen = document.getElementById('resultScreen');
const remainingTimeDisplay = document.getElementById('remainingTime');
const remainingTimeAnswerDisplay = document.getElementById('remainingTimeAnswer');
const remainingTimeFixedTimeDisplay = document.getElementById('remainingTimeFixedTime');

/*
const hintCountDisplay = document.getElementById('hintCount');
const hintCountAnswerDisplay = document.getElementById('hintCountAnswer');
*/

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

/*
const crimeHour = document.getElementById('crimeHour');
const hourDisplay = document.getElementById('hourDisplay');
const crimeMinute = document.getElementById('crimeMinute');
const minuteDisplay = document.getElementById('minuteDisplay');
const specialHintButton = document.querySelector(".special-hint-button");
*/

const endButton = document.getElementById('endButton');
let currentScreen = waitingScreen;

// スタートボタンの処理
startButton.addEventListener('click', () => {
    if (displayConfirmAlert("ヒントデバイスの使用を開始しますか?<br>※スタッフの指示に従ってください！", () => {
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

function makeTimeKirei(time) {
    const minutes = time <= 0 ? 0 : Math.floor(time / 60);
    const seconds = time <= 0 ? 0 : time % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function updateTimer() {
    const now = new Date().getTime();
    const elapsed = Math.floor((now - startTime) / 1000);
    remainingTime = 1200 - elapsed;

    const minutes = remainingTime <= 0 ? 0 : Math.floor(remainingTime / 60);
    const seconds = remainingTime <= 0 ? 0 : remainingTime % 60;
    remainingTimeDisplay.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    remainingTimeAnswerDisplay.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    remainingTimeFixedTimeDisplay.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;

    updateProgressBarColor();

    const accordionTimes = [0, -1, 4, 8, 12, 15, 17 ];
    const accordions = document.getElementsByClassName("accordion");
    const accordionSpans = document.getElementsByClassName("accordion-remain");
    const accordionTitles = document.getElementsByClassName("accordion-title");

    const titles = ["捜査開始", "アリバイ", "DNA鑑定", "訪問者の痕跡", "いちごパック", "パソコン", "LIEN" ];

    for (let i = 0; i < accordions.length; i++) {
        if ((accordionTimes[i] === -1 && answerStage === 1) || (accordionTimes[i] != -1 && accordionTimes[i] * 60 <= elapsed)) {
            if (accordions[i].classList.contains("closed")) {
                if(accordionTimes[i] != -1) accordionSpans[i].textContent = "";
                else {
                    const sideBarAccordion = document.querySelector(".side-bar-accordion");
                    sideBarAccordion.scrollTop = sideBarAccordion.scrollHeight;
                }
                accordions[i].classList.remove("closed");
                accordionTitles[i].textContent = titles[i];
                increaseFixedTimeBadgeCount();
                if (accordionTimes[i] > 0) {
                    displayNoti(`新たなヒントが開放されました！`);
                }
            }
        } else {
            if(accordionTimes[i] != -1) accordionSpans[i].textContent = "あと " + makeTimeKirei(accordionTimes[i] * 60 - elapsed);
        }
    }

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
    document.getElementById('timeBarFixedTime').style.setProperty('--progress-color', color);

    // 進行状況を更新
    document.querySelector("#timeBar").value = remainingTime;
    document.querySelector("#timeBarAnswer").value = remainingTime;
    document.querySelector("#timeBarFixedTime").value = remainingTime;
}

/* シークバーの値が変わるたびに表示を更新
crimeHour.addEventListener('input', () => {
    hourDisplay.textContent = (parseInt(crimeHour.value) + 12) % 24;
});

crimeMinute.addEventListener('input', () => {
    minuteDisplay.textContent = crimeMinute.value.padStart(2, '0');
});*/

// ヒント確認
document.getElementById('confirmHint').addEventListener('click', () => {
    const selectedHint = document.getElementById('hintSelect');
    const hintValue = selectedHint.value;
    const hintText = selectedHint.options[selectedHint.selectedIndex].text;


    if (hintValue && !selectedHint.options[selectedHint.selectedIndex].disabled) { // 無効化チェック
        displayConfirmAlert(`${hintText} についてのヒントでよろしいですか？`, () => {
            let hintMessage = '';

            switch (hintValue) {
                case '懐中電灯':
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

            hintTitles.push(hintValue);
            hints.push(hintMessage);
            currentHintIndex = hints.length - 1;
            updateHintDisplay();
            hintCount++;
            //hintCountDisplay.textContent = hintCount;
            //hintCountAnswerDisplay.textContent = hintCount;
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

const culprits = [
    { name: "楠木 実", photo: "image/culprit1.jpg" },
    { name: "須賀 章", photo: "image/culprit2.jpg" },
    { name: "矢場 丈則", photo: "image/culprit3.jpg" },
    { name: "宮路 凛人", photo: "image/culprit4.jpg" },
    { name: "河伊 健二郎", photo: "image/culprit5.jpg" }
];

let currentCulpritIndex = 0;

function updateCulpritDisplay() {
    const culprit = culprits[currentCulpritIndex];
    document.getElementById('culpritPhoto').setAttribute("src", culprit.photo);
    document.getElementById('culpritName').textContent = culprit.name;
}

document.getElementById('prevCulprit').addEventListener('click', () => {
    currentCulpritIndex = (currentCulpritIndex === 0) ? culprits.length - 1 : currentCulpritIndex - 1;
    updateCulpritDisplay();
});

document.getElementById('nextCulprit').addEventListener('click', () => {
    currentCulpritIndex = (currentCulpritIndex === culprits.length - 1) ? 0 : currentCulpritIndex + 1;
    updateCulpritDisplay();
});

// 初期表示の更新
updateCulpritDisplay();

// ヒントの表示を更新
function updateHintDisplay() {
    if (hints.length > 0) {
        document.querySelector("#hintTitle").innerHTML = hintTitles[currentHintIndex];
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
    // const selectedHour = (parseInt(document.getElementById('crimeHour').value, 10) + 12) % 24;
    // const selectedMinute = parseInt(document.getElementById('crimeMinute').value, 10);

    if (answerStage === 0) {
        displayConfirmAlert(`本当にこの解答でよろしいですか？<br>犯人: ${culprits[currentCulpritIndex].name}`, () => {
            if (currentCulpritIndex === 3) {
                answerStage = 1;
                displayAlert("正解!!<br>次に、犯行時刻を選択してください。<br>(新たなヒントが見つかりました)");
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
        displayConfirmAlert(`本当にこの解答でよろしいですか？<br>時刻: ${hour}時${minute.toString().padStart(2, '0')}分`, () => {
            if ((hour === 23 && minute >= 0) ||
                (hour === 23 && minute <= 10)) {
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
    if (!isCorrect) {
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
    let score, rank;

    if (isCorrect) {
        score = Math.max(0, remainingTime + (hintCount * -100) + (wrongAnswerCount * -50) + 1000); // スコア計算

        if (score >= 1400) {
            rank = "シャーロック・ホームズ級";
        } else if (score === 777) {
            rank = "X級";
        } else if (score >= 900) {
            rank = "S級";
        } else if (score >= 600) {
            rank = "A+級";
        } else if (score >= 400) {
            rank = "A級";
        } else if (score >= 300) {
            rank = "B+級";
        } else if (score >= 200) {
            rank = "B級";
        } else if (score === 77) {
            rank = "X級";
        } else if (score >= 100) {
            rank = "C級";
        } else if (score === -1) {
            rank = "惜しい";
        }
    } else {
        score = "ー";
        rank = "見習い";
        document.getElementById('correctBonusScore').parentElement.style.display = 'none'; // 不正解の場合は正解ボーナスを非表示
    }

    finalScore.textContent = "スコア: " + score;

    finalRank.textContent = rank + "探偵";
}

document.getElementById('endButton').addEventListener('click', () => {
    const password = prompt("リロード用:");
    if (password === "diamondowall24") {
        resultScreen.classList.add('hidden');
        waitingScreen.classList.remove('hidden');
        location.reload();
    } else {
        displayAlert("ちゃんとスタッフに返してね");
    }
});

// 「ヒントを求める」ボタン
document.getElementById('goToHint2').addEventListener('click', () => {
    flipPage(mainScreen);
    resetFixedTimeBadge();
});
document.getElementById('goToHint3').addEventListener('click', () => {
    flipPage(mainScreen);
});

// 「定時ヒント」ボタン
document.getElementById('goToFixedTime1').addEventListener('click', () => {
    flipPage(fixedTimeScreen);
    resetFixedTimeBadge();
});
document.getElementById('goToFixedTime3').addEventListener('click', () => {
    flipPage(fixedTimeScreen);
    resetFixedTimeBadge();
});

// 「解答する」ボタン
document.getElementById('goToAnswer1').addEventListener('click', () => {
    flipPage(answerScreen);
});
document.getElementById('goToAnswer2').addEventListener('click', () => {
    flipPage(answerScreen);
    resetFixedTimeBadge();
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

let showAlertNotifications = true;
const notiAlert = document.querySelector("#notiAlert");
function displayNoti(content) {
    if (!showAlertNotifications) return; // 通知を無効化している場合は表示しない

    allContent.style.filter = 'brightness(50%)';
    notiAlert.style.display = 'block';
    notiAlert.style.transform = 'translateY(100px)';
    notiAlert.querySelector("p").innerHTML = content;
}

// 定時ヒントの通知バッジ関連変数
const fixedTimeBadge1 = document.getElementById('fixedTimeBadge1');
const fixedTimeBadge3 = document.getElementById('fixedTimeBadge3');
let fixedTimeBadgeCount = 0;


// バッジのカウントを増加
function increaseFixedTimeBadgeCount() {
    fixedTimeBadgeCount++;
    fixedTimeBadge1.textContent = fixedTimeBadgeCount;
    fixedTimeBadge1.classList.remove('hidden');
    fixedTimeBadge3.textContent = fixedTimeBadgeCount;
    fixedTimeBadge3.classList.remove('hidden');
}

// バッジのカウントをリセット
function resetFixedTimeBadge() {
    fixedTimeBadgeCount = 0;
    fixedTimeBadge1.classList.add('hidden');
    fixedTimeBadge3.classList.add('hidden');
}

//チェックボックスの設定を保存
document.getElementById('notiAlertButtonYes').addEventListener('click', () => {
    const optOutCheckbox = document.getElementById('notiAlertCheckbox');
    if (optOutCheckbox.checked) {
        showAlertNotifications = false;
    }
    notiAlert.style.display = 'none';
    allContent.style.filter = 'brightness(100%)';
});

let hour = 0;
let minute = 0;

function updateDisplay() {
    document.getElementById('hour').innerText = hour;
    document.getElementById('minute').innerText = String(minute).padStart(2, '0');
}

function increment(type) {
    if (type === 'hour') {
        hour = (hour + 1) % 24;
    } else if (type === 'minute') {
        minute = (minute + 5) % 60;
    }
    updateDisplay();
}

function decrement(type) {
    if (type === 'hour') {
        hour = (hour - 1 + 24) % 24;
    } else if (type === 'minute') {
        minute = (minute - 5 + 60) % 60;
    }
    updateDisplay();
}

function scrollChange(event, type) {
    event.preventDefault();
    if (event.deltaY < 0) {
        increment(type);
    } else {
        decrement(type);
    }
}

let changeInterval, clickTimeout;

function startChange(type, operation) {
    isLongPress = false;
    // 短いクリックを判定するためのタイマーを設定
    clickTimeout = setTimeout(() => {
        isLongPress = true; // 200ms後に長押しと判定
        if (operation === 'increment') {
            changeInterval = setInterval(() => increment(type), 100);
        } else if (operation === 'decrement') {
            changeInterval = setInterval(() => decrement(type), 100);
        }
    }, 200);
}

function stopChange(type, operation) {
    clearTimeout(clickTimeout);
    clearInterval(changeInterval);
    // 長押しでなければ、1回だけ処理を行う
    if (!isLongPress) {
        if (operation === 'increment') { increment(type); }
        else if (operation === 'decrement') { decrement(type); }
    }
}

updateDisplay();
