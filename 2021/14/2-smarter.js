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

function* fromString(string) {
  for (let i = 0; i < string.length; i++) {
    yield string.charCodeAt(i);
  }
}

async function handleInput(lineIterator): Promise<{|
  template: Uint8Array,
  rules: Map<string, number>,
|}> {
  let template = null;
  const rules = [];
  for await (const line of lineIterator) {
    if (!template) {
      template = Uint8Array.from(fromString(line));
      continue;
    }

    if (!line) {
      continue;
    }

    rules.push(line.split(' -> '));
  }

  // $FlowIgnoreError
  const ruleMap: Map<string, number> = new Map(
    rules.map(([key, char]) => [key, char.charCodeAt(0)])
  );

  if (!template) {
    throw new Error('We found no template, the input looks incorrect!');
  }

  return { template, rules: ruleMap };
}
async function run() {
  const lineIterator = processLineByLine();
  const { template: initialTemplate, rules } = await handleInput(lineIterator);
  console.log(initialTemplate.join(''));
  console.log(rules);

  const steps = +process.argv[2];
  if (!steps) {
    throw new Error('Please provide a parameter for the number of steps.');
  }

  const finalLength = initialTemplate.length * 2 ** steps - 2 ** steps + 1;
  console.log('final length:', finalLength);
  const template = new Uint8Array(finalLength);
  template.set(initialTemplate);

  let currentLength = initialTemplate.length;

  for (let i = 0; i < steps; i++) {
    const newLength = currentLength * 2 - 1;
    template[newLength - 1] = template[currentLength - 1];

    for (let j = currentLength - 2; j >= 0; j--) {
      //console.log(template[j], template[j + 1]);
      const pair = String.fromCharCode(template[j], template[j + 1]);
      const insertedChar = rules.get(pair);
      if (!insertedChar) {
        throw new Error(`The pair ${pair} is unknown.`);
      }
      const newIndex = 2 * j;
      template[newIndex] = template[j];
      template[newIndex + 1] = insertedChar;
    }

    currentLength = newLength;
    console.log(i, '->', newLength);
    //console.log(template);
  }

  const frequencies = template.reduce((frequencies, charCode) => {
    const char = String.fromCharCode(charCode);
    if (!frequencies[char]) {
      frequencies[char] = 0;
    }
    frequencies[char]++;
    return frequencies;
  }, {});
  console.log(frequencies);
}

run();
