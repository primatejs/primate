import component_error from "#error/component-error";
import no_component from "#error/no-component";
import normalize from "#normalize";
import cascade from "@rcompat/async/cascade";
import map from "@rcompat/async/map";
import tryreturn from "@rcompat/async/tryreturn";
import { json } from "@rcompat/http/mime";
import Status from "@rcompat/http/Status";

const register = ({ app, name: rootname, ...rest }) => ({
  root: app.component(`root_${rootname}.js`),
  async load(name, props) {
    const component = await app.gomponent(name);
    return component === undefined
      ? no_component(name, `${app.config("location.components")}/${name}`)
      : { name, props, component };
  },
  ...rest,
});

const noop = _ => ({});

export default config => {
  const { load, root, render, client } = register(config);
  const normalized = normalize(config.name);

  const get_names = components => map(components, ({ name }) =>
    normalized(name));

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
          path: request.path,
          query: request.query,
          headers: request.headers,
          cookies: request.cookies,
          url: request.url,
        },
      };

      if (config.spa && request.headers.get("Accept") === json) {
        return new Response(JSON.stringify({ names, ...shared }), {
          status: options.status ?? Status.OK,
          headers: {
            ...await app.headers(),
            "Content-Type": json,
          },
        });
      }

      return tryreturn(async () => {
        const { body, head } = config.ssr === false ? {
          body: "", head: "",
        } : render(root, {
          components: components.map(({ component }) => component),
          ...shared,
        });
        const code = client({ names, ...shared }, {
          spa: config.spa,
          ssr: config.ssr,
        });
        const inlined = await app.inline(code, "module");
        const script_src = [inlined.integrity];

        return app.view({
          body,
          head: head.concat(inlined.head),
          headers: app.headers({ "script-src": script_src }),
          ...options,
        });
      }).orelse(error => {
        component_error(`${app.config("location.components")}/${name}`, error);
      });
    };
};
