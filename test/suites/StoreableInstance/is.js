import {Test} from "debris";

const test = new Test();

test.for = ({types}) => {
  const {ArrayType, DateType, ObjectType} = types;
  const tests = [
    {"value": [], "type": ArrayType},
    {"value": new Array(), "type": ArrayType},
    {"value": Array(), "type": ArrayType},

    {"value": new Date(), "type": DateType},

    {"value": {}, "type": ObjectType},
  ];
  return {types, tests};
};

const type = ["ArrayType", "DateType", "ObjectType"];

test.space("type", type, (assert, each, {types, tests}) => {
  const Type = types[each];
  for (const check of tests) {
    assert(Type.is(check.value)).equals(check.type === Type);
  }

  assert(Type.is(undefined)).false();
  assert(Type.is(null)).false();
});

export default test;
