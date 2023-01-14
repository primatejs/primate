import {BooleanType, NumberType, StringType} from "./types.js";

const types = {BooleanType, NumberType, StringType};
const checks = [
  {value: true, type: BooleanType},
  {value: false, type: BooleanType},
  {value: Boolean(), type: BooleanType},

  {value: 0, type: NumberType},
  {value: -1, type: NumberType},
  {value: 1, type: NumberType},
  {value: 0.5, type: NumberType},
  {value: Number(), type: NumberType},
  {value: Date.now(), type: NumberType},

  {value: "", type: StringType},
  {value: "string", type: StringType},
  {value: String(), type: StringType},
  {value: Date(), type: StringType},
];

const type = ["BooleanType", "NumberType", "StringType"];

export default test => {
  test.space("type", type, (assert, each) => {
    const Type = types[each];
    checks.forEach(check =>
      assert(Type.is(check.value)).equals(check.type === Type)
    );

    assert(Type.is(undefined)).false();
    assert(Type.is(null)).false();
  });
};
