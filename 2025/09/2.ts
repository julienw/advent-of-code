// @flow
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

async function run() {
  const lineIterator = processLineByLine();
  const input = (await Array.fromAsync(lineIterator)).map((line) =>
    line.split(',').map((v) => +v)
  );

  function area(indexA, indexB) {
    const a = input[indexA];
    const b = input[indexB];

    return (Math.abs(a[0] - b[0]) + 1) * (Math.abs(a[1] - b[1]) + 1);
  }

  const allPairs = [];
  // Map<x, Set<y>>
  const corners = new Map();
  // Map<x, Set<y>>
  const borders = new Map();
  const inputGreenOrRed = new Set();

  function addToMap(map, x, y) {
    if (map.has(x)) {
      map.get(x).add(y);
    } else {
      map.set(x, new Set([y]));
    }
  }

  function addToBorder(x, y) {
    addToMap(borders, x, y);
  }

  function addToCorner(x, y) {
    addToMap(corners, x, y);
  }

  function isBorder(x, y) {
    return borders.get(x)?.has(y);
  }

  function isGreenOrRed(x, y) {
    if (isBorder(x, y)) {
      return true;
    }

    // Otherwise look in all directions until the end of the grid or we find
  }

  // Contours
  let minX = +Infinity;
  let maxX = -Infinity;
  let minY = +Infinity;
  let maxY = -Infinity;

  for (let i = 0; i < input.length - 1; i++) {
    let [xa, ya] = input[i];
    let [xb, yb] = input[i + 1];

    if (i === 0) {
      addToCorner(xa, ya);
    }
    addToCorner(xb, yb);

    minX = Math.min(minX, xa, xb);
    maxX = Math.max(maxX, xa, xb);
    minY = Math.min(minY, ya, yb);
    maxY = Math.max(maxY, ya, yb);

    if (xa === xb) {
      if (yb < ya) {
        [yb, ya] = [ya, yb];
      }
      for (let y = ya; y <= yb; y++) {
        addToMap(xa, y);
      }
    } else if (ya === yb) {
      if (xb < xa) {
        [xb, xa] = [xa, xb];
      }
      for (let x = xa; x <= xb; x++) {
        addToBorder(x, ya);
      }
    } else {
      throw new Error('One of x or y must be equals', xa, xb, ya, yb);
    }
  }

  console.log(corners, borders, minX, maxX, minY, maxY);

  for (let i = 0; i < input.length; i++) {
    const [x, y] = input[i];
    if (isGreenOrRed(x, y)) {
      inputGreenOrRed.add(i);
    }
  }

  for (let i = 0; i < input.length - 1; i++) {
    for (let j = i + 1; j < input.length; j++) {
      allPairs.push({ a: i, b: j, area: area(i, j) });
    }
  }

  allPairs.sort(({ area: a }, { area: b }) => a - b);

  printResult(allPairs.at(-1));
}

run();
