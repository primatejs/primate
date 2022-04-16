import {Test} from "debris";

const test = new Test();

test.case("builtins", (assert, {Field}) => {
  const field = new Field("name", String);
  assert(field.serialize("Mowgli")).equals("Mowgli");
});

test.case("Domain", (assert, {Field, Person}) => {
  const field = new Field("friend_id", Person);
  assert(field.serialize("1234")).equals("1234");
});

test.case("Storeable", (assert, {Field, LocalHouse}) => {
  const field = new Field("house", LocalHouse);
  assert(field.serialize({"name": "Jungle", "location": "India"}))
    .equals("Jungle in India");
});

export default test;
