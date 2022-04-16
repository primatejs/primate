import {Test} from "debris";

const test = new Test();

test.for = ({mowgli}) => mowgli;

test.case("builtin", async (assert, mowgli) => {
  await mowgli.verify();
  assert(mowgli.errors.name).undefined();
  delete mowgli.name;
  await mowgli.verify();
  assert(mowgli.errors.name).equals("Must not be empty");
});

test.case("with a parameter", async (assert, mowgli) => {
  await mowgli.verify();
  assert(mowgli.errors.name).undefined();
  mowgli.name = "Mowgli wolf-cub";
  await mowgli.verify();
  assert(mowgli.errors.name).equals("Must be 6 characters in length");
});

test.case("with n parameters", async (assert, mowgli) => {
  await mowgli.save();
  assert(mowgli.errors.likes).undefined();
  mowgli.likes = "The entire jungle";
  await mowgli.save();
  assert(mowgli.errors.likes)
    .equals("Must be between 5 and 8 characters in length");
});

export default test;
