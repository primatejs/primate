import "@angular/compiler";
import {
  bootstrapApplication,
  provideClientHydration,
} from "@angular/platform-browser";
import {
  provideServerRendering,
  renderApplication,
  ɵSERVER_CONTEXT,
} from "@angular/platform-server";
import { selector } from "@primate/frontend/angular/common";
import "zone.js";
import make_root from "./make-root.js";

// const common_engine = new CommonEngine();

export default async (given_component, props) => {
  const component = make_root(given_component, props);
  const document = `<${selector}></${selector}>`;
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
