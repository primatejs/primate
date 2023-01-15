export default test => {
  test.fix(({html}) => html);

  test.reassert(assert => async (template, expected) =>
    assert((await template).body).equals(`<body><div>${expected}</div>`));

  test.case("tag", (assert, html) => {
    assert(html`<div></div>`, "<div></div>");
  });

  test.case("tag with attributes", async (assert, html) => {
    await assert(html`<div title="test"></div>`, "<div title=\"test\"></div>");
    await assert(html`<div value="test"></div>`, "<div>test</div>");
  });

  test.case("tag with attributes and data", async (assert, html) => {
    const key = "value";
    await assert(html`<div title="${key}"></div>`, "<div title=\"value\"></div>");
  });

  test.case("custom tag", async (assert, html) => {
    const expected = "<div class=\"custom-tag\"><ct></ct></div>";
    await assert(html`<custom-tag />`, expected);
    await assert(html`<custom-tag></custom-tag>`, expected);
  });

  test.case("custom tag with attribute", async (assert, html) => {
    const foo = "bar";
    const tag = "<cwa>bar</cwa>";
    const result = `<div class="custom-with-attribute">${tag}</div>`;
    await assert(html`<custom-with-attribute foo="${foo}"/>`, result);
    await assert(html`<custom-with-attribute foo="bar"/>`, result);
  });

  test.case("custom tag with object attribute", async (assert, html) => {
    const foo = {bar: "baz"};
    const tag = "<cwoa>baz</cwoa>";
    const result = `<div class="custom-with-object-attribute">${tag}</div>`;
    await assert(html`<custom-with-object-attribute foo="${foo}"/>`, result);
  });

  test.case("slot before custom tag", async (assert, html) => {
    const child = "<div>test</div>";
    const ct = "<div class=\"custom-tag\"><ct></ct></div>";

    const result = `<div class="slot-before-custom">${child}${ct}</div>`;
    await assert(html`<slot-before-custom><div>test</div></slot-before-custom>`,
      result);
  });

  test.case("slot after custom tag", async (assert, html) => {
    const child = "<div>test</div>";
    const ct = "<div class=\"custom-tag\"><ct></ct></div>";

    const result = `<div class="custom-before-slot">${ct}${child}</div>`;
    await assert(html`<custom-before-slot><div>test</div></slot-before-custom>`,
      result);
  });

  // test.case("custom tag with slot (text)")

  test.case("custom tag with slot (tag)", async (assert, html) => {
    const input = html`<custom-with-slot><span>test</span></custom-with-slot>`;
    const cws = "<cws><span>test</span></cws>";
    const result = `<div class="custom-with-slot">${cws}</div>`;

    await assert(input, result);
  });

  test.case("custom tag in custom tag (slotted)", async (assert, html) => {
    const input = html`<custom-with-slot><custom-tag /></custom-with-slot>`;
    const ct = "<ct></ct>";
    const cws = `<cws><div class="custom-tag">${ct}</div></cws>`;
    const result = `<div class="custom-with-slot">${cws}</div>`;

    await assert(input, result);
  });

  test.case("custom tag in custom tag (slotted) in tag", async (assert, html) => {
    const input = html`<custom-with-slot><p><custom-tag/></p></custom-with-slot>`;
    const ct = "<ct></ct>";
    const cws = `<cws><p><div class="custom-tag">${ct}</div></p></cws>`;
    const result = `<div class="custom-with-slot">${cws}</div>`;

    await assert(input, result);
  });

  test.case("for with object", (assert, html) => {
    const foo = {bar: "baz"};
    const input = html`<for-with-object foo="${foo}" />`;
    const fwo = "<div><fwo><span>baz</span></fwo></div>";
    const result = `<div class="for-with-object">${fwo}</div>`;

    return assert(input, result);
  });

  test.case("for with array", (assert, html) => {
    const foo = [{bar: "baz"}, {bar: "baz2"}];
    const input = html`<for-with-object foo="${foo}"></for-with-object>`;
    const fwo = "<fwo><span>baz</span></fwo>";
    const fwo2 = "<fwo><span>baz2</span></fwo>";
    const result = `<div class="for-with-object"><div>${fwo}${fwo2}</div></div>`;

    return assert(input, result);
  });

  // test.case("shadowed attribute", (assert, html) => {});
};
