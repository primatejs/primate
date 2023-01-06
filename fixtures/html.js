import html from "../src/handlers/html.js";
const obj = {
  "custom-tag": "<ct></ct>",
  "custom-with-attribute": "<cwa value=\"${foo}\"></cwa>",
  "custom-with-object-attribute": "<cwoa value=\"${foo.bar}\"></cwoa>",
  "custom-with-slot": "<cws><slot/></cws>",
  "for-with-object": "<fwo for=\"${foo}\"><span value=\"${bar}\"></span></fwo>",
  "slot-before-custom": "<slot/><custom-tag></custom-tag>",
  "custom-before-slot": "<custom-tag></custom-tag><slot/>",
};
export default () => html(obj);
