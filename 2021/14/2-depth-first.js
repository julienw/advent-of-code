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

async function handleInput(lineIterator): Promise<{|
  template: string,
  rules: Map<string, string>,
|}> {
  let template = null;
  const rules = [];
  for await (const line of lineIterator) {
    if (!template) {
      template = line;
      continue;
    }

    if (!line) {
      continue;
    }

    rules.push(line.split(' -> '));
  }

  // $FlowIgnoreError
  const ruleMap: Map<string, string> = new Map(
    rules.map(([key, char]) => [key, char])
  );

  if (!template) {
    throw new Error('We found no template, the input looks incorrect!');
  }

  return { template, rules: ruleMap };
}

type Frequencies = Float64Array;

function polymerize(
  rules: Map<string, string>,
  pair: string,
  remainingSteps: number,
  charToIndexMap: Map<string, number>,
  frequencies: Frequencies
) {
  const newChar = rules.get(pair);
  frequencies[charToIndexMap.get(newChar)]++;

  if (remainingSteps > 1) {
    polymerize(
      rules,
      pair[0] + newChar,
      remainingSteps - 1,
      charToIndexMap,
      frequencies
    );
    polymerize(
      rules,
      newChar + pair[1],
      remainingSteps - 1,
      charToIndexMap,
      frequencies
    );
  }
}

function computeCharToIndexMap(template, rules): Map<string, number> {
  let index = 0;
  const result = new Map();
  for (const char of template) {
    if (!result.has(char)) {
      result.set(char, index++);
    }
  }

  for (const char of rules.values()) {
    if (!result.has(char)) {
      result.set(char, index++);
    }
  }

  return result;
}

async function run() {
  const lineIterator = processLineByLine();
  const { template, rules } = await handleInput(lineIterator);
  console.log(template);
  console.log(rules);

  const steps = +process.argv[2];
  if (!steps) {
    throw new Error('Please provide a parameter for the number of steps.');
  }
  const charToIndexMap = computeCharToIndexMap(template, rules);
  const frequencies = new Float64Array(charToIndexMap.size);

  frequencies[charToIndexMap.get(template[0])]++;
  for (let i = 0; i < template.length - 1; i++) {
    frequencies[charToIndexMap.get(template[i + 1])]++;

    polymerize(
      rules,
      template.slice(i, i + 2),
      steps,
      charToIndexMap,
      frequencies
    );
  }

  const minFrequency = Math.min(...frequencies);
  const maxFrequency = Math.max(...frequencies);
  printResult(maxFrequency - minFrequency);
}

run();
