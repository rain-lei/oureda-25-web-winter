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
let index = 1;  // 1~5 代表第一行，6~10 代表第二行，以此类推

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
async function start() 
{
  /*
  // TODO
  await initialize();
  document.addEventListener('keydown', function(event) 
  {
    if (state === "UNFINISHED") 
    {
      const key = event.key;    //key 是一个字符串，代表按下的键
      //
      if (key === "Enter") 
    {
        //if (guess.length === 5 && isValidWord(guess)) {//如果按下回车键，并且 guess 是一个合法的单词
          handleAnswer(guess);
          
          render();//根据新的状态重新渲染页面
        }
        else{
          alert("请输入一个合法的五字单词！");
        }
    }
      else if (key === "Backspace") 
    { 
        if (guess.length > 0) {
          guess = guess.slice(0, -1);
          index--;
          render();
          const tiles = document.querySelectorAll('.tile');
          if(tiles[index-1]) {
            tiles[index-1].textContent = '';
          }
        }
    }
      else if (/^[a-zA-Z]$/.test(key)) 
      {
        if (guess.length < 5) 
        {
          const tiles = document.querySelectorAll('.tile');
          if(tiles[index-1]) {
            tiles[index-1].textContent = key.toUpperCase();
          }
          guess += key.toLowerCase();
          index++;
          render();
        }
      }
    });
*/
      await initialize();

    // === 定义内部处理函数 (闭包)，替代全局函数 ===
    // 这样既不污染全局作用域，又能处理所有输入
    const processInput = (key) => {
        if (state !== "UNFINISHED") return; // 游戏结束则不响应

        // 统一转换为小写进行逻辑判断
        const lowerKey = key.toLowerCase();

        // 1. 处理回车 (Enter)
        if (lowerKey === 'enter') {
            if (guess.length === 5) {
    if (isValidWord(guess)) {
        handleAnswer(guess);
    } else {
        alert("不是一个合法的单词！");
    }
}
            else {
                alert("单词长度不足 5 个字母！");
            }
        } 
        // 2. 处理删除 (Backspace)
        else if (lowerKey === 'backspace') {
            if (guess.length > 0) {
                // 从 guess 字符串移除最后一个字符
                guess = guess.slice(0, -1);
                
                // 更新 UI：清空对应格子的内容
                // currentGuessTime 是当前行数 (0-5)
                // guess.length 是当前字符位置
                // 例如：行0，原本长3，现在变长2，我们要清空的是 index 为 (0*5 + 2) 的那个格子
                const currentRowStart = currentGuessTime * 5;
                const tileIndex = currentRowStart + guess.length; 
                
                const tiles = document.querySelectorAll('.tile');
                tiles[tileIndex].textContent = "";
            }
        } 
        // 3. 处理字母 (a-z)
        else if (/^[a-z]$/.test(lowerKey)) { 
            // 如果是单个字母且当前猜测长度小于 5
            if (guess.length < 5) {
                const tiles = document.querySelectorAll('.tile');
                const currentRowStart = currentGuessTime * 5;
                const tileIndex = currentRowStart + guess.length;
                
                tiles[tileIndex].textContent = key.toUpperCase(); // 显示大写
                guess += lowerKey; // 存储小写
            }
        }
        // 4. 其他按键忽略，不做任何操作（也不 alert）
    };

    // === 监听物理键盘 ===
    document.addEventListener('keydown', (event) => {
        processInput(event.key);
    });

    // === 监听虚拟键盘点击 ===
    // 利用事件委托，监听 keyboard 容器
    const keyboardContainer = document.getElementById('keyboard-container');
    if (keyboardContainer) {
        keyboardContainer.addEventListener('click', (event) => {
            // 查找被点击元素是否是按钮，或按钮内部
            const target = event.target.closest('button');
            if (target && target.hasAttribute('data-key')) {
                const key = target.getAttribute('data-key');
                processInput(key);
                
                // 移除焦点的“虚框”，提升体验
                target.blur(); 
            }
        });
    }
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
  // TODO
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
async function initialize() {
  // TODO
  answer = await generateRandomAnswer();
  const tiles = document.querySelectorAll('.tile');
  tiles.forEach(tile => {
    tile.textContent = '';
    tile.className = 'tile';
  });
  const keyboardContainer = document.getElementById('keyboard-container');
  if (!keyboardContainer) return ;

  keyboardContainer.innerHTML = '';

  const rows = ['QWERTYUIOP', 'ASDFGHJKL', 'ZXCVBNM'];
  rows.forEach((rowString,rowIndex) => {
    const rowDiv = document.createElement('div');
    rowDiv.classList.add('keyboard-row');

    if (rowIndex === 2) {
      const enterButton = document.createElement('button');
      enterButton.textContent = 'Enter';
      enterButton.setAttribute('data-key', 'Enter');
      enterButton.classList.add('key-btn','wide-btn');
      rowDiv.appendChild(enterButton);
    }
    const keys = rowString.split('');
        keys.forEach(key => {
            const btn = document.createElement('button');
            btn.textContent = key;
            btn.setAttribute('data-key', key);
            btn.classList.add('key-btn'); // 样式需在 CSS 定义
            rowDiv.appendChild(btn);
        });
            if (rowIndex === 2) {
             const backspaceBtn = document.createElement('button');
             backspaceBtn.textContent = "←";
             backspaceBtn.setAttribute('data-key', 'Backspace');
             backspaceBtn.classList.add('key-btn', 'wide-btn');
             rowDiv.appendChild(backspaceBtn);
        }

        keyboardContainer.appendChild(rowDiv);
    });
    console.log("程序已初始化，答案是：", answer);
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
        
       if (Array.isArray(data)) {
            wordSequence = data;
        } else if (data.words && Array.isArray(data.words)) {
            wordSequence = data.words;
        } else {
            console.error("JSON 格式无法识别");
            return "apple";
        }
        
        // 随机抽取
        const randomIndex = Math.floor(Math.random() * wordSequence.length);
        const randomWord = wordSequence[randomIndex];
        
        return randomWord;
    } catch (error) {
        console.error("无法读取词库:", error);
        return "apple"; // 发生错误时的保底词
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
  // TODO
  return wordSequence.includes(word.toLowerCase());
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
function handleAnswer(currentGuess) {
  // 1. 获取颜色序列 (您之前写的算法，假设返回 "bbgyy" 这种格式)
  const colorSeq = calculateColorSequence(currentGuess, answer); 
  
  // 2. 准备更新 UI
  const currentRowStart = currentGuessTime * 5;
  const tiles = document.querySelectorAll('.tile');
  
  /* 
   * 核心循环：遍历猜测的 5 个字母
   * 每次循环都做两件事：更新网格颜色 + 更新键盘颜色
   */
  for (let i = 0; i < 5; i++) {
      const tileIndex = currentRowStart + i;
      const colorChar = colorSeq[i];
      const letter = currentGuess[i].toLowerCase(); // 获取当前字母的小写形式
      
      // === A. 更新网格颜色 (Board) ===
      // 先移除旧颜色，防止叠加
      tiles[tileIndex].classList.remove('correct', 'present', 'absent');
      
      let cssClass = '';
      if (colorChar === 'b') {
          cssClass = 'correct'; // 绿
      } else if (colorChar === 'y') {
          cssClass = 'present'; // 黄
      } else {
          cssClass = 'absent';  // 灰
      }
      tiles[tileIndex].classList.add(cssClass);

      // === B. 更新键盘颜色 (Keyboard) - 不调用外部函数，直接在这里写 ===
      // 1. 找到对应的按键
      // 注意：这里同时匹配小写和大写 data-key，兼容性更强
      const keyBtn = document.querySelector(`button[data-key="${letter}"]`) || 
                     document.querySelector(`button[data-key="${letter.toUpperCase()}"]`);
      
      if (keyBtn) {
          // 2. 检查优先级：如果是 Green (correct)，它就是最终状态，不能被改成 Yellow 或 Grey
          const isCorrect = keyBtn.classList.contains('correct');
          
          if (!isCorrect) {
              // 3. 如果当前已经是 Yellow (present)，只有 Green 可以覆盖它，Grey 不能覆盖
              const isPresent = keyBtn.classList.contains('present');
              
              if (cssClass === 'correct') {
                  // 升级为绿色
                  keyBtn.classList.remove('present', 'absent');
                  keyBtn.classList.add('correct');
              } else if (cssClass === 'present' && !isPresent) {
                  // 变为黄色
                  keyBtn.classList.remove('absent');
                  keyBtn.classList.add('present');
              } else if (cssClass === 'absent' && !isPresent) {
                  // 变为灰色
                  keyBtn.classList.add('absent');
              }
          }
      }
  }

  // 3. 判断胜负状态与跳转下一行
  console.log("提交了猜测：", currentGuess, " 颜色结果：", colorSeq);

  if (currentGuess === answer) {
      state = "SOLVED";
      guess = "";
      // 延时一点点，让渲染先完成
      setTimeout(() => alert("恭喜你，猜对了！"), 100); 
  } else {
      currentGuessTime++; // 进入下一行
      guess = "";         // 重置猜测缓存
      
      if (currentGuessTime >= maxGuessTime) {
          state = "FAILED";
          setTimeout(() => alert("很遗憾，次数用尽！答案是：" + answer), 100);
      } else {
          state = "UNFINISHED";
          // 继续游戏
      }
  }
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
 * b代表正确位置的字母，g代表不在单词中的字母，y代表在单词中但位置不对的字母
 * 2. 有哪些特殊的匹配情况
 * 注意点：如果 guess 中有重复的字母，而 answer 中只有一个这样的字母，那么只有 guess 中的第一个这样的字母会被标记为 y 或 b，其他的会被标记为 g
 *
 * @param {string} guess
 * @param {string} answer
 * @return {string} colorSequence
 */
function calculateColorSequence(guess, answer) {
  // TODO
  let result = ['g', 'g', 'g', 'g', 'g'];
/*  for (let i = 0 ; i < answerLength ; i++) {
    if (guess[i] === answer[i]) {
      result[i] = 'b';
      continue;
    }
    else for (let j = 0 ; j < answerLength ; j++) {
      if (guess[i] === answer[j]) {
        result[i] = 'y';
        break;
      }
    }
  }
  */
  let guessArr = guess.toUpperCase().split("");
  let answerArr = answer.toUpperCase().split("");
  for (let i = 0 ; i < answerLength ; i++) {
    if (guessArr[i] === answerArr[i]) {
      result[i] = 'b';
      answerArr[i] = '';
    }
  }
  for (let i = 0 ; i < answerLength ; i++) {
    if (result[i] !== 'b')
    {

    
            for (let j = 0 ; j < answerLength ; j++) {
                         if (guessArr[i] === answerArr[j]) 
                        {
                         result[i] = 'y';
                         answerArr[j] = '';
                         break;
                         }
            }
    }
}

  return result.join('');
}

/*  通过https://www.codewars.com/kata/62013b174c72240016600e60/train/javascript的代码
*   更改了颜色的表示方式，b代表绿色，g代表灰色，y代表黄色
function resolver(guess, answer) {
  // TODO
  let answerLength = 5;
  let result = ['b', 'b', 'b', 'b', 'b'];
  let guessArr = guess.toUpperCase().split("");
  let answerArr = answer.toUpperCase().split("");
  for (let i = 0 ; i < answerLength ; i++) {
    if (guessArr[i] === answerArr[i]) {
      result[i] = 'g';
      answerArr[i] = '';
    }
  }
  for (let i = 0 ; i < answerLength ; i++) {
    if (result[i] !== 'g')
    {

    
            for (let j = 0 ; j < answerLength ; j++) {
                         if (guessArr[i] === answerArr[j]) 
                        {
                         result[i] = 'y';
                         answerArr[j] = '';
                         break;
                         }
            }
    }
}

  return result.join('');
}
*/