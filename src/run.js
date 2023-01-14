import {Path, File} from "runtime-compat/filesystem";
import {default as Bundler, index} from "./Bundler.js";
import serve from "./serve.js";
import route from "./route.js";
import package_json from "../package.json" assert {type: "json"};
import log from "./log.js";

export default async conf => {
  log.reset("Primate").yellow(package_json.version);
  const {paths} = conf;
  const router = await route(paths.routes);
  await new Bundler(conf).bundle();
  const _index = await index(conf);

  const {paths: {components: path}} = conf;
  const loadFile = async file => [file.base, await file.read()];
  const components = await path.exists
    ? Object.fromEntries(await Promise.all((
      await File.collect(path, ".html")).map(loadFile)))
    : {};

  await serve({router,
    components,
    index: _index,
    from: conf.paths.public,
    http: {
      ...conf.http,
      key: await File.read(Path.resolve(conf.http.ssl.key)),
      cert: await File.read(Path.resolve(conf.http.ssl.cert)),
      keyFile: Path.resolve(conf.http.ssl.key),
      certFile: Path.resolve(conf.http.ssl.cert),
    },
  });
};
