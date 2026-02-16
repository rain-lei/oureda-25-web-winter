I will implement the Wordle game and manage the version control as requested.

### 1. Git Version Control
- **Branch Creation**: Create and switch to a new branch named `aisolo` to isolate the development.
- **Remote Push**: After implementation, commit the changes and push the `aisolo` branch to `https://github.com/rain-lei/oureda-25-web-winter`.

### 2. HTML Structure (`index.html`)
- Create a game container.
- Add a **Header** with the title.
- Add a **Game Grid**: 6 rows x 5 columns to display guesses.
- Add a **Virtual Keyboard**: 3 rows of keys (QWERTY layout) for user input and visual feedback.
- Add a **Message Area**: To display win/loss messages and errors.
- Add a **Restart Button**: To reset the game.

### 3. CSS Styling (`index.css`)
- **Layout**: Use Flexbox/Grid for centering the game board and keyboard.
- **Colors**: Define CSS variables for the standard Wordle colors:
  - Correct (Green): `#6aaa64` (mapped to 'b')
  - Present (Yellow): `#c9b458` (mapped to 'y')
  - Absent (Grey): `#787c7e` (mapped to 'g')
- **Responsiveness**: Ensure it looks good on different screen sizes.

### 4. JavaScript Logic (`index.js`)
I will complete the provided skeleton functions:
- **`initialize()`**: Reset game variables and pick a new random word.
- **`generateRandomAnswer()`**: Fetch the word list from `words.json`.
- **`isValidWord(word)`**: Check if the input is 5 letters and exists in the word list.
- **`calculateColorSequence(guess, answer)`**: Implement the core logic for color feedback.
- **`handleAnswer(guess)`**: Process the user's guess, update game state, and trigger rendering.
- **`render(letter)`**: Update the DOM (grid and keyboard) based on the current state.
- **`start()`**: Set up event listeners for keyboard and mouse input.

### 5. Documentation
- **`README.md`**: Update with instructions on how to run the game (using a local server) and a description of the project structure.
