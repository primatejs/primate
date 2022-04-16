import {Test} from "debris";

const test = new Test();

test.case("rejects like a normal promise", (assert, {EagerPromise}) => {
  assert(() => EagerPromise.reject({"message": 1})).throws(1);
});

export default test;
