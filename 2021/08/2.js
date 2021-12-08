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

function stringToSegmentBitmask(input: string): number {
  return Array.from(input).reduce((result, char) => {
    let mask;
    switch (char) {
      case 'a':
        mask = 0b1000000;
        break;
      case 'b':
        mask = 0b0100000;
        break;
      case 'c':
        mask = 0b0010000;
        break;
      case 'd':
        mask = 0b0001000;
        break;
      case 'e':
        mask = 0b0000100;
        break;
      case 'f':
        mask = 0b0000010;
        break;
      case 'g':
        mask = 0b0000001;
        break;
      default:
        throw new Error(`Unknown ${char}`);
    }
    return result | mask;
  }, 0);
}

function printResult(result) {
  console.log(result);
}

const NUMBER_TO_SEGMENT_BITS = [
  0b1110111, // 0: abc.efg
  0b0010010, // 1: ..c..f.
  0b1011101, // 2: a.cde.g
  0b1011011, // 3: a.cd.fg
  0b0111010, // 4: .bcd.f.
  0b1101011, // 5: ab.d.fg
  0b1101111, // 6: ab.defg
  0b1010010, // 7: a.c..f.
  0b1111111, // 8: abcdefg
  0b1111011, // 9: abcd.fg
];

const LENGTH_TO_NUMBER = new Map([
  [2, [1]],
  [3, [7]],
  [4, [4]],
  [5, [2, 3, 5]],
  [6, [0, 6, 9]],
  [7, [8]],
]);

async function run() {
  const lineIterator = processLineByLine();

  let count = 0;
  for await (const line of lineIterator) {
    const [inputs, outputs] = line
      .split(' | ')
      .map((entry) => entry.split(' '));

    const patternToDigit = new Map();
    const digitToPattern = new Map();

    const length5Patterns = [];
    const length6Patterns = [];
    // first pass: find easy numbers
    for (const input of inputs) {
      const bitmask = stringToSegmentBitmask(input);
      switch (input.length) {
        case 2:
          patternToDigit.set(bitmask, 1);
          digitToPattern.set(1, bitmask);
          break;
        case 3:
          patternToDigit.set(bitmask, 7);
          digitToPattern.set(7, bitmask);
          break;
        case 4:
          patternToDigit.set(bitmask, 4);
          digitToPattern.set(4, bitmask);
          break;
        case 7:
          patternToDigit.set(bitmask, 8);
          digitToPattern.set(8, bitmask);
          break;
        case 5:
          length5Patterns.push(bitmask);
          break;
        case 6:
          length6Patterns.push(bitmask);
          break;
        default:
          throw new Error(
            `Found unexpected ${input} with length ${input.length}`
          );
      }
    }

    // The digit 9 is the digit with length 6 that contains the digit 4
    const pattern9 = length6Patterns.find(
      (pattern) => (pattern | digitToPattern.get(4)) === pattern
    );
    patternToDigit.set(pattern9, 9);
    digitToPattern.set(9, pattern9);

    // The digit 0 is the digit with length 6 that contains the digit 1 but not
    // the digit 4
    const pattern0 = length6Patterns.find(
      (pattern) =>
        (pattern | digitToPattern.get(1)) === pattern &&
        (pattern | digitToPattern.get(4)) !== pattern
    );
    patternToDigit.set(pattern0, 0);
    digitToPattern.set(0, pattern0);

    // The digit 6 is the digit with length 6 that isn't one of the previous ones
    const pattern6 = length6Patterns.find(
      (pattern) => pattern !== pattern9 && pattern !== pattern0
    );
    patternToDigit.set(pattern6, 6);
    digitToPattern.set(6, pattern6);

    // The digit 3 is the digit with length 5 that contains the digit 1
    const pattern3 = length5Patterns.find(
      (pattern) => (pattern | digitToPattern.get(1)) === pattern
    );
    patternToDigit.set(pattern3, 3);
    digitToPattern.set(3, pattern3);

    // The digit 5 is the digit with length 5 that doesn't contain the same
    // segment that the digit 6 also doesn't have
    const missingSegmentIn6 = ~digitToPattern.get(6);
    const pattern5 = length5Patterns.find(
      (pattern) => (pattern & missingSegmentIn6) === 0
    );
    patternToDigit.set(pattern5, 5);
    digitToPattern.set(5, pattern5);

    // The digit 2 is the remaining one with length 5;
    const pattern2 = length5Patterns.find(
      (pattern) => pattern !== pattern5 && pattern !== pattern3
    );
    patternToDigit.set(pattern2, 2);
    digitToPattern.set(2, pattern2);

    console.log(patternToDigit);
    console.log(digitToPattern);

    //
    //
    // Find output
    const outputNumber = parseInt(
      outputs
        .map((output) => patternToDigit.get(stringToSegmentBitmask(output)))
        .join('')
    );
    console.log(outputNumber);
    count += outputNumber;
  }

  printResult(count);
}

run();
