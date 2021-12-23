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

type Point = {| x: number, y: number, z: number |};
type PointRange = {|
  x1: number,
  y1: number,
  z1: number,
  x2: number,
  y2: number,
  z2: number,
|};
type Command = {| ...PointRange, on: boolean |};

class Grid implements Iterable<Point> {
  state: Array<Array<Uint8Array>>;
  xLength: number;
  yLength: number;
  zLength: number;

  constructor(xLength: number, yLength: number, zLength: number) {
    this.xLength = xLength;
    this.yLength = yLength;
    this.zLength = zLength;
    this.clear();
  }

  add({ x, y, z }: Point): this {
    this.state[x][y][z] = 1;
    return this;
  }

  has({ x, y, z }: Point) {
    return this.state[x][y][z] === 1;
  }

  clear() {
    this.state = Array.from({ length: this.xLength }, () =>
      Array.from({ length: this.yLength }, () => new Uint8Array(this.zLength))
    );
  }

  delete({ x, y, z }: Point) {
    this.state[x][y][z] = 0;
  }

  *values() {
    for (let x = 0; x < this.xLength; x++) {
      for (let y = 0; y < this.yLength; y++) {
        for (let z = 0; z < this.zLength; z++) {
          if (this.state[x][y][z]) {
            yield { x, y, z };
          }
        }
      }
    }
    return this.state.values();
  }

  // Because Flow doesn't understand Symbols and well-known symbols yet, we need
  // to resort to this hack to make it possible to implement the iterator.
  // See https://github.com/facebook/flow/issues/3258 for more information
  // and https://stackoverflow.com/questions/48491307/iterable-class-in-flow for
  // the solution used here.

  // $FlowFixMe ignore Flow error about computed properties in a class
  [Symbol.iterator]() {
    return this.values();
  }

  /*::
  @@iterator(): * {
    // $FlowFixMe ignore Flow error about Symbol support
    return this[Symbol.iterator]()
  }
  */
}

const inputRe =
  /^(?<on>on|off) x=(?<x1>-?\d+)..(?<x2>-?\d+),y=(?<y1>-?\d+)..(?<y2>-?\d+),z=(?<z1>-?\d+)..(?<z2>-?\d+)$/;
function parseInput(line): Command {
  const matchResult = inputRe.exec(line);
  if (!matchResult) {
    throw new Error(`Couldn't match the input line ${line}`);
  }

  // $FlowExpectedError[incompatible-use]
  const { on, x1, x2, y1, y2, z1, z2 } = matchResult.groups;

  return {
    on: on === 'on',
    x1: +x1,
    x2: +x2,
    y1: +y1,
    y2: +y2,
    z1: +z1,
    z2: +z2,
  };
}

async function run() {
  const lineIterator = processLineByLine();
  const commands: Command[] = [];
  for await (const line of lineIterator) {
    commands.push(parseInput(line));
  }

  // 1. As the first step, let's find out all planes where there will be start
  // or end of cubes.
  const cutLinesWithSet = commands.reduce(
    (cutLines, command) => {
      cutLines.x.add(command.x1);
      // Because the ends are incusive, the cut line is the next index.
      cutLines.x.add(command.x2 + 1);
      cutLines.y.add(command.y1);
      cutLines.y.add(command.y2 + 1);
      cutLines.z.add(command.z1);
      cutLines.z.add(command.z2 + 1);
      return cutLines;
    },
    { x: new Set(), y: new Set(), z: new Set() }
  );

  const fromSetToSortedArray = (set: Set<number>): number[] =>
    [...set].sort((a, b) => a - b);

  const cutLines = {
    x: fromSetToSortedArray(cutLinesWithSet.x),
    y: fromSetToSortedArray(cutLinesWithSet.y),
    z: fromSetToSortedArray(cutLinesWithSet.z),
  };

  const fromSortedArrayToMap = (sortedArray: number[]) =>
    new Map(sortedArray.map((val, idx) => [val, idx]));

  const cutLinesMap = {
    x: fromSortedArrayToMap(cutLines.x),
    y: fromSortedArrayToMap(cutLines.y),
    z: fromSortedArrayToMap(cutLines.z),
  };

  // 2. Process the commands
  const grid = new Grid(
    cutLines.x.length,
    cutLines.y.length,
    cutLines.z.length
  );
  for (const command of commands) {
    const { on, x1, x2, y1, y2, z1, z2 } = command;
    const { xi1, xi2, yi1, yi2, zi1, zi2 } = {
      xi1: cutLinesMap.x.get(x1) ?? 0,
      xi2: cutLinesMap.x.get(x2 + 1) ?? 0,
      yi1: cutLinesMap.y.get(y1) ?? 0,
      yi2: cutLinesMap.y.get(y2 + 1) ?? 0,
      zi1: cutLinesMap.z.get(z1) ?? 0,
      zi2: cutLinesMap.z.get(z2 + 1) ?? 0,
    };

    for (let x = xi1; x < xi2; x++) {
      for (let y = yi1; y < yi2; y++) {
        for (let z = zi1; z < zi2; z++) {
          if (on) {
            grid.add({ x, y, z });
          } else {
            grid.delete({ x, y, z });
          }
        }
      }
    }
  }

  // 3. Convert back from the big cubes to the real cubes
  let result = 0;
  for (const { x, y, z } of grid) {
    const x1 = cutLines.x[x];
    const x2 = cutLines.x[x + 1];
    const y1 = cutLines.y[y];
    const y2 = cutLines.y[y + 1];
    const z1 = cutLines.z[z];
    const z2 = cutLines.z[z + 1];

    result += (x2 - x1) * (y2 - y1) * (z2 - z1);
  }
  printResult(result);
}

run();
