import { transform } from "rcompat/build";

const options = { loader: "tsx", jsx: "automatic" };

export const server = async text => (await transform(text, options)).code;

export const client = async text =>
  ({ js: (await transform(text, options)).code });
