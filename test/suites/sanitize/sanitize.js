import {Test} from "debris";

const test = new Test();

test.for = ({sanitize}) => sanitize;

test.case("stringifies input", (assert, sanitize) => {
  const input = {"n": 0, "b": true};
  const output = {"n": "0", "b": "true"};
  assert(sanitize(input)).equals(output);
});

test.case("trims strings", (assert, sanitize) => {
  const input = {"key": " value "};
  const output = {"key": "value"};
  assert(sanitize(input)).equals(output);
});

test.case("removes empty strings", (assert, sanitize) => {
  const input = {"key": "value", "key2": ""};
  const output = {"key": "value"};
  assert(sanitize(input)).equals(output);
});

export default test;
