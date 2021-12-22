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
|};

function inputToBitstr(input: string): string {
  return input.replaceAll('#', '1').replaceAll('.', '0');
}

function debug(grid) {
  console.log(grid.join('\n').replaceAll('0', '.').replaceAll('1', '#'), '\n');
}

function enhance(step: number, enhancement: string, grid: string[]): string[] {
  // We need to increase the size of the starting grid first, by adding 2 pixels
  // on each side.
  // If enhancement[0] is 0 everything is easy, and we can just add 0 pixels
  // around. But if enhancement[0] is 1, we need to alternatively add 1 or 0
  // (assuming that enhancement[511] is 0 ^^).

  const enlargedGrid = [];
  const enlargeChar = enhancement[0] === '0' ? '0' : String(step % 2);
  const emptyLine = enlargeChar.repeat(grid[0].length + 4);
  const padding = enlargeChar.repeat(2);
  enlargedGrid.push(emptyLine, emptyLine);
  for (let i = 0; i < grid.length; i++) {
    enlargedGrid.push(padding + grid[i] + padding);
  }
  enlargedGrid.push(emptyLine, emptyLine);

  debug(enlargedGrid);
  const enhancedGrid = [];
  for (let y = 1; y < enlargedGrid.length - 1; y++) {
    const newLine = [];
    for (let x = 1; x < enlargedGrid[0].length - 1; x++) {
      const bitStr =
        enlargedGrid[y - 1].slice(x - 1, x + 2) +
        enlargedGrid[y].slice(x - 1, x + 2) +
        enlargedGrid[y + 1].slice(x - 1, x + 2);
      const number = parseInt(bitStr, 2);
      const enhancedValue = enhancement[number];
      newLine.push(enhancedValue);
    }
    enhancedGrid.push(newLine.join(''));
  }
  return enhancedGrid;
}

async function run() {
  const lineIterator = processLineByLine();
  let enhancement: string | null = null; // 0 or 1
  let grid = [];

  for await (const line of lineIterator) {
    if (!enhancement) {
      enhancement = inputToBitstr(line);
      continue;
    }

    if (!line) {
      // empty line
      continue;
    }

    grid.push(inputToBitstr(line));
  }

  if (!enhancement) {
    throw new Error('Please feed some input to this script');
  }

  if (enhancement[0] === '1' && enhancement[511] === '1') {
    throw new Error(
      'The enhancement algorithm will light pixels everywhere and never remove them.'
    );
  }

  debug(grid);

  const enhanceSteps = 50;
  for (let i = 0; i < enhanceSteps; i++) {
    grid = enhance(i, enhancement, grid);
    debug(grid);
  }

  const strGrid = grid.join('\n');
  let result = 0;
  strGrid.replaceAll('1', () => (result++, '1'));

  printResult(result);
}

run();
