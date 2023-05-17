export const reassert = (test, type) => {
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

export default test => {};
