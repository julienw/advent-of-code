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

class PointSet implements Iterable<Point> {
  state: Map<string, Point> = new Map();

  constructor(initialValues?: Iterable<Point>) {
    if (initialValues) {
      for (const value of initialValues) {
        this.add(value);
      }
    }
  }

  _computeKeyForPoint(point: Point): string {
    return `${point.x}/${point.y}/${point.z}`;
  }

  add(point: Point, ...otherPoints: Point[]): this {
    this.state.set(this._computeKeyForPoint(point), point);
    for (const otherPoint of otherPoints) {
      this.state.set(this._computeKeyForPoint(otherPoint), otherPoint);
    }
    return this;
  }

  has(point: Point) {
    return this.state.has(this._computeKeyForPoint(point));
  }

  clear() {
    return this.state.clear();
  }

  delete(point: Point) {
    return this.state.delete(this._computeKeyForPoint(point));
  }

  values() {
    return this.state.values();
  }

  get size() {
    return this.state.size;
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
function parseInput(line): {|
  on: boolean,
  x1: number,
  x2: number,
  y1: number,
  y2: number,
  z1: number,
  z2: number,
|} {
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

function isInUsefulRange(start, end) {
  return start >= -50 && end <= 50;
}

async function run() {
  const lineIterator = processLineByLine();
  const pointSet = new PointSet();
  for await (const line of lineIterator) {
    const { on, x1, x2, y1, y2, z1, z2 } = parseInput(line);
    if (
      !isInUsefulRange(x1, x2) ||
      !isInUsefulRange(y1, y2) ||
      !isInUsefulRange(z1, z2)
    ) {
      continue;
    }
    for (let x = x1; x <= x2; x++) {
      for (let y = y1; y <= y2; y++) {
        for (let z = z1; z <= z2; z++) {
          if (on) {
            pointSet.add({ x, y, z });
          } else {
            pointSet.delete({ x, y, z });
          }
        }
      }
    }
  }
  printResult(pointSet.size);
}

run();
