import {Path} from "runtime-compat/fs";
import loader from "./guards.js";
import {mark} from "../Logger.js";

const log = {
  auto(error) {
    throw error;
  },
};
const directory = new Path("/guards");
const guards = defs => loader(log, directory, () => defs);

export default test => {
  test.case("errors.InvalidGuard", assert => {
    const throws = mark("invalid guard {0}", "user");
    assert(() => guards([["user", false]])).throws(throws);
  });

  test.case("errors.InvalidGuardName", assert => {
    const throws = mark("invalid guard name {0}", "us$er");
    assert(() => guards([["us$er", () => false]])).throws(throws);
    const throws2 = mark("invalid guard name {0}", "User");
    assert(() => guards([["User", () => false]])).throws(throws2);
    assert(() => guards([["uSer", () => false]])).not_throws();
  });
};
