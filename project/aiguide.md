# Wordle 游戏开发详解教程

欢迎来到Wordle游戏的开发之旅！本教程将从零开始，手把手教你构建一个完整的Wordle游戏。无论你是前端新手还是有一定基础的学习者，都能从中获得帮助。

## 一、项目结构概览

让我们先了解一下项目的组成文件：

- `index.html`: 网页的基本骨架，包含页面结构和资源引用
- `index.css`: 定义页面的外观和视觉效果
- `index.js`: 包含游戏逻辑和交互功能
- `words.json`: 包含所有可能答案的单词数据库

这是一个典型的前端项目结构，使用HTML搭建页面、CSS美化样式、JavaScript实现交互逻辑。

## 二、HTML基础结构解析

### 2.1 HTML文档基础框架

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Wordle</title>
    <link rel="stylesheet" href="index.css">
</head>
```

**代码解读：**
- `<!DOCTYPE html>`: 声明这是一个HTML5文档
- `<html lang="en">`: 定义页面的主要语言为英语
- `<meta charset="UTF-8">`: 设置字符编码为UTF-8，支持各种语言文字
- `<meta name="viewport"...>`: 响应式设计，适配不同屏幕尺寸
- `<link rel="stylesheet" href="index.css">`: 引入外部CSS文件

### 2.2 页面主体结构

```html
<body>
    <div class="game-container">
        <h1>Wordle</h1>
        <p>猜一个5个字母的单词！你有6次机会。</p>

        <!-- 网格用于显示猜测 -->
        <div class="grid">
            <div id="grid"></div>
        </div>

        <!-- 虚拟键盘 -->
        <div class="keyboard">
            <div class="keyboard-row">
                <button class="key" data-key="Q">Q</button>
                <button class="key" data-key="W">W</button>
                <!-- 更多按键... -->
            </div>
        </div>

        <!-- 消息显示区域 -->
        <div id="message"></div>
    </div>

    <script src="index.js"></script>
</body>
```

**核心组件解析：**
- `.game-container`: 主容器，包含整个游戏界面
- `#grid`: 动态生成的字母网格，最多显示6行，每行5个字母
- `.keyboard`: 虚拟键盘，模拟实体键盘功能
- `#message`: 用于显示游戏提示信息

**重要属性说明：**
- `data-key` 属性：存储按钮对应的键值，便于JavaScript识别用户点击了哪个键

## 三、CSS样式深度解析

### 3.1 全局样式设置

```css
body {
    font-family: Arial, sans-serif;
    background-color: #121213;  /* 深灰色背景 */
    color: white;               /* 白色文字 */
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;          /* 最小高度为视窗高度 */
    margin: 0;                  /* 重置默认边距 */
}
```

**Flexbox布局详解：**
- `display: flex`: 启用弹性盒子布局
- `justify-content: center`: 水平居中
- `align-items: center`: 垂直居中
- `min-height: 100vh`: 确保页面至少占满整个屏幕高度

### 3.2 游戏网格样式

```css
.grid {
    display: inline-block;      /* 内联块元素，适应内容大小 */
    margin: 20px auto;          /* 上下边距20px，左右自动居中 */
}

.row {
    display: flex;              /* 每一行是水平排列 */
    justify-content: center;    /* 行内元素居中 */
    margin-bottom: 8px;         /* 行间间距 */
}

.cell {
    width: 60px;               /* 方格宽度 */
    height: 60px;              /* 方格高度 */
    border: 2px solid #565758; /* 边框颜色 */
    margin: 0 4px;             /* 左右边距 */
    display: flex;             /* 使用flex让字母垂直水平居中 */
    justify-content: center;
    align-items: center;
    font-size: 2rem;           /* 字体大小 */
    font-weight: bold;         /* 加粗字体 */
    text-transform: uppercase; /* 自动转换为大写 */
}
```

**布局原理：**
- 每个`.cell`是一个正方形方格
- 使用flexbox确保字母在方格中完美居中
- `text-transform: uppercase`确保所有输入字母显示为大写

### 3.3 颜色反馈系统

```css
/* 绿色：正确字母且位置正确 */
.cell.correct {
    background-color: #538d4e;
    border-color: #538d4e;
    color: white;
}

/* 黄色：字母正确但位置错误 */
.cell.present {
    background-color: #b59f3b;
    border-color: #b59f3b;
    color: white;
}

/* 灰色：字母不在答案中 */
.cell.absent {
    background-color: #3a3a3c;
    border-color: #3a3a3c;
    color: white;
}
```

