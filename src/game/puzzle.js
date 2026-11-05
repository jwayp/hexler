const SIZE = 16;
const BOX = 4;
const CELL_COUNT = SIZE * SIZE;

export const SYMBOLS = "0123456789ABCDEF";

function shuffle(array) {
  const result = [...array];

  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
}

function pattern(row, column) {
  return (
    (row * BOX + Math.floor(row / BOX) + column) % SIZE
  );
}

function generateSolution() {
  const rowGroups = shuffle([0, 1, 2, 3]);
  const colGroups = shuffle([0, 1, 2, 3]);

  const rows = [];

  for (const group of rowGroups) {
    for (const row of shuffle([0, 1, 2, 3])) {
      rows.push(group * BOX + row);
    }
  }

  const columns = [];

  for (const group of colGroups) {
    for (const column of shuffle([0, 1, 2, 3])) {
      columns.push(group * BOX + column);
    }
  }

  const symbols = shuffle(
    Array.from({ length: SIZE }, (_, i) => i)
  );

  return rows.flatMap((row) =>
    columns.map(
      (column) => symbols[pattern(row, column)]
    )
  );
}

function getCandidates(grid, position) {
  const row = Math.floor(position / SIZE);
  const column = position % SIZE;

  const used = new Set();

  for (let i = 0; i < SIZE; i++) {
    const rowValue = grid[row * SIZE + i];
    const columnValue = grid[i * SIZE + column];

    if (rowValue !== -1) {
      used.add(rowValue);
    }

    if (columnValue !== -1) {
      used.add(columnValue);
    }
  }

  const boxRow = Math.floor(row / BOX) * BOX;
  const boxColumn = Math.floor(column / BOX) * BOX;

  for (let r = boxRow; r < boxRow + BOX; r++) {
    for (let c = boxColumn; c < boxColumn + BOX; c++) {
      const value = grid[r * SIZE + c];

      if (value !== -1) {
        used.add(value);
      }
    }
  }

  const candidates = [];

  for (let value = 0; value < SIZE; value++) {
    if (!used.has(value)) {
      candidates.push(value);
    }
  }

  return candidates;
}

function findBestEmptyCell(grid) {
  let bestPosition = -1;
  let bestCandidates = null;

  for (let position = 0; position < CELL_COUNT; position++) {
    if (grid[position] !== -1) {
      continue;
    }

    const candidates = getCandidates(grid, position);

    if (candidates.length === 0) {
      return {
        position: -1,
        candidates: [],
      };
    }

    if (
      bestCandidates === null ||
      candidates.length < bestCandidates.length
    ) {
      bestPosition = position;
      bestCandidates = candidates;

      if (candidates.length === 1) {
        break;
      }
    }
  }

  return {
    position: bestPosition,
    candidates: bestCandidates,
  };
}

function countSolutions(grid, limit = 2) {
  const result = findBestEmptyCell(grid);

  if (result.position === -1) {
    return result.candidates && result.candidates.length === 0
      ? 0
      : 1;
  }

  let count = 0;

  for (const value of shuffle(result.candidates)) {
    grid[result.position] = value;

    count += countSolutions(grid, limit - count);

    grid[result.position] = -1;

    if (count >= limit) {
      return count;
    }
  }

  return count;
}

function isUnique(grid) {
  return countSolutions([...grid], 2) === 1;
}

function createUniquePuzzle(solution, targetBlanks) {
  const puzzle = [...solution];

  const positions = shuffle(
    Array.from({ length: CELL_COUNT }, (_, i) => i)
  );

  let removed = 0;

  for (const position of positions) {
    if (removed >= targetBlanks) {
      break;
    }

    const originalValue = puzzle[position];

    puzzle[position] = -1;

    if (isUnique(puzzle)) {
      removed++;
    } else {
      puzzle[position] = originalValue;
    }
  }

  return {
    puzzle,
    removed,
  };
}

export function generatePuzzle(difficulty = "Medium") {
  const solution = generateSolution();

  const blankCounts = {
    Easy: 80,
    Medium: 110,
    Hard: 135,
    Expert: 140,
  };

  const targetBlanks =
    blankCounts[difficulty] || blankCounts.Medium;

  const result = createUniquePuzzle(
    solution,
    targetBlanks
  );

  return {
    solution,
    puzzle: result.puzzle,
    difficulty,
  };
}