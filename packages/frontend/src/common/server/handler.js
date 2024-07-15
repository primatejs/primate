import { Status, MediaType } from "rcompat/http";
import { cascade, map } from "rcompat/async";
import * as O from "rcompat/object";
import register from "./register.js";

const noop = _ => ({});
const { APPLICATION_JSON } = MediaType;

export default config => {
  const { load, root, render, client, normalize } = register(config);

  const get_names = components => map(components, ({ name }) => normalize(name));

  return (name, props = {}, options = {}) =>
    async (app, { layouts = [], as_layout } = {}, request) => {
      if (as_layout) {
        return load(name, props);
      }
      const components = (await Promise.all(layouts.map(layout =>
        layout(app, { as_layout: true }, request),
      )))
        /* set the actual page as the last component */
        .concat(await load(name, props));

      const names = await get_names(components);

      const shared = {
        data: components.map(component => component.props),
        context: await (await cascade(app.modules.context, noop))(request),
        request: {
          ...O.valmap(O.filter(request, ([, { get }]) => get !== undefined),
            dispatcher => JSON.parse(dispatcher.toString() ?? "{}")),
          url: request.url,
        },
      };

      const status = options.status ?? Status.OK;

      if (config.spa && request.headers.get("Accept") === APPLICATION_JSON) {
        return new Response(JSON.stringify({ names, ...shared }), {
          status,
          headers: {
            ...await app.headers(),
            "Content-Type": APPLICATION_JSON,
          },
        });
      }

      const { body, head } = render(root, {
        components: components.map(({ component }) => component),
        ...shared,
      });

      const code = client({ names, ...shared }, { spa: config.spa });
      const inlined = await app.inline(code, "module");
      const script_src = [inlined.integrity];

      return app.view({
        body,
        head: head.concat(inlined.head),
        headers: app.headers({ "script-src": script_src }),
        ...options,
      });
    };
};
