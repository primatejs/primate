import {Test} from "debris";

const test = new Test();

const w = content => `<div>${content}</div>`;

test.reassert(assert => async (template, expected) =>
  assert((await template).body).equals(`<div>${expected}</div>`));

test.case("tag", (assert, {html}) => assert(html`<div></div>`, "<div></div>"));

test.case("tag with attributes", async (assert, {html}) => {
  await assert(html`<div title="test"></div>`, "<div title=\"test\"></div>");
  await assert(html`<div value="test"></div>`, "<div>test</div>");
});

test.case("tag with attributes and data", async (assert, {html}) => {
  const key = "value";
  await assert(html`<div title="${key}"></div>`, "<div title=\"value\"></div>");
});

test.case("custom tag", async (assert, {html}) => {
  await assert(html`<parent-tag />`, "<div><pt></pt></div>");
  await assert(html`<parent-tag></parent-tag>`, "<div><pt></pt></div>");
});

test.case("custom tag with attributes", async (assert, {html}) => {
  const foo = "bar";
  await assert(html`<parent-tag-with-attribute foo="${foo}"/>`,
    w("<ptwa>bar</ptwa>"));
  await assert(html`<parent-tag-with-attribute foo="bar"/>`,
    w("<ptwa>bar</ptwa>"));
  const foo_object = {bar: "baz"};
  await assert(html`<parent-tag-with-object-attribute foo="${foo_object}"/>`,
    w("<ptwoa>baz</ptwoa>"));
});

// test.case("custom tag with slot (text)")

test.case("custom tag with slot (tag)", (assert, {html}) =>
  assert(html`<parent-tag-with-slot><span>test</span></parent-tag-with-slot>`,
    w("<ptws><span>test</span></ptws>")));

test.case("custom tag in custom tag (slotted)", (assert, {html}) =>
  assert(html`<parent-tag-with-slot><parent-tag></parent-tag></parent-tag-with-slot>`,
    w("<ptws><div><pt></pt></div></ptws>")));

test.case("for with object", (assert, {html}) => {
  const foo = {bar: "baz"};
  return assert(html`<for-with-object foo="${foo}" />`,
    w(w("<fwo><span>baz</span></fwo>")));
});

test.case("for with array", (assert, {html}) => {
  const foo = [{bar: "baz"}, {bar: "baz2"}];
  return assert(html`<for-with-object foo="${foo}"></for-with-object>`,
    w(w("<fwo><span>baz</span></fwo><fwo><span>baz2</span></fwo>")));
});

test.case("shadowed attribute", (assert, {html}) => {});

export default test;
