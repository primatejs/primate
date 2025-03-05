import normalize from "#normalize";
import type { BuildApp } from "@primate/core/build/app";
import type FileRef from "@rcompat/fs/FileRef";

export default async (app: BuildApp, component: FileRef) => {
  const location = app.config("location");
  const source = app.runpath(location.components);
  const { path } = component.debase(source, "/");

  const code = `export { default as ${await normalize(path)} } from
    "./${location.components}/${path}";`;
  app.build.export(code);
};
