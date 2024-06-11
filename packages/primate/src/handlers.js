import { NoHandler } from "primate/errors";
import { File } from "rcompat/fs";
import { identity } from "rcompat/function";
import { MediaType, Status } from "rcompat/http";
import { HTML } from "rcompat/string";

/**
 * @typedef {import("./types").MinOptions} MinOptions
 * @typedef {import("./types").ErrorOptions} ErrorOptions
 * @typedef {import("./types").Options} Options
 * @typedef {import("./types").ResponseFn} ResponseFn
 */

const handle = (mediatype, mapper = identity) => (body, options) => app =>
  app.respond(mapper(body), app.media(mediatype, options));

// {{{ text
/**
 * Issue a plaintext response
 * @param {string} body plaintext
 * @param {MinOptions} options rendering options
 * @return {ResponseFn}
 */
const text = handle(MediaType.TEXT_PLAIN);
// }}}
// {{{ json
/**
 * Issue a JSON response
 * @param {object} body object
 * @param {MinOptions} options rendering options
 * @return {ResponseFn}
 */
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
/**
 * Open a server-sent event stream
 * @param {object} body docs1
 * @param {object} options docs2
 * @return {ResponseFn}
 */
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
/**
 * Redirect request
 * @param {string} Location location to redirect to
 * @param {MinOptions} options handler options
 * @return {ResponseFn}
 */
const redirect = (Location, { status = Status.FOUND } = {}) => app =>
  /* no body */
  app.respond(null, { status, headers: { Location } });
// }}}
// {{{ error
/**
 * Render an error page
 * @param {string} body replacement for %body%
 * @param {ErrorOptions} options rendering options
 * @return {ResponseFn}
 */
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
/**
 * Render a HTML component, extracting <script> and <style> tags
 * @param {string} name component filename
 * @param {MinOptions} options rendering options
 * @return {ResponseFn}
 */
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
/**
 * Render a component using handler for the given filename extension
 * @param {string} name component filename
 * @param {object} props props passed to component
 * @param {object} options rendering options
 * @return {ResponseFn}
 */
const view = (name, props, options) => (app, ...rest) => extensions
  .map(extension => app.extensions[new File(name)[extension]])
  .find(extension => extension?.handle)
  ?.handle(name, props, options)(app, ...rest) ?? NoHandler.throw(name);
// }}}

export { error, html, json, redirect, sse, stream, text, view, ws };
