import transform from "@rcompat/build/transform";

const options = {
  loader: "ts",
  tsconfig: {
    compilerOptions: {
      experimentalDecorators: true,
    },
  },
};

export const server = async (app, component, extensions) => {
  const location = app.get("location");
  const source = app.runpath(location.components);
  const { code } = await transform(await component.text(), options);
  const target_base = app.runpath(location.server, location.components);
  const path = target_base.join(`${component.path}.js`.replace(source, ""));
  await path.directory.create();
  await path.write(code.replaceAll(extensions.from, extensions.to));
};
