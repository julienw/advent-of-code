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

/*
function bold(text: number | string) {
  return '\x1b[1m' + text + '\x1b[0m';
}
*/

function reverse(text: number | string) {
  return '\x1b[7m' + text + '\x1b[0m';
}

type Point = {| x: number, y: number |};
type Path = Array<Point>;
type GridCell = {|
  risk: number,
  visited: boolean,
  distance: number,
  parent: Point | null,
|};

function isPointEqual(a: Point, b: Point) {
  return a.x === b.x && a.y === b.y;
}

function enlarge(grid: number[][]) {
  for (const line of grid) {
    const initialLine = line.slice();
    [1, 2, 3, 4].forEach((toAdd) => {
      line.push(
        ...initialLine.map((risk) =>
          risk + toAdd > 9 ? risk + toAdd - 9 : risk + toAdd
        )
      );
    });
  }

  const initialGridLength = grid.length;
  [1, 2, 3, 4].forEach((toAdd) => {
    for (let i = 0; i < initialGridLength; i++) {
      const line = grid[i];
      grid.push(
        line.map((risk) => (risk + toAdd > 9 ? risk + toAdd - 9 : risk + toAdd))
      );
    }
  });
}

class RiskMap {
  grid: Array<Array<GridCell>>;
  size: {| width: number, height: number |};
  neighborsSortedByDistance: Array<Point> = [];

  constructor(grid) {
    enlarge(grid);
    this.grid = grid.map((line) =>
      line.map((risk) => ({
        risk,
        visited: false,
        distance: +Infinity,
        parent: null,
      }))
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

  getCell(point: Point) {
    return this.grid[point.y][point.x];
  }

  getNeighbors(point: Point) {
    const result = [];
    if (point.x > 0) {
      result.push({ ...point, x: point.x - 1 });
    }
    if (point.y > 0) {
      result.push({ ...point, y: point.y - 1 });
    }
    if (point.x < this.size.width - 1) {
      result.push({ ...point, x: point.x + 1 });
    }
    if (point.y < this.size.height - 1) {
      result.push({ ...point, y: point.y + 1 });
    }

    return result;
  }

  findBestPath(): Path {
    const start = { x: 0, y: 0 };
    const end = { x: this.size.width - 1, y: this.size.height - 1 };

    this.neighborsSortedByDistance.push(start);
    const startCell = this.getCell(start);
    startCell.distance = 0;

    while (
      this.neighborsSortedByDistance.length &&
      // $FlowIgnoreError[prop-missing]
      !isPointEqual(end, this.neighborsSortedByDistance.at(-1))
    ) {
      const point = this.neighborsSortedByDistance.pop();
      const cell = this.getCell(point);
      cell.visited = true;
      const neighborPoints = this.getNeighbors(point);
      for (const neighborPoint of neighborPoints) {
        const neighborCell = this.getCell(neighborPoint);
        if (neighborCell.visited) {
          continue;
        }

        if (!neighborCell.parent) {
          this.neighborsSortedByDistance.push(neighborPoint);
        }

        const newDistance = cell.distance + neighborCell.risk;
        if (newDistance < neighborCell.distance) {
          neighborCell.distance = newDistance;
          neighborCell.parent = point;
        }
      }
      this.neighborsSortedByDistance.sort(
        // Sort in reverse order, the last element has the most priority
        (pointA, pointB) =>
          this.getCell(pointB).distance - this.getCell(pointA).distance
      );
    }

    // Found the end!
    const cellEnd = this.getCell(end);
    const path = [end];
    let current = cellEnd;
    while (current.parent) {
      const parentPoint = current.parent;
      path.push(parentPoint);
      current = this.getCell(parentPoint);
    }
    return path.reverse();
  }

  countRiskForPath(path: Path) {
    return path.reduce((sum, point) => sum + this.getCell(point).risk, 0);
  }

  debug(path?: Path) {
    this.grid.forEach((line, y) => {
      line.forEach(({ risk }, x) => {
        const isPartOfPath = path?.some((point) =>
          isPointEqual(point, { x, y })
        );
        process.stdout.write(
          isPartOfPath
            ? reverse(String(risk).padStart(2))
            : String(risk).padStart(2)
        );
      });
      process.stdout.write('\n');
    });
  }
}

async function run() {
  const lineIterator = processLineByLine();

  const grid = await RiskMap.fromLineIterator(lineIterator);
  grid.debug();

  const path = grid.findBestPath();
  console.log(path);
  grid.debug(path);
  // $FlowIgnoreError[prop-missing]
  printResult(grid.getCell(path.at(-1)).distance);
}

run();
