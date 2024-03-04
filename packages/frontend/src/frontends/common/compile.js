import rootpath from "./rootpath.js";

const create = {
  async server_root(app, name, root) {
    // vue does not yet support layouting
    if (root !== undefined) {
      app.loader.virtual(`file://${rootpath(app, name)}`, root);
    }
  },
  async client_root(app, name, root, compile) {
    // vue does not yet support layouting
    if (root !== undefined) {
      const code = `export { default as root_${name} } from "root:${name}";`;
      app.build.save(`root:${name}`, (await compile.client(root)).js);
      app.build.export(code);
    }
  },
};

export default async ({
  app,
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
  const root = create_root?.(app.layout.depth);
  await create.server_root(app, name, root);
  await create.client_root(app, name, root, compile);

  const location = app.get("location");
  const source = app.path.components;

  return {
    async server(component) {
      const target_base = app.runpath(location.server, location.components);
      const code = await compile.server(await component.text(), component, app);
      const path = target_base.join(`${component.path}.js`.replace(source, ""));
      await path.directory.create();
      await path.write(code.replaceAll(extensions.from, extensions.to));
    },
    async client(component) {
      const { path: name } = component.debase(source, "/");

      // web import -> unix style
      const code = `export {
        default as ${await normalize(name)}
      } from "./${location.components}/${name}";`;
      app.build.export(code);
    },
  };
};
