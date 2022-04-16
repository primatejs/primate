import {Test} from "debris";

const test = new Test();

test.for = ({types}) => {
  const {BooleanType, NumberType, StringType} = types;
  const tests = [
    {"value": true, "type": BooleanType},
    {"value": false, "type": BooleanType},
    {"value": Boolean(), "type": BooleanType},

    {"value": 0, "type": NumberType},
    {"value": -1, "type": NumberType},
    {"value": 1, "type": NumberType},
    {"value": 0.5, "type": NumberType},
    {"value": Number(), "type": NumberType},
    {"value": Date.now(), "type": NumberType},

    {"value": "", "type": StringType},
    {"value": "string", "type": StringType},
    {"value": String(), "type": StringType},
    {"value": Date(), "type": StringType},
  ];
  return {types, tests};
};
const type = ["BooleanType", "NumberType", "StringType"];
test.space("type", type, (assert, each, {types, tests}) => {
  const Type = types[each];
  for (const check of tests) {
    assert(Type.is(check.value)).equals(check.type === Type);
  }

  assert(Type.is(undefined)).false();
  assert(Type.is(null)).false();
});

export default test;
