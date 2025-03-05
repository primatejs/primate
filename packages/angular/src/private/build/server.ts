import type { BuildApp } from "@primate/core/build/app";
import type FileRef from "@rcompat/fs/FileRef";
import compile from "./compile.js";

export interface ExtensionMap {
  from: string;
  to: string;
};

export default async (app: BuildApp, component: FileRef, extensions: ExtensionMap) => {
  const location = app.config("location");
  const source = app.runpath(location.components);
  const code = await compile(await component.text());
  const target_base = app.runpath(location.server, location.components);
  const path = target_base.join(`${component.path}.js`.replace(source, ""));
  await path.directory.create();
  await path.write(code.replaceAll(extensions.from, extensions.to));
};
