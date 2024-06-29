import { transform } from "rcompat/build";
import { renderToString, createElement } from "voby";

const options = { loader: "tsx", jsx: "automatic" };
export const compile = {
  async server(text) {
    return (await transform(text, options)).code;
  },
};

export const render = async (component, props) =>
  renderToString(createElement(component, props));
