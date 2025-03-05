import "@angular/compiler";
import {
  bootstrapApplication,
  provideClientHydration,
} from "@angular/platform-browser";
import {
  provideServerRendering,
  ɵSERVER_CONTEXT,
} from "@angular/platform-server";
import { CommonEngine } from "@angular/ssr/node";
import "zone.js";
import create_root from "#client/create-root";
import root_selector from "#client/root-selector";
import type Props from "@primate/core/frontend/Props";
import { Component } from "@angular/core";

const common_engine = new CommonEngine();

export default async (component: typeof Component, props: Props) => {
  const root_component = create_root(component, props);
  const document = `<${root_selector}></${root_selector}>`;
  const bootstrap = () => bootstrapApplication(root_component, {
    providers: [
      provideServerRendering(),
     { provide: ɵSERVER_CONTEXT, useValue: "analog" },
     ...(root_component as any).renderProviders || [],
     provideClientHydration(),
    ],
  });
  const b_s = "<body>";
  const b_e = "</body>";
  const html = await common_engine.render({ bootstrap, document });

  return html.slice(html.indexOf(b_s) + b_s.length, html.indexOf(b_e));
};
