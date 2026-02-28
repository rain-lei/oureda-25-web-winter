# Wordle 游戏开发进度分析与详细指导 (aiguide1.md)

## 当前项目进度分析

### 已完成的部分
1. **HTML结构** (`index.html`): 已完成基础结构搭建
   - 游戏容器结构完整
   - 网格布局已设定
   - 虚拟键盘布局完成
   - 包含了答案显示和刷新按钮

2. **CSS样式** (`index.css`): 已完成基础样式设计
   - 页面布局（Flexbox居中）
   - 网格和单元格样式
   - 三种颜色状态样式（绿色、黄色、灰色）

3. **JavaScript变量定义** (`index.js`): 全局变量已定义
   - 游戏参数常量（长度、最大猜测次数）
   - 颜色编码定义
   - 状态变量（答案、猜测、计数器等）

### 待完成的部分
1. 所有函数的TODO实现部分
2. 游戏逻辑完整连接
3. 交互功能实现

## 当前代码结构详细解析

### HTML文件分析

```html
<div class="game-container">
    <h1>Wordle</h1>
    <div class="grid">
        <div id="grid"></div>
    </div>
    <div class="answer">
        <button id="show-answer">答案显示</button>
    </div>
    <div class="refresh">
        <button id="refresh">刷新</button>
    </div>
    <div class="keyboard">
        <!-- 虚拟键盘布局 -->
    </div>
</div>
```

**关键元素说明：**
- `#grid`：动态生成的字母网格容器
- `#show-answer`：显示答案的按钮（调试用）
- `#refresh`：重新开始游戏的按钮
- `.keyboard`：虚拟键盘，用于移动设备操作

### CSS样式分析

当前样式已实现：
- 居中布局（Flexbox）
- 网格布局（每行5个方格）
- 三种状态颜色（正确位置#6aaa64，位置错误#c9b458，不存在#787c7e）

**注意颜色编码差异**：
在CSS中使用的是常见的Wordle颜色：
- 绿色：#6aaa64 (正确字母且位置正确)
- 黄色：#c9b458 (字母正确但位置错误)
- 灰色：#787c7e (字母不存在)

但在JS中，绿色用'b'表示，黄色用'y'，灰色用'g'，需要在实现时对应。

### JavaScript变量结构分析

```javascript
// 常量定义
const answerLength = 5;    // 答案长度固定为5
const maxGuessTime = 6;    // 最多6次猜测机会

// 颜色编码（注意这里的颜色代码）
const grey = "g";    // 灰色 = g
const yellow = "y";  // 黄色 = y
const green = "b";   // 绿色 = b（不是通常的'g'，而是'b'）

// 状态追踪
let colorSequence = [];     // 记录每次猜测的颜色反馈
let wordSequence = [];      // 记录所有猜测的单词
let answer = "";            // 当前答案
let guess = "";             // 当前正在输入的猜测
let currentGuessTime = 0;   // 已使用的猜测次数
let index = 1;              // 当前光标位置（1-30，共30个格子）
let state = "UNFINISHED";   // 游戏状态
```

## 需要实现的关键函数详解

### 1. initialize() 函数实现

```javascript
function initialize() {
  // 重置所有状态变量到初始状态
  state = "UNFINISHED";
  currentGuessTime = 0;
  index = 1;
  guess = "";
  colorSequence = [];
  wordSequence = [];

  // 清空网格显示
  const gridElement = document.getElementById('grid');
  gridElement.innerHTML = '';

  // 生成新的答案并创建网格
  generateRandomAnswer().then(newAnswer => {
    answer = newAnswer.toLowerCase();
    console.log("新答案:", answer); // 仅用于调试

    // 创建网格（6行5列，共30个格子）
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
  });
}
```

### 2. generateRandomAnswer() 函数实现

```javascript
async function generateRandomAnswer() {
  try {
    // 从words.json获取单词列表
    const response = await fetch('words.json');
    const data = await response.json();

    // 随机选择一个单词
    const randomIndex = Math.floor(Math.random() * data.words.length);
    return data.words[randomIndex];
  } catch (error) {
    console.error('获取随机答案失败:', error);
    // 错误处理：返回默认单词
    return "apple"; // 或其他5字母单词
  }
}
```

### 3. render() 函数实现

```javascript
function render(letter) {
  // 检查是否超出网格范围（总共30个格子）
  if (index > maxGuessTime * answerLength) {
    return;
  }

  // 获取当前位置的格子元素
  const cell = document.getElementById(`cell-${index}`);

  if (cell) {
    // 设置字母内容
    cell.textContent = letter;
    // 添加填充样式
    cell.classList.add('filled');

    // 移动光标到下一个位置
    index++;
  }
}
```

