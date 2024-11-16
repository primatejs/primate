import { createSSRApp } from "vue";
import { renderToString } from "vue/server-renderer";

export default (name, props = {}, options = {}) => async app => {
  const component = createSSRApp(await app.get_component(name), props);

  return app.view({ body: await renderToString(component), ...options });
};
