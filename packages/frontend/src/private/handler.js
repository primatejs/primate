import component_error from "#error/component-error";
import no_component from "#error/no-component";
import normalize from "#normalize";
import cascade from "@rcompat/async/cascade";
import map from "@rcompat/async/map";
import { json } from "@rcompat/http/mime";
import { OK } from "@rcompat/http/status";
import filter from "@rcompat/object/filter";
import valmap from "@rcompat/object/valmap";
import tryreturn from "@rcompat/async/tryreturn";

const live = Symbol.for("@primate/live.live");

const register = ({ app, name: rootname, ...rest }) => ({
  root: app.get_component(`root_${rootname}.js`),
  async load(name, props) {
    const component = await app.get_component(name);
    return component === undefined
      ? no_component(name, `${app.get("location.components")}/${name}`)
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
          ...valmap(filter(request, ([, { get }]) => get !== undefined),
            dispatcher => JSON.parse(dispatcher.toString() ?? "{}")),
          url: request.url,
        },
        subscribers: {},
      };

      shared.data.forEach((component_props, position) => {
        Object.entries(component_props)
          .filter(([, value]) => value.live === live)
          .forEach(([prop, value]) => {
            value.subscribe(next => {
              app.live.send(value.id, next);
            });
            shared.subscribers[value.id] = { position, prop };
          });
      });
      shared.data = shared.data.map(component_props =>
        valmap(component_props, value =>
          value?.live === live ? value.value : value),
      );

      if (config.spa && request.headers.get("Accept") === json) {
        return new Response(JSON.stringify({ names, ...shared }), {
          status: options.status ?? OK,
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
        component_error(`${app.get("location.components")}/${name}`, error);
      });
    };
};
