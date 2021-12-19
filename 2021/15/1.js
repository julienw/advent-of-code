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

function bold(text: number | string) {
  return '\x1b[1m' + text + '\x1b[0m';
}

function reverse(text: number | string) {
  return '\x1b[7m' + text + '\x1b[0m';
}

type Path = Array<{| x: number, y: number |}>;

class RiskMap {
  grid: Array<Array<{| risk: number, visited: boolean, distance: number |}>>;
  size: {| width: number, height: number |};

  constructor(grid) {
    this.grid = grid.map((line) =>
      line.map((risk) => ({ risk, visited: false, distance: +Infinity }))
    );

    this.size = {
      width: this.grid[0].length,
      height: this.grid.length,
    };
  }

  static async fromLineIterator(lineIterator) {
    const grid = [];
    for await (const line of lineIterator) {
      const gridLine = line.split('').map((val) => +val);
      grid.push(gridLine);
    }
    return new RiskMap(grid);
  }

  findBestPath(): Path {
    const start = { x: 0, y: 0 };
    const end = { x: this.size.width - 1, y: this.size.height - 1 };
  }

  countRiskForPath(path: Path) {
    return path.reduce(
      (sum, point) => sum + this.grid[point.y][point.x].risk,
      0
    );
  }

  debug() {
    for (const line of this.grid) {
      for (const { risk, visited } of line) {
        process.stdout.write(visited ? bold(risk) : String(risk));
      }
      process.stdout.write('\n');
    }
  }
}

async function run() {
  const lineIterator = processLineByLine();

  const grid = await RiskMap.fromLineIterator(lineIterator);
  grid.debug();

  const path = grid.findBestPath();
  printResult(grid.countRiskForPath(path));
}

run();
