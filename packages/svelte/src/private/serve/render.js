import { render } from "svelte/server";

export default (component, props) => {
  const { html, head } = render(component, { props: { p: { ...props } } });
  return { body: html, head };
};
