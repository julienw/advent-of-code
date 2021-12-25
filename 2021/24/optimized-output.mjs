// @flow

function integerDiv(a, b) {
  const res = a / b;
  return res >= 0 ? Math.floor(res) : Math.ceil(res);
}

export function program(input: number[]): {|
  w: number,
  x: number,
  y: number,
  z: number,
|} {
  let w = 0;
  let x = 0;
  let y = 0;
  let z = 0;

  /* inp w */
  w = input.shift();
  if (w === undefined) {
    throw new Error('Not enough input!');
  }

  z = (w + 3) * 11;

  /* inp w */
  w = input.shift();
  if (w === undefined) {
    throw new Error('Not enough input!');
  }

  x = (z % 26) + 14;
  z *= 26;

  y = (w + 7) * x;
  z += y;

  /* inp w */
  w = input.shift();
  if (w === undefined) {
    throw new Error('Not enough input!');
  }

  x = (z % 26) + 13;
  z *= 26;

  y = (w + 1) * x;
  z += y;

  /* inp w */
  w = input.shift();
  if (w === undefined) {
    throw new Error('Not enough input!');
  }

  x = (z % 26) - 4;
  z = integerDiv(z, 26);

  if (x !== w) {
    z *= 26;
  }

  y = (w + 6) * x;
  z += y;

  w = input.shift();
  if (w === undefined) {
    throw new Error('Not enough input!');
  }

  x = (z % 26) + 11;
  if (x !== w) {
    z *= 26;
  }

  y = (w + 14) * x;
  z += y;

  /* inp w */
  w = input.shift();
  if (w === undefined) {
    throw new Error('Not enough input!');
  }

  x = (z % 26) + 10;
  if (x !== w) {
    z *= 26;
  }

  y = (w + 7) * x;
  z += y;

  /** input **/
  w = input.shift();
  if (w === undefined) {
    throw new Error('Not enough input!');
  }

  x = (z % 26) - 4;
  z = integerDiv(z, 26);

  if (x !== w) {
    z *= 26;
  }

  y = (w + 9) * x;
  z += y;

  /* inp w */
  w = input.shift();
  if (w === undefined) {
    throw new Error('Not enough input!');
  }

  x = (z % 26) - 12;
  z = integerDiv(z, 26);

  if (x !== w) {
    z *= 26;
  }

  y = (w + 9) * x;
  z += y;

  /* inp w */
  w = input.shift();
  if (w === undefined) {
    throw new Error('Not enough input!');
  }

  x = (z % 26) + 10;

  if (x !== w) {
    z *= 26;
  }

  y = (w + 6) * x;
  z += y;

  /* inp w */
  w = input.shift();
  if (w === undefined) {
    throw new Error('Not enough input!');
  }

  x = (z % 26) - 11;
  z = integerDiv(z, 26);

  if (x !== w) {
    z *= 26;
  }

  y = (w + 4) * x;
  z += y;

  /* inp w */
  w = input.shift();
  if (w === undefined) {
    throw new Error('Not enough input!');
  }

  x = (z % 26) + 12;

  if (x !== w) {
    z *= 26;
  }

  y = (w + 0) * x;
  z += y;

  /* inp w */
  w = input.shift();
  if (w === undefined) {
    throw new Error('Not enough input!');
  }

  x = (z % 26) - 1;
  z = integerDiv(z, 26);

  if (x !== w) {
    z *= 26;
  }

  y = (w + 7) * x;
  z += y;

  /* inp w */
  w = input.shift();
  if (w === undefined) {
    throw new Error('Not enough input!');
  }

  x = (z % 26) + 0;
  z = integerDiv(z, 26);

  if (x !== w) {
    z *= 26;
  }

  y = (w + 12) * x;
  z += y;

  /* inp w */
  w = input.shift();
  if (w === undefined) {
    throw new Error('Not enough input!');
  }

  x = (z % 26) - 11;
  z = integerDiv(z, 26);

  if (x !== w) {
    z *= 26;
  }

  y = (w + 1) * x;
  z += y;

  return { w, x, y, z };
}
