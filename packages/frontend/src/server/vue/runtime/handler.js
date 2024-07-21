import { createSSRApp } from "vue";
import render from "./render.js";

export default (name, props = {}, options = {}) => async app => {
  const component = createSSRApp({
    render: (await app.get_component(name)).render,
    data: () => props,
  });

  return app.view({ body: await render(component), ...options });
};
