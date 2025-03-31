import type Props from "@primate/core/frontend/Props";
import type { Component } from "svelte";
import { render } from "svelte/server";

export default (component: Component<Props>, props: Props) => {
  const { html, head } = render(component, { props: { p: { ...props } } });
  return { body: html, head };
};
