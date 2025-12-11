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
  const input = new Map(
    (await Array.fromAsync(lineIterator)).map((line) => {
      const [source, destinations] = line.split(': ');

      return [source, destinations.split(' ')];
    })
  );

  let paths = [{ path: new Set(['you']), last: 'you' }];

  let result = 0;
  while (paths.length) {
    const nextPaths = [];
    for (const { path, last } of paths) {
      const nexts = input.get(last);

      for (const next of nexts) {
        if (path.has(next)) {
          // Loop
          continue;
        }
        if (next === 'out') {
          // Exit
          result++;
          continue;
        }

        // continue exploring
        const nextPath = new Set(path);
        nextPath.add(next);
        nextPaths.push({ path: nextPath, last: next });
      }
    }

    paths = nextPaths;
  }
  printResult(result);
}

run();
