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

function printResult(...args) {
  console.log(...args);
}

async function run() {
  const lineIterator = processLineByLine();

  let template = [];
  const rules = [];
  for await (const line of lineIterator) {
    if (!template.length) {
      template = Array.from(line);
      continue;
    }

    if (!line) {
      continue;
    }

    rules.push(line.split(' -> '));
  }

  // $FlowIgnoreError
  const ruleMap: Map<string, string> = new Map(rules);
  console.log(template.join(''));
  console.log(ruleMap);

  const STEPS = 10;
  for (let i = 0; i < STEPS; i++) {
    for (let j = template.length - 2; j >= 0; j--) {
      const pair = template[j] + template[j + 1];
      const insertedChar = ruleMap.get(pair);
      if (!insertedChar) {
        continue;
      }
      template.splice(j + 1, 0, insertedChar);
    }

    console.log(template.length);
  }

  const frequencies = template.reduce((frequencies, char) => {
    if (!frequencies[char]) {
      frequencies[char] = 0;
    }
    frequencies[char]++;
    return frequencies;
  }, {});

  console.log(frequencies);
}

run();
