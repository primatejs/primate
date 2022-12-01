import {Test} from "debris";
import Tokenizer from "./Tokenizer.js";

const test = new Test();

const tokenize = input => new Tokenizer(input).run();
const {START_TAG, END_TAG, DATA} = Tokenizer;

test.case("empty string", assert => {
  assert(tokenize("")).equals([]);
});

test.case("start tag", assert => {
  console.log(tokenize("<div>"));
  assert(tokenize("<div>")).equals([{type: START_TAG, tagName: "div"}]);
});

test.case("end tag", assert => {
  assert(tokenize("</div>")).equals([{type: END_TAG, tagName: "div"}]);
});

test.case("self-closing start tag", assert => {
  assert(tokenize("<div/>")).equals([{type: START_TAG, tagName: "div",
    selfClosing: true}]);
  assert(tokenize("<div />")).equals([{type: START_TAG, tagName: "div",
    selfClosing: true}]);
});

test.case("self-closing end tag", assert => {
  assert(tokenize("</div/>")).equals([{type: END_TAG, tagName: "div",
    selfClosing: true}]);
  assert(tokenize("</div />")).equals([{type: END_TAG, tagName: "div",
    selfClosing: true}]);
});

test.case("data node", assert => {
  assert(tokenize("data")).equals([{type: DATA, data: "data"}]);
});

test.case("text surrounded by tags", assert => {
  assert(tokenize("<div> te st </span>")).equals([
    {type: START_TAG, tagName: "div"},
    {type: DATA, data: " te st "},
    {type: END_TAG, tagName: "span"},
  ]);
});

test.case("text surrounded by tags with attributes", assert => {
  assert(tokenize("<div attribute1=\"value1\"> te st </span>")).equals([
    {type: START_TAG, tagName: "div attribute1=\"value1\""},
    {type: DATA, data: " te st "},
    {type: END_TAG, tagName: "span"},
  ]);
});

export default test;
