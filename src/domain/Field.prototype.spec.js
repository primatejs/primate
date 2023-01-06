import Field from "./Field.js";
import Storeable from "../types/Storeable.js";
import DomainType from "../types/Domain.js";

export default test => {
  test.case("custom: returns a Domain", (assert, {House}) => {
    const field = new Field("house_id", House);
    assert(field.custom).equals(DomainType);
  });

  test.case("custom: returns a Storeable", assert => {
    const StoreableHouse = class extends Storeable {};
    const field = new Field("house_id", StoreableHouse);
    assert(field.custom).equals(StoreableHouse);
  });

  test.case("serialize: builtins", assert => {
    const field = new Field("name", String);
    assert(field.serialize("Mowgli")).equals("Mowgli");
  });

  test.case("serialize: Domain", (assert, {Person}) => {
    const field = new Field("friend_id", Person);
    assert(field.serialize("1234")).equals("1234");
  });

  test.case("serialize: Storeable", (assert, {LocalHouse}) => {
    const field = new Field("house", LocalHouse);
    assert(field.serialize({name: "Jungle", location: "India"}))
      .equals("Jungle in India");
  });
};