### 4. isValidWord() 函数实现

```javascript
function isValidWord(word) {
  // 检查长度是否为5
  if (word.length !== answerLength) {
    return false;
  }

  // 检查是否只包含字母
  const letterRegex = /^[a-zA-Z]+$/;
  if (!letterRegex.test(word)) {
    return false;
  }

  // 在实际应用中，还应检查单词是否在词汇表中
  // 由于当前words.json中包含大量单词，我们可以简单验证长度
  // 这里返回true，实际中应查询words.json确认单词存在
  return true;
}
```

### 5. calculateColorSequence() 函数实现（核心算法）

```javascript
function calculateColorSequence(guess, answer) {
  // 创建颜色结果数组，初始都为灰色
  const result = Array(answerLength).fill(grey);

  // 创建答案副本，用于标记已使用的字母
  const answerLetters = answer.split('');
  const guessLetters = guess.split('');

  // 第一遍：找完全匹配的（绿色）
  for (let i = 0; i < answerLength; i++) {
    if (guessLetters[i] === answerLetters[i]) {
      result[i] = green; // 'b' 表示绿色
      answerLetters[i] = null; // 标记为已使用，避免重复计算
    }
  }

  // 第二遍：找存在但位置不对的（黄色）
  for (let i = 0; i < answerLength; i++) {
    // 跳过已标记为绿色的位置
    if (result[i] === green) continue;

    // 在剩余答案字母中查找当前猜测字母
    const letter = guessLetters[i];
    const letterIndex = answerLetters.indexOf(letter);

    if (letterIndex !== -1) {
      result[i] = yellow; // 'y' 表示黄色
      answerLetters[letterIndex] = null; // 标记为已使用
    }
    // 如果没找到，则保持灰色 'g'
  }

  return result.join('');
}
```

**算法详解：**
这个算法是Wordle的核心，需要特别注意：
1. 先处理完全匹配（绿色）
2. 再处理存在但位置不对（黄色）
3. 使用副本数组避免重复计算

例如：答案"APPLE"，猜测"PEEEP"
- P在位置1匹配→绿色
- 第一个E在位置4存在→黄色
- 其他字母按规则处理

### 6. handleAnswer() 函数实现

```javascript
function handleAnswer(guessInput) {
  // 标准化输入
  guessInput = guessInput.toLowerCase().trim();

  // 验证输入
  if (!isValidWord(guessInput)) {
    alert('请输入一个有效的5字母单词！');
    return;
  }

  // 检查是否猜对
  if (guessInput === answer) {
    state = "SOLVED";
    // 应用最终颜色
    applyColorsToCurrentRow(calculateColorSequence(guessInput, answer));
    setTimeout(() => {
      alert('恭喜！你猜对了！');
      initialize(); // 自动开始新游戏
    }, 500);
  } else {
    // 计算颜色序列
    const colors = calculateColorSequence(guessInput, answer);
    // 应用颜色到当前行
    applyColorsToCurrentRow(colors);

    // 更新猜测次数
    currentGuessTime++;

    // 检查是否用完所有机会
    if (currentGuessTime >= maxGuessTime) {
      state = "FAILED";
      setTimeout(() => {
        alert(`游戏结束！答案是：${answer}`);
        initialize();
      }, 1000);
    }
  }

  // 记录这次猜测
  wordSequence.push(guessInput);
  colorSequence.push(colors);
}

// 辅助函数：将颜色应用到当前行
function applyColorsToCurrentRow(colorString) {
  // 当前行的第一个格子索引
  const startIndex = (currentGuessTime) * answerLength + 1;

  for (let i = 0; i < answerLength; i++) {
    const cellIndex = startIndex + i;
    const cell = document.getElementById(`cell-${cellIndex}`);
    const colorCode = colorString[i];

    if (colorCode === green) {
      cell.classList.add('correct');
    } else if (colorCode === yellow) {
      cell.classList.add('present');
    } else if (colorCode === grey) {
      cell.classList.add('absent');
    }
  }
}
```

### 7. start() 函数实现（主入口）

