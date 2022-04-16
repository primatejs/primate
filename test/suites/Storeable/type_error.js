import {Test} from "debris";

const test = new Test();

test.case("builtins", (assert, {types}) => {
  for (const property of Object.keys(types)) {
    assert(types[property].type_error()).typeof("string");
  }
});

export default test;
