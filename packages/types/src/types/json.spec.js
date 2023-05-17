import json from "./json.js";
import {reassert} from "./base.spec.js";

export default test => {
  reassert(test, json);

  test.case("fail", ({fail}) => {
    fail(undefined, {}, [], "True", "False");
  });
  test.case("match", ({match}) => {
    match("0", 0);
    match("0.5", 0.5);
    match("1", 1);
    match("1.5", 1.5);
    match("true", true);
    match("false", false);
    match("{}", {});
    match("[]", []);
    match("{\"foo\": \"bar\"}", {foo: "bar"});
    match("[true, \"true\", {\"bar\": \"baz\"}]", [true, "true", {bar: "baz"}]);
  });
  test.case("same", ({same}) => {
    same(0, 0.5, 1, 1.5, null, true, false);
  });
};
