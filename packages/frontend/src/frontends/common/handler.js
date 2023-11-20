import { Response, Status, MediaType } from "rcompat/http";
import { cascade, map } from "rcompat/async";
import { valmap, filter } from "rcompat/object";
import register from "./register.js";
import respond from "./respond.js";

const noop = _ => ({});

export default config => {
  const { make, root, render, client, normalize } = register(config);

  const get_names = components => map(components, ({ name }) => normalize(name));

  return (name, props = {}, options = {}) =>
    async (app, { layouts = [], as_layout } = {}, request) => {
      const liveview_options = {
        liveview: app.liveview !== undefined,
      };
      if (as_layout) {
        return make(name, props);
      }
      const components = (await Promise.all(layouts.map(layout =>
        layout(app, { as_layout: true }, request),
      )))
        /* set the actual page as the last component */
        .concat(await make(name, props));

      const names = await get_names(components);

      const shared = {
        data: components.map(component => component.props),
        context: await (await cascade(app.modules.context, noop))(request),
        request: {
          ...valmap(filter(request, ([, { all }]) => all !== undefined),
            dispatcher => dispatcher.all()),
          url: request.url,
        },
      };

      const status = options.status ?? Status.OK;

      if (liveview_options.liveview &&
        request.headers.get(app.liveview?.header) !== undefined) {
        return new Response(JSON.stringify({ names, ...shared }), {
          status,
          headers: { ...await app.headers(),
            "Content-Type": MediaType.APPLICATION_JSON },
        });
      }

      const imported = (await import(root)).default;
      const { body, head } = render(imported, {
        components: components.map(({ component }) => component),
        ...shared,
      });

      const code = client({ names, ...shared }, liveview_options);
      const inlined = await app.inline(code, "module");

      return respond({
        app,
        body,
        head: head.concat(inlined.head),
        headers: app.headers({ script: inlined.csp }),
        options,
      });
    };
};
