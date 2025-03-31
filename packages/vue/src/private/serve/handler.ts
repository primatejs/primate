import type Frontend from "@primate/core/frontend";
import { createSSRApp, type Renderer } from "vue";
import { renderToString } from "vue/server-renderer";

const frontend: Frontend = (name, props = {}, options = {}) => async app => {
  const component = createSSRApp({
    render: app.component<Renderer>(name).render,
    data: () => props,
  });

  return app.view({ body: await renderToString(component), ...options });
};

export default frontend;
