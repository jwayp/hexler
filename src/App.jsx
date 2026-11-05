import { useEffect, useState } from "react";
import { generatePuzzle, SYMBOLS } from "./game/puzzle";
import "./App.css";
function HexlerLogo({ size = "normal" }) {
  return (
    <div className={`hexler-logo ${size}`}>
      <svg
        className="hexler-mark"
        viewBox="0 0 100 100"
        aria-hidden="true"
      >
        {/* Outer hexagon */}
        <polygon
          points="50,3 93,27 93,73 50,97 7,73 7,27"
          fill="#101a2a"
          stroke="#e6edf7"
          strokeWidth="3"
        />

        {/* Upper-left metallic facet */}
        <polygon
          points="10,28 34,15 34,40 10,53"
          fill="#aeb9c8"
        />

        {/* Upper-right metallic facet */}
        <polygon
          points="66,15 90,28 90,53 66,40"
          fill="#aeb9c8"
        />

        {/* Lower-left metallic facet */}
        <polygon
          points="10,53 34,40 34,85 10,72"
          fill="#aeb9c8"
        />

        {/* Lower-right metallic facet */}
        <polygon
          points="66,40 90,53 90,72 66,85"
          fill="#aeb9c8"
        />

        {/* Upper center */}
        <polygon
          points="36,14 50,6 64,14 64,40 36,40"
          fill="#0b111c"
        />

        {/* Lower center */}
        <polygon
          points="36,60 64,60 64,86 50,94 36,86"
          fill="#0b111c"
        />

        {/* Horizontal H bar */}
        <polygon
          points="20,40 80,40 80,60 20,60"
          fill="#e6edf7"
        />

        {/* SOLID THIN BLUE LINE */}
        <line
          x1="50"
          y1="5"
          x2="50"
          y2="95"
          stroke="#168cff"
          strokeWidth="4"
        />

        {/* Facet definition */}
        <line
          x1="36"
          y1="14"
          x2="36"
          y2="86"
          stroke="#31445b"
          strokeWidth="1.5"
        />

        <line
          x1="64"
          y1="14"
          x2="64"
          y2="86"
          stroke="#31445b"
          strokeWidth="1.5"
        />
      </svg>

      <div className="hexler-brand-lockup">
        <div className="hexler-wordmark">
          HEX<span>ler</span>
        </div>

        <div className="hexler-subtitle">
STRETCH YOUR MIND.
</div>

<div className="hexler-line"></div>
      </div>
    </div>
  );
}
const STORAGE_KEY = "hexler-current-game";
const STATS_KEY = "hexler-completion-stats";

const DEFAULT_STATS = {
  Easy: 0,
  Medium: 0,
  Hard: 0,
  Expert: 0,
};

