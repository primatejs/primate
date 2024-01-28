import "zone.js";
import "@angular/compiler";
import {
  provideServerRendering,
  renderApplication,
  ɵSERVER_CONTEXT,
} from "@angular/platform-server";
import { enableProdMode } from "@angular/core";
// import { CommonEngine } from "@angular/ssr";
import { bootstrapApplication, provideClientHydration }
  from "@angular/platform-browser";
import * as esbuild from "esbuild";
import make_root from "./root-component.js";
import rootname from "./rootname.js";

const transform = code => esbuild.transform(code, {
  loader: "ts",
  tsconfigRaw: `{
    "compilerOptions": {
      "experimentalDecorators": true
    }
  }`,
});

export const set_mode = mode => {
  if (mode === "production") {
    enableProdMode();
  }
};

// const common_engine = new CommonEngine();

export const render = async (given_component, props) => {
  const component = await make_root(given_component, props);
  const document = `<${rootname}></${rootname}>`;
  const bootstrap = () => bootstrapApplication(component, {
    providers: [
      provideServerRendering(),
     { provide: ɵSERVER_CONTEXT, useValue: "analog" },
     ...component.renderProviders || [],
     provideClientHydration(),
    ],
  });
  const html = await renderApplication(bootstrap, { document });
  const b_s = "<body>";
  const b_e = "</body>";
  // await common_engine.render({ bootstrap, document });
  return html.slice(html.indexOf(b_s) + b_s.length, html.indexOf(b_e));
};

export const compile = {
  async server(app, component, extensions) {
    const { location } = app.config;
    const source = app.path.components;
    const { code } = await transform(await component.text());
    const target_base = app.runpath(location.server, location.components);
    const path = target_base.join(`${component.path}.js`.replace(source, ""));
    await path.directory.create();
    await path.write(code.replaceAll(extensions.from, extensions.to));
  },
};
