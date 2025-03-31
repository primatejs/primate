import "linkedom-global";
// @ts-expect-error no-types
import { createElement, renderToString } from "voby";
import type Props from "@primate/core/frontend/Props";

export default async (component: any, props: Props) =>
  renderToString(createElement(component, props));
