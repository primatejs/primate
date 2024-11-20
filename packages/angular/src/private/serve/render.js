import "@angular/compiler";
import {
  bootstrapApplication,
  provideClientHydration,
} from "@angular/platform-browser";
import {
  provideServerRendering,
  ɵSERVER_CONTEXT,
} from "@angular/platform-server";
import * as t from "@angular/ssr";
import { CommonEngine } from "@angular/ssr/node";
import "zone.js";
import create_root from "#client/create-root";
import root_selector from "#client/root-selector";

const common_engine = new CommonEngine();

export default async (given_component, props) => {
  const component = create_root(given_component, props);
  const document = `<${root_selector}></${root_selector}>`;
  const bootstrap = () => bootstrapApplication(component, {
    providers: [
      provideServerRendering(),
     { provide: ɵSERVER_CONTEXT, useValue: "analog" },
     ...component.renderProviders || [],
     provideClientHydration(),
    ],
  });
  const b_s = "<body>";
  const b_e = "</body>";
  const html = await common_engine.render({ bootstrap, document });

  return html.slice(html.indexOf(b_s) + b_s.length, html.indexOf(b_e));
};
