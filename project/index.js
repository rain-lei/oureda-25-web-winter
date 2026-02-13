/**
 * 本文件是在构建 Wordle 程序过程中需要使用的脚本
 * ! 在编写代码之前请您务必仔细阅读每一行注释并不要删除或修改注释
 * 其中部分函数已经给出，需要您根据实际需求进行补全
 * 函数的具体作用请参考注释
 * 请确保所有的 TODO 都被补全
 * 若无特殊需要请尽量不要定义新的函数
 */

/**
 * Global Variables
 *
 * 您的所有全局变量需要在此处定义
 * 我们已经预先为您定义了一部分全局变量
 *
 */

// 固定的答案长度
const answerLength = 5;
// 最多尝试次数
const maxGuessTime = 6;

// Wordle 中出现的三种颜色，更推荐使用枚举
// 此处 green 用字母 b 表示，具体原因请参见代码任务
const grey = "g";
const yellow = "y";
const green = "b";

// 颜色序列，类型为 string[]，存储每一行的颜色结果
let colorSequence = [];
// 单词序列，类型为 string[]，存储每一次的猜测单词
let wordSequence = [];

// 本次 Wordle 的答案
let answer = "";
// 当前猜测的答案（正在输入的单词）
let guess = "";
// 当前已经使用的猜测次数 (0 ~ 5)
let currentGuessTime = 0;
// 当前游标位置（暂时不需要，我们可以通过 guess.length 计算）
let index = 1;

// 单词列表
let wordList = [];

/**
 * 程序当前的状态，更推荐使用枚举
 *
 * 预计会使用到的状态：
 * 1. "UNFINISHED": 表示 Wordle 未被解决即仍有剩余猜测次数
 * 2. "SOLVED": 表示当前 Wordle 已被解决
 * 3. "FAILED": 表示当前 Wordle 解决失败
 * 可以根据需要设计新的状态
 */
let state = "UNFINISHED";

/**
 * 预定义的 JavaScript 程序的入口
 * 请不要额外定义其他的程序入口
 */
start();

/**
 * start()
 *
 * 整个程序的入口函数
 *
 * 您需要完成的任务：
 * 1. 初始化程序的运行状态
 * 2. 接收交互信息后改变内部状态并作出反馈
 */
async function start() {
    // 1. 初始化 DOM 元素（生成网格和键盘）
    setupUI();
    
    // 2. 初始化游戏状态
    await initialize();

    // 3. 绑定键盘事件
    document.addEventListener("keydown", handleKeydown);
    
    // 4. 绑定虚拟键盘事件
    const keys = document.querySelectorAll(".key");
    keys.forEach(key => {
        key.addEventListener("click", () => {
            const keyVal = key.getAttribute("data-key");
            handleInput(keyVal);
        });
    });

    // 5. 绑定重新开始按钮
    document.getElementById("restart-btn").addEventListener("click", async () => {
        await initialize();
        // 重置 UI
        resetUI();
    });
}

/**
 * setupUI()
 * 生成 6x5 的网格和虚拟键盘
 */
function setupUI() {
    const board = document.getElementById("board");
    board.innerHTML = ""; // 清空
    for (let i = 0; i < maxGuessTime * answerLength; i++) {
        const tile = document.createElement("div");
        tile.classList.add("tile");
        tile.id = `tile-${i}`;
        board.appendChild(tile);
    }

    const keyboardContainer = document.getElementById("keyboard-container");
    keyboardContainer.innerHTML = ""; // 清空
    const rows = [
        "qwertyuiop",
        "asdfghjkl",
        "zxcvbnm"
    ];
    
    rows.forEach((rowStr, rowIndex) => {
        const rowDiv = document.createElement("div");
        rowDiv.classList.add("keyboard-row");
        
        // 第二行前面稍微缩进（可选）
        if (rowIndex === 1) {
            // const spacer = document.createElement("div");
            // spacer.style.flex = "0.5";
            // rowDiv.appendChild(spacer);
        }

        // Enter key at start of last row? No, usually at ends.
        if (rowIndex === 2) {
             const enterKey = createKeyElement("Enter");
             enterKey.classList.add("key-large");
             rowDiv.appendChild(enterKey);
        }

        for (let char of rowStr) {
            rowDiv.appendChild(createKeyElement(char));
        }

        if (rowIndex === 2) {
            const backspaceKey = createKeyElement("Backspace");
            backspaceKey.innerHTML = "⌫"; // Display symbol
            backspaceKey.setAttribute("data-key", "Backspace");
            backspaceKey.classList.add("key-large");
            rowDiv.appendChild(backspaceKey);
        }
        
        keyboardContainer.appendChild(rowDiv);
    });
}

