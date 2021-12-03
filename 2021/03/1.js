// @flow
// Pipe the input to this script to get the result

const readline = require('readline');

type Bit = 0 | 1;

async function* processLineByLine() {
  const rl = readline.createInterface({
    input: process.stdin,
    crlfDelay: Infinity,
  });
  // Note: we use the crlfDelay option to recognize all instances of CR LF
  // ('\r\n') in input.txt as a single line break.

  yield* rl;
}

async function collectValues(input): Promise<string[]> {
  const result = [];
  for await (const line of input) {
    result.push(line);
  }

  return result;
}

/**
 * 100
 * 110
 * 011
 * =>
 * [
 *   [1,1,0],
 *   [0,1,1],
 *   [0,0,1],
 * ]
 */
function transposeBinaryValues(binaryValues: string[]): Bit[][] {
  if (!binaryValues.length) {
    throw new Error('no input');
  }

  const result = Array.from({ length: binaryValues[0].length }, () => []);

  for (const value of binaryValues) {
    for (let i = 0; i < value.length; i++) {
      const bit = +value[i];
      if (bit !== 0 && bit !== 1) {
        throw new Error(`Oops, bit is ${bit} and it's neither 0 or 1!`);
      }
      result[i].push(bit);
    }
  }

  return result;
}

/**
 * (Source:
 * 100
 * 110
 * 011)
 *
 * [
 *   [1,1,0],
 *   [0,1,1],
 *   [0,0,1],
 * ]
 * =>
 *
 * [
 *   [1, 2],   <= [ number of 0 in first column,  number of 1 in first column ]
 *   [1, 2],   <= [ number of 0 in second column, number of 1 in second column ]
 *   [2, 2]    <= [ number of 0 in third column,  number of 1 in third column ]
 * ]
 */
function computeFrequenciesInColumns(
  binaryValuesInColumns: Bit[][]
): Array<[number, number]> {
  return binaryValuesInColumns.map((column) => {
    const result = [0, 0];
    for (const bit of column) {
      result[bit]++;
    }

    return result;
  });
}

function getMostBitByColumnFromFrequencies(
  frequencies: Array<[number, number]>
): Bit[] {
  return frequencies.map((frequency) => (frequency[0] > frequency[1] ? 0 : 1));
}

function getLeastBitByColumnFromFrequencies(
  frequencies: Array<[number, number]>
): Bit[] {
  return frequencies.map((frequency) => (frequency[0] > frequency[1] ? 1 : 0));
}

function computeNumberFromBitArray(bitArray: Bit[]): number {
  const bitString = bitArray.join('');
  return parseInt(bitString, 2);
}

function printResult(result) {
  console.log(result);
}

async function run() {
  const lineIterator = processLineByLine();
  const binaryValues = await collectValues(lineIterator);
  const binaryValuesInColumns = transposeBinaryValues(binaryValues);
  const frequencies = computeFrequenciesInColumns(binaryValuesInColumns);
  const gamma = computeNumberFromBitArray(
    getMostBitByColumnFromFrequencies(frequencies)
  );
  const epsilon = computeNumberFromBitArray(
    getLeastBitByColumnFromFrequencies(frequencies)
  );
  printResult(gamma * epsilon);
}

run();