**颜色系统说明：**
- 绿色(#538d4e)：字母和位置都正确
- 黄色(#b59f3b)：字母正确但位置不对
- 灰色(#3a3a3c)：字母不在答案中

### 3.4 虚拟键盘样式

```css
.keyboard-row {
    display: flex;
    justify-content: center;
    margin-bottom: 8px;
}

.key {
    background-color: #878a8c;  /* 默认键盘颜色 */
    color: white;
    border: none;               /* 去掉默认边框 */
    border-radius: 4px;         /* 圆角效果 */
    padding: 10px;
    margin: 0 3px;             /* 按键间隔 */
    font-weight: bold;
    cursor: pointer;           /* 鼠标悬停时显示手型 */
    min-width: 40px;
    height: 50px;
    text-transform: uppercase;
}

.key:hover {
    opacity: 0.8;             /* 悬停时降低透明度 */
}

.key.big {                   /* Enter和Backspace按键更大 */
    min-width: 60px;
}
```

## 四、JavaScript游戏逻辑详解

### 4.1 全局变量定义及作用

```javascript
// 固定参数，不随游戏变化
const answerLength = 5;      // 答案长度固定为5个字母
const maxGuessTime = 6;      // 最多允许6次猜测

// 颜色定义，使用简码
const grey = "g";            // 字母不存在于答案中
const yellow = "y";          // 字母存在但位置错误
const green = "b";           // 字母和位置都正确（注意：绿色用"b"表示）

// 游戏状态变量
let colorSequence = [];      // 存储每次猜测的颜色反馈序列
let wordSequence = [];       // 存储所有已输入的单词
let answer = "";             // 当前游戏的答案
let guess = "";              // 当前正在输入的猜测
let currentGuessTime = 0;    // 已使用的猜测次数
let index = 1;               // 当前光标位置（1-30，对应30个格子）
let state = "UNFINISHED";    // 游戏状态
```

**变量分类说明：**

**常量（const）：**
- 不会在游戏中改变的值
- `answerLength`：始终为5，Wordle游戏规则
- `maxGuessTime`：始终为6，Wordle游戏规则

**变量（let）：**
- 随游戏进行而改变的值
- `state`：追踪游戏进度（UNFINISHED/SOLVED/FAILED）

### 4.2 游戏初始化函数（initialize）

```javascript
function initialize() {
    // 重置所有游戏状态
    state = "UNFINISHED";
    currentGuessTime = 0;
    index = 1;
    guess = "";
    colorSequence = [];
    wordSequence = [];

    // 生成新的随机答案
    generateRandomAnswer().then(result => {
        answer = result.toLowerCase(); // 将答案转为小写统一处理
        console.log("当前答案:", answer); // 用于调试，可移除

        // 清空并重建游戏网格
        renderGrid();
    });
}
```

**初始化步骤详解：**
1. **状态重置**：将所有可变状态恢复初始值
2. **异步获取答案**：调用`generateRandomAnswer()`获取新答案
3. **网格重构**：调用`renderGrid()`清除旧游戏状态

**异步处理说明：**
- `generateRandomAnswer()`返回Promise对象
- 使用`.then()`等待异步操作完成后再继续

### 4.3 随机答案生成函数（generateRandomAnswer）

```javascript
async function generateRandomAnswer() {
    try {
        // 异步获取单词列表
        const response = await fetch('words.json');
        const data = await response.json();

        // 随机选择一个单词
        const randomIndex = Math.floor(Math.random() * data.words.length);
        return data.words[randomIndex];
    } catch (error) {
        console.error('获取随机答案失败:', error);
        // 错误处理：返回默认值
        return "apple";
    }
}
```

**异步操作解析：**
- `fetch()`：现代浏览器提供的网络请求API
- `await`：等待异步操作完成
- `try-catch`：错误处理机制

**随机数生成原理：**
- `Math.random()`：生成0-1之间的随机小数
- `Math.floor()`：向下取整
- 结果确保在有效索引范围内

### 4.4 游戏网格渲染函数（renderGrid）

```javascript
function renderGrid() {
    // 获取网格容器元素
    const gridElement = document.getElementById('grid');
    gridElement.innerHTML = ''; // 清空现有内容

    // 创建6行5列的网格（6次机会 × 5个字母）
    for (let row = 0; row < maxGuessTime; row++) {
        // 创建一行
        const rowDiv = document.createElement('div');
        rowDiv.className = 'row'; // 设置CSS类名

        // 创建一行中的5个格子
        for (let col = 0; col < answerLength; col++) {
            // 计算唯一ID（总共有30个格子）
            const cellIndex = row * answerLength + col + 1;

            // 创建格子元素
            const cell = document.createElement('div');
            cell.id = `cell-${cellIndex}`;      // 设置唯一ID
            cell.className = 'cell';            // 设置CSS类名

            // 将格子添加到行中
            rowDiv.appendChild(cell);
        }

        // 将行添加到网格中
        gridElement.appendChild(rowDiv);
    }
}
```

**DOM操作详解：**
- `document.getElementById()`：获取指定ID的元素
- `createElement()`：创建新的DOM元素
- `appendChild()`：将子元素添加到父元素中

**ID计算公式：**
- 格子ID = 行号 × 每行格子数 + 列号 + 1
- 第1行：cell-1到cell-5
- 第2行：cell-6到cell-10
- ...
- 第6行：cell-26到cell-30

### 4.5 字母渲染函数（render）

```javascript
function render(letter) {
    // 检查是否超出网格范围
    if (index > maxGuessTime * answerLength) return;

    // 获取对应位置的格子
    const cell = document.getElementById(`cell-${index}`);

    if (cell) {
        // 设置格子内容
        cell.textContent = letter;
        // 添加填充状态样式
        cell.classList.add('filled');
        // 移动光标到下一个位置
        index++;
    }
}
```

**边界检查：**
- 最大允许位置：6行 × 5列 = 30
- 防止越界操作

**DOM更新：**
- `textContent`：安全地设置文本内容
- `classList.add()`：添加CSS类，触发动态样式

### 4.6 单词有效性检查函数（isValidWord）

```javascript
function isValidWord(word) {
    // 条件1：长度必须为5
    if (word.length !== answerLength) {
        return false;
    }

    // 条件2：只能包含字母
    const lettersOnly = /^[a-zA-Z]+$/;
    if (!lettersOnly.test(word)) {
        return false;
    }

    // 条件3：必须是真实存在的单词（可选，此处简化处理）
    // 在实际应用中，应该检查words.json中是否存在该单词
    return true;
}
```

**正则表达式解析：**
- `/^[a-zA-Z]+$/`：
  - `^`：字符串开始
  - `[a-zA-Z]`：字母集合
  - `+`：一个或多个
  - `$`：字符串结束

**验证优先级：**
- 先检查长度（最简单的检查）
- 再检查字符类型
- 最后检查是否为有效单词

### 4.7 颜色匹配算法（calculateColorSequence）- 核心逻辑

```javascript
function calculateColorSequence(guess, answer) {
    // 初始化结果数组，默认全部为灰色
    const result = Array(answerLength).fill(grey);

    // 创建答案字母副本，用于后续标记使用
    const answerLetters = answer.split('');
    // 获取猜测单词的字母数组
    const guessLetters = guess.split('');

    // 第一遍：查找完全匹配的字母（绿色）
    for (let i = 0; i < answerLength; i++) {
        if (guessLetters[i] === answerLetters[i]) {
            result[i] = green;                    // 标记为绿色
            answerLetters[i] = null;              // 标记为已使用，防止重复计算
        }
    }

    // 第二遍：查找存在但位置错误的字母（黄色）
    for (let i = 0; i < answerLength; i++) {
        // 跳过已标记为绿色的位置
        if (result[i] === green) continue;

        // 查找当前猜测字母是否存在于剩余的答案字母中
        const letter = guessLetters[i];
        const letterIndex = answerLetters.indexOf(letter);

        if (letterIndex !== -1) {
            result[i] = yellow;                   // 标记为黄色
            answerLetters[letterIndex] = null;    // 标记为已使用
        }
    }

    // 将颜色数组合并为字符串返回
    return result.join('');
}
```

**算法原理解析：**

**第一遍处理（绿色）：**
- 逐位比较猜测和答案
- 位置和字母都正确 → 绿色
- 标记答案中该位置字母为已使用（设为null）

**第二遍处理（黄色）：**
- 对未被标记为绿色的字母进行处理
- 检查是否存在于剩余的答案字母中
- 存在 → 黄色；不存在 → 保持灰色

**示例分析：**
- 答案: "APPLE"
- 猜测: "ANGLE"
- 处理过程：
  1. 第一遍: A(A)-绿, N(G)-灰, G(L)-灰, L(L)-绿, E(E)-绿
  2. 第二遍: 检查N是否在[P]中(否)，G是否在[P]中(否)
  3. 结果: "bgggg" (第一个字母A是绿b，第二个N是灰g，...)

### 4.8 猜测处理函数（handleAnswer）

```javascript
function handleAnswer(guessInput) {
    // 输入预处理：转小写并去除多余空格
    guessInput = guessInput.toLowerCase().trim();

    // 验证输入的有效性
    if (!isValidWord(guessInput)) {
        showMessage("请输入一个有效的5字母单词！");
        return; // 无效输入直接返回
    }

    // 检查是否猜中答案
    if (guessInput === answer) {
        state = "SOLVED"; // 更新游戏状态
        showMessage("恭喜你，猜对了！🎉");
    } else {
        // 计算颜色反馈
        const colors = calculateColorSequence(guessInput, answer);

        // 将颜色结果显示在网格上
        applyColorsToGrid(currentGuessTime, colors);

        // 增加尝试次数
        currentGuessTime++;

        // 检查是否已用完所有尝试机会
        if (currentGuessTime >= maxGuessTime) {
            state = "FAILED"; // 更新游戏状态
            showMessage(`游戏结束！正确答案是：${answer}`);
        }
    }

    // 记录本次猜测（可选：用于统计或回放）
    wordSequence.push(guessInput);
    colorSequence.push(colors);
}
```

**流程控制逻辑：**
- 输入验证 → 有效 → 计算结果 → 更新状态
- 输入验证 → 无效 → 显示错误信息 → 退出函数

**状态管理：**
- SOLVED：玩家获胜
- FAILED：用尽尝试机会
- UNFINISHED：游戏继续

### 4.9 颜色应用函数（applyColorsToGrid）

```javascript
function applyColorsToGrid(guessNumber, colorString) {
    // 遍历当前行的每个格子
    for (let i = 0; i < answerLength; i++) {
        // 计算当前格子的绝对位置
        const cellIndex = guessNumber * answerLength + i + 1;

        // 获取对应的DOM元素
        const cell = document.getElementById(`cell-${cellIndex}`);

        // 获取对应位置的颜色代码
        const colorChar = colorString[i];

        // 根据颜色代码添加相应的CSS类
        if (colorChar === green) {
            cell.classList.add('correct');   // 绿色样式
        } else if (colorChar === yellow) {
            cell.classList.add('present');   // 黄色样式
        } else if (colorChar === grey) {
            cell.classList.add('absent');    // 灰色样式
        }
    }
}
```

**坐标映射关系：**
- `guessNumber`：当前是第几次猜测（0-5）
- `i`：当前行的第几个字母（0-4）
- `cellIndex`：转换为全局格子编号（1-30）

### 4.10 消息显示函数（showMessage）

```javascript
function showMessage(message) {
    // 获取消息显示元素
    const messageElement = document.getElementById('message');

    // 更新显示内容
    messageElement.textContent = message;
}
```

### 4.11 游戏启动函数（start）

```javascript
function start() {
    // 初始化游戏状态
    initialize();

    // 设置键盘事件监听器
    setupKeyboardEvents();
}

function setupKeyboardEvents() {
    // 监听物理键盘事件
    document.addEventListener('keydown', handleKeyDown);

    // 监听虚拟键盘点击事件
    const keys = document.querySelectorAll('.key');
    keys.forEach(key => {
        key.addEventListener('click', () => {
            const keyValue = key.getAttribute('data-key');
            handleKeyPress(keyValue);
        });
    });
}

function handleKeyDown(event) {
    // 获取按下的键值并转为大写
    const key = event.key.toUpperCase();
    handleKeyPress(key);
}

function handleKeyPress(key) {
    // 检查游戏是否仍在进行中
    if (state !== "UNFINISHED") return;

    // 处理字母键
    if (/^[A-Z]$/.test(key)) {
        // 检查是否在当前行内
        const currentRow = Math.floor((index - 1) / answerLength);
        const currentRowIndex = currentRow * answerLength;

        if (index <= currentRowIndex + answerLength) {
            render(key); // 渲染字母
        }
    }
    // 处理退格键
    else if (key === 'BACKSPACE') {
        // 防止删除前一行的内容
        if (index > currentGuessTime * answerLength + 1 && index > 1) {
            index--; // 回退光标
            const cell = document.getElementById(`cell-${index}`);
            if (cell) {
                cell.textContent = ''; // 清空格子内容
                cell.classList.remove('filled'); // 移除填充样式
            }
        }
    }
    // 处理回车键
    else if (key === 'ENTER') {
        submitGuess(); // 提交当前猜测
    }
}

function submitGuess() {
    if (state !== "UNFINISHED") return;

    // 构建当前行的完整单词
    const currentRow = currentGuessTime; // 当前行号
    let word = '';

    for (let i = 0; i < answerLength; i++) {
        const cellIndex = currentRow * answerLength + i + 1;
        const cell = document.getElementById(`cell-${cellIndex}`);
        if (cell) {
            word += cell.textContent; // 拼接字母
        }
    }

    // 检查单词是否完整（5个字母）
    if (word.length === answerLength) {
        handleAnswer(word); // 处理完整单词
    } else {
        showMessage("请输入完整的5字母单词！");
    }
}
```

## 五、完整代码整合

### 5.1 index.html 完整代码
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Wordle</title>
    <link rel="stylesheet" href="index.css">
</head>
<body>
    <div class="game-container">
        <h1>Wordle</h1>
        <p>猜一个5个字母的单词！你有6次机会。</p>

        <!-- 网格用于显示猜测 -->
        <div class="grid">
            <div id="grid"></div>
        </div>

        <!-- 键盘 -->
        <div class="keyboard">
            <div class="keyboard-row">
                <button class="key" data-key="Q">Q</button>
                <button class="key" data-key="W">W</button>
                <button class="key" data-key="E">E</button>
                <button class="key" data-key="R">R</button>
                <button class="key" data-key="T">T</button>
                <button class="key" data-key="Y">Y</button>
                <button class="key" data-key="U">U</button>
                <button class="key" data-key="I">I</button>
                <button class="key" data-key="O">O</button>
                <button class="key" data-key="P">P</button>
            </div>
            <div class="keyboard-row">
                <button class="key" data-key="A">A</button>
                <button class="key" data-key="S">S</button>
                <button class="key" data-key="D">D</button>
                <button class="key" data-key="F">F</button>
                <button class="key" data-key="G">G</button>
                <button class="key" data-key="H">H</button>
                <button class="key" data-key="J">J</button>
                <button class="key" data-key="K">K</button>
                <button class="key" data-key="L">L</button>
            </div>
            <div class="keyboard-row">
                <button class="key big" data-key="Enter">ENTER</button>
                <button class="key" data-key="Z">Z</button>
                <button class="key" data-key="X">X</button>
                <button class="key" data-key="C">C</button>
                <button class="key" data-key="V">V</button>
                <button class="key" data-key="B">B</button>
                <button class="key" data-key="N">N</button>
                <button class="key" data-key="M">M</button>
                <button class="key big" data-key="Backspace">⌫</button>
            </div>
        </div>

        <!-- 提示信息区域 -->
        <div id="message"></div>
    </div>

    <script src="index.js"></script>
</body>
</html>
```

### 5.2 index.css 完整代码
```css
body {
    font-family: Arial, sans-serif;
    background-color: #121213;
    color: white;
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    margin: 0;
}

.game-container {
    text-align: center;
    padding: 20px;
}

h1 {
    color: #dcdcdd;
    font-size: 3rem;
    margin-bottom: 0.5rem;
}

.grid {
    display: inline-block;
    margin: 20px auto;
}

.row {
    display: flex;
    justify-content: center;
    margin-bottom: 8px;
}

.cell {
    width: 60px;
    height: 60px;
    border: 2px solid #565758;
    margin: 0 4px;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 2rem;
    font-weight: bold;
    text-transform: uppercase;
}

.cell.filled {
    border-color: #dcdcdd;
}

/* 三种颜色的指示状态 */
.cell.correct { /* 绿色 - 正确的字母且位置正确 */
    background-color: #538d4e;
    border-color: #538d4e;
    color: white;
}

.cell.present { /* 黄色 - 字母正确但位置错误 */
    background-color: #b59f3b;
    border-color: #b59f3b;
    color: white;
}

.cell.absent { /* 灰色 - 字母不在答案中 */
    background-color: #3a3a3c;
    border-color: #3a3a3c;
    color: white;
}

.keyboard {
    margin-top: 20px;
}

.keyboard-row {
    display: flex;
    justify-content: center;
    margin-bottom: 8px;
}

.key {
    background-color: #878a8c;
    color: white;
    border: none;
    border-radius: 4px;
    padding: 10px;
    margin: 0 3px;
    font-weight: bold;
    cursor: pointer;
    min-width: 40px;
    height: 50px;
    text-transform: uppercase;
}

.key:hover {
    opacity: 0.8;
}

.key.big {
    min-width: 60px;
}

.key.correct {
    background-color: #538d4e;
}

.key.present {
    background-color: #b59f3b;
}

.key.absent {
    background-color: #3a3a3c;
}

#message {
    margin-top: 20px;
    font-size: 1.2rem;
    min-height: 2rem;
}
```

### 5.3 index.js 完整代码
```javascript
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

// 颜色序列，类型为 string[]
let colorSequence = [];
// 单词序列，类型为 string[]
let wordSequence = [];

// 本次 Wordle 的答案
let answer = "";
// 当前猜测的答案
let guess = "";
// 当前已经使用的猜测次数
let currentGuessTime = 0;
// 当前游标位置（1~30）
let index = 1;

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
 * 整个程序的入口函数，这里为了简化程序的运行逻辑违背了单一指责原则和最小权限原则，在实际开发时不推荐这样处理
 *
 * 您需要完成的任务：
 * 1. 初始化程序的运行状态
 * 2. 接收交互信息后改变内部状态并作出反馈
 *
 * 请思考：
 * 1. 在怎样的时刻需要调用 initialize 函数
 * 2. 程序的交互信息是什么（猜测的单词？）
 * 3. 内部状态会如何根据交互信息而改变（state 变量的作用？）
 * 4. 程序内部状态变化之后会作出怎样的反馈（页面重新渲染？）
 * 5. 如何读取交互信息
 * 6. 程序在什么时候会终止
 */
function start() {
  // 初始化游戏
  initialize();

  // 设置键盘事件监听器
  setupKeyboardEvents();
}

/**
 * render()
 *
 * 根据程序当前的状态渲染对应的用户页面
 *
 * 您需要完成的任务：
 * 1. 基于 DOM 实现程序状态和 HTML 组件的绑定
 * 2. 当程序内部状态发生改变时需要重新渲染页面
 *
 * 请思考：
 * 1. 什么是 DOM，这项技术有怎样的作用
 * 2. 如何实现程序内部状态和 HTML 组件的绑定，为什么要这么设计
 * 3. 应该在怎样的时刻调用 render 函数
 */
function render(letter) {
  if (index > maxGuessTime * answerLength) return; // 超出范围则返回

  const cell = document.getElementById(`cell-${index}`);
  if (cell) {
    cell.textContent = letter;
    cell.classList.add('filled');
    index++;
  }
}

/**
 * initialize()
 *
 * 初始化程序的状态
 *
 * 请思考：
 * 1. 有哪些状态或变量需要被初始化
 * 2. 初始化时 state 变量处于怎样的状态
 */
function initialize() {
  // 重置游戏状态
  state = "UNFINISHED";
  currentGuessTime = 0;
  index = 1;
  guess = "";
  colorSequence = [];
  wordSequence = [];

  // 生成新的答案
  generateRandomAnswer().then(result => {
    answer = result.toLowerCase();
    console.log("答案:", answer); // 调试用，发布时可以移除

    // 重新渲染网格
    renderGrid();
  });
}

/**
 * renderGrid()
 *
 * 动态生成游戏网格
 */
function renderGrid() {
  const gridElement = document.getElementById('grid');
  gridElement.innerHTML = ''; // 清空现有内容

  // 创建30个方格（6行×5列）
  for (let row = 0; row < maxGuessTime; row++) {
    const rowDiv = document.createElement('div');
    rowDiv.className = 'row';

    for (let col = 0; col < answerLength; col++) {
      const cellIndex = row * answerLength + col + 1;
      const cell = document.createElement('div');
      cell.id = `cell-${cellIndex}`;
      cell.className = 'cell';
      rowDiv.appendChild(cell);
    }

    gridElement.appendChild(rowDiv);
  }
}

/**
 * generateRandomAnswer()
 *
 * 从题库中随机选取一个单词作为答案
 *
 * 题库文件为 words.json
 *
 * 请思考：
 * 1. 如何读取 json 文件
 * 2. 如何随机抽取一个单词
 *
 * @return {string} answer
 */
async function generateRandomAnswer() {
  try {
    const response = await fetch('words.json');
    const data = await response.json();
    const randomIndex = Math.floor(Math.random() * data.words.length);
    return data.words[randomIndex];
  } catch (error) {
    console.error('获取随机答案失败:', error);
    // 返回一个默认值，以防请求失败
    return "apple";
  }
}

/**
 * isValidWord()
 *
 * 判断一个单词是否合法
 *
 * 请思考：
 * 1. 判断一个单词是否合法的规则有哪些
 * 2. 是否存在多条判断规则
 * 3. 如果上条成立，那么这些规则执行的先后顺序是怎样的，不同的执行顺序是否会对单词的合法性判断造成影响
 * 4. 如果单词不合法，那么程序的状态会如何变化，程序应当作出怎样的反馈
 *
 * @param {string} word
 * @return {boolean} isValid
 */
function isValidWord(word) {
  // 检查单词长度是否为5
  if (word.length !== answerLength) {
    return false;
  }

  // 检查是否只包含字母
  const lettersOnly = /^[a-zA-Z]+$/;
  if (!lettersOnly.test(word)) {
    return false;
  }

  // 检查是否为有效的英文单词
  // 注意：实际应用中应该有一个词汇表来验证单词有效性
  // 这里为了简单起见，假设所有5字母单词都是有效的
  return true;
}

/**
 * handleAnswer()
 *
 * 处理一次对单词的猜测，并根据其猜测结果更新程序内部状态
 *
 * 请思考：
 * 1. 是否需要对 guess 变量的字符串作某种预处理，为什么
 *
 * @param {string} guess
 */
function handleAnswer(guessInput) {
  // 规范化输入
  guessInput = guessInput.toLowerCase().trim();

  // 验证单词是否有效
  if (!isValidWord(guessInput)) {
    showMessage("请输入一个有效的5字母单词！");
    return;
  }

  // 检查是否是正确的答案
  if (guessInput === answer) {
    state = "SOLVED";
    showMessage("恭喜你，猜对了！🎉");
  } else {
    // 计算颜色序列
    const colors = calculateColorSequence(guessInput, answer);

    // 应用颜色到网格
    applyColorsToGrid(currentGuessTime, colors);

    currentGuessTime++;

    // 检查是否已用完所有尝试次数
    if (currentGuessTime >= maxGuessTime) {
      state = "FAILED";
      showMessage(`游戏结束！正确答案是：${answer}`);
    }
  }

  // 添加到猜测序列
  wordSequence.push(guessInput);
  colorSequence.push(colors);
}

/**
 * calculateColorSequence()
 *
 * 计算两个单词的颜色匹配序列
 *
 * 例如：
 * 给定 answer = "apple", guess = "angel"
 *
 * 那么返回结果为："bggyy"
 *
 * 请思考：
 * 1. Wordle 的颜色匹配算法是如何实现的
 * 2. 有哪些特殊的匹配情况
 *
 * @param {string} guess
 * @param {string} answer
 * @return {string} colorSequence
 */
function calculateColorSequence(guess, answer) {
  const result = Array(answerLength).fill(grey); // 默认都是灰色
  const answerLetters = answer.split('');
  const guessLetters = guess.split('');

  // 第一遍：标记绿色（完全正确的字母）
  for (let i = 0; i < answerLength; i++) {
    if (guessLetters[i] === answerLetters[i]) {
      result[i] = green;
      answerLetters[i] = null; // 标记为已使用
    }
  }

  // 第二遍：标记黄色（字母正确但位置错误）
  for (let i = 0; i < answerLength; i++) {
    if (result[i] === green) continue; // 跳过绿色的字母

    const letter = guessLetters[i];
    const letterIndex = answerLetters.indexOf(letter);

    if (letterIndex !== -1) {
      result[i] = yellow;
      answerLetters[letterIndex] = null; // 标记为已使用
    }
  }

  return result.join('');
}

/**
 * applyColorsToGrid()
 *
 * 将颜色序列应用到网格上
 */
function applyColorsToGrid(guessNumber, colorString) {
  for (let i = 0; i < answerLength; i++) {
    const cellIndex = guessNumber * answerLength + i + 1;
    const cell = document.getElementById(`cell-${cellIndex}`);
    const colorChar = colorString[i];

    if (colorChar === green) {
      cell.classList.add('correct');
    } else if (colorChar === yellow) {
      cell.classList.add('present');
    } else if (colorChar === grey) {
      cell.classList.add('absent');
    }
  }
}

/**
 * showMessage()
 *
 * 显示游戏消息
 */
function showMessage(message) {
  const messageElement = document.getElementById('message');
  messageElement.textContent = message;
}

/**
 * setupKeyboardEvents()
 *
 * 设置键盘事件监听器
 */
function setupKeyboardEvents() {
  // 监听物理键盘事件
  document.addEventListener('keydown', handleKeyDown);

  // 监听虚拟键盘点击事件
  const keys = document.querySelectorAll('.key');
  keys.forEach(key => {
    key.addEventListener('click', () => {
      const keyValue = key.getAttribute('data-key');
      handleKeyPress(keyValue);
    });
  });
}

/**
 * handleKeyDown()
 *
 * 处理物理键盘按下事件
 */
function handleKeyDown(event) {
  const key = event.key.toUpperCase();
  handleKeyPress(key);
}

/**
 * handleKeyPress()
 *
 * 处理按键事件
 */
function handleKeyPress(key) {
  if (state !== "UNFINISHED") return; // 游戏结束后不再响应

  if (/^[A-Z]$/.test(key)) {
    // 如果当前位置在当前行内（未超出当前行）
    const currentRow = Math.floor((index - 1) / answerLength);
    const currentRowIndex = currentRow * answerLength;

    if (index <= currentRowIndex + answerLength) {
      render(key);
    }
  } else if (key === 'BACKSPACE') {
    // 删除最后一个字符
    if (index > currentGuessTime * answerLength + 1 && index > 1) {
      index--;
      const cell = document.getElementById(`cell-${index}`);
      if (cell) {
        cell.textContent = '';
        cell.classList.remove('filled');
      }
    }
  } else if (key === 'ENTER') {
    // 提交猜测
    submitGuess();
  }
}

/**
 * submitGuess()
 *
 * 提交当前猜测
 */
function submitGuess() {
  if (state !== "UNFINISHED") return;

  // 获取当前行的单词
  const currentRow = currentGuessTime;
  let word = '';

  for (let i = 0; i < answerLength; i++) {
    const cellIndex = currentRow * answerLength + i + 1;
    const cell = document.getElementById(`cell-${cellIndex}`);
    if (cell) {
      word += cell.textContent;
    }
  }

  // 检查当前行是否已满
  if (word.length === answerLength) {
    handleAnswer(word);
  } else {
    showMessage("请输入完整的5字母单词！");
  }
}
```

## 六、开发要点总结

### 6.1 核心概念
- **DOM操作**：动态创建和修改页面元素
- **事件驱动**：响应用户交互（键盘、点击）
- **状态管理**：跟踪游戏进程和用户操作
- **异步处理**：加载单词列表等耗时操作

### 6.2 关键算法
- **颜色匹配算法**：区分绿色、黄色、灰色状态
- **坐标系统**：二维网格到一维索引的映射
- **输入验证**：确保用户输入符合规则

### 6.3 代码组织
- **单一职责原则**：每个函数承担明确的功能
- **模块化设计**：功能分解为独立的小函数
- **错误处理**：预防异常情况，增强健壮性

通过本教程，你应该能够：
1. 理解HTML/CSS/JS的基本协作模式
2. 掌握DOM操作和事件处理技巧
3. 学会实现复杂的业务逻辑（如颜色匹配算法）
4. 理解前端开发的工作流程和调试方法

希望这份详细教程能帮助你更好地理解和完成Wordle游戏的开发！