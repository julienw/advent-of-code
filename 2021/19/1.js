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
    // Rotating around z towards the top   y
    // x, y, z (original)                  ↑
    // y, -x, z                            |
    // -x, -y, z                           o--> x
    // -y, x, z                           z
    //
    // Rotating around z towards the bottom  y   ( can be deduced from the previous one by negating x and z )
    // -x, y, -z                             ↑
    // y, x, -z                              |
    // x, -y, -z,                      -x <--.
    // -y, -x, -z,                            -z
    //
    // Rotating around y towards the top   x
    // z, x, y                             ↑
    // x, -z, y                            |
    // -z, -x, y                           o--> z
    // -x, z, y                           y
    //
    // Rotating around y towards the bottom     ( will be deduced )
    //
    // Rotating around x towards the top   z
    // y, z, x                             ↑
    // z, -y, x                            |
    // -y, -z, x                           o--> y
    // -z, y, x                           x
    //
    // Rotating around x towards the bottom     ( will be deduced )
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
