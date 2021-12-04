// @flow
// Pipe the input to this script to get the result

const readline = require('readline');

async function* processLineByLine() {
  const rl = readline.createInterface({
    input: process.stdin,
    crlfDelay: Infinity,
  });
  // Note: we use the crlfDelay option to recognize all instances of CR LF
  // ('\r\n') in input.txt as a single line break.

  yield* rl;
}

class Board {
  numberToCoords: Array<{ x: number, y: number }>;
  picked: boolean[][];

  constructor(lines: string[]) {
    this.numberToCoords = [];
    this.picked = this._createPicked();

    let y = 0;
    for (const strLine of lines) {
      const line = strLine
        .split(/\s+/)
        .filter((val) => val.length)
        .map((val) => +val);
      line.forEach((number, x) => {
        this.numberToCoords[number] = { x, y };
      });
      y++;
    }
  }

  applyNumber(number) {
    const coords = this.numberToCoords[number];
    if (!coords) {
      return;
    }

    this.picked[coords.y][coords.x] = true;
  }

  isWin() {
    return this._isOneLineWin() || this._isOneColumnWin();
  }

  sumOfUnpicked() {
    return this.numberToCoords.reduce(
      (sum, { x, y }, val) => (this.picked[y][x] ? sum : sum + val),
      0
    );
  }

  _isOneLineWin() {
    return this.picked.some((line) => line.every((bool) => bool));
  }

  _isOneColumnWin() {
    column: for (let x = 0; x < 5; x++) {
      for (let y = 0; y < 5; y++) {
        if (!this.picked[y][x]) {
          // One value in this column is false => next column!
          continue column;
        }
      }
      // Looks like all values in this column are true!
      return true;
    }
    return false;
  }

  _createPicked(): boolean[][] {
    return Array.from({ length: 5 }, () =>
      Array.from({ length: 5 }, () => false)
    );
  }

  debug() {
    console.log(this.picked);
    console.log(this.numberToCoords);
  }
}

class State {
  previousNumber: number = -1;
  numbers: number[] = [];
  boards: Board[] = [];

  collectNumbers(strLine) {
    this.numbers = strLine.split(',').map((val) => +val);
  }

  collectBoard(lines: string[]) {
    this.boards.push(new Board(lines));
  }

  applyNextNumber() {
    const number = this.numbers.shift();
    if (number === undefined) {
      throw new Error('No more number!');
    }

    this.boards.forEach((board) => board.applyNumber(number));
    this.previousNumber = number;
  }

  isOneBoardWin():
    | {| hasOneWin: false |}
    | {| hasOneWin: true, winningBoard: number, score: number |} {
    for (let i = 0; i < this.boards.length; i++) {
      const board = this.boards[i];
      if (board.isWin()) {
        return {
          hasOneWin: true,
          winningBoard: i,
          score: board.sumOfUnpicked() * this.previousNumber,
        };
      }
    }

    return { hasOneWin: false };
  }

  debug() {
    console.log('previous number:', this.previousNumber);
    console.log('numbers:', this.numbers);
    console.log('boards:');
    this.boards.forEach((board, i) => {
      console.log(i);
      board.debug();
    });
  }
}

async function collectNumbersAndBoards(lineIterator) {
  const state = new State();
  let firstLine = true;
  const inputBoard = [];
  for await (const strLine of lineIterator) {
    if (firstLine) {
      state.collectNumbers(strLine);
      firstLine = false;
      continue;
    }

    if (/^ *$/.test(strLine)) {
      if (inputBoard.length) {
        state.collectBoard(inputBoard);
        inputBoard.length = 0;
      }
      continue;
    }

    inputBoard.push(strLine);
  }

  if (inputBoard.length) {
    state.collectBoard(inputBoard);
  }

  return state;
}

function printResult(result) {
  console.log(result);
}

async function run() {
  const lineIterator = processLineByLine();
  const state = await collectNumbersAndBoards(lineIterator);
  state.debug();

  while (true) {
    state.applyNextNumber();
    const result = state.isOneBoardWin();
    if (result.hasOneWin) {
      state.debug();
      printResult(result);
      break;
    }
  }
}

run();
