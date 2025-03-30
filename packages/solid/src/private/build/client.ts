import { transformAsync } from "@babel/core";
// @ts-expect-error
import solid from "babel-preset-solid";

export default async (text: string) => {
  const presets = [[solid, { generate: "dom", hydratable: true }]];
  return { js: (await transformAsync(text, { presets }))?.code ?? "" };
};
