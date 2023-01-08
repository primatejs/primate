import * as types from "./types.js";

import Storable from "./Storable.js";
import DomainType from "./Domain.js";

const {NumberType, BooleanType} = types;
const coercible = {BooleanType, NumberType};
const coercions = [
  {type: NumberType, from: "999", to: 999},
  {type: NumberType, from: "+999", to: 999},
  {type: NumberType, from: "999.", to: 999},
  {type: NumberType, from: ".999", to: 0.999},
  {type: NumberType, from: "+999.", to: 999},
  {type: NumberType, from: "+.999", to: 0.999},
  {type: NumberType, from: "-999.", to: -999},
  {type: NumberType, from: "-.999", to: -0.999},
  {type: NumberType, from: "0", to: 0},
  {type: NumberType, from: "-0", to: 0},
  {type: NumberType, from: "+0", to: 0},
  {type: NumberType, from: "0888", to: 888},
  {type: NumberType, from: "0777", to: 777},
  {type: NumberType, from: "0.125", to: 0.125},
  {type: NumberType, from: "+0.125", to: 0.125},
  {type: NumberType, from: "-0.125", to: -0.125},
  {type: NumberType, from: "0b101", to: 5},
  {type: NumberType, from: "0B101", to: 5},
  {type: NumberType, from: "0o13", to: 11},
  {type: NumberType, from: "0x0A", to: 10},
  {type: NumberType, from: "0x0a", to: 10},
  {type: NumberType, from: "0xA", to: 10},
  {type: NumberType, from: "12.00", to: 12},
  {type: NumberType, from: "123e-1", to: 12.3},
  {type: NumberType, from: "123E-1", to: 12.3},
  {type: NumberType, from: "0.1e3", to: 100},
  {type: BooleanType, from: "true", to: true},
  {type: BooleanType, from: "false", to: false},
];
const non_coercions = [
  {type: BooleanType, in: [true, false, "string", 0, {}, []]},
  {type: NumberType, in: ["", "0,125", "Infinity", "-Infinity", "", null,
    "test", "100a"]},
];

const space = ["BooleanType", "NumberType"];

export default test => {
  test.space("coerce [meaningful]", space, (assert, each) => {
    const Type = coercible[each];
    coercions.forEach(check => {
      const predicate = check.type === Type ? "equals" : "unequals";
      assert(Type.coerce(check.from))[predicate](check.to);
    });
  });

  test.space("coerce [identity]", space, (assert, each) => {
    const Type = coercible[each];
    non_coercions.filter(check => check.type === Type)
      .forEach(check => check.in.forEach(value =>
        assert(Type.coerce(value)).equals(value)
      ));
  });

  test.case("deserialize noop", assert => {
    assert(Storable.deserialize("Mowgli")).equals("Mowgli");
  });

  test.case("deserialize overriden in derivatives", (assert, {LocalHouse}) => {
    const deserialized = {name: "Jungle", location: "Asia"};
    assert(LocalHouse.deserialize("Jungle in Asia")).equals(deserialized);
  });

  test.case("Domain is", async (assert, {mowgli, Person, House}) => {
    await mowgli.save();
    assert(await DomainType.is(mowgli._id, Person)).true();
    mowgli.house_id = "1";
    assert(await DomainType.is(mowgli.house_id, House)).false();
  });

  test.case("serialize noop", assert => {
    assert(Storable.serialize("Mowgli")).equals("Mowgli");
  });

  test.case("serialize overriden in derivatives", (assert, {LocalHouse}) => {
    const deserialized = {name: "Jungle", location: "Asia"};
    assert(LocalHouse.serialize(deserialized)).equals("Jungle in Asia");
  });

  test.case("type_error builtins", assert => {
    for (const property of Object.keys(types)) {
      assert(types[property].type_error()).typeof("string");
    }
  });
};
