import make_normalize from "./normalize.js";

const create = {
  async client_root(app, name, create_root, compile) {
    // vue does not yet support layouting
    if (create_root !== undefined) {
      const root = create_root(app.get("layout").depth);
      const code = `export { default as root_${name} } from "root:${name}";`;
      app.build.save(`root:${name}`, (await compile.client(root)).js);
      app.build.export(code);
    }
  },
};

export default async ({
  extension,
  name,
  create_root,
  compile,
}) => {
  const extensions = {
    from: extension,
    to: `${extension}.js`,
  };
  const normalize = make_normalize(name);

  return {
    async server(component, app) {
      const location = app.get("location");
      const source = app.runpath(location.components);
      const target_base = app.runpath(location.server, location.components);
      const code = await compile.server(await component.text(), component, app);
      const path = target_base.join(`${component.path}.js`.replace(source, ""));
      await path.directory.create();
      await path.write(code.replaceAll(extensions.from, extensions.to));
    },
    async client(component, app) {
      const location = app.get("location");
      const source = app.runpath(location.components);
      await create.client_root(app, name, create_root, compile);
      const { path } = component.debase(source, "/");

      // web import -> unix style
      const code = `export { default as ${await normalize(path)} } from
        "./${location.components}/${path}";`;
      app.build.export(code);
    },
  };
};
