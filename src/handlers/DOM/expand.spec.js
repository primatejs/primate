import expand from "./expand.js";
import flatten from "./flatten.js";

const customs = {
  "c-tag": "<ct></ct>",
  "c-attribute": "<cwa value=\"${foo}\"></cwa>",
  "c-object-attribute": "<cwoa value=\"${foo.bar}\"></cwoa>",
  "c-for-object": "<fwo for=\"${foo}\"><span value=\"${bar}\"></span></fwo>",
};

const slots = {
  "s-between": "<cws><slot></slot></cws>",
  "s-before": "<slot></slot><c-tag></c-tag>",
  "s-after": "<c-tag></c-tag><slot></slot>",
  "s-with": "<s-between><c-tag></c-tag></s-between>",
};

const c_tag = "<ct></ct>";

const slot_expected = {
  "s-between": "<cws></cws>",
  "s-before": c_tag,
  "s-after": c_tag,
  "s-with": `<cws>${c_tag}</cws>`,
};

const components = {...customs, ...slots};

export default test => {
  test.reassert(assert => (html, expected) =>
    assert(flatten(expand(html, components))).equals(expected));

  test.space("custom components", Object.keys(customs), (assert, each) => {
    assert(`<${each} />`, components[each]);
  });

  test.space("slotted componets", Object.keys(slots), (assert, each) => {
    assert(`<${each} />`, slot_expected[each]);
  });
};
