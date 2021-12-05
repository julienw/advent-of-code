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

//           xa      ya      xb      yb
type Vent = [number, number, number, number];
async function collectLines(lineIterator): Promise<Vent[]> {
  const result = [];
  for await (const line of lineIterator) {
    const ventMatch = line.match(/\d+/g);
    if (ventMatch === null) {
      throw new Error(`Couldn't match a vent in ${line}`);
    }
    if (ventMatch.length !== 4) {
      throw new Error(`Couldn't find 4 coords in ${line}`);
    }

    // $FlowFixMe[incompatible-call] .map fonctionne parce que /g est utilisé.
    const vent = ventMatch.map((val) => +val);
    result.push(vent);
  }
  return result;
}

type FieldSize = {| top: number, left: number, right: number, bottom: number |};
function findFieldSize(vents: Vent[]): FieldSize {
  let top = Infinity;
  let left = Infinity;
  let right = -Infinity;
  let bottom = -Infinity;

  for (const vent of vents) {
    left = Math.min(left, vent[0], vent[2]);
    right = Math.max(right, vent[0], vent[2]);
    top = Math.min(top, vent[1], vent[3]);
    bottom = Math.max(bottom, vent[1], vent[3]);
  }

  return { top, left, right, bottom };
}

class Field {
  ventStrengths: number[][] = [];

  _addOneInCell({ x, y }: { x: number, y: number }) {
    let fieldLine = this.ventStrengths[y];
    if (!fieldLine) {
      this.ventStrengths[y] = fieldLine = [];
    }
    fieldLine[x] = fieldLine[x] ? fieldLine[x] + 1 : 1;
  }

  _plotVerticalLine(x, y1, y2) {
    if (y1 > y2) {
      [y1, y2] = [y2, y1];
    }
    for (let y = y1; y <= y2; y++) {
      this._addOneInCell({ x, y });
    }
  }

  _plotHorizontalLine(x1, x2, y) {
    if (x1 > x2) {
      [x1, x2] = [x2, x1];
    }
    for (let x = x1; x <= x2; x++) {
      this._addOneInCell({ x, y });
    }
  }

  addVent(vent: Vent) {
    if (vent[0] === vent[2]) {
      // same X, vertical line
      this._plotVerticalLine(vent[0], vent[1], vent[3]);
    } else if (vent[1] === vent[3]) {
      // same Y, horizontal line
      this._plotHorizontalLine(vent[0], vent[2], vent[1]);
    }
  }

  addAllVents(vents: Vent[]) {
    for (const vent of vents) {
      this.addVent(vent);
    }
  }

  getStrongPoints() {
    return this.ventStrengths.reduce((count, line) => {
      const lineCount = line.reduce((count, point) => {
        const pointCount = point > 1 ? 1 : 0;
        return count + pointCount;
      }, 0);
      return count + lineCount;
    }, 0);
  }

  debug() {
    for (const line of this.ventStrengths) {
      if (!line) {
        console.log('.');
        continue;
      }
      for (const strength of line) {
        process.stdout.write(String(strength || '.'));
      }
      process.stdout.write('\n');
    }
  }
}

function printResult(result) {
  console.log(result);
}

async function run() {
  const lineIterator = processLineByLine();
  const vents = await collectLines(lineIterator);
  const field = new Field();
  field.addAllVents(vents);
  field.debug();
  printResult(field.getStrongPoints());
}

run();
