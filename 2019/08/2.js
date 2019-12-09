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

function printImage(array) {
  for (let i = 0; i < HEIGHT; i++) {
    console.log(
      array
        .slice(i * WIDTH, (i + 1) * WIDTH)
        .join('')
        .replace(/0/g, ' ')
        .replace(/1/g, '.')
    );
  }
}

async function run() {
  const input = (await processLineByLine().next()).value;
  if (!input) {
    throw new Error(`Oops there's no input`);
  }

  const inputArray = Uint8Array.from((input: any));
  const layerCount = inputArray.length / SIZE;

  const result = new Array(SIZE);
  for (let pixel = 0; pixel < SIZE; pixel++) {
    for (let i = 0; i < layerCount; i++) {
      const layer = getLayer(inputArray, i);
      if (layer[pixel] !== 2) {
        // Opaque pixel!
        result[pixel] = layer[pixel];
        break;
      }
      // it's transparent! continue to the next layer.
    }
  }

  printImage(result);
}

run();
