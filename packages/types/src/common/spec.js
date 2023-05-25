export const reassert = (test, {type}) => {
  test.reassert(assert => ({
    match: (value, expected) => {
      assert(type(value)).equals(expected ?? value);
    },
    same: (...args) => args.map(arg => assert(type(arg)).equals(arg)),
    fail: (...args) => args.map(arg => assert(() => type(arg)).throws()),
  }));
};

export const basefail = fail => {
  fail(undefined, {}, null, [], 0, 0.5, 1, 1.5, "0", "1", "True", "False");
};

export const ifail = fail => {
  fail(undefined, true, {}, null, [], 1.1, "1n");
};

export const imatch = match => {
  match(0n, 0);
  match(-0n, -0);
  match(1n, 1);
  match(-1n, -1);
  match("1", 1);
  match("-1", -1);
};

export default test => {};
