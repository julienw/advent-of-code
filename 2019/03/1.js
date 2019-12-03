// @flow
// Pipe the input to this script to get the result

const readline = require('readline');
const assert = require('assert');

async function* processLineByLine() {
  const rl = readline.createInterface({
    input: process.stdin,
    crlfDelay: Infinity,
  });
  // Note: we use the crlfDelay option to recognize all instances of CR LF
  // ('\r\n') in input.txt as a single line break.

  yield* rl;
}

function manhattan(point1, point2) {
  return Math.abs(point2.x - point1.x) + Math.abs(point2.y - point1.y);
}

function findMaxCoordinates(wire) {
  const maxCoordinates = {
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  };

  const currentPoint = {
    x: 0,
    y: 0,
  };

  for (const { direction, distance } of wire) {
    switch (direction) {
      case 'R':
        currentPoint.x += distance;
        maxCoordinates.right = Math.max(maxCoordinates.right, currentPoint.x);
        break;
      case 'L':
        currentPoint.x -= distance;
        maxCoordinates.left = Math.min(maxCoordinates.left, currentPoint.x);
        break;
      case 'U':
        currentPoint.y += distance;
        maxCoordinates.top = Math.max(maxCoordinates.top, currentPoint.y);
        break;
      case 'D':
        currentPoint.y -= distance;
        maxCoordinates.bottom = Math.min(maxCoordinates.bottom, currentPoint.y);
        break;
      default:
        throw new Error(`Unknown direction ${direction}`);
    }
  }

  return maxCoordinates;
}

/**
 * This class hold sa grid in the form of a linear Uint8Array, where each
 * value's bit decomposition means wire number "bit" is here.
 * Then we can find all intersects by finding values that have more than 1 bit.
 */
class Grid {
  _size: {| width: number, height: number |};
  _grid: Uint8Array;
  _startingPoint: {| x: number, y: number |};
  constructor(size, startingPoint) {
    this._grid = new Uint8Array(size.width * size.height);
    this._size = size;
    this._startingPoint = { ...startingPoint };
  }

  writePoint(bit, point) {
    assert(point.x >= 0);
    assert(point.y >= 0);
    assert(point.x < this._size.width);
    assert(point.y < this._size.height);

    const index = point.y * this._size.width + point.x;

    this._grid[index] |= 1 << bit;
  }

  movePoint(point, direction) {
    switch (direction) {
      case 'R':
        point.x++;
        break;
      case 'D':
        point.y--;
        break;
      case 'L':
        point.x--;
        break;
      case 'U':
        point.y++;
        break;
      default:
        throw new Error(`Unknown direction ${direction}`);
    }
  }

  writeWireSegment(bit, currentPoint, direction, distance) {
    for (let i = 0; i < distance; i++) {
      this.movePoint(currentPoint, direction);
      this.writePoint(bit, currentPoint);
    }
  }

  writeWire(bit, wire) {
    const currentPoint = { ...this._startingPoint };

    for (const { direction, distance } of wire) {
      this.writeWireSegment(bit, currentPoint, direction, distance);
    }
  }

  extractIntersections() {
    let intersectIndex = -1;
    const allIntersects = [];
    while (true) {
      intersectIndex = this._grid.indexOf(3, intersectIndex + 1);
      if (intersectIndex === -1) {
        break;
      }
      allIntersects.push(intersectIndex);
    }

    return allIntersects.map(index => ({
      x: index % this._size.width,
      y: Math.floor(index / this._size.width),
    }));
  }

  toString() {
    const { width, height } = this._size;
    const lines = [];
    for (let y = 0; y < height; y++) {
      lines.push(this._grid.slice(y * width, (y + 1) * width).join(''));
    }

    return lines.reverse().join('\n');
  }
}

function findDimensionsAndCentralPort(wires) {
  const dimensions = {
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  };

  for (const wire of wires) {
    const maxCoordinates = findMaxCoordinates(wire);
    dimensions.left = Math.min(maxCoordinates.left, dimensions.left);
    dimensions.bottom = Math.min(maxCoordinates.bottom, dimensions.bottom);
    dimensions.top = Math.max(maxCoordinates.top, dimensions.top);
    dimensions.right = Math.max(maxCoordinates.right, dimensions.right);
  }

  // translate the central 0,0 point if necessary
  const translation = {
    x: -dimensions.left,
    y: -dimensions.bottom,
  };

  const centralPort = translation;
  dimensions.left += translation.x;
  dimensions.right += translation.x + 1;
  dimensions.top += translation.y + 1;
  dimensions.bottom += translation.y;

  return {
    dimensions,
    centralPort,
  };
}

function processInstruction(instruction) {
  const direction = instruction[0];
  const distance = +instruction.slice(1);
  return { direction, distance };
}

async function run() {
  const wires = [];
  for await (const line of processLineByLine()) {
    wires.push(line.split(',').map(processInstruction));
  }

  const { dimensions, centralPort } = findDimensionsAndCentralPort(wires);
  console.log(dimensions, centralPort);
  assert.equal(dimensions.left, 0);
  assert.equal(dimensions.bottom, 0);

  const grid = new Grid(
    { width: dimensions.right, height: dimensions.top },
    centralPort
  );

  wires.forEach((wire, i) => grid.writeWire(i, wire));

  //console.log(grid.toString());

  const intersects = grid.extractIntersections();
  console.log(intersects);
  const distances = intersects.map(intersect =>
    manhattan(intersect, centralPort)
  );
  console.log(distances);
  const minDistance = Math.min(...distances);
  console.log(minDistance);
}

run();