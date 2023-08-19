export default async ({
  app,
  directory,
  extension,
  rootname,
  create_root,
  dynamicProps = "data",
  compile,
}) => {
  const {location} = app.config;
  const filename = `${rootname}.js`;
  const re = new RegExp(`^.*.(?:${extension})$`, "u");
  const extensions = {
    from: `.${extension}`,
    to: `.${extension}.js`,
  };
  const source = app.runpath(directory);

  // copy ${env.directory} to build/${env.directory}
  await app.stage(app.root.join(directory), directory, re);

  const components = await source.collect(re);
  const target = app.runpath(location.server, location.components);
  await target.file.create();

  await Promise.all(components.map(async component => {
    const file = await component.file.read();
    const code = await compile(file);
    const to = target.join(`${component.path}.js`.replace(source, ""));
    await to.directory.file.create();
    await to.file.write(code.replaceAll(extensions.from, extensions.to));
  }));

  // vue does not yet support layouting
  if (create_root !== undefined) {
    const root = await compile(create_root(app.layout.depth, dynamicProps));
    const to = app.runpath(location.server, filename);
    await to.file.write(root);
  }
};
