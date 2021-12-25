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

class State {
  template: string;
  rules: Map<string, string>;
  charToIndexMap: Map<string, number>;
  // The key is a concatenaton of the pair and the remaining steps
  memoizedMap: Map<string, Frequencies> = new Map();

  constructor(template: string, rules: Map<string, string>) {
    this.template = template;
    this.rules = rules;
    this.charToIndexMap = this.computeCharToIndexMap();
  }

  computeCharToIndexMap(): Map<string, number> {
    let index = 0;
    const result = new Map();
    for (const char of this.template) {
      if (!result.has(char)) {
        result.set(char, index++);
      }
    }

    for (const char of this.rules.values()) {
      if (!result.has(char)) {
        result.set(char, index++);
      }
    }

    return result;
  }

  static async fromInputIterator(lineIterator) {
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

    return new State(template, ruleMap);
  }

  memoizedPolymerize(pair: string, remainingSteps: number): Frequencies {
    const memoizeKey = pair + remainingSteps;
    const maybeMemoizedResult = this.memoizedMap.get(memoizeKey);
    if (maybeMemoizedResult) {
      return maybeMemoizedResult;
    }

    const result = this.polymerize(pair, remainingSteps);
    this.memoizedMap.set(memoizeKey, result);
    return result;
  }

  polymerize(pair: string, remainingSteps: number): Frequencies {
    // $FlowIgnore[incompatible-type]
    const newChar: string = this.rules.get(pair);
    const frequencies = this.newFrequencies();
    frequencies[this.charToIndexMap.get(newChar)]++;

    if (remainingSteps > 1) {
      const freq1 = this.memoizedPolymerize(
        pair[0] + newChar,
        remainingSteps - 1
      );
      const freq2 = this.memoizedPolymerize(
        newChar + pair[1],
        remainingSteps - 1
      );
      this.mergeFrequencies(frequencies, freq1);
      this.mergeFrequencies(frequencies, freq2);
    }
    return frequencies;
  }

  computeFrequencies(steps: number) {
    const frequencies = this.newFrequencies();

    frequencies[this.charToIndexMap.get(this.template[0])]++;
    for (let i = 0; i < this.template.length - 1; i++) {
      frequencies[this.charToIndexMap.get(this.template[i + 1])]++;

      const moreFrequencies = this.memoizedPolymerize(
        this.template.slice(i, i + 2),
        steps
      );
      this.mergeFrequencies(frequencies, moreFrequencies);
    }

    return frequencies;
  }

  newFrequencies() {
    return new Float64Array(this.charToIndexMap.size);
  }

  mergeFrequencies(target, toMerge) {
    for (let i = 0; i < target.length; i++) {
      target[i] += toMerge[i];
    }
  }
}

type Frequencies = Float64Array;

async function run() {
  const lineIterator = processLineByLine();

  const state = await State.fromInputIterator(lineIterator);

  const steps = +process.argv[2];
  if (!steps) {
    throw new Error('Please provide a parameter for the number of steps.');
  }

  const frequencies = state.computeFrequencies(steps);

  const minFrequency = Math.min(...frequencies);
  const maxFrequency = Math.max(...frequencies);
  printResult(maxFrequency - minFrequency);
}

run();
