# Wordle 复刻项目 — 完整开发流程总结与 AI 对话日志

> **项目名称**: Wordle Game（前端三件套复刻版）  
> **技术栈**: 原生 HTML5 + CSS3 + JavaScript (ES6+)  
> **开发方式**: 人工编码 + AI 辅导（不直接改代码，只给 Markdown 指南）  
> **核心约束**: ① 不直接修改用户代码 ② 不新增全局函数 ③ 教知其所以然

---

## 目录

1. [项目概览](#项目概览)
2. [开发阶段总览](#开发阶段总览)
3. [Phase 1 — HTML 结构搭建](#phase-1--html-结构搭建)
4. [Phase 2 — CSS 样式设计](#phase-2--css-样式设计)
5. [Phase 3 — 颜色匹配算法](#phase-3--颜色匹配算法-calculatecolorsequence)
6. [Phase 4 — 用户交互与输入处理](#phase-4--用户交互与输入处理)
7. [Phase 5 — 游戏逻辑与结果处理](#phase-5--游戏逻辑与结果处理-handleanswer)
8. [Phase 6 — 词库加载与单词管理](#phase-6--词库加载与单词管理)
9. [全面 Bug 审查](#全面-bug-审查)
10. [Bug 列表与修复记录](#bug-列表与修复记录)
11. [项目当前状态](#项目当前状态)
12. [关键知识点回顾](#关键知识点回顾)

---

## 项目概览

### 什么是 Wordle？

Wordle 是一款猜单词游戏。玩家有 6 次机会猜一个 5 字母的英文单词。每次猜测后，系统会用三种颜色反馈结果：

| 颜色 | 代码 | 含义 |
|------|------|------|
| 🟩 绿色 | `b` | 字母正确且位置正确 |
| 🟨 黄色 | `y` | 字母存在但位置不对 |
| ⬜ 灰色 | `g` | 字母不在答案中 |

> **注意**：项目中 `b` 代表绿色（而非 blue），这是项目模板规定的编码方式。

### 文件结构

```
project/
├── index.html    ── 游戏页面结构（6×5 网格 + 虚拟键盘容器）
├── index.css     ── 样式（暗色主题、网格布局、键盘样式、颜色类）
├── index.js      ── 核心逻辑（~527行，包含所有游戏函数）
├── words.json    ── 词库（{ "words": ["aback", "abase", ...] } 格式）
├── ai_guide.md   ── 本文件：开发日志与总结
└── readme.md     ── 项目说明（待完成）
```

### 全局状态变量

```javascript
const answerLength = 5;        // 答案长度
const maxGuessTime = 6;        // 最大猜测次数
let colorSequence = [];        // 颜色序列
let wordSequence = [];         // 词库数组
let answer = "";               // 本局答案
let guess = "";                // 当前输入
let currentGuessTime = 0;      // 已用猜测次数 (0~5)
let index = 1;                 // 游标位置 (1~30)（后来改用 currentGuessTime*5 计算）
let state = "UNFINISHED";      // 游戏状态: UNFINISHED / SOLVED / FAILED
```

---

## 开发阶段总览

```
Phase 1 ─── HTML 结构搭建
   │           6 行 × 5 列网格 + header + 键盘容器
   ▼
Phase 2 ─── CSS 样式设计
   │           暗色主题、Grid 布局、颜色类定义、键盘按钮样式
   ▼
Phase 3 ─── 核心算法实现
   │           calculateColorSequence()：两趟扫描（先绿后黄）
   ▼
Phase 4 ─── 用户交互
   │           start() + initialize()：物理键盘 & 虚拟键盘输入
   ▼
Phase 5 ─── 游戏逻辑
   │           handleAnswer()：颜色渲染 + 键盘更新 + 胜负判断
   ▼
Phase 6 ─── 词库管理
   │           generateRandomAnswer() + isValidWord()
   ▼
Bug 审查 ── 全面代码审计，发现并修复 6 个 Bug
```

---

## Phase 1 — HTML 结构搭建

### 做了什么
- 创建了基本的 HTML5 骨架
- 用 `<div id="game-container">` 包裹整个游戏
- 用 `<div id="board">` 包含 6 个 `.row`，每行 5 个 `.tile`
- 添加了 `<div id="keyboard-container">` 作为虚拟键盘的挂载点（内容由 JS 动态生成）
- 在底部用 `<script src="index.js">` 引入脚本

### 关键决策
- 网格的 tile 初始内容为 "A B C D E"（硬编码占位符，JS 初始化时会清空）
- 键盘容器是空的 `<div>`，由 `initialize()` 动态填充
- 使用 `id` 而非 `class` 标识唯一容器（`#keyboard-container`、`#board`）

### AI 对话要点
- AI 建议使用语义化的 HTML 结构
- 讨论了为什么用 JS 动态生成键盘而非写死在 HTML 中（更灵活，方便后续更新颜色）

---

## Phase 2 — CSS 样式设计

### 做了什么
- 暗色背景 (`rgba(0,0,0,0.808)`)，白色文字
- `#game-container` 使用 Flexbox 居中，`max-width: 500px`
- `#board` 使用 CSS Grid，6 行 1 列
- `.row` 使用 CSS Grid，1 行 5 列
- `.tile` 固定 60×60px，灰色边框，大字体，居中显示
- 定义了三个颜色类：`.correct`(绿)、`.present`(黄)、`.absent`(灰)
- 键盘按钮 `.key-btn` 使用 `flex: 1` 均分，`.wide-btn` 用于 Enter 和 Backspace

### 遇到的问题

**问题 1**: `.correct` / `.present` / `.absent` 被定义了两次
- 文件上半部分用 `!important` 定义了一组（用于按键变色）
- 文件下半部分又定义了一组（用于 tile 变色），颜色值略有差异
- **解决**: 删掉重复的定义，只保留一组

**问题 2**: `.keyboard-row` 类在 JS 中被使用但 CSS 中缺失
- 生成键盘时给每行 div 加了 `keyboard-row` 类
- 但 CSS 中忘记定义 `display: flex`
- **解决**: 补上 `.keyboard-row { display: flex; justify-content: center; margin: 0 auto 8px; }`

---

## Phase 3 — 颜色匹配算法 (`calculateColorSequence`)

### 做了什么
实现了 Wordle 的核心颜色计算算法，采用**两趟扫描法**：

```
第一趟（绿色）: 完全匹配的字母标记为 'b'，同时从答案数组中删除该字母（置空）
第二趟（黄色）: 未匹配的字母在剩余答案中查找，找到则标记为 'y' 并删除
最终未匹配: 保持默认值 'g'（灰色）
```

### 遇到的问题

**问题**: JavaScript 字符串不可变（immutable），无法直接修改某个字符
- 例如 `answer[i] = ''` 不会生效
- **解决**: 使用 `.toUpperCase().split("")` 将字符串转为数组再操作
- **知其所以然**: JS 中字符串是原始类型，`str[i] = 'x'` 不会报错但也不会修改。数组是引用类型，`arr[i] = 'x'` 会直接修改原数组。

**问题**: 重复字母的处理
- 例如 guess="SPEED", answer="ABIDE"，E 出现两次但答案中只有一个 E
- **解决**: 第一趟匹配后将答案中对应字母置空（`answerArr[i] = ''`），防止第二趟重复匹配
- 这就是为什么要分两趟：先确认所有绿色位置，再处理黄色，避免"抢占"

### AI 对话要点
- AI 从 Codewars 的 Wordle 题目切入，帮助理解算法思路
- 讨论了为什么单趟扫描不够（会导致重复字母误标）
- 用户自己先实现了一版（在注释中可以看到旧版单趟代码），AI 指出了边界问题后改为两趟

---

## Phase 4 — 用户交互与输入处理

### 做了什么

#### `start()` 函数
- 调用 `await initialize()` 初始化游戏
- 定义了 `processInput` 闭包函数处理所有键盘输入
- 三种输入类型：
  1. **Enter**: 检查长度 → 验证单词 → 提交猜测
  2. **Backspace**: 删除最后一个字母，清空对应 tile
  3. **字母键 (a-z)**: 追加到 guess，显示在 tile 上
- 监听物理键盘 (`document.addEventListener('keydown')`)
- 监听虚拟键盘 (事件委托到 `#keyboard-container`)

#### `initialize()` 函数
- 调用 `generateRandomAnswer()` 获取答案
- 清空所有 tile 的文本和颜色类
- 动态生成三行虚拟键盘（QWERTYUIOP / ASDFGHJKL / ZXCVBNM）
- 第三行首尾分别添加 Enter 和 Backspace（← 符号）

### 遇到的问题

**问题 1**: 每次按键都弹 alert
- 旧版代码把 `alert("请输入合法单词")` 放在了 else 分支中，任何非 Enter 的按键都会触发
- **解决**: 重构为 `processInput` 闭包，按 Enter/Backspace/字母/其他 四路分支处理

**问题 2**: 虚拟键盘没出现
- 事件监听写了，但 `initialize()` 里生成键盘的代码缺失
- **解决**: 在 `initialize` 中添加完整的键盘生成逻辑

**问题 3**: `querySelector('.keyboard')` 找不到元素
- HTML 中用的是 `id="keyboard-container"`，但 JS 用 `querySelector('.keyboard')` 按类名查找
- **解决**: 改为 `document.getElementById('keyboard-container')`
- **知其所以然**: `#` 是 ID 选择器，`.` 是类名选择器；ID 在页面中应该唯一，`getElementById` 性能更优

**问题 4**: 虚拟键盘点击如何实现？
- 每个按钮都加独立事件监听器太浪费
- **解决**: 使用**事件委托**模式——只在父容器 `#keyboard-container` 上监听 `click`，通过 `event.target.closest('button')` 找到实际按钮，再读取 `data-key` 属性
- **知其所以然**: 事件冒泡机制使得子元素的事件会逐级上传到父元素，在父元素上统一处理更高效

**问题 5**: tile 索引计算
- 旧版使用全局 `index` 变量（1~30），逻辑混乱容易出错
- **解决**: 改用 `currentGuessTime * 5 + guess.length` 计算当前 tile 索引
- **知其所以然**: `currentGuessTime` 表示第几行（0~5），乘以每行 5 格再加上当前列数，就是 tile 在 `querySelectorAll('.tile')` 结果中的下标

### AI 对话要点
- 详细讨论了"闭包"概念——`processInput` 可以访问外层 `start()` 的 `initialize` 等变量
- 讨论了事件委托 vs 逐个绑定的利弊
- 讨论了 `data-*` 自定义属性的用法

---

## Phase 5 — 游戏逻辑与结果处理 (`handleAnswer`)

### 做了什么
- 调用 `calculateColorSequence` 获取颜色序列
- 遍历 5 个字母，同时完成两件事：
  1. **更新网格颜色**: 给 tile 添加 `.correct` / `.present` / `.absent` 类
  2. **更新键盘颜色**: 找到对应按键并更新颜色（内联实现，不调外部函数）
- 键盘颜色**优先级**: Green > Yellow > Grey（绿色不能被覆盖为黄色或灰色）
- 判断胜负：
  - `currentGuess === answer` → `state = "SOLVED"`，弹窗"恭喜猜对"
  - `currentGuessTime >= maxGuessTime` → `state = "FAILED"`，弹窗揭示答案
  - 否则继续游戏

### 遇到的问题

**问题 1**: `updateKeyboardColor` 未定义
- 代码中调用了 `updateKeyboardColor(letter, cssClass)` 但从未定义该函数
- 项目约束规定"不能新增函数"
- **解决**: 把键盘颜色更新逻辑直接内联到 `handleAnswer` 的循环里
- **知其所以然**: 遵循项目模板的"尽量不要定义新函数"约束；如果在实际开发中，提取为独立函数更好（单一职责原则），但此处为教学场景

**问题 2**: 键盘按键匹配大小写
- HTML 中键盘 `data-key` 是大写（如 `data-key="A"`）
- `handleAnswer` 中用小写字母查找
- **解决**: 用 `||` 同时查找两种大小写：
  ```javascript
  document.querySelector(`button[data-key="${letter}"]`) ||
  document.querySelector(`button[data-key="${letter.toUpperCase()}"]`)
  ```

**问题 3**: 颜色优先级逻辑
- 同一个字母在不同行猜测中可能得到不同颜色
- 如果先猜到黄色再猜到绿色，键盘应该升级为绿色
- 如果已经是绿色，不能被降级为灰色
- **解决**: 先检查按键当前状态（`isCorrect` / `isPresent`），再决定是否覆盖

### AI 对话要点
- 讨论了"颜色优先级"的概念——这是 Wordle 键盘的标准行为
- 讨论了为什么用 `setTimeout(() => alert(), 100)` 延迟弹窗（让 tile 颜色先渲染完毕）

---

## Phase 6 — 词库加载与单词管理

### 做了什么

#### `generateRandomAnswer()`
- 使用 `fetch('words.json')` 异步加载词库
- `await response.json()` 解析 JSON
- 兼容两种 JSON 格式：纯数组 `[...]` 和对象 `{ "words": [...] }`
- 将词库存入全局 `wordSequence` 数组
- `Math.floor(Math.random() * wordSequence.length)` 随机抽词
- `try/catch` 错误处理，失败时返回保底词 `"apple"`

#### `isValidWord()`
- `return wordSequence.includes(word.toLowerCase())`
- 检查用户猜测是否在词库中

### 遇到的问题

**问题 1**: `words.json` 格式与预期不符
- 最初以为 JSON 是纯数组 `["apple", "about", ...]`
- 实际是对象 `{ "words": ["apple", "about", ...] }`
- **解决**: 用 `Array.isArray(data)` 检测格式，如果是对象则用 `data.words`
- **知其所以然**: `fetch` + `response.json()` 返回的是 JS 对象，必须了解数据的真实结构才能正确提取

**问题 2**: `const data = await response.json()` 这行代码丢失
- `fetch` 返回的是 `Response` 对象，必须调用 `.json()` 才能获得实际数据
- 代码中缺少了这一行，导致 `data` 变量未定义
- **解决**: 在 `const response = await fetch(...)` 后补上 `const data = await response.json()`

---

## 全面 Bug 审查

在完成所有 Phase 后，进行了一次完整的代码审计，共发现 **6 个 Bug**。

---

## Bug 列表与修复记录

### 🔴 Bug #1（致命）— `initialize` 从未设置 `answer`

| 项目 | 内容 |
|------|------|
| **位置** | `index.js` — `initialize()` 函数 |
| **现象** | 所有猜测结果都是 `ggggg`（全灰） |
| **原因** | `initialize` 函数中没有 `answer = await generateRandomAnswer()` |
| **根因** | `answer` 始终为空字符串 `""`，`calculateColorSequence("apple", "")` 中 `answerArr` 为空数组，所有比较都是 `letter === undefined`，全部返回灰色 |
| **修复** | 在 `initialize` 开头添加 `answer = await generateRandomAnswer();` |
| **状态** | ✅ 已修复 |

### 🔴 Bug #2（致命）— `generateRandomAnswer` 缺少关键代码

| 项目 | 内容 |
|------|------|
| **位置** | `index.js` — `generateRandomAnswer()` 函数 |
| **现象** | 函数调用时直接报错 `ReferenceError: data is not defined` |
| **原因** | `fetch` 之后缺少 `const data = await response.json()` |
| **根因** | `response` 是 Response 对象，不是 JSON 数据；必须调用 `.json()` 方法解析 |
| **修复** | 补上 `const data = await response.json();` |
| **状态** | ✅ 已修复 |

### 🟡 Bug #3（中等）— 猜对时未重置 `guess`

| 项目 | 内容 |
|------|------|
| **位置** | `index.js` — `handleAnswer()` 的 SOLVED 分支 |
| **现象** | 猜对后 `guess` 仍保留旧值 |
| **原因** | 只在猜错的 `else` 分支中写了 `guess = ""`，SOLVED 分支遗漏 |
| **影响** | 当前不影响（因为 `state` 变为 SOLVED 后不再接受输入），但如果加"再来一局"功能会出问题 |
| **修复** | 在 `state = "SOLVED"` 后添加 `guess = "";` |
| **状态** | ✅ 已修复 |

### 🟡 Bug #4（中等）— CSS 缺少 `.keyboard-row` 定义

| 项目 | 内容 |
|------|------|
| **位置** | `index.css` |
| **现象** | 键盘行内的按键可能没有横向排列 |
| **原因** | JS 中给每行 div 加了 `keyboard-row` 类，但 CSS 中未定义该类的样式 |
| **修复** | 添加 `.keyboard-row { display: flex; justify-content: center; margin: 0 auto 8px; }` |
| **状态** | ✅ 已修复 |

### 🟢 Bug #5（轻微）— CSS 颜色类重复定义

| 项目 | 内容 |
|------|------|
| **位置** | `index.css` |
| **现象** | `.correct` / `.present` / `.absent` 在文件中出现两次 |
| **原因** | 上半部分用 `!important` 定义（用于按钮），下半部分又定义一次（用于 tile） |
| **影响** | 不影响功能（后定义的会覆盖前面的，`!important` 优先级更高），但代码冗余 |
| **修复** | 统一保留一组定义 |
| **状态** | ✅ 已修复（当前 CSS 中已只保留一组） |

### 🔴 Bug #6（严重）— `isValidWord()` 从未被调用

| 项目 | 内容 |
|------|------|
| **位置** | `index.js` — `start()` 内的 `processInput` 闭包 |
| **现象** | 用户可以输入任意 5 个字母（如 "zzzzz"）并提交，不会被拦截 |
| **原因** | Enter 处理逻辑直接调用 `handleAnswer(guess)`，没有先调用 `isValidWord(guess)` |
| **修复** | 在 Enter 分支中添加 `if (isValidWord(guess)) { handleAnswer(guess); } else { alert("不是一个合法的单词！"); }` |
| **状态** | ✅ 已修复 |

---

## 项目当前状态

### ✅ 已完成功能

| 功能 | 对应函数/文件 | 说明 |
|------|--------------|------|
| HTML 页面结构 | `index.html` | 6×5 网格 + 键盘容器 |
| CSS 暗色主题 | `index.css` | Grid 布局 + 颜色类 + 键盘样式 |
| 颜色匹配算法 | `calculateColorSequence()` | 两趟扫描，正确处理重复字母 |
| 物理键盘输入 | `start()` → `keydown` 监听 | Enter / Backspace / 字母 |
| 虚拟键盘输入 | `start()` → 事件委托 | 点击按钮触发 `processInput` |
| 虚拟键盘生成 | `initialize()` | QWERTY 三行布局 + Enter/← |
| 猜测结果处理 | `handleAnswer()` | 网格变色 + 键盘变色 + 胜负判断 |
| 词库加载 | `generateRandomAnswer()` | fetch + JSON 解析 + 随机抽词 |
| 单词验证 | `isValidWord()` | 在词库中查找，已集成到 Enter 逻辑 |

### 📋 待完成/可改进

| 项目 | 说明 |
|------|------|
| `render()` 函数 | 目前为空壳，游戏逻辑直接操作 DOM（功能正常但不优雅） |
| **"再来一局"功能** | 游戏结束后需手动刷新页面，建议添加重置按钮 |
| **"显示答案"功能** | 调试或放弃时查看答案，建议添加按钮 |
| 动画效果 | 翻转动画、弹跳动画等（可选） |
| `readme.md` | 项目说明文档待编写 |

---

## Phase 7 — 进阶功能建议

这部分是为后续开发提供的实现思路，帮助完善游戏体验。

### 1. 实现"再来一局" (Reset Game)

当前游戏结束后（无论输赢）只能通过 F5 刷新页面来重开。更好的做法是提供一个按钮，点击后重置所有状态。

**实现思路**:
1.  **HTML**: 在 `header` 或底部添加一个 `<button id="restart-btn">再来一局</button>`。
2.  **JS**: 编写一个 `resetGame` 函数（或复用/修改 `initialize`）。
3.  **重置逻辑**:
    -   **变量重置**: `currentGuessTime = 0`, `guess = ""`, `state = "UNFINISHED"`.
    -   **生成新答案**: 调用 `answer = await generateRandomAnswer()`.
    -   **清空网格**: 遍历 `.tile`，清空 `textContent`，移除所有颜色类 (`correct`, `present`, `absent`).
    -   **清空键盘**: 遍历 `.key-btn`，移除所有颜色类.
    -   **更新提示**: 如果有状态显示栏，重置相应文字.

### 2. 实现"显示答案" (Show Answer)

在调试过程中或玩家实在猜不出来时，提供一种查看答案的方式。

**实现思路**:
1.  **HTML**: 添加一个 `<button id="show-answer-btn">显示答案</button>`。
2.  **JS**: 绑定点击事件。
3.  **逻辑**:
    -   直接 `alert("当前的答案是: " + answer)`.
    -   或者在页面某个隐蔽角落显示。
    -   *(进阶)*: 点击后直接判负 (`state = "FAILED"`) 并结束本局游戏，避免作弊.

### 3. 代码重构建议
可以将 `initialize()` 中的 DOM 清理逻辑提取出来，这样 `resetGame()` 可以直接调用它，避免代码重复。

```javascript
/* 伪代码示例 */
async function resetGame() {
    // 1. 重置核心变量
    currentGuessTime = 0;
    guess = "";
    state = "UNFINISHED";
    
    // 2. 重新获取答案
    answer = await generateRandomAnswer();
    
    // 3. 清理 UI (网格和键盘)
    // ...清除 class 和 textContent...
    
    console.log("游戏已重置，新答案:", answer);
}
```

---

## 关键知识点回顾

### 1. JavaScript 字符串不可变性
```javascript
let str = "hello";
str[0] = "H";  // ❌ 不会报错，但也不会生效
console.log(str); // 仍然是 "hello"

let arr = str.split(""); // ✅ 转为数组
arr[0] = "H";            // 数组可以修改
str = arr.join("");       // 再拼回字符串
```

### 2. `async/await` 异步编程
```javascript
// fetch 返回 Promise，必须 await
const response = await fetch('words.json'); // 得到 Response 对象
const data = await response.json();         // 得到 JS 对象/数组
// 如果漏掉第二行，data 就是 undefined！
```

### 3. 事件委托 (Event Delegation)
```javascript
// ❌ 给每个按钮都加监听器 —— 浪费内存
buttons.forEach(btn => btn.addEventListener('click', handler));

// ✅ 只在父容器上监听 —— 利用事件冒泡
container.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (btn) { /* 处理点击 */ }
});
```

### 4. 闭包 (Closure)
```javascript
async function start() {
    await initialize();
    // processInput 可以访问 start 作用域中的一切
    const processInput = (key) => {
        // 这里可以直接使用 guess, state, answer 等变量
    };
    document.addEventListener('keydown', (e) => processInput(e.key));
}
```

### 5. CSS 选择器 vs JavaScript 查询
| CSS | JS | 说明 |
|-----|-----|------|
| `#id` | `getElementById('id')` | ID 选择器，唯一 |
| `.class` | `getElementsByClassName('class')` | 类选择器 |
| `[data-key="A"]` | `querySelector('[data-key="A"]')` | 属性选择器 |
| `.a .b` | `querySelector('.a .b')` | 后代选择器 |

### 6. Wordle 颜色优先级
键盘上同一个字母可能在不同猜测中得到不同颜色。优先级规则：
```
Green (correct) > Yellow (present) > Grey (absent)
```
- 已经是绿色 → 永远不会改变
- 已经是黄色 → 只有绿色可以覆盖
- 灰色 → 可以被黄色或绿色覆盖

---

## AI 对话时间线

| 阶段 | 用户做了什么 | AI 提供了什么 | 遇到的关键问题 |
|------|-------------|--------------|---------------|
| Phase 1 | 编写 HTML 结构 | Grid 布局建议、语义化标签指导 | — |
| Phase 2 | 编写 CSS 样式 | 暗色主题配色、Flex/Grid 用法 | 颜色类重复定义、`.keyboard-row` 缺失 |
| Phase 3 | 实现颜色算法 | 两趟扫描思路、字符串不可变性讲解 | 重复字母误标、字符串不可修改 |
| Phase 4 | 实现输入交互 | 闭包设计、事件委托、索引计算 | 选择器不匹配、每键弹 alert、键盘不显示 |
| Phase 5 | 实现结果处理 | 内联键盘更新、颜色优先级逻辑 | `updateKeyboardColor` 未定义、大小写不匹配 |
| Phase 6 | 实现词库加载 | JSON 格式处理、async/await 讲解 | `data` 变量丢失、JSON 结构不符预期 |
| 审查 | 请求全面审计 | 6 个 Bug 的完整报告与修复方案 | 两个致命 Bug 导致游戏完全无法运行 |

---

> **总结**: 本项目从零开始搭建了一个完整的 Wordle 游戏。开发过程中遇到的问题涵盖了前端开发的核心知识：DOM 操作、异步编程、事件处理、CSS 布局、数据校验。AI 辅导全程只提供 Markdown 文档指引，所有代码均由用户亲手编写和修改，做到了"知其然更知其所以然"。
