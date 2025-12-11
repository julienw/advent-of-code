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
  const nodes = new Map(
    (await Array.fromAsync(lineIterator)).map((line) => {
      const [source, destinations] = line.split(': ');

      return [source, { direct: destinations.split(' '), all: null }];
    })
  );

  function children(node, prev = new Set()) {
    if (node === 'out') {
      return new Set();
    }

    const nodeInfo = nodes.get(node);

    if (nodeInfo.all) {
      return nodeInfo.all;
    }

    prev.add(node);

    const all = new Set(nodeInfo.direct);
    for (const destination of nodeInfo.direct) {
      if (prev.has(destination)) {
        continue;
      }
      for (const child of children(destination, prev)) {
        all.add(child);
      }
    }
    nodeInfo.all = all;

    prev.delete(node);
    return all;
  }

  // Compute children
  children('svr');

  let paths = [{ path: new Set(['svr']), last: 'svr' }];

  let result = 0;
  while (paths.length) {
    const nextPaths = [];
    for (const { path, last } of paths) {
      const node = nodes.get(last);

      for (const next of node.direct) {
        if (path.has(next)) {
          // Loop
          continue;
        }
        if (next === 'out') {
          // Exit
          if (path.has('fft') && path.has('dac')) {
            result++;
          }
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
