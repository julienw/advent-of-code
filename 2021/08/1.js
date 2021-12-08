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

const NUMBER_TO_SEGMENT_BITS = [
  0b1110111, // 0: abc.efg
  0b0010010, // 1: ..c..f.
  0b1011101, // 2: a.cde.g
  0b1011011, // 3: a.cd.fg
  0b0111010, // 4: .bcd.f.
  0b1101011, // 5: ab.d.fg
  0b1101111, // 6: ab.defg
  0b1010010, // 7: a.c..f.
  0b1111111, // 8: abcdefg
  0b1111011, // 9: abcd.fg
];

const LENGTH_TO_NUMBER = new Map([
  [2, [1]],
  [3, [7]],
  [4, [4]],
  [5, [2, 3, 5]],
  [6, [0, 6, 9]],
  [7, [8]],
]);

const EASY_LENGTHS = [...LENGTH_TO_NUMBER.keys()].filter(
  (num) => LENGTH_TO_NUMBER.get(num)?.length === 1
);

async function run() {
  const lineIterator = processLineByLine();

  let count = 0;
  for await (const line of lineIterator) {
    const [inputs, outputs] = line
      .split(' | ')
      .map((entry) => entry.split(' '));

    for (const output of outputs) {
      if (EASY_LENGTHS.includes(output.length)) {
        count++;
      }
    }
  }

  printResult(count);
}

run();
