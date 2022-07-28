import {Test} from "debris";
import Parser from "./Parser.js";

const test = new Test();

const a = c => `<div>${c}</div>`;

test.case("empty string", async assert => {
  const string = "";
  assert(await Parser.parse(string).render()).equals(a(string));
});

test.case("tag", async assert => {
  const string = "<div></div>";
  assert(await Parser.parse(string).render()).equals(a(string));
});

test.case("tag with text", async assert => {
  const string = "<div>test</div>";
  assert(await Parser.parse(string).render()).equals(a(string));
});

test.case("tag with attribute", async assert => {
  const string = "<div foo=\"bar\" bar=\"baz\">test</div>";
  assert(await Parser.parse(string).render()).equals(a(string));
});

export default test;
