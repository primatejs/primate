import Field from "./Field.js";
import Storable from "../types/Storable.js";
import DomainType from "../types/Domain.js";

export default test => {
  test.case("custom: returns a Domain", (assert, {House}) => {
    const field = new Field("house_id", House);
    assert(field.custom).equals(DomainType);
  });

  test.case("custom: returns a Storable", assert => {
    const StorableHouse = class extends Storable {};
    const field = new Field("house_id", StorableHouse);
    assert(field.custom).equals(StorableHouse);
  });

  test.case("serialize: builtins", assert => {
    const field = new Field("name", String);
    assert(field.serialize("Mowgli")).equals("Mowgli");
  });

  test.case("serialize: Domain", (assert, {Person}) => {
    const field = new Field("friend_id", Person);
    assert(field.serialize("1234")).equals("1234");
  });

  test.case("serialize: Storable", (assert, {LocalHouse}) => {
    const field = new Field("house", LocalHouse);
    assert(field.serialize({name: "Jungle", location: "India"}))
      .equals("Jungle in India");
  });
};
