import { File } from "rcompat/fs";
import o from "rcompat/object";
import loader from "./types.js";
import { mark } from "../Logger.js";

const log = {
  auto(error) {
    throw error;
  },
};
const directory = new File("/types");
const types = type => loader(log, directory, () =>
  o.to(type).map(([name, definition]) => [name, { default: definition }]));
const type = {
  base: "string",
  validate() {
    return false;
  },
};

export default test => {
  test.case("errors.InvalidDefaultExport", assert => {
    const throws = mark("invalid type export at {0}", "/types/user.js");
    assert(() => types({ user: false })).throws(throws);
  });

  test.case("errors.InvalidTypeName", assert => {
    const throws = mark("invalid type name {0}", "us$er");
    assert(() => types({ us$er:  type })).throws(throws);
    const throws2 = mark("invalid type name {0}", "User");
    assert(() => types({ User: type })).throws(throws2);
    assert(() => types({ uSer: type })).nthrows();
  });

  test.case("errors.ReservedTypeName", assert => {
    const throws1 = mark("reserved type name {0}", "get");
    assert(() => types({ get: type })).throws(throws1);
    const throws2 = mark("reserved type name {0}", "raw");
    assert(() => types({ raw: type })).throws(throws2);
  });
};
