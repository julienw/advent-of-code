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

function sum(array) {
  return array.reduce((acc, val) => acc + +val, 0);
}

function equalsArray(arr1, arr2) {
  //console.log('equalsArray', arr1, arr2);
  if (arr1.length !== arr2.length) {
    return false;
  }

  for (let i = 0; i < arr1.length; i++) {
    if (arr1[i] !== arr2[i]) {
      return false;
    }
  }

  return true;
}

function applyButton(state, button) {
  const newState = state.slice();
  for (const light of button) {
    newState[light] = state[light] ? 0 : 1;
  }

  return newState;
}

async function run() {
  const lineIterator = processLineByLine();
  const input = (await Array.fromAsync(lineIterator)).map((line) => {
    const items = line.split(' ');
    let diagram;
    const buttons = [];
    let joltage;

    for (const item of items) {
      if (item.startsWith('[')) {
        diagram = Uint8Array.from(item.slice(1, -1), (char) =>
          char === '#' ? 1 : 0
        );
      }

      if (item.startsWith('(')) {
        buttons.push(item.slice(1, -1).split(','));
      }

      if (item.startsWith('{')) {
        joltage = item.slice(1, -1).split(',');
      }
    }
    return { diagram, buttons, joltage };
  });

  const presses = input.map((machine) => {
    let presses = 0;
    let states = [new Uint8Array(machine.diagram.length)];

    outer: while (true) {
      presses++;

      const newStates = [];

      for (const oldState of states) {
        for (const button of machine.buttons) {
          const newState = applyButton(oldState, button);
          if (equalsArray(newState, machine.diagram)) {
            break outer;
          }

          newStates.push(newState);
        }
      }

      states = newStates;
    }

    return presses;
  });

  printResult(sum(presses));
}

run();
