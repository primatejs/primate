import {Test} from "debris";

const test = new Test();

test.for = ({types}) => {
  const {BooleanType, NumberType} = types;
  const coercions = [
    {"type": NumberType, "from": "999", "to": 999},
    {"type": NumberType, "from": "+999", "to": 999},
    {"type": NumberType, "from": "999.", "to": 999},
    {"type": NumberType, "from": ".999", "to": 0.999},
    {"type": NumberType, "from": "+999.", "to": 999},
    {"type": NumberType, "from": "+.999", "to": 0.999},
    {"type": NumberType, "from": "-999.", "to": -999},
    {"type": NumberType, "from": "-.999", "to": -0.999},
    {"type": NumberType, "from": "0", "to": 0},
    {"type": NumberType, "from": "-0", "to": 0},
    {"type": NumberType, "from": "+0", "to": 0},
    {"type": NumberType, "from": "0888", "to": 888},
    {"type": NumberType, "from": "0777", "to": 777},
    {"type": NumberType, "from": "0.125", "to": 0.125},
    {"type": NumberType, "from": "+0.125", "to": 0.125},
    {"type": NumberType, "from": "-0.125", "to": -0.125},
    {"type": NumberType, "from": "0b101", "to": 5},
    {"type": NumberType, "from": "0B101", "to": 5},
    {"type": NumberType, "from": "0o13", "to": 11},
    {"type": NumberType, "from": "0x0A", "to": 10},
    {"type": NumberType, "from": "0x0a", "to": 10},
    {"type": NumberType, "from": "0xA", "to": 10},
    {"type": NumberType, "from": "12.00", "to": 12},
    {"type": NumberType, "from": "123e-1", "to": 12.3},
    {"type": NumberType, "from": "123E-1", "to": 12.3},
    {"type": NumberType, "from": "0.1e3", "to": 100},
    {"type": BooleanType, "from": "true", "to": true},
    {"type": BooleanType, "from": "false", "to": false},
  ];
  const non_coercions = [
    {"type": BooleanType, "in": [true, false, "string", 0, {}, []]},
    {"type": NumberType, "in": ["", "0,125", "Infinity", "-Infinity", "", null,
      "test", "100a"]},
  ];
  return {types, coercions, non_coercions};
};

const space = ["BooleanType", "NumberType"];

test.space("[meaningful]", space, (assert, each, fixtures) => {
  const {types, coercions} = fixtures;
  const Type = types[each];
  coercions.forEach(check => {
    const predicate = check.type === Type ? "equals" : "unequals";
    assert(Type.coerce(check.from))[predicate](check.to);
  });
});

test.space("[identity]", space, (assert, each, fixtures) => {
  const {types, non_coercions} = fixtures;
  const Type = types[each];
  non_coercions.filter(check => check.type === Type)
    .forEach(check => check.in.forEach(value =>
      assert(Type.coerce(value)).equals(value)
    ));
});

export default test;
