import { createSSRApp } from "vue";
import render from "./render.js";

export default ({ load }) => (name, props = {}, options = {}) => async app => {
  const component = createSSRApp({
    render: (await load(name, props)).component.render,
    data: () => props,
  });

  return app.view({ body: await render(component), ...options });
};
