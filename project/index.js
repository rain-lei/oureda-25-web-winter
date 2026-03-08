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
  // TODO
  initialize();
//实体监听
document.addEventListener("keydown", function(event) {
  if (state !== "UNFINISHED") {
    return;
  }
  const key = event.key.toUpperCase();
  if (/^[A-Z]$/.test(key)) {
    if (index < currentGuessTime * answerLength + answerLength + 1) {
      guess += key;
      render(key);
    }
  }
  else if (event.key === "Enter") {
  const expectedIndex = currentGuessTime * answerLength + answerLength + 1;
  if (index === expectedIndex) {  
    const submitSuccess = handleAnswer(guess);
    if (submitSuccess) {
      guess = "";
    }
  } else {
    alert("Please fill in all the cells in the current row before submitting!");

  }
  }
  else if (event.key === "Backspace") {
    if (index > currentGuessTime * answerLength + 1) {
      index--;
      const cell = document.getElementById(`cell${index}`);
      cell.textContent = "";
      cell.className = "cell";
      guess = guess.slice(0, -1);
    }
  }

});

document.querySelectorAll(".key, .longkey").forEach(key => {
  key.addEventListener("click", function() {
    if (state !== "UNFINISHED") {
      return;
    }
    const keyBtn = this.textContent.toUpperCase();
      if (/^[A-Z]$/.test(keyBtn)) {
    const expectedIndex = currentGuessTime * answerLength + answerLength + 1;
if (index < expectedIndex)  {
      guess += keyBtn;
      render(keyBtn);
    }
  }
  else if (keyBtn === "ENTER") {
    const expectedIndex = currentGuessTime * answerLength + answerLength + 1;
    if (index === expectedIndex && guess.length === answerLength) {
      const submitSuccess = handleAnswer(guess);
      if (submitSuccess) {
        guess = "";
      }
    }
    else {
      alert("补全单词后再提交哦！");
    }
  }
  else if (keyBtn === "BACKSPACE") {
    if (index > currentGuessTime * answerLength + 1) {
      index--;
      const cell = document.getElementById(`cell${index}`);
      if (cell) {
      cell.textContent = "";
      cell.className = "cell";
      guess = guess.slice(0, -1);
      }
    }
  }

 });
});




document.getElementById("refresh").addEventListener("click", function() {
  initialize();
  refresh.blur();
});
document.getElementById("showAnswer").addEventListener("click", function() {
  alert(`答案是: ${answer.toLowerCase()}`);
  showAnswer.blur();
});




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
  if (index > currentGuessTime * answerLength + answerLength) {
    return;
  }
  if (state !== "UNFINISHED") {
      return;
    }
  const currentRowStart = currentGuessTime * answerLength + 1;

    const cell = document.getElementById(`cell${index}`);
    cell.textContent = letter;
    cell.className = "cell filled";
    index++;

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
  // TODO
  state = "UNFINISHED";
  currentGuessTime = 0;
  index = 1;
  colorSequence = [];
  wordSequence = [];
// 清空grid
  for (let i=1; i <= maxGuessTime*answerLength; i++) {
    const cell = document.getElementById(`cell${i}`);
    cell.textContent = "";
    cell.className = "cell";//此时为original

  }
// 清空键盘
  const keys = document.querySelectorAll(".key, .longkey");
  keys.forEach(key => {
    key.className = key.classList.contains("longkey") ? "longkey" : "key";//此时为original
  });
  // 重置剩余猜测次数显示
  const leftGuessTimeElement = document.getElementById("leftGuessTime");
  leftGuessTimeElement.textContent = `Left GuessTime: ${maxGuessTime - currentGuessTime}`;
  leftGuessTimeElement.style.color = "white";
// 生成新的答案
  answer = "APPLE";
  wordSequence = [answer];
  generateRandomAnswer().then(randomWord => {
    answer = randomWord.toUpperCase();
  });
  document.getElementById("leftGuessTime").textContent = `Left GuessTime: ${maxGuessTime - currentGuessTime}`;

// 弹窗提示游戏开始

  


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
  // TODO
   try {
      // 读取 words.json 文件
      const response = await fetch('words.json');//使用 fetch API 发起网络请求获取 words.json 文件的内容，fetch 返回一个 Promise，使用 await 等待这个 Promise 解析完成，得到一个 Response 对象
      

      const data = await response.json();//

      // 根据 words.json 的结构 {"words": [...]} 获取单词列表
      // 统一转为大写，方便后续比较
      wordSequence = data.words.map(w => w.toUpperCase());

      // 随机抽取一个单词
      const randomIndex = Math.floor(Math.random() * wordSequence.length);
      const randomWord = wordSequence[randomIndex];

      return randomWord;

    } catch (error) {
      console.error("无法读取词库:", error);
      alert("词库加载失败，已启用基础模式（5位英文字母均可提交）。");
      return "APPLE"; // 发生错误时的保底词（大写）
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
  const normalizedWord = word.toUpperCase();
  const basicFormatValid = /^[A-Z]{5}$/.test(normalizedWord);

  if (!basicFormatValid) {
    return false;
  }

  if (wordSequence.length <= 1) {
    return true;
  }

  return wordSequence.includes(normalizedWord);
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
function handleAnswer(guess) {
  // TODO
  guess = guess.toUpperCase();
  if (!isValidWord(guess)) {
    alert("Invalid word!");
    return false;
  }

const colorSeq = calculateColorSequence(guess, answer);


for (let i = index - answerLength; i < index; i++) {
  const letterIndex = i - (index - answerLength);
  const letter = guess[letterIndex].toUpperCase();
  const key = document.getElementById(`key${letter}`);
  const cell = document.getElementById(`cell${i}`);
  const shortcolor = colorSeq[letterIndex];
  if (shortcolor === 'b') {
    cell.className = "cell correct";
    key.className = "key correct";
  }
  else if (shortcolor === 'y') {
    cell.className = "cell present";
    if (key.className !== "key correct") {
      key.className = "key present";
    }
  }
  else {
    cell.className = "cell absent";
    if (key.className !== "key correct" && key.className !== "key present") {
      key.className = "key absent";
    }
  }
}


  if (guess === answer) {
    state = "SOLVED";
    setTimeout(() => {
      alert("恭喜你猜对了！");
    }, 300);
  }
  else {
    currentGuessTime++;
    document.getElementById("leftGuessTime").textContent = `Left GuessTime: ${maxGuessTime - currentGuessTime}`;
    if (currentGuessTime >= maxGuessTime) {
      state = "FAILED";
      setTimeout(() => {                                                                                                                                 
      alert(`游戏结束，正确答案是: ${answer.toUpperCase()}`);
      }, 300);
    }
    else {
      index = currentGuessTime * answerLength + 1;
      //alert(`Wrong guess! You have ${maxGuessTime - currentGuessTime} guesses left.`);

    }
  }

  return true;
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
    for (let i = 0; i < answerLength; i++) {
      if (guessArr[i] === answerArr[i]) {
        result[i] = 'b';
        answerArr[i] = '';
      }
    }
    for (let i = 0; i < answerLength; i++) {
      if (result[i] !== 'b') {


        for (let j = 0; j < answerLength; j++) {
          if (guessArr[i] === answerArr[j]) {
            result[i] = 'y';
            answerArr[j] = '';
            break;
          }
        }
      }
    }

    return result.join('');
  }
  /*
  function resolver(guess, answer) {
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