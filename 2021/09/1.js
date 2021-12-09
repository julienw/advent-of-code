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

class Map {
  map: number[][];
  constructor(map) {
    this.map = map;
  }

  static async fromLineIterator(lineIterator): Promise<Map> {
    const result = [];
    for await (const line of lineIterator) {
      result.push(line.split('').map((val) => +val));
    }
    return new Map(result);
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
}

async function run() {
  const lineIterator = processLineByLine();
  const map = await Map.fromLineIterator(lineIterator);
  const lowPoints = map.findLowPoints();
  const result = lowPoints.reduce(
    (sum, point) => sum + map.getHeightForPoint(point) + 1,
    0
  );
  printResult(result);
}

run();
