import {Test} from "debris";

const test = new Test();

test.case("deletes if _id found", async (assert, {baloo, Animal}) => {
  await baloo.save();
  const found_baloo = await Animal.one(baloo._id);
  assert(found_baloo._id).equals(baloo._id);
  await found_baloo.delete();
  const deleted_baloo = await Animal.one(baloo._id);
  assert(deleted_baloo).undefined();
});

export default test;
