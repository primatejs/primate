import compile from "./compile.js";

export default async (app, component, extensions) => {
  const location = app.config("location");
  const source = app.runpath(location.components);
  const code = await compile(await component.text());
  const target_base = app.runpath(location.server, location.components);
  const path = target_base.join(`${component.path}.js`.replace(source, ""));
  await path.directory.create();
  await path.write(code.replaceAll(extensions.from, extensions.to));
};
