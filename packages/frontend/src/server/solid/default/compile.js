import { transformAsync } from "@babel/core";
import solid from "babel-preset-solid";

export const server = async text => {
  const presets = [[solid, { generate: "ssr", hydratable: true }]];
  return (await transformAsync(text, { presets })).code;
};

export const client = async text => {
  const presets = [[solid, { generate: "dom", hydratable: true }]];
  return { js: (await transformAsync(text, { presets })).code };
};
