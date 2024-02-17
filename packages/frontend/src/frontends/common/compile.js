import { File } from "rcompat/fs";
const type = "module";

const create = {
  // compile server root
  async server_root(app, rootname, create_root, compile) {
    // vue does not yet support layouting
    if (create_root !== undefined) {
      const filename = `${rootname}.js`;
      const root = await compile.server(create_root(app.layout.depth));
      await app.runpath(app.get("location.server"), filename).write(root);
    }
  },
  async client_root(app, rootname, create_root, compile, extensions) {
    // vue does not yet support layouting
    if (create_root !== undefined) {
      const root = create_root(app.layout.depth);
      const filename = `${rootname}.js`;
      // root has no css
      const { js } = await compile.client(root);
      const code = js.replaceAll(extensions.from, extensions.to);
      const src = File.join(app.get("http.static.root"), filename);
      await app.publish({ src, code, type });
      {
        const code = `export {default as ${rootname}} from "./${filename}";\n`;
        app.export({ type: "script", code });
      }
    }
  },
};

export default async ({
  app,
  extension,
  rootname,
  create_root,
  compile,
  normalize,
}) => {
  const extensions = {
    from: extension,
    to: `${extension}.js`,
  };
  await create.server_root(app, rootname, create_root, compile);
  await create.client_root(app, rootname, create_root, compile, extensions);

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
      const { path } = component;

      // web import -> unix style
      const file_string = `./${location.components}/${name}`;
      const { js, css } = await compile.client(await component.text(), component, app);
      {
        const code = js.replaceAll(extensions.from, extensions.to);
        const src = `${path}.js`.replace(`${source}`, _ => location.components);
        await app.publish({ src, code, type });

        const imported = await normalize(name);
        app.export({
          type: "script",
          code: `export { default as ${imported} } from "${file_string}.js";\n`,
        });
      }
      if (css !== null && css !== undefined) {
        const src = `${path}.css`.replace(`${source}`, _ => location.components);
        await app.publish({ src, code: css, type: "style" });

        // irrelevant without bundling
        app.export({
          type: "style",
          code: `import "${file_string}.css"\n;`,
        });
      }
    },
  };
};
