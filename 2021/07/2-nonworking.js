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

function collectInitialCrabs(line: string): number[] {
  return line.split(',').map((val) => +val);
}

// We want to minimize this function for the value n:
//
//  The fuel for this distance is the sum of an arithmetic suite.
//                 |
//                 v
//
//  l   (distance + 1) * distance
//  ∑   -------------------------
// i=1             2
//
// where
//   distance = | Ci - n |
//   l is the number of crabs
//   Ci is the position of the crab with the index i.
//
// After developing this, we see that we want to minimize
//
//  l           l                 l
//  ∑  Ci² + 2n ∑ Ci + kn²     +  ∑ distance
// i=1         i=1               i=1
//
// Because everything is positive, we only need to minimize each part
// separately.
// The last term is the median.
// For the first term we can derive the value and find when the derivate is 0,
// we get: n =
function findBestLocation(crabs: number[]): number {
  const k = crabs.length;
}

function computeRequiredFuelForDistance(distance: number): number {
  return ((distance + 1) * distance) / 2;
}

function computeRequiredFuel(location: number, crabs: number[]): number {
  return crabs.reduce(
    (result, crab) =>
      result + computeRequiredFuelForDistance(Math.abs(crab - location)),
    0
  );
}

function printResult(result) {
  console.log(result);
}

async function run() {
  const lineIterator = processLineByLine();
  const firstLine = (await lineIterator.next()).value;
  if (!firstLine) {
    throw new Error(`Ooops, there's no entry!`);
  }

  const initialCrabs = collectInitialCrabs(firstLine);
  console.log('crabs:', initialCrabs);
  const bestLocation = findBestLocation(initialCrabs);
  console.log('bestLocation:', bestLocation);
  const requiredFuel = computeRequiredFuel(bestLocation, initialCrabs);
  printResult(requiredFuel);
}

run();
