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

function findBestLocation(crabs: number[]): number {
  const min = Math.min(...crabs);
  const max = Math.max(...crabs);
  const fuelForMin = computeRequiredFuel(min, crabs);
  const fuelForMax = computeRequiredFuel(max, crabs);

  const currentMin = min;
  const currentMax = max;
  while (true) {
    const mid = Math.floor((currentMin + currentMax) / 2);
    const fuelForMid = computeRequiredFuel(mid);
  }
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
