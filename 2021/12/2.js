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

function printResult(result) {
  console.log(result);
}

function isSmallCave(name) {
  return !/[A-Z]/.test(name);
}

function isStartOrEnd(name) {
  return name === 'start' || name === 'end';
}

class CaveMap {
  map: Map<string, Set<string>> = new Map();

  getNode(node: string): Set<string> {
    let connections = this.map.get(node);
    if (!connections) {
      connections = new Set();
      this.map.set(node, connections);
    }
    return connections;
  }

  processInput(line: string) {
    const [a, b] = line.split('-');
    this.getNode(a).add(b);
    this.getNode(b).add(a);
  }

  findAllPathsFromStartToEnd() {
    let currentPaths: Array<{|
      path: string[],
      smallVisited: Set<string>,
      hasVisitedSmallTwice: boolean,
    |}> = [
      {
        path: ['start'],
        smallVisited: new Set(['start']),
        hasVisitedSmallTwice: false,
      },
    ];
    const result = [];

    while (currentPaths.length) {
      const newPaths = [];
      for (const { path, smallVisited, hasVisitedSmallTwice } of currentPaths) {
        // $FlowIgnoreError Flow doesn't know about the new at property
        const lastElement = path.at(-1);
        const connections = this.getNode(lastElement);
        for (const connection of connections) {
          let newHasVisitedSmallTwice = hasVisitedSmallTwice;
          if (smallVisited.has(connection)) {
            if (hasVisitedSmallTwice || isStartOrEnd(connection)) {
              continue;
            }
            newHasVisitedSmallTwice = true;
          }
          const newPath = [...path, connection];
          if (connection === 'end') {
            result.push(newPath);
          } else {
            let newSmallVisited = smallVisited;
            if (isSmallCave(connection)) {
              newSmallVisited = new Set(smallVisited);
              newSmallVisited.add(connection);
            }
            newPaths.push({
              path: newPath,
              smallVisited: newSmallVisited,
              hasVisitedSmallTwice: newHasVisitedSmallTwice,
            });
          }
        }
      }
      currentPaths = newPaths;
    }
    return result;
  }

  static async fromLineIterator(lineIterator) {
    const map = new CaveMap();
    for await (const line of lineIterator) {
      map.processInput(line);
    }
    return map;
  }

  debug() {
    console.log(this.map);
  }
}

async function run() {
  const lineIterator = processLineByLine();
  const map = await CaveMap.fromLineIterator(lineIterator);

  console.log('Map:');
  map.debug();

  const allPaths = map.findAllPathsFromStartToEnd();
  console.log(allPaths.map((path) => path.join(' -> ')));

  printResult(allPaths.length);
}

run();
