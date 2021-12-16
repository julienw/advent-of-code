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

function convertHexaToBinary(hexa: string): string {
  const huge = BigInt('0x' + hexa);
  return huge.toString(2).padStart(hexa.length * 4, 0);
}

type Packet =
  | {|
      version: number,
      type: 4,
      value: number,
    |}
  | {|
      version: number,
      type: 0 | 1 | 2 | 3 | 5 | 6 | 7,
      subpackets: Packet[],
    |};

class PacketReader {
  binary: string;
  i = 0;
  constructor(binary: string) {
    this.binary = binary;
  }

  readOnePacket(): Packet | null {
    if (this.i >= this.binary.length) {
      return null;
    }
    return this._doReadOnePacket();
  }

  _toValidType(inputType): 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 {
    switch (inputType) {
      case 0:
      case 1:
      case 2:
      case 3:
      case 4:
      case 5:
      case 6:
      case 7:
        return inputType;
      default:
        throw new Error(`Unknown input type ${inputType}`);
    }
  }

  _doReadOnePacket(): Packet {
    const strVersion = this.binary.slice(this.i, this.i + 3);
    const version = parseInt(strVersion, 2);
    console.log('version', version, strVersion);
    const strType = this.binary.slice(this.i + 3, this.i + 6);
    const type = this._toValidType(parseInt(strType, 2));
    console.log('type', type, strType);
    this.i += 6;

    if (type === 4) {
      // This is a literal value
      let packetValue = '';
      let firstBit;
      do {
        firstBit = this.binary[this.i++];
        const strValue = this.binary.slice(this.i, this.i + 4);
        console.log('value', strValue);
        this.i += 4;
        packetValue += strValue;
      } while (firstBit === '1');
      return {
        version,
        type,
        value: BigInt('0b' + packetValue),
      };
    }

    // This is an operator
    const subpackets = [];
    const lengthTypeId = this.binary[this.i++];
    console.log('lengthtypeid', lengthTypeId);
    switch (lengthTypeId) {
      case '0': {
        const strLength = this.binary.slice(this.i, this.i + 15);
        const totalLength = parseInt(strLength, 2);
        console.log('length', totalLength, strLength);
        this.i += 15;

        const stopWhenI = this.i + totalLength;
        while (this.i < stopWhenI) {
          subpackets.push(this._doReadOnePacket());
        }
        break;
      }
      case '1': {
        const strPacketsCount = this.binary.slice(this.i, this.i + 11);
        const subPacketsCount = parseInt(strPacketsCount, 2);
        console.log('packet count', subPacketsCount, strPacketsCount);
        this.i += 11;
        for (let i = 0; i < subPacketsCount; i++) {
          subpackets.push(this._doReadOnePacket());
        }
        break;
      }
      default:
        throw new Error(`Unknown lengthTypeId ${lengthTypeId}`);
    }

    return {
      version,
      type,
      subpackets,
    };
  }
}

const OPERATIONS: Array<(number[]) => number> = [
  // 0: sum
  (values) => values.reduce((a, b) => a + b),
  // 1: product
  (values) => values.reduce((a, b) => a * b),
  // 2: minimum
  (values) => values.reduce((min, a) => (min < a ? min : a)),
  // 3: maximum
  (values) => values.reduce((max, a) => (max > a ? max : a)),
  // 4: nothing
  () => 0,
  // 5: greater than
  ([a, b]) => (a > b ? 1n : 0n),
  // 6: less than
  ([a, b]) => (a < b ? 1n : 0n),
  // 7: equal
  ([a, b]) => (a === b ? 1n : 0n),
];

function computePacketValue(packet: Packet): number {
  if (packet.type === 4) {
    return packet.value;
  }

  const values = packet.subpackets.map((packet) => computePacketValue(packet));
  console.log(packet.type, values);
  return OPERATIONS[packet.type](values);
}

async function run() {
  const lineIterator = processLineByLine();

  const input = (await lineIterator.next()).value;
  if (!input) {
    throw new Error('no input found');
  }

  // Obviously highly unoptimized to use strings here, but this is a lot more
  // convenient!
  const inputAsBinary = convertHexaToBinary(input);
  console.log('input as binary', inputAsBinary);

  const reader = new PacketReader(inputAsBinary);
  const packet = reader.readOnePacket();
  console.dir(packet, { depth: null });

  if (!packet) {
    throw new Error('No packet found');
  }

  const packetValue = computePacketValue(packet);
  printResult(packetValue);
}

run();
