import {Test} from "debris";

const test = new Test();

test.case("returns a Domain", (assert, {Field, House, DomainType}) => {
  const field = new Field("house_id", House);
  assert(field.custom).equals(DomainType);
});

test.case("returns a Storeable", (assert, {Field, Storeable}) => {
  const StoreableHouse = class extends Storeable {};
  const field = new Field("house_id", StoreableHouse);
  assert(field.custom).equals(StoreableHouse);
});

export default test;
