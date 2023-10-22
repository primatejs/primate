import { Response, Status, MediaType } from "runtime-compat/http";
import { map } from "runtime-compat/async";
import { valmap, filter } from "runtime-compat/object";
import register from "./register.js";

export default config => {
  const { make, root, render, client, normalize } = register(config);

  const get_names = components => map(components, ({ name }) => normalize(name));

  return (name, props = {}, { status = Status.OK, page } = {}) =>
    async (app, { layouts = [], as_layout } = {}, request) => {
      const options = {
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

      const data = components.map(component => component.props);
      const names = await get_names(components);

      const $request = {
        request: {
          ...valmap(filter(request, ([, { get }]) =>
            get !== undefined), o => o.get()),
          url: request.url,
        },
      };

      if (options.liveview &&
        request.headers.get(app.liveview?.header) !== undefined) {
        return new Response(JSON.stringify({ names, data, ...$request }), {
          status,
          headers: { ...await app.headers(),
            "Content-Type": MediaType.APPLICATION_JSON },
        });
      }

      const imported = (await import(root)).default;
      const { body, head } = render(imported, {
        components: components.map(({ component }) => component),
        data,
        ...$request,
      });

      const code = client({ names, data, ...$request }, options);
      const inlined = await app.inline(code, "module");

      const headers = app.headers({ script: inlined.csp });
      const rendered = { body, page, head: head.concat(inlined.head) };

      return new Response(await app.render(rendered), {
        status,
        headers: { ...headers, "Content-Type": MediaType.TEXT_HTML },
      });
    };
};
