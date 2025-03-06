import type { BuildApp } from "#build/app";
import normalize from "#frontend/normalize";
import type FileRef from "@rcompat/fs/FileRef";
import type MaybePromise from "pema/MaybePromise";

interface InitOptions {
  extension: string;
  name: string;
  compile: {
    server: (text: string, component?: FileRef, app?: BuildApp) => MaybePromise<string>,
    client?: (text: string) => Promise<{
      js: string,
      css: string | null,
    }>,
  }
  create_root?: (depth: string) => string;
}

interface Return {
  server(component: FileRef, app: BuildApp): Promise<void>;
  client(component: FileRef, app: BuildApp): Promise<void>;
}

export default ({
  extension,
  name,
  create_root,
  compile,
}: InitOptions): Return => {
  const extensions = {
    from: extension,
    to: `${extension}.js`,
  };
  const normalized = normalize(name);

  return {
    async server(component, app) {
      const location = app.config("location");
      const source = app.runpath(location.components);
      const target_base = app.runpath(location.server, location.components);
      const code = await compile.server(await component.text(), component, app);
      const path = target_base.join(`${component.path}.js`.replace(source, ""));
      await path.directory.create();
      await path.write(code.replaceAll(extensions.from, extensions.to));
    },
    async client(component, app) {
      // client
      if (compile.client === undefined) {
        return;
      }
      const location = app.config("location");
      const source = app.runpath(location.components);

      // no layouting
      if (create_root !== undefined) {
        const root = create_root(app.depth());
        const code = `export { default as root_${name} } from "root:${name}";`;
        app.build.save(`root:${name}`, (await compile.client(root)).js);
        app.build.export(code);
      }

      const { path } = component.debase(source, "/");

      // web import -> unix style
      const code = `export { default as ${await normalized(path)} } from
        "./${location.components}/${path}";`;
      app.build.export(code);
    },
  };
};
