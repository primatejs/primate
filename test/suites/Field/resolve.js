import {Test} from "debris";

const test = new Test();

test.for = ({"Field": {resolve}}) => ({resolve});

test.case("name required", (assert, {resolve}) => {
  assert(() => resolve()).throws("`name` required");
});

test.case("transient and optional false per default", (assert, {resolve}) => {
  const {options} = resolve("title");
  assert(options.optional).false();
  assert(options.transient).false();
});

test.case("resolve property name correctly", (assert, {resolve}) => {
  assert(resolve("?title").property).equals("title");
  assert(resolve("?~title").property).equals("title");
  assert(resolve("~?title").property).equals("title");
});

test.case("resolves optional correctly", (assert, {resolve}) => {
  assert(resolve("?title").options.optional).true();
  assert(resolve("?~title").options.optional).true();
  assert(resolve("~?title").options.optional).true();
});

test.case("resolves transient correctly", (assert, {resolve}) => {
  assert(resolve("~title").options.transient).true();
  assert(resolve("~?title").options.transient).true();
  assert(resolve("?~title").options.transient).true();
});

export default test;
