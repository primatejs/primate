import { transformAsync } from "@babel/core";
import solid from "babel-preset-solid";

export default async text => {
  const presets = [[solid, { generate: "dom", hydratable: true }]];
  return { js: (await transformAsync(text, { presets })).code };
};
