import extend from "./extend.js";

export default test => {
  test.case("no params", assert => {
    assert(extend()).equals({});
  });

  test.case("no base", assert => {
    const extension = {key: "value"};
    assert(extend(undefined, extension)).equals(extension);
  });

  test.case("no extension", assert => {
    const base = {keys: "values"};
    assert(extend(base)).equals(base);
  });

  test.case("base and extension same", assert => {
    const object = {key: "value"};
    assert(extend(object, object)).equals(object);
  });

  test.case("one property", assert => {
    const base = {key: "value"};
    const extension = {key: "value2"};
    assert(extend(base, extension)).equals(extension);
  });

  test.case("two properties, one replaced", assert => {
    const base = {key: "value", key2: "value2"};
    const extension = {key: "other value"};
    const extended = {key: "other value", key2: "value2"};
    assert(extend(base, extension)).equals(extended);
  });

  test.case("arrays overwritten", assert => {
    const base = {key: ["value", "value2"]};
    const extension = {key: ["value3", "value4"]};
    assert(extend(base, extension)).equals(extension);
  });

  test.case("one property of a subobject", assert => {
    const base = {key: {subkey: "subvalue"}};
    const extension = {key: {subkey: "subvalue 2"}};
    assert(extend(base, extension)).equals(extension);
  });

  test.case("two properties of a subobject, one replaced", assert => {
    const base = {key: {subkey: "subvalue", subkey2: "subvalue2"}};
    const extension = {key: {subkey: "subvalue 2"}};
    const extended = {key: {subkey: "subvalue 2", subkey2: "subvalue2"}};
    assert(extend(base, extension)).equals(extended);
  });

  test.case("config enhancement", assert => {
    const base = {
      base: "/",
      debug: false,
      defaults: {
        action: "index",
        context: "guest",
      },
      paths: {
        public: "public",
        static: "static",
        routes: "routes",
        components: "components",
      },
    };

    const additional = {
      debug: true,
      environment: "testing",
      defaults: {
        context: "user",
        mode: "operational",
      },
      paths: {
        client: "client",
      },
    };

    const extended = {
      base: "/",
      debug: true,
      environment: "testing",
      defaults: {
        action: "index",
        context: "user",
        mode: "operational",
      },
      paths: {
        client: "client",
        public: "public",
        static: "static",
        routes: "routes",
        components: "components",
      },
    };

    assert(extend(base, additional)).equals(extended);
  });
};
