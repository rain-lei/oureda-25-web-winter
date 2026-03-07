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
 * 1. 在怎样的时刻需要调用 initialize 函数：
 * 程序启动时，以及点击“重新开始”按钮时
 * 2. 程序的交互信息是什么：
 * 字母键输入字符、Backspace 键退格、Enter 键提交猜测，重来和答案。
 * 3. 内部状态会如何根据交互信息而改变：
 *     guess：随着输入和删除而变化；
 *     currentGuessTime：提交一次有效猜测后递增；
 *     state：根据猜测是否正确或次数是否用尽，从 UNFINISHED 变为 SOLVED 或 FAILED。
 * 4. 程序内部状态变化之后会作出怎样的反馈：
 *     guess 变化时：调用 render() 重新渲染当前行的字母显示；
 *     state 变化时（提交猜测后）：更新网格颜色、键盘颜色，并可能弹出胜负提示框。
 * 5. 如何读取交互信息：通过 document.addEventListener('keydown', ...) 监听物理键盘，通过 click 事件监听虚拟键盘。
 * 6. 程序在什么时候会终止：当 state 变为 SOLVED（猜对）或 FAILED（次数耗尽）时，程序停止接受新的输入猜测。
 */
async function start() {
    // === 1. 初始化游戏 ===
    await initialize();

    // === 绑定控制按钮事件 ===
    const restartBtn = document.getElementById('restart-btn');//从 HTML 中获取“重新开始”按钮的引用，值为一个 DOM 元素对象
    const showAnswerBtn = document.getElementById('show-answer-btn');//getElementById这个方法可以获取 HTML 中 id 分别为 restart-btn 和 show-answer-btn 的按钮的引用
    // 为“重新开始”按钮绑定点击事件，点击后调用 initialize() 函数重置游戏状态
    if (restartBtn) {
        restartBtn.addEventListener('click', async () => {//click事件监听器，监听用户点击“重新开始”按钮的行为，如果用户点击了这个按钮，就会执行后面的函数体
            await initialize();
            restartBtn.blur();//可选：点击后失去焦点，避免按键事件被误触发
        });
    }
    // 为“显示答案”按钮绑定点击事件，点击后弹出提示框显示当前答案
    if (showAnswerBtn) {
        showAnswerBtn.addEventListener('click', () => {// () => {...} 是一个箭头函数，表示当用户点击“显示答案”按钮时要执行的操作
            alert("悄悄告诉你，答案是：" + answer.toLowerCase());//alert() 函数会弹出一个提示框，显示字符串 "悄悄告诉你，答案是：" 加上当前答案的字符串形式（转换为小写）。这样用户就能看到当前 Wordle 的正确答案了
            showAnswerBtn.blur();
        });
    }

    // === 2. 处理用户输入 ===
    const processInput = (key) => {//定义一个函数 processInput，用于处理用户的输入，参数 key 是用户输入的键值，例如 'a'、'Enter'、'Backspace' 等
        if (state !== "UNFINISHED") return;//如果当前游戏状态不是 UNFINISHED（即已经 SOLVED 或 FAILED），则直接返回，不处理任何输入，确保游戏结束后不再接受新的猜测

        // 统一转为大写处理
        const upperKey = key.toUpperCase();

        // 1. 处理回车 (Enter)
        if (upperKey === 'ENTER') {
            // 只有当 guess 的长度为 5 时才允许提交
            if (guess.length === 5) {
                // 调用 isValidWord 判断 guess 是否是一个合法单词
                if (isValidWord(guess)) { // guess 已经是大写
                    // 如果合法，调用 handleAnswer 处理这个猜测
                    handleAnswer(guess);
                } else {
                    alert("不是一个合法的单词！");
                }
            } 
            // 如果 guess 长度不足 5，弹出提示框提醒用户
            else {
                alert("单词长度不足 5 个字母！");
            }
        }
        // 2. 处理删除 (Backspace)
        else if (upperKey === 'BACKSPACE') {
            // 删除 guess 中的最后一个字母（如果有的话）
            if (guess.length > 0) {
              //slice方法返回一个新的字符串，包含从原字符串的开始位置到结束位置（不包括结束位置）的所有字符。这里使用 slice(0, -1) 来获取 guess 字符串中除了最后一个字符以外的所有字符，从而实现删除最后一个字母的效果
                guess = guess.slice(0, -1);
                //render() 函数负责根据当前的 guess 变量重新渲染用户界面，更新当前行的字母显示。每次删除一个字母后都需要调用 render() 来确保界面与 guess 的最新状态保持一致
                render();
            }
        }
        // 3. 处理字母 (A-Z)
        else if (/^[A-Z]$/.test(upperKey)) {
            if (guess.length < 5) {
                guess += upperKey;// 将用户输入的字母添加到 guess 字符串的末尾（大写）
                render();
            }
        }
    };

    // === 监听物理键盘 ===
    // 通过 document.addEventListener 监听全局的键盘事件，当用户按下键盘上的任意键时，都会触发这个事件处理函数
    document.addEventListener('keydown', (event) => {//keydown是一个事件类型，表示按下键盘上的键时触发。event 是事件对象，包含了关于这个键盘事件的各种信息，比如按下的键值（event.key）
        processInput(event.key);//.key 属性包含了用户按下的键的值，例如 'a'、'Enter'、'Backspace' 等。将这个键值传递给 processInput 函数，processInput 函数会根据这个键值来处理用户的输入，更新游戏状态，并调用 render() 来更新界面显示
    });

    // === 监听虚拟键盘点击 ===
    // 获取虚拟键盘容器的引用，并为其添加点击事件监听器，监听用户点击虚拟键盘上的按钮
    const keyboardContainer = document.getElementById('keyboard-container');//从 HTML 中获取 id 为 keyboard-container 的元素的引用，这个元素是虚拟键盘的容器
    if (keyboardContainer) {//判断是否成功获取到虚拟键盘容器的引用，如果成功，则为这个容器添加一个 click 事件监听器，监听用户点击虚拟键盘上的按钮
        keyboardContainer.addEventListener('click', (event) => {
            const target = event.target.closest('button');//event.target 是用户点击的具体元素，closest('button') 方法会沿着 DOM 树向上查找，找到最近的一个 button 元素（如果用户点击的是按钮内部的某个子元素，也能正确识别到对应的按钮）。如果找到了一个 button 元素，并且这个按钮具有 data-key 属性，那么就获取这个 data-key 的值，并将其传递给 processInput 函数来处理这个输入
            if (target && target.hasAttribute('data-key')) {//判断用户点击的元素是否存在，并且是否具有 data-key 属性，这个属性用于存储按钮对应的键值（例如 'a'、'Enter'、'Backspace' 等）
                const key = target.getAttribute('data-key');//
                processInput(key);
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
   * 1. 什么是 DOM，这项技术有怎样的作用：
   *    DOM (文档对象模型) 是 HTML 文档的编程接口，将网页解析为树状对象结构。作用是让 JavaScript 能动态访问、修改网页的内容、结构和样式，实现动态交互。
   * 2. 如何实现程序内部状态和 HTML 组件的绑定，为什么要这么设计：
   *    通过 DOM API (如 querySelector) 查找 HTML 元素，根据 JS 变量 (如 guess) 的值更新元素的属性 (如 textContent, classList)。
   *    当前 render 函数通过 calculating index 找到对应格子并更新 textContent，实现了单向绑定。
   *    设计原因：数据驱动视图。解耦数据与界面，保证界面总是如实反映数据的当前状态，降低维护难度，避免逻辑混乱。
   * 3. 应该在怎样的时刻调用 render 函数：
   *    每当影响界面的核心数据发生变化时。例如：用户输入字母或按退格键导致 `guess` 变量改变时。
   */
  function render() {
    // 只需要负责渲染“当前正在输入”的那一行
    // 已提交的行由 handleAnswer 处理颜色

    if (state !== "UNFINISHED") return;

    const currentRowStart = currentGuessTime * 5;//根据当前猜测次数计算当前行的起始格子索引，例如 currentGuessTime=0 时，currentRowStart=0，表示第一行的格子索引为 0~4；currentGuessTime=1 时，currentRowStart=5，表示第二行的格子索引为 5~9，以此类推
    const tiles = document.querySelectorAll('.tile');//通过 querySelectorAll('.tile') 获取所有具有 tile 类的元素，这些元素代表了 Wordle 网格中的格子。tiles 是一个 NodeList，包含了所有格子的 DOM 元素，可以通过索引访问特定格子，例如 tiles[0] 代表第一个格子，tiles[1] 代表第二个格子，以此类推

    // 遍历当前行的 5 个格子
    
    for (let i = 0; i < 5; i++) {
      // 计算当前格子的索引
      const tileIndex = currentRowStart + i;
      const tile = tiles[tileIndex];
      //i 代表当前行的第 i 个格子（i 从 0 到 4），tileIndex 是这个格子在整个网格中的索引，通过 currentRowStart + i 计算得到。tile 是这个格子的 DOM 元素，可以通过 tile.textContent 来设置这个格子显示的字母，或者通过 tile.classList 来设置这个格子的颜色等样式
      //判断当前 guess 中是否有第 i 个字母，如果有，就将这个字母显示在对应的格子中；如果没有（例如用户输入了 3 个字母，但当前行有 5 个格子），则将这个格子清空
      if (i < guess.length) {
        // 如果当前位置有字母，将 guess 中的第 i 个字母显示在这个格子中
        tile.textContent = guess[i].toUpperCase();//textContent 属性用于设置或获取元素的文本内容，这里将 guess 中的第 i 个字母转换为大写后赋值给 tile.textContent，使得这个格子显示用户输入的字母。toUpperCase() 方法将字母转换为大写，符合 Wordle 的显示习惯
        // 添加一点输入动画（可选）
        // tile.classList.add('pop'); 
      } else {
        // 如果当前位置没字母（被回删了）
        tile.textContent = "";
      }
    }
  }

  /**
   * initialize()
   *
   * 初始化程序的状态
   *
   * 请思考：
   * 1. 有哪些状态或变量需要被初始化：
   *    - 游戏状态变量：currentGuessTime (猜测次数), guess (当前猜测), state (游戏状态, 如 "UNFINISHED")。
   *    - 答案变量：answer (本局游戏的正确单词)。
   *    - UI 状态：清空网格 (tiles) 的内容和颜色类；重置虚拟键盘的按键颜色。
   * 2. 初始化时 state 变量处于怎样的状态：
   *    - state 应该被重置为 "UNFINISHED"，表示游戏正在进行中，尚未结束。
   */
  async function initialize() {
    // 1. 重置游戏状态变量
    currentGuessTime = 0;
    guess = "";
    state = "UNFINISHED";

    // 2. 获取新答案
    answer = await generateRandomAnswer();

    // 3. 重置 UI - 网格
    const tiles = document.querySelectorAll('.tile');//获取所有具有 tile 类的元素，这些元素代表了 Wordle 网格中的格子。tiles 是一个 NodeList，包含了所有格子的 DOM 元素，可以通过索引访问特定格子，例如 tiles[0] 代表第一个格子，tiles[1] 代表第二个格子，以此类推
    tiles.forEach(tile => {
      tile.textContent = '';//清空格子中的文本内容，使得所有格子都不显示任何字母
      tile.classList.remove('correct', 'present', 'absent');//移除格子上的颜色类（correct、present、absent），使得所有格子都恢复到初始状态，没有任何颜色标记
      // 在这个项目中 tile 只有 tile 类和颜色类，remove 颜色类即可
    });

    // 4. 重置 UI - 虚拟键盘
    // 如果键盘尚未生成，则生成；如果已生成，则只重置颜色
    const keyboardContainer = document.getElementById('keyboard-container');//从 HTML 中获取 id 为 keyboard-container 的元素的引用，这个元素是虚拟键盘的容器。如果没有找到这个元素（例如 HTML 中没有这个 id），则直接返回，不执行后续代码
    if (!keyboardContainer) return;

    //直接清空重绘
    // 但为了保留引用（虽然这里没存引用），我们选择清空 innerHTML 重新生成
    keyboardContainer.innerHTML = '';//清空虚拟键盘容器中的所有内容，准备重新生成虚拟键盘的按钮

    const rows = ['QWERTYUIOP', 'ASDFGHJKL', 'ZXCVBNM'];//定义一个数组 rows，包含了虚拟键盘的三行按键，每行按键以字符串的形式表示，例如第一行是 "QWERTYUIOP"，第二行是 "ASDFGHJKL"，第三行是 "ZXCVBNM"。这个数组用于后续生成虚拟键盘的按钮布局
    rows.forEach((rowString, rowIndex) => {//遍历 rows 数组中的每一行字符串，rowString 代表当前行的按键字符串，rowIndex 代表当前行的索引（从 0 开始）。在这个循环中，我们将为每一行生成对应的按钮，并添加到虚拟键盘容器中
      const rowDiv = document.createElement('div');//创建一个新的 div 元素，作为当前行的容器，用于放置这一行的按键按钮
      rowDiv.classList.add('keyboard-row');//给这个 div 元素添加一个 CSS 类 keyboard-row，用于设置这一行的样式，例如水平排列、间距等

      if (rowIndex === 2) {
        // Enter 键
        const enterButton = document.createElement('button');//创建一个新的 button 元素，作为 Enter 键的按钮
        enterButton.textContent = 'Enter';
        enterButton.setAttribute('data-key', 'Enter');//给这个按钮设置文本内容为 "Enter"，并且设置一个自定义属性 data-key，值为 "Enter"，用于在点击事件中识别这是 Enter 键
        enterButton.classList.add('key-btn', 'wide-btn');//给 Enter 键的按钮添加 CSS 类 key-btn 和 wide-btn，key-btn 用于设置按键的基本样式，wide-btn 用于设置 Enter 键比普通字母键更宽一些
        rowDiv.appendChild(enterButton);//appendChild 方法将 Enter 键的按钮添加到当前行的 div 容器中，使得 Enter 键出现在虚拟键盘的第三行的左侧
      }

      const keys = rowString.split('');//将当前行的按键字符串拆分成单个字符的数组，例如 "QWERTYUIOP" 会被拆分成 ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P']，然后遍历这个数组，为每个字母生成一个按钮
      keys.forEach(key => {
        const btn = document.createElement('button');//创建一个新的 button 元素，作为当前字母键的按钮
        btn.textContent = key;//设置按钮的文本内容为当前字母，例如 'Q'、'W' 等
        btn.setAttribute('data-key', key);//给这个按钮设置一个自定义属性 data-key，值为当前字母，用于在点击事件中识别这是哪个字母键
        btn.classList.add('key-btn');
        rowDiv.appendChild(btn);//将当前字母键的按钮添加到当前行的 div 容器中，使得这个字母键出现在虚拟键盘的对应位置
      });
      //这样顺序进行添加，先添加 Enter 键，再添加字母键，最后添加 Backspace 键，就能保证它们在虚拟键盘上的正确位置
      if (rowIndex === 2) {
        // Backspace 键
        const backspaceBtn = document.createElement('button');
        backspaceBtn.textContent = "←";
        backspaceBtn.setAttribute('data-key', 'Backspace');
        backspaceBtn.classList.add('key-btn', 'wide-btn');
        rowDiv.appendChild(backspaceBtn);
      }
      
      keyboardContainer.appendChild(rowDiv);
    });

    console.log("游戏已重置，新答案是：", answer);
  }

  /**
   * generateRandomAnswer()
   *
   * 从题库中随机选取一个单词作为答案
   *
   * 题库文件为 words.json
   *
   * 请思考：
   * 1. 如何读取 json 文件：
   *    使用 `fetch` API 发起网络请求获取 words.json，然后调用 `response.json()` 将响应体解析为 JavaScript 对象。
   * 2. 如何随机抽取一个单词：
   *    words.json 的根结构是一个对象 `{ "words": [...] }`，而不是直接的数组。
   *    因此，需要先访问 `data.words` 获取单词数组，然后使用 `Math.random()` 生成随机索引进行抽取。
   *
   * @return {string} answer
   */
  async function generateRandomAnswer() {
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
   * 直接对比词库中的单词列表，判断用户输入的单词是否存在于这个列表中，如果存在则合法，否则不合法。
   * 2. 是否存在多条判断规则
   * 3. 如果上条成立，那么这些规则执行的先后顺序是怎样的，不同的执行顺序是否会对单词的合法性判断造成影响
   * 4. 如果单词不合法，那么程序的状态会如何变化，程序应当作出怎样的反馈
   *
   * @param {string} word
   * @return {boolean} isValid
   */
  function isValidWord(word) {
    return wordSequence.includes(word.toUpperCase());
    /*
    return的值是一个布尔值，表示用户输入的单词是否合法。
    这个函数通过调用 wordSequence.includes() 方法来判断用户输入的单词（转换为大写形式）是否存在于 wordSequence 数组中。
    如果存在，则返回 true，表示合法；如果不存在，则返回 false，表示不合法
    这个函数的核心逻辑就是检查用户输入的单词是否在预定义的单词列表中，从而判断其合法性
    */
  }

  /**
   * handleAnswer()
   *
   * 处理一次对单词的猜测，并根据其猜测结果更新程序内部状态
   *
   * 请思考：
   * 1. 是否需要对 guess 变量的字符串作某种预处理，为什么：
   *    统一大写
   * 
   *
   * @param {string} guess
   */
  function handleAnswer(currentGuess) {
    // 1. 从calculateColorSequence函数获取颜色序列
    //'b' 代表正确位置的字母（绿），'y' 代表在单词中但位置不对的字母（黄），'g' 代表不在单词中的字母（灰）。通过调用这个函数，我们可以得到当前猜测的颜色反馈，用于后续更新界面和判断游戏状态
    const colorSeq = calculateColorSequence(currentGuess, answer);//colorSeq 是一个字符串，表示当前猜测与答案之间的颜色匹配结果
    const tiles = document.querySelectorAll('.tile');

    /* 
     * 核心循环：遍历猜测的 5 个字母
     * 每次循环都做两件事：更新网格颜色 + 更新键盘颜色
     */
    for (let i = 0; i < 5; i++) {
      const tileIndex = currentGuessTime * 5 + i;
      const colorChar = colorSeq[i];
      const letter = currentGuess[i]; // currentGuess 已是大写，直接取当前字母

      // === A. 更新网格颜色 (Grid) ===
      let cssClass = '';
      if (colorChar === 'b') {
        cssClass = 'correct'; // 绿
      } else if (colorChar === 'y') {
        cssClass = 'present'; // 黄
      } else {
        cssClass = 'absent';  // 灰
      }
      tiles[tileIndex].classList.add(cssClass);

      // === B. 更新键盘颜色 (Keyboard)
      // 1. 找到对应的按键
      // letter 和 data-key 均为大写
      const keyBtn = document.querySelector(`button[data-key="${letter}"]`);

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
      // 判断是否用尽次数
      if (currentGuessTime >= maxGuessTime) {
        state = "FAILED";
        setTimeout(() => alert("很遗憾，次数用尽！答案是：" + answer.toLowerCase()), 100);
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
