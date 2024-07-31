import { transformAsync } from "@babel/core";
import solid from "babel-preset-solid";

export default async text => {
  const presets = [[solid, { generate: "ssr", hydratable: true }]];
  return (await transformAsync(text, { presets })).code;
};

