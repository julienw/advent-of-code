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

function printGrid(grid) {
  for (const row of grid) {
    console.log(row.join(' '));
  }
}

async function run() {
  const lineIterator = processLineByLine();
  const grid = [];
  for await (const line of lineIterator) {
    const rolls = line.split('');
    grid.push(rolls);
  }

  printGrid(grid);

  const dimensions = { w: grid[0].length, h: grid.length };

  function isRoll(x, y) {
    return ['@', 'x'].includes(grid[y][x]);
  }

  function isAccessible(x, y) {
    const rangeX = [x - 1, x, x + 1].filter((x) => x >= 0 && x < dimensions.w);
    const rangeY = [y - 1, y, y + 1].filter((y) => y >= 0 && y < dimensions.h);
    //console.log(x, rangeX, y, rangeY);

    let count = 0;
    for (let adjY = 0; adjY < rangeY.length; adjY++) {
      for (let adjX = 0; adjX < rangeX.length; adjX++) {
        if (isRoll(rangeX[adjX], rangeY[adjY])) {
          count++;
          if (count > 4) {
            // it needs to be 5 including itself
            return false;
          }
        }
      }
    }
    return true;
  }

  let total = 0;
  let toRemove;
  do {
    toRemove = 0;
    for (let y = 0; y < dimensions.h; y++) {
      for (let x = 0; x < dimensions.w; x++) {
        if (isRoll(x, y) && isAccessible(x, y)) {
          grid[y][x] = 'x';
          toRemove++;
        }
      }
    }

    console.log();
    console.log(`Remove ${toRemove} rolls of paper`);
    printGrid(grid);

    for (const row of grid) {
      for (let x = 0; x < row.length; x++) {
        if (row[x] === 'x') {
          row[x] = '.';
        }
      }
    }
    total += toRemove;
  } while (toRemove);

  printResult(total);
}

run();
