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

function splitIntoPositions(input) {
  return input.split(',');
}

function add(positions, startIndex) {
  const inputIndex1 = +positions[startIndex + 1];
  const inputIndex2 = +positions[startIndex + 2];
  const storeIndex = +positions[startIndex + 3];
  const input1 = +positions[inputIndex1];
  const input2 = +positions[inputIndex2];
  const result = input1 + input2;
  console.log(
    `Adding ${input1}(${inputIndex1}) to ${input2}(${inputIndex2}) gives ${result}(${storeIndex})`
  );
  positions[storeIndex] = result;
}

function multiply(positions, startIndex) {
  const inputIndex1 = +positions[startIndex + 1];
  const inputIndex2 = +positions[startIndex + 2];
  const storeIndex = +positions[startIndex + 3];
  const input1 = +positions[inputIndex1];
  const input2 = +positions[inputIndex2];
  const result = input1 * input2;
  console.log(
    `Multiplying ${input1}(${inputIndex1}) to ${input2}(${inputIndex2}) gives ${result}(${storeIndex})`
  );
  positions[storeIndex] = result;
}

function processOnePosition(positions, startIndex) {
  if (startIndex >= positions.length) {
    throw new Error(
      `Oops we don't have anymore input at position ${startIndex}`
    );
  }

  const opcode = +positions[startIndex];
  console.log(`Got opcode ${opcode}`);

  switch (opcode) {
    case 1:
      add(positions, startIndex);
      return true;
    case 2:
      multiply(positions, startIndex);
      return true;
    case 99:
      return false;
    default:
      throw new Error(`Invalid opcode ${opcode} at position ${startIndex}`);
  }
}

function printResult(result) {
  console.log(result);
}

function alterProgram(positions) {
  positions[1] = 12;
  positions[2] = 2;
}

function printFullState(positions) {
  console.log(positions.join(','));
}

async function run() {
  const lineIterator = processLineByLine();
  for await (const line of lineIterator) {
    // $FlowExpectError I know what I'm doing here
    const positions: Array<string | number> = splitIntoPositions(line);
    alterProgram(positions);

    let continueProgram = true;
    let index = 0;
    while (continueProgram) {
      continueProgram = processOnePosition(positions, index);
      index += 4;
    }

    printFullState(positions);
    printResult(positions[0]);
  }
}

run();
