# Wordle 开发向导 (完整记录版)

这份文档记录了我们开发的每一个步骤。请在当前阶段继续操作。

---

## ✅ 已完成：第一阶段 (HTML 结构)

<details>
<summary>点击查看历史记录</summary>

### Step 1.1: 基础文件准备
- [x] 创建 `index.html` 基础模板
- [x] 修改 Title 为 `My Wordle`
- [x] 引入 `index.css` 和 `index.js`

### Step 1.2: 搭建三大区域
- [x] 创建 `#game-container`
- [x] 创建 `header`
- [x] 创建 `#board-container` 和 `#board`
- [x] 创建 `#keyboard-container`
</details>

---

## ✅ 已完成：第二阶段 (CSS 样式)

<details>
<summary>点击查看历史记录</summary>

### Step 2.1: 基础设置
- [x] 修正 CSS 嵌套结构
- [x] 设置 body 样式 (黑底白字)
- [x] 设置容器 Flex 布局

### Step 2.2: 绘制网格
- [x] Grid 布局 (6行5列)
- [x] 方块样式 (边框、居中、大写)
- [x] **在 HTML 中复制了 6 行格子用于预览**

### Step 2.3: 颜色类
- [x] 定义 `.correct` (绿), `.present` (黄), `.absent` (灰)
</details>

---

## ✅ 已完成：第三阶段 (JS 核心算法)

**目标**：修正 `calculateColorSequence` 中的字符串不可变问题，完成算法。

### Step 3.1: 算法修正
- [x] 使用 `.split('')` 将字符串转数组
- [x] 两轮遍历正确处理绿色和黄色
- [x] 逻辑正确！

---

## 🚀 当前进行中：第四阶段 (游戏交互)

**目标**：让游戏能跑起来，使用 `index` 全局游标来控制所有的光标移动。

### ⚠️ Step 4.1: 理解 Index 光标逻辑
你的代码中已经定义了 `index`（1~30）。这意味着我们不再需要 `currentRow` 或 `currentTile` 这类辅助变量，所有的位置判断都可以基于 `index` 和 `currentGuessTime` 计算出来。

- **`index`**: 指示“下一个待输入字母的位置”（范围 1~30）。
- **`currentGuessTime`**: 指示“当前是第几次猜测”（范围 0~5）。每次猜测完后 +1。
- **当前行起始**: `currentGuessTime * 5 + 1`
- **当前行结束**: `currentGuessTime * 5 + 5`

### ✅ Step 4.2: 实现初始化 (initialize)
请完全替换 `initialize` 函数：

```javascript
/**
 * initialize()
 * 初始化程序的状态
 */
async function initialize() {
    // 1. 重置游戏状态
    state = "UNFINISHED";
    currentGuessTime = 0; 
    guess = "";
    wordSequence = [];
    colorSequence = [];
    
    // 2. 重置光标 (1 代表第一个格子的ID或位置)
    index = 1; 

    // 3. 抽取一个新的随机答案 (稍后实现实际逻辑)
    // answer = await generateRandomAnswer(); 
    answer = "APPLE"; // 暂时写死
    console.log("游戏初始化完成，当前答案是：", answer);
}
```

### ✅ Step 4.3: 实现程序入口 (start)
请完全替换 `start` 函数。它是整个程序的指挥官。

```javascript
/**
 * start()
 * 程序入口
 */
async function start() {
    // 1. 初始化
    await initialize();

    // 2. 绑定键盘事件
    document.addEventListener('keydown', function(event) {
        // 如果游戏结束，停止响应
        if (state !== "UNFINISHED") return;

        const key = event.key; 
        
        if (key === 'Enter') {
            // 提交答案
            handleAnswer(guess);
        } else if (key === 'Backspace') {
            // 删除字母
            deleteLastLetter(); 
        } else if (/^[a-zA-Z]$/.test(key)) {
            // 输入字母
            addLetterToBoard(key);
        }
    });
}
```

### ✅ Step 4.4: 实现 UI 辅助函数 (基于 Index)
请在文件底部添加这两个函数。注意看我是如何使用 `index` 和 `currentGuessTime` 来计算边界的。

```javascript
// 辅助函数：添加字母
function addLetterToBoard(letter) {
    // 计算当前允许的 index 上限 (当前行的最后一个格子)
    const currentRowEnd = (currentGuessTime + 1) * 5;

    // 只有 index 没超过当前行，才允许写入
    // 注意：index 是 1-based，代表“下一个空位”，如果 index > end，说明本行满了
    if (index <= currentRowEnd) {
        // 获取所有格子 (假设 HTML 里有 class="tile")
        let tiles = document.querySelectorAll(".tile");
        
        // 找到目标格子 (index-1 因为数组是 0-based)
        let targetTile = tiles[index - 1]; 
        
        if (targetTile) {
            targetTile.textContent = letter.toUpperCase();
            
            // 更新内部 guess 变量
            guess += letter.toUpperCase();
            
            // 移动光标到下一格
            index++;
        }
    }
}

// 辅助函数：删除字母
function deleteLastLetter() {
    // 计算当前行的起始位置 (例如第0次猜测是 1)
    const currentRowStart = currentGuessTime * 5 + 1;
    
    // 只有光标还在起始位置之后，才能删 (不能删上一行的)
    if (index > currentRowStart) {
        index--; // 先回退光标 (回到上一个有字的位置)
        
        let tiles = document.querySelectorAll(".tile");
        let targetTile = tiles[index - 1];
        if (targetTile) {
            targetTile.textContent = "";
        }
        
        // 更新 guess 变量 (去掉最后一个字符)
        guess = guess.slice(0, -1);
    }
}
```

---

### 🟢 第四阶段进度与问题
> 1.  替换 `initialize` 和 `start`。
> 2.  新增 `addLetterToBoard` 和 `deleteLastLetter`（使用 index 逻辑）。
> 3.  **注意**：`addLetterToBoard` 依赖 `document.querySelectorAll(".tile")`，请确保你的 `index.html` 里所有格子都有 `.tile` 类。
> 4.  试着在网页上打字，看看能不能输入和删除。完成后告诉我！
