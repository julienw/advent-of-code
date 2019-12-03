# Advent of code 

This is about [this fun contest](https://adventofcode.com/), happening every year in
December.

In this directory there's a directory for each year. The first year is 2019
because... well :)

## Install dependencies

The code uses eslint, prettier and Flow to help with programming. I use `yarn`
to control dependencies. So this is how we install dependencies:
```
yarn
```

## How to run

All code takes input from the standard input. So if we want to use input from a
file, this is how we run it:

```
yarn babel-node 2019/03/1.js < /path/to/input
```

If you want to run the input directly from the advent of code website, we can
use curl, for example:
```
curl -H 'Cookie: session=<session_id>' https://adventofcode.com/2019/day/3/input | yarn babel-node 2019/03/1.js
```

Notes:
* I use `babel-node` because the JS files have Flow types that need to be
  removed so that node runs them.
* Because I use `yarn` to execute it from `.bin`, the current directory is
  always the repository root, that's why I use the relative path from the root
  to the script.
