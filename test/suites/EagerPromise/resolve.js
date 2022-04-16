import {Test} from "debris";

const test = new Test();

test.case("resolves like a normal promise", async (assert, {EagerPromise}) => {
  assert(await EagerPromise.resolve(1)).equals(1);
});

export default test;
