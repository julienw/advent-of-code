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

function toCommand(strCommand: string): 'forward' | 'up' | 'down' {
  switch (strCommand) {
    case 'forward':
    case 'up':
    case 'down':
      return strCommand;
    default:
      throw new Error(`Unknown command ${strCommand}`);
  }
}

async function collectCommands(input): Promise<CommandPair[]> {
  const result = [];
  for await (const line of input) {
    const [strCommand, strValue] = line.split(' ');
    const value = +strValue;
    const command = toCommand(strCommand);
    result.push({ command, value });
  }

  return result;
}
type CommandPair = {
  command: 'forward' | 'up' | 'down',
  value: number,
};

class State {
  vertical = 0;
  horizontal = 0;
  aim = 0;

  processCommand(commandPair: CommandPair) {
    switch (commandPair.command) {
      case 'forward':
        this.horizontal += commandPair.value;
        this.vertical += this.aim * commandPair.value;
        break;
      case 'up':
        // Careful: "up" decreases the depth!
        this.aim -= commandPair.value;
        break;
      case 'down':
        this.aim += commandPair.value;
        break;
      default:
        (commandPair.command: empty);
    }
  }
}

function printResult(result) {
  console.log(result);
}

async function run() {
  const state = new State();

  const lineIterator = processLineByLine();
  const commands = await collectCommands(lineIterator);
  let command;
  while ((command = commands.shift())) {
    state.processCommand(command);
  }

  printResult(state.vertical * state.horizontal);
}

run();
