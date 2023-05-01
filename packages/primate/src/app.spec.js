import app from "./app.js";

const config = {
  http: {

  },
  paths: {

  },
};
const root = "/";
const logger = {
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
    })).throws("all modules must have names");
  });
  test.case("warn when a module doesn't subscribe to hooks", async assert => {
    let r = false;
    const l = {...logger, warn: () => {
      r = true;
    }};
    await init({
      ...config,
      modules: [{name: "hi"}],
    }, l);
    assert(r).true();
  });
  test.case("same module twice", async assert => {
    assert(() => init({
      ...config,
      modules: [{name: "hi"}, {name: "hi"}],
    })).throws("same module twice");
  });
};
