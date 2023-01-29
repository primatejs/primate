import parse from "./parse.js";
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

const c_tag = "<div class=\"c-tag\"><ct></ct></div>";

const slot_expected = {
  "s-between": "<cws><div></div></cws>",
  "s-before": `<div></div>${c_tag}`,
  "s-after": `${c_tag}<div></div>`,
  "s-with": `<div class="s-between"><cws><div>${c_tag}</div></cws></div>`,
};

const components = {...customs, ...slots};

export default test => {
  test.reassert(assert => (html, expected) =>
    assert(flatten(expand(html, components))).equals(`<div>${expected}</div>`));

  test.space("custom components", Object.keys(customs), (assert, each) => {
    const attributes = `class="${each}"`;
    const expected = `<div ${attributes}>${components[each]}</div>`;
    assert(`<${each} />`, expected);
  });

  test.space("slotted componets", Object.keys(slots), (assert, each) => {
    const attributes = `class="${each}"`;
    const expected = `<div ${attributes}>${slot_expected[each]}</div>`;
    assert(`<${each} />`, expected);
  });
};
