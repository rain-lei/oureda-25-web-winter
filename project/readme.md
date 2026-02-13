# Wordle Clone

这是一个基于 HTML, CSS, 和 JavaScript 开发的 Wordle 游戏复刻版。旨在帮助初学者理解 Web 开发的基本概念，如 DOM 操作、事件处理和模块化编程。

## 项目结构

- `index.html`: 游戏的 HTML 结构，包含网格、键盘和消息区域。
- `index.css`: 游戏的样式定义，包括布局、颜色和动画。
- `index.js`: 游戏的核心逻辑，包括状态管理、用户输入处理和规则判定。
- `words.json`: 包含超过 2000 个五字母单词的题库。

## 游戏规则

1.  **目标**: 在 6 次尝试内猜出一个 5 个字母的单词。
2.  **反馈**:
    *   **绿色**: 字母在单词中且位置正确。
    *   **黄色**: 字母在单词中但位置不正确。
    *   **灰色**: 字母不在单词中。
3.  **输入**: 使用物理键盘或屏幕上的虚拟键盘输入。

## 如何运行

由于本项目使用 `fetch` API 加载本地 JSON 文件 (`words.json`)，直接双击 `index.html` 打开可能会因为浏览器的跨域策略 (CORS) 而导致加载失败。

**推荐方式**: 使用本地服务器运行。

### VS Code (推荐)
1.  安装 **Live Server** 扩展。
2.  右键点击 `index.html`。
3.  选择 "Open with Live Server"。

### Python
如果你安装了 Python，也可以在项目根目录下运行：
```bash
python -m http.server
```
然后访问 `http://localhost:8000`。

## 代码亮点

*   **模块化**: 逻辑被拆分为 `start`, `initialize`, `handleAnswer`, `render` 等独立函数。
*   **注释丰富**: 关键代码段均配有详细注释，解释实现原理。
*   **状态管理**: 使用 `state` 变量清晰地管理游戏流程。
