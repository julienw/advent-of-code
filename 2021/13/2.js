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

class FoldablePaper {
  paper: boolean[][];

  constructor() {
    this.paper = [];
  }

  getOrCreateLine(y: number) {
    let line = this.paper[y];
    if (!line) {
      this.paper[y] = line = [];
    }
    return line;
  }

  addDot([x, y]) {
    this.getOrCreateLine(y)[x] = true;
  }

  fixLengths() {
    const maxLength = Math.max(
      ...this.paper.map((line) => line.length).filter((empty) => empty)
    );

    for (let y = 0; y < this.paper.length; y++) {
      const line = this.paper[y];
      if (line) {
        line.length = maxLength;
      } else {
        this.paper[y] = new Array(maxLength);
      }
    }
  }

  debug() {
    for (const line of this.paper) {
      for (const char of line || []) {
        process.stdout.write(char ? '#' : '.');
      }
      process.stdout.write('\n');
    }

    console.log(`--- ${this.countDots()} dots`);
  }

  countDots() {
    return this.paper.flat().length;
  }

  // Because Flow doesn't understand Symbols and well-known symbols yet, we need
  // to resort to this hack to make it possible to implement the iterator.
  // See https://github.com/facebook/flow/issues/3258 for more information
  // and https://stackoverflow.com/questions/48491307/iterable-class-in-flow for
  // the solution used here.

  // $FlowFixMe ignore Flow error about computed properties in a class
  *[Symbol.iterator]() {
    for (let y = 0; y < this.paper.length; y++) {
      const line = this.paper[y];
      for (let x = 0; x < line.length; x++) {
        if (line[x]) {
          yield [x, y];
        }
      }
    }
  }

  /*::
    @@iterator(): * {
      // $FlowFixMe ignore Flow error about Symbol support
      return this[Symbol.iterator]()
    }
    */
}

function foldVertically(paper: FoldablePaper, position: number): FoldablePaper {
  const newPaper = new FoldablePaper();
  for (const [x, y] of paper) {
    if (x < position) {
      newPaper.addDot([x, y]);
    } else if (x > position) {
      newPaper.addDot([2 * position - x, y]);
    }
  }

  newPaper.fixLengths();

  return newPaper;
}

function foldHorizontally(
  paper: FoldablePaper,
  position: number
): FoldablePaper {
  const newPaper = new FoldablePaper();
  for (const [x, y] of paper) {
    if (y < position) {
      newPaper.addDot([x, y]);
    } else if (y > position) {
      newPaper.addDot([x, 2 * position - y]);
    }
  }

  newPaper.fixLengths();

  return newPaper;
}

function fold(paper: FoldablePaper, { direction, position }): FoldablePaper {
  switch (direction) {
    case 'x':
      return foldVertically(paper, position);
    case 'y':
      return foldHorizontally(paper, position);
    default:
      (direction: empty);
      throw new Error(`Unknown direction ${direction}`);
  }
}

async function run() {
  const lineIterator = processLineByLine();

  let foldablePaper = new FoldablePaper();
  const instructions: Array<{ direction: 'x' | 'y', position: number }> = [];

  let inputState: 'paper' | 'instructions' = 'paper';
  for await (const line of lineIterator) {
    switch (inputState) {
      case 'paper':
        if (!line.length) {
          foldablePaper.fixLengths();
          inputState = 'instructions';
          continue;
        }
        foldablePaper.addDot(line.split(',').map((val) => +val));
        break;

      case 'instructions': {
        const matchResult =
          /^fold along (?<direction>x|y)=(?<position>\d+)/.exec(line);
        if (!matchResult) {
          throw new Error(`Couldn't match the line ${line}`);
        }
        instructions.push({
          // $FlowIgnoreError
          direction: matchResult.groups.direction,
          // $FlowIgnoreError
          position: +matchResult.groups.position,
        });
        break;
      }
      default:
        (inputState: empty);
        throw new Error(`Unknown state ${inputState}`);
    }
  }

  console.log('foldable paper:');
  //foldablePaper.debug();
  console.log('instructions');
  console.log(instructions);

  for (const instruction of instructions) {
    foldablePaper = fold(foldablePaper, instruction);
  }

  console.log('after folding:');
  foldablePaper.debug();
}

run();
