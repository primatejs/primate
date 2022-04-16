import {Test} from "debris";

const test = new Test();

test.case("works like a normal tag function", async (assert, {eager}) => {
  const name = "Mowgli";
  assert(await eager`${name}`).equals(`${name}`);
});

test.case("works with promises", async (assert, {eager}) => {
  const name = Promise.resolve("Mowgli");
  assert(await eager`${name}`).equals("Mowgli");
});

test.case("works with eager promises", async (assert, fixtures) => {
  const {eager, EagerPromise} = fixtures;
  const name = EagerPromise.resolve("Mowgli");
  assert(await eager`${name}`).equals("Mowgli");
});

test.case("works with eager promises via domains", async (assert, fixtures) => {
  const {eager, mowgli, jungle} = fixtures;
  await jungle.save();
  mowgli.house_id = jungle._id;
  await mowgli.save();
  assert(await eager`${mowgli.house.name}`).equals("Jungle");
});

test.case("works with nothing before", async (assert, fixtures) => {
  const {eager, mowgli, jungle} = fixtures;
  await jungle.save();
  await jungle.save();
  mowgli.house_id = jungle._id;
  await mowgli.save();
  assert(await eager`${mowgli.name} lives in ${mowgli.house.name} happily`)
    .equals("Mowgli lives in Jungle happily");
});

test.case("works with nothing after", async (assert, fixtures) => {
  const {eager, mowgli, jungle} = fixtures;
  await jungle.save();
  mowgli.house_id = jungle._id;
  await mowgli.save();
  assert(await eager`happily does ${mowgli.name} live in ${mowgli.house.name}`)
    .equals("happily does Mowgli live in Jungle");
});

export default test;
