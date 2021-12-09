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

type Point = {| x: number, y: number |};

class PointSet implements Iterable<Point> {
  state: Map<string, Point> = new Map();

  constructor(initialValues: Iterable<Point>) {
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

class HeightMap {
  map: number[][];
  constructor(map) {
    this.map = map;
  }

  static async fromLineIterator(lineIterator): Promise<HeightMap> {
    const result = [];
    for await (const line of lineIterator) {
      result.push(line.split('').map((val) => +val));
    }
    return new HeightMap(result);
  }

  getHeightForPoint({ x, y }: Point): number {
    return this.map[y][x];
  }

  getAdjacentPointsToPoint(point: Point): Point[] {
    const result = [];
    if (point.x > 0) {
      result.push({ ...point, x: point.x - 1 });
    }
    if (point.y > 0) {
      result.push({ ...point, y: point.y - 1 });
    }
    if (point.x < this.map[0].length - 1) {
      result.push({ ...point, x: point.x + 1 });
    }
    if (point.y < this.map.length - 1) {
      result.push({ ...point, y: point.y + 1 });
    }

    return result;
  }

  findLowPoints(): Array<Point> {
    const result = [];

    for (let y = 0; y < this.map.length; y++) {
      const line = this.map[y];
      for (let x = 0; x < line.length; x++) {
        const thisHeight = line[x];
        const adjacentPoints = this.getAdjacentPointsToPoint({ x, y });
        const isLowerPoint = adjacentPoints.every(({ x, y }) => {
          const adjacentValue = this.map[y][x];
          return thisHeight < adjacentValue;
        });
        if (isLowerPoint) {
          result.push({ x, y });
        }
      }
    }
    return result;
  }

  findBasinForLowPoint(point: Point): PointSet {
    const result = new PointSet([point]);
    const queue = [point];
    while (queue.length) {
      const current = queue.pop();
      const newPoints = this.findAdjacentPointsPartOfBasin(current);
      if (newPoints.length) {
        queue.push(...newPoints);
        result.add(...newPoints);
      }
    }
    return result;
  }

  findAdjacentPointsPartOfBasin(point: Point): Point[] {
    // They are the points that move up from this point, except if it's 9.
    const height = this.getHeightForPoint(point);
    const adjacentPoints = this.getAdjacentPointsToPoint(point);
    return adjacentPoints.filter((point) => {
      const adjacentHeight = this.getHeightForPoint(point);
      return adjacentHeight !== 9 && adjacentHeight > height;
    });
  }
}

async function run() {
  const lineIterator = processLineByLine();
  const map = await HeightMap.fromLineIterator(lineIterator);
  console.log('map', map);
  const lowPoints = map.findLowPoints();
  console.log('lowpoints', lowPoints);
  const basins = lowPoints.map((point) => map.findBasinForLowPoint(point));
  console.log('basins', basins);
  const basinLengths = basins.map((basin) => basin.size).sort((a, b) => b - a);
  const result = basinLengths[0] * basinLengths[1] * basinLengths[2];
  printResult(result);
}

run();
