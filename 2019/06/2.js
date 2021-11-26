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
  depth: number,
|};

const objects: Map<string, OrbitInformation> = new Map();

function ensure<T>(object: ?T): T {
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

function findCommonDepthBetweenYouAndSan(...yousan) {
  // Sort the objects so that the first one is always the closest to COM
  yousan.sort((obj1, obj2) => obj1.depth - obj2.depth);
  while (yousan[1].depth > yousan[0].depth) {
    const orbits = ensure(yousan[1].orbits);
    yousan[1] = ensure(objects.get(orbits));
  }

  while (yousan[0].orbits !== yousan[1].orbits) {
    yousan[0] = ensure(objects.get(ensure(yousan[0].orbits)));
    yousan[1] = ensure(objects.get(ensure(yousan[1].orbits)));
  }

  return yousan[0].depth;
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
        depth: (null: any), // this will be completed later
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
        depth: (null: any), // this will be completed later
        orbits: null,
      };
      objects.set(satellite, satelliteInfo);
    }
    satelliteInfo.orbits = center;
  }

  completeDepthInformation();
  const you = ensure(objects.get('YOU'));
  const san = ensure(objects.get('SAN'));
  const commonDepth = findCommonDepthBetweenYouAndSan(you, san);
  const result = you.depth - commonDepth + san.depth - commonDepth;
  console.log(result);
}

run();
