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
  const inputIndex1 = positions[startIndex + 1];
  const inputIndex2 = positions[startIndex + 2];
  const storeIndex = positions[startIndex + 3];
  const input1 = +positions[inputIndex1];
  const input2 = +positions[inputIndex2];
  const result = input1 + input2;
  //console.log(`Adding ${input1}(${inputIndex1}) to ${input2}(${inputIndex2}) gives ${result}(${storeIndex})`);
  positions[storeIndex] = result;
}

function multiply(positions, startIndex) {
  const inputIndex1 = positions[startIndex + 1];
  const inputIndex2 = positions[startIndex + 2];
  const storeIndex = positions[startIndex + 3];
  const input1 = +positions[inputIndex1];
  const input2 = +positions[inputIndex2];
  const result = input1 * input2;
  //console.log(`Multiplying ${input1}(${inputIndex1}) to ${input2}(${inputIndex2}) gives ${result}(${storeIndex})`);
  positions[storeIndex] = result;
}

function processOnePosition(positions, startIndex) {
  if (startIndex >= positions.length) {
    throw new Error(
      `Oops we don't have anymore input at position ${startIndex}`
    );
  }

  const opcode = +positions[startIndex];
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

function alterProgram(positions, noun, verb) {
  positions[1] = noun;
  positions[2] = verb;
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
  // $FlowExpectError I know what I'm doing
  const program: Array<string | number> = splitIntoPositions(line);
  const expectedResult = 19690720;

  for (let noun = 0; noun < 99; noun++) {
    for (let verb = 0; verb < 99; verb++) {
      try {
        const positions = program.slice();

        alterProgram(positions, noun, verb);

        let continueProgram = true;
        let index = 0;
        while (continueProgram) {
          continueProgram = processOnePosition(positions, index);
          index += 4;
        }

        //printFullState(positions);
        const result = positions[0];
        if (result === expectedResult) {
          console.log(noun, verb);
          process.exit(0);
        }
      } catch (e) {
        console.log('Got an error, continuing', e);
      }
    }
  }
}

run();
