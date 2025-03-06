import type Frontend from "@primate/core/Frontend";
import render from "@primate/core/frontend/render";

const script_re = /(?<=<script)>(?<code>.*?)(?=<\/script>)/gus;
const style_re = /(?<=<style)>(?<code>.*?)(?=<\/style>)/gus;
const remove = /<(?<tag>script|style)>.*?<\/\k<tag>>/gus;

export default ((name, props = {}, options = {}) => async app => {
  const component = app.get_component(name);
  const rendered = await render(component, props);
  const { head: xhead = [], csp = {}, headers, ...rest } = options;
  const { script_src: xscript_src = [], style_src: xstyle_src = [] } = csp;
  const scripts = await Promise.all([...rendered.matchAll(script_re)]
    .flatMap(({ groups })=> groups?.code !== undefined
      ? app.inline(groups.code, "module")
      : []
    ));
  const styles = await Promise.all([...rendered.matchAll(style_re)]
    .flatMap(({ groups })=> groups?.code !== undefined
      ? app.inline(groups.code, "style")
      : []
    ));
  const style_src = styles.map(asset => asset.integrity).concat(xstyle_src);
  const script_src = scripts.map(asset => asset.integrity).concat(xscript_src);
  const head = [...scripts, ...styles].map(asset => asset.head);

  return app.view({
    body: rendered.replaceAll(remove, () => ""),
    head: [...head, ...xhead].join("\n"),
    headers: {
      ...app.headers({ "style-src": style_src, "script-src": script_src }),
      ...headers,
    },
    ...rest,
  });
}) as Frontend;
