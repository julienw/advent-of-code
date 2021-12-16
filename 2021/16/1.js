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

type Packet = {|
  version: number,
  type: number,
  subpackets?: Packet[],
  value?: number,
|};

class PacketReader {
  binary: string;
  _i = 0;
  constructor(binary: string) {
    this.binary = binary;
  }

  get i() {
    return this._i;
  }

  set i(val) {
    if (val >= this.binary.length) {
      throw new Error('Oops, reached the end before this was expected!');
    }
    this._i = val;
  }

  readOnePacket(): Packet | null {
    if (this.i >= this.binary.length) {
      return null;
    }
    return this._doReadOnePacket();
  }

  _doReadOnePacket(): Packet {
    const version = parseInt(this.binary.slice(this.i, this.i + 3), 2);
    const type = parseInt(this.binary.slice(this.i + 3, this.i + 6), 2);
    this.i += 6;

    console.log(version, type);
    if (type === 4) {
      // This is a literal value
      let packetValue = 0;
      let firstBit;
      do {
        firstBit = this.binary[this.i++];
        const value = parseInt(this.binary.slice(this.i, this.i + 4), 2);
        this.i += 4;
        packetValue = (packetValue << 4) | value;
      } while (firstBit === '1');
      return {
        version,
        type,
        value: packetValue,
      };
    }

    // This is an operator
    const subpackets = [];
    const lengthTypeId = this.binary[this.i++];
    console.log('lengthtypeid', lengthTypeId);
    switch (lengthTypeId) {
      case '0': {
        const totalLength = parseInt(this.binary.slice(this.i, this.i + 15), 2);
        this.i += 15;

        const stopWhenI = this.i + totalLength;
        while (this.i < stopWhenI) {
          subpackets.push(this._doReadOnePacket());
        }
        break;
      }
      case '1': {
        const subPacketsCount = parseInt(
          this.binary.slice(this.i, this.i + 11),
          2
        );
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

function sumVersionsInPacket(packet: Packet): number {
  let sum = packet.version;
  for (const subpacket of packet.subpackets ?? []) {
    sum += sumVersionsInPacket(subpacket);
  }
  return sum;
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

  const sumOfVersions = sumVersionsInPacket(packet);
  printResult(sumOfVersions);
}

run();
