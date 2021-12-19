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

type Point = {|
  x: number,
  y: number,
  z: number,
|};

type Vector = {|
  tx: number,
  ty: number,
  tz: number,
|};

class Scanner {
  visibleBeacons: Array<Point> = [];

  addBeacon(beacon: Point) {
    this.visibleBeacons.push(beacon);
  }

  // This generates all possible views for this scanner
  *views(): Generator<Scanner, void, void> {
    // Original
    // x, y, z
    //
    // Rotating around x
    // x1 x, -z, y
    // x2 x, -y, -z
    // x3 x, z, -y
    //
    // Rotating around y
    // y1 -z, y, x
    // y2 -x, y, -z
    // y3 z, y, -x
    //
    // Rotating around z
    // z1 -y, x, z
    // z2 -x, -y, z
    // z3 y, -x, z
    //
    // First rotation around x + Rotation around y
    // x1+y1 -y, -z, x
    // x1+y2 -x, -z, -y
    // x1+y3 y, -z, -x
    //
    // First rotation around x + Rotation around z
    // x1+z1 z, x, y
    // x1+z2 -x, z, y
    // x1+z3 -z, -x, y
    //
    // Second rotation around x + Rotation around y
    // x2+y1 z, -y, x
    // x2+y2 -x, -y, z // dupe z2
    // x2+y3 -z, -y, -x
    //
    // Second rotation around x + Rotation around z
    // x2+z1 y, x, -z
    // x2+z2 -x, y, -z // dupe y2
    // x2+z3 -y, -x, -z
    //
    // Third rotation around x + Rotation around y
    // x3+y1 y, z, x
    // x3+y2 -x, z, y
    // x3+y3 -y, z, -x
    //
    // Third rotation around x + Rotation around z
    // x3+z1 -z, x, -y
    // x3+z2 -x, -z, -y
    // x3+z3 z, -x, -y
    //
    // And now the 3-rotation possibilities
    // x1+y1+z1 -y, -z, x => z, -y, x // dupe x2+y1 (means x1+z1 = x2, but this isn't the case)
    //
    //
  }

  debug() {
    for (const beacon of this.visibleBeacons) {
      console.log(beacon);
    }
  }
}

async function run() {
  const lineIterator = processLineByLine();
  const pointRe = /^(?<x>-?\d+),(?<y>-?\d+),(?<z>-?\d+)$/;
  const scannerStartRe = /^--- scanner/;

  const scanners: Scanner[] = [];
  let currentScanner: Scanner = new Scanner();
  for await (const line of lineIterator) {
    if (!line) {
      // empty line
      continue;
    }

    if (scannerStartRe.test(line)) {
      // new scanner
      currentScanner = new Scanner();
      scanners.push(currentScanner);
      continue;
    }

    const pointMatchResult = pointRe.exec(line);
    if (!pointMatchResult) {
      throw new Error(`Couldn't match the line: ${line}`);
    }

    // $FlowExpectedError
    const { x, y, z } = pointMatchResult.groups;
    currentScanner.addBeacon({ x: +x, y: +y, z: +z });
  }

  for (const scanner of scanners) {
    scanner.debug();
  }

  printResult(0);
}

run();
