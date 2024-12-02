import normalize from "#normalize";

export default async (app, component) => {
  const location = app.config("location");
  const source = app.runpath(location.components);
  const { path } = component.debase(source, "/");

  const code = `export { default as ${await normalize(path)} } from
    "./${location.components}/${path}";`;
  app.build.export(code);
};
