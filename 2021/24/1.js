// @flow
// Pipe the input to this script to get the result

import { program } from './optimized-output';

function printResult(...args) {
  console.log(...args);
}

async function run() {
  out: for (let i = 9; i > 0; i--) {
    for (let j = 9; j > 0; j--) {
      for (let k = 9; k > 0; k--) {
        for (let l = 9; l > 0; l--) {
          for (let m = 9; m > 0; m--) {
            for (let n = 9; n > 0; n--) {
              for (let o = 9; o > 0; o--) {
                for (let p = 9; p > 0; p--) {
                  for (let q = 9; q > 0; q--) {
                    for (let r = 9; r > 0; r--) {
                      for (let s = 9; s > 0; s--) {
                        for (let t = 9; t > 0; t--) {
                          for (let u = 9; u > 0; u--) {
                            for (let v = 9; v > 0; v--) {
                              process.stdout.write(
                                [i, j, k, l, m, n, o, p, q, r, s, t, u, v].join(
                                  ''
                                )
                              );
                              const { z } = program([
                                i,
                                j,
                                k,
                                l,
                                m,
                                n,
                                o,
                                p,
                                q,
                                r,
                                s,
                                t,
                                u,
                                v,
                              ]);

                              process.stdout.write(' -> ' + z + '\n');
                              if (z === 0) {
                                break out;
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}

run();
