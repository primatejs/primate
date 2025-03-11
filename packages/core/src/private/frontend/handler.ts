import component_error from "#error/component-error";
import type Frontend from "#Frontend";
import normalize from "#frontend/normalize";
import type Props from "#frontend/Props";
import type RequestFacade from "#RequestFacade";
import type ResponseLike from "#ResponseLike";
import type { ServeApp } from "#serve/app";
import cascade from "@rcompat/async/cascade";
import map from "@rcompat/async/map";
import { json } from "@rcompat/http/mime";
import Status from "@rcompat/http/Status";
import type Dictionary from "@rcompat/record/Dictionary";
import type ServerComponent from "./ServerComponent.js";

type Func = (component: {
  render(...args: any[]): {
    html: string,
    head: string,
  }
}, ...args: any[]) => {
  body: string,
  head: string,
};

type Options = {
  app: ServeApp,
  name: string,
  spa: boolean,
  ssr: boolean,
  client(
    { names, data, request }: { names: string[], data: Dictionary[], request: Dictionary },
    { ssr, spa }: { ssr: boolean, spa: boolean },
  ): string,
  render: Func,
};

type Component = {
  name: string,
  props: Props,
  component: ServerComponent,
};

const register = ({ app, name: rootname, ...rest }: Options): Omit<Options, "app" | "name"> & {
  root: ServerComponent
  load(name: string, props: Props): Component
} => ({
  root: app.component<ServerComponent>(`root_${rootname}.js`)!,
  load(name: string, props: Props) {
    const component = app.component<ServerComponent>(name)!;
    return { name, props, component };
  },
  ...rest,
});

type Layout = (app: ServeApp, transfer: Dictionary, request: RequestFacade)
  => ResponseLike;

export default (config: Options): Frontend => {
  const { load, root, render, client } = register(config);
  const normalized = normalize(config.name);

  const get_names = (components: Component[]) => map(components, ({ name }) =>
    normalized(name));

  return (name, props = {}, options = {}) =>
    async (app, { layouts = [], as_layout } = {}, request) => {
      if (as_layout) {
        return load(name, props);

      }
      const components = (await Promise.all((layouts as Layout[]).map(layout =>
        layout(app, { as_layout: true }, request),
      )))
        /* set the actual page as the last component */
        .concat(load(name, props)) as Component[];

      const names = await get_names(components);

      const shared = {
        data: components.map(component => component.props),
        request: {
          path: request.path,
          query: request.query,
          headers: request.headers,
          cookies: request.cookies,
          context: request.context,
          url: request.url,
        },
      };

      if (config.spa && request.headers.get("Accept") === json) {
        return new Response(JSON.stringify({ names, ...shared }), {
          status: options.status ?? Status.OK,
          headers: { ...app.headers(), "Content-Type": json },
        });
      }

      try {
        const { body, head } = config.ssr === false ? {
          body: "", head: "",
        } : render(root as any, {
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
      } catch (error) {
        component_error(`${app.config("location.components")}/${name}`, `${error}`);
      }
    };
};
