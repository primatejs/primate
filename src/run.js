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

  await serve({router,
    paths: conf.paths,
    index: await index(conf),
    from: conf.paths.public,
    http: conf.http,
  });
};
