import { Path } from "rcompat/fs";
import loader from "./modules.js";
import { mark } from "../Logger.js";

const log = {
  auto(error) {
    throw error;
  },
};
const root = new Path("/");
const modules = defs => loader(log, root, defs);

export default test => {
  test.case("errors.ModulesMustBeArray", assert => {
    const err = mark("the {0} config property must be an array", "modules");
    assert(() => modules({ modules: 1 })).throws(err);
  });
  test.case("errors.ModulesMustHaveNames", assert => {
    const err = mark("module at index {0} has no name", "0");
    assert(() => modules({ modules: [{}] })).throws(err);
    const err2 = mark("module at index {0} has no name", "2");
    assert(() => modules({ modules: [{ name: "a" }, { name: "b" }, {}] }))
      .throws(err2);
  });
  test.case("errors.DoubleModule", async assert => {
    const err = mark("double module {0} in {1}", "hi", "/primate.config.js");
    assert(() => modules({ modules: [{ name: "hi" }, { name: "hi" }] })).throws(err);
  });
  test.case("errors.ModuleHasNoHooks", async assert => {
    const err = mark("module {0} has no hooks", "hi");
    assert(() => modules({ modules: [{ name: "hi" }] })).throws(err);
  });
};
