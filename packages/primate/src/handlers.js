import FS from "rcompat/fs";
import { MediaType, Status } from "rcompat/http";
import { identity } from "rcompat/function";
import { HTML } from "rcompat/string";
import errors from "./errors.js";

const handle = (mediatype, mapper = identity) => (body, options) => app =>
  app.respond(mapper(body), app.media(mediatype, options));

// {{{ text
const text = handle(MediaType.TEXT_PLAIN);
// }}}
// {{{ json
const json = handle(MediaType.APPLICATION_JSON, JSON.stringify);
// }}}
// {{{ stream
const stream = handle(MediaType.APPLICATION_OCTET_STREAM);
// }}}
// {{{ ws
const ws = implementation => ({ server }, _, { original }) =>
  server.upgrade(original, implementation);
// }}}
// {{{ sse
const sse = handle(MediaType.TEXT_EVENT_STREAM, implementation =>
  new ReadableStream({
    start(controller) {
      implementation.open({
        send(name, data) {
          const event = data === undefined ? "" : `event: ${name}\n`;
          const $data = data === undefined ? name : data;
          controller.enqueue(`${event}data:${JSON.stringify($data)}\n\n`);
        },
      });
    },
    cancel() {
      implementation.close?.();
    },
  }));
// }}}
// {{{ redirect
const redirect = (Location, { status = Status.FOUND } = {}) => app =>
  /* no body */
  app.respond(null, { status, headers: { Location } });
// }}}
// {{{ error
const error = (body = "Not Found", { status = Status.NOT_FOUND, page } = {}) =>
  app => app.view({ body, status, page: page ?? app.get("pages.error") });
// }}}
// {{{ html
const script_re = /(?<=<script)>(?<code>.*?)(?=<\/script>)/gus;
const style_re = /(?<=<style)>(?<code>.*?)(?=<\/style>)/gus;
const remove = /<(?<tag>script|style)>.*?<\/\k<tag>>/gus;
const render = (component, props = {}) => {
  const encoded = JSON.parse(HTML.escape(JSON.stringify(props)));
  const keys = Object.keys(encoded);
  const values = Object.values(encoded);
  return new Function(...keys, `return \`${component}\`;`)(...values);
};
const html = (name, props, options = {}) => async app => {
  const location = app.get("location");
  const components = app.runpath(location.server, location.components);
  const component = await components.join(name).text();
  const { head: xhead = [], csp = {}, headers, ...rest } = options;
  const { script_src: xscript_src = [], style_src: xstyle_src = [] } = csp;
  const scripts = await Promise.all([...component.matchAll(script_re)]
    .map(({ groups: { code } }) => app.inline(code, "module")));
  const styles = await Promise.all([...component.matchAll(style_re)]
    .map(({ groups: { code } }) => app.inline(code, "style")));
  const style_src = styles.map(asset => asset.integrity).concat(xstyle_src);
  const script_src = scripts.map(asset => asset.integrity).concat(xscript_src);
  const head = [...scripts, ...styles].map(asset => asset.head);

  return app.view({
    body: render(component.replaceAll(remove, _ => ""), props),
    head: [...head, ...xhead].join("\n"),
    headers: {
      ...app.headers({ "style-src": style_src, "script-src": script_src }),
      ...headers,
    },
    ...rest,
  });
};
// }}}
// {{{ view
const extensions = ["fullExtension", "extension"];
const view = (name, props, options) => (app, ...rest) => extensions
  .map(extension => app.extensions[new FS.File(name)[extension]])
  .find(extension => extension?.handle)
  ?.handle(name, props, options)(app, ...rest)
    ?? errors.NoHandlerForComponent.throw(name);
// }}}

export { text, json, stream, redirect, error, html, view, ws, sse };
