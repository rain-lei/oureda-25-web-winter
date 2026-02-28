# Wordle 项目开发指导 - 第三阶段

## 当前项目状态分析

经过检查，我发现项目已经有了显著进展：

### ✅ 已完成的部分
1. **HTML结构** - 网格已预先构建（30个格子，6行×5列）
2. **CSS样式** - 样式文件已完成，包含三种颜色状态
3. **部分JS实现** - render(), initialize(), calculateColorSequence()已有基础实现

### 📋 需要完善的部分
1. **start()函数** - 程序入口函数未实现
2. **generateRandomAnswer()函数** - 异步获取答案函数未实现
3. **isValidWord()函数** - 单词验证函数未实现
4. **handleAnswer()函数** - 处理猜测结果的函数未实现
5. **事件监听器** - 键盘和按钮事件未设置
6. **部分细节** - render()函数中的ID格式需要修正

## 发现的问题与修复建议

### 1. ID格式不一致问题
**当前HTML中**：
```html
<div class="cell" id="cell1"></div>  <!-- 没有连字符 -->
```

**但JS中使用的是**：
```javascript
const cell = document.getElementById(`cell-${index}`);  // 有连字符
```

**修复方法**：在render()函数中更改ID引用方式：
```javascript
function render(letter) {
  // 检查游戏状态
  if (state !== "UNFINISHED") {
    return;
  }

  // 检查是否在当前行范围内
  const currentRowStart = currentGuessTime * answerLength + 1;
  const currentRowEnd = (currentGuessTime + 1) * answerLength;

  if (index < currentRowStart || index > currentRowEnd) {
    return; // 不在当前行，不渲染
  }

  // 使用正确的ID格式（无连字符）
  const cell = document.getElementById(`cell${index}`);
  if (cell) {
    cell.textContent = letter;
    cell.className = "cell filled";
    index++;
  }
}
```

### 2. initialize()函数中的异步问题
```javascript
// 当前写法有问题，因为generateRandomAnswer()是异步函数
answer = generateRandomAnswer();  // 这样无法获取实际答案

// 正确写法应该使用async/await或者.then()
async function initialize() {
  state = "UNFINISHED";
  currentGuessTime = 0;
  index = 1;
  guess = "";
  colorSequence = [];
  wordSequence = [];

  // 清空网格
  for (let i = 1; i <= maxGuessTime * answerLength; i++) {
    const cell = document.getElementById(`cell${i}`);
    if (cell) {
      cell.textContent = "";
      cell.className = "cell";
    }
  }

  // 清空键盘
  const keys = document.querySelectorAll(".key");
  keys.forEach(key => {
    key.className = "key";
  });

  // 异步获取新答案
  try {
    const newAnswer = await generateRandomAnswer();
    answer = newAnswer.toLowerCase();
    console.log("新答案:", answer);
  } catch (error) {
    console.error("获取答案失败:", error);
    answer = "apple"; // 默认答案
  }
}
```

## 下一步详细实施计划

### 第一步：修复JS中的ID引用问题
修改render()函数：

```javascript
function render(letter) {
  // 检查是否超出网格范围
  if (index > maxGuessTime * answerLength) {
    return;
  }

  // 检查是否在当前行范围内
  const currentRowStart = currentGuessTime * answerLength + 1;
  const currentRowEnd = (currentGuessTime + 1) * answerLength;

  if (index >= currentRowStart && index <= currentRowEnd) {
    const cell = document.getElementById(`cell${index}`);
    if (cell) {
      cell.textContent = letter;
      cell.className = "cell filled";
      index++;
    }
  }
}
```

### 第二步：完善initialize()函数
```javascript
async function initialize() {
  state = "UNFINISHED";
  currentGuessTime = 0;
  index = 1;
  guess = "";
  colorSequence = [];
  wordSequence = [];

  // 清空网格
  for (let i = 1; i <= maxGuessTime * answerLength; i++) {
    const cell = document.getElementById(`cell${i}`);
    if (cell) {
      cell.textContent = "";
      cell.className = "cell";
    }
  }

  // 清空键盘样式
  const keys = document.querySelectorAll(".key");
  keys.forEach(key => {
    key.className = "key";
  });

  // 异步获取新答案
  try {
    const newAnswer = await generateRandomAnswer();
    answer = newAnswer.toLowerCase();
    console.log("新答案:", answer);
  } catch (error) {
    console.error("获取答案失败:", error);
    answer = "apple"; // 默认答案
  }
}
```

### 第三步：实现generateRandomAnswer()函数
```javascript
async function generateRandomAnswer() {
  try {
    // 从words.json获取单词列表
    const response = await fetch('words.json');
    const data = await response.json();

    // 随机选择一个5字母单词
    const validWords = data.words.filter(word => word.length === 5);
    const randomIndex = Math.floor(Math.random() * validWords.length);

    return validWords[randomIndex];
  } catch (error) {
    console.error('获取随机答案失败:', error);
    // 备用方案：返回一个默认单词
    return "apple";
  }
}
```

