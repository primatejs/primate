import config_filename from "#config-filename";
import log from "@primate/core/log";
import cascade from "@rcompat/async/cascade";
import Build from "@rcompat/build";
import dim from "@rcompat/cli/color/dim";
import collect from "@rcompat/fs/collect";
import join from "@rcompat/fs/join";
import exclude from "@rcompat/object/exclude";
import stringify from "@rcompat/object/stringify";
import manifest from "@rcompat/package/manifest";
import root from "@rcompat/package/root";
import copy_includes from "./copy_includes.js";
import $router from "./router.js";
import webpath from "@rcompat/fs/webpath";

const pre = async (app, mode, target) => {
  let target$ = target;
  if (app.targets[target$] === undefined) {
    throw new Error(`target ${dim(target)} does not exist`);
  }
  if (app.targets[target$].forward) {
    target$ = app.targets[target$].forward;
  }
  app.build_target = target$;
  log.system(`starting ${dim(target$)} build in ${dim(mode)} mode`);

  app.build = new Build({
    ...exclude(app.get("build"), ["includes", "index"]),
    outdir: app.runpath(app.get("location.client")).path,
    stdin: {
      resolveDir: app.root.path,
    },
  }, mode);

  app.server_build = ["routes", "types"];

  // remove build directory in case exists
  await app.path.build.remove();
  await app.path.build.create();

  await Promise.all(["server", "client", "components"]
    .map(directory => app.runpath(directory).create()));

  const router = await $router(app.path.routes,
    [".js"].concat(Object.keys(app.bindings)));
  const layout = { depth: router.depth("layout") };
  app.set("layout", layout);

  return { ...app, layout };
};

const js_re = /^.*.js$/u;
const write_directories = async (build_directory, app) => {
  const location = app.get("location");
  for (const name of app.server_build) {
    const d = app.runpath(location.server, name);
    const e = await Promise.all((await collect(d, js_re, { recursive: true }))
      .map(async path => `${path}`.replace(d, _ => "")));
    const files_js = `
    const ${name} = [];
    ${e.map((path, i) =>
    `import * as ${name}${i} from "${webpath(`../server/${name}${path}`)}";
    ${name}.push(["${webpath(path.slice(1, -".js".length))}", ${name}${i}]);`,
  ).join("\n")}
    export default ${name};`;
    await build_directory.join(`${name}.js`).write(files_js);
  }
};

const write_components = async (build_directory, app) => {
  const location = app.get("location");
  const d2 = app.runpath(location.server, location.components);
  const e = await Promise.all((await collect(d2, js_re, { recursive: true }))
    .map(async path => `${path}`.replace(d2, _ => "")));
  const components_js = `
const components = [];
${e.map((component, i) =>
    `import * as component${i} from "${webpath(`../server/components${component}`)}";
components.push(["${webpath(component.slice(1, -".js".length))}", component${i}]);`,
  ).join("\n")}

${app.roots.map((root, i) => `
import * as root${i} from "${webpath(`../server/${root.name}`)}";
components.push(["${root.name}", root${i}]);
`).join("\n")}

export default components;`;
  await build_directory.join("components.js").write(components_js);
};

const write_bootstrap = async (build_number, app, mode) => {
  const build_start_script = `
import serve from "primate/serve";
import config from "./${config_filename}";
const files = {};
${app.server_build.map(name =>
    `import ${name} from "./${build_number}/${name}.js";
     files.${name} = ${name};`,
  ).join("\n")}
import components from "./${build_number}/components.js";
import target from "./target.js";

await serve(import.meta.url, {
  ...target,
  config,
  files,
  components,
  mode: "${mode}",
});`;
  await app.path.build.join("serve.js").write(build_start_script);
};

const post = async (app, mode, target) => {
  const location = app.get("location");
  const defaults = join(import.meta.url, "../../defaults");

  // stage routes
  await app.stage(app.path.routes, join(location.server, location.routes));

  // stage types
  await app.stage(app.path.types, join(location.server, location.types));

  // stage components, transforming defines
  await app.stage(app.path.components, location.components, true);

  const directory = app.runpath(location.server, location.routes);
  for (const path of await directory.collect()) {
    await app.bindings[path.extension]
      ?.(directory, path.debase(`${directory}/`));
  }
  // copy framework pages
  await app.stage(defaults, join(location.server, location.pages));
  // overwrite transformed pages to build
  await app.stage(app.path.pages, join(location.server, location.pages));

  // copy static files to build/server/static
  await app.stage(app.path.static, join(location.server, location.static));

  // publish JavaScript and CSS files
  const imports = await collect(app.path.static, /\.(?:css)$/u);
  await Promise.all(imports.map(async file => {
    const src = file.debase(app.path.static);
    app.build.export(`import "./${location.static}${src}";`);
  }));

  // copy additional subdirectories to build/server
  await copy_includes(app, location.server);

  const components = await app.runpath(location.components).collect();

  // from the build directory, compile to server and client
  await Promise.all(components.map(component => app.compile(component)));

  // start the build
  await app.build.start();

  // a target needs to create an `assets.js` that exports assets
  await app.targets[app.build_target].target(app);

  const build_number = crypto.randomUUID().slice(0, 8);
  const build_directory = app.path.build.join(build_number);
  // TODO: remove after rcompat automatically creates directories
  await build_directory.create();

  await write_components(build_directory, app);
  await write_directories(build_directory, app);
  await write_bootstrap(build_number, app, mode);

  // copy config file
  const local_config = app.root.join(config_filename);
  const build_config = app.path.build.join(config_filename);
  const root_base = await root(import.meta.url);
  const default_config = root_base.join("/src/private/config.js");
  (await local_config.exists() ? local_config : default_config)
    .copy(build_config);

  const manifest_data = await manifest();
  // create package.json
  const package_json = "package.json";
  await app.path.build.join(package_json).write(stringify(manifest_data));

  log.system(`build written to ${dim(app.path.build)}`);

  app.postbuild.forEach(fn => fn());
};

export default async (app, mode = "development", target = "web") =>
  post(await (await cascade(app.modules.build))(await pre(app, mode, target)), mode, target);