function createKeyElement(keyVal) {
    const key = document.createElement("button");
    key.classList.add("key");
    key.textContent = keyVal;
    key.setAttribute("data-key", keyVal);
    key.id = `key-${keyVal.toLowerCase()}`; // 用于后续更新颜色
    return key;
}

/**
 * handleKeydown(e)
 * 处理物理键盘输入
 */
function handleKeydown(e) {
    if (state !== "UNFINISHED") return;
    
    const key = e.key;
    if (key === "Enter") {
        handleInput("Enter");
    } else if (key === "Backspace") {
        handleInput("Backspace");
    } else if (/^[a-zA-Z]$/.test(key)) {
        handleInput(key.toLowerCase());
    }
}

/**
 * handleInput(key)
 * 统一处理输入逻辑
 */
function handleInput(key) {
    if (state !== "UNFINISHED") return;

    if (key === "Enter") {
        if (guess.length !== answerLength) {
            showMessage("Not enough letters");
            shakeRow();
            return;
        }
        handleAnswer(guess);
    } else if (key === "Backspace") {
        guess = guess.slice(0, -1);
        render();
    } else if (guess.length < answerLength) {
        guess += key.toLowerCase();
        render();
    }
}

/**
 * render()
 * 根据程序当前的状态渲染对应的用户页面 (主要更新当前正在输入的行)
 */
function render(letter) {
    // 计算当前行的起始索引
    const startIdx = currentGuessTime * answerLength;
    
    // 清除当前行的显示（为了简单，重新渲染整行）
    for (let i = 0; i < answerLength; i++) {
        const tile = document.getElementById(`tile-${startIdx + i}`);
        tile.textContent = "";
        tile.classList.remove("filled");
    }

    // 填充当前的 guess
    for (let i = 0; i < guess.length; i++) {
        const tile = document.getElementById(`tile-${startIdx + i}`);
        tile.textContent = guess[i];
        tile.classList.add("filled");
    }
}

/**
 * initialize()
 * 初始化程序的状态
 */
async function initialize() {
    state = "UNFINISHED";
    guess = "";
    currentGuessTime = 0;
    wordSequence = [];
    colorSequence = [];
    
    // 隐藏重启按钮
    document.getElementById("restart-btn").style.display = "none";
    showMessage(""); // 清空消息

    // 生成答案
    await generateRandomAnswer();
    console.log("Target Word:", answer); // 方便调试
}

/**
 * resetUI()
 * 重置界面显示
 */
function resetUI() {
    const tiles = document.querySelectorAll(".tile");
    tiles.forEach(tile => {
        tile.textContent = "";
        tile.className = "tile"; // 移除颜色类
    });
    
    const keys = document.querySelectorAll(".key");
    keys.forEach(key => {
        key.classList.remove("correct", "present", "absent");
    });
}

/**
 * generateRandomAnswer()
 * 从题库中随机选取一个单词作为答案
 */
async function generateRandomAnswer() {
    if (wordList.length === 0) {
        try {
            const response = await fetch("words.json");
            const data = await response.json();
            wordList = data.words;
        } catch (error) {
            console.error("Failed to load words.json", error);
            // Fallback list
            wordList = ["apple", "bread", "crane", "doubt", "eagle"];
            showMessage("Error loading words, using fallback list.");
        }
    }
    
    const randomIndex = Math.floor(Math.random() * wordList.length);
    answer = wordList[randomIndex];
    return answer;
}

/**
 * isValidWord()
 * 判断一个单词是否合法
 */
function isValidWord(word) {
    if (word.length !== answerLength) return false;
    // 检查是否在单词列表中
    return wordList.includes(word);
}

/**
 * handleAnswer()
 * 处理一次对单词的猜测，并根据其猜测结果更新程序内部状态
 */
