import {Path} from "runtime-compat/fs";
import {bold} from "runtime-compat/colors";

import app from "./app.js";

const config = {
  http: {

  },
  paths: {

  },
};
const root = new Path("/");
const logger = {
  auto: () => null,
  class: {
    print: () => null,
    colors: {
      bold: () => null,
      blue: () => null,
      gray: () => null,
    },
  },
};

const init = (c = config, l = logger) => app(c, root, l);

export default test => {
  test.case("no routes / modules", assert => {
    assert(() => init(config)).not_throws();
  });
  test.case("no modules without names", assert => {
    assert(() => init({
      ...config,
      modules: [{}],
    })).throws("modules must have names");
  });
  test.case("warn when a module doesn't subscribe to hooks", async assert => {
    let r = false;
    const l = {...logger, auto: () => {
      r = true;
    }};
    await init({
      ...config,
      modules: [{name: "hi"}],
    }, l);
    assert(r).true();
  });
  test.case("double module", async assert => {
    assert(() => init({
      ...config,
      modules: [{name: "hi"}, {name: "hi"}],
    })).throws(`double module ${bold("hi")} in ${bold("/primate.config.js")}`);
  });
};
