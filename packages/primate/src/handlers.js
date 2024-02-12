/**
 * @typedef {import("./types").ResponseFn} ResponseFn
 * @typedef {import("./types").MinOptions} MinOptions
 * @typedef {import("./types").ErrorOptions} ErrorOptions
 * @typedef {import("./types").Options} Options
 */

import { File } from "rcompat/fs";
import { MediaType, Status } from "rcompat/http";
import { identity } from "rcompat/function";
import errors from "./errors.js";

const handle = (mediatype, mapper = identity) => (body, options) => app =>
  app.respond(mapper(body), app.media(mediatype, options));

// {{{ text
/**
 * Send a plaintext response
 * @param {string} body plaintext
 * @param {MinOptions} options rendering options
 * @return {ResponseFn}
 */
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
  app => app.view({ body, status, page: page ?? app.config.pages.error });
// }}}
// {{{ html
const script_re = /(?<=<script)>(?<code>.*?)(?=<\/script>)/gus;
const style_re = /(?<=<style)>(?<code>.*?)(?=<\/style>)/gus;
const remove = /<(?<tag>script|style)>.*?<\/\k<tag>>/gus;
/**
 * Render a HTML component, extracting <script> and <style> tags
 * @param {string} name component filename
 * @param {MinOptions} options rendering options
 * @return {ResponseFn}
 */
const html = (name, options) => async app => {
  const component = await app.path.components.join(name).text();
  const scripts = await Promise.all([...component.matchAll(script_re)]
    .map(({ groups: { code } }) => app.inline(code, "module")));
  const styles = await Promise.all([...component.matchAll(style_re)]
    .map(({ groups: { code } }) => app.inline(code, "style")));
  const assets = [...scripts, ...styles];

  const body = component.replaceAll(remove, _ => "");
  const head = assets.map(asset => asset.head).join("\n");
  const script = scripts.map(asset => asset.csp).join(" ");
  const style = styles.map(asset => asset.csp).join(" ");
  const headers = app.headers({ script, style });

  return app.view({ body, head, headers, ...options });
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
  ?.handle(name, props, options)(app, ...rest)
    ?? errors.NoHandlerForComponent.throw(name);
// }}}

export { text, json, stream, redirect, error, html, view, ws, sse };
