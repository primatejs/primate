import * as compiler from "@marko/compiler";

export const compile = {
  async server(text) {
    return (await compiler.compile(text, "")).code;
  },
};

export const render = (component, props) => component.renderToString(props);
