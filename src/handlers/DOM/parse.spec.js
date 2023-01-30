import parse from "./parse.js";
import flatten from "./flatten.js";

export default test => {
  test.reassert(assert => (string, expected) => {
    assert(flatten(parse(string))).equals(expected ?? string);
  });

  test.case("open and close tag", assert => assert("<div></div>"));

  test.case("open and close tag with text", assert => {
    assert("<div>test</div>");
  });

  test.case("halfopen tag", assert => assert("<div />", "<div></div>"));

  test.case("tag with attributes", assert =>
    assert("<div attribute=\"value\" />", "<div attribute=\"value\"></div>"));
};
