import { register } from "../common/exports.js";
import render from "./render.js";
import rootname from "./rootname.js";

const script_re = /(?<=<script)>(?<code>.*?)(?=<\/script>)/gus;
const style_re = /(?<=<style)>(?<code>.*?)(?=<\/style>)/gus;
const remove = /<(?<tag>script|style)>.*?<\/\k<tag>>/gus;

const handler = ({ load }) => (name, props = {}, options = {}) => async app => {
  const { component } = await load(name, props);
  const rendered = render(component, props);
  const { head: xhead = [], csp = {}, headers, ...rest } = options;
  const { script_src: xscript_src = [], style_src: xstyle_src = [] } = csp;
  const scripts = await Promise.all([...rendered.matchAll(script_re)]
    .map(({ groups: { code } }) => app.inline(code, "module")));
  const styles = await Promise.all([...rendered.matchAll(style_re)]
    .map(({ groups: { code } }) => app.inline(code, "style")));
  const style_src = styles.map(asset => asset.integrity).concat(xstyle_src);
  const script_src = scripts.map(asset => asset.integrity).concat(xscript_src);
  const head = [...scripts, ...styles].map(asset => asset.head);

  return app.view({
    body: rendered.replaceAll(remove, _ => ""),
    head: [...head, ...xhead].join("\n"),
    headers: {
      ...app.headers({ "style-src": style_src, "script-src": script_src }),
      ...headers,
    },
    ...rest,
  });
};

export default extension => (app, next) => {
  app.register(extension, handler(register({ app, rootname })));

  return next(app);
};
