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

function addBeam(map, index, realities) {
  if (map.has(index)) {
    map.set(index, map.get(index) + realities);
  } else {
    map.set(index, realities);
  }
}

async function run() {
  const lineIterator = processLineByLine();
  const input = (await Array.fromAsync(lineIterator)).map((line) =>
    line.split('')
  );
  const start = input[0].indexOf('S');

  let beams = new Map([[start, 1]]);

  for (let i = 1; i < input.length; i++) {
    console.log('===============', i);
    const nextBeams = new Map();
    for (const [index, realities] of beams) {
      if (input[i][index] === '^') {
        addBeam(nextBeams, index - 1, realities);
        addBeam(nextBeams, index + 1, realities);
      } else {
        addBeam(nextBeams, index, realities);
      }
    }
    beams = nextBeams;
  }

  console.log(beams);
  printResult([...beams].reduce((acc, [, realities]) => acc + realities, 0));
}

run();
