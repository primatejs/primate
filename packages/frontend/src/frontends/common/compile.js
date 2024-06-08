const create = {
  async server_root(app, name, create_root, compile) {
    // vue does not yet support layouting
    if (create_root !== undefined) {
      const filename = `root_${name}.js`;
      const root = await compile.server(create_root(app.get("layout").depth));
      await app.runpath(app.get("location.server"), filename).write(root);
    }
  },
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
  normalize,
}) => {
  const extensions = {
    from: extension,
    to: `${extension}.js`,
  };
  const name_ = name;

  return {
    async server(component, app) {
      const location = app.get("location");
      const source = app.path.components;
      await create.server_root(app, name_, create_root, compile);
      const target_base = app.runpath(location.server, location.components);
      const code = await compile.server(await component.text(), component, app);
      const path = target_base.join(`${component.path}.js`.replace(source, ""));
      await path.write(code.replaceAll(extensions.from, extensions.to));
    },
    async client(component, app) {
      const location = app.get("location");
      const source = app.path.components;
      await create.client_root(app, name_, create_root, compile);
      const { path: name } = component.debase(source, "/");

      // web import -> unix style
      const code = `export {
        default as ${await normalize(name)}
      } from "./${location.components}/${name}";`;
      app.build.export(code);
    },
  };
};
