import {Path} from "runtime-compat/fs";
const type = "module";

export default async ({
  app,
  directory,
  extension,
  rootname,
  create_root,
  normalize,
  compile,
}) => {
  const filename = `${rootname}.js`;
  const re = new RegExp(`^.*.(?:${extension})$`, "u");
  const extensions = {
    from: `.${extension}`,
    to: `.${extension}.js`,
  };
  const source = app.runpath(directory);
  // create client components
  const components = await source.collect(re);

  await Promise.all(components.map(async component => {
    const name = component.path.replace(`${source}/`, "");
    const file = await component.file.read();
    const build = app.config.location.components;
    const {path} = component;

    const file_string = `./${build}/${name}`;
    const {js, css} = await compile(file);
    {
      const code = js.replaceAll(extensions.from, extensions.to);
      const src = `${path}.js`.replace(`${source}`, _ => build);
      await app.publish({src, code, type});

      const imported = await normalize(name);
      app.export({
        type: "script",
        code: `export {default as ${imported}} from "${file_string}.js";\n`,
      });
    }
    if (css !== null && css !== undefined) {
      const src = `${path}.css`.replace(`${source}`, _ => build);
      await app.publish({src, code: css, type: "style"});

      // irrelevant without bundling
      app.export({
        type: "style",
        code: `import "${file_string}.css"\n;`,
      });
    }
  }));
  {
    const root = create_root(app.layout.depth);
    // root has no css
    const {js} = await compile(root);
    const code = js.replaceAll(extensions.from, extensions.to);
    const src = new Path(app.config.http.static.root, filename);
    await app.publish({src, code, type});
  }
  {
    const code = `export {default as ${rootname}} from "./${filename}";\n`;
    app.export({type: "script", code});
  }
};
