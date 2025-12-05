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

function isInvalidNextMaybe(val) {
  console.log('<= isInvalid?', val);
  const str = String(val);
  outer: for (let l = 1; l <= str.length / 2; l++) {
    // Loop through all possible lengths of the repetitions
    const pattern = str.slice(0, l);
    console.log(l, pattern);

    for (let pos = l; pos < str.length; pos += l) {
      const nextSlice = str.slice(pos, pos + l);
      console.log('nextSlice', nextSlice, '!==', pattern);
      if (nextSlice !== pattern) {
        continue outer;
      }
    }

    console.log(`=> ${val} is invalid`);
    return true;
  }

  return false;
}

function isInvalid(val) {
  //console.log('<= isInvalid?', val);
  const str = String(val);
  if (str.length % 2 !== 0) {
    return false;
  }
  const pattern1 = str.slice(0, str.length / 2);
  const pattern2 = str.slice(str.length / 2);
  const isInvalid = pattern1 === pattern2;
  return isInvalid;
}

async function run() {
  const lineIterator = processLineByLine();
  const input = (await lineIterator.next()).value;
  const ranges = input.split(',').map((range) => range.split('-'));

  let result = BigInt(0);
  for (const [start, end] of ranges) {
    const bigStart = BigInt(start);
    const bigEnd = BigInt(end);
    for (let i = bigStart; i <= bigEnd; i++) {
      if (isInvalid(i)) {
        console.log(`=> ${i} is invalid`);
        result += i;
      }
    }
  }

  printResult(result);
}

run();
