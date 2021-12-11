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

function printResult(result) {
  console.log(result);
}

function clear() {
  return '\x1bc';
}

function bold(text: number | string) {
  return '\x1b[1m' + text + '\x1b[0m';
}

type Point = {| x: number, y: number |};

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
    return `${point.x}/${point.y}`;
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

class EnergyMap {
  map: number[][];
  constructor(map) {
    this.map = map;
  }

  static async fromLineIterator(lineIterator): Promise<EnergyMap> {
    const result = [];
    for await (const line of lineIterator) {
      result.push(line.split('').map((val) => +val));
    }
    return new EnergyMap(result);
  }

  getHeightForPoint({ x, y }: Point): number {
    return this.map[y][x];
  }

  getAdjacentPointsToPoint({ x, y }: Point): Point[] {
    const xLength = this.map[0].length;
    const yLength = this.map.length;

    const possibleAdjacentPoints = [
      { x: x - 1, y },
      { x: x - 1, y: y - 1 },
      { x: x - 1, y: y + 1 },
      { x, y: y - 1 },
      { x, y: y + 1 },
      { x: x + 1, y },
      { x: x + 1, y: y - 1 },
      { x: x + 1, y: y + 1 },
    ];

    const result = possibleAdjacentPoints.filter(
      ({ x, y }) => x >= 0 && x < xLength && y >= 0 && y < yLength
    );

    return result;
  }

  handleNewStep() {
    const fullOfEnergy = new PointSet();

    // Part 1: increase by 1 all cells
    // Note all 10s while we're looping
    for (let y = 0; y < this.map.length; y++) {
      const line = this.map[y];
      for (let x = 0; x < line.length; x++) {
        line[x]++;
        if (line[x] > 9) {
          fullOfEnergy.add({ x, y });
        }
      }
    }

    let numberOfFlashingOctupuses = 0;
    // Part 2: loop to find all 10s
    while (true) {
      const nextValue = fullOfEnergy.values().next();
      if (nextValue.done) {
        break;
      }

      const flashingOctopus = nextValue.value;
      fullOfEnergy.delete(flashingOctopus);

      numberOfFlashingOctupuses++;

      // find adjacent octopuses and increase if necessary
      const adjacents = this.getAdjacentPointsToPoint(flashingOctopus);
      // but do not increase the ones that flashed before
      const octopusesToIncrease = adjacents.filter(
        ({ x, y }) => this.map[y][x] > 0
      );
      for (const { x, y } of octopusesToIncrease) {
        this.map[y][x]++;
        if (this.map[y][x] > 9) {
          fullOfEnergy.add({ x, y });
        }
      }
      // reset to 0
      this.map[flashingOctopus.y][flashingOctopus.x] = 0;
    }

    return numberOfFlashingOctupuses;
  }

  areAllFlashing(): boolean {
    return this.map.every((line) => line.every((energy) => energy === 0));
  }

  debug() {
    for (const line of this.map) {
      console.log(line.map((num) => (num === 0 ? bold(num) : num)).join(''));
    }
  }
}

async function run() {
  const lineIterator = processLineByLine();
  const map = await EnergyMap.fromLineIterator(lineIterator);

  map.debug();
  let step = 0;
  while (true) {
    step++;
    map.handleNewStep();
    console.log(clear());
    map.debug();
    await new Promise((resolve) => setTimeout(resolve, 100));
    if (map.areAllFlashing()) {
      break;
    }
  }
  printResult(step);
}

run();
