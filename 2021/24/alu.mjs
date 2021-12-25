// @flow

const parseProgramRe = /^(\w+) ([wxyz])(?: ([wxyz]|-?\d+))?$/;
export function parseProgram(program: string[]): {|
  sourceCode: string,
  func: (input: number[]) => {| w: number, x: number, y: number, z: number |},
|} {
  const sourceCodeStack = [
    `
    let w = 0;
    let x = 0;
    let y = 0;
    let z = 0;
  `,
  ];

  for (const line of program) {
    sourceCodeStack.push(`/* ${line} */`);
    const matchResult = parseProgramRe.exec(line);
    if (!matchResult) {
      throw new Error(
        `Parse error: couldn't match the regexp with line "${line}"`
      );
    }

    const [, opcode, a, b] = matchResult;

    switch (opcode) {
      case 'inp':
        sourceCodeStack.push(`
          {
            const temp = input.shift();
            if (temp === undefined) {
              throw new Error('Not enough input!');
            }
            ${a} = temp;
          }
        `);
        break;
      case 'add':
        sourceCodeStack.push(`${a} += ${b};`);
        break;
      case 'mul':
        sourceCodeStack.push(`${a} *= ${b};`);
        break;
      case 'div':
        sourceCodeStack.push(`
          {
            const temp = ${a} / ${b};
            ${a} = temp >= 0 ? Math.floor(temp) : Math.ceil(temp);
          }
        `);
        break;
      case 'mod':
        sourceCodeStack.push(`${a} %= ${b};`);
        break;
      case 'eql':
        sourceCodeStack.push(`${a} = ${a} === ${b} ? 1 : 0;`);
        break;
      default:
        throw new Error(`Parse error: unknown opcode ${opcode}`);
    }
  }

  sourceCodeStack.push(`return { w, x, y, z};`);

  const sourceCode = sourceCodeStack.join('\n');
  const func = new Function('input', sourceCode);

  return {
    sourceCode: `function program(input) {\n${sourceCode}\n}`,
    // $FlowIgnoreError[incompatible-exact]
    func,
  };
}
