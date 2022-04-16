import {Test} from "debris";

const test = new Test();

test.case("accepts optional `document` argument", async (assert, fixtures) => {
  const {empty, mowgli} = fixtures;
  assert(await empty.name).undefined();
  assert(mowgli.name).equals("Mowgli");
});

export default test;
