import html from "../source/handlers/html.js";
const obj = {
  "parent-tag": "<pt></pt>",
  "parent-tag-with-attribute": "<ptwa value=\"${foo}\"></ptwa>",
  "parent-tag-with-object-attribute": "<ptwoa value=\"${foo.bar}\"></ptwoa>",
  "parent-tag-with-slot": "<ptws><slot/></ptws>",
  "for-with-object": "<fwo for=\"${foo}\"><span value=\"${bar}\"></span></fwo>"
};
export default () => html(obj);