function handleAnswer(currentGuess) {
    // 1. 验证单词有效性
    if (!isValidWord(currentGuess)) {
        showMessage("Not in word list");
        shakeRow();
        return;
    }

    // 2. 计算颜色序列
    const colors = calculateColorSequence(currentGuess, answer);
    
    // 3. 更新状态
    wordSequence.push(currentGuess);
    colorSequence.push(colors);
    
    // 4. 更新 UI (显示颜色)
    updateRowColors(colors, currentGuess);
    updateKeyboardColors(colors, currentGuess);

    // 5. 检查胜负
    if (currentGuess === answer) {
        state = "SOLVED";
        showMessage("You Won!");
        document.getElementById("restart-btn").style.display = "block";
    } else {
        currentGuessTime++;
        guess = ""; // 清空当前猜测
        
        if (currentGuessTime >= maxGuessTime) {
            state = "FAILED";
            showMessage(`Game Over! Answer: ${answer}`);
            document.getElementById("restart-btn").style.display = "block";
        }
    }
}

/**
 * calculateColorSequence()
 * 计算两个单词的颜色匹配序列
 * 返回结果为："bggyy" (b=green, y=yellow, g=grey)
 */
function calculateColorSequence(guessWord, answerWord) {
    let result = new Array(answerLength).fill(grey);
    let answerArr = answerWord.split("");
    let guessArr = guessWord.split("");

    // 第一步：查找完全匹配 (Green / 'b')
    for (let i = 0; i < answerLength; i++) {
        if (guessArr[i] === answerArr[i]) {
            result[i] = green;
            answerArr[i] = null; // 标记已匹配，防止被 Yellow 重复匹配
            guessArr[i] = null;
        }
    }

    // 第二步：查找存在但位置不对 (Yellow / 'y')
    for (let i = 0; i < answerLength; i++) {
        if (guessArr[i] !== null) { // 跳过已匹配 Green 的
            const indexInAnswer = answerArr.indexOf(guessArr[i]);
            if (indexInAnswer !== -1) {
                result[i] = yellow;
                answerArr[indexInAnswer] = null; // 标记已使用
            }
        }
    }

    return result.join("");
}

/**
 * updateRowColors(colors, guessWord)
 * 更新网格行的颜色
 */
function updateRowColors(colors, guessWord) {
    const startIdx = currentGuessTime * answerLength;
    for (let i = 0; i < answerLength; i++) {
        const tile = document.getElementById(`tile-${startIdx + i}`);
        const colorCode = colors[i];
        
        // 增加延时动画效果
        setTimeout(() => {
            tile.classList.add("flip"); // 可以添加翻转动画类
            if (colorCode === green) {
                tile.classList.add("correct");
            } else if (colorCode === yellow) {
                tile.classList.add("present");
            } else {
                tile.classList.add("absent");
            }
        }, i * 200); // 每个格子间隔 200ms
    }
}

/**
 * updateKeyboardColors(colors, guessWord)
 * 更新虚拟键盘颜色
 */
function updateKeyboardColors(colors, guessWord) {
    for (let i = 0; i < answerLength; i++) {
        const letter = guessWord[i];
        const colorCode = colors[i];
        const key = document.getElementById(`key-${letter}`);
        
        if (!key) continue;

        // 优先级：Green > Yellow > Grey
        // 如果已经是 Green，不要变回 Yellow 或 Grey
        if (key.classList.contains("correct")) continue;
        
        if (colorCode === green) {
            key.classList.remove("present", "absent");
            key.classList.add("correct");
        } else if (colorCode === yellow) {
            if (!key.classList.contains("correct")) {
                key.classList.add("present");
            }
        } else {
            if (!key.classList.contains("correct") && !key.classList.contains("present")) {
                key.classList.add("absent");
            }
        }
    }
}

/**
 * showMessage(msg)
 * 显示提示信息
 */
function showMessage(msg) {
    const container = document.getElementById("message-container");
    container.textContent = msg;
    
    // 3秒后自动清除 (如果是临时消息)
    if (msg === "Not in word list" || msg === "Not enough letters") {
        setTimeout(() => {
            if (container.textContent === msg) {
                container.textContent = "";
            }
        }, 2000);
    }
}

/**
 * shakeRow()
 * 错误时晃动当前行
 */
function shakeRow() {
    const startIdx = currentGuessTime * answerLength;
    for (let i = 0; i < answerLength; i++) {
        const tile = document.getElementById(`tile-${startIdx + i}`);
        tile.style.transform = "translateX(5px)";
        setTimeout(() => tile.style.transform = "translateX(-5px)", 50);
        setTimeout(() => tile.style.transform = "translateX(5px)", 100);
        setTimeout(() => tile.style.transform = "translateX(0)", 150);
    }
}
