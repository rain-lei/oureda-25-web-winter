# Wordle 项目 Bug 检查及解决方案 (更新版)

## 严重 Bug 列表

### 1. **start() 函数中 Enter 键处理逻辑严重错误**
**位置**: `index.js` 第 92-99 行
```javascript
const currentRowFilledCount = index - (currentGuessTime * answerLength) - 1;
if (currentRowFilledCount < answerLength) {
  alert("Please fill in all the cells in the current row before submitting!");
  return;
}
handleAnswer(guess);
```

**问题**: 这个条件判断完全错误，会立即弹出警告，永远不会到达handleAnswer()
**解决方案**:
```javascript
if (event.key === "Enter") {
  const expectedIndex = currentGuessTime * answerLength + answerLength + 1;
  if (index === expectedIndex) {  // 只有当index正好是期望值时（当前行填满）
    handleAnswer(guess);
    guess = "";
  } else {
    alert("Please fill in all the cells in the current row before submitting!");
  }
}
```

### 2. **Enter 键逻辑被错误地放在了 if-else 结构之外**
**位置**: `index.js` 第 92-99 行
```javascript
// 错误的结构：Enter处理逻辑放在了if(key >= 'A' && key <= 'Z')的else分支中
if (key >= 'A' && key <= 'Z') {
  // 字母处理
}
const currentRowFilledCount = index - (currentGuessTime * answerLength) - 1;  // 总是执行
if (currentRowFilledCount < answerLength) {  // 总是执行
  alert("...");
  return;
}
handleAnswer(guess);  // 总是执行
guess = "";  // 总是执行
```

**解决方案**: 修复键盘事件处理结构

### 3. **虚拟键盘事件中的 Enter 键处理逻辑错误**
**位置**: `index.js` 第 124-128 行
```javascript
if (index < currentGuessTime * answerLength + answerLength) {  // 条件错误
```

**解决方案**:
```javascript
const expectedIndex = currentGuessTime * answerLength + answerLength + 1;
if (index !== expectedIndex) {  // 正确的条件
```

### 4. **handleAnswer() 中未更新 index 到下一行**
**位置**: `index.js` 第 342-350 行
**问题**: 猜错后，没有更新 index 到下一行开始位置
**解决方案**:
```javascript
else {
  currentGuessTime++;
  if (currentGuessTime >= maxGuessTime) {
    state = "FAILED";
    alert(`Game Over! The correct answer was: ${answer}`);
  }
  else {
    index = currentGuessTime * answerLength + 1;  // 更新到下一行开始
    alert(`Wrong guess! You have ${maxGuessTime - currentGuessTime} guesses left.`);
  }
}
```

### 5. **虚拟键盘事件处理器中存在语法错误**
**位置**: `index.js` 第 117 行
```javascript
keyBtn = key.textContent.toUpperCase();  // 错误：声明了变量但没有使用const/let
```

**解决方案**:
```javascript
const keyBtn = this.textContent.toUpperCase();  // 使用this而不是key
```

### 6. **render() 函数中没有验证元素是否存在**
**位置**: `index.js` 第 185-187 行
```javascript
const cell = document.getElementById(`cell${index}`);
cell.textContent = letter;  // 如果cell为null会报错
```

**解决方案**:
```javascript
const cell = document.getElementById(`cell${index}`);
if (cell) {  // 检查元素是否存在
  cell.textContent = letter;
  cell.className = "cell filled";
  index++;
}
```

## 修复后的完整键盘事件处理逻辑

```javascript
// 修正start()函数中的键盘事件处理
document.addEventListener("keydown", function(event) {
  if (state !== "UNFINISHED") {
    return;
  }

  const key = event.key.toUpperCase();

  if (key >= 'A' && key <= 'Z') {
    // 字母键处理
    const maxIndexForCurrentRow = currentGuessTime * answerLength + answerLength;
    if (index <= maxIndexForCurrentRow && guess.length < answerLength) {
      guess += key;
      render(key);
    }
  }
  else if (event.key === "Enter") {
    // Enter键处理：检查当前行是否填满
    const expectedIndex = currentGuessTime * answerLength + answerLength + 1;
    if (index === expectedIndex && guess.length === answerLength) {
      handleAnswer(guess);
      guess = "";
    } else {
      alert("Please fill in all the cells in the current row before submitting!");
    }
  }
  else if (event.key === "Backspace") {
    // Backspace键处理
    if (index > currentGuessTime * answerLength + 1 && guess.length > 0) {
      index--;
      const cell = document.getElementById(`cell${index}`);
      if (cell) {
        cell.textContent = "";
        cell.className = "cell";
      }
      guess = guess.slice(0, -1);
    }
  }
});
```

这些问题严重阻碍了游戏的正常运行，尤其是键盘事件处理逻辑的错误结构导致Enter键无法正常工作。