### 第四步：实现isValidWord()函数
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

  // 可选：检查是否为有效单词（在words.json中存在）
  // 由于验证效率问题，这里暂时简化处理
  return true;
}
```

### 第五步：实现handleAnswer()函数
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

    // 计算颜色并应用到当前行
    const colors = calculateColorSequence(guessInput, answer);
    applyColorsToCurrentRow(colors);

    setTimeout(() => {
      alert('恭喜！你猜对了！');
      initialize(); // 开始新游戏
    }, 500);
  } else {
    // 计算颜色并应用到当前行
    const colors = calculateColorSequence(guessInput, answer);
    applyColorsToCurrentRow(colors);

    // 更新猜测次数
    currentGuessTime++;

    // 检查是否用完所有机会
    if (currentGuessTime >= maxGuessTime) {
      state = "FAILED";
      setTimeout(() => {
        alert(`游戏结束！答案是：${answer}`);
        initialize(); // 开始新游戏
      }, 1000);
    } else {
      // 更新index到下一行开始
      index = currentGuessTime * answerLength + 1;
    }
  }

  // 记录这次猜测
  wordSequence.push(guessInput);
  colorSequence.push(colors);
}

// 辅助函数：将颜色应用到当前行
function applyColorsToCurrentRow(colorString) {
  const startIndex = (currentGuessTime) * answerLength + 1;

  for (let i = 0; i < answerLength; i++) {
    const cellIndex = startIndex + i;
    const cell = document.getElementById(`cell${cellIndex}`);
    const colorCode = colorString[i];

    if (colorCode === green) {      // 'b' - 绿色
      cell.classList.add('correct');
    } else if (colorCode === yellow) {  // 'y' - 黄色
      cell.classList.add('present');
    } else if (colorCode === grey) {    // 'g' - 灰色
      cell.classList.add('absent');
    }
  }
}
```

### 第六步：实现start()函数和事件监听器
```javascript
function start() {
  // 初始化游戏
  initialize().then(() => {
    // 设置事件监听器
    setupEventListeners();
  }).catch(error => {
    console.error('初始化失败:', error);
  });
}

function setupEventListeners() {
  // 键盘事件
  document.addEventListener('keydown', handleKeyboardInput);

  // 答案显示按钮
  document.getElementById('show-answer').addEventListener('click', () => {
    if (confirm(`确定要显示答案吗？答案是：${answer}`)) {
      alert(`答案是：${answer}`);
    }
  });

  // 刷新按钮
  document.getElementById('refresh').addEventListener('click', () => {
    if (confirm('确定要开始新游戏吗？')) {
      initialize();
    }
  });

  // 虚拟键盘事件
  const keys = document.querySelectorAll('.key');
  keys.forEach(key => {
    key.addEventListener('click', () => {
      const keyValue = key.getAttribute('data-key');
      handleKeyClick(keyValue);
    });
  });
}

function handleKeyboardInput(event) {
  const key = event.key;

  if (state !== "UNFINISHED") return;

  if (key.length === 1 && /[a-zA-Z]/.test(key)) {
    // 字母键
    addLetter(key.toUpperCase());
  } else if (key === 'Backspace') {
    // 退格键
    removeLetter();
  } else if (key === 'Enter') {
    // 回车键
    submitGuess();
  }
}

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

function addLetter(letter) {
  render(letter);
}

function removeLetter() {
  // 检查是否在当前行内
  const currentRowStart = currentGuessTime * answerLength + 1;
  const currentRowEnd = (currentGuessTime + 1) * answerLength;

  if (index > currentRowStart && index <= currentRowEnd) {
    index--;
    const cell = document.getElementById(`cell${index}`);
    if (cell) {
      cell.textContent = '';
      cell.className = 'cell';
    }
  }
}

function submitGuess() {
  // 获取当前行的单词
  const startIndex = currentGuessTime * answerLength + 1;
  let currentGuess = '';

  for (let i = 0; i < answerLength; i++) {
    const cell = document.getElementById(`cell${startIndex + i}`);
    if (cell && cell.textContent) {
      currentGuess += cell.textContent;
    }
  }

  // 检查是否输入了完整的单词
  if (currentGuess.length === answerLength) {
    handleAnswer(currentGuess);
  } else {
    alert('请输入完整的5字母单词！');
  }
}
```

## 总结：按此顺序完成开发

1. **立即修复**：修改render()函数中的ID引用格式
2. **完善初始化**：更新initialize()函数为异步版本
3. **实现数据获取**：完成generateRandomAnswer()函数
4. **实现验证逻辑**：完成isValidWord()函数
5. **实现核心游戏逻辑**：完成handleAnswer()函数
6. **完善交互**：实现start()函数和所有事件监听器

完成后，你的Wordle游戏就基本完成了！这个顺序确保每一步都建立在稳定的基础上，逐步构建完整的功能。