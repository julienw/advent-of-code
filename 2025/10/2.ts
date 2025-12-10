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

// Return:
//  * 0 if equals
//  * 1 if at least one item of new is bigger than the same index in base
//  * -1 if all of new is smaller or equals than the same index in base
function compareArray(toCompare, base) {
  //  console.log('equalsArray', arr1, base);
  if (toCompare.length !== base.length) {
    throw new Error('toCompare and base have different length');
  }

  let allEqual = true;
  for (let i = 0; i < toCompare.length; i++) {
    if (toCompare[i] > base[i]) {
      return 1;
    }

    if (toCompare[i] !== base[i]) {
      allEqual = false;
    }
  }

  return allEqual ? 0 : -1;
}

function applyButton(state, button) {
  const newState = state.slice();
  for (const light of button) {
    newState[light] = newState[light] + 1;
  }

  //console.log('oldState', state, 'button', button, 'newState', newState);

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
        joltage = Uint8Array.from(item.slice(1, -1).split(','));
      }
    }
    return { diagram, buttons, joltage };
  });

  const presses = input.map((machine, i) => {
    console.log('starting machine', i);
    let presses = 0;
    let states = [new Uint8Array(machine.joltage.length)];

    outer: while (true) {
      presses++;

      const newStates = [];

      for (const oldState of states) {
        for (const button of machine.buttons) {
          const newState = applyButton(oldState, button);

          const compareResult = compareArray(newState, machine.joltage);
          if (compareResult === 0) {
            break outer;
          }

          if (compareResult < 0) {
            newStates.push(newState);
          }
        }
      }

      states = newStates;
    }

    return presses;
  });

  printResult(sum(presses));
}

run();
