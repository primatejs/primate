import {default as tokenize,
  START_TAG, END_TAG, CHARACTER} from "./tokenize.js";

const toCharacterTokens = string =>
  [...string].map(value => ({type: CHARACTER, value}));

export default test => {
  test.case("empty string", assert => {
    assert(tokenize("")).equals([]);
  });

  test.case("start tag", assert => {
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
    assert(tokenize("data")).equals(toCharacterTokens("data"));
  });

  test.case("text surrounded by tags", assert => {
    assert(tokenize("<div> te st </span>")).equals([
      {type: START_TAG, tagName: "div"},
      ...toCharacterTokens(" te st "),
      {type: END_TAG, tagName: "span"},
    ]);
  });

  test.case("text surrounded by tags with attributes", assert => {
    assert(tokenize("<div a=\"v\"> te st </span>")).equals([
      {type: START_TAG, tagName: "div", attributes: [{name: "a", value: "v"}]},
      ...toCharacterTokens(" te st "),
      {type: END_TAG, tagName: "span"},
    ]);
    assert(tokenize("<div a=\"b\" c=\"d\"> te st </span>")).equals([
      {type: START_TAG, tagName: "div", attributes: [
        {name: "a", value: "b"},
        {name: "c", value: "d"},
      ]},
      ...toCharacterTokens(" te st "),
      {type: END_TAG, tagName: "span"},
    ]);
  });
};
