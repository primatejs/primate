import {Test} from "debris";
import extend_object from "./extend_object.js";

const test = new Test();

test.case("no params", assert => {
  assert(extend_object()).equals({});
});

test.case("no base", assert => {
  const extension = {key: "value"};
  assert(extend_object(undefined, extension)).equals(extension);
});

test.case("no extension", assert => {
  const base = {keys: "values"};
  assert(extend_object(base)).equals(base);
});

test.case("base and extension same", assert => {
  const object = {key: "value"};
  assert(extend_object(object, object)).equals(object);
});

test.case("one property", assert => {
  const base = {key: "value"};
  const extension = {key: "value2"};
  assert(extend_object(base, extension)).equals(extension);
});

test.case("two properties, one replaced", assert => {
  const base = {key: "value", key2: "value2"};
  const extension = {key: "other value"};
  const extended = {key: "other value", key2: "value2"};
  assert(extend_object(base, extension)).equals(extended);
});

test.case("arrays overwritten", assert => {
  const base = {key: ["value", "value2"]};
  const extension = {key: ["value3", "value4"]};
  assert(extend_object(base, extension)).equals(extension);
});

test.case("one property of a subobject", assert => {
  const base = {key: {"subkey": "subvalue"}};
  const extension = {key: {"subkey": "subvalue 2"}};
  assert(extend_object(base, extension)).equals(extension);
});

test.case("two properties of a subobject, one replaced", assert => {
    const base = {key: {subkey: "subvalue", subkey2: "subvalue2"}};
    const extension = {key: {subkey: "subvalue 2"}};
    const extended = {key: {subkey: "subvalue 2", subkey2: "subvalue2"}};
    assert(extend_object(base, extension)).equals(extended);
  });

test.case("configuration enhancement", assert => {
  const default_conf = {
    base: "/",
    debug: false,
    defaults: {
      action: "index",
      context: "guest",
    },
    paths: {
      client: "client",
      data: {
        domains: "domains",
        stores: "stores",
      },
      public: "public",
    },
  };

  const additional_conf = {
    debug: true,
    environment: "testing",
    defaults: {
      context: "user",
      mode: "operational",
    },
    paths: {
      client: "client_logic",
      data: {
        stores: "storage",
        drivers: "drivers",
      },
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
      client: "client_logic",
      data: {
        domains: "domains",
        drivers: "drivers",
        stores: "storage",
      },
      public: "public",
    },
  };

  assert(extend_object(default_conf, additional_conf)).equals(extended);
});

export default test;