function App() {
  const [screen, setScreen] = useState("home");
  const [puzzleData, setPuzzleData] = useState(null);
  const [values, setValues] = useState([]);
  const [selected, setSelected] = useState(null);
  const [hoveredCell, setHoveredCell] = useState(null);
  const [hoveredSymbol, setHoveredSymbol] = useState(null);
  const [paused, setPaused] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [savedGameAvailable, setSavedGameAvailable] =
    useState(() => Boolean(localStorage.getItem(STORAGE_KEY)));

  const [crosshairOn, setCrosshairOn] = useState(true);
  const [symbolHighlightOn, setSymbolHighlightOn] =
    useState(true);
  const [errorCheckActive, setErrorCheckActive] =
    useState(true);
    const [mistakes, setMistakes] = useState(0);
    const [notesOn, setNotesOn] = useState(false);
const [notes, setNotes] = useState(
  Array.from({ length: 256 }, () => [])
);

  const [completionStats, setCompletionStats] =
    useState(DEFAULT_STATS);
    const [gameHistory, setGameHistory] = useState(() => {
      const savedHistory = localStorage.getItem("hexlerGameHistory");
      if (!savedHistory) return [];
      try {
        return JSON.parse(savedHistory);
      } catch {
        localStorage.removeItem("hexlerGameHistory");
        return [];
      }
    });

   // Load saved game and statistics.

  useEffect(() => {
    function handleDeveloperKey(event) {
      if (event.key.toLowerCase() === "h") {
        setScreen("home");
      }
    }

    window.addEventListener("keydown", handleDeveloperKey);

    return () => {
      window.removeEventListener(
        "keydown",
        handleDeveloperKey
      );
    };
  }, []);

  // Timer.
  useEffect(() => {
    if (
      screen !== "game" ||
      paused ||
      !puzzleData
    ) {
      return;
    }

    const timer = setInterval(() => {
      setElapsedSeconds((current) => current + 1);
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, [screen, paused, puzzleData]);

  // Automatically save the current game.
  useEffect(() => {
    if (
      screen !== "game" ||
      !puzzleData ||
      values.length === 0
    ) {
      return;
    }

    const savedGame = {
      puzzleData,
      values,
      selected,
      paused,
      elapsedSeconds,
      crosshairOn,
      symbolHighlightOn,
      errorCheckActive,
      mistakes,
    };

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(savedGame)
    );


  }, [
    screen,
    puzzleData,
    values,
    selected,
    paused,
    elapsedSeconds,
    crosshairOn,
    symbolHighlightOn,
    errorCheckActive,
    mistakes,
  ]);

  function startGame(difficulty = "Medium") {
  const newPuzzle = generatePuzzle(difficulty);

    setPuzzleData(newPuzzle);
    setValues([...newPuzzle.puzzle]);
    setSelected(null);
    setHoveredCell(null);
    setHoveredSymbol(null);
    setPaused(false);
    setElapsedSeconds(0);
    setMistakes(0);

    // Default assistance settings for Easy/Medium.
    setCrosshairOn(true);
    setSymbolHighlightOn(true);
    setErrorCheckActive(true);

    setSavedGameAvailable(true);
    setScreen("game");
  }

  function resumeGame() {
    const savedGame = localStorage.getItem(STORAGE_KEY);

    if (!savedGame) {
      return;
    }

    try {
      const game = JSON.parse(savedGame);

      setPuzzleData(game.puzzleData);
      setValues(game.values);
      setSelected(game.selected ?? null);
      setHoveredCell(null);
      setHoveredSymbol(null);
      setPaused(game.paused ?? false);
      setElapsedSeconds(game.elapsedSeconds ?? 0);
      setMistakes(game.mistakes ?? 0);

      setCrosshairOn(
        game.crosshairOn ?? true
      );

      setSymbolHighlightOn(
        game.symbolHighlightOn ?? true
      );

      setErrorCheckActive(
        game.errorCheckActive ?? true
      );

      setScreen("game");
    } catch {
      localStorage.removeItem(STORAGE_KEY);
      setSavedGameAvailable(false);
    }
  }

  function enterValue(value) {
  if (
    selected === null ||
    !puzzleData ||
    paused
  ) {
    return;
  }

  if (puzzleData.puzzle[selected] !== -1) {
    return;
  }

  if (notesOn) {
    setNotes((currentNotes) => {
      const updatedNotes = [...currentNotes];
      const cellNotes = [...updatedNotes[selected]];

      if (cellNotes.includes(value)) {
        updatedNotes[selected] = cellNotes.filter(
          (note) => note !== value
        );
      } else {
        updatedNotes[selected] = [
          ...cellNotes,
          value,
        ];
      }

      return updatedNotes;
    });

    return;
  }

  const newValues = [...values];
  newValues[selected] = value;

  if (value !== puzzleData.solution[selected]) {
    setMistakes((current) => current + 1);
  }

  handleValueChange(newValues);
}

  function eraseValue() {
    if (
      selected !== null &&
      puzzleData &&
      puzzleData.puzzle[selected] === -1 &&
      !paused
    ) {
      const newValues = [...values];
      newValues[selected] = -1;
      handleValueChange(newValues);
    }
  }

  function handleCellClick(index) {
    if (paused) {
      return;
    }

    // Error Check shortcut:
    // clicking a red incorrect entry deletes it.
    if (
      errorCheckActive &&
      puzzleData &&
      puzzleData.puzzle[index] === -1 &&
      values[index] !== -1 &&
      values[index] !== puzzleData.solution[index]
    ) {
      const newValues = [...values];
      newValues[index] = -1;
      setValues(newValues);
      setSelected(index);
      return;
    }

    setSelected(index);
  }

  function handleKeyDown(event) {
    if (paused) {
      return;
    }

    const key = event.key.toUpperCase();
    const value = SYMBOLS.indexOf(key);

    if (value !== -1) {
      enterValue(value);
      return;
    }

    if (
      event.key === "Backspace" ||
      event.key === "Delete"
    ) {
      eraseValue();
    }
  }

  function togglePause() {
    setPaused((current) => !current);
  }

  function formatTime(totalSeconds) {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return `${String(minutes).padStart(2, "0")}:${String(
      seconds
    ).padStart(2, "0")}`;
  }
  function getPlayerRating() {
    if (gameHistory.length === 0) {
      return "UNRATED";
    }

    const totalMistakes = gameHistory.reduce(
      (total, game) => total + game.mistakes,
      0
    );

    const averageMistakes =
      totalMistakes / gameHistory.length;

    if (averageMistakes === 0) {
      return "MASTER";
    }

    if (averageMistakes <= 2) {
      return "EXPERT";
    }

    if (averageMistakes <= 5) {
      return "ADVANCED";
    }

    if (averageMistakes <= 10) {
      return "SKILLED";
    }

    if (averageMistakes <= 20) {
      return "APPRENTICE";
    }

    return "NOVICE";
  }

  function isAssistanceEnabled() {
    return (
      puzzleData &&
      ["Easy", "Medium"].includes(
        puzzleData.difficulty
      )
    );
  }

  function getActiveCell() {
  return hoveredCell;
  }

  function isCellInCrosshair(index) {
    if (
      !crosshairOn ||
      !isAssistanceEnabled()
    ) {
      return false;
    }

    const activeCell = getActiveCell();

    if (activeCell === null) {
      return false;
    }

    const activeRow = Math.floor(activeCell / 16);
    const activeColumn = activeCell % 16;

    const row = Math.floor(index / 16);
    const column = index % 16;

    return (
      row === activeRow ||
      column === activeColumn
    );
  }

  function getHighlightedSymbol() {
    if (
      !symbolHighlightOn ||
      !isAssistanceEnabled()
    ) {
      return null;
    }

    if (hoveredSymbol !== null) {
      return hoveredSymbol;
    }

    const activeCell = getActiveCell();

    if (
      activeCell !== null &&
      values[activeCell] !== -1
    ) {
      return values[activeCell];
    }

    return null;
  }

  function isSymbolHighlighted(index, value) {
    if (value === -1) {
      return false;
    }

    const highlightedSymbol =
      getHighlightedSymbol();

    return (
      highlightedSymbol !== null &&
      value === highlightedSymbol
    );
  }

  function isIncorrect(index, value) {
    if (
      !errorCheckActive ||
      !puzzleData ||
      value === -1
    ) {
      return false;
    }

    if (puzzleData.puzzle[index] !== -1) {
      return false;
    }

    return value !== puzzleData.solution[index];
  }

  function checkForCompletion(currentValues) {
    if (
      !puzzleData ||
      currentValues.length !== 256
    ) {
      return;
    }

    const complete = currentValues.every(
      (value, index) =>
        value !== -1 &&
        value === puzzleData.solution[index]
    );

    if (!complete) {
      return;
    }

    const difficulty =
      puzzleData.difficulty;

    const newStats = {
      ...completionStats,
      [difficulty]:
        (completionStats[difficulty] || 0) + 1,
    };

    setCompletionStats(newStats);

    localStorage.setItem(
  STATS_KEY,
  JSON.stringify(newStats)
);

const completedGame = {
  difficulty,
  time: elapsedSeconds,
  mistakes,
  completedAt: new Date().toISOString(),
};

const updatedHistory = [
  ...gameHistory,
  completedGame,
];

setGameHistory(updatedHistory);

localStorage.setItem(
  "hexlerGameHistory",
  JSON.stringify(updatedHistory)
);

localStorage.removeItem(STORAGE_KEY);
    setSavedGameAvailable(false);

    setPaused(true);
    setScreen("complete");
  }

  function handleValueChange(newValues) {
    setValues(newValues);
    checkForCompletion(newValues);
  }

  function newGameFromCompletion() {
    startGame();
  }

  if (screen === "complete" && puzzleData) {
    return (
      <div className="app">
  
        <main className="completion-screen">
          <HexlerLogo size="large" />

          <div className="completion-title">
            PUZZLE COMPLETE
          </div>

          <div className="completion-difficulty">
            {puzzleData.difficulty}
          </div>

          <div className="completion-time">
            {formatTime(elapsedSeconds)}
          </div>

          <div className="completion-mistakes">
  Mistakes: {mistakes}
</div>
<div className="completion-rating">
  {getPlayerRating()}
</div>
          <div className="completion-message">
            Congratulations!
          </div>

          <div className="completion-stats">
            <div className="stats-title">
              PUZZLES COMPLETED
            </div>

            <div className="stats-grid">
              <div>
                <span>Easy</span>
                <strong>
                  {completionStats.Easy}
                </strong>
              </div>

              <div>
                <span>Medium</span>
                <strong>
                  {completionStats.Medium}
                </strong>
              </div>

              <div>
                <span>Hard</span>
                <strong>
                  {completionStats.Hard}
                </strong>
              </div>

              <div>
                <span>Expert</span>
                <strong>
                  {completionStats.Expert}
                </strong>
              </div>
            </div>
          </div>

          <button
            className="play-button"
            onClick={newGameFromCompletion}
          >
            NEW GAME
          </button>

          <button
            className="how-to-play"
            onClick={() => setScreen("home")}
          >
            BACK TO HOME
          </button>
        </main>
      </div>
    );
  }

  if (screen === "game" && puzzleData) {
    return (
      <div className="app">
        
        <main className="game-screen">
          <div className="game-header">
  <div className="game-header-left">
    <HexlerLogo size="small" />

    <div className="difficulty">
      {puzzleData.difficulty}
    </div>

    <div className="completed-count">
      {completionStats[puzzleData.difficulty] || 0} completed
    </div>
  </div>

  <div className="game-header-right">
    <div className="player-rating">
      {getPlayerRating()}
    </div>

    <div className="timer">
      {formatTime(elapsedSeconds)}
    </div>

    <div className="mistakes">
      Mistakes: {mistakes}
    </div>
  </div>
</div>

          <div className="game-layout">
            <div
              className={`board ${
                paused ? "board-paused" : ""
              }`}
              tabIndex="0"
              onKeyDown={handleKeyDown}
            >
              {values.map((value, index) => {
                const isGiven =
                  puzzleData.puzzle[index] !== -1;

                const isSelected =
                  selected === index;

                const isCrosshair =
                  isCellInCrosshair(index);

                const isSymbolMatch =
                  isSymbolHighlighted(
                    index,
                    value
                  );

                const isIncorrectCell =
                  isIncorrect(index, value);

                return (
                  <button
                    key={index}
                    className={`cell ${
                      isGiven ? "given" : "user"
                    } ${
                      isSelected
                        ? "selected"
                        : ""
                    } ${
                      isCrosshair
                        ? "crosshair"
                        : ""
                    } ${
                      isSymbolMatch
                        ? "symbol-match"
                        : ""
                    } ${
                      isIncorrectCell
                        ? "incorrect"
                        : ""
                    } ${
                      index % 4 === 3
                        ? "right-border"
                        : ""
                    } ${
                      Math.floor(index / 16) % 4 === 3
                        ? "bottom-border"
                        : ""
                    }`}
                    onMouseEnter={() => {
                      if (!paused) {
                        setHoveredCell(index);
                      }
                    }}
                    onMouseLeave={() => {
                      setHoveredCell(null);
                    }}
                    onClick={() => {
                      handleCellClick(index);
                    }}
                  >
                    {value === -1 ? (
  <div className="notes-grid">
    {notes[index].map((note) => (
      <span key={note} className="note">
        {SYMBOLS[note]}
      </span>
    ))}
  </div>
) : (
  SYMBOLS[value]
)}
                  </button>
                );
              })}

              {paused && (
                <div className="pause-overlay">
                  <div className="pause-message">
                    <div className="pause-title">
                      PAUSED
                    </div>

                    <div className="pause-time">
                      {formatTime(
                        elapsedSeconds
                      )}
                    </div>

                    <button
                      className="resume-button"
                      onClick={togglePause}
                    >
                      RESUME
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="game-controls">
              <div className="keypad">
                {SYMBOLS.split("").map(
                  (symbol, index) => (
                    <button
                      key={symbol}
                      className={`key ${
                        hoveredSymbol === index
                          ? "key-hovered"
                          : ""
                      }`}
                      onMouseEnter={() => {
                        if (!paused) {
                          setHoveredSymbol(index);
                        }
                      }}
                      onMouseLeave={() => {
                        setHoveredSymbol(null);
                      }}
                      onClick={() =>
                        enterValue(index)
                      }
                      disabled={paused}
                    >
                      {symbol}
                    </button>
                  )
                )}
              </div>

             <div className="control-row">
                <button
                  className={`control-button ${
                    crosshairOn
                      ? "active-control"
                      : ""
                  }`}
                  onClick={() =>
                    setCrosshairOn(
                      (current) => !current
                    )
                  }
                  disabled={paused}
                >
                  Crosshair:{" "}
                  {crosshairOn
                    ? "ON"
                    : "OFF"}
                </button>

                <button
                  className={`control-button ${
                    symbolHighlightOn
                      ? "active-control"
                      : ""
                  }`}
                  onClick={() =>
                    setSymbolHighlightOn(
                      (current) => !current
                    )
                  }
                  disabled={paused}
                >
                  Symbol:{" "}
                  {symbolHighlightOn
                    ? "ON"
                    : "OFF"}
                </button>
              </div>
 <div className="control-row">
                <button
                  className={`control-button ${
                    errorCheckActive
                      ? "active-control"
                      : ""
                  }`}
                  onClick={() =>
                    setErrorCheckActive(
                      (current) => !current
                    )
                  }
                  disabled={paused}
                >
                  Error Check:{" "}
                  {errorCheckActive
                    ? "ON"
                    : "OFF"}
                </button>

                <button
                  className={`control-button ${
                    notesOn
                      ? "active-control"
                      : ""
                  }`}
                  onClick={() =>
                    setNotesOn(
                      (current) => !current
                    )
                  }
                  disabled={paused}
                >
                  Notes:{" "}
                  {notesOn
                    ? "ON"
                    : "OFF"}
                </button>
              </div>

              <div className="control-row">
                <button
                  className="control-button"
                  onClick={() => {
                    eraseValue();
                  }}
                  disabled={paused}
                >
                  Erase
                </button>

                <button
                  className="control-button"
                  onClick={() => {
                    handleValueChange(
                      [...puzzleData.solution]
                    );
                  }}
                >
                  TEST COMPLETE
                </button>

                <button
                  className="control-button"
                  onClick={togglePause}
                >
                  {paused
                    ? "Resume"
                    : "Pause"}
                </button>
              </div>

              <div className="difficulty-row">
                <button
                  className={`control-button ${
                    puzzleData.difficulty === "Easy"
                      ? "active-control"
                      : ""
                  }`}
                  onClick={() => {
                    startGame("Easy");
                  }}
                  disabled={paused}
                >
                  Easy
                </button>

                <button
                  className={`control-button ${
                    puzzleData.difficulty === "Medium"
                      ? "active-control"
                      : ""
                  }`}
                  onClick={() => {
                    startGame("Medium");
                  }}
                  disabled={paused}
                >
                  Medium
                </button>

                <button
                  className={`control-button ${
                    puzzleData.difficulty === "Hard"
                      ? "active-control"
                      : ""
                  }`}
                  onClick={() => {
                    startGame("Hard");
                  }}
                  disabled={paused}
                >
                  Hard
                </button>

                <button
                  className={`control-button ${
                    puzzleData.difficulty === "Expert"
                      ? "active-control"
                      : ""
                  }`}
                  onClick={() => {
                    startGame("Expert");
                  }}
                  disabled={paused}
                >
                  Expert
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }
 if (screen === "howto") {
  return (
    <div className="app">
      
      <main className="how-to-screen">
        <HexlerLogo size="large" />

        <div className="how-to-title">
          HOW TO PLAY
        </div>

        <div className="how-to-content">

          <section>
            <h2>THE GOAL</h2>
            <p>
              Fill the entire 16×16 grid using the
              symbols 0–9 and A–F.
            </p>
          </section>

          <section>
            <h2>THE RULES</h2>
            <p>
              Every row must contain each symbol
              exactly once.
            </p>
            <p>
              Every column must contain each symbol
              exactly once.
            </p>
            <p>
              Every 4×4 block must contain each
              symbol exactly once.
            </p>
          </section>

<section>
  <h2>SEE IT IN ACTION</h2>

  <p>
    A solved HEXler board contains every symbol 0–F
    exactly once in every row, column, and 4×4 block.
  </p>

  <div className="example-board">
    {[
        "0123456789ABCDEF",
  "4567            ",
  "89ab            ",
  "Cdef            ",
  "1               ",
  "5               ",
  "9               ",
  "D               ",
  "2               ",
  "6               ",
  "A               ",
  "E               ",
  "3               ",
  "7               ",
  "B               ",
  "F               ",
    ].map((row, rowIndex) =>
      [...row].map((symbol, columnIndex) => (
        <div
          key={`${rowIndex}-${columnIndex}`}
          className={
            rowIndex === 0
              ? "example-cell example-row"
              : columnIndex === 0
              ? "example-cell example-column"
              : rowIndex < 4 && columnIndex < 4
              ? "example-cell example-block"
              : "example-cell"
          }
        >
          {symbol}
        </div>
      ))
    )}
  </div>

  <p className="example-caption">
    One complete row, one complete column, and one complete 4×4 block.
  </p>
</section>

          <section>
            <h2>MAKING A MOVE</h2>
            <p>
              Select an empty square and enter the
              symbol you think belongs there.
            </p>
            <p>
              Use the information already on the board
              to determine what can—and can't—go in
              each square.
            </p>
          </section>

          <section>
            <h2>NOTES</h2>
            <p>
              Not sure? Turn on Notes to pencil possible
              symbols into a square.
            </p>
            <p>
              Notes do not count as mistakes.
            </p>
          </section>

          <section>
            <h2>MISTAKES</h2>
            <p>
              HEXler keeps track of your mistakes.
            </p>
            <p>
              A mistake is counted whenever you enter
              a symbol that does not match the solution.
            </p>
            <p>
              Correct entries, erasing, and notes do not
              count as mistakes.
            </p>
          </section>

          <section>
            <h2>THE TIMER</h2>
            <p>
              The timer measures how long it takes you
              to solve the puzzle.
            </p>
            <p>
              Need a break? Press <strong>PAUSE</strong>.
              The timer stops while the game is paused.
            </p>
          </section>

        </div>

        <button
          className="how-to-play"
          onClick={() => setScreen("home")}
        >
          ← BACK TO HEXler
        </button>
      </main>
    </div>
  );
}
  return (
    <div className="app">
      
      <main className="home-screen">
        <HexlerLogo size="large" />

        <div className="tagline">
          The 16×16 Logic Puzzle
        </div>

        {savedGameAvailable && (
          <button
            className="play-button"
            onClick={resumeGame}
          >
            RESUME GAME
          </button>
        )}

        <button
          className={
            savedGameAvailable
              ? "how-to-play"
              : "play-button"
          }
          onClick={() => startGame()}
        >
          {savedGameAvailable
            ? "NEW GAME"
            : "PLAY"}
        </button>

        {!savedGameAvailable && (
  <button
    className="how-to-play"
    onClick={() => {
  console.log("HOW TO PLAY CLICKED");
  setScreen("howto");
}}
  >
    How to Play
  </button>
)}
      </main>
    </div>
  );
}

export default App;