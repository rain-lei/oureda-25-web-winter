# Wordle 项目 Bug 检查及解决方案

## 发现的 Bug 及解决方案

### 1. 键盘事件处理中的变量名冲突
**位置**: `index.js` 第 117 行
```javascript
key = key.textContent.toUpperCase();  // 错误：用参数名作为变量
```
**解决方案**:
```javascript
const keyText = key.textContent.toUpperCase();  // 使用新变量名
```

### 2. Enter键验证逻辑错误
**位置**: `index.js` 第 92-94 行和第 124-126 行
```javascript
if (index < currentGuessTime * answerLength + answerLength) {  // 验证条件错误
```
**解决方案**:
```javascript
const expectedEndIndex = currentGuessTime * answerLength + answerLength + 1;
if (index !== expectedEndIndex) {  // 当前填写位置应等于当前行结束位置
```

### 3. handleAnswer()中未更新到下一行
**位置**: `index.js` 第 342-350 行
**问题**: 猜错后没有更新index到下一行开始位置
**解决方案**:
```javascript
else {
  currentGuessTime++;
  if (currentGuessTime >= maxGuessTime) {
    state = "FAILED";
    alert(`Game Over! The correct answer was: ${answer}`);
  }
  else {
    index = currentGuessTime * answerLength + 1;  // 重要：更新到下一行开始
    alert(`Wrong guess! You have ${maxGuessTime - currentGuessTime} guesses left.`);
  }
}
```

### 4. render()函数中未检查元素存在性
**位置**: `index.js` 第 185-188 行
```javascript
const cell = document.getElementById(`cell${index}`);
cell.textContent = letter;  // 可能为null时出错
```
**解决方案**:
```javascript
const cell = document.getElementById(`cell${index}`);
if (cell) {  // 添加检查
  cell.textContent = letter;
  cell.className = "cell filled";
  index++;
}
```

### 5. Backspace操作中的潜在错误
**位置**: `index.js` 第 103-106 行和第 135-138 行
```javascript
const cell = document.getElementById(`cell${index}`);
cell.textContent = "";  // 可能为null时出错
```
**解决方案**:
```javascript
const cell = document.getElementById(`cell${index}`);
if (cell) {  // 添加检查
  cell.textContent = "";
  cell.className = "cell";
}
```

### 6. 键盘颜色更新的优先级处理
**位置**: `index.js` 第 313-331 行
**问题**: 没有考虑颜色优先级，绿色应保持不变
**解决方案**:
```javascript
if (colorCode === 'b') {
  key.className = "key correct";
}
else if (colorCode === 'y' && !key.classList.contains('correct')) {
  // 只有当前不是绿色时，才更新为黄色
  if (key.className !== "key correct") {
    key.className = "key present";
  }
}
else if (colorCode === 'g' &&
         !key.classList.contains('correct') &&
         !key.classList.contains('present')) {
  // 只有当前既不是绿色也不是黄色时，才更新为灰色
  if (key.className !== "key correct" && key.className !== "key present") {
    key.className = "key absent";
  }
}
```