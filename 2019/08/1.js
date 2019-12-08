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

const WIDTH = 25;
const HEIGHT = 6;
const SIZE = WIDTH * HEIGHT;

function getLayer(array: $TypedArray, i) {
  return array.subarray(i * SIZE, (i + 1) * SIZE);
}

function countValueInArray(array: $TypedArray, needle) {
  return array.reduce(
    (result, val) => (val === needle ? result + 1 : result),
    0
  );
}

async function run() {
  const input = (await processLineByLine().next()).value;
  if (!input) {
    throw new Error(`Oops there's no input`);
  }

  const inputArray = Uint8Array.from((input: any));
  const layerCount = inputArray.length / SIZE;

  const zeroCounts = [];
  for (let i = 0; i < layerCount; i++) {
    const layer = getLayer(inputArray, i);
    const zeroCount = countValueInArray(layer, 0);
    zeroCounts.push(zeroCount);
  }

  const minZeroCount = Math.min(...zeroCounts);
  const minZeroCountLayerIndex = zeroCounts.indexOf(minZeroCount);
  const layerWithMinZero = getLayer(inputArray, minZeroCountLayerIndex);
  const oneCount = countValueInArray(layerWithMinZero, 1);
  const twoCount = countValueInArray(layerWithMinZero, 2);

  console.log(oneCount * twoCount);
}

run();
