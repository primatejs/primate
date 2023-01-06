import {ArrayType, DateType, ObjectType} from "./types.js";

const types = {ArrayType, DateType, ObjectType};
const checks = [
  {value: [], type: ArrayType},
  {value: new Array(), type: ArrayType},
  {value: Array(), type: ArrayType},

  {value: new Date(), type: DateType},

  {value: {}, type: ObjectType},
];

const type = ["ArrayType", "DateType", "ObjectType"];

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
