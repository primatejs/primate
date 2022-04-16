import {Test} from "debris";

const test = new Test();

test.case("verifies fields", async (assert, {mowgli}) => {
  mowgli.house_id = "1";
  await mowgli.verify();
  assert(mowgli.errors.house_id).equals("Must be a House");
});

export default test;
