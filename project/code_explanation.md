# Wordle 复刻版核心代码解析

本文档旨在帮助编程初学者理解本项目的核心代码逻辑。我们将从程序的启动、核心算法到交互细节，为您逐一拆解。

---

## 1. 核心状态管理 (全局变量)

代码的开头定义了游戏运行所需的所有“状态”。想象这就像是在玩桌游前准备好的记分板。

```javascript
/* === 全局变量 === */
const answerLength = 5;          // 单词长度固定为 5
const maxGuessTime = 6;          // 最多猜 6 次
let answer = "";                 // 本局的正确答案（如 "apple"）
let guess = "";                  // 玩家当前正在输入的单词（如 "appl"）
let currentGuessTime = 0;        // 玩家当前在猜第几行 (0-5)
let state = "UNFINISHED";        // 游戏状态：进行中、胜利、失败
```
**解析**：
- `state` 是极其重要的。程序通过判断 `state` 是否为 `"UNFINISHED"` 来决定是否响应键盘。如果游戏结束了，键盘就不应该有反应。

---

## 2. 程序的起点：`start()` 与 `initialize()`

程序一加载就会运行 `start()`，它是总指挥。

```javascript
async function start() {
    // 1. 初始化游戏
    await initialize();

    // 2. 绑定按钮事件...
    // 3. 定义输入处理逻辑...
    // 4. 监听键盘事件...
}
```

### 为什么是 `async/await` ?

`initialize` 函数内部需要去读取 `words.json` 文件（网络请求），这是一个耗时的**异步**操作。
- 如果不写 `await`，程序可能在词库还没下载完时就开始游戏，导致报错。
- `await` 的意思是：“等 `initialize` 做完了，再往下执行”。

---

## 3. 词库加载：`generateRandomAnswer()`

这是很多初学者最困惑的部分：如何从文件中获取数据。

```javascript
async function generateRandomAnswer() {
    try {
        // 请求 words.json 文件
        const response = await fetch('words.json');
        
        // 将文件内容解析为 JS 对象（数组）
        const data = await response.json(); 
        
        // 兼容性处理：因为 json 可能是 ["a", "b"] 也可能是 { "words": ["a", "b"] }
        if (Array.isArray(data)) {
            wordSequence = data;
        } else {
            wordSequence = data.words;
        }
        
        // 随机取一个词
        const randomIndex = Math.floor(Math.random() * wordSequence.length);
        return wordSequence[randomIndex];
        
    } catch (error) {
        // 如果文件读取失败（比如断网），返回一个保底词以防程序崩溃
        return "apple";
    }
}
```

---

## 4. 核心输入逻辑：`processInput` (闭包)

我们没有为每个按键写一个单独的函数，而是写了一个通用的处理函数 `processInput(key)`。

### 什么是“闭包”?
在 `start` 函数内部定义的函数（如 `processInput`），可以访问 `start` 作用域内的变量（如 `guess`, `state`）。这样就不需要把所有逻辑暴露在全局，代码更安全。

### 输入判断流程

```javascript
const processInput = (key) => {
    if (state !== "UNFINISHED") return; // 游戏结束，直接无视输入
    
    const lowerKey = key.toLowerCase(); // 统一转小写方便判断

    // 情况 A: 按下回车 (提交猜测)
    if (lowerKey === 'enter') {
        if (guess.length === 5) {
            // 只有长度够了且是合法单词，才处理
            if (isValidWord(guess)) handleAnswer(guess);
            else alert("不是单词！");
        } else {
            alert("长度不够！");
        }
    } 
    // 情况 B: 按下退格 (删除)
    else if (lowerKey === 'backspace') {
        // 只要还有字，就删掉最后一个
        if (guess.length > 0) {
            guess = guess.slice(0, -1);
            render(); // 更新界面
        }
    } 
    // 情况 C: 按下字母 (输入)
    else if (/^[a-z]$/.test(lowerKey)) {
        // 用正则检查是否是 a-z，且长度没满 5
        if (guess.length < 5) {
            guess += lowerKey;
            render(); // 更新界面
        }
    }
};
```

---

## 5. 渲染界面：`render()`

初学者的代码通常混杂着数据修改和 DOM 操作。本项目我们将它们分离开来：
- **数据层**：只修改 `guess` 变量。
- **视图层**：`render` 函数根据 `guess` 变量去画界面。

```javascript
function render() {
    // 找到当前行的起点。比如猜到第 2 行，起点就是 index 5
    const currentRowStart = currentGuessTime * 5;
    const tiles = document.querySelectorAll('.tile'); // 获取所有 30 个格子

    for (let i = 0; i < 5; i++) {
        const tile = tiles[currentRowStart + i];
        
        // 核心逻辑：如果 guess 里有这个字，就显示；否则清空
        // 例如 guess="ab", i=0 显示 A, i=1 显示 B, i=2 显示 ""
        if (i < guess.length) {
            tile.textContent = guess[i].toUpperCase();
        } else {
            tile.textContent = "";
        }
    }
}
```

---

## 6. 特别难点：颜色判断算法

这部分在 `calculateColorSequence` 函数中。
Wordle 的规则有一个坑：**重复字母处理**。
比如答案是 `"APPLE"`（两个 P），你猜 `"PUPPY"`（三个 P）。
- 第 1 个 P：位置不对 -> 黄色
- 第 2 个 P：位置不对 -> 黄色
- 第 3 个 P：**不应该再是黄色了**，因为答案里只有两个 P，名额用完了 -> 灰色

为了处理此问题，我们采用了 **“两趟扫描法”**：

**第一趟（优先处理绿色）**：
- 先把所有位置完全对上的标记为 `b`（绿色）。
- **关键操作**：把答案中对应的字母通过 `answerArr[i] = ''` 抹掉，防止被二次匹配。

**第二趟（处理黄色）**：
- 只有没被标记为绿色的字母才进入这一轮。
- 在剩余的 `answerArr` 里找这个字母。如果有，标记 `y`（黄色），并再次抹掉答案中对应字母。
- 找不到就是 `g`（灰色）。

---

## 7. 事件委托：为什么不给每个按键绑事件？

在虚拟键盘的处理上：
```javascript
// ✅ 推荐做法 (事件委托)
keyboardContainer.addEventListener('click', (event) => {
    // 只有点到了 button 才处理
    const target = event.target.closest('button');
    if (target) { ... }
});

// ❌ 笨办法
// buttons.forEach(btn => btn.onclick = ...)
```
**好处**：
1. **性能更好**：只监听一个父元素，比监听 26+ 个子元素省内存。
2. **动态性**：如果你重置游戏删除了键盘又重新生成，不需要重新绑定事件，父元素的监听器一直都在。

---

希望这份解析能帮你读懂这个小游戏的代码！如果有具体哪一行还看不懂，请随时提问。
