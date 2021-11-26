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

function fetch(positions, index, mode) {
  return +mode === 0 ? +positions[+index] : +index;
}

function assertPosition(mode) {
  if (+mode === 1) {
    throw new Error(
      `Expected mode to be 'position', but was 'immediate' instead.`
    );
  }
}

function add(positions, startIndex, strModes) {
  const paramsSize = 3;
  const modes = Array.from(strModes.padStart(paramsSize, '0')).reverse();

  const inputIndex1 = +positions[startIndex + 1];
  const inputIndex2 = +positions[startIndex + 2];
  const storeIndex = +positions[startIndex + 3];

  const input1 = fetch(positions, inputIndex1, modes[0]);
  const input2 = fetch(positions, inputIndex2, modes[1]);
  const result = input1 + input2;
  //console.log(`Adding ${input1}(${inputIndex1}) to ${input2}(${inputIndex2}) gives ${result}(${storeIndex})`);
  assertPosition(modes[2]);
  positions[storeIndex] = result;
  return paramsSize + 1;
}

function multiply(positions, startIndex, strModes) {
  const paramsSize = 3;
  const modes = Array.from(strModes.padStart(paramsSize, '0')).reverse();

  const inputIndex1 = +positions[startIndex + 1];
  const inputIndex2 = +positions[startIndex + 2];
  const storeIndex = +positions[startIndex + 3];

  const input1 = fetch(positions, inputIndex1, modes[0]);
  const input2 = fetch(positions, inputIndex2, modes[1]);
  const result = input1 * input2;
  //console.log(`Multiplying ${input1}(${inputIndex1}) to ${input2}(${inputIndex2}) gives ${result}(${storeIndex})`);
  assertPosition(modes[2]);
  positions[storeIndex] = result;
  return paramsSize + 1;
}

function input(positions, index, strModes, inputs) {
  const paramsSize = 1;
  const modes = Array.from(strModes.padStart(paramsSize, '0')).reverse();

  const storeIndex = +positions[index + 1];

  assertPosition(modes[0]);
  positions[storeIndex] = inputs.shift();
  return paramsSize + 1;
}

function output(positions, index, strModes) {
  const paramsSize = 1;
  const modes = Array.from(strModes.padStart(paramsSize, '0')).reverse();

  const inputIndex = +positions[index + 1];

  const input = fetch(positions, inputIndex, modes[0]);
  console.log(input);
  return paramsSize + 1;
}

type OpcodeSize = number;
type Operation = (
  positions: Array<string | number>,
  index: number,
  modes: string,
  inputs: Array<string | number>
) => OpcodeSize;

type Opcode = '1' | '2' | '3' | '4';
const operations: { [opcode: Opcode]: Operation } = {
  '1': add,
  '2': multiply,
  '3': input,
  '4': output,
};

function processOnePosition(state) {
  const { index, positions, inputs } = state;
  if (index >= positions.length) {
    throw new Error(`Oops we don't have anymore input at position ${index}`);
  }

  const fullOpcode = positions[index];
  const opcode = +String(fullOpcode).slice(-2);
  const modes = String(fullOpcode).slice(0, -2);
  switch (opcode) {
    case 1:
    case 2:
    case 3:
    case 4:
      // $FlowExpectedError[incompatible-type] this works, I know!
      state.index += operations[String(opcode)](
        positions,
        index,
        modes,
        inputs
      );
      return true;
    case 99:
      return false;
    default:
      throw new Error(`Invalid opcode ${opcode} at position ${index}`);
  }
}

// This is used for debug only
// eslint-disable-next-line no-unused-vars
function printFullState(positions) {
  console.log(positions.join(','));
}

async function run() {
  const lineIterator = processLineByLine();
  const line = (await lineIterator.next()).value;
  if (!line) {
    throw new Error('No input!');
  }
  const program: string[] = splitIntoPositions(line);

  const positions: Array<string | number> = (program.slice(): any);

  let continueProgram = true;

  const state = {
    positions,
    index: 0,
    inputs: [1],
  };

  while (continueProgram) {
    continueProgram = processOnePosition(state);
  }

  //printFullState(positions);
}

run();
