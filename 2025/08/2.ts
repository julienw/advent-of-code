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
    line.split(',')
  );

  function sqDistance(indexA, indexB) {
    const a = input[indexA];
    const b = input[indexB];

    return (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2;
  }

  const allPairs = [];
  for (let i = 0; i < input.length - 1; i++) {
    for (let j = i + 1; j < input.length; j++) {
      allPairs.push({ a: i, b: j, sqDistance: sqDistance(i, j) });
    }
  }

  allPairs.sort(({ sqDistance: dA }, { sqDistance: dB }) => dA - dB);

  const circuits = [];

  let result;
  for (const { a, b } of allPairs) {
    const circuitA = circuits.findIndex((circuit) => circuit.has(a));
    const circuitB = circuits.findIndex((circuit) => circuit.has(b));

    if (circuitA >= 0) {
      if (circuitB >= 0) {
        // Both circuits exist
        if (circuitA === circuitB) {
          // Both nodes are in the same circuit
          continue;
        }

        // Add all elements of B to A, and remove B
        for (const node of circuits[circuitB]) {
          circuits[circuitA].add(node);
        }
        circuits.splice(circuitB, 1);
      } else {
        // only A has a circuit
        circuits[circuitA].add(b);
      }
    } else if (circuitB >= 0) {
      circuits[circuitB].add(a);
    } else {
      circuits.push(new Set([a, b]));
    }

    if (circuits.length === 1 && circuits[0].size === input.length) {
      // Just one circuit with everything
      result = input[a][0] * input[b][0];
      break;
    }
  }

  printResult(result);
}

run();
