import {Test} from "debris";

const test = new Test();

test.for = ({map_entries}) => map_entries;

test.case("no params", (assert, map_entries) => {
  assert(map_entries()).equals({});
});

test.case("no first param", (assert, map_entries) => {
  assert(map_entries(undefined, (key, value) => [key, value])).equals({});
});

test.case("no second param", (assert, map_entries) => {
  assert(map_entries({"foo": 2})).equals({"foo": 2});
});

test.case("two params", (assert, map_entries) => {
  assert(map_entries({"foo": 2}, (key, value) => [key, value*value]))
    .equals({"foo": 4});
})

test.case("first param not object", (assert, map_entries) => {
  assert(() => map_entries(null)).throws("must be object");
});

test.case("second param not function", (assert, map_entries) => {
  assert(() => map_entries(undefined, null)).throws("must be function");
});

export default test;
