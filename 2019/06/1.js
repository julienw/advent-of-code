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

type OrbitInformation = {|
  name: string,
  children: string[],
  orbits: string | null,
  depth: number | null,
|};

const objects: Map<string, OrbitInformation> = new Map();

function ensure(object) {
  if (object === null || object === undefined) {
    throw new Error(`object doesn't exist`);
  }
  return object;
}

function completeDepthInformation() {
  function completeDepthFor(name, depth) {
    const object = ensure(objects.get(name));
    object.depth = depth;
    object.children.forEach((child) => completeDepthFor(child, depth + 1));
  }

  // Start with 'COM'
  completeDepthFor('COM', 0);
}

function sum(...vals) {
  return vals.reduce((result, val) => result + val);
}

function countOrbits() {
  return sum(...[...objects.values()].map((object) => object.depth));
}

async function run() {
  const lineIterator = processLineByLine();
  for await (const line of lineIterator) {
    const [center, satellite] = line.split(')');
    let centerInfo = objects.get(center);
    if (!centerInfo) {
      centerInfo = {
        name: center,
        children: [],
        depth: null,
        orbits: null,
      };
      objects.set(center, centerInfo);
    }
    centerInfo.children.push(satellite);

    let satelliteInfo = objects.get(satellite);
    if (!satelliteInfo) {
      satelliteInfo = {
        name: satellite,
        children: [],
        depth: null,
        orbits: null,
      };
      objects.set(satellite, satelliteInfo);
    }
    satelliteInfo.orbits = center;
  }

  completeDepthInformation();

  const result = countOrbits();
  console.log(result);
}

run();
