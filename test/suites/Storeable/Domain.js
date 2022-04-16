import {Test} from "debris";

const test = new Test();

test.case("is", async (assert, {DomainType, mowgli, Person, House}) => {
  await mowgli.save();
  assert(await DomainType.is(mowgli._id, Person)).true();
  mowgli.house_id = "1";
  assert(await DomainType.is(mowgli.house_id, House)).false();
});

export default test;