```javascript
function start() {
  // 初始化游戏
  initialize();

  // 设置事件监听器
  setupEventListeners();
}

// 设置事件监听器
function setupEventListeners() {
  // 键盘事件
  document.addEventListener('keydown', handleKeyboardInput);

  // 显示答案按钮（仅用于测试）
  document.getElementById('show-answer').addEventListener('click', () => {
    alert(`答案是：${answer}`);
  });

  // 刷新按钮
  document.getElementById('refresh').addEventListener('click', () => {
    initialize();
  });

  // 虚拟键盘事件
  const keys = document.querySelectorAll('.key');
  keys.forEach(key => {
    key.addEventListener('click', () => {
      const keyText = key.textContent;
      handleKeyClick(keyText);
    });
  });
}

// 处理键盘输入
function handleKeyboardInput(event) {
  const key = event.key;

  if (state !== "UNFINISHED") return;

  // 字母键
  if (key.length === 1 && /[a-zA-Z]/.test(key)) {
    addLetter(key.toUpperCase());
  }
  // 退格键
  else if (key === 'Backspace') {
    removeLetter();
  }
  // 回车键
  else if (key === 'Enter') {
    submitGuess();
  }
}

// 处理虚拟键盘点击
function handleKeyClick(keyText) {
  if (state !== "UNFINISHED") return;

  if (/[a-zA-Z]/.test(keyText)) {
    addLetter(keyText);
  } else if (keyText === 'Backspace') {
    removeLetter();
  } else if (keyText === 'Enter') {
    submitGuess();
  }
}

// 添加字母到当前输入
function addLetter(letter) {
  // 检查是否在当前行内
  const currentRowStart = currentGuessTime * answerLength + 1;
  const currentRowEnd = (currentGuessTime + 1) * answerLength;

  if (index < currentRowStart || index > currentRowEnd) {
    return; // 不在当前行内，不处理
  }

  render(letter);
}

// 移除最后一个字母
function removeLetter() {
  // 检查是否在当前行内
  const currentRowStart = currentGuessTime * answerLength + 1;

  if (index > currentRowStart && index <= (currentGuessTime + 1) * answerLength) {
    index--;
    const cell = document.getElementById(`cell-${index}`);
    if (cell) {
      cell.textContent = '';
      cell.classList.remove('filled');
    }
  }
}

// 提交当前猜测
function submitGuess() {
  // 计算当前行的起始索引
  const startIndex = currentGuessTime * answerLength + 1;

  // 获取当前行的单词
  let currentGuess = '';
  for (let i = 0; i < answerLength; i++) {
    const cell = document.getElementById(`cell-${startIndex + i}`);
    currentGuess += cell.textContent;
  }

  // 检查是否输入了完整的单词
  if (currentGuess.length === answerLength && currentGuess.trim() !== '') {
    handleAnswer(currentGuess);
  } else {
    alert('请输入完整的5字母单词！');
  }
}
```

## 当前代码存在的问题及建议

### 1. HTML问题
- 虚拟键盘按钮缺少`data-key`属性，这会影响键盘事件的识别
- 建议为每个键盘按钮添加`data-key`属性

修改后的键盘部分：
```html
<!-- 第一行 -->
<div class="keyboard-row1">
    <button class="key" data-key="Q">Q</button>
    <button class="key" data-key="W">W</button>
    <!-- ... 其他按钮也要添加data-key属性 ... -->
    <button class="key" data-key="Backspace">⌫</button>
</div>
```

### 2. CSS问题
- 缺少一些交互样式（如键盘按钮高亮）
- 网格容器可能需要调整大小

### 3. JavaScript问题
- 所有函数都需要实现
- 需要添加完整的事件处理

## 开发步骤建议

1. **首先完善HTML**：为键盘按钮添加`data-key`属性
2. **其次实现JavaScript函数**：按依赖关系依次实现
3. **然后完善CSS**：添加必要的交互样式
4. **最后测试和调试**：确保功能正常

## 核心算法图解

对于计算颜色序列的算法，以下图解说明：

答案：A P P L E
猜测：A P E P A

1. 第一遍（绿色）：
   - 位置0: A=A → 绿色 ✓
   - 位置1: P=P → 绿色 ✓
   - 位置2: P≠E → 继续
   - 位置3: L≠P → 继续
   - 位置4: E=E → 绿色 ✓

2. 第二遍（黄色/灰色）：
   - 位置2: E在剩余答案[_, _, P, L, _]中存在 → 黄色
   - 位置3: P在剩余答案[_, _, _, L, _]中存在 → 黄色
   - 位置4: A不在剩余答案中 → 灰色

结果：[b, b, y, y, b] → "bbyyb"

这个算法确保了相同字母不会被重复计算，比如猜测"EEEEE"对答案"APPLE"，只会有一个E得到黄色反馈（因为答案中只有一个E）。