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

function printResult(...args) {
  console.log(...args);
}

const MOVE_RIGHT = 1;
const MOVE_DOWN = 2;
type GridValue = typeof MOVE_DOWN | typeof MOVE_RIGHT | 0;

class Grid {
  grid: Uint8Array = new Uint8Array(0);
  width: number = 0;
  height: number = 0;

  static fromSize({ width, height }: { width: number, height: number }): Grid {
    const grid = new Grid();
    grid.grid = new Uint8Array(width * height);
    grid.height = height;
    grid.width = width;
    return grid;
  }

  clone() {
    const grid = new Grid();
    grid.grid = new Uint8Array(this.grid);
    grid.height = this.height;
    grid.width = this.width;
    return grid;
  }

  set(x: number, y: number, val: GridValue) {
    this.grid[y * this.width + x] = val;
  }

  get(x: number, y: number): GridValue {
    return this.grid[y * this.width + x];
  }

  nextX(x: number): number {
    return (x + 1) % this.width;
  }

  nextY(y: number): number {
    return (y + 1) % this.height;
  }

  moveAllRightDirections(): boolean {
    let hasMoved = false;
    const newGrid = this.clone();
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        if (this.get(x, y) !== MOVE_RIGHT) {
          continue;
        }

        const nextX = this.nextX(x);
        if (this.get(nextX, y) !== 0) {
          continue;
        }
        newGrid.set(x, y, 0);
        newGrid.set(nextX, y, MOVE_RIGHT);
        x++; // the next x was already moved, we don't want to move it again
        hasMoved = true;
      }
    }
    this.grid = newGrid.grid;
    return hasMoved;
  }

  moveAllDownDirections(): boolean {
    let hasMoved = false;
    const newGrid = this.clone();
    for (let x = 0; x < this.width; x++) {
      for (let y = 0; y < this.height; y++) {
        if (this.get(x, y) !== MOVE_DOWN) {
          continue;
        }
        const nextY = this.nextY(y);
        if (this.get(x, nextY) !== 0) {
          continue;
        }

        newGrid.set(x, y, 0);
        newGrid.set(x, nextY, MOVE_DOWN);
        y++; // the next y was already moved, we don't want to move it again
        hasMoved = true;
      }
    }
    this.grid = newGrid.grid;
    return hasMoved;
  }

  debug() {
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        switch (this.get(x, y)) {
          case 0:
            process.stdout.write('.');
            break;
          case MOVE_RIGHT:
            process.stdout.write('>');
            break;
          case MOVE_DOWN:
            process.stdout.write('v');
            break;
          default:
            throw new Error(`Unexpected value!`);
        }
      }
      process.stdout.write('\n');
    }
  }
}

async function run() {
  const lineIterator = processLineByLine();
  const input = [];
  for await (const line of lineIterator) {
    input.push(line);
  }

  if (!input.length) {
    throw new Error('Please give me some input!');
  }

  const width = input[0].length;
  const height = input.length;

  const grid = Grid.fromSize({ width, height });
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      switch (input[y][x]) {
        case '.':
          // Nothing to do, as typed arrays initialize to 0
          break;
        case '>':
          grid.set(x, y, MOVE_RIGHT);
          break;
        case 'v':
          grid.set(x, y, MOVE_DOWN);
          break;
        default:
          throw new Error(`Unknown input char {${input[y][x]}}`);
      }
    }
  }

  // grid.debug();

  let hasMoved = true;
  let steps = 0;
  while (hasMoved) {
    steps++;
    hasMoved = grid.moveAllRightDirections();
    hasMoved = grid.moveAllDownDirections() || hasMoved;
    /*
    console.log('\n', steps);
    grid.debug();
    */
  }
  printResult(steps);
}

run();
