import cascade from "@rcompat/async/cascade";
import map from "@rcompat/async/map";
import { APPLICATION_JSON } from "@rcompat/http/media-type";
import { OK } from "@rcompat/http/status";
import filter from "@rcompat/object/filter";
import valmap from "@rcompat/object/valmap";
import make_normalize from "./normalize.js";

const register = ({ app, name: rootname, ...rest }) => ({
  root: app.get_component(`root_${rootname}.js`),
  async load(name, props) {
    const component = await app.get_component(name);
    return { name, props, component };
  },
  ...rest,
});

const noop = _ => ({});

export default config => {
  const { load, root, render, client } = register(config);
  const normalize = make_normalize(config.name);

  const get_names = components => map(components, ({ name }) =>
    normalize(name));

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
          ...valmap(filter(request, ([, { get }]) => get !== undefined),
            dispatcher => JSON.parse(dispatcher.toString() ?? "{}")),
          url: request.url,
        },
      };

      if (config.spa && request.headers.get("Accept") === APPLICATION_JSON) {
        return new Response(JSON.stringify({ names, ...shared }), {
          status: options.status ?? OK,
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
